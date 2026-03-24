# TASK: ปรับมาตรฐาน Shared Dropdown — ลบ `<p-dropdown>` ที่ใช้ตรง

> สร้าง: 2026-03-22

## เป้าหมาย

แก้ไขจุดที่ใช้ `<p-dropdown>` โดยตรงใน template ให้ใช้ shared dropdown component แทนตามกฎ CLAUDE.md

## Phase 1 — สร้าง Shared Dropdown ใหม่ 6 ตัว ✅

| # | Dropdown | ประเภท | ใช้ใน | สถานะ |
|---|----------|--------|-------|-------|
| 1 | `table-status-dropdown` | static | zone-list, table-list | ✅ |
| 2 | `reservation-status-dropdown` | static | reservation-list | ✅ |
| 3 | `shift-period-dropdown` | static | session-history, open-session-dialog | ✅ |
| 4 | `table-size-dropdown` | static | table-manage | ✅ |
| 5 | `floor-object-type-dropdown` | static | floor-object-dialog | ✅ |
| 6 | `available-table-dropdown` | API-loaded | reservation-dialog, move-table-dialog, confirm-reservation-dialog | ✅ |

### Options ของแต่ละ Dropdown

**table-status-dropdown:**
- Available = ว่าง, Occupied = มีลูกค้า, Billing = เช็คบิล, Reserved = จองแล้ว, Cleaning = ทำความสะอาด, Unavailable = ปิดใช้งาน

**reservation-status-dropdown:**
- Pending = รอยืนยัน, Confirmed = ยืนยันแล้ว, CheckedIn = เข้าร้านแล้ว, Cancelled = ยกเลิก, NoShow = ไม่มา

**shift-period-dropdown:**
- 1 = ช่วงที่ 1, 2 = ช่วงที่ 2

**table-size-dropdown:**
- Small = เล็ก, Medium = กลาง, Large = ใหญ่

**floor-object-type-dropdown:**
- Restroom = ห้องน้ำ, Stairs = บันได, Counter = เคาน์เตอร์/บาร์, Kitchen = ครัว, Exit = ทางออก/ทางเข้า, Cashier = แคชเชียร์, Decoration = ตกแต่งอื่นๆ

**available-table-dropdown:**
- API: `tablesGetTablesGet({ status: 'Available', ItemPerPage: 999 })`
- Label format: `${tableName} (${zoneName}, ${capacity} ที่นั่ง)`
- @Input: `excludeTableId: number | null` — กรองโต๊ะปัจจุบันออก

## Phase 2 — แก้ไขไฟล์ที่ใช้ `<p-dropdown>` ตรง ✅

| # | ไฟล์ | เปลี่ยนเป็น | สถานะ |
|---|------|-------------|-------|
| 1 | zone-list.component | `app-table-status-dropdown` | ✅ |
| 2 | table-list.component | `app-table-status-dropdown` | ✅ |
| 3 | reservation-list.component | `app-reservation-status-dropdown` | ✅ |
| 4 | table-manage.component | `app-table-size-dropdown` | ✅ |
| 5 | session-history.component | `app-shift-period-dropdown` | ✅ |
| 6 | open-session-dialog.component | `app-shift-period-dropdown` | ✅ |
| 7 | floor-object-dialog.component | `app-floor-object-type-dropdown` | ✅ |
| 8 | reservation-dialog.component | `app-available-table-dropdown` | ✅ |
| 9 | move-table-dialog.component | `app-available-table-dropdown` | ✅ |
| 10 | confirm-reservation-dialog.component | `app-available-table-dropdown` | ✅ |

## Phase 3 — ลงทะเบียนใน SharedModule ✅

- เพิ่ม declarations + exports ใน `shared.module.ts` สำหรับ 6 dropdown ใหม่ | ✅

## Phase 4 — ลบ Dead Code ✅

| # | ไฟล์ | สิ่งที่ลบ | สถานะ |
|---|------|----------|-------|
| 1 | zone-list.component.ts | `statusOptions` property | ✅ |
| 2 | table-list.component.ts | `statusOptions` property | ✅ |
| 3 | reservation-list.component.ts | `statusOptions` property | ✅ |
| 4 | table-manage.component.ts | `SIZE_OPTIONS` const + `sizeOptions` property | ✅ |
| 5 | session-history.component.ts | `SHIFT_OPTIONS` const + `shiftOptions` property | ✅ |
| 6 | open-session-dialog.component.ts | `shiftOptions` inline property | ✅ |
| 7 | floor-object-dialog.component.ts | `objectTypeOptions` property + `ObjectTypeOption` interface | ✅ |
| 8 | reservation-dialog.component.ts | `TablesService` import/inject, `DropdownOption` import, `tableOptions` signal, `loadDropdownOptions()` | ✅ |
| 9 | move-table-dialog.component.ts | `DropdownOption` import, `tableOptions` signal, `OnInit`, `ngOnInit`, `loadAvailableTables()` | ✅ |
| 10 | confirm-reservation-dialog.component.ts | `TablesService`/`DestroyRef`/`takeUntilDestroyed`/`OnInit` imports, injections, `tableOptions` signal, `ngOnInit`, `loadAvailableTables()` | ✅ |

**หมายเหตุ**: `STATUS_OPTIONS` ใน zone-list, table-list, reservation-list **เก็บไว้** เพราะ `getStatusLabel()` ยังใช้อยู่

## ข้ามไม่แก้ (มีเหตุผล)

| จุด | เหตุผล |
|-----|--------|
| checkout.component — service charge dropdown | ใช้คนละ API endpoint (`ordersGetServiceChargeOptionsGet`) + custom binding + 1 จุด |
| split-bill-dialog — group dropdown | dynamic in-memory options สร้างจากจำนวนแยกบิล |
