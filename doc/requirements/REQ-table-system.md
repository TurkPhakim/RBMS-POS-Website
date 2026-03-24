# ระบบจัดการโต๊ะ (Table Management System)

> สถานะ: **Implemented** | อัปเดตล่าสุด: 2026-03-19

---

## 1. ภาพรวม

### 1.1 บทนำ

ระบบจัดการโต๊ะ (Table Management) เป็นจุดเริ่มต้นของการให้บริการลูกค้าในร้านอาหาร ทำหน้าที่จัดการผังร้าน (Floor Plan), โซน, สถานะโต๊ะ, การเปิด-ปิดโต๊ะ, การจองล่วงหน้า และการเชื่อมโต๊ะ (Link Tables) โดยข้อมูลจากระบบนี้จะถูกนำไปใช้ในระบบสั่งอาหาร (Order), ระบบแจ้งเตือน (Notification), และระบบชำระเงิน (Payment)

**อ้างอิงการออกแบบ:** FoodStory POS (Spatial Floor Plan + Status Dashboard)

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน | ที่ต้องการ |
|--------|----------|-----------|
| ผังร้าน | ไม่มี | Spatial Floor Plan — วางโต๊ะอิสระ + สีตามสถานะ |
| โซน | ไม่มี | CRUD โซน (ชื่อ, สี, ลำดับ) |
| โต๊ะ | ไม่มี | CRUD โต๊ะ (ชื่อ, ความจุ, ตำแหน่ง, รูปร่าง) |
| สถานะโต๊ะ | ไม่มี | 6 สถานะ + Operational Tags แบบ real-time |
| การเปิด/ปิดโต๊ะ | ไม่มี | Walk-in / Reserved + จำนวนคน + หมายเหตุ |
| การเชื่อมโต๊ะ | ไม่มี | Link Tables (รวมบิลตอนจ่าย) |
| ย้ายโต๊ะ | ไม่มี | ย้ายลูกค้า + ออเดอร์ไปโต๊ะอื่น |
| QR Code | ไม่มี | Static QR ต่อโต๊ะ สำหรับ Self-Ordering |
| การจอง | ไม่มี | Calendar View + Availability Check + แจ้งเตือน 30 นาที |
| มุมมองสถานะ | ไม่มี | Status Dashboard จัดกลุ่มตาม operational tag |

### 1.3 ขอบเขต (Scope)

**ทำ:**
- ระบบจัดการโซน (CRUD)
- ระบบจัดการโต๊ะ (CRUD + ตำแหน่งบน Floor Plan)
- Spatial Floor Plan View (วางโต๊ะอิสระ, drag-and-drop สำหรับ admin)
- FloorObject Layer (วัตถุตกแต่ง: ห้องน้ำ, บันได, เคาน์เตอร์ ฯลฯ — drag-and-drop)
- การเปิด/ปิดโต๊ะ, ย้ายโต๊ะ, Link/Unlink Tables
- Dynamic QR Token ต่อโต๊ะ (Signed JWT — generate ตอนเปิดโต๊ะ)
- ระบบจองโต๊ะ (Calendar Month View + CRUD)

**เลื่อนไป Phase 2 (Order System):**
- Status Dashboard View (จัดกลุ่มโต๊ะตาม operational tag — ต้องมี Order data)
- Operational Tags (WAITING_ORDER, WAITING_SERVE, ALL_SERVED, CALL_WAITER)
- Real-time update ผ่าน SignalR (TABLE_CLEANED broadcast)
- TbTable.ActiveOrderId (FK → TbOrder)

**ไม่ทำ (อยู่ใน module อื่น):**
- ระบบสั่งอาหาร → REQ-order-system
- ระบบชำระเงิน → REQ-payment-system
- ระบบแจ้งเตือน (infrastructure) → REQ-noti-system
- Waitlist / คิวรอโต๊ะ → อนาคต

---

## 2. Zone Management (โซน)

### 2.1 ข้อมูลโซน

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| ชื่อโซน | string(100) | ใช่ | เช่น "โซน A", "ชั้น 2", "ระเบียง" |
| สี | string(7) | ใช่ | Hex color เช่น "#FF6B35" สำหรับแสดงบน Floor Plan |
| ลำดับ | int | ไม่ | สำหรับเรียงแท็บโซนด้านบน (default 0) |
| สถานะ | bool | ใช่ | ถ้าปิด → โต๊ะทั้งหมดในโซนเปลี่ยนเป็น UNAVAILABLE |

### 2.2 Business Rules

- ต้องมีอย่างน้อย 1 โซนก่อนสร้างโต๊ะ
- ห้ามลบโซนที่มีโต๊ะอ้างอิง (ต้องย้ายโต๊ะออกก่อน)
- ชื่อโซนห้ามซ้ำ

---

## 3. Table Management (โต๊ะ)

### 3.1 ข้อมูลโต๊ะ

| Field | Type | Required | Validation | หมายเหตุ |
|-------|------|----------|------------|----------|
| ชื่อโต๊ะ | string(50) | ใช่ | | เช่น "A1", "B2", "VIP-1" |
| โซน | FK → TbZone | ใช่ | ต้องมีอยู่จริง | เลือกจาก dropdown |
| ความจุ (คน) | int | ใช่ | 1–50 | จำนวนที่นั่งสูงสุด |
| ตำแหน่ง X | int | ใช่ | ≥ 0 | pixel offset จากซ้ายบนของ canvas |
| ตำแหน่ง Y | int | ใช่ | ≥ 0 | pixel offset จากด้านบนของ canvas |
| รูปร่าง | enum | ใช่ | | SQUARE = สี่เหลี่ยม, ROUND = กลม |
| ขนาด | enum | ใช่ | | SMALL (2 คน), MEDIUM (4 คน), LARGE (6+ คน) |
| สถานะ | enum | ใช่ | default AVAILABLE | 6 สถานะ (ดู section 4) |
| หมายเหตุ | string(500) | ไม่ | | เช่น "ติดหน้าต่าง", "ใกล้ครัว" |

### 3.2 Business Rules

- ชื่อโต๊ะห้ามซ้ำภายในร้าน (unique across all zones)
- ห้ามลบโต๊ะที่สถานะเป็น OCCUPIED หรือ BILLING (ต้องปิดโต๊ะก่อน)
- เมื่อลบโต๊ะ → soft delete (ถ้ามี order history อ้างอิง)
- Admin สามารถ drag-and-drop เปลี่ยนตำแหน่ง X/Y บน Floor Plan ได้

---

## 4. Table Status & Operational Tags

### 4.1 Table Status (เก็บใน DB — field `Status`)

| ค่า | ชื่อ (ไทย) | สี | คำอธิบาย |
|-----|-----------|-----|---------|
| 0 | ว่าง (AVAILABLE) | `bg-success` เขียว | พร้อมรับลูกค้า |
| 1 | มีลูกค้า (OCCUPIED) | `bg-primary` ส้ม | มีลูกค้านั่งอยู่ (กำลังสั่ง/รอเสิร์ฟ/อาหารครบ) |
| 2 | รอชำระเงิน (BILLING) | `bg-info` น้ำเงิน | ลูกค้าขอบิลแล้ว รอจ่ายเงิน |
| 3 | จองล่วงหน้า (RESERVED) | `bg-warning` เหลือง | มีการจองล่วงหน้า รอลูกค้ามา |
| 4 | ทำความสะอาด (CLEANING) | `text-surface-sub` เทา | กำลังเคลียร์โต๊ะ |
| 5 | ปิดใช้งาน (UNAVAILABLE) | `text-surface-sub` เทาเข้ม | ปิดชั่วคราว (เช่น เก้าอี้พัง) |

