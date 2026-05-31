# Module 6: Order (สั่งอาหาร + ครัว + Self-Order + แยกบิล)

> **หัวใจของระบบ** — เป็น Core Business Module ที่เชื่อมทุก Module เข้าด้วยกัน ตั้งแต่เมนู โต๊ะ พนักงาน ลูกค้า และจบที่การชำระเงิน

---

## 1. Module นี้คืออะไร

ระบบจัดการ "การสั่งอาหาร" ของร้านอาหาร ครอบคลุมทุกขั้นตอนตั้งแต่:

| ส่วน | ทำอะไร |
| --- | --- |
| **Order** | ออเดอร์หลักของลูกค้าในแต่ละโต๊ะ |
| **Order Item** | รายการอาหารแต่ละชิ้นในออเดอร์ (พร้อม Options) |
| **Order Bill** | บิล (รองรับ 1 ออเดอร์ → หลายบิล กรณีแยกบิล) |
| **Kitchen Display (KDS)** | หน้าจอครัวแสดงรายการที่ต้องทำ แยกตามสถานี |
| **Self-Order (Customer)** | ลูกค้าสั่งอาหารเองผ่าน QR Code |
| **Split Bill** | แยกบิลตามรายการ หรือตามจำนวนเงิน |
| **Link Order** | ออเดอร์รวมจากการเชื่อมโต๊ะ |

---

## 2. ช่วยธุรกิจร้านอาหารในเรื่องใด

| ปัญหาแบบดั้งเดิม | สิ่งที่ระบบนี้แก้ |
| --- | --- |
| พนักงานจดออเดอร์ในกระดาษ → ครัวอ่านไม่ออก สั่งผิด | สั่งในระบบ → ครัวเห็นชัดเจน แยกตามสถานี (อาหาร/เครื่องดื่ม/ของหวาน) |
| ลูกค้าต้องเรียกพนักงาน → รอคิว | Self-Order: ลูกค้าสแกน QR สั่งเองได้ทันที |
| รายการอาหารหายระหว่างทาง (จากโต๊ะ → ครัว) | ทุกรายการบันทึกในระบบ + ติดตามสถานะแต่ละชิ้นได้ |
| ครัวทำเสร็จ → ไม่รู้ใครเป็นเจ้าของ → ขนของผิดโต๊ะ | ทุกรายการผูกกับโต๊ะ + แจ้งเตือนพนักงานเสิร์ฟเมื่อพร้อม |
| ลูกค้าอยากแยกบิล (จ่ายแยกกัน) → คำนวณเองยาก | Split Bill อัตโนมัติ ทั้งแบบเลือกรายการ หรือหารเท่ากัน |
| ยกเลิกรายการที่ทำไปแล้ว → ครัวเสียของฟรี | บันทึก Cancel + เหตุผล + ใครเป็นคนยกเลิก |
| ลูกค้ามากลุ่มใหญ่ ต้องรวมโต๊ะ → คำนวณบิลรวมยาก | Link Tables → ออเดอร์ Merge → บิลเดียว |
| ครัวบอกอาหารพร้อม → พนักงานเสิร์ฟไม่รู้ → เย็นชืด | SignalR แจ้งทันทีเมื่อสถานะเปลี่ยน |
| ลูกค้าถามว่าอาหารทำเสร็จยัง → ต้องเดินถามครัว | Mobile Web Self-Order Tracking — ลูกค้าเห็นสถานะ Real-time |
| ขอเรียกพนักงาน/ขอบิล ต้องโบกมือ | Mobile Web มีปุ่ม Call Waiter + Request Bill ส่งเข้าระบบทันที |

**คุณค่าทางธุรกิจ**: ลดความผิดพลาดในการสั่งอาหาร + ลดแรงงานพนักงานเสิร์ฟ + เพิ่ม Turnover ของโต๊ะ + ทำให้ลูกค้าได้ประสบการณ์ที่ทันสมัย

---

## 3. Business Logic หลัก

### 3.1 โครงสร้าง Order

