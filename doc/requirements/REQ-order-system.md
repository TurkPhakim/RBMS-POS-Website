# ระบบสั่งอาหาร (Order Management System)

> สถานะ: **Implemented (Core)** | อัปเดตล่าสุด: 2026-03-20

---

## 1. ภาพรวม

### 1.1 บทนำ

ระบบสั่งอาหาร (Order Management) เป็นหัวใจของการดำเนินงานร้านอาหาร จัดการทุกอย่างตั้งแต่การสั่งเมนู (ทั้งจากพนักงานและลูกค้า), การส่งออเดอร์เข้าครัว, การติดตามสถานะ, ไปจนถึงการเตรียมข้อมูลสำหรับชำระเงิน โดยรองรับ 2 ช่องทาง:

1. **Staff Ordering** — พนักงานรับออเดอร์จากหน้า POS
2. **Customer QR Self-Ordering** — ลูกค้าสแกน QR Code สั่งเองจากมือถือ (รองรับหลายเครื่องต่อโต๊ะ)

**อ้างอิงการออกแบบ:** BBQ Plaza (QR Multi-device Self-Ordering), FoodStory (KDS + Order Flow)

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน | ที่ต้องการ |
|--------|----------|-----------|
| การสั่งอาหาร | ไม่มี | Staff POS + QR Self-Order |
| ช่องทางสั่ง | ไม่มี | 2 ช่องทาง (พนักงาน + ลูกค้า) |
| Multi-device | ไม่มี | ลูกค้าหลายคนสั่งพร้อมกันจากมือถือตัวเอง |
| สถานะออเดอร์ | ไม่มี | Per-item status tracking (PENDING → SERVED) |
| KDS | ไม่มี | Kitchen Display System แยกตาม category |
| เรียกพนักงาน | ไม่มี | ลูกค้ากดจาก QR Panel |
| ขอบิล | ไม่มี | ลูกค้ากดจาก QR Panel |
| Split Bill | ไม่มี | แยกตามรายการ + หารเท่า |
| Void/Cancel | ไม่มี | Void (ก่อนส่งครัว) + Cancel (ต้อง auth) |
| Price Snapshot | ไม่มี | บันทึกราคา ณ เวลาสั่ง |

### 1.3 ขอบเขต (Scope)

**ทำ:**
- Order lifecycle ครบวงจร (สร้าง → สั่ง → ส่งครัว → เสิร์ฟ → ขอบิล)
- Staff ordering page
- Customer QR Self-Ordering panel (multi-device)
- Kitchen Display System (KDS)
- Order item status tracking
- Void/Cancel order items
- Call Waiter + Request Bill
- Split Bill (by item + by amount)
- Price snapshot
- Real-time update ผ่าน SignalR (OrderHub สำหรับ KDS, NotificationHub สำหรับ Noti bar)
- รองรับ Dashboard เมนูขายดี — ดู [REQ-dashboard-system](REQ-dashboard-system.md) Section 5

**ไม่ทำ (อยู่ใน module อื่น):**
- การชำระเงินจริง (เงินสด, QR Payment), ส่วนลด, กะแคชเชียร์ → REQ-payment-system
- ใบเสร็จ PDF → REQ-payment-system
- Inventory/Stock management → อนาคต
- Delivery/Takeaway → อนาคต
- Order coursing (fine dining) → อนาคต

---

## 2. Order Lifecycle

### 2.1 Flow หลัก

```
เปิดโต๊ะ (Table System)
    │
    ▼
สร้าง Order อัตโนมัติ ──► Order status = OPEN
    │
    ▼
สั่งอาหาร (Staff POS หรือ QR Self-Order)
    │ เพิ่ม Order Items
    ▼
ส่งครัว/บาร์ ──► Order Items status = SENT
    │              │
    │              ▼ (SignalR → KDS)
    │          ครัวรับ + เริ่มทำ ──► PREPARING
    │              │
    │              ▼
    │          ทำเสร็จ ──► READY
    │              │
    │              ▼ (SignalR → Floor Staff)
    │          พนักงานเสิร์ฟ ──► SERVED
    │
    ├── [สั่งเพิ่ม → วนรอบใหม่]
    │
    ▼
ลูกค้าขอบิล (กดจาก QR หรือพนักงานกด)
    │ Table status → BILLING
    ▼
Split Bill (ถ้าต้องการ) → สร้าง Sub-bills
    │
    ▼
ส่งต่อ Payment Module ──► Order status = COMPLETED
    │
    ▼
ปิดโต๊ะ (Table System)
```

### 2.2 Order Status

| ค่า | ชื่อ | คำอธิบาย |
|-----|------|---------|
| 0 | OPEN | ออเดอร์เปิดอยู่ กำลังรับรายการ |
| 1 | BILLING | ลูกค้าขอบิลแล้ว รอชำระ |
| 2 | COMPLETED | ชำระเงินเสร็จ ปิดออเดอร์ |
| 3 | CANCELLED | ยกเลิกทั้งออเดอร์ (กรณีพิเศษ เช่น ลูกค้าหนี) |

---

## 3. Order Structure

### 3.1 โครงสร้างข้อมูล

```
TbOrder (1 ต่อโต๊ะที่เปิด)
    │
    ├── TbOrderItem (N รายการเมนู)
    │       │
    │       └── TbOrderItemOption (N ตัวเลือกเสริม)
    │
    └── TbOrderBill (N ใบย่อย — สำหรับ Split Bill)
```

### 3.2 TbOrder

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| OrderId | int (PK) | ใช่ | |
| TableId | int (FK) | ใช่ | โต๊ะที่เปิดออเดอร์ |
| OrderNumber | string(20) | ใช่ | Running number ต่อวัน เช่น "ORD-20260318-001" |
| Status | enum | ใช่ | OPEN, BILLING, COMPLETED, CANCELLED |
| GuestCount | int | ใช่ | จำนวนลูกค้า (copy จากตอนเปิดโต๊ะ) |
| SubTotal | decimal(12,2) | ใช่ | รวมราคาอาหาร (คำนวณจาก items ที่ไม่ใช่ VOIDED/CANCELLED) |
| Note | string(500) | ไม่ | หมายเหตุออเดอร์ (copy จาก table session note) |
| + BaseEntity fields | | | |

