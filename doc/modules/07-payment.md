# Module 7: Payment (ชำระเงิน + รอบขายแคชเชียร์ + OCR สลิป + ใบเสร็จ)

> Closing Module — ปิดวงจรการขาย โดยขึ้นอยู่กับ Order (รับบิล) และ Admin/Cashier (รอบขาย)

---

## 1. Module นี้คืออะไร

ระบบจัดการการชำระเงินของลูกค้า ครอบคลุม:

| ส่วน | ทำอะไร |
| --- | --- |
| **Payment** | บันทึกการชำระเงิน (เงินสด / QR / สลิปโอน) |
| **Cashier Session** | รอบการขาย — เปิดกะ ปิดกะ คำนวณยอดเงินในลิ้นชัก |
| **Cash Drawer Transaction** | เงินสดเข้า-ออกลิ้นชักระหว่างกะ (Cash In / Cash Out) |
| **Slip OCR** | อ่านยอดเงิน + วันที่ + เลขบัญชีปลายทาง จากสลิปโอนเงิน |
| **Receipt** | สร้างข้อมูลใบเสร็จ + ใบเสร็จรวมทั้งออเดอร์ (Consolidated) |
| **Payment History** | ประวัติการชำระเงินย้อนหลัง พร้อม Filter |

---

## 2. ช่วยธุรกิจร้านอาหารในเรื่องใด

| ปัญหาแบบดั้งเดิม | สิ่งที่ระบบนี้แก้ |
| --- | --- |
| รับเงินสด → จดในกระดาษ → นับเงินตอนปิดร้านยุ่งยาก | ระบบบันทึกทุกการรับเงิน + คำนวณยอดให้อัตโนมัติ |
| ตอนปิดกะ ยอดเงินไม่ตรง — หาที่มาไม่ได้ | บันทึกเงินสดเข้า-ออกลิ้นชักทุกครั้ง + เปรียบเทียบยอดคาดหวัง vs ยอดจริง |
| ลูกค้าโอน QR → พนักงานต้องดูสลิปเอง อาจสลิปปลอม | OCR อ่านสลิป + เปรียบเทียบยอด/วันที่/บัญชีปลายทาง อัตโนมัติ |
| คนละกะกัน → ไม่รู้ใครรับเงินไป | ผูก Payment กับ CashierSession → ตรวจสอบผู้รับเงินผ่าน Session.User.Employee ได้ |
| ใบเสร็จเขียนมือ → อ่านไม่ออก, เสียเวลา | สร้างข้อมูลใบเสร็จในระบบ พิมพ์/ดาวน์โหลดได้ |
| ลูกค้าจ่ายเงินสด + ทอน → คำนวณผิดบ่อย | ระบบคำนวณเงินทอนอัตโนมัติ (AmountReceived - GrandTotal = ChangeAmount) |
| ลูกค้ามีหลายบิล (Split) → ออกใบเสร็จแยกๆ ลำบาก | Consolidated Receipt: ใบเสร็จรวมทุกบิลของออเดอร์ |
| จะปิดกะ แต่ยังมีออเดอร์ค้าง → ปิดไปแล้วยอดไม่ตรง | ระบบเช็คก่อนปิดกะ + รวมยอดจาก Payment ทั้งหมดในกะ |

**คุณค่าทางธุรกิจ**: ลดเงินขาด/เงินเกินตอนปิดกะ + ตรวจจับสลิปปลอมได้ + ออกใบเสร็จมาตรฐาน + รู้ยอดขายจริงรายกะ

---

## 3. Business Logic หลัก

### 3.1 วิธีการชำระเงิน (Payment Methods)

```
EPaymentMethod
├── Cash       (เงินสด)
└── QrPayment  (สแกน QR — แสดง PromptPay หรือเลขบัญชีของร้าน ตาม ShopSettings)
```

> ระบบไม่ได้แยก enum สำหรับ PromptPay/Bank — ใช้ enum เดียว (QrPayment) แล้วร้านกำหนดว่าจะให้ลูกค้าโอนผ่าน PromptPay หรือบัญชีธนาคารผ่าน Shop Settings

