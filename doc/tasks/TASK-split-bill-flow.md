# TASK: Split Bill — ต่อ Flow จริง (Frontend)

> สร้าง: 2026-03-22 | สถานะ: เสร็จ

## สรุปงาน

Backend รองรับ Split Bill **ครบ 100%** แล้ว (split by item, split by amount, pay per bill, auto-complete เมื่อจ่ายครบ) แต่ Frontend **ยังไม่ได้ต่อ** — Checkout มีปุ่ม "Split Bill" แต่ `[disabled]="true"`, แสดงแค่ 1 bill, ไม่มี bill selector

**เป้าหมาย**: ให้ผู้ใช้แยกบิลได้จากทั้ง Order Detail + Checkout แล้วจ่ายทีละบิลจนครบ

---

## Flow สรุป

```
Order Detail (Billing) → "แยกบิล" → SplitBillDialog → API split → refresh
                       → "ชำระเงิน" → navigate to /payment/checkout/{orderId}

Checkout → โหลด bills → ถ้า split แล้ว แสดง Bill Tabs (บิล 1 | บิล 2 | ...)
        → เลือกบิล → แสดง summary (SC, VAT, total) → numpad → กดจ่าย
        → จ่ายเสร็จ → auto-select บิลถัดไป (Pending)
        → จ่ายครบ → success → navigate กลับ Payment page
        → (Optional) กดปุ่ม "แยกบิล" → Dialog → API split → reload tabs
```

---

## ข้อจำกัดที่ต้องรู้

- **`OrderBillResponseModel` ไม่มี items** — มีแค่ subtotal, SC, VAT, grandTotal → Checkout แสดง items ทั้งหมดของ order (ไม่แยกต่อบิล) ซึ่งถูกต้องสำหรับ ByAmount / ยอมรับได้สำหรับ ByItem
- **Payment Dialogs (Cash/QR) รองรับหลายบิลแล้ว** — ไม่ต้องแก้
- **Backend auto-complete** — เมื่อจ่ายครบ `CompleteOrderIfAllBillsPaidAsync` จะเปลี่ยน Order→Completed + Table→Cleaning ให้อัตโนมัติ

---

## Phase 1: ย้าย SplitBillDialog → SharedModule ✅

**เหตุผล**: SplitBillDialog ต้องใช้ทั้ง Order module + Payment module (Checkout) — ปัจจุบันอยู่ใน Order module เท่านั้น

| # | สถานะ | ไฟล์ | แก้อะไร |
|---|--------|------|--------|
| 1 | ✅ | `features/order/dialogs/split-bill-dialog/` | **ย้าย** → `shared/dialogs/split-bill-dialog/` |
| 2 | ✅ | `shared/shared.module.ts` | เพิ่ม declaration |
| 3 | ✅ | `features/order/order.module.ts` | ลบ declaration |
| 4 | ✅ | `features/order/pages/order-detail/order-detail.component.ts` | แก้ import path |

---

## Phase 2: Order Detail — เพิ่ม Navigate ไป Checkout ✅

| # | สถานะ | ไฟล์ | แก้อะไร |
|---|--------|------|--------|
| 1 | ✅ | `order-detail.component.ts` | เพิ่ม `onGoToCheckout()` → `router.navigate(['/payment', 'checkout', orderId])` |
| 2 | ✅ | `order-detail.component.html` | ปุ่ม "ชำระเงิน" เพิ่ม `(click)="onGoToCheckout()"` |

> Note: `onSplitBill()` + `onRequestBill()` **ทำงานครบแล้ว** ไม่ต้องแก้

---

## Phase 3: Checkout — Multi-Bill + Split Bill (ส่วนหลัก) ✅

### 3.1 TS (`checkout.component.ts`)

