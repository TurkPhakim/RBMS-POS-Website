# TASK: ปุ่มดาวน์โหลดใบเสร็จในหน้ารอบการขาย (Payment)

## สถานะ: ✅ เสร็จสิ้น

## ประวัติ
- เดิมทำในหน้า order-list → ผู้ใช้แก้ให้ย้ายมาหน้า payment (รอบการขาย) แทน
- Revert โค้ด order-list ทั้งหมด (2026-03-29)

## เป้าหมาย
เพิ่มปุ่มดาวน์โหลดใบเสร็จในตาราง "ออเดอร์ชำระเงินเสร็จสิ้น" ของหน้ารอบการขาย

### กฎ:
- **Payments จาก order เดียวกัน group รวมเป็น 1 แถว** (ไม่ว่าจะแยกกี่บิล)
- **บิลเดียว**: ปุ่มดาวน์โหลดใบเสร็จ + ปุ่มดูสลิป (ถ้า QR + มีสลิป)
- **หลายบิล (แยกบิล)**: ปุ่มใบเสร็จรวม + ปุ่มใบเสร็จแยก (popup menu ด้วย dot-menu icon)

## แผนงาน

### Phase 1: Revert order-list ✅
- ลบ receipt buttons ทั้งหมดจาก `order-list.component.html`
- ลบ ReceiptService, ApiConfiguration, receipt methods จาก `order-list.component.ts`
- ลบ `<p-menu>` popup จาก order-list

### Phase 2: แก้ payment page ✅

#### 2.1 `payment.component.ts` ✅
- เพิ่ม `paymentGroups` computed signal — group `session.payments` by `orderId`
- เพิ่ม `billMenuItems: MenuItem[]`
- เพิ่ม methods: `onDownloadConsolidated`, `onViewSlip`, `buildBillMenu`
- ลบ `downloadingId` (dead code)

#### 2.2 `payment.component.html` ✅
- ตาราง "ออเดอร์ชำระเงินเสร็จสิ้น" ใช้ `paymentGroups()` แทน `session.payments`
- 3 ปุ่มในคอลัมน์ "ตัวเลือก":
  1. ปุ่มใบเสร็จ (primary) — consolidated สำหรับ split / single สำหรับบิลเดียว
  2. ปุ่มใบเสร็จย่อย (dot-menu popup) — เฉพาะ split bills
  3. ปุ่มสลิปโอนเงิน (billing) — เฉพาะบิลเดียว + QR + มีสลิป
- คอลัมน์ "วิธีชำระเงิน" แสดง "แยก N บิล" สำหรับ split orders
- เพิ่ม `<p-menu #billMenu>` สำหรับ popup menu

## ไฟล์ที่แก้

| ไฟล์ | การแก้ |
|------|--------|
| `order-list.component.ts` | Revert — ลบ receipt code ทั้งหมด |
| `order-list.component.html` | Revert — ลบปุ่มดาวน์โหลด + p-menu |
| `payment.component.ts` | เพิ่ม paymentGroups, billMenuItems, methods |
| `payment.component.html` | เปลี่ยนตาราง paid orders ใช้ grouped data + 3 ปุ่ม |

## หมายเหตุ
- BE มี `OrderBillSummaryModel` + `OrderResponseModel.Bills` ที่สร้างไว้ตอนทำ order-list — ยังไม่ได้ revert เพราะไม่กระทบอะไร (optional fields)
- Payment page ใช้ข้อมูลจาก `CashierSessionResponseModel.payments` ซึ่งมี `PaymentResponseModel` ที่มีข้อมูลครบอยู่แล้ว (paymentId, orderId, billNumber, paymentMethod, slipImageFileId)