> **หมายเหตุ:** ServiceCharge และ VAT ไม่ได้เก็บใน TbOrder — คำนวณตอน billing/payment ผ่าน TbOrderBill โดย ServiceChargeRate = Cashier เลือกจาก Service Charge Master Data dropdown, VatRate = 7% hardcode (ดู Section 18)

### 3.3 TbOrderItem

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| OrderItemId | int (PK) | ใช่ | |
| OrderId | int (FK) | ใช่ | |
| MenuId | int (FK) | ใช่ | อ้างอิงเมนูที่สั่ง |
| MenuNameThai | string(200) | ใช่ | Snapshot ชื่อ ณ เวลาสั่ง |
| MenuNameEnglish | string(200) | ใช่ | Snapshot ชื่ออังกฤษ |
| CategoryType | int | ใช่ | 1=Food, 2=Beverage, 3=Dessert (สำหรับแยก KDS) |
| Quantity | int | ใช่ | 1–99 |
| UnitPrice | decimal(10,2) | ใช่ | Snapshot ราคาขาย ณ เวลาสั่ง |
| OptionsTotalPrice | decimal(10,2) | ใช่ | รวมราคา options ทั้งหมด |
| TotalPrice | decimal(12,2) | ใช่ | (UnitPrice + OptionsTotalPrice) × Quantity |
| Status | enum | ใช่ | PENDING → SENT → PREPARING → READY → SERVED / CANCELLED / VOIDED |
| Note | string(500) | ไม่ | หมายเหตุรายการ เช่น "ไม่ใส่ผัก" |
| OrderedBy | string(100) | ใช่ | `"staff:{employeeId}"` หรือ `"customer:{sessionId}"` — ดูรายละเอียด format ที่ [REQ-self-order-system](REQ-self-order-system.md) Section 4.2 |
| SentToKitchenAt | datetime2 | ไม่ | เวลาที่ส่งครัว (null ถ้ายังไม่ส่ง) |
| CookingStartedAt | datetime2 | ไม่ | เวลาที่ครัวเริ่มทำ (null ถ้ายังไม่เริ่ม) — ดู [REQ-kitchen-system](REQ-kitchen-system.md) Section 10 |
| ReadyAt | datetime2 | ไม่ | เวลาที่ครัวทำเสร็จ (null ถ้ายังไม่เสร็จ) |
| ServedAt | datetime2 | ไม่ | เวลาที่เสิร์ฟ (null ถ้ายังไม่เสิร์ฟ) |
| CancelledBy | int (FK) | ไม่ | EmployeeId ที่ยกเลิก (null ถ้าไม่ถูกยกเลิก) |
| CancelReason | string(500) | ไม่ | เหตุผลที่ยกเลิก (null ถ้าไม่ถูกยกเลิก) |
| CostPrice | decimal(10,2) | ไม่ | Snapshot ต้นทุนจาก TbMenu.CostPrice ณ เวลาสั่ง (null ถ้าเมนูไม่ได้ตั้งต้นทุน) — ใช้คำนวณกำไรขั้นต้นใน [REQ-dashboard-system](REQ-dashboard-system.md) Section 7.5 |
| + BaseEntity fields | | | |

### 3.4 TbOrderItemOption

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| OrderItemOptionId | int (PK) | ใช่ | |
| OrderItemId | int (FK) | ใช่ | |
| OptionGroupId | int (FK) | ใช่ | อ้างอิง Option Group |
| OptionItemId | int (FK) | ใช่ | อ้างอิง Option Item |
| OptionGroupName | string(100) | ใช่ | Snapshot ชื่อกลุ่ม |
| OptionItemName | string(100) | ใช่ | Snapshot ชื่อตัวเลือก |
| AdditionalPrice | decimal(10,2) | ใช่ | Snapshot ราคาเพิ่ม |

**หมายเหตุ:** Hard delete — ลบเมื่อ void/cancel order item ทั้งรายการ

### 3.5 TbOrderBill (Split Bill)

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| OrderBillId | int (PK) | ใช่ | |
| OrderId | int (FK) | ใช่ | |
| BillNumber | string(20) | ใช่ | เช่น "ORD-20260318-001-A" |
| BillType | enum | ใช่ | 0=FULL (ไม่แยก), 1=BY_ITEM, 2=BY_AMOUNT |
| SubTotal | decimal(12,2) | ใช่ | รวมราคารายการ (ตาม BillType) |
| TotalDiscountAmount | decimal(12,2) | ใช่ | รวมส่วนลดทั้งหมด (item + bill) — default 0 |
| NetAmount | decimal(12,2) | ใช่ | SubTotal - TotalDiscountAmount |
| ServiceChargeRate | decimal(5,2) | ใช่ | % ค่าบริการ ณ เวลาขอบิล (Cashier เลือกจาก Master Data dropdown — ดู Service Charge Management) |
| ServiceChargeAmount | decimal(12,2) | ใช่ | จำนวนเงินค่าบริการ (คำนวณจาก NetAmount) |
| VatRate | decimal(5,2) | ใช่ | % VAT = 7% คงที่ (hardcode — ไม่มีหน้าตั้งค่า) |
| VatAmount | decimal(12,2) | ใช่ | จำนวนเงิน VAT |
| GrandTotal | decimal(12,2) | ใช่ | ยอดรวมสุทธิ |
| Status | enum | ใช่ | 0=PENDING, 1=PAID |
| PaidAt | datetime2 | ไม่ | เวลาที่ชำระเงินเสร็จ (set ตอน Payment confirm — denormalize จาก TbPayment เพื่อให้ Dashboard query ง่าย) NULL ตอนสร้างบิล (PENDING) |
| + BaseEntity fields | | | |

> **หมายเหตุ:** ส่วนลด (TbOrderDiscount) จัดการโดย Payment module — ดู REQ-payment-system Section 4 และ 9.5

---

## 4. Order Item Status

| ค่า | ชื่อ | สี | คำอธิบาย | ใครเปลี่ยน |
|-----|------|-----|---------|-----------|
| 0 | PENDING | เทา | เพิ่มในตะกร้า ยังไม่ส่งครัว | ระบบ (auto) |
| 1 | SENT | เหลือง | ส่งครัว/บาร์แล้ว | ระบบ (auto เมื่อกด "ส่งครัว") |
| 2 | PREPARING | ส้ม | ครัวกำลังทำ | Kitchen staff (กดบน KDS) |
| 3 | READY | เขียว | ทำเสร็จ พร้อมเสิร์ฟ | Kitchen staff (กดบน KDS) |
| 4 | SERVED | เขียวเข้ม | เสิร์ฟแล้ว | Floor staff (กดยืนยัน) |
| 5 | VOIDED | เทาเข้ม | ยกเลิกก่อนส่งครัว | Staff (PENDING เท่านั้น) |
| 6 | CANCELLED | แดง | ยกเลิกหลังส่งครัว | Manager (ต้อง auth + เหตุผล) |

