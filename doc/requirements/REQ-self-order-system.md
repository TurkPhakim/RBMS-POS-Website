# ระบบ QR Self-Order สำหรับลูกค้า (Customer QR Self-Order System)

> สถานะ: **Draft** | อัปเดตล่าสุด: 2026-03-19

---

## 1. ภาพรวม

### 1.1 บทนำ

ระบบ QR Self-Order ให้ลูกค้าสแกน QR Code ที่โต๊ะ → เปิด Mobile Web → สั่งอาหารเอง โดยไม่ต้องเรียกพนักงาน รองรับหลายเครื่องต่อโต๊ะ (Multi-device) พร้อมติดตามสถานะออเดอร์แบบ real-time ผ่าน SignalR

**สถาปัตยกรรม 2 Frontend Apps:**

| App | Port | ผู้ใช้ | Stack |
|-----|------|--------|-------|
| **RBMS-POS-Client** | 4300 | Staff (POS, KDS, Admin) | Angular 19.1 + Tailwind + PrimeNG |
| **RBMS-POS-Mobile-Web** | 4400 | ลูกค้า (Mobile Web) | Angular 19.1 + Tailwind + PrimeNG |

ทั้ง 2 apps ใช้ **Backend เดียวกัน** (port 5300) + shared OpenAPI (gen-api)

**อ้างอิงการออกแบบ:** FoodStory POS (QR Multi-device Self-Ordering), BBQ Plaza (QR Ordering)

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน (REQ เดิม) | ที่ต้องการ |
|--------|---------------------|-----------|
| QR Code | Static URL (REQ-table Section 8) | Signed JWT Token |
| Customer Identity | ไม่มี | Nickname dialog + TbCustomerSession |
| Mobile Web App | ไม่มี | RBMS-POS-Mobile-Web (Angular, port 4400) |
| Multi-device | ไม่ระบุ | สแกน QR เดียวกัน = เข้าโต๊ะเดียวกัน |
| Order Tracking | ไม่มี | Real-time status per item |
| ส่งครัว | ไม่ระบุ | อัตโนมัติเมื่อ confirm |
| Auth | ไม่ต้อง auth (validate ด้วย tableId) | Guest JWT token + TbCustomerSession |
| Responsive | ไม่ระบุ | Mobile-first responsive design |

### 1.3 ขอบเขต Phase 1

**ทำ:**
- สแกน QR → สร้าง session → ตั้งชื่อเล่น
- ดูเมนู (category tabs + sub-category chips + search)
- เลือก options + note + จำนวน → ใส่ตะกร้า
- ยืนยันสั่ง → ส่งครัวอัตโนมัติ
- ติดตามสถานะ real-time (per item)
- เรียกพนักงาน (cooldown 60 วินาที)
- ขอเช็คบิล
- Recommended badge (จาก EMenuTag)
- สั่งเพิ่มได้หลายรอบ (append เข้า order เดียวกัน)

**ไม่ทำ (Phase ถัดไป):**
- Online payment จากมือถือ (ลูกค้าจ่ายผ่าน mobile)
- Review / Rating
- Loyalty points
- Multi-language switch (แสดงทั้ง 2 ภาษาพร้อมกัน ไม่มีสลับ)
- Order history (ดูออเดอร์ครั้งก่อน)
- Menu favoriting

### 1.4 ความเป็นเจ้าของ (Ownership)

| เรื่อง | เจ้าของ |
|--------|---------|
| QR Token generation/revocation, TbTable fields | [REQ-table-system](REQ-table-system.md) |
| TbOrder, TbOrderItem entities, status flow | [REQ-order-system](REQ-order-system.md) |
| OrderHub events payload | [REQ-kitchen-system](REQ-kitchen-system.md) |
| Menu entities, categories, options, tags | [REQ-menu-system](REQ-menu-system.md) |
| Payment flow | [REQ-payment-system](REQ-payment-system.md) |
| Notification events (CALL_WAITER, REQUEST_BILL) | [REQ-noti-system](REQ-noti-system.md) |
| **TbCustomerSession entity** | **เอกสารนี้** |
| **Customer Mobile Web app (RBMS-POS-Mobile-Web)** | **เอกสารนี้** |
| **Customer API endpoints (`/api/customer/*`)** | **เอกสารนี้** |
| **Guest token auth (`[CustomerAuthorize]`)** | **เอกสารนี้** |
| **OrderedBy format definition** | **เอกสารนี้** (define) + REQ-order-system (store field) |

---

## 2. QR Token Flow

### 2.1 Token Generation

- พนักงานเปิดโต๊ะ → Backend generate **Signed JWT** → เก็บใน `TbTable.QrToken`
- JWT Claims: `{ venueId, tableId, exp, nonce }`
- Token lifetime: **12 ชั่วโมง** (configurable ใน appsettings)
- QR URL format: `{mobileWebBaseUrl}/scan?token={jwt}`

> **หมายเหตุ:** Token generation เป็นของ [REQ-table-system](REQ-table-system.md) Section 8 — เอกสารนี้ระบุ format + claims