```
TbOrder (ออเดอร์หลัก — 1 ออเดอร์ต่อ 1 รอบของลูกค้าในโต๊ะ)
├── OrderNumber: เลขออเดอร์ (เช่น "20260530-001")
├── TableId: ผูกกับโต๊ะ
├── Status: Open / Billing / Completed
├── GuestCount: จำนวนลูกค้า
├── SubTotal: ยอดรวม (อัพเดตทุกครั้งที่เพิ่ม/ลบรายการ)
└── Note: หมายเหตุของออเดอร์
     │
     ├── TbOrderItem (รายการอาหาร — 1:M)
     │   ├── MenuId + ชื่อเมนู (snapshot ไทย/อังกฤษ)
     │   ├── CategoryType (1=อาหาร, 2=เครื่องดื่ม, 3=ของหวาน) → ส่งครัวสถานีที่เกี่ยวข้อง
     │   ├── Quantity + UnitPrice + OptionsTotalPrice + TotalPrice
     │   ├── Status: Pending / Sent / Preparing / Ready / Served / Voided / Cancelled
     │   ├── OrderedBy: ผู้สั่ง — พนักงาน = nickname ของพนักงาน, ลูกค้า Self-Order = `"customer:{sessionId}"` (lookup nickname จาก CustomerSession ฝั่ง Frontend)
     │   ├── Timestamps: SentToKitchenAt, CookingStartedAt, ReadyAt, ServedAt
     │   ├── CancelledBy (ถ้ายกเลิก) + CancelReason
     │   ├── CostPrice (snapshot ต้นทุน)
     │   ├── SourceTableId (กรณี Link Tables — โต๊ะต้นทาง)
     │   ├── OrderBillId (NULL ถ้ายังไม่ split)
     │   │
     │   └── TbOrderItemOption (M:M Option ที่ลูกค้าเลือก)
     │       ├── OptionGroupId + OptionItemId
     │       ├── ชื่อ Snapshot (กลุ่ม + ตัวเลือก)
     │       └── AdditionalPrice + CostPrice
     │
     └── TbOrderBill (บิล — 1:M, รองรับ Split)
         ├── BillNumber + BillType (Full / SplitByItem / SplitByAmount)
         ├── SubTotal + TotalDiscountAmount + NetAmount
         ├── ServiceChargeRate + ServiceChargeAmount + VatRate + VatAmount
         ├── GrandTotal: ยอดที่ลูกค้าต้องจ่าย
         ├── Status: Pending / Paid / Cancelled / Voided
         ├── SplitCount + SplitIndex
         ├── (Self-Order) ClaimedBySessionId, ClaimPaymentMethod
         └── (Self-Order) CustomerSlipFileId + OCR fields
```

### 3.2 Order State Machine

```
[เปิดโต๊ะ]
   │ (สร้าง Order ใหม่ Status = Open)
   ▼
 Open ◄────────────────┐
   │                   │ (void-bill)
   │ (request-bill)    │
   ▼                   │
 Billing ─────────────►┘
   │
   │ (Payment success)
   ▼
 Completed (จบ)
```

### 3.3 OrderItem State Machine

```
 Pending  (เพิ่มเข้า cart, ยังไม่ส่งครัว)
    │
    │ (void) ───────► Voided  (ก่อนส่งครัว ไม่ต้องเหตุผล)
    │
    │ (send-kitchen)
    ▼
 Sent  (ครัวเห็นในจอ KDS)
    │   │
    │   │ (cancel + เหตุผล) ──► Cancelled
    │
    │ (prepare)
    ▼
 Preparing  (ครัวกำลังทำ)
    │   │
    │   │ (cancel + เหตุผล) ──► Cancelled
    │
    │ (ready) ─── พร้อมเสิร์ฟ
    ▼
 Ready  (ยกเลิกไม่ได้แล้ว — ต้องเสิร์ฟ)
    │
    │ (serve) ─── เสิร์ฟแล้ว
    ▼
 Served
```

> **กฎ Cancel**: ยกเลิกได้เฉพาะตอน Status = `Sent` หรือ `Preparing` เท่านั้น
> เมื่อครัวกด "พร้อมเสิร์ฟ" (Ready) แล้ว → **ยกเลิกไม่ได้** ต้องเสิร์ฟก่อน (เพราะของเสียแล้ว)

### 3.4 Kitchen Display System (KDS)

