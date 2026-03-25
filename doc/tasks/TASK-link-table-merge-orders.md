# TASK: รวมออเดอร์เมื่อเชื่อมโต๊ะ (Link Tables → Merge Orders)

> สร้าง: 2026-03-24 | สถานะ: **เสร็จสมบูรณ์**

## สรุปเป้าหมาย

เปลี่ยนฟีเจอร์ "เชื่อมโต๊ะ" จาก **visual grouping อย่างเดียว** ให้ **รวม Order เป็นตัวเดียว** และรองรับ Unlink แยก Order กลับตาม `SourceTableId`

## กฎที่ตกลงแล้ว
- **Primary table** = โต๊ะแรกใน list (โต๊ะที่กดเปิด dialog)
- **Unlink** = แยก items กลับตาม `SourceTableId` (ได้เมื่อ Order status = Open เท่านั้น)
- **ย้ายโต๊ะ + ปิดโต๊ะ** = ห้ามสำหรับ linked tables (ต้อง unlink ก่อน)

## Schema Changes
| Entity | Field ใหม่ | ประเภท | คำอธิบาย |
|--------|-----------|--------|---------|
| `TbTableLink` | `IsPrimary` | `bool` | บอกว่าโต๊ะไหนเป็นเจ้าของ Order หลัก |
| `TbOrderItem` | `SourceTableId` | `int?` (FK → TbTable) | ระบุว่า item สั่งจากโต๊ะไหน |

---

## Phase 1: Database — Schema + Migration

### Sub-task 1.1: เพิ่ม `IsPrimary` ใน TbTableLink ✅
- `POS.Main.Dal/Entities/Table/TbTableLink.cs`
- `POS.Main.Dal/EntityConfigurations/TbTableLinkConfiguration.cs`

### Sub-task 1.2: เพิ่ม `SourceTableId` ใน TbOrderItem ✅
- `POS.Main.Dal/Entities/Order/TbOrderItem.cs`
- `POS.Main.Dal/EntityConfigurations/TbOrderItemConfiguration.cs`

### Sub-task 1.3: Migration + Update DB ✅

---

## Phase 2: Backend — TableService (Link/Unlink/Move/Close)

### Sub-task 2.1: แก้ `LinkTablesAsync` — รวม Order ✅
**Flow:**
1. Validate: ทุกโต๊ะ Occupied + Orders Open + ยังไม่ linked
2. Primary = `request.TableIds[0]` → ดึง primaryOrder
3. Set SourceTableId ของ items เดิม = primaryTableId
4. Secondary tables: ย้าย items → primaryOrder, set ActiveOrderId, delete secondary orders
5. สร้าง TbTableLink (primary: IsPrimary=true)
6. Recalculate SubTotal, Notify

### Sub-task 2.2: แก้ `UnlinkTablesAsync` — แยก Order กลับ ✅
**Flow (Order.Status == Open เท่านั้น):**
1. หา primary → primaryOrder
2. Secondary tables: สร้าง Order ใหม่, ย้าย items ตาม SourceTableId
3. ลบ TbTableLink, Recalculate, Notify

### Sub-task 2.3: แก้ `MoveTableAsync` — block linked tables ✅
### Sub-task 2.4: แก้ `CloseTableAsync` — block linked tables ✅

---

## Phase 3: Backend — OrderService

### Sub-task 3.1: แก้ `AddOrderItemsAsync` — set SourceTableId ✅
### Sub-task 3.2: เพิ่ม helper `GetLinkedTableIdsAsync` ✅
### Sub-task 3.3: แก้ `RequestBillAsync` — เปลี่ยนทุก linked tables → Billing ✅
### Sub-task 3.4: แก้ `VoidBillAsync` — revert ทุก linked tables → Occupied ✅

---

## Phase 4: Backend — SelfOrderService

### Sub-task 4.1: แก้ `SubmitOrderAsync` — หา Order ผ่าน ActiveOrderId + set SourceTableId ✅
### Sub-task 4.2: แก้ `GetOrdersAsync` — หา Order ผ่าน ActiveOrderId ✅
### Sub-task 4.3: แก้ `RequestBillAsync` (customer) — เปลี่ยนทุก linked tables ✅
### Sub-task 4.4: แก้ `RequestCashPaymentAsync` + `RequestSplitBillAsync` ✅

---

## Phase 5: Backend — PaymentService

### Sub-task 5.1: แก้ `CompleteOrderIfAllBillsPaidAsync` — close ทุก linked tables + auto-unlink ✅

---

## Phase 6: gen-api + Frontend

### Sub-task 6.1: Restart BE + ตรวจ Swagger + ผู้ใช้ gen-api ✅ (ไม่ต้อง gen-api — ไม่มี API changes ที่ expose ออก)
### Sub-task 6.2: ซ่อนปุ่ม "ย้ายโต๊ะ" + "ปิดโต๊ะ" เมื่อ linked ✅
### Sub-task 6.3: แก้ Unlink confirmation message ✅

---

## Phase 7: อัพเดตเอกสาร ✅
- `doc/architecture/database-api-reference.md`

---

## Edge Cases
| สถานการณ์ | การจัดการ |
|-----------|----------|
| Unlink เมื่อ Billing | ห้าม — throw error, ต้อง void bill ก่อน |
| Items Sent/Preparing ตอน Unlink | ย้ายไป order ใหม่ได้ |
| QR Token secondary tables | คงอยู่ — ActiveOrderId ชี้ไป primary order |
| SourceTableId null | ตอน Link → set ให้หมด, Unlink → null ค้างที่ primary |