### 2.2 Token Lifecycle

```
เปิดโต๊ะ ──► Generate JWT ──► เก็บใน TbTable.QrToken + QrTokenExpiresAt
    │
    ▼
ลูกค้าสแกน ──► Validate JWT ──► สร้าง TbCustomerSession + Guest token
    │
    ▼
ปิดโต๊ะ ──► TbTable.QrToken = null ──► Sessions ทั้งหมดถูก deactivate
```

- **Revoke:** ปิดโต๊ะ → set `TbTable.QrToken = null`, `QrTokenExpiresAt = null`
- **Deactivate sessions:** ปิดโต๊ะ → set `IsActive = false` ทุก TbCustomerSession ของโต๊ะนี้

### 2.3 QR Display

- แสดงบนหน้า **Table Detail** ของ POS (Staff)
- QR Code generate **client-side** ด้วย `qr-code-styling` (ไม่เก็บ image ใน DB)
- เห็นเฉพาะเมื่อโต๊ะ status = OCCUPIED
- **QR Card แสดง:** Logo ร้าน + ชื่อร้าน + QR (สี primary, rounded dots, logo กลาง) + ชื่อโซน/โต๊ะ + "สแกนเพื่อสั่งอาหาร" + วันที่
- ข้อมูลร้าน (ชื่อ, logo) ดึงจาก `TbShopSettings`
- รองรับ export PNG สำหรับ print ตั้งโต๊ะ
- ดูรายละเอียด QR Card Layout + Styling Spec ที่ [REQ-table-system](REQ-table-system.md) Section 8.3

---

## 3. Customer Session

### 3.1 Auth Flow

```
ลูกค้าสแกน QR
    │
    ▼
Mobile Web เปิด /scan?token={jwt}
    │
    ▼
POST /api/customer/auth  { qrToken, deviceFingerprint }
    │
    ▼
Backend validate:
    ├── JWT signature ถูกต้อง?
    ├── JWT ยังไม่หมดอายุ?
    ├── nonce ตรงกับ TbTable.QrTokenNonce?  ← ป้องกัน QR เก่า
    └── Table status = OCCUPIED?
    │
    ▼ (ผ่านทั้งหมด)
สร้าง TbCustomerSession
    │
    ▼
Issue Guest Bearer Token (JWT, 4 hr exp)
    │
    ▼
Return { sessionToken, tableId, tableName, nickname? }
    │
    ▼
ถ้า nickname = null → แสดง Nickname Dialog
```

### 3.2 Multi-device

- QR เดียวกัน สแกนจากหลาย device → แต่ละ device ได้ **session แยก** (แต่ละคนมี sessionId ต่างกัน)
- ทุก device เห็น **Order รวมเดียวกัน** (ผ่าน SignalR — group by tableId)
- Cart เป็น **per-device** (localStorage) — ยังไม่ submit ถือว่าส่วนตัว
- เมื่อ submit → items เข้า shared Order + ทุก device เห็นทันที

### 3.3 Session Validation

- ทุก API call ใช้ guest Bearer token → Backend ตรวจ:
  1. Token ยังไม่ expire
  2. Session `IsActive = true`
  3. Table still `OCCUPIED`
- ถ้า session หมดอายุ/ถูก revoke → return **401** → Mobile Web แสดงหน้า "โต๊ะถูกปิดแล้ว"

### 3.4 Same Device Re-scan

- ถ้า device เดิมสแกน QR อีกครั้ง (มี session อยู่แล้ว + ยัง active):
  - Backend return session เดิม (ไม่สร้างใหม่) — match ด้วย `deviceFingerprint`
  - Nickname ถูก restore จาก localStorage

---

## 4. Nickname System

### 4.1 Flow

1. Session ใหม่ที่ยังไม่มี nickname → แสดง **dialog กลางจอ** (mandatory, ปิดไม่ได้)
2. ลูกค้าพิมพ์ชื่อเล่น (1-20 ตัวอักษร, บังคับ)
3. POST `/api/customer/nickname` → บันทึกใน `TbCustomerSession.Nickname` + localStorage
4. ชื่อเล่นแสดงบน **header Mobile Web** + แนบกับ order items ที่สั่ง

### 4.2 OrderedBy Format

รูปแบบ `OrderedBy` field ใน TbOrderItem:

| ผู้สั่ง | Format | ตัวอย่าง |
|--------|--------|---------|
| ลูกค้า | `customer:{sessionId}` | `customer:42` |
| พนักงาน | `staff:{userId}` | `staff:1` |

**Backend resolve เป็นชื่อตอนส่ง response:**
- `customer:42` → "น้อง" (ดึง nickname จาก TbCustomerSession)
- `staff:1` → "พนักงาน สมชาย" (ดึงชื่อจาก TbUser)

### 4.3 แสดงใน Order Tracking

- แต่ละ item แสดง "สั่งโดย {ชื่อเล่น}" หรือ "สั่งโดย พนักงาน {ชื่อ}"
- ทุก device เห็นรายการรวมของทั้งโต๊ะ (ไม่ใช่แค่ของตัวเอง)

