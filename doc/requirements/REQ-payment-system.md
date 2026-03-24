# ระบบชำระเงิน (Payment System)

> สถานะ: **Draft** | อัปเดตล่าสุด: 2026-03-18

---

## 1. ภาพรวม

### 1.1 บทนำ

ระบบชำระเงิน (Payment System) จัดการทุกอย่างเกี่ยวกับการเก็บเงินลูกค้า ตั้งแต่สรุปบิล, ใส่ส่วนลด, เลือกช่องทางชำระ, ออกใบเสร็จ ไปจนถึงการจัดการกะแคชเชียร์ โดยรองรับทั้ง:

1. **Staff/Cashier Payment** — แคชเชียร์ดำเนินการชำระเงินที่หน้าร้าน
2. **Customer Self-Service Payment** — ลูกค้าดูบิล + โอนเงิน + ส่งสลิปจาก QR Panel บนมือถือ

**อ้างอิงการออกแบบ:** FoodStory POS (Shift Management, QR Payment, Receipt)

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน | ที่ต้องการ |
|--------|----------|-----------|
| การชำระเงิน | ไม่มี | เงินสด + QR Payment |
| ส่วนลด | ไม่มี | Bill-level + Item-level (% หรือจำนวนเงิน) |
| กะแคชเชียร์ | ไม่มี | เปิด/ปิดกะ + Cash In/Out + Variance |
| ใบเสร็จ | ไม่มี | PDF ในเบราว์เซอร์ (รูปแบบ thermal receipt) |
| ตรวจสลิป | ไม่มี | OCR ตรวจยอด + เช็คสลิปซ้ำ |
| ประวัติชำระ | ไม่มี | TbPayment + หน้าแสดงประวัติ |
| Self-service | ไม่มี | ลูกค้าดูบิล + QR + upload สลิปจากมือถือ |

### 1.3 ขอบเขต (Scope)

**ทำ:**
- ชำระเงินสด (กรอกเงินรับ + คำนวณทอน)
- ชำระผ่าน QR (แสดง QR ร้าน + upload สลิป + OCR ตรวจ)
- ส่วนลด Bill-level + Item-level
- ระบบกะแคชเชียร์เต็มรูปแบบ (Open/Close Shift, Cash In/Out, Variance)
- ใบเสร็จ PDF (Download เปิดในเครื่อง)
- Customer Self-Service (ดูบิล + QR + upload สลิป)
- ประวัติการชำระเงิน (สำหรับ Report module อนาคต)
- เชื่อมต่อ Order + Table + Notification

**ไม่ทำ (อยู่ใน phase ถัดไปหรือ module อื่น):**
- บัตรเครดิต/เดบิต (ต้อง EDC hardware)
- Mixed Payment (จ่ายหลายช่องทางในบิลเดียว)
- Void/Refund (ยกเลิกบิลที่จ่ายแล้ว)
- ใบกำกับภาษีเต็มรูป (Tax Invoice)
- ระบบโปรโมชัน/คูปองอัตโนมัติ
- Report module (ใช้ข้อมูลจาก TbPayment แต่หน้า report อยู่คนละ module)

---

## 2. Payment Lifecycle

### 2.1 Flow หลัก

#### A) Staff-initiated (พนักงานกดขอบิลเอง)

```
พนักงานกด "ขอบิล" จาก Order Detail / Table Detail
    │
    ▼
Order status → BILLING, Table status → BILLING
    │
    ▼
แคชเชียร์เข้าหน้า Payment Process
    │ ← เลือก ServiceCharge profile
    │ ← ใส่ส่วนลด (ถ้ามี)
    │ ← กด "ยืนยันบิล" → สร้าง TbOrderBill (snapshot ServiceCharge + VAT rate)
    ▼
เลือกช่องทางชำระ:
    ├── เงินสด → กรอกเงินที่รับ → คำนวณเงินทอน → ยืนยัน
    └── QR → แสดง QR + ยอด → ลูกค้าโอน → upload สลิป → OCR ตรวจ → แคชเชียร์ยืนยัน
    │
    ▼
สร้าง TbPayment + Bill status → PAID
    │ Order status → COMPLETED
    │ Table status → CLEANING
    │ SignalR → PAYMENT_COMPLETED notification
    ▼
แสดงใบเสร็จ (PDF) → Download
```

#### B) Customer-initiated (ลูกค้ากดขอบิลจาก QR Panel)

```
ลูกค้ากด "ขอเช็คบิล" จาก Mobile Web (QR Panel)
    │
    ▼
Order status → BILLING, Table status → BILLING
    │ แคชเชียร์ได้ noti REQUEST_BILL "โต๊ะ A3 ขอเช็คบิล"
    │ ลูกค้าเห็นหน้า "รอพนักงานจัดเตรียมบิล..."
    ▼
แคชเชียร์เข้าหน้า Payment Process (จาก noti หรือ Floor Plan)
    │ ← เลือก ServiceCharge profile
    │ ← ใส่ส่วนลด (ถ้ามี)
    │ ← กด "ยืนยันบิล" → สร้าง TbOrderBill
    │ → SignalR → ลูกค้าเห็นบิลจริง (real-time)
    ▼
ลูกค้าเห็นสรุปบิล + QR Code ร้าน + ยอดชำระ
    │ สแกน QR → โอนเงิน → upload สลิป
    ▼
OCR ตรวจ → แคชเชียร์ได้ noti SLIP_UPLOADED → ยืนยัน
    │
    ▼
สร้าง TbPayment + Bill status → PAID
    │ Order status → COMPLETED
    │ Table status → CLEANING
    │ SignalR → PAYMENT_COMPLETED → ลูกค้าเห็น "ชำระเงินเสร็จสิ้น"
    ▼
แสดงใบเสร็จ (PDF) → Download
```

> **สำคัญ:** ทั้ง 2 flow, TbOrderBill จะถูกสร้าง **เมื่อแคชเชียร์กด "ยืนยันบิล" เท่านั้น** — ไม่ใช่ตอนลูกค้ากดขอบิล เพราะต้องเลือก ServiceCharge + ใส่ส่วนลดก่อน

### 2.2 เงื่อนไขก่อนชำระเงิน

- ต้องมี **กะเปิดอยู่** (TbCashierSession status = OPEN)
- Order status ต้องเป็น **BILLING**
- Bill status ต้องเป็น **PENDING** (ยังไม่จ่าย)

---

## 3. Payment Methods (ช่องทางชำระเงิน)

### 3.1 เงินสด (Cash)

**Flow:**
1. แคชเชียร์เห็นยอด GrandTotal บนหน้าจอ
2. กรอกจำนวนเงินที่รับจากลูกค้า ผ่าน **keypad ตัวเลข** (อ้างอิงรูป POS)
3. ระบบคำนวณเงินทอน: `ChangeAmount = AmountReceived - GrandTotal`
4. ถ้า AmountReceived < GrandTotal → ปุ่ม "ยืนยัน" disabled + แสดง "เงินไม่พอ"
5. กด "ยืนยันชำระเงิน" → สร้าง TbPayment (method=CASH)

**Quick Amount Buttons (ทางลัด):**
- แสดงปุ่มจำนวนเงินที่พบบ่อย: `[พอดี]` `[500]` `[1000]`
- กด `[พอดี]` → กรอก AmountReceived = GrandTotal อัตโนมัติ (เงินทอน = 0)

### 3.2 QR Payment

