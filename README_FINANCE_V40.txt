Finance V40 — UI update
========================
ปรับหน้า Finance ตาม Finance-UI-Preview-V39.1 และคำขอ:
- หัวข้อ Finance + Market Watch ชิดด้านบน
- ปุ่ม อัปเดต / จัดการ อยู่แถวเดียวกับ Market Watch
- แท็บ My funds / ETF / Stock
- My funds ดึงรายชื่อจาก DATA.funds + FundMaster/FUND_NAV
- รายการ Finance กระชับและเลื่อนดูได้เมื่อข้อมูลเยอะ
- แตะรายการเพื่อเปิดรายละเอียดเดิม
- จัดการ Finance แยก My funds / ETF / Stock
- เพิ่ม ETF/Stock ด้วยชื่อย่อและตรวจสอบผ่าน GOOGLEFINANCE เมื่อเชื่อม Google Sheets
- ชื่อ/ราคา ETF/Stock ดึงจาก MarketWatch/GOOGLEFINANCE
- กองทุนใหม่ตรวจสอบจาก FundMaster และผูกกับเจ้าของพอร์ตที่เลือกอยู่/เจ้าของล่าสุด
- ลบรายการแยกตามประเภท; การลบ My funds จะลบกองทุนออกจากฐานข้อมูล DATA.funds
- เพิ่มชีต FinanceETF และ FinanceStock สำหรับแยกข้อมูลใน Google Sheets

หมายเหตุ:
หน้า Finance ใช้ฐานข้อมูลกองทุนเดิมของโปรเจกต์ ไม่ได้สร้างรายการกองทุนชุดใหม่.
