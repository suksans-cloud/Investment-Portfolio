/* My Family Funds — Auth API for Google Apps Script
 * Deploy as Web app: Execute as Me / Who has access: Anyone
 */
const SHEET_ID = '1T4cu1gKhFid4rmGimnEz4Hea_Hv71Nz3mpawRBSEdDY';
const SESSION_HOURS = 720; // 30 days; refresh/browser reopen will keep the login session
const HASH_ROUNDS = 15000;
const USERS = 'Users';
const SESSIONS = 'Sessions';

function doGet(){return json({ok:true,service:'My Family Funds Auth API',status:'online'});}
function doPost(e){
  try{
    const body=e&&e.postData&&e.postData.contents?JSON.parse(e.postData.contents):{};
    return json(route(body));
  }catch(err){return json({ok:false,error:String(err&&err.message||err)});}
}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function ss(){return SpreadsheetApp.openById(SHEET_ID);}
function sheet(name,headers){let s=ss().getSheetByName(name);if(!s){s=ss().insertSheet(name);s.getRange(1,1,1,headers.length).setValues([headers]);}return s;}
function setup(){sheet(USERS,['username','password_hash','salt','role','active','created_at','last_login']);sheet(SESSIONS,['token','username','role','expires_at','created_at','revoked']);}
function rows(name){const s=sheet(name,name===USERS?['username','password_hash','salt','role','active','created_at','last_login']:['token','username','role','expires_at','created_at','revoked']);const v=s.getDataRange().getValues();return v.length>1?v.slice(1):[];}
function norm(u){return String(u||'').trim().toLowerCase();}
function now(){return new Date();}
function iso(d){return new Date(d).toISOString();}
function salt(){return Utilities.getUuid().replace(/-/g,'')+Utilities.base64EncodeWebSafe(Utilities.newBlob(Utilities.getUuid()).getBytes()).slice(0,16);}
function hash(p,s){let x=s+'|'+String(p);for(let i=0;i<HASH_ROUNDS;i++)x=Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,x,Utilities.Charset.UTF_8));return x;}
function token(){return Utilities.base64EncodeWebSafe(Utilities.getUuid()+'|'+Utilities.getUuid()+'|'+new Date().getTime());}
function route(b){
 setup();const a=String(b.action||'');
 if(a==='bootstrapStatus')return {ok:true,hasUsers:rows(USERS).length>0};
 if(a==='bootstrapAdmin')return bootstrapAdmin(b);
 if(a==='login')return login(b);
 if(a==='validate'){const s=requireSession(b.token);return {ok:true,user:{username:s.username,role:s.role}};}
 if(a==='logout'){if(b.token)revoke(b.token);return {ok:true};}
 const s=requireSession(b.token);if(s.role!=='admin')throw Error('ต้องใช้สิทธิ์ admin');
 if(a==='listUsers')return listUsers();
 if(a==='createUser')return createUser(b);
 if(a==='setUserActive')return setUserActive(b,s.username);
 if(a==='resetPassword')return resetPassword(b);
 if(a==='deleteUser')return deleteUser(b,s.username);
 throw Error('ไม่รู้จัก action');
}
function bootstrapAdmin(b){
 const us=rows(USERS);if(us.length)throw Error('มีผู้ใช้อยู่แล้ว ไม่สามารถ bootstrap ได้');
 const u=norm(b.username);const p=String(b.password||'');if(!u||p.length<6)throw Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
 const s=salt();sheet(USERS).appendRow([u,hash(p,s),s,'admin',true,iso(now()),'']);return {ok:true};
}
function login(b){
 const u=norm(b.username),p=String(b.password||'');const data=rows(USERS);let idx=-1,rec;
 data.forEach((r,i)=>{if(norm(r[0])===u){idx=i;rec=r;}});if(idx<0||String(rec[4]).toLowerCase()!=='true')throw Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');if(hash(p,rec[2])!==rec[1])throw Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
 const role=rec[3]||'user',t=token(),created=now(),exp=new Date(created.getTime()+SESSION_HOURS*3600000);sheet(SESSIONS).appendRow([t,u,role,iso(exp),iso(created),false]);sheet(USERS).getRange(idx+2,7).setValue(iso(created));return {ok:true,token:t,expires_at:iso(exp),user:{username:u,role}};
}
function requireSession(t){if(!t)throw Error('ต้องเข้าสู่ระบบ');const s=rows(SESSIONS),n=new Date();for(let i=0;i<s.length;i++){if(s[i][0]===t&&String(s[i][5]).toLowerCase()!=='true'){if(new Date(s[i][3])<=n)throw Error('เซสชันหมดอายุ');return {username:s[i][1],role:s[i][2]};}}throw Error('เซสชันไม่ถูกต้อง');}
function revoke(t){const sh=sheet(SESSIONS);const v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(v[i][0]===t)sh.getRange(i+1,6).setValue(true);}
function listUsers(){return {ok:true,users:rows(USERS).map(r=>({username:r[0],role:r[3],active:String(r[4]).toLowerCase()==='true',created_at:r[5],last_login:r[6]}))};}
function createUser(b){const u=norm(b.username),p=String(b.password||''),role=String(b.role||'user');if(!u||p.length<6)throw Error('ชื่อผู้ใช้/รหัสผ่านไม่ถูกต้อง');if(!['admin','user','viewer'].includes(role))throw Error('สิทธิ์ไม่ถูกต้อง');if(rows(USERS).some(r=>norm(r[0])===u))throw Error('มีชื่อผู้ใช้นี้แล้ว');const s=salt();sheet(USERS).appendRow([u,hash(p,s),s,role,true,iso(now()),'']);return {ok:true};}
function setUserActive(b,current){const u=norm(b.username),sh=sheet(USERS),v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(norm(v[i][0])===u){const role=String(v[i][3]||'user');if(!b.active&&u===norm(current)&&role==='admin')throw Error('ไม่สามารถปิดใช้งาน Admin ที่กำลังเข้าสู่ระบบ');if(!b.active&&role==='admin'){const activeAdmins=v.slice(1).filter(r=>String(r[3]||'')==='admin'&&String(r[4]).toLowerCase()==='true').length;if(activeAdmins<=1)throw Error('ต้องมี Admin ที่ใช้งานได้อย่างน้อย 1 บัญชี');}sh.getRange(i+1,5).setValue(!!b.active);return {ok:true};}throw Error('ไม่พบผู้ใช้');}
function resetPassword(b){const u=norm(b.username),p=String(b.password||'');if(p.length<6)throw Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');const sh=sheet(USERS),v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(norm(v[i][0])===u){const s=salt();sh.getRange(i+1,2,1,2).setValues([[hash(p,s),s]]);return {ok:true};}throw Error('ไม่พบผู้ใช้');}
function deleteUser(b,current){const u=norm(b.username);if(u===norm(current))throw Error('ไม่สามารถลบบัญชีที่กำลังใช้งาน');const sh=sheet(USERS),v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(norm(v[i][0])===u){sh.deleteRow(i+1);return {ok:true};}throw Error('ไม่พบผู้ใช้');}