**การเปลี่ยนสถานะที่อนุญาต:**

```
AVAILABLE ──► OCCUPIED (เปิดโต๊ะ Walk-in)
AVAILABLE ──► RESERVED (สร้างการจอง)
AVAILABLE ──► UNAVAILABLE (admin ปิดโต๊ะ)
RESERVED ──► OCCUPIED (ลูกค้าจองมาถึง → Check-in)
RESERVED ──► AVAILABLE (ยกเลิกการจอง)
OCCUPIED ──► BILLING (ลูกค้าขอบิล)
BILLING ──► CLEANING (ชำระเงินเสร็จ → auto เปลี่ยน)
CLEANING ──► AVAILABLE (ทำความสะอาดเสร็จ)
UNAVAILABLE ──► AVAILABLE (admin เปิดโต๊ะ)
```

### 4.2 Operational Tags (Derived — ไม่เก็บใน DB)

สถานะปฏิบัติการที่คำนวณ real-time จาก order data + notification events:

| Tag | ภาษาไทย | สี | Logic การ derive |
|-----|---------|-----|-----------------|
| WAITING_ORDER | รอสั่ง | ส้มอ่อน | OCCUPIED + ยังไม่มี order items ที่ส่งครัว |
| WAITING_SERVE | รอเสิร์ฟ | ส้ม | มี order items ที่สถานะ = READY (ครัวเสร็จ รอเอาไปเสิร์ฟ) |
| ALL_SERVED | อาหารครบแล้ว | เขียว | ทุก order items = SERVED |
| CALL_WAITER | เรียกพนักงาน | แดง | ลูกค้ากดปุ่ม "เรียกพนักงาน" (active event) |

**การใช้งาน:**
- **Floor Plan View** — แสดงสี table card ตาม Status (6 สี)
- **Status Dashboard View** — จัดกลุ่มโต๊ะตาม Operational Tag + Status (เหมือน FoodStory)
- Operational Tags ถูก broadcast ผ่าน SignalR เมื่อ order/notification เปลี่ยนแปลง

---

## 5. Floor Plan View (ผังร้าน)

### 5.1 มุมมองปกติ (Operational Mode)

**Layout:**
- **แถบด้านบน**: แท็บเลือกโซน (ทั้งหมด / โซน A / โซน B / ...) + ปุ่มค้นหาโต๊ะ
- **พื้นที่หลัก (Canvas)**: แสดงโต๊ะเป็น card ตามตำแหน่ง x/y ที่ตั้งไว้ + FloorObject (วัตถุตกแต่ง)
- **Legend**: แถบด้านล่างแสดงคำอธิบายสีสถานะ

**Table Card แต่ละโต๊ะแสดง:**
- ชื่อโต๊ะ (เช่น "A1")
- รูปร่าง (สี่เหลี่ยม/วงกลม) + สีตามสถานะ
- จำนวนคนปัจจุบัน / ความจุ (เช่น "3/4")
- เวลาเปิดโต๊ะ (นับขึ้น เช่น "1:23:45") — เฉพาะ OCCUPIED/BILLING
- Badge: Walk-in / จอง
- ไอคอน QR เล็กมุมขวาบน (เฉพาะ OCCUPIED)

**Interaction:**
- กดโต๊ะว่าง → เปิด dialog "เปิดโต๊ะ"
- กดโต๊ะที่มีลูกค้า → เปิดหน้า Table Detail (ดูออเดอร์ + operations)
- กดโต๊ะจอง → เปิด dialog "Check-in" หรือ "ยกเลิกการจอง"

### 5.2 มุมมองจัดผัง (Admin Mode)

เข้าถึงจากปุ่ม "จัดผังร้าน" (ต้องมี permission `table-manage.update`):
- โต๊ะทั้งหมดเป็น **draggable** — ลากวางเปลี่ยนตำแหน่งได้
- **FloorObject** (วัตถุตกแต่ง) เป็น draggable เช่นกัน — เพิ่ม/ลบ/ย้ายได้
- มีปุ่ม "เพิ่มโต๊ะ" + "แก้ไขโต๊ะ" + "ลบโต๊ะ" + "เพิ่มวัตถุ" สำหรับจัดการ
- กด "บันทึกผัง" → อัพเดตตำแหน่ง x/y ทุกโต๊ะ + FloorObject พร้อมกัน
- **ห้ามจัดผังขณะมีโต๊ะ OCCUPIED/BILLING** — แสดง warning

### 5.3 FloorObject (วัตถุตกแต่ง)

วัตถุที่วางบน Floor Plan เพื่อแสดงผังร้านสมจริง (ไม่เกี่ยวกับ order/billing):

| ประเภท (EFloorObjectType) | ค่า | ไอคอน |
|---------------------------|-----|-------|
| Restroom | 0 | ห้องน้ำ |
| Stairs | 1 | บันได |
| Counter | 2 | เคาน์เตอร์ |
| Kitchen | 3 | ครัว |
| Exit | 4 | ทางออก |
| Cashier | 5 | แคชเชียร์ |
| Decoration | 6 | ของตกแต่ง |

**ข้อมูล FloorObject:**
- ชื่อ (nvarchar 100)
- ประเภท (EFloorObjectType)
- ตำแหน่ง X/Y (int)
- ความกว้าง/สูง (int, default 80)
- โซน (FK → TbZone)

---

## 6. Status Dashboard View (มุมมองสถานะ) — เลื่อนไป Phase 2

> **หมายเหตุ**: ส่วนนี้ต้องมี Order System (Phase 2) ก่อน เพราะ Operational Tags derive จาก Order data

จัดกลุ่มโต๊ะตาม operational tag อ้างอิงจาก FoodStory:

```
┌─────────────────────────────────────────────────────────────────┐
│  [เรียกพนักงาน]  │  [เรียกเช็คบิล]  │         [ว่าง]          │
│   (แดง/ส้ม)      │    (น้ำเงิน)      │        (เขียว)          │
│   ┌───┐ ┌───┐   │   ┌───┐          │   ┌───┐ ┌───┐ ┌───┐    │
│   │A3 │ │A4 │   │   │B1 │          │   │A1 │ │A5 │ │B3 │    │
│   └───┘ └───┘   │   └───┘          │   └───┘ └───┘ └───┘    │
├─────────────────────────────────────────────────────────────────┤
│   [รอเสิร์ฟ]     │     [รอสั่ง]      │    [อาหารครบแล้ว]       │
│    (ส้ม)          │     (ส้มอ่อน)     │      (เขียว)            │
│   ┌───┐ ┌───┐   │   ┌───┐          │   ┌───┐ ┌───┐          │
│   │C1 │ │B2 │   │   │A2 │          │   │C2 │ │B4 │          │
│   └───┘ └───┘   │   └───┘          │   └───┘ └───┘          │
└─────────────────────────────────────────────────────────────────┘
```

