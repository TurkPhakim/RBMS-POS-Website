# TASK: รีดีไซน์หน้าชำระเงิน (Checkout Page)

> สถานะ: **กำลังดำเนินการ** | เริ่ม: 2026-03-20

## ปัญหาปัจจุบัน

1. หน้าแคชเชียร์ใช้ Dialog แยกสำหรับเงินสด/QR → ไม่สะดวก ต้องคลิกหลายขั้นตอน
2. ไม่มี dropdown ให้เลือก Service Charge → ระบบดึง SC อัตโนมัติ ไม่สามารถเลือกเองได้
3. ไม่มี numpad สำหรับกรอกจำนวนเงิน → ต้องพิมพ์ตัวเลขเอง

## เป้าหมาย

รีดีไซน์เป็น **Checkout Page เต็มจอ** (คล้าย FoodStory POS):
- ตาราง billing → กดดวงตา → หน้า Checkout
- ฝั่งซ้าย: รายการอาหาร + SC dropdown + สรุปยอด
- ฝั่งขวา: Numpad + ปุ่มเงินสด/QR

---

## Design — Checkout Page Layout

**Reference**: FoodStory POS checkout screen
**Route**: `/payment/checkout/:orderId`
**เข้าจาก**: หน้า payment (ตาราง billing) → กดปุ่มดวงตา → navigate มา