### 3.2 Flow การชำระเงินสด

```
1. ลูกค้าขอบิล → Order.Status = Billing, สร้าง OrderBill (Status = Pending)
2. แคชเชียร์ → /payment/checkout/{orderId}
3. ตรวจสอบ Cashier Session:
   ─ ต้องมีกะที่เปิดอยู่ (Status = Open) ของแคชเชียร์คนปัจจุบัน
   ─ ถ้าไม่มี → ปฏิเสธ "กรุณาเปิดกะก่อนรับเงิน"
4. กรอกยอดที่ลูกค้าให้ (AmountReceived)
5. ระบบเช็ค: AmountReceived ≥ GrandTotal? ถ้าไม่พอ → ปฏิเสธ
6. คำนวณ ChangeAmount = AmountReceived - GrandTotal
7. สร้าง TbPayment:
   ─ ผูกกับ OrderBill + CashierSession (CashierSession → User → Employee → รู้ว่าใครรับเงิน)
   ─ PaymentMethod = Cash
8. อัพเดต OrderBill.Status = Paid + PaidAt = now
9. ถ้าทุกบิลของ Order ถูก Paid → Order.Status = Completed + Table.Status = Cleaning
10. SignalR broadcast "PaymentCompleted"
11. แสดงเงินทอน + ตัวเลือกพิมพ์ใบเสร็จ
```

### 3.3 Flow การชำระเงิน QR (มีระบบ OCR)

```
1. ลูกค้าขอบิล → ดู QR ของร้านที่หน้าจอ (แสดง PromptPay หรือ QR Bank)
2. ลูกค้าโอนเงิน → ได้สลิป
3. ลูกค้าส่งสลิป (ผ่าน Mobile Web Upload หรือพนักงานสแกนจากโทรศัพท์ลูกค้า)
4. ระบบ OCR สลิป:
   ─ อ่านยอดเงิน → เปรียบเทียบกับ GrandTotal
   ─ อ่านวันที่ → เช็คว่าเป็นวันนี้ไหม
   ─ อ่านเลขบัญชี/เบอร์ PromptPay ปลายทาง → เปรียบเทียบกับ ShopSettings
   ─ ผลลัพธ์: Pending / Verified / Rejected
5. ถ้า Auto-Matched → แคชเชียร์กดยืนยัน → สร้าง Payment + Bill.Status = Paid
6. ถ้า Mismatch → แคชเชียร์ตรวจสอบเอง → เลือกยืนยันหรือปฏิเสธ
```

### 3.4 Cashier Session (รอบขาย)

```
สถานะ Cashier Session
├── Open    (เปิดกะอยู่ — รับเงินได้)
└── Closed  (ปิดกะแล้ว — รับเงินไม่ได้ ต้องเปิดใหม่)
```

**Lifecycle:**

```
[เปิดกะ] เริ่มต้นรอบขาย
  │
  │ - กรอก OpeningBalance (เงินเริ่มต้นในลิ้นชัก)
  │ - กำหนด ShiftPeriod (Morning / Evening / Night ฯลฯ)
  │ - 1 พนักงานเปิดกะได้ทีละ 1 กะเท่านั้น
  ▼
[ระหว่างกะ] ทำงานปกติ
  │
  │ - รับเงินจากลูกค้า → สร้าง Payment ผูกกับ Session
  │ - Cash In: เติมเงินทอนเข้าลิ้นชัก
  │ - Cash Out: เบิกเงินจากลิ้นชัก (เช่น จ่ายค่าใช้จ่าย)
  │ - แก้ไข/ลบ Cash Drawer Transaction ก่อนปิดกะได้
  ▼
[ปิดกะ] สรุปรอบขาย
  │
  │ - กรอก ClosingBalance (เงินจริงที่นับได้ในลิ้นชัก)
  │ - ระบบคำนวณ ExpectedBalance:
  │   ExpectedBalance = OpeningBalance
  │                   + ΣCashPayments (เงินสดที่รับ)
  │                   + ΣCashIn
  │                   - ΣCashOut
  │ - คำนวณ Difference = ClosingBalance - ExpectedBalance
  │   - = 0 → ตรงพอดี
  │   - > 0 → เงินเกิน
  │   - < 0 → เงินขาด
  ▼
[Closed]
```