**การเปลี่ยนสถานะที่อนุญาต:**
```
PENDING ──► SENT (ส่งครัว)
PENDING ──► VOIDED (ยกเลิกก่อนส่งครัว — ไม่ต้อง auth)
SENT ──► PREPARING (ครัวรับ)
PREPARING ──► READY (ครัวเสร็จ)
READY ──► SERVED (เสิร์ฟแล้ว)
SENT ──► CANCELLED (ยกเลิกหลังส่ง — ต้อง manager auth + เหตุผล)
PREPARING ──► CANCELLED (ยกเลิกหลังส่ง — ต้อง manager auth + เหตุผล)
```

---

## 5. Staff Ordering (สั่งจากพนักงาน)

### 5.1 หน้าจอ Staff Order

**เข้าถึงจาก:** กดโต๊ะที่ OCCUPIED → ปุ่ม "สั่งอาหาร" ใน Table Detail

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  [อาหาร] [เครื่องดื่ม] [ของหวาน]    🔍 ค้นหาเมนู          │
│  ├── หมวดหมู่ย่อย (แท็บ/ชิป)                                │
├──────────────────────────────────────────────────────────────┤
│                                   │                          │
│   เมนู (Grid/List)               │   ตะกร้า (Cart)          │
│   ┌─────┐ ┌─────┐ ┌─────┐       │   ┌───────────────┐      │
│   │ 🍚  │ │ 🍜  │ │ 🥗  │       │   │ข้าวผัด ×2  240│      │
│   │ข้าว │ │ก๋วย  │ │สลัด │       │   │+ ไข่ดาว    +20│      │
│   │ผัด  │ │เตี๋ยว│ │     │       │   ├───────────────┤      │
│   │120฿ │ │85฿  │ │95฿  │       │   │ต้มยำ ×1    150│      │
│   └─────┘ └─────┘ └─────┘       │   ├───────────────┤      │
│                                   │   │ รวม       410฿│      │
│                                   │   │[ส่งครัว]      │      │
│                                   │   └───────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

**Interaction:**
1. เลือก category tab (อาหาร/เครื่องดื่ม/ของหวาน)
2. กรองด้วย sub-category chips
3. กดเมนู → ถ้ามี option groups → เปิด dialog เลือก options
4. ระบุจำนวน + หมายเหตุ (optional)
5. เพิ่มในตะกร้า
6. กด "ส่งครัว" → items ทั้งหมดในตะกร้าเปลี่ยนเป็น SENT
7. SignalR broadcast ไป KDS

### 5.2 เงื่อนไขการแสดงเมนู

- แสดงเฉพาะเมนูที่ `IsAvailable = true`
- แสดงเฉพาะเมนูที่ sub-category `IsActive = true`
- ตรวจสอบช่วงเวลาขาย (ถ้าร้านเปิด 2 ช่วง → แสดงเฉพาะเมนูที่เปิดในช่วงปัจจุบัน)
- เมนูที่มี tag "ใช้เวลาล่าช้า" → แสดง badge เตือน

---

## 6. Customer QR Self-Ordering (สั่งจากลูกค้า)

> **เอกสารหลักย้ายไปที่ [REQ-self-order-system.md](REQ-self-order-system.md)** — ครอบคลุม QR Token Flow, Customer Session, Nickname, Mobile Web Layout, Cart, Order Tracking, SignalR, API Endpoints และ Frontend Structure ทั้งหมด

### 6.1 ภาพรวม

ระบบ QR Self-Order ให้ลูกค้าสแกน QR Code ที่โต๊ะ → เปิด **RBMS-POS-Mobile-Web** (Angular app แยก, port 4400) → สั่งอาหารเอง:

- **QR Signed JWT Token** — generate เมื่อเปิดโต๊ะ, revoke เมื่อปิดโต๊ะ (ดู [REQ-table-system](REQ-table-system.md) Section 8)
- **Customer Session** — ลูกค้าตั้งชื่อเล่น (Nickname), แต่ละ device มี session แยก, cart เป็น per-device (localStorage)
- **Guest Bearer Token** — ใช้ `[CustomerAuthorize]` attribute, ไม่ใช่ tableId-based auth
- **Multi-device** — สแกน QR เดียวกัน = เข้าโต๊ะเดียวกัน, เห็น Order รวม (real-time ผ่าน SignalR)
- **ส่งครัวอัตโนมัติ** — ลูกค้ากดยืนยัน → items PENDING → auto-set SENT → เข้า KDS
- **OrderedBy** — `"customer:{sessionId}"` → Backend resolve เป็นชื่อเล่น (ดู Section 3.3)

### 6.2 ขอบเขตและรายละเอียด

- รายละเอียดเพิ่มเติม: ดู [REQ-self-order-system](REQ-self-order-system.md) Section 2–21
- API Endpoints: ดู [REQ-self-order-system](REQ-self-order-system.md) Section 13
- Edge Cases + Validation: ดู [REQ-self-order-system](REQ-self-order-system.md) Section 19–20

---

## 7. Kitchen Display System (KDS)

> **เอกสารหลักของ KDS ย้ายไปที่ [REQ-kitchen-system.md](REQ-kitchen-system.md)** — ครอบคลุม layout, view modes, timer, sound, SignalR, และ frontend components

### 7.1 ภาพรวม

KDS เป็นหน้าจอแสดงในครัว/บาร์ แสดงรายการออเดอร์ที่ต้องทำ real-time:

- **Routes:** `/kitchen-display/food`, `/kitchen-display/beverage`, `/kitchen-display/dessert` (3 routes แยกหมวด)
- **Permissions:** `kitchen-food.read/update`, `kitchen-beverage.read/update`, `kitchen-dessert.read/update` (แยกตามหมวดหมู่)
- **View Modes:** Order View (จัดกลุ่มตามออเดอร์) + Menu View (จัดกลุ่มตามเมนู)
- **อัพเดต:** SignalR real-time ผ่าน **OrderHub** (แยกจาก NotificationHub — ดู Section 16)
- **รายละเอียดเพิ่มเติม:** ดู [REQ-kitchen-system](REQ-kitchen-system.md) Section 2–9

