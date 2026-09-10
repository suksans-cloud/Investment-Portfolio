V39.2 — NAV AUTO UPDATE + SAFE SHEETS SYNC

ฐาน: Portfolio DCA Plan V39.1 Safe Sync

เพิ่ม:
1. NAV Auto Updater สำหรับ SCBAM ผ่าน Google Apps Script
2. เมนูอัปเดต NAV ตอนนี้ / ตั้งเวลาอัตโนมัติ
3. ป้องกัน manual pull และ auto-pull จาก Google Sheets ไม่ให้ทับข้อมูล local แบบไม่ปลอดภัย
4. Google Sheets connection จะอ่านและ merge ข้อมูลก่อนเขียนกลับ

ไฟล์สำคัญ:
- index.html — เว็บ/PWA V39.2
- Code.gs — Auth API เดิม
- NAV_Updater.gs — ตัวอัปเดต NAV อัตโนมัติ
- NAV_AUTO_UPDATE_SETUP.txt — คู่มือติดตั้ง


--- V39.3 Auth + Sync Fix ---
- ตรวจ session เดิมก่อน bootstrapStatus เพื่อไม่บังคับล็อกอินซ้ำทุกครั้ง
- Remember login ทำงานตาม checkbox จริง
- Google Sheets OAuth มี silent restore และตรวจ token หมดอายุ
- เปลี่ยน Service Worker cache version เพื่อรับไฟล์แก้ไขใหม่