### 3.5 Slip OCR

ใช้ Pattern Matching + Regex อ่านสลิปจากธนาคารยอดนิยม:

| ฟิลด์ที่อ่าน | ใช้ทำอะไร |
| --- | --- |
| **ยอดเงิน** | เปรียบเทียบกับ GrandTotal ของบิล |
| **วันที่โอน** | เช็คว่าเป็นวันปัจจุบัน (กันสลิปเก่า) |
| **เลขบัญชี/PromptPay ปลายทาง** | เปรียบเทียบกับเลขบัญชี/PromptPay ของร้าน (ShopSettings) |

**สถานะ Verification** (`ESlipVerificationStatus`):
- `None` — ยังไม่ผ่าน OCR
- `Matched` — OCR ตรวจครบทุกจุด (ยอด + วันที่ + เลขบัญชี/PromptPay ตรง)
- `Mismatched` — OCR อ่านได้ แต่บางจุดไม่ตรง (เช่น ยอดผิด หรือบัญชีผิด)
- `Manual` — แคชเชียร์ยืนยันด้วยมือ (override OCR)

### 3.6 Receipt (ใบเสร็จ)

**2 รูปแบบ:**
1. **Receipt ต่อบิล** — ใบเสร็จของบิลเดียว (ใช้กรณี Split Bill)
2. **Consolidated Receipt** — ใบเสร็จรวมทุกบิลของออเดอร์ (สำหรับลูกค้าที่ต้องการใบเดียว)

**ข้อมูลในใบเสร็จ:**
- ข้อมูลร้าน (ดึงจาก ShopSettings): ชื่อ, ที่อยู่, เลขผู้เสียภาษี
- รายการอาหารทั้งหมด (ชื่อ + จำนวน + ราคา) + Options
- ค่าบริการ (Service Charge) + VAT
- ยอดสุทธิ
- วิธีการชำระเงิน (Cash / QR)
- เงินทอน (ถ้าจ่ายสด)
- ผู้รับเงิน (พนักงานที่เปิดกะ — lookup จาก CashierSession.User.Employee)

---

## 4. Workflow การทำงานจริง

### Workflow A — แคชเชียร์เปิดกะตอนเช้า

```
1. แคชเชียร์ล็อกอิน → /payment/cashier (หรือคล้ายๆ)
2. ระบบเช็ค: มี Cashier Session ที่ Open อยู่ไหม? ไม่มี → แสดงปุ่ม "เปิดกะ"
3. กด "เปิดกะ"
   ─ Opening Balance: 2,000 บาท (เงินทอนเริ่มต้น)
   ─ Shift Period: Morning
4. ระบบสร้าง TbCashierSession + Status = Open
5. ระบบให้แคชเชียร์รับเงินได้
```

### Workflow B — รับชำระเงินสดจากลูกค้า

```
1. ลูกค้าขอบิล (จาก Order/SelfOrder)
2. แคชเชียร์ → /payment/checkout/{orderId}
3. หน้าจอแสดง: GrandTotal = 487 บาท
4. เลือก "ชำระเงินสด"
5. กรอก AmountReceived: 500 บาท
6. ระบบคำนวณ ChangeAmount = 13 บาท
7. กดยืนยัน → ระบบ:
   ─ สร้าง TbPayment (PaymentMethod = Cash, ผูกกับ CashierSessionId — รู้ผู้รับเงินผ่าน Session → User → Employee)
   ─ Bill.Status = Paid
   ─ Order.Status = Completed (ถ้าทุกบิลจ่ายแล้ว)
   ─ Table.Status = Cleaning
   ─ SignalR broadcast "PaymentCompleted"
8. แสดงเงินทอน → พิมพ์ใบเสร็จ (Optional)
```