### 7.2 การเชื่อมต่อกับ Order System

- เมื่อ items ถูกส่งครัว (PENDING → SENT) → Backend publish ไป OrderHub + NotificationHub
- KDS staff เลือก items + กด "เริ่มทำ" → SENT → PREPARING (set `CookingStartedAt`)
- KDS staff เลือก items + กด "เสร็จแล้ว" → PREPARING → READY (set `ReadyAt`)
- API ใช้ **batch item endpoints** — ดู Section 12.3

### 7.3 Flow พนักงานเสิร์ฟ

เมื่อ KDS mark "เสร็จแล้ว" (READY):
1. Items ย้ายไป section "รอเสิร์ฟ" บน KDS (ดู [REQ-kitchen-system](REQ-kitchen-system.md) Section 5)
2. Floor staff ได้รับ notification "อาหารพร้อมเสิร์ฟ — โต๊ะ A1"
3. Floor staff รับอาหารจากครัว
4. นำไปเสิร์ฟที่โต๊ะ
5. กด "เสิร์ฟแล้ว" ที่ Table Detail → status READY → SERVED

---

## 8. Order Modification

### 8.1 เพิ่มรายการ (Add Items)

- สั่งเพิ่มได้ตลอดเมื่อ Order status = OPEN
- ทั้ง Staff POS และ QR Self-Order สั่งเพิ่มได้
- รายการใหม่เริ่มที่ status PENDING → กด "ส่งครัว" → SENT

### 8.2 Void (ยกเลิกก่อนส่งครัว)

- **เงื่อนไข:** item status = PENDING เท่านั้น
- **ใครทำได้:** Staff (ไม่ต้อง manager auth)
- **ผลลัพธ์:** item status → VOIDED, ไม่คิดเงิน
- **ลูกค้า QR:** ลบรายการจาก cart ก่อนกด "ส่งคำสั่ง" ได้เอง

### 8.3 Cancel (ยกเลิกหลังส่งครัว)

- **เงื่อนไข:** item status = SENT หรือ PREPARING
- **ใครทำได้:** ต้อง Manager/Supervisor auth (กรอก PIN หรือ verify password)
- **ต้องระบุเหตุผล:** เช่น "ลูกค้าเปลี่ยนใจ", "วัตถุดิบหมด", "ออเดอร์ผิด"
- **ผลลัพธ์:** item status → CANCELLED, ไม่คิดเงิน
- **SignalR:** broadcast `ORDER_CANCELLED` → KDS ลบรายการ

---

## 9. Split Bill (แยกบิล)

> **เงื่อนไขก่อนขอบิล:** Order items ทุกรายการต้องอยู่ในสถานะสุดท้ายแล้ว (SERVED, VOIDED, หรือ CANCELLED) — ถ้ายังมี items ที่เป็น PENDING/SENT/PREPARING/READY ระบบจะไม่อนุญาตให้ขอบิล (แสดง error "ยังมีรายการที่ไม่ได้เสิร์ฟ กรุณารอจนกว่าจะเสิร์ฟครบหรือยกเลิกรายการที่ค้าง")

### 9.1 แยกตามรายการ (By Item)

1. พนักงานเข้าหน้า Order Detail → กด "แยกบิล"
2. เลือก "แยกตามรายการ"
3. แสดงรายการ order items ทั้งหมด (เฉพาะ SERVED — items ที่ VOIDED/CANCELLED ไม่แสดง)
4. ลาก/เลือกรายการไปแต่ละบิล (Bill A, Bill B, ...)
5. ระบบคำนวณ subtotal + service charge + VAT ต่อบิล
6. กด "ยืนยัน" → สร้าง TbOrderBill records → ส่งต่อ Payment

### 9.2 แยกตามจำนวน (By Amount — หารเท่า)

1. พนักงานเข้าหน้า Order Detail → กด "แยกบิล"
2. เลือก "หารเท่า"
3. ระบุจำนวนคน (default = GuestCount)
4. ระบบหาร GrandTotal ÷ จำนวนคน (ปัดทศนิยม 2 ตำแหน่ง)
5. กด "ยืนยัน" → สร้าง TbOrderBill records → ส่งต่อ Payment

### 9.3 ไม่แยกบิล (Full)

- Default — สร้าง TbOrderBill 1 record ที่มียอดเท่ากับ Order GrandTotal
- ส่งต่อ Payment module ตามปกติ

### 9.4 การจบ Order เมื่อ Split Bill

> เมื่อ TbOrderBill **ทุก record** ของ Order นั้นมีสถานะ `PAID` → ระบบเปลี่ยน Order Status เป็น `COMPLETED` อัตโนมัติ (ไม่ต้องรอพนักงานกด)

---

## 10. Price Snapshot

### 10.1 หลักการ

เมื่อลูกค้าสั่งเมนู ระบบจะ **snapshot** ข้อมูลราคาและชื่อ ณ เวลาที่สั่ง:
- `UnitPrice` = ราคาขายของเมนู ณ ตอนสั่ง
- `MenuNameThai/English` = ชื่อเมนู ณ ตอนสั่ง
- `AdditionalPrice` = ราคา option item ณ ตอนสั่ง
- `ServiceChargeRate/VatRate` = snapshot ตอนขอบิล (เก็บใน TbOrderBill ไม่ใช่ TbOrder)

### 10.2 เหตุผล

ถ้าเจ้าของร้านเปลี่ยนราคาเมนู (เช่น ข้าวผัด 120 → 130) ระหว่างที่ลูกค้านั่งกินอยู่:
- ออเดอร์เก่ายังคิด 120 (ราคาตอนสั่ง)
- ออเดอร์ใหม่คิด 130 (ราคาใหม่)

---

## 11. Database Schema

### 11.1 Enums

```csharp
public enum EOrderStatus
{
    Open = 0,
    Billing = 1,
    Completed = 2,
    Cancelled = 3
}

public enum EOrderItemStatus
{
    Pending = 0,
    Sent = 1,
    Preparing = 2,
    Ready = 3,
    Served = 4,
    Voided = 5,
    Cancelled = 6
}

public enum EBillType { Full = 0, ByItem = 1, ByAmount = 2 }
public enum EBillStatus { Pending = 0, Paid = 1 }
```

### 11.2 ER Diagram