| สถานะ | แก้อะไร | รายละเอียด |
|--------|---------|-----------|
| ✅ | เพิ่ม `allBills` signal | `signal<OrderBillResponseModel[]>([])` |
| ✅ | เพิ่ม `selectedBillIndex` signal | `signal(0)` — index ของบิลที่เลือก |
| ✅ | เปลี่ยน `currentBill` → computed | ดึงจาก `allBills()[selectedBillIndex()]` |
| ✅ | เพิ่ม `allBillsPaid` computed | `allBills().every(b => b.status === 'Paid')` |
| ✅ | แก้ `loadData()` | แยก `loadBills()` + `autoSelectPendingBill()` + `syncScDropdown()` |
| ✅ | เพิ่ม `onSelectBill(index)` | เปลี่ยน `selectedBillIndex` + reset numpad + sync SC dropdown |
| ✅ | เพิ่ม `loadBills()` | reload bills + auto-advance ไป pending ถัดไป |
| ✅ | เพิ่ม `onSplitBill()` | เปิด SplitBillDialog → เรียก API split → `loadBills()` |
| ✅ | แก้ `onPayCash()` callback | หลังจ่าย → `afterPayment()` → reload bills → auto-advance |
| ✅ | แก้ `onPayQr()` callback | หลัง dialog close → `afterPayment()` |

### 3.2 HTML (`checkout.component.html`)

| สถานะ | แก้อะไร | รายละเอียด |
|--------|---------|-----------|
| ✅ | เพิ่ม Bill Tabs | ใต้ Order Info header — `@if (allBills().length > 1)` pill buttons (primary=selected, success=Paid, hover=Pending) |
| ✅ | แก้ปุ่ม Split Bill | ลบ `[disabled]="true"` → เพิ่ม `(click)="onSplitBill()"` + label "แยกบิล" |
| ✅ | Disable Pay buttons | เมื่อ `bill.status === 'Paid'` → Right column แสดง "ชำระแล้ว" |
| ✅ | เพิ่ม All Paid state | เมื่อ `allBillsPaid()` → แสดง success icon + ปุ่มกลับทั้ง left+right column |

---

## ไฟล์ทั้งหมดที่แก้ (7 ไฟล์)

| # | ไฟล์ | ระดับแก้ |
|---|------|---------|
| 1 | `shared/dialogs/split-bill-dialog/*.ts + *.html` | ย้ายจาก order/dialogs |
| 2 | `shared/shared.module.ts` | เพิ่ม declaration + import |
| 3 | `features/order/order.module.ts` | ลบ declaration + import |
| 4 | `features/order/pages/order-detail/order-detail.component.ts` | แก้ import path + เพิ่ม `onGoToCheckout()` |
| 5 | `features/order/pages/order-detail/order-detail.component.html` | เพิ่ม `(click)="onGoToCheckout()"` |
| 6 | `features/payment/pages/checkout/checkout.component.ts` | **แก้เยอะ** — multi-bill logic (allBills, selectedBillIndex, loadBills, onSplitBill, afterPayment) |
| 7 | `features/payment/pages/checkout/checkout.component.html` | **แก้เยอะ** — bill tabs, all-paid state, paid-bill state, split bill button |

---

## การทดสอบ

1. **Order Detail**: กด "ขอบิล" → status Billing → กด "แยกบิล" → เลือก mode → ยืนยัน → bills แยกสำเร็จ
2. **Order Detail → Checkout**: กด "ชำระเงิน" → navigate ไป checkout → เห็น bill tabs (ถ้า split แล้ว)
3. **Checkout Single Bill**: ไม่มี tabs → numpad → จ่ายเงินสด/QR → success → กลับ
4. **Checkout Multi Bills**: เห็น tabs → เลือก bill → จ่าย → tab เปลี่ยนสีเขียว → auto-select bill ถัดไป → จ่ายครบ → success
5. **Checkout Split**: กดปุ่ม "แยกบิล" → dialog → split → tabs แสดงใหม่
6. **SC per bill**: เปลี่ยน Service Charge → ยอด bill ที่เลือกอัพเดต