### Workflow C — รับชำระเงิน QR + Upload Slip

```
1. ลูกค้าขอบิล → เลือก QR Payment
2. ระบบแสดง QR ของร้าน (PromptPay หรือ Bank — จาก ShopSettings)
3. ลูกค้าโอนเงิน → ได้สลิป
4. ลูกค้าอัพโหลดสลิปจาก Mobile Web:
   ─ POST /api/customer/{qrToken}/upload-slip
5. ระบบ OCR สลิป:
   ─ ยอดเงิน: 487 บาท ✓ (ตรงกับ GrandTotal)
   ─ วันที่: 30 พ.ค. 2569 ✓ (เป็นวันนี้)
   ─ เลขบัญชี: 123-4-56789-0 ✓ (ตรงกับ ShopSettings)
   ─ สถานะ: Verified
6. SignalR แจ้งแคชเชียร์ "SlipUploaded"
7. แคชเชียร์ดูสลิปในระบบ + กดยืนยัน
8. ระบบสร้าง Payment + Bill.Status = Paid + Order.Status = Completed
```

### Workflow D — Cash In / Cash Out ระหว่างกะ

```
สถานการณ์: แคชเชียร์ต้องเบิกเงิน 500 บาท ไปจ่ายค่าผัก
1. แคชเชียร์ → กด "เงินออก"
2. Dialog:
   ─ Amount: 500 บาท
   ─ Reason: "จ่ายค่าผัก"
3. บันทึก → TbCashDrawerTransaction (Type = CashOut)
4. ระบบลด ExpectedBalance ของกะปัจจุบันลง 500 บาท

(ตรงข้าม Cash In = เติมเงินทอน, เช่น เปิดธนบัตรใบใหญ่)
```

### Workflow E — ปิดกะตอนเย็น

```
1. แคชเชียร์ → กด "ปิดกะ"
2. ระบบแสดงสรุป:
   ─ Opening Balance: 2,000
   ─ Cash Payments: 12,450 (รวม 18 ออเดอร์)
   ─ Cash In: 1,000
   ─ Cash Out: -500
   ─ Expected Balance: 14,950
3. แคชเชียร์นับเงินจริงในลิ้นชัก: 14,930
4. กรอก ClosingBalance: 14,930
5. ระบบคำนวณ Difference = 14,930 - 14,950 = -20 (เงินขาด 20 บาท)
6. กดยืนยันปิดกะ → Status = Closed + บันทึก Difference
7. แคชเชียร์เห็นข้อความ "เงินขาด 20 บาท — กรุณาตรวจสอบ"
```

### Workflow F — แก้ไข/ลบ Cash Drawer Transaction

```
สถานการณ์: บันทึก Cash In ผิด (ใส่ 100 แทน 1000)
1. แคชเชียร์ → ดูรายการ Cash Drawer ในกะปัจจุบัน
2. กดแก้ไขรายการที่ผิด → เปลี่ยนยอด → บันทึก
3. ระบบคำนวณ ExpectedBalance ใหม่
4. (หรือถ้าผิดทั้งรายการ → กดลบ → ระบบลบและคำนวณใหม่)
```

### Workflow G — ดูประวัติการชำระเงิน

```
1. /payment/payment-history → เห็นรายการทุก Payment
2. Filter: วันที่ + วิธีการชำระ + พนักงาน
3. กดดูรายละเอียดแต่ละ Payment:
   ─ ยอด + บิล + ออเดอร์ + โต๊ะ + พนักงาน + เวลา
4. กดดูใบเสร็จ → /payment/{paymentId}/receipt
```

### Workflow H — ออกใบเสร็จรวมทั้งออเดอร์