- KDS แยก **3 สถานี**: อาหาร / เครื่องดื่ม / ของหวาน (Permission แยก)
- ครัวแต่ละสถานีเห็นเฉพาะ items ที่ `CategoryType` ตรงกับสถานี + status = Sent / Preparing
- กดเริ่มทำ → status = Preparing + บันทึก CookingStartedAt
- กดพร้อมเสิร์ฟ → status = Ready + บันทึก ReadyAt + SignalR แจ้งพนักงานเสิร์ฟ

### 3.5 Split Bill (แยกบิล)

**Split by Item** (แยกตามรายการ):
```
ลูกค้า: "ฉันจ่าย ผัดไท + น้ำเปล่า, เพื่อนจ่าย ส้มตำ + ชา"
1. พนักงาน → กด "แยกบิล" → Split By Item
2. เลือกรายการใส่ในบิลที่ 1: ผัดไท + น้ำเปล่า
3. เลือกรายการใส่ในบิลที่ 2: ส้มตำ + ชา
4. ระบบสร้าง 2 บิล + คำนวณ ServiceCharge/VAT แยกต่อบิล
5. OrderItem.OrderBillId อัพเดตชี้ไปบิลที่ตัวเองอยู่
```

**Split by Amount** (หารเท่ากัน):
```
ลูกค้า 4 คน: "หาร 4 เท่าๆ กัน"
1. พนักงาน → กด "แยกบิล" → Split By Amount → กรอก 4
2. ระบบสร้าง 4 บิล ยอดเท่ากัน (เก็บ GrandTotal / 4)
3. ลูกค้าจ่ายทีละบิล
```

**Unsplit** (รวมบิลกลับ):
- ถ้ายังไม่มีบิลไหน Paid → กด "ยกเลิกแยกบิล" → ลบบิลย่อย รวมกลับเป็นบิลเดียว
- ถ้าบางบิลจ่ายแล้ว → ห้าม Unsplit

### 3.6 Self-Order (ลูกค้าสั่งเอง)

**Flow:**
1. ลูกค้าสแกน QR ที่โต๊ะ → ระบบ Redirect ไป Mobile Web
2. ระบบตรวจ QR Token (อายุ 12 ชม.) → สร้าง CustomerSession
3. ลูกค้าตั้งชื่อเล่น → เริ่มเลือกเมนู
4. ลูกค้ากด "สั่ง" → ระบบสร้าง OrderItem พร้อม `OrderedBy = "customer:{sessionId}"` (เก็บ session ID ของลูกค้า — Frontend แสดงเป็น nickname ได้โดย lookup จาก CustomerSession)
5. แต่ละ Device มี CustomerSession แยกกัน → ลูกค้าหลายคนสั่งพร้อมกันได้
6. ลูกค้ากดดูสถานะออเดอร์ → เห็น Real-time (Pending / Sent / Preparing / Ready / Served)
7. ลูกค้ามีปุ่มพิเศษ:
   - **Call Waiter** — เรียกพนักงาน
   - **Request Bill** — ขอบิล (Order → Billing)
   - **Request Cash** — แจ้งจะชำระเงินสด
   - **Request Split Bill** — ขอแยกบิล

### 3.7 Bill Claim (Multi-Device Protection)

ลูกค้าหลายคนใช้ device แยก → ป้องกันการอัพโหลดสลิปซ้ำ:
1. ลูกค้าคนแรกกด "อัพโหลดสลิป" → ระบบ Claim บิล (เก็บ ClaimedBySessionId)
2. Device อื่นเห็น "บิลนี้มีคน Claim อยู่" → กดอัพโหลดไม่ได้
3. หาก Claim แล้ว Release (เปลี่ยนใจ) → Device อื่น Claim ต่อได้

### 3.8 QR Redirect

URL ของ QR เป็นรูปแบบ **Short Code** เพื่อให้พิมพ์สั้น:
- เช่น `https://shop.example.com/q/abc123`
- Backend ค้น `TbTable.QrShortCode = "abc123"` → Redirect ไป `https://mobile.../auth?token={qrToken}`

### 3.9 Order Item Operations