---

## 5. Mobile Web Layout

### 5.1 App Shell

```
┌─────────────────────────────┐
│  RBMS POS    โต๊ะ A3    น้อง │  ← Header: logo, table name, nickname
├─────────────────────────────┤
│                             │
│        [Content Area]       │  ← Scrollable content
│                             │
├─────────────────────────────┤
│  [เมนู] [ตะกร้า(3)] [สถานะ] │  ← Bottom navigation (fixed)
└─────────────────────────────┘
```

### 5.2 Bottom Navigation

| Tab | Icon | หน้า | Badge |
|-----|------|------|-------|
| เมนู | `menu-bar` | Menu Browse | - |
| ตะกร้า | `shopping-basket` | Cart | จำนวน item ในตะกร้า |
| สถานะ | `order-dinner` | Order Tracking | จำนวน items ที่ SENT + PREPARING |

### 5.3 Header Actions

- **เรียกพนักงาน** (icon: `pi pi-bell`) → ปุ่มบน header
- **ขอเช็คบิล** (icon: `invoice-bill`) → ปุ่มบน header

### 5.4 Responsive Breakpoints

| ขนาดจอ | Breakpoint | Menu Grid |
|--------|-----------|-----------|
| Mobile เล็ก | < 480px | 1 column |
| Mobile ใหญ่ | 480–768px | 2 columns |
| Tablet | > 768px | 3 columns |

> **สำคัญ:** Responsive เป็น requirement หลัก — ทุก component ต้องรองรับหลายขนาดจอ

---

## 6. Menu Display

### 6.1 Category Navigation

- **Main Category tabs:** อาหาร / เครื่องดื่ม / ของหวาน (จาก `EMenuCategory` enum)
- **Sub-Category:** horizontal scroll chips ด้านล่าง tabs
- **"ทั้งหมด"** chip เป็นค่าเริ่มต้น (แสดงทุก sub-category)
- Default tab: อาหาร

### 6.2 Search

- Search bar ด้านบน content area
- ค้นหาด้วย **Enter key** (ตาม CLAUDE.md convention — ไม่ใช้ debounce)
- ค้นจากชื่อไทย + ชื่ออังกฤษ
- ผลค้นหาแสดงข้าม category

### 6.3 Menu Card

```
┌───────────────────────┐
│  [รูปเมนู]            │  ← รูปจาก TbFile (ถ้าไม่มี → placeholder)
│  ────────────────────  │
│  ข้าวผัดกุ้ง           │  ← ชื่อไทย (text-xl)
│  Fried Rice w/ Shrimp  │  ← ชื่ออังกฤษ (text-lg, สีจาง)
│  ฿120                  │  ← ราคา
│  แนะนำ                 │  ← Recommended badge (ถ้ามี EMenuTag.Recommended)
└───────────────────────┘
```

### 6.4 Filters

- แสดงเฉพาะเมนูที่ `IsAvailable = true`
- แสดงเฉพาะเมนูที่ sub-category `IsActive = true`
- แสดงเฉพาะเมนูที่อยู่ใน **selling period ปัจจุบัน** (ดู REQ-menu-system)
- เรียงตาม `SortOrder`
- เมนูที่มี `EMenuTag.SlowPreparation` → แสดง badge "ใช้เวลานาน"

---

## 7. Menu Detail & Option Groups

### 7.1 Menu Detail (Bottom Sheet)

- เปิดเมื่อกด menu card → **slide up จากล่าง** (mobile UX pattern)
- แสดง: รูปใหญ่, ชื่อไทย (text-xl) + ชื่ออังกฤษ (text-lg), คำอธิบาย, ราคา, tags

### 7.2 Option Groups

- แสดง option groups ที่ผูกกับเมนูนี้ (จาก TbMenuOptionGroup → TbOptionGroup → TbOptionItem)
- Required group: แสดง badge **"(จำเป็น)"** สีแดง
- `MinSelect/MaxSelect`: แสดงคำแนะนำ เช่น "เลือก 1-3 อย่าง"
- Option item แสดง: ชื่อ + ราคาเพิ่ม (เช่น "+฿15")
- **Single select** (MaxSelect=1): ใช้ radio buttons
- **Multi select** (MaxSelect>1): ใช้ checkboxes

### 7.3 Note

- Textarea สำหรับหมายเหตุ (เช่น "ไม่ใส่ผัก", "เผ็ดมาก")
- Optional, ไม่บังคับ
- สูงสุด 200 ตัวอักษร

### 7.4 Quantity + Add to Cart

- +/- ปุ่มปรับจำนวน (min 1, max 99)
- ปุ่ม **"เพิ่มลงตะกร้า ฿{total}"** → แสดงราคารวม (price + options) x qty
- Validate required options ก่อนเพิ่ม → ถ้าไม่ครบ → แสดง error ที่ option group

---

## 8. Cart & Submit

### 8.1 Cart Layout