**Flow (ฝั่งแคชเชียร์):**
1. กด "QR" → แสดง QR Code ร้านค้า (จาก TbShopSettings.PaymentQrCodeFileId)
2. แสดงยอดที่ต้องชำระชัดเจน (ตัวใหญ่)
3. ลูกค้าสแกน QR → โอนเงินจาก app ธนาคาร
4. ลูกค้า/แคชเชียร์ กด "อัปโหลดสลิป" → ถ่ายรูป/เลือกจาก gallery
5. ระบบ OCR ตรวจสลิป → แสดงผล: "ยอดตรง" / "ยอดไม่ตรง" / "ไม่สามารถอ่านได้"
6. แคชเชียร์ตรวจสอบ → กด "ยืนยันการชำระเงิน"
7. สร้าง TbPayment (method=QR_PAYMENT)

**Flow (ฝั่งลูกค้า Self-Service) — ดู Section 6**

**QR Code ร้านค้า:**
- เป็น **Static QR** (QR PromptPay หรือ QR บัญชีธนาคารร้าน)
- Upload ผ่านหน้า Shop Settings → เก็บเป็น TbFile → อ้างอิงผ่าน PaymentQrCodeFileId
- ไม่ใช่ Dynamic QR (ไม่ lock ยอด) — ดังนั้นต้อง OCR ตรวจสลิปเพิ่ม

---

## 4. Discount System (ระบบส่วนลด)

### 4.1 ประเภทส่วนลด

| ระดับ | คำอธิบาย | ตัวอย่าง |
|-------|---------|---------|
| **Item-level** | ลดราคาเฉพาะรายการ | ข้าวผัดกุ้ง ลด 20 บาท (เมนูวันนี้) |
| **Bill-level** | ลดราคาทั้งบิล | ลด 10% ทั้งบิล (ส่วนลดสมาชิก) |

**รูปแบบส่วนลด (ใช้ได้ทั้ง 2 ระดับ):**
- **เปอร์เซ็นต์ (%)** — เช่น ลด 10%
- **จำนวนเงิน (บาท)** — เช่น ลด 50 บาท

### 4.2 Item-level Discount

1. แคชเชียร์เข้าหน้า Payment Process → เห็นรายการอาหาร
2. กด "ส่วนลด" ที่รายการที่ต้องการ → Dialog เปิด
3. เลือก: ลดเป็น % หรือจำนวนเงิน → กรอกค่า → ระบุเหตุผล
4. กด "ยืนยัน" → สร้าง TbOrderDiscount (OrderItemId ≠ null)
5. ยอดบิลคำนวณใหม่อัตโนมัติ

**เงื่อนไข:**
- ลดได้ไม่เกินราคารายการนั้น (ไม่ติดลบ)
- 1 รายการมีส่วนลดได้ 1 รายการ (ถ้าต้องการเปลี่ยนให้ลบแล้วเพิ่มใหม่)
- เฉพาะ items ที่ status SERVED เท่านั้น (ไม่ลดรายการที่ VOIDED/CANCELLED)

### 4.3 Bill-level Discount

1. แคชเชียร์กด "ส่วนลดบิล" → Dialog เปิด
2. เลือก: ลดเป็น % หรือจำนวนเงิน → กรอกค่า → ระบุเหตุผล
3. กด "ยืนยัน" → สร้าง TbOrderDiscount (OrderItemId = null)
4. ยอดบิลคำนวณใหม่

**เงื่อนไข:**
- ลดได้ไม่เกิน SubTotal - ItemDiscountTotal (ไม่ให้ NetAmount ติดลบ)
- 1 บิลมีส่วนลดบิลได้ 1 รายการ

### 4.4 สูตรคำนวณบิล (รวมส่วนลด)

```
SubTotal = Σ item.TotalPrice                     ← items ที่ไม่ใช่ VOIDED/CANCELLED
ItemDiscountTotal = Σ item discount amounts
BillDiscountAmount = bill discount amount
TotalDiscount = ItemDiscountTotal + BillDiscountAmount

NetAmount = SubTotal - TotalDiscount
ServiceChargeAmount = NetAmount × (ServiceChargeRate / 100)  ← Cashier เลือกจาก Master Data dropdown ตอนขอบิล
VatAmount = (NetAmount + ServiceChargeAmount) × (7 / 100)    ← VAT คงที่ 7%
GrandTotal = NetAmount + ServiceChargeAmount + VatAmount
```

> **ServiceChargeRate:** Cashier เลือกจาก Service Charge Master Data (dropdown) ตอนขอบิล → snapshot ลง TbOrderBill.ServiceChargeRate
> **VatRate:** คงที่ 7% (hardcode ในระบบ ไม่มีหน้าตั้งค่า) → snapshot ลง TbOrderBill.VatRate

**ตัวอย่าง:**
```
รายการ:
  ข้าวผัดกุ้ง ×2     = 260.00
    + ไข่ดาว          = +20.00
  ต้มยำกุ้ง ×1        = 150.00
  ──────────────────────
  SubTotal            = 430.00

ส่วนลดรายการ:
  ข้าวผัดกุ้ง ลด 10%  = -26.00
ส่วนลดบิล:
  ไม่มี               = 0.00
  ──────────────────────
  TotalDiscount       = 26.00
  NetAmount           = 404.00

  ServiceCharge (10%) = 40.40
  VAT (7%)            = (404.00 + 40.40) × 0.07 = 31.11
  ──────────────────────
  GrandTotal          = 475.51
```

---

## 5. Cashier Session (ระบบกะแคชเชียร์)

### 5.1 เปิดกะ (Open Shift)

1. แคชเชียร์เข้าหน้าจัดการกะ → กด "เปิดกะ"
2. Dialog: กรอก **เงินเริ่มต้น (Opening Cash)** — จำนวนเงินสดที่เตรียมไว้ใน drawer
3. กด "ยืนยัน" → สร้าง TbCashierSession (status=OPEN, OpenedAt=now)
4. พร้อมรับชำระเงิน

**เงื่อนไข:**
- 1 user เปิดกะได้ 1 กะเท่านั้น (ห้ามเปิดซ้อน)
- ต้องเปิดกะก่อนรับชำระทุกกรณี (ทั้งเงินสดและ QR)

### 5.2 ระหว่างกะ — Cash In / Cash Out

**Cash In (เงินเข้า):**
- เช่น เตรียมเงินทอนเพิ่ม, เงินจากแหล่งอื่น
- กรอก: จำนวนเงิน + เหตุผล → บันทึก TbCashDrawerTransaction (type=CASH_IN)

**Cash Out (เงินออก):**
- เช่น ซื้อวัตถุดิบ, ค่าขนส่ง
- กรอก: จำนวนเงิน + เหตุผล → บันทึก TbCashDrawerTransaction (type=CASH_OUT)

**ทุก Cash Payment:**
- ระบบ auto บันทึก: เงินรับ (AmountReceived) เข้ากะ + เงินทอน (ChangeAmount) ออกจากกะ

### 5.3 ปิดกะ (Close Shift)

1. แคชเชียร์กด "ปิดกะ" → เข้าหน้าสรุปกะ
2. ระบบคำนวณ **ยอดเงินสดที่ควรมี (Expected Cash)**:
   ```
   Expected = OpeningCash
            + Σ CashPayments (AmountReceived ทั้งหมด)
            + Σ CashIn
            - Σ ChangeGiven (เงินทอนทั้งหมด)
            - Σ CashOut
   ```
3. แคชเชียร์นับเงินจริงใน drawer → กรอก **ยอดเงินจริง (Actual Cash)**
4. ระบบแสดง **Variance** = Actual - Expected
   - บวก → เงินเกิน (surplus)
   - ลบ → เงินขาด (shortage)
5. แสดงสรุปกะ:
   - จำนวนบิลทั้งหมด
   - ยอดขายรวม
   - ยอดเงินสด / ยอด QR
   - รายการ Cash In/Out