### ASCII Mockup

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← ย้อนกลับ              ชำระเงิน #ORD-001 (โต๊ะ A1)               │
├────────────────────────────────┬────────────────────────────────────┤
│                                │                                    │
│  รายการอาหาร (scroll)          │  บิล #BILL-001                    │
│  ───────────────────────       │                                    │
│  ┌────────────────────────┐   │  ┌────────────────────────────┐   │
│  │ Ice Americano      x1  │   │  │                            │   │
│  │ + ไซส์ใหญ่ (+20)   95  │   │  │         130.00             │   │
│  ├────────────────────────┤   │  │                            │   │
│  │ Iced Salted Caramel x1 │   │  └────────────────────────────┘   │
│  │                    55  │   │                                    │
│  └────────────────────────┘   │     ┌───┐  ┌───┐  ┌───┐          │
│                                │     │ 7 │  │ 8 │  │ 9 │          │
│                                │     ├───┤  ├───┤  ├───┤          │
│  ───────────────────────       │     │ 4 │  │ 5 │  │ 6 │          │
│  ค่าบริการ [SC dropdown ▼]     │     ├───┤  ├───┤  ├───┤          │
│  SC 10%              13.00     │     │ 1 │  │ 2 │  │ 3 │          │
│  VAT 7%               9.10    │     ├───┤  ├───┤  ├───┤          │
│  ─────────────────────────     │     │ C │  │ 0 │  │ ← │          │
│  รวมทั้งหมด         143.10    │     └───┘  └───┘  └───┘          │
│                                │                                    │
│                                │  ┌──────────┐  ┌──────────────┐  │
│                                │  │  QR/สลิป  │  │   เงินสด    │  │
│                                │  └──────────┘  └──────────────┘  │
│                                │                                    │
│                                │  ┌──────────┐  ┌──────────────┐  │
│                                │  │ Split Bill│  │  Void Bill   │  │
│                                │  └──────────┘  └──────────────┘  │
└────────────────────────────────┴────────────────────────────────────┘
```

### รายละเอียดแต่ละส่วน

**Header**: ปุ่มย้อนกลับ + "ชำระเงิน #ORD-XXX (โต๊ะ YYY)"

**ฝั่งซ้าย (60%) — รายการอาหาร + สรุปยอด:**
- รายการ items scrollable: ชื่อเมนู (ไทย), จำนวน, options (ถ้ามี), ราคารวม
- แสดงเฉพาะ items ที่ status ไม่ใช่ Cancelled/Voided
- SC Dropdown: ดึงจาก `ordersGetServiceChargeOptionsGet()` + ตัวเลือก "ไม่คิดค่าบริการ"
- เปลี่ยน SC → call `ordersUpdateBillChargesPut()` → refresh ยอด
- สรุป: SubTotal, SC (rate% + amount), VAT (rate% + amount), **Grand Total** (ตัวใหญ่เด่น)

**ฝั่งขวา (40%) — Numpad + ปุ่มชำระ:**
- Bill number ด้านบน
- ช่องแสดงจำนวนเงิน (default = grandTotal, เปลี่ยนได้ด้วย numpad)
- Numpad: 0-9, `.` (จุดทศนิยม), C (clear ทั้งหมด), backspace (ลบทีละตัว)
- ปุ่ม **"เงินสด"** (severity success, ใหญ่เด่น) → validate amount >= grandTotal → call `paymentsPayCashPost()` → แสดง success + เงินทอน → navigate กลับ
- ปุ่ม **"QR/สลิป"** (severity info) → เปิด QrPaymentDialog เดิม (รับ `orderId`) → upload slip → confirm → success → navigate กลับ
- ปุ่ม **Split Bill** + **Void Bill** (secondary, ปิดไว้ก่อน — ไว้ phase ถัดไป)

### Flow การใช้งาน

```
1. เข้าหน้า → load order detail + bills + SC options พร้อมกัน
2. แสดง items จาก order detail, แสดง bill summary จาก bills[0] (Pending)
3. เลือก SC จาก dropdown → call update-charges → ยอดเปลี่ยน → numpad reset to new grandTotal
4a. กด numpad ใส่จำนวน → กด "เงินสด" → ชำระ → success modal + เงินทอน → กลับตาราง
4b. กด "QR/สลิป" → เปิด dialog upload slip → upload → confirm → success → กลับตาราง
```

### ไฟล์ที่สร้าง/แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `pages/checkout/checkout.component.ts` | **สร้างใหม่** — Checkout logic ทั้งหมด |
| `pages/checkout/checkout.component.html` | **สร้างใหม่** — 2 column layout |
| `payment-routing.module.ts` | เพิ่ม route `checkout/:orderId` |
| `payment.module.ts` | declare `CheckoutComponent` |
| `payment.component.html` | เปลี่ยนปุ่ม "เงินสด/QR" → ปุ่มดวงตา navigate |
| `payment.component.ts` | เพิ่ม `onCheckout(order)` method |

### Generated API ที่ใช้

| Service Method | ใช้ทำอะไร |
|----------------|-----------|
| `ordersGetOrderGet({orderId})` | ดึง order detail + items |
| `ordersGetBillsGet({orderId})` | ดึง bills (เอา Pending bill แรก) |
| `ordersGetServiceChargeOptionsGet()` | ดึง SC options สำหรับ dropdown |
| `ordersUpdateBillChargesPut({orderBillId, body})` | เปลี่ยน SC → recalculate bill |
| `paymentsPayCashPost({body: {orderBillId, amountReceived}})` | ชำระเงินสด |
| (QR ใช้ dialog เดิม — `QrPaymentDialogComponent`) | upload slip + confirm |

### Generated Models ที่ใช้

| Model | ใช้สำหรับ |
|-------|----------|
| `OrderDetailResponseModel` | order detail (items, orderNumber, tableName) |
| `OrderItemResponseModel` | แต่ละ item (menuNameThai, quantity, unitPrice, options) |
| `OrderItemOptionResponseModel` | options ของ item (optionItemName, additionalPrice) |
| `OrderBillResponseModel` | bill (grandTotal, subTotal, serviceChargeRate/Amount, vatRate/Amount) |
| `ServiceChargeOptionModel` | SC dropdown (serviceChargeId, name, percentageRate) |
| `CashPaymentRequestModel` | request pay cash (orderBillId, amountReceived) |

---

## Phase 1: Backend — API endpoints ใหม่

| Sub-task | สถานะ |
|----------|-------|
| สร้าง `UpdateBillChargesRequestModel` | ✅ |
| สร้าง `ServiceChargeOptionModel` | ✅ |
| เพิ่ม `UpdateBillChargesAsync` ใน OrderService | ✅ |
| เพิ่ม `GetServiceChargeOptionsAsync` ใน OrderService | ✅ |
| เพิ่ม 2 endpoints ใน OrdersController | ✅ |
| รัน gen-api | ✅ |

## Phase 2: Frontend — Checkout Page ใหม่

| Sub-task | สถานะ |
|----------|-------|
| สร้าง `checkout.component.ts` + `.html` + routing + module | ✅ |
| Layout 2 คอลัมน์: ฝั่งซ้าย (items + SC + summary) / ฝั่งขวา (numpad + ปุ่มชำระ) | ✅ |
| SC dropdown + call API update-charges | ✅ |
| Numpad logic (0-9, C, backspace) | ✅ |
| ปุ่มเงินสด → call pay cash API → แสดง success + เงินทอน | ✅ |
| ปุ่ม QR → เปิด QrPaymentDialog เดิม → success → navigate กลับ | ✅ |

## Phase 3: Frontend — แก้ตาราง billing + cleanup

| Sub-task | สถานะ |
|----------|-------|
| เปลี่ยนปุ่ม "เงินสด/QR" เป็นปุ่มดวงตา → navigate ไป `/payment/checkout/:orderId` | ✅ |
| แก้ routing + module (declare CheckoutComponent) | ✅ |
| ลบ CashPaymentDialog ที่ไม่ใช้แล้ว (QrPaymentDialog ยังใช้อยู่) | ⬜ (ยังไม่ลบ — รอทดสอบก่อน) |