```
┌─────────────────────────────┐
│  ตะกร้าของฉัน (3 รายการ)     │
├─────────────────────────────┤
│  ข้าวผัดกุ้ง ×2       ฿240   │
│    + ไข่ดาว (+฿15×2)         │
│    ไม่เผ็ด                    │
│    [แก้ไข]  [ลบ]              │
│  ─────────────────────────── │
│  ต้มยำกุ้ง ×1         ฿180   │
│    [แก้ไข]  [ลบ]              │
├─────────────────────────────┤
│  รวม 3 รายการ        ฿420   │
│  [ยืนยันสั่งอาหาร]           │
└─────────────────────────────┘
```

### 8.2 Cart Operations

- **แก้ไข:** เปิด Menu Detail พร้อม options/note/qty เดิม → อัพเดต
- **ลบ:** ลบออกจาก cart
- Cart เก็บใน **localStorage** → persist ข้าม page refresh
- Cart ล้างเมื่อ: submit สำเร็จ, session expire, ลูกค้ากดล้าง
- **Cart ว่าง:** แสดง empty state "ยังไม่มีรายการในตะกร้า" + ปุ่ม "ดูเมนู"

### 8.3 Submit Flow

1. กดยืนยัน → **Confirmation dialog** "ยืนยันสั่งอาหาร 3 รายการ ฿420?"
2. POST `/api/customer/orders` → ส่ง cart items
3. Backend:
   - สร้าง order items (status = PENDING)
   - Auto-set status = **SENT** (ส่งครัวอัตโนมัติ)
   - Set `SentToKitchenAt = now`
   - Set `OrderedBy = "customer:{sessionId}"`
   - **Price snapshot:** lock ราคา + ชื่อเมนู + option prices ณ เวลา submit
   - Publish SignalR → OrderHub (KDS) + NotificationHub (NEW_ORDER)
4. สำเร็จ → ล้าง cart → navigate ไปหน้า **Order Tracking**
5. ล้มเหลว → แสดง error, cart ยังอยู่

### 8.4 สั่งเพิ่ม

- ลูกค้าสั่งได้ **หลายรอบ** → items เพิ่มเข้า Order เดิม (same orderId per table session)
- ทุกรอบที่สั่ง = batch ใหม่ใน order เดียวกัน
- ถ้า Order status = BILLING → **block** การสั่งเพิ่ม + แสดง "กำลังรอชำระเงิน"

### 8.5 ยกเลิกหลัง Submit

- **ลูกค้ายกเลิกไม่ได้** หลัง submit (เหมือน FoodStory)
- ถ้าต้องการยกเลิก → เรียกพนักงาน → พนักงาน cancel ผ่าน POS (ต้อง manager auth)

---

## 9. Order Tracking

### 9.1 Layout

```
┌─────────────────────────────┐
│  สถานะออเดอร์  โต๊ะ A3       │
├─────────────────────────────┤
│  ── รอบที่ 2 (14:35) ────── │
│  ● กำลังทำ  ข้าวผัดกุ้ง ×2   │  ← PREPARING (warning)
│     สั่งโดย น้อง              │
│  ○ รอทำ    ต้มยำกุ้ง ×1      │  ← SENT (muted)
│     สั่งโดย น้อง              │
│  ── รอบที่ 1 (14:20) ────── │
│  ✓ เสร็จแล้ว ส้มตำ ×1        │  ← READY (success)
│     สั่งโดย พี่แอม            │
│  ✓ เสิร์ฟแล้ว แกงเขียว ×1    │  ← SERVED (muted)
│     สั่งโดย พนักงาน สมชาย    │
└─────────────────────────────┘
```

### 9.2 Status Display

| Status | Icon | สี | Label |
|--------|------|-----|-------|
| SENT | ○ | `text-surface-sub` | รอทำ |
| PREPARING | ● (animated pulse) | `text-warning` | กำลังทำ |
| READY | ✓ | `text-success` | เสร็จแล้ว |
| SERVED | ✓✓ | `text-surface-sub` | เสิร์ฟแล้ว |
| CANCELLED | ✕ | `text-danger` + strikethrough | ยกเลิก |

### 9.3 Real-time Updates

- SignalR `ItemStatusChanged` → อัพเดต status per item ทันที
- จัดกลุ่มตาม **รอบ (batch)** — เรียง FIFO (เก่าสุดอยู่บน)
- แสดง OrderedBy (nickname / staff name) ต่อ item
- Items จาก device อื่นหรือ staff → ปรากฏอัตโนมัติผ่าน SignalR `NewOrderItems`

---

## 10. เรียกพนักงาน & ขอเช็คบิล

### 10.1 เรียกพนักงาน

- ปุ่มบน header → POST `/api/customer/call-waiter`
- Backend: broadcast via **NotificationHub** → staff ได้รับ noti "โต๊ะ A3 เรียกพนักงาน"
- **Cooldown: 60 วินาที** (กัน spam) → ปุ่ม disabled + countdown timer
- ลูกค้าเห็น: toast "เรียกพนักงานแล้ว รอสักครู่"
- Floor Plan: แสดง tag `CALL_WAITER` ที่โต๊ะนั้น

### 10.2 ขอเช็คบิล