**แต่ละกลุ่ม:**
- Header แถบสี + ชื่อกลุ่ม + จำนวนโต๊ะ
- การ์ดโต๊ะ: ชื่อ + โซน + จำนวนคน + เวลาเปิด
- กดการ์ด → เข้าหน้า Table Detail เหมือน Floor Plan

**ลำดับความสำคัญ (แสดงจากบนลงล่าง):**
1. เรียกพนักงาน (ต้องตอบสนองทันที)
2. เรียกเช็คบิล (รอชำระ)
3. รอเสิร์ฟ (อาหารพร้อม)
4. รอสั่ง (เพิ่งนั่ง)
5. อาหารครบแล้ว (ดี ไม่ต้องทำอะไร)
6. ว่าง

---

## 7. Table Operations (การดำเนินการกับโต๊ะ)

### 7.1 เปิดโต๊ะ

**เงื่อนไข:** โต๊ะต้องเป็น AVAILABLE หรือ RESERVED

**Dialog "เปิดโต๊ะ":**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| ประเภทลูกค้า | radio | ใช่ | Walk-in / จองเข้ามา |
| จำนวนลูกค้า | int | ใช่ | 1–(ความจุโต๊ะ × 2) |
| หมายเหตุ | string(500) | ไม่ | เช่น "แพ้ถั่ว", "เลี้ยงวันเกิด" |

**ผลลัพธ์:**
- สถานะ → OCCUPIED
- บันทึกเวลาเปิดโต๊ะ (`OpenedAt`)
- บันทึกจำนวนลูกค้า + ประเภท + หมายเหตุ
- **Generate QR Signed JWT** → เก็บใน TbTable.QrToken + QrTokenExpiresAt (ดู Section 8)
- แสดง QR Code popup (สำหรับให้ลูกค้าสแกนสั่งอาหาร)
- สร้าง Order ใหม่โดยอัตโนมัติ (ลิงก์กับโต๊ะ)

### 7.2 ปิดโต๊ะ

**เงื่อนไข:** โต๊ะต้องเป็น BILLING + ชำระเงินครบแล้ว (จาก Payment module)

**ผลลัพธ์:**
- สถานะ → CLEANING (อัตโนมัติ)
- ปิด Order ที่ค้างอยู่
- **Revoke QR Token** → set TbTable.QrToken = null, QrTokenExpiresAt = null
- **Deactivate Customer Sessions** → set IsActive = false ให้ทุก TbCustomerSession ของโต๊ะนี้ (ดู [REQ-self-order-system](REQ-self-order-system.md) Section 2.2)
- ล้างข้อมูล session (จำนวนคน, หมายเหตุ, Link Tables)

### 7.3 ทำความสะอาดเสร็จ

**เงื่อนไข:** โต๊ะเป็น CLEANING

**ผลลัพธ์:**
- สถานะ → AVAILABLE
- พร้อมรับลูกค้าคนถัดไป
- Broadcast event `TABLE_CLEANED` ผ่าน SignalR (OrderHub → Floor Plan อัพเดตสถานะโต๊ะ, **ไม่สร้าง notification**)

### 7.4 ย้ายโต๊ะ (Move Table)

**เงื่อนไข:** โต๊ะต้นทางเป็น OCCUPIED + โต๊ะปลายทางเป็น AVAILABLE

**Flow:**
1. กดปุ่ม "ย้ายโต๊ะ" ที่ Table Detail
2. Floor Plan ไฮไลต์เฉพาะโต๊ะที่ AVAILABLE (โต๊ะอื่นจาง)
3. เลือกโต๊ะปลายทาง
4. ยืนยัน → ย้าย Order + ข้อมูลลูกค้าทั้งหมด
5. โต๊ะต้นทาง → CLEANING, โต๊ะปลายทาง → OCCUPIED

**Customer Session & QR Token handling:**
- ย้าย `TbCustomerSession.TableId` → โต๊ะปลายทาง (Session ยังคงอยู่ ไม่ถูก deactivate)
- **Revoke QR โต๊ะต้นทาง** — เปลี่ยน `TbTable.QrTokenNonce` โต๊ะต้นทาง → QR เดิมใช้ไม่ได้
- **Generate QR โต๊ะปลายทาง** — สร้าง nonce ใหม่ + JWT ใหม่สำหรับโต๊ะปลายทาง
- **SignalR broadcast** ไปยัง Customer Session กลุ่มเดิม → แจ้ง "ย้ายไปโต๊ะ {ชื่อโต๊ะปลายทาง}" + อัพเดต header อัตโนมัติ
- ลูกค้าที่เปิดหน้า Self-Order อยู่ → หน้าจอแสดง notification ว่าถูกย้ายโต๊ะ + ข้อมูลอัพเดตอัตโนมัติ (ไม่ต้องสแกน QR ใหม่)
- ลูกค้าใหม่ที่จะสแกน → ต้องใช้ QR ใหม่ของโต๊ะปลายทาง

> **ดูรายละเอียด QR Token flow ที่ Section 8**

### 7.5 Link Tables (เชื่อมโต๊ะ — รวมบิลตอนจ่าย)

**เงื่อนไข:** ทั้ง 2+ โต๊ะต้องเป็น OCCUPIED

**Concept:**
- แต่ละโต๊ะยังมี Order แยกกัน สั่งอาหารแยกกัน
- ตอนจ่ายเงิน → รวม Order ทั้งหมดเป็น 1 บิล
- ใช้เมื่อ: ลูกค้ากลุ่มเดียวกันนั่ง 2 โต๊ะ ต้องการจ่ายรวม

**Flow:**
1. กดปุ่ม "เชื่อมโต๊ะ" ที่ Table Detail
2. เลือกโต๊ะที่จะเชื่อม (ต้อง OCCUPIED)
3. ยืนยัน → สร้าง Link record
4. Table Card แสดงไอคอน "เชื่อมแล้ว" + ชื่อโต๊ะที่เชื่อม

**Unlink:** กดปุ่ม "ยกเลิกเชื่อม" → ลบ Link record → กลับเป็นโต๊ะแยก

---

## 8. QR Code (Dynamic Signed JWT)

> **เอกสารหลักของ QR Self-Order อยู่ที่ [REQ-self-order-system.md](REQ-self-order-system.md)** — Section นี้ครอบคลุมเฉพาะส่วน QR Token ที่เป็นของ Table System

### 8.1 Dynamic QR Token

- **เปลี่ยนจาก Static QR (plain URL) เป็น Dynamic Signed JWT** — generate ใหม่ทุกครั้งที่เปิดโต๊ะ
- QR encode URL: `{mobileWebBaseUrl}/scan?token={jwt}` (เช่น `https://mobile.pos.example.com/scan?token=eyJ...`)
- **JWT Claims:** `{ venueId, tableId, exp, nonce }`
- **Signing:** HS256 (ลูกค้าแก้ไขไม่ได้)
- **Lifetime:** 12 ชั่วโมง (configurable ผ่าน Shop Settings)
- **Nonce:** random string เพื่อป้องกัน QR เก่า — เก็บใน TbTable เพื่อ validate ตอน auth

### 8.2 Token Lifecycle