```
TbTable (1) ──── (0..1) TbOrder (active)
                           │
                           ├── (N) TbOrderItem
                           │        │
                           │        └── (N) TbOrderItemOption
                           │
                           └── (N) TbOrderBill

TbMenu (1) ──── (N) TbOrderItem (MenuId — FK, snapshot data)
TbOptionGroup (1) ──── (N) TbOrderItemOption
TbOptionItem (1) ──── (N) TbOrderItemOption
TbEmployee (1) ──── (N) TbOrderItem (CancelledBy)
```

---

## 12. API Endpoints

### 12.1 Order Endpoints (Staff) — ✅ Implemented

> **Route prefix จริง:** `/api/order/orders` (ไม่ใช่ `/api/orders`)
> **Permission prefix จริง:** `order-manage.*` (ไม่ใช่ `order.*`)

| Method | Route | Permission | รายละเอียด | สถานะ |
|--------|-------|-----------|-----------|-------|
| GET | `/api/order/orders` | `order-manage.read` | ดึงออเดอร์ (filter: date, status, tableId) | ✅ |
| POST | `/api/order/orders` | `order-manage.create` | สร้างออเดอร์ใหม่ | ✅ |
| GET | `/api/order/orders/{orderId}` | `order-manage.read` | ดึงออเดอร์ตาม ID (+ items + options) | ✅ |
| GET | `/api/order/orders/table/{tableId}` | `order-manage.read` | ดึง active order ของโต๊ะ | ✅ |
| POST | `/api/order/orders/{orderId}/items` | `order-manage.create` | เพิ่มรายการ (staff ordering) | ✅ |
| POST | `/api/order/orders/{orderId}/send-kitchen` | `order-manage.update` | ส่งครัว (PENDING → SENT) | ✅ |
| POST | `/api/order/orders/{orderId}/request-bill` | `order-manage.update` | ขอบิล (Order → BILLING, Table → BILLING) | ✅ |
| POST | `/api/order/orders/{orderId}/cancel` | `order-manage.delete` | ยกเลิกทั้งออเดอร์ (manager auth) | ✅ |

### 12.2 Order Item Endpoints — ✅ Implemented

| Method | Route | Permission | รายละเอียด | สถานะ |
|--------|-------|-----------|-----------|-------|
| PUT | `/api/order/orders/items/{orderItemId}/void` | `order-manage.update` | Void (PENDING เท่านั้น) | ✅ |
| PUT | `/api/order/orders/items/{orderItemId}/cancel` | `order-manage.delete` | Cancel (ต้อง manager auth + เหตุผล) | ✅ |
| PUT | `/api/order/orders/items/{orderItemId}/serve` | `order-manage.update` | Mark เสิร์ฟแล้ว (READY → SERVED) | ✅ |

### 12.3 KDS Endpoints — ❌ ยังไม่ Implement

> **หมายเหตุ:** KDS endpoints ยังไม่ได้สร้าง — รอ Phase แยก (REQ-kitchen-system)
> Kitchen permissions จริง: `kitchen-order.read` / `kitchen-order.update` (รวมเป็น 1 module ไม่แยกตามหมวดอาหาร)

| Method | Route | Permission | รายละเอียด | สถานะ |
|--------|-------|-----------|-----------|-------|
| GET | `/api/kitchen/orders` | `kitchen-order.read` | ดึงรายการที่ต้องทำ | ❌ รอ KDS Phase |
| PUT | `/api/kitchen/items/prepare` | `kitchen-order.update` | เริ่มทำ (batch: SENT → PREPARING) | ❌ รอ KDS Phase |
| PUT | `/api/kitchen/items/ready` | `kitchen-order.update` | เสร็จแล้ว (batch: PREPARING → READY) | ❌ รอ KDS Phase |

### 12.4 Customer Self-Order Endpoints

> **เปลี่ยนจาก tableId-based auth เป็น Guest Bearer Token** — ดูรายละเอียด API ทั้งหมดที่ [REQ-self-order-system](REQ-self-order-system.md) Section 13

| Method | Route | Auth | รายละเอียด |
|--------|-------|------|-----------|
| POST | `/api/customer/auth` | Public | Validate QR token → สร้าง session → return guest JWT |
| POST | `/api/customer/nickname` | Guest token | ตั้งชื่อเล่น |
| GET | `/api/customer/menu/categories` | Guest token | หมวดหมู่ทั้งหมด |
| GET | `/api/customer/menu/items` | Guest token | เมนู (filter: categoryType, subCategoryId, search) |
| GET | `/api/customer/menu/items/{menuId}` | Guest token | รายละเอียดเมนู + options |
| POST | `/api/customer/orders` | Guest token | Submit cart → สร้าง order items + auto ส่งครัว |
| GET | `/api/customer/orders` | Guest token | ดู order ปัจจุบันของโต๊ะ |
| POST | `/api/customer/call-waiter` | Guest token | เรียกพนักงาน (cooldown 60 วินาที) |
| POST | `/api/customer/request-bill` | Guest token | ขอเช็คบิล |

### 12.5 Split Bill Endpoints — ✅ Implemented

| Method | Route | Permission | รายละเอียด | สถานะ |
|--------|-------|-----------|-----------|-------|
| POST | `/api/order/orders/{orderId}/split/by-item` | `order-manage.update` | แยกตามรายการ (body: bills[{items}]) | ✅ |
| POST | `/api/order/orders/{orderId}/split/by-amount` | `order-manage.update` | หารเท่า (body: splitCount) | ✅ |
| GET | `/api/order/orders/{orderId}/bills` | `order-manage.read` | ดึง bills ของ order | ✅ |

---

## 13. Frontend Pages & Components

### 13.1 Sidebar Menu

ภายใต้ "ออเดอร์":

| ชื่อ | Route | Permission |
|------|-------|-----------|
| รายการออเดอร์ | `/order/list` | `order.read` |

แยกจาก sidebar (เข้าจาก Floor Plan):

| ชื่อ | Route | Permission |
|------|-------|-----------|
| ครัว (KDS) | `/kitchen-display` | `kitchen-food.read` OR `kitchen-beverage.read` OR `kitchen-dessert.read` |

### 13.2 Routes

