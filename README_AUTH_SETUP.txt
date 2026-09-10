My Family Funds — Login + Google Apps Script Auth

1) Google Apps Script
- เปิดโปรเจกต์ Apps Script ที่ใช้ Web App เดิม
- วาง Code.gs จากแพ็กนี้ลงในโปรเจกต์
- Deploy > Manage deployments > Edit
- Execute as: Me
- Who has access: Anyone
- Deploy แล้วใช้ Web App URL เดิม
- ทดสอบเปิด URL ใน Chrome ต้องเห็น JSON: ok=true, service=My Family Funds Auth API

2) Google Sheet
ระบบจะสร้างแท็บ Users และ Sessions ให้อัตโนมัติใน Spreadsheet ID ที่ฝังไว้ใน Code.gs
Funds และ Investments เดิมไม่ถูกลบ

3) ครั้งแรก
เปิดเว็บแอป แล้วเลือก “ตั้งค่า Admin ครั้งแรก” สร้างบัญชี Admin อย่างน้อย 6 ตัวอักษร
รหัสผ่านจะไม่ถูกเก็บเป็นข้อความธรรมดา

4) ผู้ใช้
Admin สามารถเพิ่ม user / viewer / admin, เปิด-ปิดบัญชี, reset password และลบผู้ใช้ได้
viewer ถูกตั้งค่าเป็นโหมดอ่านอย่างเดียวฝั่งหน้าจอ

5) สำคัญ
GitHub Pages ใช้สำหรับหน้า PWA ส่วน Code.gs ต้องทำงานเป็น Google Apps Script Web App
การเข้าสู่ระบบชุดนี้แยกจาก Google OAuth สำหรับ Google Sheets ที่มีอยู่ในแอปเดิม

6) ถ้าหน้าจอไม่เปลี่ยนหลังอัปโหลด
ล้าง cache/service worker ของเว็บ หรือเปิด URL ใหม่ใน Chrome แบบไม่ใช้หน้าเดิม แล้วลองอีกครั้ง

--- V39 Safe Sync Patch ---
- Google Sheets connection no longer immediately overwrites the existing Sheet with local data.
- Existing Sheet data is read first and safely merged with local funds/transactions.
- Local transaction history is preserved when the Sheet is empty or partial.
- A pre-sync local safety snapshot is stored in localStorage before Sheet pulls.
- New spreadsheets still receive the current local dataset on first creation.