| เหตุการณ์ | การจัดการ |
|----------|----------|
| เปิดโต๊ะ | Generate JWT → เก็บใน TbTable.QrToken + QrTokenExpiresAt |
| ลูกค้าสแกน | Mobile Web POST `/api/customer/auth` → validate JWT + nonce + table status |
| ปิดโต๊ะ | Revoke → set QrToken = null, QrTokenExpiresAt = null |
| Token หมดอายุ | ลูกค้าสแกนใหม่ → ได้ error "QR Code หมดอายุ" |

### 8.3 แสดง QR Code

- แสดงบนหน้า **Table Detail** ของ POS (Staff)
- **แสดงเฉพาะโต๊ะที่ OCCUPIED** — ถ้าโต๊ะยังไม่เปิด ไม่มี QR Token
- Generate QR **client-side** ด้วย `qr-code-styling` (ไม่เก็บ image ใน DB)

#### QR Card Layout

```
┌─────────────────────────────────────┐
│          [Logo ร้าน]                │  ← TbShopSettings.LogoFileId
│        ชื่อร้านภาษาไทย              │  ← TbShopSettings.ShopNameThai
│                                     │
│     ┌─────────────────────┐         │
│     │ ● ● ● ● ● ●  ┌──┐ │         │
│     │ ●           ●  │Lo│ │         │  ← QR Code + Logo กลาง
│     │ ●   QR Code ●  │go│ │         │     dot style: rounded
│     │ ●           ●  └──┘ │         │     สี: primary color
│     │ ● ● ● ● ● ● ● ● ● │         │
│     └─────────────────────┘         │
│                                     │
│        โซน A — โต๊ะ A3              │  ← Zone.Name + Table.Name
│     "สแกนเพื่อสั่งอาหาร"            │
│        19 มีนาคม 2569               │  ← วันที่เปิดโต๊ะ (OpenedAt)
└─────────────────────────────────────┘
```

#### QR Styling Spec (`qr-code-styling`)

| Setting | ค่า | หมายเหตุ |
|---------|-----|----------|
| **Library** | `qr-code-styling` (MIT, ฟรี) | ติดตั้งผ่าน npm |
| **data** | `{mobileWebBaseUrl}/scan?token={jwt}` | URL ที่ encode ใน QR |
| **width** | 280 | ขนาด QR (px) |
| **dotsOptions.type** | `"rounded"` | จุดมน |
| **dotsOptions.color** | Primary color จาก design token | เข้ากับธีมร้าน |
| **cornersSquareOptions.type** | `"extra-rounded"` | มุม QR มน |
| **cornersSquareOptions.color** | Primary color | สีเดียวกับ dots |
| **image** | Logo ร้าน (URL จาก TbFile) | แสดงกลาง QR |
| **imageOptions.margin** | 4 | ขอบรอบ logo |
| **errorCorrectionLevel** | `"M"` | รองรับ logo กลาง QR โดยยังสแกนได้ |

#### ข้อมูลที่แสดงบน QR Card

| ข้อมูล | ที่มา |
|--------|------|
| Logo ร้าน | `TbShopSettings.LogoFileId` → TbFile URL |
| ชื่อร้าน | `TbShopSettings.ShopNameThai` |
| ชื่อโซน | `TbZone.Name` ของโต๊ะนี้ |
| ชื่อโต๊ะ | `TbTable.Name` |
| วันที่ | `TbTable.OpenedAt` (format: วัน เดือน ปี พ.ศ.) |
| ข้อความ | "สแกนเพื่อสั่งอาหาร" (hardcode) |

#### Export / Print

- ปุ่ม **"ดาวน์โหลด QR"** → export ทั้ง Card เป็น PNG (ใช้ `html2canvas` หรือ `qr-code-styling.download()`)
- ใช้สำหรับ print ตั้งโต๊ะ หรือแชร์ให้ลูกค้า
- ถ้า Logo ร้านยังไม่ได้ upload → แสดง QR โดยไม่มี logo กลาง (ยังสแกนได้ปกติ)

### 8.4 การ Validate เมื่อลูกค้าสแกน

1. Mobile Web ส่ง JWT → Backend verify signature + ตรวจ exp
2. ตรวจ nonce ตรงกับ TbTable.QrTokenNonce (ป้องกัน QR เก่า)
3. ตรวจ table status = OCCUPIED
4. สร้าง TbCustomerSession → issue Guest Bearer Token → return session data

> ดูรายละเอียด Customer Session + Auth Flow ที่ [REQ-self-order-system](REQ-self-order-system.md) Section 2–3

---

## 9. Reservation (ระบบจองโต๊ะ)

### 9.1 ข้อมูลการจอง

| Field | Type | Required | Validation | หมายเหตุ |
|-------|------|----------|------------|----------|
| ชื่อลูกค้า | string(200) | ใช่ | | |
| เบอร์โทร | string(20) | ใช่ | | สำหรับติดต่อ |
| วันที่จอง | date | ใช่ | ≥ วันนี้ | |
| เวลาจอง | time | ใช่ | ภายในเวลาทำการร้าน | |
| จำนวนคน | int | ใช่ | 1–50 | |
| โต๊ะที่จอง | FK → TbTable | ไม่ | ต้อง AVAILABLE ในช่วงเวลานั้น | พนักงาน assign เอง |
| หมายเหตุ | string(500) | ไม่ | | เช่น "แพ้อาหารทะเล", "เลี้ยงวันเกิด" |
| สถานะ | enum | ใช่ | default PENDING | ดู 9.2 |

### 9.2 สถานะการจอง

| ค่า | ชื่อ | คำอธิบาย |
|-----|------|---------|
| 0 | รอยืนยัน (PENDING) | ลูกค้าจองเข้ามา รอพนักงานยืนยัน |
| 1 | ยืนยันแล้ว (CONFIRMED) | พนักงานยืนยัน + assign โต๊ะแล้ว |
| 2 | มาถึงแล้ว (CHECKED_IN) | ลูกค้ามาถึง → เปิดโต๊ะ |
| 3 | ยกเลิก (CANCELLED) | ลูกค้าหรือพนักงานยกเลิก |
| 4 | ไม่มา (NO_SHOW) | เลยเวลานัดไปแล้ว ลูกค้าไม่มา |

**การเปลี่ยนสถานะ:**
```
PENDING ──► CONFIRMED (พนักงานยืนยัน + assign โต๊ะ)
PENDING ──► CANCELLED (ยกเลิก)
CONFIRMED ──► CHECKED_IN (ลูกค้ามาถึง → เปิดโต๊ะ)
CONFIRMED ──► CANCELLED (ยกเลิก)
CONFIRMED ──► NO_SHOW (เลยเวลา + พนักงาน mark)
```

### 9.3 Calendar View (Month View)

**Layout — Month View เต็มหน้าจอ:**
- **ส่วนบน**: Calendar Grid แบบ Month View (7 คอลัมน์ × 6 แถว)
  - Header: ◄ ชื่อเดือน ปี พ.ศ. ► (ปุ่มเปลี่ยนเดือน ตรงกลาง) + Dropdown กรองสถานะ (ขวา)
  - Day headers: จันทร์–อาทิตย์ พร้อมสีประจำวันไทย (เหลือง/ชมพู/เขียว/ส้ม/ฟ้า/ม่วง/แดง)
  - Day cells: แสดงตัวเลขวัน + จุดสีตาม status ของ reservation (max 4 จุด) + badge จำนวน
  - วันปัจจุบัน: `ring-2 ring-primary` + label "วันนี้"
  - วันที่เลือก: `bg-primary text-white`
  - วันเดือนอื่น: `opacity-40`
