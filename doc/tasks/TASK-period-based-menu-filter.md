# TASK: แสดงเมนูตามช่วงเวลาเปิด-ปิดร้าน (Period-Based Menu Filtering)

> สร้าง: 2026-03-30

## สรุปงาน

ร้านค้าตั้งค่าเวลาเปิด-ปิดได้ 2 แบบ:
- **1 ช่วง** (`HasTwoPeriods = false`): เมนูออนไลน์ตลอดทั้งวัน (ไม่ filter)
- **2 ช่วง** (`HasTwoPeriods = true`): filter เมนูตามช่วงเวลาจริง (period1/period2)

| กรณี | พนักงาน (Staff Order) | ลูกค้า (Mobile Web) |
|------|----------------------|---------------------|
| `HasTwoPeriods = false` | เมนูออนไลน์ตลอด | เมนูออนไลน์ตลอด |
| `HasTwoPeriods = true` + อยู่ใน period | auto-filter ตาม period, ไม่มี dropdown | แสดงเฉพาะเมนู period นั้น |
| `HasTwoPeriods = true` + ระหว่าง period | แสดงทุกเมนู + **Dropdown filter ช่วงเวลา** | หน้า "ร้านปิดชั่วคราว" |
| `IsOpen = false` วันนี้ | แสดงทุกเมนู + **Dropdown filter ช่วงเวลา** | หน้า "ร้านปิดชั่วคราว" |

## โครงสร้างที่มีอยู่แล้ว (ไม่ต้อง Migration)

- `TbShopSettings.HasTwoPeriods` (bool)
- `TbShopOperatingHour` — DayOfWeek, IsOpen, OpenTime1/CloseTime1, OpenTime2/CloseTime2
- `TbMenu.IsAvailablePeriod1` / `IsAvailablePeriod2`
- `MenuService.GetMenusAsync()` — มี period parameter filter แล้ว
- `EDayOfWeek` — Monday=1...Sunday=7 (map จาก System.DayOfWeek ที่ Sunday=0)

---

## Phase 1: Backend — Helper Method + Endpoints

### ✅ 1.1 สร้าง `CurrentPeriodResultModel`
### ✅ 1.2 เพิ่ม `GetCurrentPeriodAsync()` ใน ShopSettingsService
### ✅ 1.3 เพิ่ม Staff endpoint `GET /api/admin/shop-settings/current-period`
### ✅ 1.4 เพิ่ม Customer endpoint `GET /api/customer/shop-status`
### ✅ 1.5 SelfOrderService — Auto-filter เมนูตาม period

---

## Phase 2: gen-api

### ✅ 2.1 Restart Backend + ตรวจ Swagger
### ✅ 2.2 บอกผู้ใช้รัน gen-api (Client + Mobile Web)

---

## Phase 3: Frontend Client (Staff Order)

### ✅ 3.1 เพิ่ม period-aware loading ใน StaffOrderComponent
- เรียก `shopSettingsGetCurrentPeriodGet()` ก่อน load menus
- ถ้า `hasTwoPeriods + isOpen + currentPeriod` → auto-filter, ไม่มี dropdown
- ถ้า `hasTwoPeriods + !isOpen` (ระหว่าง period) → แสดง Dropdown, โชว์ทุกเมนู

### ✅ 3.2 สร้าง `PeriodFilterDropdownComponent` (shared/dropdowns/)
- extends DropdownBaseComponent, static options: ช่วงที่ 1, ช่วงที่ 2
- placeholder: "ทุกช่วงเวลา", showClear = true
- ใช้ `[(ngModel)]` + `(ngModelChange)="onPeriodFilterChange()"`

### ✅ 3.3 ส่ง period ไปยัง menu API
- เพิ่ม `period` param ใน `menuItemsGetMenusGet()` (spread operator)
- dropdown เปลี่ยน → reload menus ทันที

---

## Phase 4: Frontend Mobile Web (Customer)

### ✅ 4.1 Refactor ExpiredComponent ให้รองรับ 2 modes (expired + closed)
- เพิ่ม `mode` property อ่านจาก `route.snapshot.data['mode']`
- HTML ใช้ `@if (mode === 'expired')` เปลี่ยน wording

### ✅ 4.2 เพิ่ม route `/shop-closed`
- ใช้ ExpiredComponent เดิมแต่ส่ง `data: { mode: 'closed' }`

### ✅ 4.3 เช็ค shop status ใน CustomerLayoutComponent → redirect ถ้าร้านปิด
- เรียก `selfOrderGetShopStatusGet()` ใน `ngOnInit`
- ถ้า `!isOpen` → `router.navigate(['/shop-closed'], { replaceUrl: true })`

### ✅ 4.4 Menu browse ไม่ต้องแก้ (backend auto-filter)
- SelfOrderService.GetMenuItemsAsync() filter เมนูตาม period อัตโนมัติฝั่ง Backend