- ปุ่มบน header → **Confirmation dialog** "ขอเช็คบิลใช่หรือไม่?" → POST `/api/customer/request-bill`
- Backend:
  - Table status → BILLING
  - Order status → BILLING
  - Broadcast via NotificationHub → Cashier group ได้รับ noti `REQUEST_BILL` "โต๊ะ A3 ขอเช็คบิล"
- **ลูกค้าเห็นหน้า "รอพนักงานจัดเตรียมบิล..."** — แสดง loading + ข้อความรอ + ชื่อโต๊ะ + เวลาขอบิล (ดู [REQ-payment-system](REQ-payment-system.md) Section 6.2)
- **ขอได้ครั้งเดียว** — หลังขอ ปุ่มหายไป เปลี่ยนเป็นหน้ารอบิล
- Block การสั่งเพิ่มหลัง request bill
- **เมื่อแคชเชียร์ยืนยันบิล** → SignalR event `BILL_PREPARED` → เปลี่ยนเป็น **หน้าสรุปบิล** อัตโนมัติ (ดู [REQ-payment-system](REQ-payment-system.md) Section 6.3) — ลูกค้าเห็นยอดชำระ + QR Code ร้าน + ปุ่มอัปโหลดสลิป

---

## 11. SignalR Integration

### 11.1 Connection

- **OrderHub** (`/hubs/order`) — เดียวกับ KDS
- Connect เมื่อ session active (หลังตั้งชื่อเล่นเสร็จ)
- Disconnect เมื่อ session expire/revoke
- **Group by tableId** — ทุก device ที่ดูโต๊ะเดียวกันรับ events เดียวกัน
- Auto-reconnect with exponential backoff retry

### 11.2 Events ที่ Customer รับ (Server → Client)

| Event | เมื่อไหร่ | ทำอะไร |
|-------|----------|--------|
| `ItemStatusChanged` | item เปลี่ยนสถานะ | อัพเดต Order Tracking |
| `OrderUpdated` | order metadata เปลี่ยน | อัพเดต header |
| `NewOrderItems` | รอบใหม่เข้า (จาก device อื่น/staff) | เพิ่มใน Order Tracking |
| `ItemCancelled` | staff ยกเลิก item | แสดง strikethrough + toast notification |
| `BillPrepared` | แคชเชียร์ยืนยันบิล (สร้าง TbOrderBill) | เปลี่ยนจากหน้ารอบิล → หน้าสรุปบิล (ดู [REQ-payment-system](REQ-payment-system.md) §6.3) |
| `PaymentCompleted` | ชำระเงินสำเร็จ | แสดง "ชำระเงินเสร็จสิ้น" + ปุ่มดูใบเสร็จ |
| `TableClosed` | staff ปิดโต๊ะ | Redirect ไปหน้า Expired |

### 11.3 Customer Actions

- **ไม่ส่ง event ผ่าน SignalR** — ทุก action ผ่าน REST API
- API response สำเร็จ → Backend publish events → ทุก client (รวมตัวเอง) รับผ่าน SignalR

---

## 12. Database Changes

### 12.1 ตารางใหม่ — TbCustomerSession

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| CustomerSessionId | int (PK, Identity) | ไม่ | | |
| TableId | int (FK → TbTable) | ไม่ | | |
| SessionToken | nvarchar(500) | ไม่ | | Guest JWT string |
| Nickname | nvarchar(20) | ใช่ | null | ตั้งภายหลังผ่าน API |
| DeviceFingerprint | nvarchar(200) | ใช่ | null | ระบุ device (สำหรับ re-scan) |
| QrTokenNonce | nvarchar(100) | ไม่ | | copy ของ nonce จาก QR JWT ตอนสแกน (audit trail — ดูว่า session สร้างจาก QR ใด) |
| IsActive | bit | ไม่ | 1 | false เมื่อปิดโต๊ะ/expire |
| CreatedAt | datetime2 | ไม่ | GETUTCDATE() | |
| ExpiresAt | datetime2 | ไม่ | | CreatedAt + 4 hours |

**หมายเหตุ:**
- **ไม่ inherit BaseEntity** — ไม่ต้องการ audit fields
- **Hard delete:** `CleanupBackgroundService` ลบ sessions ที่ `IsActive = false` AND `ExpiresAt < now - 24hr` (ทุก 6 ชม.) — ดู [auto-cleanup.md](../architecture/auto-cleanup.md)
- **ER:** `TbTable (1) ──── (N) TbCustomerSession`
- **Nonce validation:** ตรวจกับ `TbTable.QrTokenNonce` เท่านั้น (ต้นฉบับ) — ส่วน `TbCustomerSession.QrTokenNonce` เป็น copy เก็บไว้เพื่อ audit trail ไม่ได้ใช้ validate

### 12.2 TbTable เพิ่ม fields (เป็นของ REQ-table-system)