```
สถานการณ์: ลูกค้าแยกบิล 4 บิล แต่ขอใบเสร็จเดียว
1. ทุกบิลจ่ายแล้ว
2. /payment/order/{orderId}/consolidated-receipt
3. ระบบรวมทุกบิล + คำนวณยอดรวม + รายการรวม
4. ส่งข้อมูลให้ Frontend → กดพิมพ์ PDF
```

---

## 5. ข้อดี

| ข้อดี | คำอธิบาย |
| --- | --- |
| **บังคับเปิดกะก่อนรับเงิน** | ป้องกันรับเงินนอกระบบ → audit ครบ |
| **OCR สลิปอัตโนมัติ** | ลดเวลาตรวจสลิป + จับสลิปปลอม (วันผิด, ยอดผิด, บัญชีผิด) |
| **คำนวณ ExpectedBalance อัตโนมัติ** | ไม่ต้องนับเอง — รู้ทันทีว่าควรมีเงินเท่าไหร่ในลิ้นชัก |
| **Cash In/Out tracking** | เงินสดเข้า-ออกลิ้นชักทุกครั้งบันทึก → ปิดกะไม่งง |
| **Difference visibility** | เงินขาด/เกินเห็นชัด → ตรวจสอบได้ |
| **Multi-payment ต่อ Order** | รองรับ Split Bill (1 ออเดอร์ = หลาย Payment) |
| **Consolidated Receipt** | ลูกค้าที่ Split Bill ขอใบเสร็จเดียวได้ |
| **ผูก Payment กับ Session** | ตรวจสอบผู้รับเงินผ่าน CashierSession.User.Employee — รู้ใครรับเงินตอนไหน |
| **Real-time Update** | Payment สำเร็จ → Table เปลี่ยน Cleaning + ลูกค้า Mobile Web เห็น "ขอบคุณ" |
| **รองรับ Payment Method หลัก** | Cash + QrPayment (ที่หน้าจอลูกค้าเลือกได้ว่าจะโอน PromptPay หรือบัญชีธนาคารตามที่ร้านตั้งใน ShopSettings) |
| **Transaction-safe** | ใช้ BeginTransactionAsync → Atomic operation ป้องกันยอดไม่ตรง |

---

## 6. ข้อเสีย / ข้อจำกัด

| ข้อจำกัด | ผลกระทบ + วิธีรับมือ |
| --- | --- |
| **OCR ไม่ 100%** | ขึ้นกับคุณภาพรูปสลิป + รูปแบบของธนาคาร — อาจต้อง manual review |
| **OCR รองรับเฉพาะธนาคารหลัก** | ธนาคารใหม่ๆ อาจต้องเพิ่ม pattern เอง |
| **1 พนักงาน 1 กะเท่านั้น** | แคชเชียร์คนเดียวเปิด 2 เครื่องไม่ได้ |
| **ปิดกะแล้วแก้ไม่ได้** | ถ้าพบเงินผิดทีหลัง → ต้องไปจัดการนอกระบบ |
| **ไม่มีระบบ Refund** | ลูกค้าขอคืนเงิน → ไม่มี API รองรับ → ต้องใช้ Void Bill + ออกเงินสดเอง |
| **ไม่รองรับ Credit Card** | ระบบไม่มี Payment Gateway — รองรับแค่ Cash + QR |
| **ไม่มี Tip Tracking** | ลูกค้าให้ทิป → ไม่มีช่องบันทึก |
| **ใบเสร็จไม่มีเลขที่ใบกำกับภาษี** | ไม่รองรับ e-Tax invoice — ต้องเสริมเอง |
| **Cash Drawer แก้ไขได้ก่อนปิดกะเท่านั้น** | ถ้าปิดกะแล้วผิด → แก้ไม่ได้ |
| **OCR วิเคราะห์ภาษาไทยจำกัด** | สลิปบางธนาคารที่ใช้ฟอนต์พิเศษ → อาจอ่านไม่ออก |
| **AmountReceived ห้ามน้อยกว่า GrandTotal** | ไม่รองรับ "บางส่วน" → จ่ายเป็นงวด ต้องใช้วิธีอื่น |