- **ส่วนล่าง**: Day Detail — Timeline cards ของวันที่เลือก
  - เรียงตามเวลา (เช้า → ค่ำ)
  - เลยเวลาแล้ว → `opacity-50` + `bg-surface` (เทา)
  - ยังไม่ถึง → `bg-surface-card` (ขาว)
  - Card มี `border-l-4` สีตาม status + ข้อมูลลูกค้า + ปุ่ม action

**Availability Check:**
- เมื่อพนักงาน assign โต๊ะ → ระบบเช็คว่าโต๊ะว่างในช่วงเวลานั้นหรือไม่
- เวลาที่จอง ± 2 ชั่วโมง (buffer) ต้องไม่ชนกับการจองอื่นของโต๊ะเดียวกัน
- ถ้าชน → แสดง warning "โต๊ะนี้มีการจองในช่วงใกล้เคียง"

### 9.4 แจ้งเตือนการจอง

- **30 นาทีก่อนเวลาจอง** → ส่ง notification ไปยัง Host/Manager ผ่าน SignalR
- Event type: `RESERVATION_REMINDER`
- ข้อความ: "การจอง {ชื่อลูกค้า} {จำนวนคน} คน โต๊ะ {ชื่อโต๊ะ} เวลา {HH:mm} — อีก 30 นาทีจะถึง"

### 9.5 รายการจองวันนี้

> **หมายเหตุ**: ไม่มีหน้าแยก — ใช้ Calendar View เปิดมา default วันนี้ (selectedDate = today) แสดงรายการจองใน Day Detail panel ด้านล่างปฏิทิน

- เรียงตามเวลา (Timeline style)
- แสดง: เวลา, ชื่อลูกค้า, เบอร์โทร, จำนวนคน, โต๊ะ, สถานะ, หมายเหตุ
- ปุ่มดำเนินการ: ยืนยัน, Check-in (เปิดโต๊ะ), แก้ไข, ยกเลิก, Mark No-show
- เลยเวลาแล้ว → จาง (opacity-50) เพื่อแยกให้เห็นชัด

### 9.6 Business Rules

- การจองต้องอยู่ภายในเวลาทำการร้าน (อ้างอิง TbShopOperatingHour)
- 1 โต๊ะ 1 เวลา = 1 การจอง (ห้ามจองซ้อนในช่วงเวลาเดียวกัน)
- เมื่อ Check-in → เปิดโต๊ะอัตโนมัติ (ประเภทลูกค้า = "จองเข้ามา")
- เมื่อ Confirm → สถานะโต๊ะเปลี่ยนเป็น RESERVED (ถ้าเป็นวันนี้ + ใกล้เวลาจอง)
- โต๊ะที่ถูกจอง RESERVED จะ auto กลับเป็น AVAILABLE ถ้าเลยเวลาจอง + 30 นาที + ไม่มี Check-in (พนักงาน mark NO_SHOW)

---

## 10. Database Schema

### 10.1 TbZone

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| ZoneId | int (PK, Identity) | ไม่ | | |
| ZoneName | nvarchar(100) | ไม่ | | Unique |
| Color | nvarchar(7) | ไม่ | '#FF6B35' | Hex color |
| SortOrder | int | ไม่ | 0 | |
| IsActive | bit | ไม่ | 1 | |
| + BaseEntity fields | | | | CreatedAt/By, UpdatedAt/By, DeleteFlag/At/By |

### 10.2 TbTable

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| TableId | int (PK, Identity) | ไม่ | | |
| TableName | nvarchar(50) | ไม่ | | Unique |
| ZoneId | int (FK → TbZone) | ไม่ | | |
| Capacity | int | ไม่ | 4 | 1–50 |
| PositionX | int | ไม่ | 0 | |
| PositionY | int | ไม่ | 0 | |
| Shape | int | ไม่ | 0 | 0=SQUARE, 1=ROUND |
| Size | int | ไม่ | 1 | 0=SMALL, 1=MEDIUM, 2=LARGE |
| Status | int | ไม่ | 0 | 0–5 (ETableStatus) |
| CurrentGuests | int | ใช่ | null | จำนวนลูกค้าปัจจุบัน |
| GuestType | int | ใช่ | null | 0=Walk-in, 1=Reserved |
| OpenedAt | datetime2 | ใช่ | null | เวลาที่เปิดโต๊ะ |
| Note | nvarchar(500) | ใช่ | null | หมายเหตุประจำ session |
| ActiveOrderId | int (FK → TbOrder) | ใช่ | null | Order ที่เปิดอยู่ |
| QrToken | nvarchar(1000) | ใช่ | null | Signed JWT string สำหรับ QR Code (generate ตอนเปิดโต๊ะ, null ตอนปิด) |
| QrTokenExpiresAt | datetime2 | ใช่ | null | เวลาหมดอายุ QR Token |
| QrTokenNonce | nvarchar(100) | ใช่ | null | Random nonce สำหรับ validate QR (เปลี่ยนเมื่อ generate QR ใหม่ / ย้ายโต๊ะ) |
| + BaseEntity fields | | | | |

### 10.3 TbTableLink

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| TableLinkId | int (PK, Identity) | ไม่ | | |
| GroupCode | nvarchar(50) | ไม่ | | กลุ่มเดียวกันใช้ code เดียวกัน |
| TableId | int (FK → TbTable) | ไม่ | | Unique (1 โต๊ะอยู่ได้ 1 กลุ่ม) |
| + BaseEntity fields | | | | |

**หมายเหตุ:** Hard delete — ลบ record เมื่อ Unlink หรือเมื่อปิดโต๊ะ (`CloseTableAsync()` ลบ TbTableLink ที่เกี่ยวข้องอัตโนมัติ) — ดู [auto-cleanup.md](../architecture/auto-cleanup.md)

### 10.4 TbReservation

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| ReservationId | int (PK, Identity) | ไม่ | | |
| CustomerName | nvarchar(200) | ไม่ | | |
| CustomerPhone | nvarchar(20) | ไม่ | | |
| ReservationDate | date | ไม่ | | |
| ReservationTime | time | ไม่ | | |
| GuestCount | int | ไม่ | | 1–50 |
| TableId | int (FK → TbTable) | ใช่ | null | พนักงาน assign ทีหลังได้ |
| Note | nvarchar(500) | ใช่ | null | |
| Status | int | ไม่ | 0 | 0–4 (EReservationStatus) |
| ReminderSent | bit | ไม่ | 0 | แจ้งเตือน 30 นาทีส่งแล้วหรือยัง |
| + BaseEntity fields | | | | |

