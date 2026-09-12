Portfolio DCA Plan V39 — Login / Logout Patch

สิ่งที่เพิ่ม/แก้ในแพ็กนี้
1. Login ก่อนเข้าใช้งาน APP ด้วย Username + Password
2. จำ Session เพื่อให้ Refresh หน้าไม่ต้อง Login ใหม่ทุกครั้ง
3. Logout มีหน้าต่างยืนยันก่อนออกจากระบบ
4. Logout ล้างเฉพาะ Session/Token ไม่ลบ Portfolio, Master, PlanMaster หรือประวัติการลงทุน
5. User/Login/Logout ใช้ปุ่มวงกลม Floating ขนาดเล็ก และลากตำแหน่งได้
6. Admin มีเมนูจัดการ Users
7. viewer เป็นโหมดอ่านอย่างเดียวตามระบบเดิม
8. แก้ syntax error ใน auth.js ที่เกิดจาก ENDPOINT มี line break ภายใน string ทำให้ระบบ Login ไม่สามารถเริ่มทำงานได้
9. auth.js ถูกใช้ร่วมกับ index.html และ dashboard.html แล้ว

ไฟล์หลัก
- auth.js = Front-end Login/Session/User bar
- Code.gs = Google Apps Script Auth Backend
- index.html / dashboard.html = โหลด auth.js อยู่แล้ว

การใช้งาน
- Deploy Code.gs เป็น Google Apps Script Web App
- หาก URL Web App เปลี่ยน ให้แก้ ENDPOINT ใน auth.js
- ครั้งแรกกด “ตั้งค่า Admin ครั้งแรก” แล้วสร้าง Admin

หมายเหตุด้านข้อมูล
ระบบ Login/Logout ไม่ได้เรียกคำสั่งล้างข้อมูล Portfolio หรือ Sheet เมื่อ Logout
ข้อมูลลงทุนเดิมจึงไม่ถูกลบจากการ Logout