| Route | Component | Permission | หมายเหตุ |
|-------|-----------|-----------|----------|
| `/order/list` | OrderListComponent | `order.read` | รายการออเดอร์ทั้งหมด (filter by date, status) |
| `/order/:orderId` | OrderDetailComponent | `order.read` | รายละเอียดออเดอร์ + split bill |
| `/order/:orderId/add-items` | StaffOrderComponent | `order.create` | หน้าสั่งอาหาร (staff) |
| `/kitchen-display` | KitchenDisplayComponent | `kitchen-food.read` OR `kitchen-beverage.read` OR `kitchen-dessert.read` | KDS (full-screen) — ดู [REQ-kitchen-system](REQ-kitchen-system.md) §13 |
| `/customer/table/:tableId` | CustomerPanelComponent | ไม่ต้อง auth | Self-Order (ลูกค้า) |

### 13.3 Order List Page

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| เลขออเดอร์ | `w-[160px]` | ORD-YYYYMMDD-NNN |
| โต๊ะ | `w-[100px]` | ชื่อโต๊ะ |
| จำนวนรายการ | `w-[120px]` | count items |
| ยอดรวม | `w-[120px]` | GrandTotal |
| สถานะ | `w-[120px]` | badge สี |
| เวลาสร้าง | `w-[160px]` | |
| ตัวเลือก | `w-[100px]` | ดูรายละเอียด |

---

## 14. UserFlow

### 14.1 พนักงานสั่งอาหารให้ลูกค้า

1. ลูกค้าบอกเมนูที่ต้องการ → พนักงานเข้า Table Detail ของโต๊ะนั้น
2. กด "สั่งอาหาร" → เข้าหน้า Staff Order
3. เลือก category → sub-category → กดเมนู
4. เลือก options (ถ้ามี) → ระบุจำนวน → เพิ่มในตะกร้า
5. ทำซ้ำขั้น 3–4 จนครบ
6. กด "ส่งครัว" → items ส่งไป KDS

### 14.2 ลูกค้าสั่งเองผ่าน QR Code

> ดูรายละเอียด User Flows ทั้ง 6 flows ที่ [REQ-self-order-system](REQ-self-order-system.md) Section 18

1. พนักงานเปิดโต๊ะ → Backend generate QR Signed JWT
2. ลูกค้าสแกน QR → Mobile Web auth → ตั้งชื่อเล่น (Nickname)
3. เลือก category → sub-category → กดเมนู → เลือก options → เพิ่มในตะกร้า (per-device)
4. กด "ยืนยันสั่งอาหาร" → items สร้าง + ส่งครัวอัตโนมัติ
5. ดูสถานะออเดอร์ real-time (Order Tracking via SignalR)
6. สั่งเพิ่มได้ตลอด / เรียกพนักงาน / ขอเช็คบิล

### 14.3 ครัวรับออเดอร์ + ทำอาหาร

1. ออเดอร์ใหม่เข้า KDS → เสียง beep + การ์ดใหม่ปรากฏ
2. พ่อครัว/บาร์เทนเดอร์ดูรายการ → กด "เริ่มทำ" (→ PREPARING)
3. ทำอาหารเสร็จ → กด "เสร็จแล้ว" (→ READY)
4. SignalR → Floor staff notification "อาหารพร้อมเสิร์ฟ — โต๊ะ A1"

### 14.4 Void ก่อนส่งครัว

1. ลูกค้าเปลี่ยนใจ (ยังไม่กดส่งครัว)
2. ลูกค้า: ลบรายการจาก cart ก่อนกด "ส่งคำสั่ง"
3. พนักงาน: กด void ที่รายการ (PENDING → VOIDED)

### 14.5 Cancel หลังส่งครัว

1. ลูกค้าเปลี่ยนใจหลังส่งครัวไปแล้ว → แจ้งพนักงาน
2. พนักงานเข้า Order Detail → กด "ยกเลิก" ที่รายการ
3. ระบบขอ Manager auth (กรอก PIN หรือ verify password)
4. ระบุเหตุผล → ยืนยัน → item CANCELLED
5. SignalR → KDS ลบรายการ + notification

### 14.6 ขอบิล + Split Bill

1. ลูกค้ากด "ขอเช็คบิล" จาก QR Panel (หรือพนักงานกด)
2. Table status → BILLING, Order status → BILLING
3. **ยังไม่สร้าง TbOrderBill** — รอแคชเชียร์เตรียมบิลก่อน (เลือก ServiceCharge + ส่วนลด)
4. แคชเชียร์เข้าหน้า Payment Process → ตั้งค่า ServiceCharge + ส่วนลด → กด **"ยืนยันบิล"** → สร้าง TbOrderBill
5. ถ้าต้องการแยกบิล → พนักงานเข้า Order Detail → กด "แยกบิล"
6. เลือกแบบ (by item / by amount) → จัดสรรรายการ/จำนวนคน → ยืนยัน
7. สร้าง TbOrderBill records → ส่งต่อ Payment module

> **หมายเหตุ:** กรณี Customer-initiated (ขอเช็คบิลจาก QR Panel) — ลูกค้าจะเห็นหน้า "รอพนักงานจัดเตรียมบิล..." จนกว่าแคชเชียร์จะกด "ยืนยันบิล" → ลูกค้าเห็นสรุปบิลจริง real-time ผ่าน SignalR (ดู [REQ-payment-system](REQ-payment-system.md) Section 6)

---

## 15. Permissions

> **ชื่อ Permission จริงที่ implement:** ใช้ prefix `order-manage` (ไม่ใช่ `order`)

| Permission (REQ) | Permission (จริง) | คำอธิบาย |
|-----------|-----------|---------|
| `order.read` | `order-manage.read` | ดูรายการออเดอร์, Order Detail |
| `order.create` | `order-manage.create` | สั่งอาหาร (staff ordering) |
| `order.update` | `order-manage.update` | ส่งครัว, void, mark served, split bill, request bill |
| `order.delete` | `order-manage.delete` | Cancel order/item (ต้อง manager auth เพิ่ม) |

> **Kitchen permissions (จริง):** รวมเป็น 1 module (`kitchen-order`) ไม่แยกตามหมวดอาหาร:
> `kitchen-order.read`, `kitchen-order.update` (2 permissions)
>
> **เหตุผลที่เปลี่ยน:** ลดความซับซ้อนในการจัดการ permission — สามารถแยกย่อยภายหลังถ้าจำเป็น

### Migration — Seed Permissions

- Module: "จัดการออเดอร์" (`order-manage`, ModuleId 14) — 4 permissions (PermissionId 18–21)
- Module: "ครัว" (`kitchen-order`, ModuleId 17) — 2 permissions (PermissionId 30–31)