| Action | จาก Status | ไป Status | เงื่อนไข |
| --- | :---: | :---: | --- |
| `send-kitchen` | Pending | Sent | ผ่าน Order หรือ Single item |
| `prepare` (KDS) | Sent | Preparing | สถานีตรงกับ CategoryType |
| `ready` (KDS) | Preparing | Ready | สถานีตรงกับ CategoryType |
| `serve` | Ready | Served | พนักงานเสิร์ฟ |
| `serve-all-ready` | Ready (ทุก item) | Served | เสิร์ฟครั้งเดียวทั้งออเดอร์ |
| `void` | Pending | Voided | ไม่ต้องระบุเหตุผล (ก่อนส่งครัว) |
| `cancel` | Sent / Preparing | Cancelled | ต้องระบุเหตุผล + ผู้ยกเลิก |

> **ข้อจำกัด**: เมื่อ Status ≥ `Ready` แล้ว → cancel ไม่ได้ (เพราะของถูกทำเสร็จแล้ว — ของจะเสีย)

---

## 4. Workflow การทำงานจริง

### Workflow A — พนักงานเสิร์ฟสั่งให้ลูกค้า

```
1. ลูกค้ามา → พนักงาน เปิดโต๊ะ A3 (Table Module สร้าง Order ใหม่)
2. ลูกค้าสั่ง: "ผัดกระเพรา 2 จาน เผ็ดน้อย + น้ำเปล่า 2 แก้ว"
3. พนักงาน → /order/list/{orderId}/add-items
   ─ เลือก "ผัดกระเพรา" → เลือก "เผ็ดน้อย" → จำนวน 2
   ─ เลือก "น้ำเปล่า" → จำนวน 2
4. กด "ส่งครัว" → ระบบ:
   ─ บันทึก OrderItem พร้อม Options (snapshot ชื่อ + ราคา)
   ─ Status = Sent + SentToKitchenAt = now
   ─ ผัดกระเพรา (CategoryType=Food) → ส่งไปสถานีอาหาร
   ─ น้ำเปล่า (CategoryType=Beverage) → ส่งไปสถานีเครื่องดื่ม
   ─ SignalR broadcast "NewOrderItems" ไปกลุ่ม kitchen + floor
5. ครัวอาหารเห็นรายการในจอ KDS → กด "เริ่มทำ" → Preparing
6. ครัวทำเสร็จ → กด "พร้อมเสิร์ฟ" → Ready + SignalR แจ้งพนักงานเสิร์ฟ
7. พนักงานเสิร์ฟ → เห็น Toast "ผัดกระเพราพร้อมเสิร์ฟ โต๊ะ A3"
8. เดินไปยกของ → กด "เสิร์ฟแล้ว" → Served
```

### Workflow B — ลูกค้าสั่งเองผ่าน QR (Self-Order)

```
1. ลูกค้านั่งที่โต๊ะ → สแกน QR → Redirect ไป Mobile Web
2. ระบบตรวจ Token → สร้าง CustomerSession + ขอชื่อเล่น
3. ลูกค้าใส่ชื่อเล่น "เอ" → เริ่มดูเมนู
4. หน้าเมนู:
   ─ แสดงเฉพาะเมนูที่ IsAvailable = true และอยู่ในช่วงเวลาเปิดร้าน
   ─ ลูกค้าเห็นรูป + ชื่อ + ราคา + Tags + Allergens
5. ลูกค้าเลือก "ผัดไทกุ้งสด" → กดเข้าดูรายละเอียด
   ─ เลือก Option Group "ระดับความเผ็ด" → "เผ็ดน้อย"
   ─ กด "เพิ่มลงตะกร้า"
6. ลูกค้าไปหน้า /cart → ตรวจรายการ → กด "ส่งออเดอร์"
7. ระบบสร้าง OrderItem (`OrderedBy = "customer:{sessionId}"`) status = Pending → Sent
   ─ Frontend lookup nickname จาก CustomerSession เพื่อแสดง "สั่งโดย เอ"
8. SignalR แจ้งครัว + ลูกค้าไปหน้า /orders เห็นสถานะ Real-time:
   ─ "ผัดไทกุ้งสด — กำลังทำ"
   ─ "ผัดไทกุ้งสด — พร้อมเสิร์ฟ"
   ─ "ผัดไทกุ้งสด — เสิร์ฟแล้ว"
9. (เพิ่มเติม) ลูกค้ากด "เรียกพนักงาน" / "ขอบิล" → ส่ง notification
```

