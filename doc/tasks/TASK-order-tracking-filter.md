# TASK: เพิ่ม Filter ตามโต๊ะ + ตามคนสั่ง ใน Mobile Web order-tracking

> สร้าง: 2026-03-30

## บริบท

หน้า order-tracking ของ Mobile Web แสดงรายการทั้งโต๊ะโดยไม่มี filter — ลูกค้าดูไม่ออกว่ารายการไหนของใคร และถ้าเชื่อมโต๊ะกันก็ไม่รู้ว่ามาจากโต๊ะไหน

## เป้าหมาย

- เพิ่ม dropdown filter **ตามโต๊ะต้นทาง** (แสดงเฉพาะเมื่อเชื่อมโต๊ะ) → filter แรก
- เพิ่ม dropdown filter **ตามคนสั่ง** (dependent — แสดง options เฉพาะคนที่สั่งจากโต๊ะที่เลือก) → filter สอง
- ใช้ native `<select>` styled ด้วย Tailwind (เหมาะ mobile + ไม่ต้องเพิ่ม PrimeNG module)
- Cascading: เลือกโต๊ะ → reset คนสั่ง → filter items

---

## Phase 1: Backend — เพิ่ม SourceTableName ใน response

### 1.1 แก้ CustomerTrackingItemModel ✅
**ไฟล์**: `Backend-POS/POS.Main/POS.Main.Business.Payment/Models/SelfOrder/CustomerOrderTrackingResponseModel.cs`
- เพิ่ม `public string? SourceTableName { get; set; }` ใน `CustomerTrackingItemModel`

### 1.2 แก้ GetOrdersAsync — include SourceTable + map ✅
**ไฟล์**: `Backend-POS/POS.Main/POS.Main.Business.Payment/Services/SelfOrderService.cs`
- เพิ่ม `.ThenInclude(i => i.SourceTable)` ใน query
- map `SourceTableName = i.SourceTable?.TableName` ใน select

### 1.3 Build Backend ✅

---

## Phase 2: gen-api ✅

- Restart Backend → ตรวจ Swagger → ผู้ใช้รัน gen-api → ตรวจ generated model มี `sourceTableName`

---

## Phase 3: Frontend Mobile Web — เพิ่ม Filter

### 3.1 แก้ order-tracking.component.ts ✅
**ไฟล์**: `Frontend-POS/RBMS-POS-Mobile-Web/src/app/features/orders/pages/order-tracking/order-tracking.component.ts`

เพิ่ม:
- `sourceTableFilter`, `orderedByFilter` signals
- `sourceTableNames` computed — unique source table names
- `hasMultipleTables` computed — แสดง dropdown เมื่อมีหลายโต๊ะ
- `orderedByNames` computed — unique orderedBy (filter ตามโต๊ะที่เลือก)
- `hasMultipleOrderers` computed — แสดง dropdown เมื่อมีหลายคน
- `filteredItems` computed — items ที่ filter แล้ว
- `onSourceTableChange()` — reset orderedByFilter เมื่อเปลี่ยนโต๊ะ

### 3.2 แก้ order-tracking.component.html ✅
**ไฟล์**: `Frontend-POS/RBMS-POS-Mobile-Web/src/app/features/orders/pages/order-tracking/order-tracking.component.html`

- เพิ่ม filter section (native `<select>`) หลัง `<app-card-header>` ก่อน items list
- เปลี่ยน `items()` → `filteredItems()` ใน `@for` และ count

---

## ไฟล์ที่แก้

| ไฟล์ | การแก้ |
|------|--------|
| `CustomerOrderTrackingResponseModel.cs` | เพิ่ม `SourceTableName` |
| `SelfOrderService.cs` | Include SourceTable + map |
| `order-tracking.component.ts` | Filter signals + computed |
| `order-tracking.component.html` | Filter dropdowns + filteredItems |

## ตรวจสอบ
1. Build Backend สำเร็จ
2. gen-api → model มี sourceTableName
3. โต๊ะเดี่ยว: ไม่แสดง dropdown โต๊ะ, แสดง dropdown คนสั่งเมื่อมีหลายคน
4. Linked table: แสดงทั้ง 2 dropdown, เลือกโต๊ะ → reset คนสั่ง → filter items
