# TASK: แยกผังโต๊ะ — ภาพรวมร้าน (Order) + ผังจัดโต๊ะ (Table)

> สร้าง: 2026-03-26

## Context

ปัจจุบันผังโต๊ะ (Floor Plan) อยู่ใน Table module เดียว แสดงทุกสถานะรวมกัน — เวลาจะดูภาพรวมความเคลื่อนไหวของร้าน (ออเดอร์อะไรเหลือ/ไม่เหลือ) ต้องมาดูที่ Module โต๊ะตลอด

**แนวทาง:**
1. สร้างหน้า **"ภาพรวมร้าน"** ใน Order module → แสดงสถานะออเดอร์ละเอียด (read-only, ขยับไม่ได้)
2. ลดรูป floor plan ใน Table module → เหลือ 4 สถานะ (ว่าง, จองแล้ว, ปิดใช้งาน, ไม่ว่าง) + ขยับได้

**การตกลง:**
- ชื่อ SubModule ใหม่: **"ภาพรวมร้าน"**
- โต๊ะ Occupied/Billing/Cleaning ใน Table module: แสดงเป็น **"ไม่ว่าง"**
- Click โต๊ะใน Order module: **เปิด TableActionDialog เหมือนปัจจุบัน**

---

## Color Scheme

### ผังภาพรวมร้าน (Order Module) — 8 สถานะ

| สถานะ | Label | Border Token | เงื่อนไข |
|--------|-------|-------------|----------|
| ว่าง | ว่าง | `surface-sub` | status=Available |
| มีลูกค้า (ยังไม่สั่ง) | ยังไม่สั่ง | `primary-badge` | status=Occupied + totalActiveItemCount=0 |
| รอเสิร์ฟ | รอเสิร์ฟ | `primary` | status=Occupied + unservedItemCount>0 |
| เสิร์ฟครบ | เสิร์ฟครบ | `success-dark` | status=Occupied + totalActiveItemCount>0 + unservedItemCount=0 |
| เช็คบิล | เช็คบิล | `warning` | status=Billing |
| เคลียร์โต๊ะ | เคลียร์โต๊ะ | `surface-sidebar` | status=Cleaning |
| จองแล้ว | จองแล้ว | `info` | status=Reserved |
| ปิดใช้งาน | ปิดใช้งาน | `danger` | status=Unavailable |

### ผังจัดโต๊ะ (Table Module) — 4 สถานะ

| สถานะ | Label | Border Token | เงื่อนไข |
|--------|-------|-------------|----------|
| ว่าง | ว่าง | `surface-sub` | status=Available |
| จองแล้ว | จองแล้ว | `info` | status=Reserved |
| ปิดใช้งาน | ปิดใช้งาน | `danger` | status=Unavailable |
| ไม่ว่าง | ไม่ว่าง | `primary-badge` | status=Occupied/Billing/Cleaning |

### รายการโต๊ะ — 4 สถานะ

| DB Status | แสดงเป็น | สี Badge |
|-----------|----------|----------|
| Available | ว่าง | success |
| Occupied / Billing / Cleaning | มีลูกค้า | primary |
| Reserved | ติดจอง | info |
| Unavailable | ปิดใช้งาน | danger |

---

## Phase 1: Backend — เพิ่ม Order Summary ใน TableResponseModel ✅

### 1.1: เพิ่ม fields ใน TableResponseModel ✅
**ไฟล์:** `POS.Main.Business.Table/Models/Table/TableResponseModel.cs`
- `int UnservedItemCount` — items: Pending + Sent + Preparing + Ready
- `int TotalActiveItemCount` — items: ทั้งหมดที่ไม่ใช่ Voided/Cancelled

### 1.2: แก้ GetTablesAsync query ✅
**ไฟล์:** `POS.Main.Business.Table/Services/TableService.cs`
- เพิ่ม count ใน LINQ Select projection (EF Core แปลงเป็น SQL COUNT อัตโนมัติ)

---

## Phase 2: gen-api ✅
- Restart Backend → ตรวจ Swagger → ผู้ใช้รัน gen-api

