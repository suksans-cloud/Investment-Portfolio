PORTFOLIO DCA PLAN — V39 CONSOLIDATED
วันที่ 2026-09-12

รวมการแก้ไขจาก Request ล่าสุดโดยยึด V39 เป็นฐาน

1) LOGIN / LOGOUT
- Login สำเร็จแล้วจำ Session เฉพาะ session ของแท็บ/หน้าต่างนั้น เพื่อ Refresh แล้วไม่หลุด
- ไม่เก็บ Username/Password หรือ token ไว้ใน localStorage
- ไม่มีตัวเลือก “จดจำการเข้าสู่ระบบ”
- Logout ล้าง session ทันที และผู้ใช้คนถัดไปต้อง Login ใหม่
- Logout ไม่แตะข้อมูล Portfolio / Master / PlanMaster / Investments

2) ปุ่มเมนู / ปุ่มลงทุน
- ไม่ใช้ role logic แบบเดิมที่ปิดปุ่มโดยดูจากคำว่า “ลงทุน” ทำให้ปุ่มลงทุนใช้งานไม่ได้
- Viewer ยังถูกจำกัด แต่ปุ่มลงทุนไม่ถูกปิดโดยระบบ auth โดยอัตโนมัติ
- User/Admin ใช้งานเมนูและปุ่มลงทุนได้ตามระบบเดิม

3) FINANCE / MARKET WATCH
- หน้า Finance แสดง ETF เป็นหลัก ไม่มีแถว TOP 10 หุ้น
- Market Watch หน้าแรกแสดง ETF WATCH
- เพิ่ม ETF/กองทุนด้วย Symbol ช่องเดียว เช่น VOO, VXUS, QQQM, SCBRMWORLD(A)
- ระบบเติมชื่อจากฐานข้อมูล FUND_MASTER เมื่อเป็นกองทุนที่รู้จัก
- ETF ที่รู้จักจะใช้ exchange ที่ถูกต้องและ GOOGLEFINANCE ดึงราคา/Change/ข้อมูลตลาด
- กองทุนไทยที่มี NAV ใน FUND_NAV จะแสดง NAV เมื่อมีข้อมูล
- รายการที่สร้างถูกบันทึกใน MarketWatch เมื่อกด “บันทึก Market Board”
- ไม่จำเป็นต้องกรอก Name/Exchange เองสำหรับรายการใหม่ทั่วไป

4) GOOGLE SHEETS
- MarketWatch ยังคงเป็นแหล่งข้อมูล Finance
- สูตร GOOGLEFINANCE ถูกสร้างจากรายการที่อยู่ใน Market Board
- ไม่ลบหรือ Reset ข้อมูล Portfolio/Investments จากการ Logout หรือแก้ Finance

หมายเหตุ
- Google Finance รองรับหุ้น/ETF ได้ดีกว่ากองทุนรวมไทย หาก Symbol กองทุนไทยไม่มีข้อมูลจาก GOOGLEFINANCE ระบบจะใช้ข้อมูล FUND_MASTER/FUND_NAV ที่มีในระบบ และหากยังไม่มี NAV ต้องเพิ่มข้อมูล NAV ใน Master ตามโครงสร้างเดิม
- ไม่ได้เปลี่ยนแปลงสูตร Portfolio/PlanMaster ที่มีอยู่ใน V39 นอกเหนือจากจุดที่ระบุข้างต้น


Finance Auto Asset Mode: เพิ่มด้วย Symbol ช่องเดียว ระบบจำแนก หุ้น/ETF/กองทุนจากรายการที่รู้จักและ FUND_MASTER; หุ้น/ETF ใช้ GOOGLEFINANCE ส่วนกองทุนใช้ FUND_NAV/FUND_MASTER.

================= FUND AUTO ONBOARDING (แนะนำ) =================
แนวทางที่ใช้ในเวอร์ชันนี้เป็นแบบ Hybrid เพื่อให้ใช้งานง่ายและเชื่อถือได้:

1) เพิ่มกองทุนใหม่ครั้งแรกในชีต FundMaster เพียง 1 ครั้ง
   - Fund Code = รหัสกองทุน
   - Display Name = ชื่อที่ต้องการแสดง
   - Manager = บริษัทจัดการกองทุน
   - Asset Class = ประเภทกองทุน
   - Active = TRUE

2) หลังจากลงทะเบียนแล้ว หน้า Finance ให้กรอก Symbol เพียงช่องเดียว
   - ระบบตรวจชนิดกองทุน/ETF/หุ้นให้อัตโนมัติ
   - ถ้าเป็นกองทุนที่อยู่ใน FundMaster ระบบจะใช้ชื่อและข้อมูลจาก FundMaster
   - ไม่ต้องกรอก Exchange เอง

3) NAV กองทุน SCBAM
   - ไฟล์ NAV_Updater.gs รองรับการดึง NAV จาก SCBAM Official NAV feed
   - ตั้ง Trigger รายวันได้ด้วย setupNAVAutoUpdate()
   - NAV จะเขียนกลับเข้า FundMaster คอลัมน์ NAV / NAV Date / NAV Source

4) กองทุนค่ายอื่น
   - ปัจจุบันยังต้องมีแหล่ง NAV ที่รองรับค่ายนั้นก่อน จึงจะดึง NAV อัตโนมัติได้
   - หากไม่มี NAV ระบบจะแสดงสถานะรอข้อมูล ไม่ใช้ราคา GOOGLEFINANCE แทน NAV กองทุน

เหตุผลที่เลือกแบบนี้:
- เพิ่มกองทุนครั้งแรกครั้งเดียว
- ลดการกรอกข้อมูลซ้ำในหน้าเว็บ
- ไม่เดาราคา NAV จาก GOOGLEFINANCE สำหรับกองทุนไทย
- สามารถเพิ่มตัวอัปเดตของ บลจ. อื่นภายหลังได้โดยไม่ต้องเปลี่ยนโครงสร้าง Finance


Finance Auto Fund Onboarding (2026-09-12)
- เพิ่มหุ้น / ETF / กองทุนด้วย Symbol ช่องเดียวจากหน้าเว็บได้
- กองทุนที่ไม่อยู่ใน FundMaster แต่มีรูปแบบชื่อกองทุนที่ระบบตรวจจับได้ จะถูกเพิ่มเป็น FUND และแสดง “NAV รอข้อมูล”
- หากเชื่อมต่อ Google Sheets และมีสิทธิ์เขียน ระบบจะเพิ่ม/อัปเดตแถวใน FundMaster ให้อัตโนมัติ โดยไม่ต้องคีย์ Sheet เอง
- ถ้าไม่มีสิทธิ์/ยังไม่เชื่อมต่อ Google Sheets ระบบยังเก็บรายการกองทุนที่เพิ่มจากเว็บไว้ในเครื่อง และพร้อมซิงก์เมื่อเชื่อมต่อ
- NAV ของกองทุนใหม่จะไม่ถูกเดาสุ่ม: ต้องมาจาก FUND_NAV หรือแหล่ง NAV ที่รองรับ