### 10.5 TbFloorObject

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| FloorObjectId | int (PK, Identity) | ไม่ | | |
| Name | nvarchar(100) | ไม่ | | เช่น "ห้องน้ำ", "เคาน์เตอร์" |
| ObjectType | int | ไม่ | 0 | EFloorObjectType (0–6) |
| PositionX | int | ไม่ | 0 | |
| PositionY | int | ไม่ | 0 | |
| Width | int | ไม่ | 80 | |
| Height | int | ไม่ | 80 | |
| ZoneId | int (FK → TbZone) | ไม่ | | อยู่ในโซนไหน |
| + BaseEntity fields | | | | |

### 10.6 Enums

```csharp
public enum ETableStatus
{
    Available = 0,
    Occupied = 1,
    Billing = 2,
    Reserved = 3,
    Cleaning = 4,
    Unavailable = 5
}

public enum ETableShape { Square = 0, Round = 1 }
public enum ETableSize { Small = 0, Medium = 1, Large = 2 }
public enum EGuestType { WalkIn = 0, Reserved = 1 }
public enum EReservationStatus
{
    Pending = 0,
    Confirmed = 1,
    CheckedIn = 2,
    Cancelled = 3,
    NoShow = 4
}

public enum EFloorObjectType
{
    Restroom = 0,
    Stairs = 1,
    Counter = 2,
    Kitchen = 3,
    Exit = 4,
    Cashier = 5,
    Decoration = 6
}
```

### 10.6 ER Diagram

```
TbZone (1) ──────── (N) TbTable
  │                       │
  │                       ├── (0..1) TbTableLink
  │                       │
  │                       ├── (0..N) TbReservation
  │                       │
  │                       └── (0..1) TbOrder (ActiveOrderId — จาก Order System Phase 2)
  │
  └──── (N) TbFloorObject
```

---

## 11. API Endpoints

### 11.1 Zone Endpoints

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/table/zones` | `zone.read` | ดึงโซนทั้งหมด (pagination) |
| GET | `/api/table/zones/{zoneId}` | `zone.read` | ดึงโซนตาม ID |
| GET | `/api/table/zones/active` | `zone.read` | ดึงโซนที่ active (list ไม่แบ่งหน้า — สำหรับ dropdown) |
| POST | `/api/table/zones` | `zone.create` | สร้างโซนใหม่ |
| PUT | `/api/table/zones/{zoneId}` | `zone.update` | แก้ไขโซน |
| DELETE | `/api/table/zones/{zoneId}` | `zone.delete` | ลบโซน (ห้ามถ้ามีโต๊ะ) |
| PUT | `/api/table/zones/sort-order` | `zone.update` | อัพเดตลำดับโซน |

### 11.2 Table Endpoints

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/table/tables` | `table-manage.read` | ดึงโต๊ะทั้งหมด (pagination + filter by zone, status) |
| GET | `/api/table/tables/{tableId}` | `table-manage.read` | ดึงโต๊ะตาม ID |
| POST | `/api/table/tables` | `table-manage.create` | สร้างโต๊ะใหม่ |
| PUT | `/api/table/tables/{tableId}` | `table-manage.update` | แก้ไขโต๊ะ (ข้อมูลพื้นฐาน) |
| DELETE | `/api/table/tables/{tableId}` | `table-manage.delete` | ลบโต๊ะ (soft delete) |
| PUT | `/api/table/tables/positions` | `table-manage.update` | อัพเดตตำแหน่ง x/y หลายโต๊ะ (batch) |
| POST | `/api/table/tables/{tableId}/open` | `table-manage.update` | เปิดโต๊ะ (จำนวนคน, ประเภท, หมายเหตุ) |
| POST | `/api/table/tables/{tableId}/close` | `table-manage.update` | ปิดโต๊ะ → CLEANING |
| POST | `/api/table/tables/{tableId}/clean` | `table-manage.update` | ทำความสะอาดเสร็จ → AVAILABLE |
| POST | `/api/table/tables/{tableId}/move` | `table-manage.update` | ย้ายลูกค้าไปโต๊ะอื่น |
| POST | `/api/table/tables/link` | `table-manage.update` | เชื่อมโต๊ะ (body: tableIds[]) |
| DELETE | `/api/table/tables/link/{groupCode}` | `table-manage.update` | ยกเลิกเชื่อม |
| POST | `/api/table/tables/{tableId}/set-unavailable` | `table-manage.update` | ปิดใช้งานโต๊ะ |
| POST | `/api/table/tables/{tableId}/set-available` | `table-manage.update` | เปิดใช้งานโต๊ะ |
| GET | `/api/table/tables/{tableId}/qr-token` | `table-manage.read` | ดึง QR Token (JWT string — Frontend generate QR ด้วย library เอง) |

### 11.3 Reservation Endpoints

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/table/reservations` | `reservation.read` | ดึงรายการจอง (pagination + filter: dateFrom, dateTo, status) |
| GET | `/api/table/reservations/today` | `reservation.read` | รายการจองวันนี้ |
| GET | `/api/table/reservations/{reservationId}` | `reservation.read` | ดึงการจองตาม ID |
| POST | `/api/table/reservations` | `reservation.create` | สร้างการจองใหม่ |
| PUT | `/api/table/reservations/{reservationId}` | `reservation.update` | แก้ไขการจอง |
| POST | `/api/table/reservations/{reservationId}/confirm` | `reservation.update` | ยืนยันการจอง + assign โต๊ะ |
| POST | `/api/table/reservations/{reservationId}/check-in` | `reservation.update` | ลูกค้ามาถึง → เปิดโต๊ะ |
| POST | `/api/table/reservations/{reservationId}/cancel` | `reservation.update` | ยกเลิกการจอง |
| POST | `/api/table/reservations/{reservationId}/no-show` | `reservation.update` | Mark ไม่มา |

### 11.4 FloorObject Endpoints

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/table/floor-objects` | `floor-object.read` | ดึง FloorObject ทั้งหมด (filter by zone) |
| POST | `/api/table/floor-objects` | `floor-object.create` | สร้าง FloorObject ใหม่ |
| PUT | `/api/table/floor-objects/{floorObjectId}` | `floor-object.update` | แก้ไข FloorObject |
| DELETE | `/api/table/floor-objects/{floorObjectId}` | `floor-object.delete` | ลบ FloorObject |
| PUT | `/api/table/floor-objects/positions` | `floor-object.update` | อัพเดตตำแหน่ง x/y หลาย FloorObject (batch) |

---

## 12. Frontend Pages & Components

### 12.1 Sidebar Menu

ภายใต้ "โต๊ะ":

| ชื่อ | Route | Permission |
|------|-------|-----------|
| ผังโต๊ะ | `/table/floor-plan` | `table-manage.read` |
| จัดการโซน / โต๊ะ | `/table/zones` | `zone.read`, `table-manage.read` |
| การจอง | `/table/reservations` | `reservation.read` |

### 12.2 Routes

