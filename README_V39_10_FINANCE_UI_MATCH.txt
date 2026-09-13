PORTFOLIO DCA PLAN — V39.10 FINANCE UI MATCH
วันที่ 2026-09-13

ปรับหน้า Finance (index.html) ให้ตรงกับดีไซน์ใน Finance-UI-Preview-V39_1.html ทุกจุด

1) โครงสร้างหน้าจอ
- เปลี่ยนจากลิสต์เดียวที่กดหัวตารางเพื่อ sort เป็นแท็บแบบ segmented control 3 แท็บ:
  "My funds" / "ETF" / "Stock" ตรงกับพรีวิว
- หัวลิสต์เหลือ 3 label คงที่: ชื่อ / ราคา-NAV / เปลี่ยนแปลง (ไม่มีปุ่ม sort อีกต่อไป)
- แถวรายการใช้ badge วงกลม + ชื่อย่อ + ชื่อเต็ม + (เจ้าของ ถ้าเป็นแท็บ My funds) เหมือนพรีวิว
- ข้อความ hint ท้ายลิสต์เปลี่ยนตามแท็บที่เลือก

2) "My funds" ดึงจากพอร์ตจริง
- แท็บ My funds ไม่ได้มาจาก Market Watch ที่เพิ่มเอง แต่รวมจาก DATA.funds (กองทุนที่ลงทุนจริงในระบบ)
  พร้อมชื่อเจ้าของ (รวมกรณีกองทุนเดียวกันมีหลายเจ้าของ เช่น "Suksan / Wirocha")
- ราคา/NAV ของแท็บนี้ดึงจาก FUND_NAV/FundMaster เท่านั้น ไม่เดาจาก GOOGLEFINANCE และไม่ใช้ยอดเงินลงทุนแทน NAV
  (ตรงตามหมายเหตุใน UI Preview ต้นฉบับ)
- ถ้ายังไม่มี NAV จะแสดง "รออัปเดต" แทน

3) แท็บ ETF / Stock
- ยังทำงานเหมือนเดิมทุกจุด: ใช้ MARKET_ASSETS + GOOGLEFINANCE ผ่าน Google Sheets (MarketWatch tab)
  ปุ่ม "↻ อัปเดต" ดึงข้อมูลใหม่เหมือนเดิม

4) หน้าต่าง "⚙ จัดการ"
- เพิ่ม segmented tabs ชุดเดียวกัน (My funds / ETF / Stock) ในหน้าต่างจัดการ
- แท็บ My funds ในหน้าต่างจัดการเป็นมุมมองอ่านอย่างเดียว (read-only) แสดงกองทุนจริงพร้อมเจ้าของ
  เนื่องจากรายการนี้ผูกกับพอร์ตจริง ไม่ใช่รายการที่เพิ่ม/ลบจากหน้า Finance
- แท็บ ETF / Stock ยังเพิ่ม/ลบ/เปิดปิดการแสดงผลได้เหมือนเดิม ระบบตรวจชนิดสัญลักษณ์อัตโนมัติเหมือนเดิมทุกจุด
- ปุ่ม "บันทึก Market Board" และการซิงก์ขึ้น Google Sheets ไม่เปลี่ยนแปลง

5) รายละเอียด (Detail sheet)
- แท็บ My funds: แสดง NAV, วันที่ NAV, แหล่งข้อมูล, ประเภท, บลจ., สถานะข้อมูล
- แท็บ ETF / Stock: แสดงฟิลด์เดิมทั้งหมด (Price, Change, Open, High, Low, Volume, Market Cap, P/E, EPS, 52W High/Low, Trade Time, Data Delay)

หมายเหตุ
- ไม่ได้แตะ Google Sheets sync, PlanMaster, Investments, Login/Auth หรือไฟล์อื่นนอกเหนือจากหน้า Finance ใน index.html
- ทดสอบ UI ด้วย headless browser ครบทั้ง 3 แท็บ, หน้าต่างจัดการ, และหน้ารายละเอียด ก่อนส่งมอบ
