# TASK: Void Bill (ยกเลิกบิล)

> สร้าง: 2026-03-24 | **เสร็จแล้ว**

## สรุป Requirement

- ปุ่ม "ยกเลิกบิล" ในหน้า checkout — เมื่อออเดอร์สถานะ Billing แล้วลูกค้าเปลี่ยนใจ
- **Flow**: Billing → [ยกเลิกบิล] → กลับเป็น Open → สั่งเพิ่ม/แก้ไขได้
- **Reverse ของ RequestBill**: เปลี่ยน Order → Open, Table → Occupied, ลบ OrderBills ที่ยัง Pending

---

## Phase 1: Backend

### Sub-task 1.1: เพิ่ม VoidBillAsync ใน OrderService
- ✅ เพิ่ม method ใน `IOrderService`
- ✅ เพิ่ม logic ใน `OrderService`:
  1. ตรวจ Order status = Billing
  2. ลบ OrderBills ที่สถานะ Pending (hard delete)
  3. เปลี่ยน Order status → Open
  4. เปลี่ยน Table status → Occupied
  5. Notify SignalR

### Sub-task 1.2: เพิ่ม endpoint ใน OrdersController
- ✅ `POST /api/v1/orders/{orderId}/void-bill`
- ✅ Permission: `Order.Update`

---

## Phase 2: Frontend

### Sub-task 2.1: gen-api
- ✅ restart BE + gen-api สำเร็จ

### Sub-task 2.2: เปิดปุ่มยกเลิกบิลใน checkout
- ✅ เปลี่ยน label เป็น "ยกเลิกบิล"
- ✅ เปิด disabled → เรียก API `ordersVoidBillPost`
- ✅ confirm dialog ก่อนยกเลิก
- ✅ สำเร็จ → navigate กลับ `/order/{orderId}`

---

## ไฟล์ที่แก้

| ไฟล์ | สิ่งที่แก้ |
|------|-----------|
| `IOrderService.cs` | เพิ่ม `VoidBillAsync` |
| `OrderService.cs` | เพิ่ม logic void bill |
| `OrdersController.cs` | เพิ่ม endpoint `POST {orderId}/void-bill` |
| `checkout.component.html` | เปิดปุ่ม + เปลี่ยนชื่อเป็น "ยกเลิกบิล" |
| `checkout.component.ts` | เพิ่ม `onVoidBill()` method |
