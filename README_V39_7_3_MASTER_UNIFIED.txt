V39.7.3 — Master / Frontend Unified

Google Sheets PlanMaster is the single source for monthly PLAN values.
- Monthly table and fund detail display PlanMaster monthly plan values.
- Investments is the source for actual invested totals.
- Dashboard cards use one consistent definition:
  • เดือนนี้ควรลงทุน = PlanMaster for the selected owner/year/month
  • ลงทุนเดือนนี้แล้ว = Investments actual for the selected owner/year/month
  • เหลือเดือนนี้ = plan - actual (floor 0)
  • ทั้งหมด = all owners when owner filter is ALL
- Owner names are normalized consistently (Suksan, Wirocha, Phoom).
- Pulling PlanMaster never overwrites actual transaction totals.
- Editing a monthly plan in the web updates PlanMaster, but does not create a fake investment transaction.
- Legacy data with no transaction history keeps its existing monthly actuals.