### Workflow C — ลูกค้าขอบิลผ่าน Mobile Web

```
1. ลูกค้า → กดปุ่ม "ขอบิล" ใน Mobile Web
2. ระบบ:
   ─ Order.Status: Open → Billing
   ─ Table.Status: Occupied → Billing (สีเหลือง)
   ─ สร้าง OrderBill ที่ Status = Pending รวมรายการทั้งหมด
   ─ SignalR notification ไปกลุ่ม "cashier" → "REQUEST_BILL"
3. แคชเชียร์เห็น Toast → เข้า /payment/checkout/{orderId}
4. ลูกค้าเลือกวิธีชำระ:
   ─ "ชำระเงินสด" → กด Request Cash → แจ้งพนักงาน (Floor + Cashier)
   ─ "โอนเงิน QR" → ดู QR ของร้านในหน้าจอ → โอน → กด Upload Slip
5. (เพิ่มเติม Payment Module)
```

### Workflow D — แยกบิลตามรายการ (Split By Item)

```
1. ลูกค้า 2 คน: "ฉันจ่ายของฉัน เพื่อนจ่ายของเพื่อน"
2. พนักงาน → /order/list/{orderId} → กด "แยกบิล" → "Split By Item"
3. Dialog แสดงรายการทั้งหมด:
   ─ บิลที่ 1: [ผัดไทกุ้งสด ✓] [น้ำเปล่า ✓] [ส้มตำ ☐]
   ─ บิลที่ 2: [ผัดไทกุ้งสด ☐] [น้ำเปล่า ☐] [ส้มตำ ✓] [ชาเย็น ✓]
4. กดยืนยัน → ระบบ:
   ─ สร้าง 2 OrderBill (SplitCount=2, SplitIndex=1,2)
   ─ คำนวณ SubTotal + ServiceCharge + VAT + GrandTotal แต่ละบิล
   ─ อัพเดต OrderItem.OrderBillId ชี้ไปบิลที่ตรง
5. หน้า Checkout แสดง 2 บิลแยก → ลูกค้าจ่ายทีละบิล
```

### Workflow E — ยกเลิกรายการที่ส่งครัวแล้ว

```
1. ลูกค้า: "ขอยกเลิกผัดไทค่ะ"
2. พนักงาน → /order/list/{orderId} → เลือกรายการ → กด "ยกเลิก"
3. Dialog ขอเหตุผล (Cancel Reason): "ลูกค้าเปลี่ยนใจ"
4. ระบบ:
   ─ Status: Sent/Preparing/Ready → Cancelled
   ─ บันทึก CancelledBy = EmployeeId ของพนักงาน
   ─ บันทึก CancelReason
   ─ SignalR broadcast "ItemCancelled" ไปครัว → ครัวลบรายการจากจอ
   ─ ถ้าครัวยังไม่ได้ทำ → ของไม่เสีย
   ─ ถ้าครัวทำเสร็จแล้ว → ของเสีย แต่ระบบเก็บ audit ไว้ตรวจสอบ
```

### Workflow F — Link Tables (ลูกค้ามากลุ่มใหญ่)

```
1. ลูกค้ามา 10 คน → ต้องการ 3 โต๊ะ (A3, A4, A5)
2. พนักงาน เปิด A3 ก่อน (Anchor) → สร้าง Order
3. กด "เชื่อมโต๊ะ" → เลือก A4, A5 → สร้าง GroupCode
4. ทุกโต๊ะใน Group ใช้ Order เดียวกัน (ActiveOrderId เดียวกัน)
5. ลูกค้าสั่งที่โต๊ะ A4 → OrderItem.SourceTableId = A4
6. ลูกค้าสั่งที่โต๊ะ A5 → OrderItem.SourceTableId = A5
7. ปิดบิล → บิลเดียวรวมทุกโต๊ะ
8. (กรณีต้องการแยก) → กด "เลิกเชื่อม"
   ─ ระบบแยก OrderItem กลับเป็นออเดอร์ใหม่ของแต่ละโต๊ะตาม SourceTableId
   ─ A4, A5 มี Order ของตัวเอง
```

### Workflow G — Void Bill (ยกเลิกบิล)