| Column | Type | Nullable | หมายเหตุ |
|--------|------|----------|----------|
| QrToken | nvarchar(1000) | ใช่ | JWT string (null = ยังไม่ generate) |
| QrTokenExpiresAt | datetime2 | ใช่ | |
| QrTokenNonce | nvarchar(100) | ใช่ | Random nonce สำหรับ validate QR (ต้นฉบับที่ใช้ตรวจ — ดู §3.1) |

> ดูรายละเอียดที่ [REQ-table-system](REQ-table-system.md) Section 8

### 12.3 TbOrderItem เพิ่ม field (เป็นของ REQ-order-system)

| Column | Type | Nullable | หมายเหตุ |
|--------|------|----------|----------|
| OrderedBy | nvarchar(100) | ไม่ | `"customer:{sessionId}"` หรือ `"staff:{userId}"` — ต้องมีค่าเสมอ |

> ดูรายละเอียดที่ [REQ-order-system](REQ-order-system.md) Section 3.3

---

## 13. API Endpoints

### 13.1 Customer Auth (Public)

| Method | Route | Auth | รายละเอียด |
|--------|-------|------|-----------|
| POST | `/api/customer/auth` | ไม่ต้อง | Validate QR token → create session → return guest JWT |

**Request:**
```json
{ "qrToken": "eyJ...", "deviceFingerprint": "abc123" }
```

**Response:**
```json
{
  "sessionToken": "eyJ...",
  "tableId": 5,
  "tableName": "A3",
  "nickname": null
}
```

### 13.2 Customer Profile

| Method | Route | Auth | รายละเอียด |
|--------|-------|------|-----------|
| POST | `/api/customer/nickname` | Guest token | ตั้งชื่อเล่น |

### 13.3 Menu (Read-only)

| Method | Route | Auth | รายละเอียด |
|--------|-------|------|-----------|
| GET | `/api/customer/menu/categories` | Guest token | หมวดหมู่ทั้งหมด (MainCategory enum + SubCategories active) |
| GET | `/api/customer/menu/items` | Guest token | เมนู (query: categoryType, subCategoryId, search) |
| GET | `/api/customer/menu/items/{menuId}` | Guest token | รายละเอียดเมนู + option groups + option items |

### 13.4 Order

| Method | Route | Auth | รายละเอียด |
|--------|-------|------|-----------|
| POST | `/api/customer/orders` | Guest token | Submit cart → สร้าง order items + auto-send kitchen |
| GET | `/api/customer/orders` | Guest token | ดู order ปัจจุบันของโต๊ะ (all items, all devices) |

### 13.5 Actions

| Method | Route | Auth | รายละเอียด |
|--------|-------|------|-----------|
| POST | `/api/customer/call-waiter` | Guest token | เรียกพนักงาน (cooldown 60 วินาที) |
| POST | `/api/customer/request-bill` | Guest token | ขอเช็คบิล (ครั้งเดียว/session) |

---

## 14. Frontend Structure (RBMS-POS-Mobile-Web)

### 14.1 Project Setup

- **Angular 19.1** + Tailwind CSS + PrimeNG (stack เดียวกับ POS Client)
- Shared: OpenAPI gen-api ชี้ไป Swagger เดียวกัน, design tokens
- Port: **4400**
- `standalone: false` + NgModule-based (เหมือน POS Client)
- Mobile-first responsive design

### 14.2 Route Structure

| Route | Component | หมายเหตุ |
|-------|-----------|----------|
| `/scan` | ScanComponent | รับ QR token, auth, redirect |
| `/` | redirect → `/menu` | |
| `/menu` | MenuBrowseComponent | Category tabs + sub-category chips + menu grid |
| `/menu/:menuId` | MenuDetailComponent | Bottom sheet: detail + options + add to cart |
| `/cart` | CartComponent | ตะกร้า + submit |
| `/tracking` | OrderTrackingComponent | สถานะ real-time |
| `/expired` | ExpiredComponent | โต๊ะถูกปิด / session หมดอายุ |

### 14.3 Component Tree

```
AppComponent
├── ScanComponent (standalone page, no nav)
├── CustomerLayoutComponent (with bottom nav + header)
│   ├── MenuBrowseComponent
│   │   ├── CategoryTabsComponent
│   │   ├── SubCategoryChipsComponent
│   │   └── MenuCardComponent
│   ├── MenuDetailComponent (bottom sheet overlay)
│   │   ├── OptionGroupComponent
│   │   └── QuantitySelectorComponent
│   ├── CartComponent
│   │   └── CartItemComponent
│   └── OrderTrackingComponent
│       └── OrderItemStatusComponent
├── ExpiredComponent (standalone page, no nav)
└── NicknameDialogComponent (modal overlay)
```

### 14.4 Services

| Service | หน้าที่ |
|---------|--------|
| `CustomerAuthService` | Session management, guest token storage (localStorage), auto-redirect on 401 |
| `CustomerSignalRService` | OrderHub connection (reuse pattern จาก KitchenSignalRService ใน POS Client) |
| `CartService` | localStorage cart management (add, update, remove, clear) |

---

## 15. Security

### 15.1 Guest Token