---

## Phase 3: Frontend — ย้าย Table Dialogs ไป Shared ✅

### 3.1: สร้าง TableDialogsModule ✅
**ที่อยู่:** `shared/modules/table-dialogs/table-dialogs.module.ts`
**ย้าย 5 components:**
- `TableActionDialogComponent`
- `OpenTableDialogComponent`
- `MoveTableDialogComponent`
- `LinkTableDialogComponent`
- `QrCodeDialogComponent`

### 3.2: อัพเดต modules ✅
- `table.module.ts` → ลบ 5 declarations + import TableDialogsModule
- `order.module.ts` → import TableDialogsModule

---

## Phase 4: Frontend — หน้าภาพรวมร้าน (Order Module) ✅

### 4.1: สร้าง OrderOverviewComponent ✅
**ไฟล์:** `features/order/pages/order-overview/`
- Copy จาก floor-plan ลบส่วน edit/drag
- Zone tabs, Canvas scaling, Floor Objects (read-only)
- Icon overlays: call waiter, billing, cleaning
- Quick dismiss + Quick clean
- Status Legend (8 สถานะ)
- Click → TableActionDialog
- SignalR real-time
- สี border ตาม 8 สถานะ + Sub-Status Logic

### 4.2: เพิ่ม Route + Module ✅
- `/order` → redirect → `/order/overview`
- `/order/overview` → OrderOverviewComponent
- `/order/list` → OrderListComponent (ย้าย)

### 4.3: Page Header ✅
- Icon: `restaurant`, Title: "ภาพรวมร้าน"

---

## Phase 5: Frontend — ลดรูป Floor Plan (Table Module) + Cleanup ✅

### 5.1: ลดสถานะ + เปลี่ยนสี ✅
- 4 สถานะ: ว่าง(surface-sub), จองแล้ว(info), ปิดใช้งาน(danger), ไม่ว่าง(primary-badge)

### 5.2: ลบ Icon Overlays + โค้ดที่ไม่ใช้ ✅
- ลบ call waiter, billing, cleaning icon blocks
- ลบ: `callingTableIds`, `onDismissCallWaiter()`, `onQuickClean()`
- ลบ: `NotiStoreService` injection
- ลบ unused imports ทั้งหมด

### 5.3: ลด Status Legend + Canvas Header ✅
- Legend เหลือ 4 สถานะ
- View mode: "กดที่โต๊ะเพื่อจัดการ"

### 5.4: Cleanup Table Module ✅
- ลบ 5 dialog declarations → import TableDialogsModule (Phase 3)

---

## Phase 5B: Frontend — ปรับรายการโต๊ะ + หน้า Manage ✅

### 5B.1: รายการโต๊ะ — ลดสถานะเหลือ 4 ✅
- Available→ว่าง, Occupied/Billing/Cleaning→มีลูกค้า, Reserved→ติดจอง, Unavailable→ปิดใช้งาน

### 5B.2: หน้า Manage — เพิ่ม Toggle เปิด/ปิดใช้งาน ✅
- PrimeNG `p-inputSwitch` สำหรับ Available ↔ Unavailable
- ใช้ API: `tablesSetAvailablePost` / `tablesSetUnavailablePost`

---

## Phase 6: Sidebar Menu ✅
- ออเดอร์ → parent + 2 children:
  - ภาพรวมร้าน → icon: `restaurant`
  - รายการออเดอร์ → icon: `menu-list`
- Table module: ผังร้าน → ผังจัดโต๊ะ

---

## Phase 7: Test Page ✅
- อัพเดตสี + เพิ่ม 2 modes (ภาพรวมร้าน 8 สถานะ + ผังจัดโต๊ะ 4 สถานะ)

---

## Phase 8: Documentation ✅
- อัพเดต database-api-reference.md — เพิ่ม TableResponseModel computed fields

---

## Position Sync
- ทั้ง 2 หน้าใช้ API เดียวกัน → position ตรงกัน
- เมื่อบันทึกตำแหน่ง → fire SignalR `tablePositionChanged`
- Order overview subscribe → reload