| Route | Component | Permission | หมายเหตุ |
|-------|-----------|-----------|----------|
| `/table/floor-plan` | FloorPlanComponent | `table-manage.read` | Spatial Floor Plan + drag-and-drop + FloorObject layer |
| `/table/zones` | ZoneListComponent | `zone.read` | รวม Zone tab + Table tab ในหน้าเดียว |
| `/table/zones/create` | ZoneManageComponent | `zone.create` | สร้างโซน |
| `/table/zones/update/:zoneId` | ZoneManageComponent | `zone.update` | แก้ไขโซน |
| `/table/tables` | TableListComponent | `table-manage.read` | รายการโต๊ะ (เข้าจาก tab ใน ZoneList) |
| `/table/tables/create` | TableManageComponent | `table-manage.create` | สร้างโต๊ะ (form) |
| `/table/tables/update/:tableId` | TableManageComponent | `table-manage.update` | แก้ไขโต๊ะ (form) |
| `/table/reservations` | ReservationListComponent | `reservation.read` | Calendar Month View (default วันนี้) |
| `/table/reservations/create` | ReservationManageComponent | `reservation.create` | สร้างการจอง |
| `/table/reservations/update/:reservationId` | ReservationManageComponent | `reservation.update` | แก้ไขการจอง |

### 12.3 Zone List Page

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| ลำดับ | `w-[60px]` | SortOrder (drag & drop) |
| สี | `w-[60px]` | วงกลมสี |
| ชื่อโซน | `w-[200px]` | |
| จำนวนโต๊ะ | `w-[120px]` | count โต๊ะในโซน |
| สถานะ | `w-[100px]` | เปิด/ปิด badge |
| ตัวเลือก | `w-[100px]` | แก้ไข, ลบ |

### 12.4 Reservation Day Detail (ใน Calendar View)

> แสดงเป็น Timeline cards ด้านล่างปฏิทิน — ไม่ใช่ตาราง

แต่ละ card แสดง:
- เวลา (ซ้าย, font ใหญ่) + เส้น timeline เชื่อมต่อ
- Status badge สี + ชื่อลูกค้า
- เบอร์โทร, จำนวนคน, โต๊ะ, หมายเหตุ
- ปุ่ม action: ยืนยัน / Check-in / แก้ไข / ยกเลิก / ไม่มา (ตาม status + permission)
- เลยเวลา → opacity-50 + bg-surface
- ยังไม่ถึง → bg-surface-card

---

## 13. UserFlow

### 13.1 เปิดร้านตอนเช้า

1. Manager เข้าหน้า Floor Plan
2. ตรวจสอบโต๊ะทั้งหมดเป็น AVAILABLE
3. ตรวจสอบรายการจองวันนี้ → เตรียมโต๊ะที่จอง
4. ถ้ามีโต๊ะที่ต้องปิดใช้งาน → กด Set Unavailable

### 13.2 ลูกค้า Walk-in

1. ลูกค้าเข้าร้าน → พนักงาน (Host) ดู Floor Plan
2. หาโต๊ะว่าง → กดโต๊ะที่ต้องการ
3. กด "เปิดโต๊ะ" → กรอกจำนวนคน + เลือก Walk-in
4. ระบบเปิดโต๊ะ + สร้าง Order + **Generate QR Signed JWT** → แสดง QR Code
5. พนักงานนำลูกค้าเข้าโต๊ะ → ลูกค้าสแกน QR จากมือถือ → เข้า Mobile Web สั่งอาหาร (ดู [REQ-self-order-system](REQ-self-order-system.md))

### 13.3 ลูกค้าจอง → มาถึง

1. ลูกค้าโทรจอง → พนักงานเข้าหน้า Reservation Calendar
2. เลือกวัน-เวลา → กรอกข้อมูล (ชื่อ, เบอร์, จำนวนคน)
3. ดูโต๊ะว่างในช่วงเวลานั้น → assign โต๊ะ → กด Confirm
4. [วันที่จอง — 30 นาทีก่อนเวลานัด] → ระบบส่ง notification
5. ลูกค้ามาถึง → พนักงานเปิดหน้า "การจองวันนี้"
6. กด Check-in → ระบบเปิดโต๊ะอัตโนมัติ (ประเภท = จองเข้ามา)

### 13.4 ย้ายโต๊ะ

1. ลูกค้าขอย้ายโต๊ะ → พนักงานเข้า Table Detail ของโต๊ะต้นทาง
2. กด "ย้ายโต๊ะ" → Floor Plan ไฮไลต์โต๊ะว่าง
3. เลือกโต๊ะปลายทาง → ยืนยัน
4. ระบบย้าย Order + ข้อมูลทั้งหมด → โต๊ะเดิม CLEANING

### 13.5 Link Tables → รวมบิล

1. ลูกค้า 2 กลุ่มต้องการจ่ายรวม → พนักงานเข้า Table Detail ของโต๊ะหนึ่ง
2. กด "เชื่อมโต๊ะ" → เลือกอีกโต๊ะ → ยืนยัน
3. ทั้ง 2 โต๊ะแสดงไอคอน "เชื่อมแล้ว"
4. ตอนจ่ายเงิน → Payment module รวม Order ของโต๊ะที่เชื่อมกัน

### 13.6 ปิดโต๊ะ

1. ลูกค้ากินเสร็จ → ขอบิล → สถานะ BILLING
2. ชำระเงินเสร็จ → พนักงานกด "ปิดโต๊ะ" → สถานะ CLEANING
3. พนักงานเคลียร์โต๊ะเสร็จ → กด "ทำความสะอาดเสร็จ" → สถานะ AVAILABLE
4. SignalR broadcast `TABLE_CLEANED` → Floor Plan อัพเดตสถานะโต๊ะ (ไม่สร้าง notification)

---

## 14. Permissions

### 14.1 Permission Constants

| Permission | คำอธิบาย |
|-----------|---------|
| `table-manage.read` | ดูผังโต๊ะ, รายละเอียดโต๊ะ |
| `table-manage.create` | สร้างโต๊ะ |
| `table-manage.update` | แก้ไขโต๊ะ, เปิด/ปิดโต๊ะ, ย้าย, เชื่อม, จัดผัง |
| `table-manage.delete` | ลบโต๊ะ |
| `zone.read` | ดูรายการโซน |
| `zone.create` | สร้างโซน |
| `zone.update` | แก้ไขโซน, อัพเดตลำดับ |
| `zone.delete` | ลบโซน |
| `floor-object.read` | ดู FloorObject บน Floor Plan |
| `floor-object.create` | สร้าง FloorObject |
| `floor-object.update` | แก้ไข/ย้ายตำแหน่ง FloorObject |
| `floor-object.delete` | ลบ FloorObject |
| `reservation.read` | ดูรายการจอง, Calendar |
| `reservation.create` | สร้างการจอง |
| `reservation.update` | แก้ไข/ยืนยัน/Check-in/ยกเลิก/No-show |
| `reservation.delete` | ลบการจอง |

### 14.2 Migration — Seed Permissions

สร้าง Migrations แล้ว (4 รายการ):
- `AddTableSystem` — สร้างตาราง TbZones, TbTables, TbTableLinks, TbReservations
- `SeedReservationPermissions` — Module "จัดการการจอง" + 4 permissions
- `SeedZoneAndFloorObjectPermissions` — Module "จัดการโซน" + "จัดการวัตถุบนผัง" + 8 permissions
- `AddFloorObjectTable` — สร้างตาราง TbFloorObjects

---

## 15. จุดเชื่อมต่อระบบอื่น