- JWT with claims: `{ sessionId, tableId, role: "customer", exp }`
- Short-lived: **4 ชั่วโมง**
- ไม่มี refresh token — หมดอายุ → สแกน QR ใหม่

### 15.2 API Protection

- `/api/customer/*` endpoints ใช้ `[CustomerAuthorize]` attribute
- Attribute logic: ตรวจ guest token + session `IsActive = true` + table `OCCUPIED`
- ยกเว้น `/api/customer/auth` (public — ไม่ต้อง auth)
- **Rate limiting:**
  - `call-waiter`: 1 ครั้ง / 60 วินาที
  - `request-bill`: 1 ครั้ง / session
  - `orders` (submit): 1 ครั้ง / 10 วินาที (กัน double-submit)

### 15.3 QR Token Security

- **Signed JWT (HS256)** — ลูกค้าแก้ไขไม่ได้
- **Nonce** ป้องกันใช้ QR เก่า (เก็บใน TbTable, ตรวจตอน auth)
- **HTTPS** บังคับ (ทั้ง POS Client และ Mobile Web)

---

## 16. Permissions

- **ไม่มี permission สำหรับ customer** — customer ใช้ guest token + session-based access
- Staff permissions ที่เกี่ยวข้อง (มีอยู่แล้ว):
  - `table.update` — เปิด/ปิดโต๊ะ (generate/revoke QR) — ดู [REQ-table-system](REQ-table-system.md) §14
  - `order.read` — ดูออเดอร์ (รวม customer orders) — ดู [REQ-order-system](REQ-order-system.md) §15
  - `order.update` — cancel item (ต้อง manager auth เพิ่ม)

---

## 17. จุดเชื่อมต่อระบบอื่น

| ระบบ | ความสัมพันธ์ |
|------|-------------|
| **[REQ-order-system](REQ-order-system.md)** | TbOrder/TbOrderItem entities, OrderedBy field, order submit logic (append items), status flow, auto-send kitchen |
| **[REQ-table-system](REQ-table-system.md)** | QR Token generation/revocation (TbTable.QrToken), table status check (OCCUPIED), open/close table flows |
| **[REQ-kitchen-system](REQ-kitchen-system.md)** | OrderHub events (shared), auto-send kitchen → KDS รับ NEW_ORDER |
| **[REQ-menu-system](REQ-menu-system.md)** | Menu entities (TbMenu, TbMenuSubCategory, TbOptionGroup, TbOptionItem), categories, selling periods, tags |
| **[REQ-payment-system](REQ-payment-system.md)** | ขอเช็คบิล → Table BILLING → Payment module, Customer bill view |
| **[REQ-noti-system](REQ-noti-system.md)** | CALL_WAITER, REQUEST_BILL, NEW_ORDER events (trigger จาก customer actions) |

---

## 18. User Flows

### 18.1 สแกน QR + เข้าระบบ

1. พนักงานเปิดโต๊ะ → QR Code ปรากฏใน Table Detail
2. ลูกค้าสแกน QR ด้วยกล้องมือถือ → เปิด Mobile Web
3. Mobile Web ส่ง QR token → Backend validate → สร้าง session
4. แสดง Nickname Dialog → ลูกค้าพิมพ์ชื่อ → บันทึก
5. Redirect ไปหน้าเมนู

### 18.2 เลือกเมนู + ใส่ตะกร้า

1. เลือก category tab → sub-category chip → เลื่อนดูเมนู
2. กด menu card → Bottom Sheet ปรากฏ
3. เลือก options (ถ้ามี required → ต้องเลือกให้ครบ)
4. ปรับจำนวน → เพิ่มหมายเหตุ (optional)
5. กด "เพิ่มลงตะกร้า" → Bottom Sheet ปิด + badge ตะกร้าอัพเดต

### 18.3 ยืนยันสั่งอาหาร

1. กด tab "ตะกร้า" → ดูรายการ + ยอดรวม
2. แก้ไข/ลบ items ถ้าต้องการ
3. กด "ยืนยันสั่งอาหาร" → Confirmation dialog
4. กด "ยืนยัน" → submit → ล้าง cart → ไปหน้า Order Tracking
5. ครัวรับออเดอร์ + KDS แสดงการ์ดใหม่ + staff ได้ noti

### 18.4 ติดตามสถานะ

1. หน้า Order Tracking แสดงทุก items แบ่งตามรอบ
2. เมื่อครัวเริ่มทำ → status เปลี่ยนเป็น "กำลังทำ" (real-time)
3. เมื่อเสร็จ → "เสร็จแล้ว" → พนักงานเสิร์ฟ → "เสิร์ฟแล้ว"
4. สั่งเพิ่มได้ → กลับไปหน้าเมนู → วนรอบ

### 18.5 เรียกพนักงาน

1. กดปุ่มเรียกพนักงาน (header)
2. Toast "เรียกพนักงานแล้ว" + ปุ่ม disabled 60 วินาที
3. Staff ได้ noti → มาที่โต๊ะ → กด "รับทราบ" → clear tag

### 18.6 ขอเช็คบิล