6. กด "ยืนยันปิดกะ" → CashierSession status → CLOSED, ClosedAt = now

### 5.4 ประวัติกะ

- ตาราง list กะทั้งหมด: วันที่, แคชเชียร์, เวลาเปิด-ปิด, ยอดขาย, Variance, สถานะ
- กดดู detail → เห็นสรุปกะเต็มรูปแบบ

---

## 6. Customer Self-Service Payment (QR Panel)

> **หมายเหตุ:** ลูกค้าเข้าถึง Self-Service Payment ผ่าน **RBMS-POS-Mobile-Web** (port 4400) โดยใช้ **Guest Bearer Token** — ดูรายละเอียด auth flow ที่ [REQ-self-order-system](REQ-self-order-system.md) Section 3, 13, 15

### 6.1 Flow

1. ลูกค้ากด **"ขอเช็คบิล"** บน Mobile Web (ดู [REQ-self-order-system](REQ-self-order-system.md) Section 10.2)
2. Order status → **BILLING**, Table status → **BILLING**
3. แคชเชียร์ได้ notification `REQUEST_BILL` "โต๊ะ A3 ขอเช็คบิล"
4. **ลูกค้าเห็นหน้า "รอพนักงานจัดเตรียมบิล..."** (ดู §6.2)
5. แคชเชียร์เข้าหน้า Payment Process → เลือก ServiceCharge + ใส่ส่วนลด (ถ้ามี) → กด **"ยืนยันบิล"**
6. ระบบสร้าง **TbOrderBill** → SignalR broadcast `BILL_PREPARED` ไปยัง Customer group
7. ลูกค้าเห็น **หน้าสรุปบิล** (real-time):
   - รายการอาหาร + ราคา
   - SubTotal, ServiceCharge, VAT, GrandTotal
   - QR Code ร้านค้า (ตัวใหญ่)
   - ยอดที่ต้องชำระ (ตัวใหญ่เด่น)
8. ลูกค้าสแกน QR → โอนเงินจาก app ธนาคาร
9. กด **"อัปโหลดสลิป"** → ถ่ายรูปสลิป / เลือกจาก gallery
10. ระบบ OCR ตรวจ → แสดงสถานะ: "กำลังตรวจสอบ..." → "ยอดตรง" / "ยอดไม่ตรง"
11. แคชเชียร์ได้รับ notification `SLIP_UPLOADED` → เข้าตรวจสอบ → ยืนยัน
12. ลูกค้าเห็น **"ชำระเงินเสร็จสิ้น"** (real-time ผ่าน SignalR)
13. (Optional) ลูกค้ากดดูใบเสร็จ

### 6.2 Layout หน้ารอบิล (Customer — ก่อนแคชเชียร์ยืนยัน)

> แสดงทันทีหลังลูกค้ากด "ขอเช็คบิล" — ระหว่างรอแคชเชียร์เตรียมบิล

```
┌─────────────────────────┐
│                         │
│      [icon: loading]    │
│                         │
│  รอพนักงานจัดเตรียมบิล  │
│                         │
│  กรุณารอสักครู่...       │
│  พนักงานกำลังตรวจสอบ     │
│  รายการและเตรียมบิลให้   │
│                         │
│  โต๊ะ A3                │
│  เวลาขอบิล: 14:35      │
│                         │
└─────────────────────────┘
```

**Behavior:**
- แสดง loading animation (spinner หรือ pulse icon)
- ข้อความคงที่ "รอพนักงานจัดเตรียมบิล"
- แสดงชื่อโต๊ะ + เวลาที่กดขอบิล
- เมื่อแคชเชียร์กด "ยืนยันบิล" → SignalR event `BILL_PREPARED` → เปลี่ยนเป็นหน้าสรุปบิล (§6.3) อัตโนมัติ
- ลูกค้าไม่สามารถสั่งอาหารเพิ่มได้ (ปุ่มสั่ง disabled / ซ่อน)

### 6.3 Layout หน้าสรุปบิล (Customer — หลังแคชเชียร์ยืนยัน)

> แสดงหลังได้รับ SignalR event `BILL_PREPARED` — ลูกค้าเห็นยอดจริงพร้อมชำระ

```
┌─────────────────────────┐
│   สรุปรายการสั่ง         │
│                         │
│   ข้าวผัดกุ้ง ×2   260  │
│     + ไข่ดาว       +20  │
│   ต้มยำกุ้ง ×1     150  │
│   ─────────────────────  │
│   รวม            430.00 │
│   ค่าบริการ(10%)  43.00 │
│   VAT(7%)        33.11  │
│   ═════════════════════  │
│   ยอดชำระ       506.11  │
│                         │
│   ┌─────────────────┐   │
│   │  [QR Code ร้าน] │   │
│   │  กรุณาสแกนจ่าย  │   │
│   │  506.11 บาท     │   │
│   └─────────────────┘   │
│                         │
│   [อัปโหลดสลิป]         │
│                         │
│   สถานะ: รอการชำระเงิน  │
└─────────────────────────┘
```

### 6.4 เงื่อนไข Self-Service

- ลูกค้าเห็นเฉพาะ **QR Payment** (ไม่เห็นตัวเลือกเงินสด)
- ส่วนลด **ใส่ไม่ได้** จากฝั่งลูกค้า — เฉพาะแคชเชียร์เท่านั้น
- แคชเชียร์ต้อง **ยืนยัน** ทุกกรณี (ถึง OCR จะ match ก็ต้องกดยืนยัน)
- ถ้าลูกค้าต้องการส่วนลด → แจ้งพนักงาน → พนักงานใส่ส่วนลดก่อนยืนยัน

---

## 7. Receipt (ใบเสร็จ PDF)

### 7.1 เนื้อหาใบเสร็จ

```
┌──────────────────────────┐
│     [Logo ร้าน]          │
│     ชื่อร้าน             │
│     สาขา (ถ้ามี)         │
│     ที่อยู่              │
│     เบอร์โทร             │
│  ── Header Text ──       │
│                          │
│  บิล: ORD-20260318-001   │
│  วันที่: 18/03/2026      │
│  เวลา: 14:30             │
│  โต๊ะ: A1                │
│  พนักงาน: สมชาย          │
│  ─────────────────────── │
│  รายการ         จำนวน ราคา│
│  ─────────────────────── │
│  ข้าวผัดกุ้ง     ×2  260 │
│    + ไข่ดาว           20 │
│  ต้มยำกุ้ง       ×1  150 │
│  ─────────────────────── │
│  รวม               430.00│
│  ส่วนลด(ข้าวผัด)  -26.00│
│  ─────────────────────── │
│  หลังลด           404.00│
│  ค่าบริการ(10%)    40.40│
│  VAT(7%)           31.11│
│  ═══════════════════════ │
│  ยอดชำระ          475.51│
│  ═══════════════════════ │
│                          │
│  ชำระ: เงินสด            │
│  รับมา:           500.00│
│  เงินทอน:          24.49│
│                          │
│  ── Footer Text ──       │
│     ขอบคุณที่มาอุดหนุน   │
└──────────────────────────┘
```

### 7.2 การสร้าง PDF

