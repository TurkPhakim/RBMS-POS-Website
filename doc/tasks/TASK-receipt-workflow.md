# TASK: ปรับ Workflow ดาวน์โหลดใบเสร็จ + แก้ Receipt Footer

> สถานะ: 🔄 กำลังทำ (Phase 2 ปรับใหม่)
> สร้างเมื่อ: 2026-03-24

## บริบท

**ปัญหา:**
1. หลังชำระเงินสด → modal ถาม "ดาวน์โหลดใบเสร็จ?" → กด "ข้าม" = ใบเสร็จหายเลย ไม่มีทางกลับมาดาวน์โหลด
2. ตาราง "ออเดอร์ชำระเงินเสร็จสิ้น" (session-detail) ไม่บอกว่าแยกบิลหรือไม่ + ไม่มีปุ่มดาวน์โหลดใบเสร็จรวม
3. ที่อยู่ร้านไม่แสดงท้ายใบเสร็จ (แสดงแค่หัวใบเสร็จ)
4. receiptHeaderText/receiptFooterText ไม่แสดง → ตรวจแล้วโค้ดถูก แต่ค่าใน DB เป็น null (ต้องตั้งค่าใน ShopSettings)

**เป้าหมาย:**
- Checkout: modal สำเร็จแบบปุ่มเดียว + ปุ่มดาวน์โหลดบน paid bill
- Session-detail: ปรับตาราง + dropdown menu สำหรับดาวน์โหลดใบเสร็จ
- Receipt: เพิ่มที่อยู่ร้านท้ายใบเสร็จ

> **ไม่ต้องแก้ Backend / ไม่ต้อง gen-api**

---

## Phase 1: Checkout — แก้ Modal + เพิ่มปุ่มดาวน์โหลด

### 1.1 แก้ `onPayCash()` modal
- ✅ เปลี่ยน modal จาก "ดาวน์โหลดใบเสร็จ/ข้าม" → "ชำระเงินสำเร็จ + เงินทอน" ปุ่ม "ตกลง" เดียว
- ไฟล์: `checkout.component.ts`

### 1.2 เพิ่ม payments signal + โหลด payments
- ✅ เพิ่ม `payments` signal เก็บ PaymentResponseModel[]
- ✅ โหลด payments ด้วย `paymentsGetPaymentsByOrderGet` ใน `loadBills()`
- ไฟล์: `checkout.component.ts`

### 1.3 เพิ่มปุ่มดาวน์โหลดใน paid bill panel (right side)
- ✅ เพิ่มปุ่ม "ดาวน์โหลดใบเสร็จ" ใน paid bill panel
- ✅ method `onDownloadBillReceipt(bill)` — หา paymentId จาก payments signal แล้ว downloadReceipt
- ไฟล์: `checkout.component.html` + `checkout.component.ts`

## Phase 2: Session-detail — ปรับตาราง (ปรับใหม่ v2)

**แนวคิดใหม่:** แยกบิลต้องรวมเป็น **1 แถวต่อ 1 ออเดอร์** (ไม่ใช่ 1 แถวต่อ payment)

### 2.1 Group payments by orderNumber (v2)
- ✅ `groupedOrders` computed — group payments ตาม orderNumber, รวมยอดชำระ, ใช้ paidAt ล่าสุด
- ✅ `OrderGroup` interface (ท้ายไฟล์): orderNumber, orderId, payments[], totalAmount, zoneName, tableName, guestType, guestCount, latestPaidAt
- ✅ ลบ `splitOrderNumbers` + `isSplitOrder()` เดิม → ใช้ `group.payments.length > 1` แทน
- ไฟล์: `session-detail.component.ts`

### 2.2 ปรับตาราง HTML (v2)
- ✅ ตาราง iterate `groupedOrders()` แทน `session.payments`
- ✅ 1 แถวต่อ order — แสดง badge "แยกบิล N บิล" ถ้า split
- ✅ ลบคอลัมน์ "เลขบิล" (ไม่จำเป็นเพราะรวมเป็น 1 แถว)
- ✅ ยอดชำระ = totalAmount (ผลรวมทุก payment ใน group)
- ✅ วิธีชำระ = แสดง unique methods (เช่น "เงินสด, QR")
- ✅ Fix zone/table display — ไม่เพิ่ม prefix ซ้ำ
- ไฟล์: `session-detail.component.html`

### 2.3 ปุ่มตัวเลือก (v2)
- ✅ **ไม่แยกบิล**: ปุ่มดาวน์โหลดใบเสร็จ (pi-download) → ดาวน์โหลดตรง
- ✅ **แยกบิล**: 2 ปุ่ม:
  - ปุ่ม pi-download = ดาวน์โหลดใบเสร็จรวม (consolidated)
  - ปุ่ม pi-list = เปิด p-tieredMenu แสดงใบเสร็จย่อยแต่ละบิล
- ✅ `onOpenBillMenu(event, group)` — สร้าง menu items จาก group.payments
- ไฟล์: `session-detail.component.html` + `session-detail.component.ts`

## Phase 3: Receipt Footer — เพิ่มที่อยู่ร้าน

### 3.1 Client receipt.service.ts
- ✅ เพิ่มที่อยู่ + เบอร์โทรในส่วน footer ก่อน "ขอบคุณที่ใช้บริการ"

### 3.2 Mobile Web receipt.service.ts
- ✅ เพิ่มที่อยู่ + เบอร์โทรในส่วน footer ก่อน "ขอบคุณที่ใช้บริการ"