---

## 16. จุดเชื่อมต่อระบบอื่น

| ระบบ | ความสัมพันธ์ |
|------|-------------|
| **Table System** | เปิดโต๊ะ → สร้าง Order auto, ย้ายโต๊ะ → ย้าย Order, ปิดโต๊ะ → close Order, Link Tables → รวม bills, Operational Tags derive จาก Order item statuses |
| **Menu System** | ดึง menu items + sub-categories + option groups + prices สำหรับแสดงในหน้าสั่ง, Snapshot ราคา/ชื่อเมื่อสั่ง |
| **OrderHub (SignalR)** | KDS real-time: ออเดอร์ใหม่, status update, ยกเลิก → KDS client connect ตรงกับ OrderHub |
| **NotificationHub (SignalR)** | Notification bar: `NEW_ORDER` → Kitchen, `ORDER_READY` → Floor, `CALL_WAITER` → Floor, `REQUEST_BILL` → Cashier, `ORDER_CANCELLED` → Kitchen |
| **Payment System** (REQ-payment-system) | Order BILLING → แคชเชียร์เข้า Payment Process ตั้ง ServiceCharge + ส่วนลด → กด "ยืนยันบิล" สร้าง TbOrderBill (snapshot) → ชำระเงิน → Bill PAID → Order COMPLETED → Table CLEANING, กรณี Customer-initiated: ลูกค้ารอจนแคชเชียร์ยืนยันบิล → เห็นสรุปผ่าน SignalR (ดู REQ-payment-system Section 2.1, 6) |
| **Shop Settings / Master Data** | ServiceChargeRate = Cashier เลือกจาก Service Charge Master Data dropdown ตอนขอบิล, VatRate = 7% คงที่ (hardcode) → snapshot ลง TbOrderBill, Operating hours (ช่วงเวลาขาย) |
| **Auth System** | Cancel ต้อง manager auth (verify PIN/password), OrderedBy tracking |
| **Self-Order System** (REQ-self-order-system) | Customer QR Self-Ordering: QR Token Flow, Customer Session (TbCustomerSession), Nickname, Mobile Web App, Guest Bearer Token, OrderedBy format (`"customer:{sessionId}"`), API Endpoints `/api/customer/*` |
| **Dashboard System** ([REQ-dashboard-system](REQ-dashboard-system.md)) | Aggregate queries จาก TbOrder (count, guest count), TbOrderItem (quantity, CategoryType, OrderedBy), TbOrderBill (GrandTotal, PaidAt) สำหรับ KPI, กราฟยอดขาย, เมนูขายดี, ช่วงเวลาขายดี |

---

## 17. Validation Rules & Error Scenarios

### 17.1 Order

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| สร้าง order บนโต๊ะที่ไม่ OCCUPIED | "โต๊ะนี้ยังไม่เปิด" | 422 |
| สั่งเพิ่มตอน order BILLING | "ออเดอร์อยู่ระหว่างรอชำระเงิน ไม่สามารถสั่งเพิ่มได้" | 422 |
| สั่งเมนูที่ปิดขาย | "เมนูนี้ปิดขายแล้ว" | 422 |
| สั่งเมนูนอกช่วงเวลา | "เมนูนี้ไม่เปิดขายในช่วงเวลานี้" | 422 |

### 17.2 Order Item

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| Void item ที่ไม่ใช่ PENDING | "รายการนี้ส่งครัวไปแล้ว ไม่สามารถ void ได้" | 422 |
| Cancel item ที่ READY/SERVED | "รายการนี้ทำเสร็จแล้ว ไม่สามารถยกเลิกได้" | 422 |
| Cancel ไม่มี manager auth | "ต้องได้รับอนุมัติจากผู้จัดการ" | 403 |
| Cancel ไม่ระบุเหตุผล | "กรุณาระบุเหตุผลในการยกเลิก" | 400 |

### 17.3 Customer Self-Order

> ดูรายละเอียด Validation Rules + Edge Cases ที่ [REQ-self-order-system](REQ-self-order-system.md) Section 19–20

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| QR Token ไม่ถูกต้อง/หมดอายุ | "QR Code หมดอายุ กรุณาแจ้งพนักงาน" | 401 |
| สแกน QR โต๊ะที่ไม่เปิด | "โต๊ะยังไม่พร้อม กรุณาแจ้งพนักงาน" | 422 |
| Session หมดอายุ/ถูก revoke | "เซสชันหมดอายุ กรุณาสแกน QR ใหม่" | 401 |
| เรียกพนักงานภายใน cooldown (60 วินาที) | "กรุณารอสักครู่ก่อนเรียกอีกครั้ง" | 429 |
| ขอบิลซ้ำ | "ขอบิลเรียบร้อยแล้ว กรุณารอพนักงาน" | 422 |
| Option group required แต่ไม่เลือก | "กรุณาเลือก {ชื่อกลุ่ม}" | 400 |
| เลือก option เกิน MaxSelect | "เลือกได้สูงสุด {MaxSelect} รายการ" | 400 |
| Submit เมนูที่ถูกปิด/หมด | "เมนู {ชื่อ} ไม่พร้อมให้บริการ" | 422 |

---

## 18. การคำนวณบิล

### 18.1 หลักการ

- **SubTotal** (TbOrder) — คำนวณ real-time จาก items ที่ไม่ใช่ VOIDED/CANCELLED, อัพเดตทุกครั้งที่ items เปลี่ยน
- **ServiceCharge** — Cashier เลือก rate จาก Master Data dropdown ตอนขอบิล (billing time) → snapshot ลง TbOrderBill.ServiceChargeRate
- **VAT** — คงที่ 7% (hardcode) → snapshot ลง TbOrderBill.VatRate
- เหตุผลที่ snapshot: ร้านอาจปรับ ServiceCharge rate ภายหลัง, snapshot ตอนบิลถูกต้องกว่า

### 18.2 สูตร (ไม่มีส่วนลด)

```
SubTotal = Σ (UnitPrice + OptionsTotalPrice) × Quantity    ← รวม items ที่ไม่ใช่ VOIDED/CANCELLED
ServiceChargeAmount = SubTotal × (ServiceChargeRate / 100)  ← Cashier เลือกจาก Master Data dropdown ตอนขอบิล
VatAmount = (SubTotal + ServiceChargeAmount) × (7 / 100)    ← VAT คงที่ 7%
GrandTotal = SubTotal + ServiceChargeAmount + VatAmount
```

