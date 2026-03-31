# TASK: Split Bill — ต่อ Flow จริง (Frontend)

> สร้าง: 2026-03-22 | สถานะ: เสร็จ (Phase 1-3 Staff)

## สรุปงานเดิม (เสร็จแล้ว)

Backend รองรับ Split Bill ครบ 100% — Frontend Staff ต่อ Flow ครบ (SplitBillDialog, Bill Tabs, Multi-Bill Checkout, Pay per bill)

---

# TASK: ปรับปรุง Flow แยกบิล — Customer Bill Summary + Staff Slip Indicator

> เพิ่ม: 2026-03-31 | สถานะ: กำลังทำ

## Context

**ปัญหา**: เมื่อพนักงานแยกบิลแล้ว ลูกค้าฝั่ง Mobile Web เห็นแค่บิลใบแรก (`bills[0]`) ไม่เห็นบิลใบอื่น ไม่มีปุ่มให้เลือกจ่ายแต่ละบิล และเมื่อลูกค้าอัพโหลดสลิป พนักงานต้องกดปุ่ม QR เองถึงจะเห็น

**เป้าหมาย**:
1. ลูกค้าเห็นบิลทุกใบเมื่อแยกบิล + เลือกจ่ายแต่ละใบได้
2. เมื่อบิลหนึ่งถูกจ่ายแล้ว → SignalR refresh → ปุ่มหายไปทันที
3. พนักงานเห็นชัดเจนว่าลูกค้าส่งสลิปมาแล้ว (ไม่ต้องกดปุ่ม QR)

---

## Phase 1: Backend — เพิ่ม fields ใน CustomerBillSummaryModel

### Sub-task 1.1: เพิ่ม fields ใน Model ✅
**ไฟล์**: `Backend-POS/POS.Main/POS.Main.Business.Payment/Models/Customer/CustomerBillResponseModel.cs`

**ปัจจุบัน**: `CustomerBillSummaryModel` มีแค่ `OrderBillId`, `BillNumber`, `Status`, `SubTotal`, `ServiceChargeAmount`, `VatAmount`, `TotalDiscountAmount`, `GrandTotal`

**เพิ่ม**:
- `SplitCount` (int) — จำนวนบิลทั้งหมด
- `SplitIndex` (int) — ลำดับบิลนี้ (1-based)
- `BillType` (string) — ประเภทการแยก (Full/ByItem/ByAmount)

### Sub-task 1.2: อัพเดต Mapper ✅
**ไฟล์**: `Backend-POS/POS.Main/POS.Main.Business.Payment/Services/CustomerService.cs` (บรรทัด ~75-89)

**ปัจจุบัน**: mapping inline ไม่มี `SplitCount`, `SplitIndex`, `BillType`

**แก้**: เพิ่ม 3 fields ใน Select()

### Sub-task 1.3: gen-api ✅
- Restart Backend → ตรวจ Swagger → แจ้งผู้ใช้รัน `npm run gen-api` ใน Mobile Web

---

## Phase 2: Frontend Mobile Web — bill-summary แสดงบิลทุกใบ

### Sub-task 2.1: เพิ่ม SignalR refresh ✅
**ไฟล์**: `RBMS-POS-Mobile-Web/src/app/features/bill/pages/bill-summary/bill-summary.component.ts`

**ปัจจุบัน**: โหลดข้อมูลครั้งเดียวใน `ngOnInit()` ไม่มี SignalR

**แก้**:
- inject `SignalRService`
- เพิ่ม `effect()` ที่ listen `signalR.refreshOrders()` → เรียก `loadBill()` ใหม่
- แยก API call จาก `ngOnInit()` ออกเป็น `loadBill()` method

### Sub-task 2.2: แสดงบิลทุกใบ (Multiple Bills Layout) ✅
**ไฟล์**: `bill-summary.component.ts` + `bill-summary.component.html`

**ปัจจุบัน**: `currentBill = computed(() => bills[0])` → แสดงแค่ใบแรก

