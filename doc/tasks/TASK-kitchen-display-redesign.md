# TASK: Kitchen Display — นำดีไซน์จาก Test Page ไป Apply หน้าจริง

## สถานะ: เสร็จสิ้น

## บริบท
ออกแบบ UI ใหม่ทั้งหมดของหน้า Kitchen Display บน test-kitchen-display component แล้วยืนยันดีไซน์เรียบร้อย
ต้อง apply ไปหน้าจริง `features/kitchen-display/` แล้วลบ test page ออก

## ข้อจำกัด API Model
- `KitchenOrderModel` — ไม่มี `zoneName` (มีแค่ `tableName`, `zoneColor`) → ใช้ `โต๊ะ{tableName}` แทน `โซน{zone} - โต๊ะ{table}`
- `KitchenOrderItemModel` — ไม่มี `cancelledByName` → แสดงแค่ `cancelReason`
- Menu View ใช้ `item.tableName` ไม่มี zone

## ดีไซน์ที่ยืนยันแล้ว (จาก test page)
- **KPI Bar**: 4 cards (Queue/Cooking/Ready/Cancelled) — accent bar ซ้าย + icon + ตัวเลข
- **Section Headers**: icon box + หัวข้อ + เส้นแบ่ง, เส้น dashed ระหว่าง Queue/Ready
- **Order View**: `<app-gradient-card>` + status badge (Queue=primary, Cooking=info) + time badge + action buttons (icon only with tooltip)
- **Menu View**: gradient card + tags (Queue/Cooking) ฝั่งขวา, item rows มี status badge + quantity + table + time + action
- **Ready section**: Order View + Menu View (ไม่มี tag), status badge "Ready" สีเขียว
- **Cancelled footer**: badge + quantity + menu (ขีดทับ) + reason
- **Note**: แยกบรรทัด, สี `text-primary-badge`, icon information
- **Time badge**: `getTimeBadgeClass` — >=15 bg-danger, >=10 bg-warning-dark, default bg-surface-hover
- **Empty state**: `<app-empty-view>`
- **View toggle**: segmented control (ไม่ใช่ tab bar เดิม)

## ไฟล์ที่ต้องแก้

| # | ไฟล์ | Action |
|---|------|--------|
| 1 | `features/kitchen-display/pages/kitchen-display/kitchen-display.component.ts` | แก้ — เพิ่ม readyMenuGroups, KPI signals, ลบ Voided, แก้ filters |
| 2 | `features/kitchen-display/pages/kitchen-display/kitchen-display.component.html` | แก้ — เปลี่ยน template ทั้งหมดตามดีไซน์ใหม่ |
| 3 | `test-kitchen-display/test-kitchen-display.component.ts` | ลบ |
| 4 | `test-kitchen-display/test-kitchen-display.component.html` | ลบ |
| 5 | `app.module.ts` | แก้ — ลบ TestKitchenDisplayComponent |
| 6 | `app-routing.module.ts` | แก้ — ลบ test-kitchen-display route |

## Sub-tasks

### Phase 1: Apply TS Logic
- ✅ อัพเดต `pendingOrders` — filter เฉพาะ Sent/Preparing (ไม่รวม Cancelled/Voided)
- ✅ อัพเดต `readyOrders` — auto-move (ไม่มี Sent/Preparing เหลือ + มี Ready)
- ✅ เพิ่ม `readyMenuGroups` computed signal
- ✅ เพิ่ม KPI signals: `totalSent`, `totalPreparing`, `totalReady`, `totalCancelled`
- ✅ อัพเดต `buildMenuGroups()` รับ mode parameter (pending/ready)
- ✅ เพิ่ม `getReadyCount()` method
- ✅ อัพเดต `getTimeBadgeClass()` ตามดีไซน์ใหม่
- ✅ อัพเดต `getCancelledItems()` / `hasCancelledItems()` — ลบ Voided

### Phase 2: Apply HTML Template
- ✅ เปลี่ยน template ทั้งหมดตาม test design
- ✅ ปรับ header ให้ใช้ `pageTitle` / `pageIcon` (dynamic)
- ✅ ลบ test-only elements (Reset Data, "(Test Page)")
- ✅ ใช้ `tableName` แทน `zoneName` (API ไม่มี zone)
- ✅ ลบ `cancelledByName` (API ไม่มี)

### Phase 3: ลบ Test Page + ตรวจสอบ
- ✅ ลบ test-kitchen-display/ folder
- ✅ ลบจาก app.module.ts
- ✅ ลบจาก app-routing.module.ts
- ✅ ตรวจ build (`ng build`)