| ระบบ | ความสัมพันธ์ |
|------|-------------|
| **Order System** | เปิดโต๊ะ → สร้าง Order อัตโนมัติ, ย้ายโต๊ะ → ย้าย Order, ปิดโต๊ะ → Close Order, Operational Tags derive จาก Order data |
| **Notification System** | Reservation reminder 30 นาที, CALL_WAITER event (จาก Order System ผ่าน QR Panel) — TABLE_CLEANED ส่งผ่าน OrderHub (Floor Plan) ไม่ผ่าน NotificationHub |
| **Payment System** (REQ-payment-system) | BILLING → สร้าง TbOrderBill → แคชเชียร์ชำระเงิน (เงินสด/QR), Link Tables → รวม Orders เป็น 1 บิล, ชำระเสร็จ → Bill PAID → Table status → CLEANING (auto), กะแคชเชียร์ต้องเปิดก่อนรับชำระ |
| **Shop Settings** | Operating hours → กำหนดเวลาที่จองได้ |
| **Service Charge (Master Data)** | ServiceChargeRate → Cashier เลือก dropdown ตอนขอบิล, VatRate = 7% hardcode → snapshot ลง TbOrderBill |
| **Menu System** | ไม่เชื่อมตรง (เชื่อมผ่าน Order System) |
| **Self-Order System** (REQ-self-order-system) | QR Token (generate/revoke) เป็นของ Table System, TbTable.QrToken + QrTokenExpiresAt, ปิดโต๊ะ → revoke QR + deactivate customer sessions, Customer Session (TbCustomerSession) อ้างอิง TableId |

---

## 16. Validation Rules & Error Scenarios

### 16.1 Zone

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| ชื่อโซนซ้ำ | "ชื่อโซนนี้ถูกใช้แล้ว" | 400 |
| ลบโซนที่มีโต๊ะ | "ไม่สามารถลบโซนที่มีโต๊ะอยู่ได้ กรุณาย้ายโต๊ะออกก่อน" | 422 |

### 16.2 Table

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| ชื่อโต๊ะซ้ำ | "ชื่อโต๊ะนี้ถูกใช้แล้ว" | 400 |
| เปิดโต๊ะที่ไม่ใช่ AVAILABLE/RESERVED | "โต๊ะนี้ไม่พร้อมเปิด" | 422 |
| ปิดโต๊ะที่ไม่ใช่ BILLING | "ต้องชำระเงินก่อนปิดโต๊ะ" | 422 |
| ย้ายไปโต๊ะที่ไม่ว่าง | "โต๊ะปลายทางไม่ว่าง" | 422 |
| ลบโต๊ะที่ OCCUPIED/BILLING | "ไม่สามารถลบโต๊ะที่กำลังใช้งาน" | 422 |
| Link โต๊ะที่ไม่ใช่ OCCUPIED | "โต๊ะที่จะเชื่อมต้องมีลูกค้านั่งอยู่" | 422 |
| โต๊ะอยู่ใน link group แล้ว | "โต๊ะนี้เชื่อมกับกลุ่มอื่นอยู่แล้ว" | 422 |

### 16.3 Reservation

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| จองวันย้อนหลัง | "ไม่สามารถจองวันที่ผ่านไปแล้ว" | 400 |
| เวลานอกเวลาทำการ | "เวลาที่เลือกอยู่นอกเวลาทำการร้าน" | 400 |
| โต๊ะชนเวลาจอง | "โต๊ะนี้มีการจองในช่วงเวลาใกล้เคียงแล้ว" | 422 |
| Check-in ที่ไม่ใช่ CONFIRMED | "การจองยังไม่ได้ยืนยัน" | 422 |

---

## 17. สรุปไฟล์ที่สร้าง/แก้ไข (Implemented)

### Backend

| ไฟล์ | หมายเหตุ | สถานะ |
|------|----------|-------|
| `POS.Main.Core/Enums/ETableStatus.cs` | Enum สถานะโต๊ะ (6 ค่า) | ✅ |
| `POS.Main.Core/Enums/ETableShape.cs` | Enum รูปร่าง (2 ค่า) | ✅ |
| `POS.Main.Core/Enums/ETableSize.cs` | Enum ขนาด (3 ค่า) | ✅ |
| `POS.Main.Core/Enums/EGuestType.cs` | Enum ประเภทลูกค้า (2 ค่า) | ✅ |
| `POS.Main.Core/Enums/EReservationStatus.cs` | Enum สถานะจอง (5 ค่า) | ✅ |
| `POS.Main.Core/Enums/EFloorObjectType.cs` | Enum วัตถุตกแต่ง (7 ค่า) | ✅ |
| `POS.Main.Dal/Entities/Table/TbZone.cs` | Entity โซน | ✅ |
| `POS.Main.Dal/Entities/Table/TbTable.cs` | Entity โต๊ะ | ✅ |
| `POS.Main.Dal/Entities/Table/TbTableLink.cs` | Entity เชื่อมโต๊ะ | ✅ |
| `POS.Main.Dal/Entities/Table/TbReservation.cs` | Entity การจอง | ✅ |
| `POS.Main.Dal/Entities/Table/TbFloorObject.cs` | Entity วัตถุตกแต่ง | ✅ |
| `POS.Main.Dal/EntityConfigurations/` | 5 configuration files | ✅ |
| `POS.Main.Repositories/` | 5 repository interfaces + implementations | ✅ |
| `POS.Main.Business.Table/` | 4 Services, 4 Interfaces, Models, Mappers | ✅ |
| `RBMS.POS.WebAPI/Controllers/` | Zones (7ep), Tables (15ep), Reservations (9ep), FloorObjects (5ep) | ✅ |
| Migrations | 4 ไฟล์ (schema + seed permissions) | ✅ |
| `Program.cs` | Register DI (4 services) | ✅ |
| `UnitOfWork.cs` | 5 repositories | ✅ |

### Frontend

| Component | หมายเหตุ | สถานะ |
|-----------|----------|-------|
| FloorPlanComponent | Spatial Floor Plan + drag-and-drop + FloorObject layer | ✅ |
| ZoneListComponent | รวม Zone tab + Table tab ในหน้าเดียว | ✅ |
| ZoneManageComponent | สร้าง/แก้ไขโซน | ✅ |
| TableListComponent | รายการโต๊ะ (pagination + filter) | ✅ |
| TableManageComponent | สร้าง/แก้ไขโต๊ะ (form) | ✅ |
| ReservationListComponent | Calendar Month View + Day Detail (Timeline cards) | ✅ |
| ReservationManageComponent | สร้าง/แก้ไขการจอง | ✅ |
| TableActionDialogComponent | Hub dialog — เปิด/ปิด/ย้าย/เชื่อม/unavailable | ✅ |
| OpenTableDialogComponent | Dialog เปิดโต๊ะ | ✅ |
| MoveTableDialogComponent | Dialog ย้ายโต๊ะ | ✅ |
| LinkTableDialogComponent | Dialog เชื่อมโต๊ะ | ✅ |
| ConfirmReservationDialogComponent | Dialog ยืนยันการจอง (เลือกโต๊ะ) | ✅ |
| FloorObjectDialogComponent | Dialog เพิ่ม/แก้ FloorObject | ✅ |
| QrCodeDialogComponent | Dialog แสดง/พิมพ์ QR Code | ❌ รอ Phase 5 (Self-Order) |