### 18.3 สูตร (มีส่วนลด — ดู REQ-payment-system Section 4.4)

```
SubTotal = Σ item.TotalPrice                                ← items ที่ไม่ใช่ VOIDED/CANCELLED
TotalDiscount = Σ item discounts + bill discount             ← จาก TbOrderDiscount
NetAmount = SubTotal - TotalDiscount
ServiceChargeAmount = NetAmount × (ServiceChargeRate / 100)  ← คำนวณจาก NetAmount ไม่ใช่ SubTotal
VatAmount = (NetAmount + ServiceChargeAmount) × (7 / 100)    ← VAT คงที่ 7%
GrandTotal = NetAmount + ServiceChargeAmount + VatAmount
```

> **หมายเหตุ:** ส่วนลดจัดการโดย Payment module (REQ-payment-system) — ถ้าไม่มีส่วนลด NetAmount = SubTotal (สูตรเหมือนกัน)

### 18.4 ตัวอย่าง (ไม่มีส่วนลด)

| รายการ | ราคา | จำนวน | รวม |
|--------|------|-------|------|
| ข้าวผัดกุ้ง | 120 | 2 | 240 |
| + ไข่ดาว | +10 | 2 | +20 |
| ต้มยำกุ้ง | 150 | 1 | 150 |

```
SubTotal = (120+10)×2 + 150×1 = 260 + 150 = 410
ServiceCharge (10%) = 410 × 0.10 = 41
VAT (7%) = (410 + 41) × 0.07 = 31.57
GrandTotal = 410 + 41 + 31.57 = 482.57
```

---

## 19. สรุปไฟล์ที่ต้องสร้าง/แก้ไข

### Backend

| ไฟล์ | หมายเหตุ |
|------|----------|
| `POS.Main.Core/Enums/EOrderStatus.cs` | |
| `POS.Main.Core/Enums/EOrderItemStatus.cs` | |
| `POS.Main.Core/Enums/EBillType.cs` | |
| `POS.Main.Core/Enums/EBillStatus.cs` | |
| `POS.Main.Dal/Entities/Order/TbOrder.cs` | |
| `POS.Main.Dal/Entities/Order/TbOrderItem.cs` | |
| `POS.Main.Dal/Entities/Order/TbOrderItemOption.cs` | |
| `POS.Main.Dal/Entities/Order/TbOrderBill.cs` | |
| `POS.Main.Dal/EntityConfigurations/` | 4 configuration files |
| `POS.Main.Repositories/` | 4 repository interfaces + implementations |
| `POS.Main.Business.Order/` | Business module (Services, Models, Mappers) |
| `RBMS.POS.WebAPI/Controllers/` | OrdersController, KitchenController, CustomerOrderController |
| `RBMS.POS.WebAPI/Hubs/OrderHub.cs` | SignalR Hub สำหรับ KDS real-time (แยกจาก NotificationHub ที่อยู่ใน REQ-noti-system) |
| Migration | สร้างตาราง + seed permissions |

### Frontend

| Component | หมายเหตุ | สถานะ |
|-----------|----------|-------|
| OrderListComponent | รายการออเดอร์ | ✅ |
| OrderDetailComponent | รายละเอียด + split bill | ✅ |
| StaffOrderComponent | หน้าสั่งอาหาร (staff) | ✅ |
| MenuItemDialogComponent | Dialog เลือก options + จำนวน | ✅ |
| SplitBillDialogComponent | Dialog แยกบิล | ✅ |
| CancelReasonDialogComponent | Dialog ยกเลิก + เหตุผล | ✅ |
| KitchenDisplayComponent | KDS (full-screen) | ❌ รอ Phase KDS |
| CustomerPanelComponent | Self-Order (ลูกค้า, mobile-first) | ❌ รอ Phase Self-Order |
| CustomerCartComponent | ตะกร้าลูกค้า | ❌ รอ Phase Self-Order |

---

## 20. สถานะ Implementation (อัปเดต 2026-03-20)

### สิ่งที่ทำเสร็จแล้ว

| หมวด | รายการ | สถานะ |
|------|--------|-------|
| Backend Enums | EOrderStatus, EOrderItemStatus, EBillType, EBillStatus | ✅ |
| Backend Entities | TbOrder, TbOrderItem, TbOrderItemOption, TbOrderBill | ✅ |
| Entity Configs | 4 configuration files | ✅ |
| Repositories | 4 interfaces + 4 implementations + UnitOfWork | ✅ |
| Business Service | IOrderService (14 methods) + OrderService | ✅ |
| Controller | OrdersController (14 endpoints) | ✅ |
| SignalR | OrderHub + OrderNotificationService (4 events) | ✅ |
| Migration | AddOrderSystem (ตาราง + FK) | ✅ |
| DI Registration | Program.cs | ✅ |
| Permissions | order-manage (4) + kitchen-order (2) | ✅ |
| Frontend API | Generated OrdersService (14 methods) | ✅ |
| Frontend Pages | OrderList, OrderDetail, StaffOrder | ✅ |
| Frontend Dialogs | MenuItemDialog, SplitBillDialog, CancelReasonDialog | ✅ |
| Auto-create Order | เปิดโต๊ะ → สร้าง Order อัตโนมัติ (ใน TableService) | ✅ |
| QR Code Dialog | แสดง QR Token เมื่อเปิดโต๊ะ | ✅ |

### สิ่งที่ยังไม่ได้ทำ (รอ Phase ถัดไป)

| หมวด | รายการ | REQ Section | หมายเหตุ |
|------|--------|-------------|----------|
| KDS Frontend | KitchenDisplayComponent | §7 | รอ REQ-kitchen-system |
| KDS Endpoints | `/api/kitchen/*` | §12.3 | รอ REQ-kitchen-system |
| Self-Order | CustomerPanelComponent, Customer API | §6, §12.4 | รอ REQ-self-order-system |
| NotificationHub | Noti bar (NEW_ORDER, CALL_WAITER, ฯลฯ) | §16 | รอ Notification module |
| SignalR Client (FE) | Frontend connect + listen events | §16 | `@microsoft/signalr` ติดตั้งแล้ว ยังไม่ได้ใช้ |
| Real-time Floor Plan | Floor plan อัพเดตสถานะโต๊ะ real-time | - | ต้อง broadcast table status จาก TableService |