```
สถานการณ์: ลูกค้าขอบิลแล้ว แต่เปลี่ยนใจอยากสั่งเพิ่ม
1. Order.Status = Billing แล้ว → ลูกค้า: "ขอเพิ่มข้าว 2 จาน"
2. พนักงาน → /order/list/{orderId} → กด "ยกเลิกบิล"
3. ระบบ:
   ─ Order.Status: Billing → Open
   ─ ลบ OrderBill ที่ Status = Pending (Hard Delete)
   ─ Table.Status: Billing → Occupied
   ─ SignalR broadcast "BillVoided"
4. พนักงานสั่งอาหารเพิ่มได้ปกติ
```

---

## 5. ข้อดี

| ข้อดี | คำอธิบาย |
| --- | --- |
| **Real-time แท้** | ทุกการกระทำ broadcast SignalR ทันที — ครัว/พนักงาน/ลูกค้าเห็นพร้อมกัน |
| **ครัวแยก 3 สถานี** | เครื่องดื่มทำเสร็จก่อน → เสิร์ฟทันที ไม่รอครัวอาหาร |
| **Self-Order ลด workforce** | ลูกค้าสั่งเอง → ลดจำนวนพนักงานเสิร์ฟที่ต้องการ |
| **Multi-Device** | ลูกค้าหลายคนสั่งพร้อมกันได้ด้วย CustomerSession แยก |
| **Bill Claim** | ป้องกันลูกค้าอัพโหลดสลิปซ้ำ → เงินไม่หาย |
| **Split Bill 2 แบบ** | ตามรายการ + ตามจำนวนเงิน — ครอบคลุมทุกความต้องการ |
| **Snapshot ราคา** | ราคา/ชื่อเมนู snapshot ใน Order → เปลี่ยน Menu ไม่กระทบ Order เก่า |
| **OrderedBy tracking** | ใครสั่งบ้างในออเดอร์ — มีประโยชน์ตอนแยกบิล |
| **Cancel + Reason + Auditor** | ลดข้อพิพาท ตรวจสอบได้ว่าใครยกเลิก เพราะอะไร |
| **Link/Unlink Tables** | รองรับลูกค้ากลุ่มใหญ่ → ปรับยืดหยุ่นได้ |
| **State Machine ชัดเจน** | item เปลี่ยน status เป็นขั้นๆ ป้องกันการกระโดดข้าม |
| **QR Short Code** | URL สั้น → QR code อ่านง่าย พิมพ์ใส่กระดาษได้ |

---

## 6. ข้อเสีย / ข้อจำกัด

| ข้อจำกัด | ผลกระทบ + วิธีรับมือ |
| --- | --- |
| **OrderedBy เป็น string** | พนักงานเก็บเป็น nickname ตรงๆ — ถ้าพนักงานเปลี่ยนชื่อเล่น แสดงข้อมูลเก่า |
| **OrderedBy ของ Self-Order เป็น "customer:{sessionId}"** | ไม่ใช่ nickname ตรงๆ — Frontend ต้อง lookup CustomerSession เพื่อแสดงชื่อจริง |
| **ต้องเปิดโต๊ะก่อนสั่งเสมอ** | ลูกค้ากินอย่างเดียวไม่นั่ง (Take Away) ทำไม่ได้ — ต้องเปิดโต๊ะ dummy |
| **ไม่มี Order Type (Dine-in / Take Away / Delivery)** | รองรับเฉพาะ Dine-in |
| **ไม่รองรับ Pre-Order** | สั่งล่วงหน้าก่อนมาถึงร้าน ทำไม่ได้ — ต้องมาที่โต๊ะ |
| **Self-Order ไม่ Auto-Refresh** | ลูกค้าต้อง polling หรือพึ่ง SignalR — ถ้า WiFi ของลูกค้าหลุด ไม่อัพเดต |
| **Void Bill เป็น Hard Delete** | บิลถูกลบจริง — ถ้าต้องการ audit ทำไม่ได้ (เก็บแค่ Order audit) |
| **Cancel ต้องระบุเหตุผล แต่ Void ไม่ต้อง** | อาจถูกใช้ผิด — พนักงาน Void เพื่อหนีการบันทึก |
| **Split By Amount หารเท่ากัน** | ไม่รองรับสัดส่วนต่างกัน (เช่น 60/40) |
| **Unsplit ก่อน Paid เท่านั้น** | ถ้าบิลแรก Paid แล้ว → Unsplit ไม่ได้ |
| **Link Tables Order Merge ทันที** | ลูกค้าที่อยากแยกบิลในแต่ละโต๊ะภายหลัง ต้อง Unlink ก่อน |
| **QR Token หมดอายุ 12 ชั่วโมง** | ลูกค้านั่งนานเกิน → ต้องสแกนใหม่ |
| **ครัวสถานีเดียวต้อง permission แยก** | ครัวที่ทำทุกอย่างคนเดียว ต้องให้ permission ครบ 3 categories |

