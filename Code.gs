/**
 * My Family Funds — Auth Backend (Google Apps Script)
 * -----------------------------------------------------
 * วิธีติดตั้ง:
 * 1) เปิด Google Sheet ที่จะใช้เก็บผู้ใช้ (ไฟล์ใหม่หรือไฟล์เดิมก็ได้)
 * 2) เมนู Extensions > Apps Script แล้ววางไฟล์นี้ทับ Code.gs
 * 3) กด Deploy > New deployment > เลือกประเภท "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4) คัดลอก URL ที่ลงท้ายด้วย /exec แล้วเอาไปแทนที่ค่า ENDPOINT ในไฟล์ auth.js
 * 5) เปิดหน้าเว็บ กด "ตั้งค่า Admin ครั้งแรก" เพื่อสร้างบัญชี Admin ชุดแรก
 *
 * ระบบจะสร้างชีต "Users" และ "Sessions" ให้อัตโนมัติในสเปรดชีตนี้เมื่อเรียกใช้ครั้งแรก
 */

const USERS_SHEET = 'Users';
const SESSIONS_SHEET = 'Sessions';
const SESSION_DAYS = 30; // อายุ token (วัน)

function doPost(e) {
  let out;
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      out = route(action, body);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function route(action, body) {
  switch (action) {
    case 'bootstrapStatus': return bootstrapStatus();
    case 'bootstrapAdmin':  return bootstrapAdmin(body);
    case 'login':           return login(body);
    case 'validate':        return validate(body);
    case 'logout':          return logout(body);
    case 'listUsers':       return requireAdmin(body, listUsers);
    case 'createUser':      return requireAdmin(body, createUser);
    case 'setUserActive':   return requireAdmin(body, setUserActive);
    case 'resetPassword':   return requireAdmin(body, resetPassword);
    case 'deleteUser':      return requireAdmin(body, deleteUser);
    default: return { ok: false, error: 'Unknown action: ' + action };
  }
}

/* ---------- sheet helpers ---------- */
function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function getSheet(name, headers) {
  let sh = ss().getSheetByName(name);
  if (!sh) {
    sh = ss().insertSheet(name);
    sh.appendRow(headers);
  }
  return sh;
}

function usersSheet() {
  return getSheet(USERS_SHEET, ['Username', 'PasswordHash', 'Salt', 'Role', 'Active', 'CreatedAt']);
}
function sessionsSheet() {
  return getSheet(SESSIONS_SHEET, ['Token', 'Username', 'ExpiresAt']);
}

function readRows(sh) {
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.map((row, i) => {
    const o = {};
    headers.forEach((h, j) => o[h] = row[j]);
    o._row = i + 2; // +2 เพราะแถวหัวตารางคือแถว 1
    return o;
  });
}

function findUser(username) {
  const rows = readRows(usersSheet());
  return rows.find(u => String(u.Username).toLowerCase() === String(username).toLowerCase());
}

/* ---------- password hashing (salted SHA-256) ---------- */
function makeSalt() { return Utilities.getUuid(); }

function hashPassword(password, salt) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + password);
  return raw.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

/* ---------- tokens / sessions ---------- */
function issueToken(username) {
  const sh = sessionsSheet();
  const token = Utilities.getUuid();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  sh.appendRow([token, username, expires]);
  return token;
}
function findSession(token) {
  const rows = readRows(sessionsSheet());
  return rows.find(s => s.Token === token);
}
function deleteSession(token) {
  const sh = sessionsSheet();
  const rows = readRows(sh);
  const row = rows.find(s => s.Token === token);
  if (row) sh.deleteRow(row._row);
}

function currentUser(token) {
  if (!token) return null;
  const sess = findSession(token);
  if (!sess) return null;
  if (new Date(sess.ExpiresAt) < new Date()) { deleteSession(token); return null; }
  const u = findUser(sess.Username);
  if (!u || u.Active === false || u.Active === 'FALSE') return null;
  return u;
}

function requireAdmin(body, fn) {
  const u = currentUser(body.token);
  if (!u) return { ok: false, error: 'กรุณาเข้าสู่ระบบ' };
  if (u.Role !== 'admin') return { ok: false, error: 'ต้องเป็น admin เท่านั้น' };
  return fn(body, u);
}

/* ---------- actions ---------- */
function bootstrapStatus() {
  const rows = readRows(usersSheet());
  return { ok: true, hasUsers: rows.length > 0 };
}

function bootstrapAdmin(body) {
  const rows = readRows(usersSheet());
  if (rows.length > 0) return { ok: false, error: 'มี Admin อยู่แล้ว กรุณาเข้าสู่ระบบ' };
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || password.length < 6) return { ok: false, error: 'ข้อมูลไม่ถูกต้อง' };
  const salt = makeSalt();
  usersSheet().appendRow([username, hashPassword(password, salt), salt, 'admin', true, new Date().toISOString()]);
  return { ok: true };
}

function login(body) {
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const u = findUser(username);
  if (!u) return { ok: false, error: 'Invalid username or password' };
  if (u.Active === false || u.Active === 'FALSE') return { ok: false, error: 'บัญชีถูกปิดใช้งาน' };
  if (hashPassword(password, u.Salt) !== u.PasswordHash) return { ok: false, error: 'Invalid username or password' };
  const token = issueToken(u.Username);
  return { ok: true, token, user: { username: u.Username, role: u.Role } };
}

function validate(body) {
  const u = currentUser(body.token);
  if (!u) return { ok: false, error: 'Session invalid' };
  return { ok: true, user: { username: u.Username, role: u.Role } };
}

function logout(body) {
  if (body.token) deleteSession(body.token);
  return { ok: true };
}

function listUsers() {
  const rows = readRows(usersSheet());
  return {
    ok: true, users: rows.map(u => ({
      username: u.Username,
      role: u.Role,
      active: !(u.Active === false || u.Active === 'FALSE'),
      created_at: u.CreatedAt
    }))
  };
}

function createUser(body) {
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const role = String(body.role || 'user');
  if (!username || !password) return { ok: false, error: 'ข้อมูลไม่ครบ' };
  if (findUser(username)) return { ok: false, error: 'มีชื่อผู้ใช้นี้อยู่แล้ว' };
  const salt = makeSalt();
  usersSheet().appendRow([username, hashPassword(password, salt), salt, role, true, new Date().toISOString()]);
  return { ok: true };
}

function setUserActive(body) {
  const u = findUser(body.username);
  if (!u) return { ok: false, error: 'ไม่พบผู้ใช้' };
  usersSheet().getRange(u._row, 5).setValue(!!body.active);
  return { ok: true };
}

function resetPassword(body) {
  const u = findUser(body.username);
  if (!u) return { ok: false, error: 'ไม่พบผู้ใช้' };
  const salt = makeSalt();
  usersSheet().getRange(u._row, 2, 1, 2).setValues([[hashPassword(body.password, salt), salt]]);
  return { ok: true };
}

function deleteUser(body, actingUser) {
  const u = findUser(body.username);
  if (!u) return { ok: false, error: 'ไม่พบผู้ใช้' };
  if (u.Username === actingUser.Username) return { ok: false, error: 'ลบบัญชีตัวเองไม่ได้' };
  usersSheet().deleteRow(u._row);
  return { ok: true };
}