**แก้ TS**:
- เพิ่ม `bills = computed(() => bill()?.bills ?? [])`
- เพิ่ม `hasMultipleBills = computed(() => bills().length > 1)`

**แก้ HTML — Layout สำหรับ Multiple Bills** (bills.length > 1):
```
┌─────────────────────────────────────┐
│ สรุปออเดอร์ ORD-20260331-001       │
│ [รายการอาหาร grouped by category]  │
│ ─────────────────────────────────── │
│ บิลที่ 1/3 — หารเท่า               │
│ ยอดรวม: ฿500.00                    │
│ [เงินสด] [โอนเงิน]                 │
│ ─────────────────────────────────── │
│ บิลที่ 2/3 — หารเท่า               │
│ ยอดรวม: ฿500.00                    │
│ [เงินสด] [โอนเงิน]                 │
│ ─────────────────────────────────── │
│ บิลที่ 3/3 — หารเท่า     ✅ ชำระแล้ว│
│ ยอดรวม: ฿500.00                    │
└─────────────────────────────────────┘
```

- Pending → ปุ่ม "เงินสด" + "โอนเงิน"
- Paid → badge "ชำระแล้ว" (ไม่มีปุ่ม)
- เงินสด → `requestCashPayment(billId)` (notification ไป staff)
- โอนเงิน → navigate `/bill/upload?billId={orderBillId}`

**Single Bill** (bills.length === 1): คงเดิม — charges breakdown + ปุ่ม 3 ตัว

### Sub-task 2.3: ซ่อนปุ่ม "แยกบิล" เมื่อ bills > 1 ✅
- ปุ่ม "แยกบิล" แสดงเฉพาะเมื่อ `bills.length === 1`

### Sub-task 2.4: แก้ CSS opacity modifier ✅
- `bg-primary/10` → `bg-primary-subtle`
- `bg-info/10` → `bg-info-bg`
- `bg-billing/10` → inline style
- `bg-primary/5`, `border-primary/30` → `bg-primary-subtle`, `border-primary-light`
- `bg-success/5`, `border-success/30` → `bg-success-bg`, `border-success`
- `bg-info/5`, `border-info/30`, `hover:bg-info/5` → `bg-info-bg`, `border-info`, `hover:bg-info-bg`
- `bg-success/10`, `bg-info/10` → `bg-success-bg`, `bg-info-bg`

---

## Phase 3: Frontend Staff — Slip Indicator

### Sub-task 3.1: เพิ่ม Slip Badge บน Bill Tab ✅
**ไฟล์**: `RBMS-POS-Client/src/app/features/payment/pages/checkout/checkout.component.html`

เมื่อ bill มี `customerSlipFileId` + `status === 'Pending'`:
- แสดง icon `pi pi-image` สีฟ้าข้างชื่อ bill บน tab

### Sub-task 3.2: เพิ่ม Alert Bar เมื่อ bill มี customer slip ✅
**ไฟล์**: `checkout.component.html`

- เมื่อเลือก bill ที่มี `customerSlipFileId` → แสดงแถบข้อความ
- "ลูกค้าส่งสลิปมาแล้ว" + ปุ่ม "ดูสลิป"
- แสดงใน right column เหนือ numpad

---

## ไฟล์ที่ต้องแก้ (สรุป)

| ไฟล์ | การแก้ |
|------|--------|
| `POS.Main.Business.Payment/Models/Customer/CustomerBillResponseModel.cs` | เพิ่ม `SplitCount`, `SplitIndex`, `BillType` |
| `POS.Main.Business.Payment/Services/CustomerService.cs` | อัพเดต mapping |
| `RBMS-POS-Mobile-Web/.../bill-summary.component.ts` | SignalR effect, multiple bills logic |
| `RBMS-POS-Mobile-Web/.../bill-summary.component.html` | Layout multiple bills + per-bill payment |
| `RBMS-POS-Client/.../checkout.component.html` | Slip badge + alert bar |