---

## 7. ความสัมพันธ์กับ Module อื่น

### Module นี้ส่งข้อมูลไปให้ใคร

| Module ปลายทาง | ส่งอะไรไป | ใช้ทำอะไร |
| --- | --- | --- |
| **Order** | Bill.Status = Paid → Order.Status = Completed | เปลี่ยนสถานะออเดอร์เมื่อจ่ายครบ |
| **Table** | event "PaymentCompleted" | Table.Status → Cleaning |
| **Notification** | "PaymentCompleted", "SlipUploaded" | broadcast SignalR ไปกลุ่ม floor / table_{tableId} |
| **Dashboard** | จำนวน Payment + ยอดเงิน | ใช้คำนวณยอดขายรายวัน/รายเดือน |
| **Self-Order Mobile** | สถานะ Bill เปลี่ยน | Mobile Web แสดง "ขอบคุณค่ะ" |

### Module นี้ดึงข้อมูลจากใคร

| Module ต้นทาง | ดึงอะไรมา | ใช้ทำอะไร |
| --- | --- | --- |
| **Order** | OrderBill (Status = Pending) | รับชำระเงิน |
| **Order** | OrderItem (สำหรับใบเสร็จ) | แสดงรายการในใบเสร็จ |
| **Admin (CashierSession)** | กะปัจจุบันที่ Open | บังคับเปิดกะก่อนรับเงิน |
| **Admin (ShopSettings)** | ข้อมูลร้าน (ชื่อ, ที่อยู่, เลขผู้เสียภาษี) | แสดงในใบเสร็จ |
| **Admin (ShopSettings)** | เลขบัญชี + PromptPay + ธนาคาร | OCR เปรียบเทียบบัญชีปลายทาง |
| **Admin (File)** | FileId | เก็บอ้างอิงรูปสลิป (S3) |
| **Human Resource** | EmployeeId (ผ่าน TbUser → TbEmployee) | ระบุผู้เปิดกะ (CashierSession) → Payment สืบทอดผู้รับเงินจาก Session |
| **Authorization** | สิทธิ์ของผู้ใช้ | ตรวจว่าใครรับเงิน/ปิดกะได้ |

---

## 8. สรุปสำหรับรายงาน (1 ย่อหน้า)

> Module Payment เป็นโมดูลปิดวงจรการขายของระบบ RBMS-POS ที่จัดการการชำระเงินครบทุกรูปแบบ ทั้งเงินสด, PromptPay, และโอนผ่านบัญชีธนาคาร โดยมีระบบ Cashier Session ที่บังคับให้แคชเชียร์ต้องเปิดกะก่อนรับเงินทุกครั้ง พร้อมการบันทึกเงินสดเข้า-ออกลิ้นชัก (Cash In/Out) และคำนวณ Expected Balance vs Actual Balance ตอนปิดกะอัตโนมัติเพื่อช่วยตรวจจับเงินขาด-เงินเกิน จุดเด่นที่สำคัญคือระบบ OCR สลิปที่อ่านยอดเงิน วันที่โอน และเลขบัญชีปลายทางจากสลิปของลูกค้าที่อัพโหลด แล้วเปรียบเทียบกับข้อมูลร้านในระบบโดยอัตโนมัติ ช่วยลดเวลาในการตรวจสลิปและลดความเสี่ยงจากสลิปปลอม นอกจากนี้ยังรองรับการชำระเงินแบบแยกบิล (Multiple Payments per Order) และสามารถออกใบเสร็จรวมทั้งออเดอร์ (Consolidated Receipt) สำหรับลูกค้าที่ Split Bill แต่ต้องการใบเสร็จใบเดียว ทุกการชำระเงินสำเร็จจะ broadcast SignalR ทำให้ Mobile Web ของลูกค้าเห็น "ขอบคุณ" ทันที และโต๊ะเปลี่ยนสถานะเป็น Cleaning อัตโนมัติ
