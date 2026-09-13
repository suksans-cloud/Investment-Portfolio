/* My Family Funds — Google Apps Script Authentication
 * Auth endpoint is intentionally separate from Google Sheets OAuth.
 */
(function(){
  'use strict';
  const ENDPOINT='https://script.google.com/macros/s/AKfycbyHSUQbkUn6w_ZRQn-RpElvoZIdrer3gyO_RP7HRwrjfgTovCob1CxMbhGZPq_krSCYiA/exec';
  const TOKEN_KEY='mff_auth_token';
  const USER_KEY='mff_auth_user';
  const REMEMBER_KEY='mff_auth_remember';
  const POS_KEY='mff_userbar_pos';
  let state=null;

  const css=`
  #mffAuthStyle{position:fixed;inset:0;z-index:999999;display:none;font-family:system-ui,-apple-system,'Noto Sans Thai',sans-serif}
  #mffAuthStyle *{box-sizing:border-box}
  html.mff-auth-pending body>*:not(#mffAuthOverlay){visibility:hidden!important}html.mff-auth-pending body{overflow:hidden!important}
  #mffAuthOverlay{position:fixed;inset:0;background:linear-gradient(135deg,#f4faf7,#eef8f4);display:flex;align-items:center;justify-content:center;padding:20px;z-index:999999}
  .mff-auth-card{width:min(440px,100%);background:#fff;border:1px solid #dcebe5;border-radius:24px;box-shadow:0 24px 70px rgba(15,91,77,.15);padding:28px}
  .mff-auth-brand{font-size:25px;font-weight:800;color:#0f5b4d;margin-bottom:4px}.mff-auth-sub{color:#66736e;font-size:13px;margin-bottom:22px}
  .mff-auth-card h2{margin:0 0 16px;font-size:21px;color:#14211d}.mff-auth-card label{display:block;font-size:13px;color:#52615c;margin:12px 0 6px}
  .mff-auth-card input,.mff-auth-card select{width:100%;padding:12px 13px;border:1px solid #d5e2dd;border-radius:12px;font-size:15px;background:#fff;outline:none}.mff-auth-card input:focus{border-color:#2c8a78;box-shadow:0 0 0 3px #e7f2ef}
  .mff-auth-btn{width:100%;border:0;border-radius:12px;padding:12px 15px;margin-top:16px;background:#0f5b4d;color:#fff;font-weight:700;font-size:15px;cursor:pointer}.mff-auth-btn:disabled{opacity:.6}
  .mff-auth-link{border:0;background:none;color:#0f5b4d;font-size:13px;cursor:pointer;padding:8px 0}.mff-auth-msg{min-height:20px;color:#d24c63;font-size:13px;margin-top:10px}.mff-auth-ok{color:#23805f}
  .mff-auth-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px}.mff-auth-row label{margin:0;display:flex;align-items:center;gap:7px;font-size:12px}.mff-auth-row input[type=checkbox]{width:auto}

  /* ---------- floating collapsible user bubble ---------- */
  #mffUserBar{position:fixed;right:14px;top:14px;z-index:5000;font-size:12px;color:#33433e;touch-action:none;}
  .mff-bubble{
    width:42px;height:42px;border-radius:50%;border:0;
    background:#0f5b4d;color:#fff;font-weight:800;font-size:15px;cursor:grab;
    box-shadow:0 8px 22px rgba(15,91,77,.4);display:flex;align-items:center;justify-content:center;
    user-select:none;touch-action:none;
  }
  .mff-bubble:active{cursor:grabbing}
  #mffUserBar.dragging .mff-bubble{box-shadow:0 12px 28px rgba(15,91,77,.5)}
  .mff-panel{
    position:absolute;top:50%;right:48px;transform:translateY(-50%);
    min-width:0;max-width:calc(100vw - 78px);
    background:rgba(255,255,255,.98);border:1px solid #dce7e3;border-radius:18px;
    padding:7px 8px;box-shadow:0 14px 34px rgba(15,91,77,.22);backdrop-filter:blur(10px);
    display:flex;align-items:center;gap:7px;white-space:nowrap;box-sizing:border-box;overflow:hidden;
  }
  .mff-panel.mff-panel-right{right:auto;left:48px}
  .mff-panel.mff-panel-up{top:50%;bottom:auto}
  .mff-panel.mff-panel-left{right:48px;left:auto}
  .mff-panel[hidden]{display:none}
  .mff-panel-row{display:flex;align-items:center;justify-content:flex-start;gap:8px;white-space:nowrap;flex:none}
  .mff-panel-row b{color:#0f5b4d}
  .mff-role{background:#e7f2ef;border-radius:999px;padding:3px 7px;font-size:10px}
  .mff-panel-actions{display:flex;align-items:center;gap:5px;margin-top:0;flex-wrap:nowrap;flex:none}
  .mff-user-btn{border:0;border-radius:999px;background:#0f5b4d;color:#fff;padding:6px 10px;font-size:11px;cursor:pointer}.mff-user-btn.secondary{background:#edf4f1;color:#0f5b4d}
  .mff-privacy-btn{border:0;border-radius:999px;background:#edf4f1;color:#0f5b4d;padding:6px 9px;font-size:11px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
  .mff-privacy-btn.active{background:#0f5b4d;color:#fff}
  .mff-privacy-blur .privacy-number{filter:blur(7px);user-select:none}
  .mff-privacy-blur input.privacy-number{filter:none;color:transparent;text-shadow:0 0 7px rgba(20,33,29,.9);caret-color:transparent}
  .mff-privacy-blur input.privacy-number:focus{color:inherit;text-shadow:none;caret-color:auto}
  .mff-privacy-blur .privacy-number[data-privacy-force]{filter:blur(7px)}
  .mff-privacy-blur .privacy-reveal-on-focus:focus{filter:none}
  #mffAdminOverlay{position:fixed;inset:0;z-index:6000;background:rgba(20,33,29,.42);display:none;align-items:center;justify-content:center;padding:16px}.mff-admin-card{width:min(900px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:22px;padding:22px}.mff-admin-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.mff-admin-head h2{margin:0}.mff-close{border:0;background:#eef4f1;border-radius:10px;padding:8px 12px;cursor:pointer}.mff-user-table{width:100%;border-collapse:collapse;margin-top:14px;font-size:13px}.mff-user-table th,.mff-user-table td{padding:9px;border-bottom:1px solid #e8eeeb;text-align:left}.mff-badge{font-size:11px;border-radius:999px;padding:3px 7px;background:#edf4f1}.mff-admin-actions{display:flex;gap:6px;flex-wrap:wrap}.mff-small{border:1px solid #d8e4df;background:#fff;border-radius:8px;padding:6px 8px;font-size:11px;cursor:pointer}.mff-small.danger{color:#c73e56}
  @media(max-width:650px){.mff-admin-card{padding:16px}.mff-user-table{font-size:11px}}
  `;
  const st=document.createElement('style');st.id='mffAuthStyle';st.textContent=css;document.head.appendChild(st);
  document.documentElement.classList.add('mff-auth-pending');

  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function overlay(){
    if(document.getElementById('mffAuthOverlay'))return;
    const d=document.createElement('div');d.id='mffAuthOverlay';
    d.innerHTML=`<div class="mff-auth-card"><div class="mff-auth-brand">My Family Funds</div><div class="mff-auth-sub">ระบบจัดการกองทุนครอบครัว • ปลอดภัยด้วย Google Apps Script</div><div id="mffAuthBody"></div></div>`;
    document.body.appendChild(d);
  }
  function showLogin(message){
    overlay(); const b=document.getElementById('mffAuthBody');
    b.innerHTML=`<h2>เข้าสู่ระบบ</h2><form id="mffLoginForm"><label>ชื่อผู้ใช้</label><input id="mffUser" autocomplete="username" required><label>รหัสผ่าน</label><input id="mffPass" type="password" autocomplete="current-password" required><button class="mff-auth-btn" id="mffLoginBtn">เข้าสู่ระบบ</button><div class="mff-auth-msg">${esc(message||'')}</div></form><button class="mff-auth-link" id="mffSetupLink">ตั้งค่า Admin ครั้งแรก</button>`;
    document.getElementById('mffLoginForm').onsubmit=e=>{e.preventDefault();login(document.getElementById('mffUser').value.trim(),document.getElementById('mffPass').value,false)};
    document.getElementById('mffSetupLink').onclick=()=>showSetup();
  }
  function showSetup(message){
    overlay(); const b=document.getElementById('mffAuthBody');
    b.innerHTML=`<h2>ตั้งค่า Admin ครั้งแรก</h2><div style="font-size:12px;color:#66736e">ใช้เฉพาะครั้งแรก ระบบจะสร้างบัญชี Admin ในชีต Users และจะไม่เก็บรหัสผ่านแบบข้อความธรรมดา</div><form id="mffSetupForm"><label>ชื่อ Admin</label><input id="mffAdmin" value="admin" required><label>รหัสผ่าน</label><input id="mffAdminPass" type="password" minlength="6" required><label>ยืนยันรหัสผ่าน</label><input id="mffAdminPass2" type="password" minlength="6" required><button class="mff-auth-btn">สร้าง Admin</button><div class="mff-auth-msg">${esc(message||'')}</div></form><button class="mff-auth-link" id="mffBackLogin">กลับเข้าสู่ระบบ</button>`;
    document.getElementById('mffSetupForm').onsubmit=async e=>{e.preventDefault();const p=document.getElementById('mffAdminPass').value,p2=document.getElementById('mffAdminPass2').value;if(p!==p2){showSetup('รหัสผ่านไม่ตรงกัน');return;}try{const r=await api('bootstrapAdmin',{username:document.getElementById('mffAdmin').value.trim(),password:p});if(!r.ok)throw Error(r.error||'สร้าง Admin ไม่สำเร็จ');showLogin('สร้าง Admin สำเร็จ กรุณาเข้าสู่ระบบ');}catch(x){showSetup(x.message)}};
    document.getElementById('mffBackLogin').onclick=()=>showLogin();
  }
  async function api(action,data){
    const payload=Object.assign({action},data||{});const token=localStorage.getItem(TOKEN_KEY)||sessionStorage.getItem(TOKEN_KEY);if(token)payload.token=token;
    const r=await fetch(ENDPOINT,{method:'POST',mode:'cors',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
    const text=await r.text();let j;try{j=JSON.parse(text)}catch(e){throw Error('เซิร์ฟเวอร์ตอบกลับไม่ใช่ JSON');}if(!r.ok||j.ok===false)throw Error(j.error||'เกิดข้อผิดพลาด');return j;
  }
  function saveSession(r,remember){state=r.user;sessionStorage.setItem(TOKEN_KEY,r.token);sessionStorage.setItem(USER_KEY,JSON.stringify(r.user));localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);localStorage.removeItem(REMEMBER_KEY);}
  function clearSession(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(USER_KEY);state=null;}
  async function login(u,p,remember){const btn=document.getElementById('mffLoginBtn');if(btn)btn.disabled=true;try{const r=await api('login',{username:u,password:p});saveSession(r,remember);unlock();}catch(e){showLogin(e.message)}finally{const x=document.getElementById('mffLoginBtn');if(x)x.disabled=false;}}
  function unlock(){document.documentElement.classList.remove('mff-auth-pending');const o=document.getElementById('mffAuthOverlay');if(o)o.remove();renderUserBar();applyRole();applyPrivacy();}
  function privacyKey(){return 'mff_privacy_blur';}
  function isPrivacyBlur(){return localStorage.getItem(privacyKey())==='1';}
  function applyPrivacy(){document.body.classList.toggle('mff-privacy-blur',isPrivacyBlur());const b=document.getElementById('mffPrivacyBtn');if(b){const on=isPrivacyBlur();b.classList.toggle('active',on);b.innerHTML=on?'🙈 ซ่อนตัวเลข':'👁 แสดงตัวเลข';b.title=on?'แสดงตัวเลข':'ซ่อนตัวเลข';}}
  function togglePrivacy(){localStorage.setItem(privacyKey(),isPrivacyBlur()?'0':'1');applyPrivacy();}

  /* ---------- floating draggable / collapsible user bubble ---------- */
  function clampPos(left,top){
    const size=42, margin=6;
    const maxLeft=window.innerWidth-size-margin, maxTop=window.innerHeight-size-margin;
    return {left:Math.min(Math.max(margin,left),Math.max(margin,maxLeft)), top:Math.min(Math.max(margin,top),Math.max(margin,maxTop))};
  }
  function loadPos(){try{return JSON.parse(localStorage.getItem(POS_KEY)||'null');}catch(e){return null;}}
  function savePos(left,top){try{localStorage.setItem(POS_KEY,JSON.stringify({left,top}));}catch(e){}}

  function setupBubbleInteractions(bar,bubble,panel){
    let dragging=false, moved=false, startX=0, startY=0, startLeft=0, startTop=0;

    function openPanel(){
      panel.hidden=false;
      const r=bubble.getBoundingClientRect();
      const onRight = r.left > window.innerWidth/2;
      panel.classList.toggle('mff-panel-left', onRight);
      panel.classList.toggle('mff-panel-right', !onRight);
      panel.classList.remove('mff-panel-up');
    }
    function closePanel(){ panel.hidden=true; }
    function togglePanel(){ panel.hidden ? openPanel() : closePanel(); }

    bubble.addEventListener('pointerdown', e=>{
      dragging=true; moved=false;
      bubble.setPointerCapture(e.pointerId);
      const r=bar.getBoundingClientRect();
      startX=e.clientX; startY=e.clientY; startLeft=r.left; startTop=r.top;
    });
    bubble.addEventListener('pointermove', e=>{
      if(!dragging)return;
      const dx=e.clientX-startX, dy=e.clientY-startY;
      if(Math.abs(dx)>4||Math.abs(dy)>4){
        if(!moved){ moved=true; bar.classList.add('dragging'); closePanel(); }
        const pos=clampPos(startLeft+dx, startTop+dy);
        bar.style.left=pos.left+'px'; bar.style.top=pos.top+'px';
        bar.style.right='auto'; bar.style.bottom='auto';
      }
    });
    bubble.addEventListener('pointerup', e=>{
      if(!dragging)return;
      dragging=false; bar.classList.remove('dragging');
      if(moved){
        const r=bar.getBoundingClientRect();
        savePos(r.left,r.top);
      } else {
        togglePanel();
      }
    });
    document.addEventListener('click', e=>{
      if(!bar.contains(e.target)) closePanel();
    });
    window.addEventListener('resize', ()=>{
      const r=bar.getBoundingClientRect();
      const pos=clampPos(r.left,r.top);
      if(pos.left!==r.left||pos.top!==r.top){
        bar.style.left=pos.left+'px'; bar.style.top=pos.top+'px';
        bar.style.right='auto'; bar.style.bottom='auto';
        savePos(pos.left,pos.top);
      }
    });
  }

  function renderUserBar(){
    if(!state||document.getElementById('mffUserBar'))return;
    const d=document.createElement('div'); d.id='mffUserBar';
    const initial=(state.username||'?').trim().charAt(0).toUpperCase();
    d.innerHTML=`<button class="mff-bubble" id="mffBubble" type="button" aria-label="เมนูผู้ใช้">${esc(initial)}</button>
      <div class="mff-panel" id="mffPanel" hidden>
        <div class="mff-panel-row"><span>👤 <b>${esc(state.username)}</b></span></div>
        <div class="mff-panel-actions">
          <button class="mff-privacy-btn" id="mffPrivacyBtn"></button>
          ${state.role==='admin'?'<button class="mff-user-btn secondary" id="mffManageUsers">ผู้ใช้</button>':''}
          <button class="mff-user-btn" id="mffLogout">ออก</button>
        </div>
      </div>`;
    document.body.appendChild(d);
    const pos=loadPos();
    if(pos){ const c=clampPos(pos.left,pos.top); d.style.left=c.left+'px'; d.style.top=c.top+'px'; d.style.right='auto'; d.style.bottom='auto'; }
    document.getElementById('mffPrivacyBtn').onclick=e=>{e.stopPropagation();togglePrivacy();};
    if(state.role==='admin')document.getElementById('mffManageUsers').onclick=e=>{e.stopPropagation();adminPanel();};
    document.getElementById('mffLogout').onclick=e=>{e.stopPropagation();if(!confirm('ต้องการออกจากระบบหรือไม่?'))return;logout();};
    applyPrivacy();
    setupBubbleInteractions(d, document.getElementById('mffBubble'), document.getElementById('mffPanel'));
  }

  function applyRole(){if(state&&state.role==='viewer'){document.body.classList.add('mff-readonly');const selectors='button,input,select,textarea';document.querySelectorAll(selectors).forEach(el=>{if(el.closest('#mffUserBar'))return;if(el.dataset.authAllow==='true')return;if(el.id==='bnInvest'||el.closest('#modalInvest'))return;const txt=(el.textContent||'').trim();if(el.matches('input,select,textarea')||/เพิ่ม|บันทึก|ลบ|สร้าง|เชื่อมต่อ|ซิงค์|ส่ง|นำออก|รายการโปรด|export|CSV|Drive|Google/i.test(txt))el.disabled=true;});}}
  async function logout(){try{await api('logout',{})}catch(e){}clearSession();document.getElementById('mffUserBar')?.remove();document.documentElement.classList.add('mff-auth-pending');showLogin('ออกจากระบบแล้ว');}
  async function adminPanel(){
    let o=document.getElementById('mffAdminOverlay');if(!o){o=document.createElement('div');o.id='mffAdminOverlay';o.innerHTML=`<div class="mff-admin-card"><div class="mff-admin-head"><h2>จัดการผู้ใช้</h2><button class="mff-close" id="mffAdminClose">ปิด</button></div><form id="mffCreateUser" style="display:grid;grid-template-columns:1.1fr 1fr 1fr auto;gap:8px;margin-top:16px"><input id="newU" placeholder="ชื่อผู้ใช้" required><input id="newP" type="password" placeholder="รหัสผ่าน" required><select id="newR"><option value="user">user</option><option value="viewer">viewer</option><option value="admin">admin</option></select><button class="mff-small" type="submit">เพิ่มผู้ใช้</button></form><div id="mffUsers"></div></div>`;document.body.appendChild(o);document.getElementById('mffAdminClose').onclick=()=>o.style.display='none';document.getElementById('mffCreateUser').onsubmit=async e=>{e.preventDefault();try{await api('createUser',{username:newU.value.trim(),password:newP.value,role:newR.value});newU.value='';newP.value='';await loadUsers();}catch(x){alert(x.message)}};}o.style.display='flex';await loadUsers();
  }
  async function loadUsers(){const box=document.getElementById('mffUsers');if(!box)return;try{const r=await api('listUsers',{});box.innerHTML=`<table class="mff-user-table"><thead><tr><th>ผู้ใช้</th><th>สิทธิ์</th><th>สถานะ</th><th>สร้างเมื่อ</th><th>จัดการ</th></tr></thead><tbody>${(r.users||[]).map(u=>`<tr><td><b>${esc(u.username)}</b></td><td><span class="mff-badge">${esc(u.role)}</span></td><td>${u.active?'ใช้งาน':'ปิดใช้งาน'}</td><td>${esc(u.created_at||'-')}</td><td><div class="mff-admin-actions"><button class="mff-small" data-act="toggle" data-u="${esc(u.username)}">${u.active?'ปิด':'เปิด'}</button><button class="mff-small" data-act="reset" data-u="${esc(u.username)}">รีเซ็ตรหัส</button>${u.username!==state.username?'<button class="mff-small danger" data-act="delete" data-u="'+esc(u.username)+'">ลบ</button>':''}</div></td></tr>`).join('')}</tbody></table>`;box.querySelectorAll('button[data-act]').forEach(b=>b.onclick=async()=>{const u=b.dataset.u,a=b.dataset.act;try{if(a==='toggle')await api('setUserActive',{username:u,active:b.textContent==='เปิด'});if(a==='reset'){const p=prompt('รหัสผ่านใหม่สำหรับ '+u);if(!p)return;await api('resetPassword',{username:u,password:p});alert('เปลี่ยนรหัสผ่านแล้ว');}if(a==='delete'){if(!confirm('ลบผู้ใช้ '+u+' ?'))return;await api('deleteUser',{username:u});}await loadUsers();}catch(x){alert(x.message)}});}catch(e){box.textContent=e.message}}
  async function start(){
    overlay();
    // ตรวจ session เดิมก่อนเสมอ เพื่อไม่ให้การเช็ก bootstrap บังคับล็อกอินใหม่ทุกครั้ง
    const token=localStorage.getItem(TOKEN_KEY)||sessionStorage.getItem(TOKEN_KEY);
    if(token){
      try{const r=await api('validate',{});state=r.user;unlock();return;}
      catch(e){clearSession();}
    }
    try{const s=await api('bootstrapStatus',{});if(!s.hasUsers){showSetup();return;}}
    catch(e){showLogin('เชื่อมต่อระบบยืนยันตัวตนไม่ได้ กรุณาตรวจสอบ Apps Script Web App และอินเทอร์เน็ต');return;}
    showLogin();
  }
  window.MFFAuth={getUser:()=>state,api,logout,adminPanel};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