---

## 7. ความสัมพันธ์กับ Module อื่น

### Module นี้ส่งข้อมูลไปให้ใคร

| Module ปลายทาง | ส่งอะไรไป | ใช้ทำอะไร |
| --- | --- | --- |
| **Payment** | OrderBillId + GrandTotal + ServiceCharge + VAT | ใช้คำนวณยอดที่ลูกค้าต้องจ่าย |
| **Table** | OrderId + Status | อัพเดตสถานะโต๊ะ (Occupied/Billing/Cleaning) + ActiveOrderId |
| **Notification** | events ของ Order/Item | broadcast SignalR ไปยังกลุ่มที่เกี่ยวข้อง |
| **Kitchen Display** | OrderItem ที่ status = Sent/Preparing | แสดงในจอครัว |
| **Dashboard** | จำนวน Order + ยอด + เมนูขายดี | คำนวณ analytics |
| **Self-Order (Mobile)** | สถานะ OrderItem | แสดง real-time tracking |

### Module นี้ดึงข้อมูลจากใคร

| Module ต้นทาง | ดึงอะไรมา | ใช้ทำอะไร |
| --- | --- | --- |
| **Menu** | Menu + Options ที่เปิดขาย | ใช้สร้าง OrderItem (snapshot ชื่อ ราคา ต้นทุน) |
| **Table** | TableId + QrToken + ActiveOrderId | ผูก Order กับโต๊ะ + ตรวจสอบ Self-Order |
| **Human Resource** | EmployeeId + Nickname | บันทึก OrderedBy + CancelledBy + Audit Trail |
| **Admin (ServiceCharge)** | ServiceCharge ของช่วงวันที่ปัจจุบัน | คำนวณยอดบิล |
| **Admin (ShopSettings)** | VAT Rate, ข้อมูลร้าน | คำนวณ VAT + แสดงในใบเสร็จ |
| **Authorization** | สิทธิ์ของผู้ใช้ | ตรวจว่าใครสั่ง/ยกเลิก/ส่งครัวได้ |
| **Notification** | สิทธิ์ของผู้รับ | ระบุกลุ่มที่จะรับแจ้งเตือน |

---

## 8. สรุปสำหรับรายงาน (1 ย่อหน้า)

> Module Order เป็นหัวใจของระบบ RBMS-POS ที่เชื่อมโยงทุกโมดูลเข้าด้วยกัน รับผิดชอบตั้งแต่การรับออเดอร์จากพนักงานเสิร์ฟและลูกค้าที่สแกน QR Code (Self-Order) การส่งรายการเข้าครัวแบบแยก 3 สถานี (อาหาร/เครื่องดื่ม/ของหวาน) ผ่านระบบ Kitchen Display ที่มี State Machine ละเอียด 7 สถานะของแต่ละรายการ (Pending → Sent → Preparing → Ready → Served พร้อม Voided/Cancelled) การจัดการบิลที่รองรับการแยกบิลทั้งแบบเลือกรายการ (Split By Item) และหารเท่ากัน (Split By Amount) ระบบ Link Tables สำหรับรวมโต๊ะของลูกค้ากลุ่มใหญ่ และระบบ Bill Claim ที่ป้องกันการอัพโหลดสลิปซ้ำในกรณีลูกค้าหลายคนใช้ Mobile Web พร้อมกัน ทุกการเปลี่ยนแปลงในระบบจะ broadcast ผ่าน SignalR ให้ครัว พนักงานเสิร์ฟ และลูกค้า Mobile Web เห็นพร้อมกันแบบ Real-time ลดความผิดพลาดและเพิ่มความเร็วในการให้บริการอย่างมีนัยสำคัญ