1. กดปุ่มขอเช็คบิล → Confirmation dialog
2. กดยืนยัน → Table status BILLING → ปุ่มหายไป แสดง banner "กำลังรอเช็คบิล"
3. Block สั่งเพิ่ม
4. Cashier ได้ noti → ดำเนินการชำระเงิน → ปิดโต๊ะ
5. SignalR `TableClosed` → ลูกค้าเห็นหน้า Expired

---

## 19. Edge Cases

| กรณี | การจัดการ |
|------|----------|
| สแกน QR โต๊ะที่ยังไม่เปิด | แสดง "โต๊ะยังไม่พร้อม กรุณาแจ้งพนักงาน" |
| สแกน QR ที่หมดอายุ | แสดง "QR Code หมดอายุ กรุณาแจ้งพนักงาน" |
| สแกน QR nonce ไม่ตรง | แสดง "QR Code ไม่ถูกต้อง กรุณาแจ้งพนักงาน" |
| โต๊ะถูกปิดขณะลูกค้ากำลังสั่ง | SignalR `TableClosed` → redirect ไปหน้า Expired |
| Submit ขณะเมนูหมด/ถูกปิด | Backend validate → return error ระบุ items ที่มีปัญหา → ลูกค้าลบออกจาก cart |
| Network disconnect | แสดง banner "ขาดการเชื่อมต่อ" → auto-reconnect → re-fetch order data |
| หลาย device สั่งพร้อมกัน | แต่ละ device submit อิสระ → Backend append เข้า order เดียวกัน (ไม่มี conflict) |
| กด submit ซ้ำ (double tap) | ปุ่ม disabled ทันทีหลังกด + Backend debounce 10 วินาที |
| ราคาเปลี่ยนระหว่างอยู่ในตะกร้า | Price snapshot ตอน submit (ไม่ใช่ตอนใส่ตะกร้า) |
| Nickname ซ้ำกันในโต๊ะเดียว | อนุญาต — ไม่มีข้อจำกัด |
| ลูกค้าปิด browser แล้วเปิดใหม่ | localStorage มี session token → validate → ถ้ายัง active ใช้ต่อ |
| Cart localStorage เต็ม | Handle gracefully → toast error |
| Order status = BILLING แล้วสั่งเพิ่ม | Block → แสดง "กำลังรอชำระเงิน ไม่สามารถสั่งเพิ่มได้" |

---

## 20. Validation Rules

| Field | กฎ |
|-------|-----|
| Nickname | 1-20 ตัวอักษร, ไม่ว่างเปล่า, trim whitespace |
| Cart item quantity | 1-99 |
| Note (per item) | 0-200 ตัวอักษร |
| Required option group | ต้องเลือกอย่างน้อย `MinSelect` |
| Max option selection | ห้ามเกิน `MaxSelect` |
| Submit | Cart ต้องมีอย่างน้อย 1 item |
| Call waiter | Cooldown 60 วินาที |
| Request bill | 1 ครั้ง/session |
| QR Token | JWT valid + not expired + nonce match |

---

## 21. สรุปไฟล์ที่ต้องสร้าง/แก้ไข

### Backend

| ไฟล์ | หมายเหตุ |
|------|----------|
| `POS.Main.Dal/Entities/Customer/TbCustomerSession.cs` | Entity ใหม่ |
| `POS.Main.Dal/EntityConfigurations/TbCustomerSessionConfiguration.cs` | Entity config |
| `POS.Main.Repositories/Interfaces/ICustomerSessionRepository.cs` | Repository interface |
| `POS.Main.Repositories/Implementations/CustomerSessionRepository.cs` | Repository impl |
| `POS.Main.Business.Customer/` | Business module ใหม่: CustomerService, CustomerAuthService |
| `POS.Main.Business.Customer/Models/` | DTOs: CreateSessionRequestModel, SubmitOrderRequestModel, etc. |
| `RBMS.POS.WebAPI/Controllers/CustomerController.cs` | API endpoints `/api/customer/*` |
| `RBMS.POS.WebAPI/Attributes/CustomerAuthorizeAttribute.cs` | Auth attribute สำหรับ guest token |
| Migration | สร้างตาราง TbCustomerSession |

### Frontend (RBMS-POS-Mobile-Web — project ใหม่)

| ไฟล์/Component | หมายเหตุ |
|----------------|----------|
| Project setup | Angular 19.1 + Tailwind + PrimeNG (new Angular project) |
| gen-api config | ชี้ Swagger เดียวกัน (port 5300) |
| ScanComponent | QR auth flow → redirect |
| CustomerLayoutComponent | Bottom nav + header layout |
| MenuBrowseComponent | Category tabs + sub-category + grid |
| MenuDetailComponent | Bottom sheet: detail + options + qty |
| CartComponent | ตะกร้า + submit |
| OrderTrackingComponent | Real-time status per item |
| ExpiredComponent | โต๊ะถูกปิด/session หมดอายุ |
| NicknameDialogComponent | ตั้งชื่อเล่น |
| CustomerAuthService | Session + token management |
| CustomerSignalRService | OrderHub client |
| CartService | localStorage cart management |
