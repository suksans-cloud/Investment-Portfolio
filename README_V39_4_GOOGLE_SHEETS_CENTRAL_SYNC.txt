V39.4 — Google Sheets Central Sync

- Google Sheets is the single cloud data source.
- Legacy Google Drive JSON backup is no longer used by saveData.
- Backup panel now exports/imports JSON and syncs back to the same Google Sheet.
- Auto-pull checks Google Sheets about every 25 seconds while the app is visible.
- Auto-pull silently renews the Google Sheets access token when possible.
- Fixed pullFromSheets safeMerge bug caused by reassigning a const Map.
- Existing Spreadsheet ID and tabs Funds, FundMaster, Investments are preserved.
- Existing NAV updater can continue writing FundMaster in the same spreadsheet.