**Library:** [`pdfmake`](https://pdfmake.github.io/docs/) (MIT, ฟรี) — Declarative PDF generator สร้าง layout เป็น JSON object

**เหตุผลที่เลือก pdfmake:**
- Table layout built-in — เหมาะกับใบเสร็จที่มีรายการอาหารไม่แน่นอน
- Auto-layout — ไม่ต้องคำนวณ x, y position ด้วยมือ
- รองรับ custom font (ภาษาไทย) ผ่าน Virtual File System (VFS)

**Flow:**
```
Backend API: GET /api/receipt/{paymentId}
    │  return JSON: shopName, logo(base64), items[], discounts[],
    │               subTotal, serviceCharge, vat, grandTotal,
    │               paymentMethod, amountReceived, change,
    │               headerText, footerText, ...
    ▼
Frontend: ReceiptViewComponent
    │  รับ JSON → แสดง preview ในหน้าเว็บ (HTML)
    │  กดปุ่ม "Download PDF"
    ▼
pdfmake: สร้าง PDF จาก docDefinition
    │  → pdfMake.createPdf(docDef).download('receipt-ORD20260318001.pdf')
    ▼
ไฟล์ .pdf บันทึกลงเครื่อง
```

**ขนาด:** กว้าง ~80mm / 226.77pt (จำลอง thermal receipt), ความสูง auto ตามจำนวนรายการ

**ปุ่ม:** Download (save PDF เปิดในเครื่อง) — ไม่ต้อง Print

**Font ภาษาไทย:**
- ใช้ **THSarabun** (ฟรี, SIL Open Font License) — รองรับภาษาไทยครบ
- แปลง `.ttf` → base64 ฝังใน `vfs_fonts.ts` แล้ว register ก่อนใช้งาน

**ตัวอย่าง docDefinition:**

```typescript
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from './vfs_fonts'; // THSarabun base64
pdfMake.vfs = pdfFonts;
pdfMake.fonts = {
  THSarabun: {
    normal: 'THSarabun.ttf',
    bold: 'THSarabun-Bold.ttf',
  }
};

function generateReceipt(data: ReceiptData) {
  const docDefinition = {
    pageSize: { width: 226.77, height: 'auto' },   // ~80mm
    pageMargins: [12, 12, 12, 12],
    defaultStyle: { font: 'THSarabun', fontSize: 11 },

    content: [
      // ── ส่วนหัว: Logo + ชื่อร้าน ──
      ...(data.logoBase64
        ? [{ image: data.logoBase64, width: 50, alignment: 'center' as const }]
        : []),
      { text: data.shopName, fontSize: 14, bold: true, alignment: 'center' },
      { text: data.address, fontSize: 9, alignment: 'center' },
      { text: `โทร ${data.phone}`, fontSize: 9, alignment: 'center' },
      ...(data.headerText
        ? [{ text: data.headerText, alignment: 'center' as const, margin: [0, 4, 0, 0] as [number,number,number,number] }]
        : []),

      // ── ข้อมูลบิล ──
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 202, y2: 0, dash: { length: 3 } }], margin: [0, 6, 0, 4] },
      { columns: [{ text: `บิล: ${data.billNumber}` }, { text: `โต๊ะ: ${data.tableName}`, alignment: 'right' }], fontSize: 10 },
      { columns: [{ text: `${data.date} ${data.time}` }, { text: `พนักงาน: ${data.cashierName}`, alignment: 'right' }], fontSize: 10 },

      // ── รายการอาหาร (table) ──
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 202, y2: 0, dash: { length: 3 } }], margin: [0, 4, 0, 4] },
      {
        table: {
          widths: ['*', 25, 'auto'],
          body: [
            // Header
            [
              { text: 'รายการ', bold: true },
              { text: 'จน.', bold: true, alignment: 'center' },
              { text: 'ราคา', bold: true, alignment: 'right' },
            ],
            // Items
            ...data.items.flatMap(item => [
              [
                { text: item.name },
                { text: `×${item.quantity}`, alignment: 'center' },
                { text: item.total.toFixed(2), alignment: 'right' },
              ],
              // Options (ถ้ามี)
              ...item.options.map(opt => [
                { text: `  + ${opt.name}`, fontSize: 9, color: '#666666' },
                { text: '', alignment: 'center' },
                { text: `+${opt.price.toFixed(2)}`, fontSize: 9, alignment: 'right', color: '#666666' },
              ]),
            ]),
          ],
        },
        layout: 'noBorders',
      },

      // ── สรุปยอด ──
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 202, y2: 0, dash: { length: 3 } }], margin: [0, 4, 0, 4] },
      { columns: [{ text: 'รวม' }, { text: data.subTotal.toFixed(2), alignment: 'right' }] },
      // ส่วนลด (ถ้ามี)
      ...data.discounts.map(d => ({
        columns: [
          { text: `ส่วนลด(${d.description})`, color: '#dc2626' },
          { text: `-${d.amount.toFixed(2)}`, alignment: 'right' as const, color: '#dc2626' },
        ],
      })),
      ...(data.discounts.length > 0
        ? [{ columns: [{ text: 'หลังลด' }, { text: data.netAmount.toFixed(2), alignment: 'right' as const }] }]
        : []),
      { columns: [{ text: `ค่าบริการ(${data.serviceChargePercent}%)` }, { text: data.serviceChargeAmount.toFixed(2), alignment: 'right' }] },
      { columns: [{ text: `VAT(${data.vatPercent}%)` }, { text: data.vatAmount.toFixed(2), alignment: 'right' }] },

      // ── ยอดชำระ (เน้น) ──
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 202, y2: 0, lineWidth: 1.5 }], margin: [0, 4, 0, 4] },
      { columns: [
        { text: 'ยอดชำระ', bold: true, fontSize: 13 },
        { text: data.grandTotal.toFixed(2), bold: true, fontSize: 13, alignment: 'right' },
      ]},
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 202, y2: 0, lineWidth: 1.5 }], margin: [0, 4, 0, 4] },

      // ── ข้อมูลการชำระ ──
      { text: `ชำระ: ${data.paymentMethod === 'CASH' ? 'เงินสด' : 'QR Payment'}`, fontSize: 10 },
      ...(data.paymentMethod === 'CASH'
        ? [
            { columns: [{ text: 'รับมา' }, { text: data.amountReceived!.toFixed(2), alignment: 'right' as const }], fontSize: 10 },
            { columns: [{ text: 'เงินทอน' }, { text: data.change!.toFixed(2), alignment: 'right' as const }], fontSize: 10 },
          ]
        : []),

      // ── ส่วนท้าย ──
      ...(data.footerText
        ? [{ text: data.footerText, alignment: 'center' as const, margin: [0, 8, 0, 0] as [number,number,number,number], fontSize: 10 }]
        : []),
    ],
  };

  pdfMake.createPdf(docDefinition).download(`receipt-${data.billNumber}.pdf`);
}
```

> **หมายเหตุ:** ตัวอย่างด้านบนเป็นแนวทาง — รายละเอียด style, spacing อาจปรับตอน implement จริง

### 7.3 Receipt Settings (ตั้งค่าในหน้า Shop Settings)

| Setting | คำอธิบาย | Default |
|---------|---------|---------|
| ReceiptHeaderText | ข้อความหัวใบเสร็จ (เช่น "ยินดีต้อนรับ") | "" (ว่าง) |
| ReceiptFooterText | ข้อความท้ายใบเสร็จ (เช่น "ขอบคุณที่มาอุดหนุน") | "" (ว่าง) |

> **หมายเหตุ:** ข้อมูลร้าน (ชื่อ, ที่อยู่, เบอร์, logo) ดึงจาก TbShopSettings ที่มีอยู่แล้ว

### 7.4 ใครเห็นใบเสร็จบ้าง

| ใคร | เมื่อไหร่ | ยังไง |
|-----|----------|-------|
| แคชเชียร์ | หลังกดยืนยันชำระ → redirect ไปหน้าใบเสร็จอัตโนมัติ | หน้า `/payment/receipt/:paymentId` |
| แคชเชียร์ | ดูย้อนหลังจากหน้าประวัติการชำระ | คอลัมน์ "ตัวเลือก" → กด "ดูใบเสร็จ" |
| ลูกค้า (Self-service) | หลังชำระสำเร็จ เห็น "ชำระเงินเสร็จสิ้น" | ปุ่ม "ดูใบเสร็จ" (optional) บน Mobile Web |

**การแสดงผล:**
- เปิดเป็นหน้า view ในเบราว์เซอร์ + ปุ่ม **Download PDF** (save ไฟล์ `.pdf` ลงเครื่อง)
- **ไม่ต้องมีปุ่ม Print** — ผู้ใช้เปิดไฟล์ PDF แล้ว print เองได้ถ้าต้องการ

---

## 8. OCR Slip Verification (ตรวจสลิปด้วย OCR)

### 8.1 กลไก

1. รับรูปสลิป (JPEG/PNG) → upload เก็บเป็น TbFile
2. ส่งรูปเข้า OCR Engine → แปลงเป็น text
3. ใช้ regex pattern ดึงข้อมูล:
   - **ยอดเงิน:** หา pattern ตัวเลข + "บาท" / "THB" / "จำนวนเงิน"
   - **เลขอ้างอิง:** หา pattern reference number / transaction ID
4. **เทียบยอด:** |OCR amount - GrandTotal| ≤ 1.00 บาท → MATCHED
5. **เช็คซ้ำ:** เลขอ้างอิงเคยใช้ใน TbPayment อื่นแล้ว → reject

### 8.2 ผลการตรวจ (ESlipVerificationStatus)

| ค่า | ชื่อ | คำอธิบาย |
|-----|------|---------|
| 0 | NONE | ไม่ได้ตรวจ (เงินสด) |
| 1 | MATCHED | ยอดตรง (OCR อ่านได้ + ยอดตรง) |
| 2 | MISMATCHED | ยอดไม่ตรง (OCR อ่านได้แต่ยอดต่างกัน) |
| 3 | MANUAL | ตรวจด้วยมือ (OCR อ่านไม่ได้ → แคชเชียร์กรอกเอง) |

### 8.3 Fallback

- ถ้า OCR อ่านไม่ได้ → แสดง "ไม่สามารถอ่านสลิปได้อัตโนมัติ"
- แคชเชียร์สามารถ: **กรอกยอดจากสลิปด้วยมือ** → ระบบเทียบเอง → status = MANUAL
- แคชเชียร์สามารถ: **ข้ามการตรวจสลิป** → กดยืนยันเลย (manual override)
- ทุกกรณี: **แคชเชียร์ต้องกดยืนยันเสมอ** — ระบบไม่ auto-close bill

### 8.4 OCR Engine (Phase 1)

- ใช้ **Tesseract OCR** (open-source, รันบน server)
- Parse ผลด้วย regex pattern สำหรับสลิปธนาคารไทย
- อนาคต: เปลี่ยนเป็น Google Cloud Vision / Azure Computer Vision ได้

### 8.5 ข้อจำกัด

- OCR **ไม่ 100% แม่นยำ** — สลิปบางธนาคารอาจอ่านยาก
- **ไม่ได้เชื่อมธนาคาร** — ไม่สามารถยืนยันว่าเงินเข้าบัญชีจริง
- ป้องกันได้: สลิปยอดไม่ตรง + สลิปใช้ซ้ำ
- ไม่ป้องกันได้: สลิปปลอมที่ทำมาดี (ยอดตรง + ref ใหม่)

---

## 9. Database Schema

### 9.1 Enums (C#)

```csharp
public enum EPaymentMethod
{
    Cash = 0,
    QrPayment = 1
}

public enum ECashierSessionStatus
{
    Open = 0,
    Closed = 1
}

public enum ECashDrawerTransactionType
{
    CashIn = 0,
    CashOut = 1
}

public enum EDiscountType
{
    Percentage = 0,
    FixedAmount = 1
}

public enum ESlipVerificationStatus
{
    None = 0,
    Matched = 1,
    Mismatched = 2,
    Manual = 3
}
```

### 9.2 TbPayment (บันทึกการชำระเงิน)

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| PaymentId | int (PK) | ใช่ | |
| OrderBillId | int (FK → TbOrderBill) | ใช่ | 1 Payment ต่อ 1 Bill |
| CashierSessionId | int (FK → TbCashierSession) | ใช่ | กะที่รับเงิน |
| PaymentMethod | enum | ใช่ | CASH=0, QR_PAYMENT=1 |
| AmountDue | decimal(12,2) | ใช่ | ยอดที่ต้องจ่าย (= GrandTotal ของ bill) |
| AmountReceived | decimal(12,2) | ใช่ | เงินที่รับ (เงินสด: จำนวนที่ลูกค้าให้, QR: = AmountDue) |
| ChangeAmount | decimal(12,2) | ใช่ | เงินทอน (เงินสด: Received - Due, QR: 0) |
| PaymentReference | string(100) | ไม่ | เลขอ้างอิงจากสลิป (QR only, สำหรับ duplicate check) |
| SlipImageFileId | int (FK → TbFile) | ไม่ | รูปสลิป (QR only) |
| SlipOcrAmount | decimal(12,2) | ไม่ | ยอดที่ OCR อ่านได้จากสลิป |
| SlipVerificationStatus | enum | ใช่ | NONE (เงินสด), MATCHED/MISMATCHED/MANUAL (QR) |
| Note | string(500) | ไม่ | หมายเหตุ |
| PaidAt | datetime2 | ใช่ | เวลาที่ชำระ |
| + BaseEntity fields | | | |

### 9.3 TbCashierSession (กะแคชเชียร์)

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| CashierSessionId | int (PK) | ใช่ | |
| UserId | int (FK → TbUser) | ใช่ | แคชเชียร์ที่เปิดกะ |
| Status | enum | ใช่ | OPEN=0, CLOSED=1 |
| OpenedAt | datetime2 | ใช่ | เวลาเปิดกะ |
| ClosedAt | datetime2 | ไม่ | null = ยังเปิดอยู่ |
| OpeningCash | decimal(12,2) | ใช่ | เงินเริ่มต้นใน drawer |
| ExpectedCash | decimal(12,2) | ไม่ | คำนวณตอนปิดกะ |
| ActualCash | decimal(12,2) | ไม่ | เงินที่นับจริง (กรอกตอนปิดกะ) |
| Variance | decimal(12,2) | ไม่ | Actual - Expected |
| TotalSales | decimal(12,2) | ไม่ | ยอดขายรวมในกะ |
| TotalCashSales | decimal(12,2) | ไม่ | ยอดจากเงินสด |
| TotalQrSales | decimal(12,2) | ไม่ | ยอดจาก QR |
| BillCount | int | ไม่ | จำนวนบิลที่ชำระในกะ |
| Note | string(500) | ไม่ | |
| + BaseEntity fields | | | |

### 9.4 TbCashDrawerTransaction (เงินเข้า/ออก)

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| CashDrawerTransactionId | int (PK) | ใช่ | |
| CashierSessionId | int (FK → TbCashierSession) | ใช่ | |
| TransactionType | enum | ใช่ | CASH_IN=0, CASH_OUT=1 |
| Amount | decimal(12,2) | ใช่ | จำนวนเงิน |
| Reason | string(200) | ใช่ | เหตุผล |
| + BaseEntity fields | | | |

### 9.5 TbOrderDiscount (ส่วนลด)

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| OrderDiscountId | int (PK) | ใช่ | |
| OrderBillId | int (FK → TbOrderBill) | ใช่ | ผูกกับบิล |
| OrderItemId | int (FK → TbOrderItem) | ไม่ | null = bill-level, มีค่า = item-level |
| DiscountType | enum | ใช่ | PERCENTAGE=0, FIXED_AMOUNT=1 |
| DiscountValue | decimal(10,2) | ใช่ | ค่า (เช่น 10 สำหรับ 10%, หรือ 50 สำหรับ 50 บาท) |
| DiscountAmount | decimal(12,2) | ใช่ | จำนวนเงินที่ลด (คำนวณแล้ว) |
| Reason | string(200) | ใช่ | เหตุผล เช่น "เมนูวันนี้", "ส่วนลดสมาชิก" |
| + BaseEntity fields | | | |

### 9.6 อัพเดต TbOrderBill (เพิ่ม fields)

| Field เพิ่ม | Type | หมายเหตุ |
|-------------|------|----------|
| TotalDiscountAmount | decimal(12,2) | รวมส่วนลดทั้งหมด (item + bill) |
| NetAmount | decimal(12,2) | SubTotal - TotalDiscountAmount |

> **หมายเหตุ:** ServiceCharge และ VAT คำนวณจาก NetAmount (ไม่ใช่ SubTotal) เมื่อมีส่วนลด

### 9.7 อัพเดต TbShopSettings (เพิ่ม fields)

| Field เพิ่ม | Type | Default | หมายเหตุ |
|-------------|------|---------|----------|
| ReceiptHeaderText | string(500) | "" | ข้อความหัวใบเสร็จ |
| ReceiptFooterText | string(500) | "" | ข้อความท้ายใบเสร็จ |

> **หมายเหตุ:** ServiceChargeRate **ไม่ได้**เก็บใน TbShopSettings — ใช้ Service Charge Master Data ที่มีอยู่แล้ว (Cashier เลือกจาก dropdown ตอนขอบิล) → snapshot ลง TbOrderBill.ServiceChargeRate
> VatRate = 7% คงที่ (hardcode) ไม่มีหน้าตั้งค่า → snapshot ลง TbOrderBill.VatRate

### 9.8 ER Diagram

```
TbCashierSession (1) ──► TbPayment (N)
                              │
TbOrderBill (1) ──────────────┤ (1-to-1)
                              │
TbFile (1) ◄──────────────────┘ SlipImageFileId

TbCashierSession (1) ──► TbCashDrawerTransaction (N)

TbOrderBill (1) ──► TbOrderDiscount (N)
TbOrderItem (1) ──► TbOrderDiscount (0..1)  ← item-level
```

---

## 10. API Endpoints

### 10.1 Payment (`/api/payment`)

**Controller:** `PaymentController`

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/payment/order/{orderId}` | payment-manage.read | ดู payments ของ order |
| GET | `/api/payment/{paymentId}` | payment-manage.read | ดู payment detail |
| GET | `/api/payment/history` | payment-manage.read | ประวัติ (paginated, filter: วันที่, method, search) |
| POST | `/api/payment/cash` | payment-manage.create | ชำระเงินสด |
| POST | `/api/payment/qr/upload-slip` | payment-manage.create | Upload สลิป + OCR |
| POST | `/api/payment/qr/confirm/{orderBillId}` | payment-manage.update | ยืนยัน QR payment |

### 10.2 Discount (`/api/payment/discount`)

**Controller:** `PaymentController` (sub-route)

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/payment/discount/bill/{orderBillId}` | payment-manage.read | ดูส่วนลดของบิล |
| POST | `/api/payment/discount/item` | payment-manage.create | เพิ่มส่วนลดรายการ |
| POST | `/api/payment/discount/bill` | payment-manage.create | เพิ่มส่วนลดบิล |
| DELETE | `/api/payment/discount/{orderDiscountId}` | payment-manage.update | ลบส่วนลด |

### 10.3 Cashier Session (`/api/cashier-session`)

**Controller:** `CashierSessionController`

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/cashier-session/current` | cashier-session.read | กะปัจจุบัน (OPEN) |
| GET | `/api/cashier-session/history` | cashier-session.read | ประวัติกะ (paginated) |
| GET | `/api/cashier-session/{sessionId}` | cashier-session.read | ดูกะ detail |
| GET | `/api/cashier-session/{sessionId}/summary` | cashier-session.read | สรุปกะ (ยอดขาย, จำนวนบิล, Cash In/Out) |
| GET | `/api/cashier-session/{sessionId}/transactions` | cashier-session.read | รายการเงินเข้า/ออก |
| POST | `/api/cashier-session/open` | cashier-session.create | เปิดกะ |
| POST | `/api/cashier-session/{sessionId}/cash-in` | cashier-session.create | เงินเข้า |
| POST | `/api/cashier-session/{sessionId}/cash-out` | cashier-session.create | เงินออก |
| POST | `/api/cashier-session/{sessionId}/close` | cashier-session.update | ปิดกะ |

### 10.4 Receipt (`/api/receipt`)

**Controller:** `PaymentController` (sub-route)

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/receipt/{paymentId}` | payment-manage.read | ดึงข้อมูลสำหรับสร้างใบเสร็จ (Frontend สร้าง PDF) |

### 10.5 Customer Self-Service (`/api/customer`)

> **เปลี่ยนจาก "ไม่ต้อง auth" เป็น Guest Bearer Token** — ดู [REQ-self-order-system](REQ-self-order-system.md) Section 13, 15

**Controller:** `CustomerController` (endpoints ใช้ `[CustomerAuthorize]` attribute — ตรวจ guest token + session active)

| Method | Route | Auth | รายละเอียด |
|--------|-------|------|-----------|
| GET | `/api/customer/bill` | Guest token | ดูบิลของโต๊ะ (resolve tableId จาก session) |
| POST | `/api/customer/bill/{orderBillId}/upload-slip` | Guest token | Upload สลิป + OCR |
| GET | `/api/customer/bill/{orderBillId}/payment-status` | Guest token | เช็คสถานะการชำระ |

---

## 11. Frontend Pages & Components

### 11.1 Sidebar Menu (เพิ่มในกลุ่ม "ชำระเงิน")

```
ชำระเงิน
  ├── รายการรอชำระ     → /payment
  ├── ประวัติการชำระ     → /payment/history
  └── จัดการกะ          → /payment/cashier-session
```

### 11.2 Routes

| Path | Component | Permission | หมายเหตุ |
|------|-----------|-----------|----------|
| `/payment` | PaymentListComponent | payment-manage.read | รายการบิลรอชำระ |
| `/payment/process/:orderId` | PaymentProcessComponent | payment-manage.create | หน้าชำระเงิน |
| `/payment/history` | PaymentHistoryComponent | payment-manage.read | ประวัติที่จ่ายแล้ว |
| `/payment/receipt/:paymentId` | ReceiptViewComponent | payment-manage.read | ใบเสร็จ PDF |
| `/payment/cashier-session` | CashierSessionComponent | cashier-session.read | กะปัจจุบัน + Cash In/Out |
| `/payment/cashier-session/history` | CashierSessionHistoryComponent | cashier-session.read | ประวัติกะ |

### 11.3 Payment List Page (รายการรอชำระ)

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| เลขบิล | `w-[160px]` | BillNumber |
| โต๊ะ | `w-[100px]` | ชื่อโต๊ะ |
| จำนวนรายการ | `w-[120px]` | count items |
| ยอดรวม | `w-[120px]` | GrandTotal |
| สถานะ | `w-[100px]` | badge (PENDING/PAID) |
| เวลา | `w-[160px]` | CreatedAt |
| ตัวเลือก | `w-[100px]` | ชำระเงิน |

### 11.4 Payment Process Page

**Layout** (อ้างอิงรูป POS ที่ผู้ใช้แชร์ — แบ่ง 2 ฝั่ง):

```
┌─────────────────────────────────────────────────────────────┐
│  Breadcrumb: ชำระเงิน > โต๊ะ A1           [ย้อนกลับ]       │
├──────────────────────────────┬──────────────────────────────┤
│  Card: รายการสั่ง            │  Card: สรุปยอด              │
│  ┌────────────────────────┐  │  รวมอาหาร        430.00    │
│  │ p-table: รายการ        │  │  ส่วนลดรายการ     -26.00   │
│  │ ชื่อ  จำนวน ราคา ส่วนลด│  │  ส่วนลดบิล          0.00  │
│  │ ข้าวผัด ×2  260 [-26] │  │  ────────────────────────   │
│  │ ต้มยำ   ×1  150       │  │  หลังลด           404.00   │
│  │                        │  │  ค่าบริการ(10%)    40.40   │
│  └────────────────────────┘  │  VAT(7%)           31.11   │
│                              │  ════════════════════════   │
│  [+ ส่วนลดบิล]              │  ยอดชำระ          475.51   │
│                              │                            │
│                              │  ── เลือกช่องทาง ──        │
│                              │  [เงินสด]  [QR Payment]    │
│                              │                            │
│                              │  (แสดง keypad/QR ตามเลือก) │
└──────────────────────────────┴──────────────────────────────┘
```

**ถ้าเลือกเงินสด:**
- แสดง keypad ตัวเลข + ปุ่ม Quick Amount
- แสดง "เงินที่รับ" + "เงินทอน" (real-time คำนวณ)
- ปุ่ม "ยืนยันชำระเงิน" (disabled ถ้าเงินไม่พอ)

**ถ้าเลือก QR:**
- แสดง QR Code ร้านค้า (ตัวใหญ่) + ยอดที่ต้องจ่าย
- ปุ่ม "อัปโหลดสลิป" → เปิด SlipUploadDialog
- แสดงสถานะ OCR (กำลังตรวจ / ยอดตรง / ยอดไม่ตรง)
- ปุ่ม "ยืนยันการชำระเงิน" (เปิดหลังตรวจสลิป)

### 11.5 Payment History Page

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| เลขบิล | `w-[160px]` | |
| โต๊ะ | `w-[100px]` | |
| ยอดชำระ | `w-[120px]` | AmountDue |
| ช่องทาง | `w-[120px]` | badge (เงินสด/QR) |
| เงินที่รับ | `w-[120px]` | |
| เงินทอน | `w-[100px]` | |
| แคชเชียร์ | `w-[140px]` | ชื่อพนักงาน |
| วันเวลา | `w-[160px]` | PaidAt |
| ตัวเลือก | `w-[100px]` | ดูใบเสร็จ |

**Filter:** วันที่ (date range), ช่องทาง (dropdown), ค้นหา (เลขบิล/โต๊ะ)

### 11.6 Cashier Session Page

**แสดงกะปัจจุบัน:**
- ข้อมูลกะ: ชื่อแคชเชียร์, เวลาเปิด, เงินเริ่มต้น
- ยอดสรุป: จำนวนบิล, ยอดเงินสด, ยอด QR, ยอดรวม
- รายการ Cash In/Out (p-table)
- ปุ่ม: [เงินเข้า] [เงินออก] [ปิดกะ]

**ถ้ายังไม่เปิดกะ:**
- แสดงข้อความ "ยังไม่เปิดกะ" + ปุ่ม [เปิดกะ]

---

## 12. UserFlow

### 12.1 แคชเชียร์เปิดกะ

1. เข้าหน้า "จัดการกะ" → เห็น "ยังไม่เปิดกะ"
2. กด "เปิดกะ" → Dialog เปิด → กรอกเงินเริ่มต้น (เช่น 2,000 บาท)
3. กด "ยืนยัน" → ระบบสร้าง CashierSession (OPEN) → พร้อมรับชำระ

### 12.2 แคชเชียร์รับเงินสด

1. ได้ noti "ลูกค้าขอเช็คบิล — โต๊ะ A1" (หรือเข้าจากหน้า Payment List)
2. เข้าหน้า Payment Process → เห็นรายการอาหาร + ยอดรวม
3. (ถ้ามีส่วนลด) กดส่วนลดรายการ/บิล → ยอดคำนวณใหม่
4. กด "เงินสด" → keypad ปรากฏ
5. กรอกเงินที่รับ (เช่น 500) → เห็นเงินทอน (24.49)
6. กด "ยืนยันชำระเงิน"
7. Bill → PAID, Order → COMPLETED, Table → CLEANING
8. เห็นหน้าใบเสร็จ → Download PDF / กลับหน้า Payment List

### 12.3 แคชเชียร์รับ QR Payment

1. เหมือน 12.2 ข้อ 1-3
2. กด "QR Payment" → เห็น QR Code ร้าน + ยอด
3. ลูกค้าสแกน + โอน → ลูกค้า/แคชเชียร์ upload สลิป
4. OCR ตรวจ → "ยอดตรง" / "ยอดไม่ตรง" / "ไม่สามารถอ่านได้"
5. แคชเชียร์ตรวจ → กด "ยืนยัน"
6. เหมือนข้อ 7-8

### 12.4 ลูกค้า Self-service QR Payment

1. ลูกค้ากด "ขอเช็คบิล" บน QR Panel (มือถือ)
2. เห็นหน้า **"รอพนักงานจัดเตรียมบิล..."** (loading + ข้อความรอ)
3. แคชเชียร์ได้ noti `REQUEST_BILL` → เข้าหน้า Payment Process
4. แคชเชียร์เลือก ServiceCharge + ใส่ส่วนลด (ถ้ามี) → กด "ยืนยันบิล"
5. ลูกค้าเห็นสรุปรายการ + ยอด + QR Code ร้าน (real-time ผ่าน SignalR)
6. สแกน QR → โอนเงินจาก app ธนาคาร
7. กด "อัปโหลดสลิป" → ถ่ายรูป/เลือกจาก gallery
8. ระบบ OCR ตรวจ → แสดง "กำลังตรวจสอบ..." → "ยอดตรง"
9. แคชเชียร์ noti `SLIP_UPLOADED` → เข้าตรวจ → ยืนยัน
10. ลูกค้าเห็น "ชำระเงินเสร็จสิ้น" (real-time) + ดูใบเสร็จ

### 12.5 Cash In / Cash Out

1. เข้าหน้าจัดการกะ → กด "เงินเข้า" หรือ "เงินออก"
2. Dialog: กรอกจำนวนเงิน + เหตุผล
3. กด "ยืนยัน" → บันทึก + อัพเดตยอดสรุป

### 12.6 ปิดกะ

1. เข้าหน้าจัดการกะ → กด "ปิดกะ"
2. Dialog/Page: ระบบแสดง Expected Cash
3. นับเงินจริง → กรอก Actual Cash
4. เห็น Variance + สรุปกะ (จำนวนบิล, ยอดแยกช่องทาง, Cash In/Out)
5. กด "ยืนยันปิดกะ" → Session → CLOSED

---

## 13. Permissions

| Permission | คำอธิบาย |
|-----------|---------|
| `payment-manage.read` | ดูรายการรอชำระ, ประวัติ, ใบเสร็จ |
| `payment-manage.create` | ชำระเงิน (เงินสด/QR), ใส่ส่วนลด |
| `payment-manage.update` | ยืนยัน QR payment, แก้ไข |
| `payment-manage.delete` | สำรอง (Void — อนาคต) |
| `cashier-session.read` | ดูข้อมูลกะ, ประวัติกะ |
| `cashier-session.create` | เปิดกะ, Cash In/Out |
| `cashier-session.update` | ปิดกะ |

### Migration — Seed Permissions

- Module ใหม่: "จัดการกะ" (`cashier-session`) — 3 permissions (read, create, update)
- Module เดิม: "ชำระเงิน" (`payment-manage`) — **มีอยู่แล้วใน Permissions.cs** แต่ต้อง seed ใน DB ถ้ายังไม่มี

---

## 14. จุดเชื่อมต่อระบบอื่น

| ระบบ | ความสัมพันธ์ |
|------|-------------|
| **Order System** | Bill PENDING → Payment → Bill PAID → Order COMPLETED |
| **Table System** | Payment complete → Table status CLEANING (auto) |
| **NotificationHub** | `REQUEST_BILL` → Cashier group, `SLIP_UPLOADED` → Cashier group, `PAYMENT_COMPLETED` → Floor + Manager group |
| **OrderHub** | ไม่เกี่ยว (OrderHub สำหรับ KDS เท่านั้น) |
| **Shop Settings** | PaymentQrCodeFileId (QR image), ReceiptHeaderText/FooterText (receipt) |
| **Service Charge (Master Data)** | ServiceChargeRate — Cashier เลือกจาก dropdown ตอนขอบิล → snapshot ลง TbOrderBill |
| **File System** | Slip upload → TbFile (S3 storage) |
| **Auth System** | CashierSession ผูกกับ UserId, Cancel ต้อง manager auth |
| **Menu System** | ข้อมูลเมนู (ชื่อ, ราคา) ถูก snapshot ใน OrderItem ก่อนถึง Payment — Payment ใช้ snapshot data |

---

## 15. Notification Events (เพิ่มใหม่)

| Event Type | ชื่อภาษาไทย | Icon | สี | Target Group | Sound | Trigger |
|------------|------------|------|-----|-------------|-------|---------|
| `SLIP_UPLOADED` | ลูกค้าส่งสลิป | `invoice-bill` | เหลือง | Cashier | noti-slip | ลูกค้า upload สลิปผ่าน QR Panel |
| `PAYMENT_COMPLETED` | ชำระเงินเสร็จ | `shopping-basket` | เขียว | Floor + Manager | noti-success | แคชเชียร์ยืนยันการชำระเงิน |

> **หมายเหตุ:** Events เหล่านี้ต้องเพิ่มใน REQ-noti-system.md Section 3 ด้วย

---

## 16. Validation Rules & Error Scenarios

### 16.1 Payment

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| ชำระเงินไม่มีกะเปิด | "กรุณาเปิดกะก่อนรับชำระเงิน" | 422 |
| เงินสด AmountReceived < GrandTotal | "จำนวนเงินที่รับน้อยกว่ายอดชำระ" | 400 |
| Bill ถูกจ่ายแล้ว (status=PAID) | "บิลนี้ชำระเงินแล้ว" | 422 |
| Order ไม่ใช่ BILLING | "ออเดอร์ยังไม่พร้อมชำระ" | 422 |
| สลิปซ้ำ (PaymentReference ซ้ำ) | "สลิปนี้ถูกใช้ไปแล้ว" | 422 |
| ไฟล์สลิปไม่ใช่รูปภาพ | "กรุณาอัปโหลดไฟล์รูปภาพ (JPEG/PNG)" | 400 |

### 16.2 Discount

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| ส่วนลดรายการเกินราคา item | "ส่วนลดเกินราคารายการ" | 400 |
| ส่วนลดบิลเกิน SubTotal | "ส่วนลดเกินยอดรวม" | 400 |
| ส่วนลด % > 100 | "เปอร์เซ็นต์ส่วนลดต้องไม่เกิน 100%" | 400 |
| ส่วนลดค่าลบ | "จำนวนส่วนลดต้องมากกว่า 0" | 400 |
| เพิ่มส่วนลดรายการซ้ำ (item เดิม) | "รายการนี้มีส่วนลดแล้ว" | 422 |
| เพิ่มส่วนลดบิลซ้ำ | "บิลนี้มีส่วนลดแล้ว" | 422 |

### 16.3 Cashier Session

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| เปิดกะซ้อน (มีกะ OPEN อยู่) | "คุณมีกะที่ยังเปิดอยู่ กรุณาปิดกะก่อน" | 422 |
| ปิดกะที่ปิดแล้ว | "กะนี้ปิดไปแล้ว" | 422 |
| Cash In/Out ไม่มีกะเปิด | "กรุณาเปิดกะก่อน" | 422 |
| Opening Cash < 0 | "เงินเริ่มต้นต้องมากกว่าหรือเท่ากับ 0" | 400 |
| Actual Cash < 0 | "ยอดเงินจริงต้องมากกว่าหรือเท่ากับ 0" | 400 |

---

## 17. สรุปไฟล์ที่ต้องสร้าง/แก้ไข

### Backend

| ไฟล์ | หมายเหตุ |
|------|----------|
| `POS.Main.Core/Enums/EPaymentMethod.cs` | Enum |
| `POS.Main.Core/Enums/ECashierSessionStatus.cs` | Enum |
| `POS.Main.Core/Enums/ECashDrawerTransactionType.cs` | Enum |
| `POS.Main.Core/Enums/EDiscountType.cs` | Enum |
| `POS.Main.Core/Enums/ESlipVerificationStatus.cs` | Enum |
| `POS.Main.Dal/Entities/Payment/TbPayment.cs` | Entity |
| `POS.Main.Dal/Entities/Payment/TbCashierSession.cs` | Entity |
| `POS.Main.Dal/Entities/Payment/TbCashDrawerTransaction.cs` | Entity |
| `POS.Main.Dal/Entities/Order/TbOrderDiscount.cs` | Entity |
| `POS.Main.Dal/EntityConfigurations/` | 4 configuration files |
| `POS.Main.Repositories/` | 4 repository interfaces + implementations |
| `POS.Main.Business.Payment/` | PaymentService, CashierSessionService, DiscountService, SlipOcrService |
| `RBMS.POS.WebAPI/Controllers/PaymentController.cs` | Payment + Discount + Receipt endpoints |
| `RBMS.POS.WebAPI/Controllers/CashierSessionController.cs` | Cashier Session endpoints |
| `RBMS.POS.WebAPI/Controllers/CustomerOrderController.cs` | แก้ไข — เพิ่ม bill/slip endpoints |
| Migration | สร้างตาราง + เพิ่ม fields TbOrderBill + TbShopSettings + seed permissions |

### Frontend

| Component | หมายเหตุ |
|-----------|----------|
| `PaymentListComponent` | รายการบิลรอชำระ |
| `PaymentProcessComponent` | หน้าชำระเงิน (keypad + QR + discount) |
| `PaymentHistoryComponent` | ประวัติการชำระเงิน |
| `ReceiptViewComponent` | แสดง + download PDF ใบเสร็จ |
| `CashierSessionComponent` | จัดการกะปัจจุบัน |
| `CashierSessionHistoryComponent` | ประวัติกะ |
| `DiscountDialogComponent` | Dialog ใส่ส่วนลด (item/bill) |
| `OpenShiftDialogComponent` | Dialog เปิดกะ |
| `CloseShiftDialogComponent` | Dialog ปิดกะ |
| `CashDrawerDialogComponent` | Dialog เงินเข้า/ออก |
| `SlipUploadDialogComponent` | Dialog upload สลิป |
| `CustomerBillViewComponent` | หน้าดูบิล (QR Panel, mobile) |
| `CustomerSlipUploadComponent` | หน้า upload สลิป (QR Panel, mobile) |
