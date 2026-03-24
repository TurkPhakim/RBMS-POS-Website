# ระบบแจ้งเตือน (Notification System)

> อัพเดตล่าสุด: 2026-03-19

---

## สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Architecture](#2-architecture)
3. [Event Types](#3-event-types)
4. [Notification UI](#4-notification-ui)
5. [Persistence & Cleanup](#5-persistence--cleanup)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Frontend Components & Services](#8-frontend-components--services)
9. [SignalR Hub Implementation](#9-signalr-hub-implementation)
10. [จุดเชื่อมต่อระบบอื่น](#10-จุดเชื่อมต่อระบบอื่น)
11. [Validation & Edge Cases](#11-validation--edge-cases)
12. [สรุปไฟล์ที่ต้องสร้าง/แก้ไข](#12-สรุปไฟล์ที่ต้องสร้างแก้ไข)

---

## 1. ภาพรวม

### 1.1 บทนำ

ระบบแจ้งเตือน (Notification System) เป็น infrastructure กลางของ RBMS-POS ที่จัดการการสื่อสาร real-time ระหว่างระบบต่างๆ ไปยังพนักงาน ผ่าน **SignalR Hub** (Backend) และ **Sidebar Drawer + Toast** (Frontend) พนักงานจะเห็นการแจ้งเตือนต่างๆ เช่น ออเดอร์ใหม่เข้าครัว, อาหารพร้อมเสิร์ฟ, ลูกค้าเรียกพนักงาน, การจองใกล้ถึงเวลา โดยไม่ต้อง refresh หน้าจอ

**หลักการ:** รับ event real-time → แปลงเป็น NotiItem → push เข้า NotiStore (Angular Signals) → Sidebar Drawer + Badge อัปเดตอัตโนมัติ + Toast สั้นๆ

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน | ที่ต้องการ |
|--------|----------|-----------|
| Real-time | มี SignalR ใน architecture แต่ยังไม่ implement | SignalR Hub + Angular Client |
| แจ้งเตือน | ไม่มี | Sidebar Drawer (slide จากขวา) + Bell icon + Badge |
| Toast | ไม่มี | PrimeNG Toast สั้นๆ ควบคู่กับ Drawer |
| กรอง | ไม่มี | Filter chips ตาม event type + filter ตามโต๊ะ |
| กลุ่มผู้รับ | ไม่มี | Role-based groups (Kitchen, Floor, Cashier, Manager) |
| อ่าน/ไม่อ่าน | ไม่มี | Read/Unread tracking + ปุ่มอ่านทั้งหมด + ปุ่มเคลียร์ |
| ประวัติ | ไม่มี | เก็บใน DB + ดูย้อนหลังได้ + auto-cleanup 7 วัน |
| State | NgRx layout store (skeleton) | NotiStore (Angular Signals) |

### 1.3 ขอบเขต (Scope)

**ทำ:**
- SignalR Hub (Backend) + Client integration (Frontend)
- Sidebar Drawer UI (slide จากขวา, มี filter + read/unread + clear)
- Toast notification (PrimeNG Toast) ควบคู่กับ Drawer
- Event types สำหรับ Table, Order, KDS, Reservation, Payment (8 ประเภท)
- Role-based groups (แต่ละกลุ่มเห็นเฉพาะ noti ของตัวเอง)
- Read/Unread + mark read + mark all read + clear all
- Filter ตาม event type + filter ตามโต๊ะ
- คลิก notification → navigate ไปหน้าที่เกี่ยวข้อง
- เก็บ notification ใน DB + auto-cleanup
- NotiStore (Angular Signals) — state เปลี่ยน → UI อัปเดตเอง ไม่ต้อง refresh

**ไม่ทำ:**
- Push notification บนมือถือ (Mobile app) → อนาคต
- SMS/Email ถึงลูกค้า → อนาคต
- Line notification → อนาคต
- Sound alerts → ตัดออก (ใช้ visual only)

---

## 2. Architecture

### 2.1 Flow

```
[Event Source]                [SignalR Hub]              [Frontend Client]
                                  │
Order System ──► NEW_ORDER ──────►│──► Kitchen Group ──► KDS + Drawer + Toast
  (Staff POS / Customer Mobile)   │
                                  │
KDS ──► ORDER_READY ─────────────►│──► Floor Group ────► Drawer + Toast
                                  │
Customer Mobile ──► CALL_WAITER ─►│──► Floor Group ────► Drawer + Toast + Floor Plan
  (via REST API /api/customer/*)  │
                                  │
Customer Mobile ──► REQUEST_BILL ►│──► Cashier Group ──► Drawer + Toast
  (via REST API /api/customer/*)  │
                                  │
Scheduler ──► RESERVATION_REMINDER►│──► Manager Group ──► Drawer + Toast
                                  │
Order System ──► ORDER_CANCELLED ►│──► Kitchen Group ──► KDS + Drawer + Toast
                                  │
Payment ──► SLIP_UPLOADED ────────►│──► Cashier Group ──► Drawer + Toast
                                  │
Payment ──► PAYMENT_COMPLETED ───►│──► Floor + Manager ► Drawer
```

### 2.2 SignalR Hubs (2 Hub Architecture)

ระบบมี **2 SignalR Hub** แยกตามวัตถุประสงค์:

| Hub | Route | วัตถุประสงค์ | Client |
|-----|-------|-------------|--------|
| **NotificationHub** | `/hubs/notification` | Notification Drawer (bell icon) สำหรับ staff ทุกคน | Staff UI (header) |
| **OrderHub** | `/hubs/order` | KDS real-time (ออเดอร์เข้า/status update/ยกเลิก) + **Customer order tracking** | KDS page + Customer Mobile Web |

> **NotificationHub** = เอกสารนี้ (REQ-noti-system), **OrderHub** = ดู REQ-order-system + [REQ-self-order-system](REQ-self-order-system.md) Section 11
> **Event Source:** CALL_WAITER, REQUEST_BILL, NEW_ORDER สามารถ trigger จากทั้ง Staff POS และ **Customer Mobile Web** — ดูรายละเอียดที่ [REQ-self-order-system](REQ-self-order-system.md) Section 10–11

**Backend (NotificationHub):**
- Hub name: `NotificationHub`
- Route: `/hubs/notification`
- Authentication: ใช้ JWT token เดียวกับ API
- Connection: เมื่อ staff login → auto connect + join group ตาม role

**Frontend:**
- Angular Service: `NotificationSignalRService` (core/services/)
- Auto-connect เมื่อ login สำเร็จ
- Auto-disconnect เมื่อ logout
- Reconnect อัตโนมัติเมื่อขาดการเชื่อมต่อ

> **หมายเหตุ:** เมื่อเกิด event เช่น สร้างออเดอร์ใหม่ → Backend publish ไปทั้ง OrderHub (KDS data) และ NotificationHub (Drawer + Toast) พร้อมกัน

### 2.3 SignalR Groups

| Group | สมาชิก | เห็น Events |
|-------|--------|------------|
| Kitchen | พนักงานครัว/บาร์ | NEW_ORDER, ORDER_CANCELLED |
| Floor | พนักงานเสิร์ฟ, Host | ORDER_READY, CALL_WAITER, PAYMENT_COMPLETED |
| Cashier | แคชเชียร์ | REQUEST_BILL, SLIP_UPLOADED |
| Manager | ผู้จัดการ | ทุก event (รวม RESERVATION_REMINDER) |

**การ assign group:**
- ผูกกับ **Permission** ของ user (ไม่ใช่ position/role ตรงๆ)
- ถ้ามี `kitchen-food.read` OR `kitchen-beverage.read` OR `kitchen-dessert.read` → join Kitchen group
- ถ้ามี `order.read` → join Floor group
- ถ้ามี `payment-manage.read` → join Cashier group
- Manager → join ทุก group

---

## 3. Event Types

### 3.1 ตาราง Events

| Event Type | ชื่อภาษาไทย | Icon | สี | Target Group | Toast | Trigger |
|-----------|------------|------|-----|-------------|-------|---------|
| `NEW_ORDER` | ออเดอร์ใหม่ | `pi pi-shopping-cart` | primary | Kitchen | แสดง | Order items ถูกส่งครัว (PENDING → SENT) |
| `ORDER_READY` | อาหารพร้อมเสิร์ฟ | `pi pi-check-circle` | success | Floor | แสดง | KDS mark "เสร็จแล้ว" (PREPARING → READY) |
| `CALL_WAITER` | เรียกพนักงาน | `pi pi-bell` | danger | Floor | แสดง | ลูกค้ากดปุ่มใน QR Panel |
| `REQUEST_BILL` | ขอเช็คบิล | `pi pi-money-bill` | info | Cashier | แสดง | ลูกค้ากดขอบิลจาก QR Panel หรือพนักงานกด — แคชเชียร์ต้องเข้า Payment Process เตรียมบิล (ยังไม่สร้าง TbOrderBill จนกว่าจะกด "ยืนยันบิล") |
| `RESERVATION_REMINDER` | การจองใกล้ถึงเวลา | `pi pi-calendar` | warning | Manager | แสดง | 30 นาทีก่อนเวลาจอง (Scheduler) |
| `ORDER_CANCELLED` | ยกเลิกรายการ | `pi pi-times-circle` | danger | Kitchen | แสดง | Staff cancel order item (SENT/PREPARING → CANCELLED) |
| `SLIP_UPLOADED` | ลูกค้าส่งสลิป | `invoice-bill` (app-generic-icon) | warning | Cashier | แสดง | ลูกค้า upload สลิปผ่าน QR Panel ([REQ-payment-system](REQ-payment-system.md)) |
| `PAYMENT_COMPLETED` | ชำระเงินเสร็จ | `shopping-basket` (app-generic-icon) | success | Floor + Manager | ไม่แสดง | แคชเชียร์ยืนยันการชำระเงิน ([REQ-payment-system](REQ-payment-system.md)) |

### 3.2 ข้อมูลที่แนบ (Payload)

ทุก event มี payload มาตรฐาน:

```json
{
  "notificationId": 123,
  "eventType": "NEW_ORDER",
  "title": "ออเดอร์ใหม่",
  "message": "โต๊ะ A3 — ข้าวผัดกุ้ง x2, ต้มยำกุ้ง x1",
  "tableId": 5,
  "tableName": "A3",
  "orderId": 42,
  "targetGroup": "Kitchen",
  "createdAt": "2026-03-19T14:30:00Z",
  "isRead": false
}
```

**ข้อมูลเพิ่มเติมตาม event type:**

| Event | ข้อมูลเพิ่ม |
|-------|-----------|
| NEW_ORDER | orderItems: [{menuName, quantity}] |
| ORDER_READY | orderItems: [{menuName, quantity}] |
| CALL_WAITER | — (แค่ tableId + tableName) |
| REQUEST_BILL | grandTotal |
| RESERVATION_REMINDER | customerName, guestCount, reservationTime |
| ORDER_CANCELLED | orderItems: [{menuName, quantity}], cancelReason |
| SLIP_UPLOADED | orderBillId, grandTotal, slipVerificationStatus |
| PAYMENT_COMPLETED | orderBillId, paymentMethod, grandTotal, tableName |

> **หมายเหตุ:** ข้อมูลเพิ่มเติมเหล่านี้ (เช่น `orderBillId`, `paymentMethod`) เก็บใน column `Payload` (JSON) ของ TbNotification — ไม่ได้เป็น FK column แยก เพราะแต่ละ event type มีข้อมูลต่างกัน ดู schema ที่ §6.1

### 3.3 Workflow แต่ละ Event

#### 1) NEW_ORDER — ออเดอร์ใหม่เข้าครัว

```
พนักงาน/ลูกค้าสั่งอาหาร → กด "ส่งครัว"
    → Backend สร้าง OrderItems (status: SENT)
    → NotificationHub → Kitchen group
    → พนักงานครัวเห็น noti: "โต๊ะ A3 — ข้าวผัดกุ้ง x2, ต้มยำกุ้ง x1"
    → กด noti → navigate ไป Order Detail
```

**Source:** Order System ([REQ-order-system](REQ-order-system.md) §5) + Self-Order System ([REQ-self-order-system](REQ-self-order-system.md) §9)

#### 2) ORDER_READY — อาหารพร้อมเสิร์ฟ

```
พนักงานครัวทำอาหารเสร็จ → กด "เสร็จแล้ว" บน KDS
    → item status: PREPARING → READY
    → NotificationHub → Floor group
    → พนักงานเสิร์ฟเห็น noti: "โต๊ะ A3 — ข้าวผัดกุ้ง พร้อมเสิร์ฟ"
    → กด noti → navigate ไป Order Detail (หยิบอาหารไปเสิร์ฟ)
```

**Source:** Kitchen System ([REQ-kitchen-system](REQ-kitchen-system.md) §4)

#### 3) CALL_WAITER — ลูกค้าเรียกพนักงาน

```
ลูกค้ากด "เรียกพนักงาน" บน Mobile Web (QR Panel)
    → POST /api/customer/call-waiter (cooldown 60 วินาที)
    → NotificationHub → Floor group
    → พนักงานเสิร์ฟเห็น noti: "โต๊ะ A3 เรียกพนักงาน"
    → Floor Plan แสดง tag CALL_WAITER ที่โต๊ะนั้น
    → กด noti → navigate ไป Floor Plan (โต๊ะนั้น)
```

**Source:** Self-Order System ([REQ-self-order-system](REQ-self-order-system.md) §10.1)

#### 4) REQUEST_BILL — ขอเช็คบิล

```
ลูกค้ากด "ขอเช็คบิล" จาก QR Panel (หรือพนักงานกด)
    → Order status → BILLING, Table status → BILLING
    → NotificationHub → Cashier group
    → แคชเชียร์เห็น noti: "โต๊ะ A3 ขอเช็คบิล — ยอด 506.11"
    → กด noti → navigate ไป Payment Process
    → แคชเชียร์เลือก ServiceCharge + ส่วนลด → กด "ยืนยันบิล"
    → (ลูกค้ารอจนกว่าแคชเชียร์ยืนยัน → เห็นบิลจริงผ่าน SignalR)
```

**Source:** Order System ([REQ-order-system](REQ-order-system.md) §14.6) + Payment System ([REQ-payment-system](REQ-payment-system.md) §6.1)

#### 5) RESERVATION_REMINDER — การจองใกล้ถึงเวลา

```
Background Scheduler ตรวจทุก 5 นาที
    → พบการจองที่เหลืออีก ≤ 30 นาที + ReminderSent = false
    → NotificationHub → Manager group
    → ผู้จัดการเห็น noti: "คุณสมชาย 4 ท่าน เวลา 18:00"
    → Mark ReminderSent = true (ไม่ส่งซ้ำ)
    → กด noti → navigate ไปหน้าแก้ไขการจอง
```

**Source:** Table System ([REQ-table-system](REQ-table-system.md) §10) + §10.1 ด้านล่าง

#### 6) ORDER_CANCELLED — ยกเลิกรายการอาหาร

```
พนักงานกด "ยกเลิก" บน Order item
    → Manager auth (PIN/password) + ระบุเหตุผล
    → item status: SENT/PREPARING → CANCELLED
    → NotificationHub → Kitchen group
    → พนักงานครัวเห็น noti: "โต๊ะ A3 ยกเลิก ข้าวผัดกุ้ง x1 — เหตุผล: ลูกค้าเปลี่ยนใจ"
    → KDS ลบรายการที่ถูกยกเลิกออก
    → กด noti → navigate ไป Order Detail
```

**Source:** Order System ([REQ-order-system](REQ-order-system.md) §14.5)

#### 7) SLIP_UPLOADED — ลูกค้าส่งสลิปโอนเงิน

```
ลูกค้าโอนเงินแล้ว → กด "อัปโหลดสลิป" บน Mobile Web
    → Backend รับรูปสลิป → OCR ตรวจยอด
    → NotificationHub → Cashier group
    → แคชเชียร์เห็น noti: "โต๊ะ A3 ส่งสลิป — ยอด 506.11"
    → กด noti → navigate ไป Payment Process (ตรวจสลิป + ยืนยัน)
```

**Source:** Payment System ([REQ-payment-system](REQ-payment-system.md) §6.1, §8)

#### 8) PAYMENT_COMPLETED — ชำระเงินเสร็จ

```
แคชเชียร์กดยืนยันการชำระเงิน
    → Bill PAID, Order COMPLETED, Table CLEANING
    → NotificationHub → Floor + Manager group
    → noti เข้า Drawer เท่านั้น (ไม่แสดง Toast — ไม่เร่งด่วน)
    → Floor Plan อัพเดตสถานะโต๊ะเป็น CLEANING
    → (Self-service) ลูกค้าเห็น "ชำระเงินเสร็จสิ้น" ผ่าน OrderHub
```

**Source:** Payment System ([REQ-payment-system](REQ-payment-system.md) §2.1)

---

## 4. Notification UI

### 4.1 Bell Icon + Badge

- **ตำแหน่ง:** Header ด้านขวา ข้าง user avatar
- **Badge:** ตัวเลข unread count → สีแดง (`bg-danger`)
- ถ้า unread > 99 → แสดง "99+"
- ถ้า unread = 0 → ไม่แสดง badge
- **กด bell icon** → เปิด/ปิด Sidebar Drawer

### 4.2 Sidebar Drawer

```
┌─ Header ────────────────────────────────────────┬──────────────────────────────────┐
│  Logo    Breadcrumb               🔔(5)  Admin  │  การแจ้งเตือน              [X]    │
├──────────────────────────────────────────────────│  ┌──────────┐ ┌──────────┐       │
│                                                  │  │อ่านทั้งหมด│ │  เคลียร์  │       │
│                                                  │  └──────────┘ └──────────┘       │
│                                                  │                                  │
│              Main Content Area                   │  [ทั้งหมด] [ออเดอร์ใหม่]          │
│                                                  │  [อาหารพร้อม] [เรียกพนง.]          │
│                                                  │  [เรียกชำระ] [อื่นๆ]               │
│                                                  │                                  │
│                                                  │  กรองโต๊ะ: [ทั้งหมด       ▼]      │
│                                                  │                                  │
│                                                  │  ┌────────────────────────────┐   │
│                                                  │  │ ● เรียกพนักงาน             │   │
│                                                  │  │   โต๊ะ A3 — 2 นาทีที่แล้ว   │   │
│                                                  │  ├────────────────────────────┤   │
│                                                  │  │   ออเดอร์ใหม่              │   │
│                                                  │  │   โต๊ะ B1 — 5 นาทีที่แล้ว   │   │
│                                                  │  ├────────────────────────────┤   │
│                                                  │  │ ● อาหารพร้อมเสิร์ฟ         │   │
│                                                  │  │   โต๊ะ C2 — 8 นาทีที่แล้ว   │   │
│                                                  │  ├────────────────────────────┤   │
│                                                  │  │   ขอเช็คบิล               │   │
│                                                  │  │   โต๊ะ A1 — 12 นาทีที่แล้ว  │   │
│                                                  │  └────────────────────────────┘   │
│                                                  │                                  │
│                                                  │  ยังไม่มีแจ้งเตือนเพิ่มเติม        │
│                                                  │                                  │
└──────────────────────────────────────────────────┴──────────────────────────────────┘
```

**Drawer specs:**
- กว้าง ~400px, slide เข้าจากขวา (animation: `transform translateX`)
- Overlay มืดด้านซ้าย (`bg-black/30`) กดที่ overlay → ปิด Drawer
- z-index สูงกว่า content แต่ต่ำกว่า dialog (PrimeNG dialog)
- สูงเต็มหน้าจอ (จาก header ลงมาถึงล่างสุด)

**ส่วนประกอบ:**

1. **Header**: "การแจ้งเตือน" + ปุ่มปิด (X)
2. **Action buttons**: ปุ่ม "อ่านทั้งหมด" (severity=secondary, outlined) + ปุ่ม "เคลียร์" (severity=danger, outlined)
3. **Filter chips**: Toggle chips สำหรับกรองตาม event type
4. **Table filter**: Dropdown เลือกโต๊ะ (แสดงเฉพาะโต๊ะที่มี notification)
5. **Notification list**: Scrollable, เรียงจากใหม่สุด
6. **Empty state**: `<app-empty-view message="ยังไม่มีการแจ้งเตือน">`

### 4.3 Filter Chips

| Chip | Events ที่แสดง |
|------|--------------|
| ทั้งหมด | ทุก event (default) |
| ออเดอร์ใหม่ | NEW_ORDER |
| อาหารพร้อม | ORDER_READY |
| เรียกพนักงาน | CALL_WAITER |
| เรียกชำระ | REQUEST_BILL |
| อื่นๆ | RESERVATION_REMINDER, ORDER_CANCELLED, SLIP_UPLOADED, PAYMENT_COMPLETED |

- กด chip → toggle active → NotiStore.setFilter() → `filteredNotifications` computed อัปเดตอัตโนมัติ
- Chip active: `bg-primary text-white`, inactive: `bg-surface-card text-surface-dark`

### 4.4 ปุ่ม "อ่านทั้งหมด"

- กดแล้ว → API `PATCH /api/notifications/read-all` → badge เป็น 0
- รายการ notification ยังแสดงอยู่ แต่เปลี่ยนเป็น read style (ไม่มีจุดสี, พื้นหลังปกติ)

### 4.5 ปุ่ม "เคลียร์"

- กดแล้ว → **confirm dialog** (ModalService.info): "ต้องการลบการแจ้งเตือนทั้งหมดหรือไม่?"
- ยืนยัน → API `DELETE /api/notifications/clear-all` → list ว่างเปล่า
- ลบเฉพาะของ user นั้น (per-user clear — user อื่นยังเห็น noti เดิม)

### 4.6 Toast (PrimeNG Toast)

- ใช้ PrimeNG `p-toast` component (วางใน `main-layout.component.html`)
- Position: **top-right**
- Life: **5 วินาที** (auto-dismiss)
- แสดงเฉพาะ events ที่มี Toast = "แสดง" ในตาราง §3.1
- แสดง: icon + title + message สั้น
- กดที่ toast → navigate ไปหน้าที่เกี่ยวข้อง (เหมือนกด notification ใน drawer)
- **ไม่แสดง toast ถ้า drawer เปิดอยู่** (ป้องกัน visual clutter — เพราะเห็นใน drawer แล้ว)
- แสดงสูงสุด **3 toast** พร้อมกัน (ใหม่สุดอยู่บนสุด)

### 4.7 Notification Item Layout

แต่ละรายการใน Drawer แสดง:

- **จุดสี unread** (●) ด้านซ้าย — unread แสดง, read ซ่อน
- **พื้นหลัง**: unread = `bg-primary/5`, read = `bg-transparent`
- **Icon** ตาม event type + สี (ดู §3.1)
- **Title** (เช่น "เรียกพนักงาน", "ออเดอร์ใหม่")
- **Message** (เช่น "โต๊ะ A3 — ข้าวผัดกุ้ง x2")
- **เวลา** relative (เช่น "2 นาทีที่แล้ว", "1 ชั่วโมงที่แล้ว")
- **Hover**: `bg-surface-hover` + cursor pointer
- **Click**: mark read + ปิด drawer + navigate ไปหน้าที่เกี่ยวข้อง

### 4.8 Navigation Mapping

| Event | Navigate ไป | หมายเหตุ |
|-------|------------|----------|
| NEW_ORDER | `/order/{orderId}` | หน้ารายละเอียดออเดอร์ (REQ-order §13.2) |
| ORDER_READY | `/order/{orderId}` | หน้ารายละเอียดออเดอร์ |
| CALL_WAITER | `/table/floor-plan/{tableId}` | หน้าโต๊ะ (REQ-table §12.2) |
| REQUEST_BILL | `/payment/process/{orderId}` | หน้า Payment Process (เตรียมบิล: เลือก ServiceCharge + ส่วนลด → ยืนยันบิล) |
| RESERVATION_REMINDER | `/table/reservations/update/{reservationId}` | หน้าแก้ไขการจอง (REQ-table §12.2) |
| ORDER_CANCELLED | `/order/{orderId}` | หน้ารายละเอียดออเดอร์ |
| SLIP_UPLOADED | `/payment/process/{orderId}` | หน้าชำระเงิน (REQ-payment §11.2) |
| PAYMENT_COMPLETED | `/table/floor-plan` | หน้า Floor Plan |

---

## 5. Persistence & Cleanup

### 5.1 เก็บใน Database

- ทุก notification เก็บใน `TbNotification` เพื่อ:
  - แสดงประวัติย้อนหลังเมื่อ refresh หน้า
  - ซิงค์ read/unread ข้ามอุปกรณ์
  - ป้องกัน notification หายเมื่อ SignalR reconnect

### 5.2 Auto-Cleanup

- Notification เก่ากว่า **7 วัน** → ลบอัตโนมัติ (hard delete)
- ใช้ `CleanupBackgroundService` (IHostedService) ทำงานทุกวันเวลา 03:00
- ลำดับ: ลบ `TbNotificationRead` ก่อน (FK) → แล้วลบ `TbNotification`
- ดูรายละเอียด Background Service ที่ [auto-cleanup.md](../architecture/auto-cleanup.md)

### 5.3 User-level Clear

- เมื่อ user กดปุ่ม "เคลียร์" → บันทึก `ClearedAt` timestamp ใน `TbNotificationRead`
- Notifications ที่มี `CreatedAt <= ClearedAt` จะถูกซ่อนจาก user นั้น
- Notification ใหม่ที่เข้ามาหลังจาก clear → แสดงตามปกติ
- User อื่นไม่ได้รับผลกระทบ (per-user clear)

---

## 6. Database Schema

### 6.1 TbNotification

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| NotificationId | int (PK, Identity) | ไม่ | | |
| EventType | nvarchar(50) | ไม่ | | เช่น "NEW_ORDER", "CALL_WAITER" |
| Title | nvarchar(200) | ไม่ | | หัวข้อ |
| Message | nvarchar(1000) | ไม่ | | ข้อความ |
| TableId | int (FK → TbTable) | ใช่ | null | โต๊ะที่เกี่ยวข้อง (ถ้ามี) |
| OrderId | int (FK → TbOrder) | ใช่ | null | ออเดอร์ที่เกี่ยวข้อง (ถ้ามี) |
| ReservationId | int (FK → TbReservation) | ใช่ | null | การจองที่เกี่ยวข้อง (ถ้ามี) |
| TargetGroup | nvarchar(50) | ไม่ | | กลุ่มเป้าหมาย (Kitchen/Floor/Cashier/Manager) |
| Payload | nvarchar(max) | ใช่ | null | JSON ข้อมูลเพิ่มเติม |
| CreatedAt | datetime2 | ไม่ | GETUTCDATE() | เวลาสร้าง |

**หมายเหตุ:**
- ใช้ **Hard delete** (auto-cleanup ลบ record จริง)
- ไม่ inherit BaseEntity (ไม่ต้องมี audit fields — ข้อมูลชั่วคราว)

### 6.2 TbNotificationRead

| Column | Type | Nullable | Default | หมายเหตุ |
|--------|------|----------|---------|----------|
| NotificationReadId | int (PK, Identity) | ไม่ | | |
| NotificationId | int (FK → TbNotification) | ไม่ | | |
| UserId | int (FK → TbUser) | ไม่ | | user ที่อ่านแล้ว |
| ReadAt | datetime2 | ใช่ | null | เวลาที่อ่าน (null = ยังไม่อ่าน) |
| ClearedAt | datetime2 | ใช่ | null | เวลาที่ user กด "เคลียร์" (null = ไม่ได้ clear) |

**เหตุผลที่แยกตาราง:** 1 notification → หลาย users อ่าน (ใน group เดียวกัน) → ต้อง track per-user read + clear status

---

## 7. API Endpoints

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/notifications` | ต้อง login | ดึง notifications ของ user |
| GET | `/api/notifications/unread-count` | ต้อง login | จำนวน unread |
| PATCH | `/api/notifications/{notificationId}/read` | ต้อง login | Mark เป็นอ่านแล้ว |
| PATCH | `/api/notifications/read-all` | ต้อง login | Mark ทั้งหมดเป็นอ่านแล้ว |
| DELETE | `/api/notifications/clear-all` | ต้อง login | ซ่อน notifications ทั้งหมดของ user (set ClearedAt) |

**หมายเหตุ:** ไม่มี permission แยกสำหรับ notification — ผูกกับ group membership (ดู §2.3)

### 7.1 GET /api/notifications — Query Parameters

| Parameter | Type | Default | หมายเหตุ |
|-----------|------|---------|----------|
| `eventType` | string | null | Filter ตาม event type (เช่น "NEW_ORDER", "CALL_WAITER") |
| `tableId` | int | null | Filter ตามโต๊ะ |
| `limit` | int | 50 | จำนวนสูงสุด |
| `before` | int | null | Cursor pagination — ดึง notifications ที่ NotificationId < before |

**Response:** `BaseResponseModel<NotificationResponseModel[]>`

---

## 8. Frontend Components & Services

### 8.1 NotiStore (Angular Signals)

```typescript
// core/services/noti-store.service.ts (providedIn: 'root')

// State signals
notifications = signal<NotiItem[]>([]);
isDrawerOpen = signal(false);
activeFilter = signal<string | null>(null);  // null = ทั้งหมด
tableFilter = signal<number | null>(null);   // null = ทุกโต๊ะ

// Computed
unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
filteredNotifications = computed(() => {
  let list = this.notifications();
  const filter = this.activeFilter();
  const table = this.tableFilter();
  if (filter === 'OTHER') {
    list = list.filter(n => !['NEW_ORDER','ORDER_READY','CALL_WAITER','REQUEST_BILL'].includes(n.eventType));  // = อื่นๆ (RESERVATION_REMINDER, ORDER_CANCELLED, SLIP_UPLOADED, PAYMENT_COMPLETED)
  } else if (filter) {
    list = list.filter(n => n.eventType === filter);
  }
  if (table) {
    list = list.filter(n => n.tableId === table);
  }
  return list;
});
availableTables = computed(() => {
  // ดึง unique tableId/tableName จาก notifications ที่มี
});

// Methods
addNotification(noti: NotiItem)    // เพิ่ม noti ใหม่ + show toast (ถ้า urgent + drawer ปิด)
markRead(notificationId: number)   // API + update local state
markAllRead()                      // API + update local state
clearAll()                         // API + clear local state
toggleDrawer()                     // เปิด/ปิด drawer
setFilter(eventType: string | null)
setTableFilter(tableId: number | null)
loadNotifications()                // โหลดจาก API ตอนเปิดหน้า/reconnect
```

> **หมายเหตุ**: แทนที่ NgRx `notificationPanelOpen` ด้วย `NotiStore.isDrawerOpen` signal — ลบ layout actions/state ที่เกี่ยวกับ notification ออก

### 8.2 Services

| Service | ที่อยู่ | หน้าที่ |
|---------|--------|--------|
| `NotiStore` | `core/services/noti-store.service.ts` | State management (Signals) + API calls + Toast trigger |
| `NotificationSignalRService` | `core/services/notification-signalr.service.ts` | SignalR connection + event handling → เรียก NotiStore |

### 8.3 Components

| Component | ที่อยู่ | หน้าที่ |
|-----------|--------|--------|
| `NotificationDrawerComponent` | `shared/components/notification-drawer/` | Sidebar Drawer UI (header + filters + list + actions) |

> Bell icon อยู่ใน Header component อยู่แล้ว → กด bell → `notiStore.toggleDrawer()`
> ลบ NotificationPanelComponent (skeleton เดิม) ออก

### 8.4 Toast Integration

- เพิ่ม `<p-toast position="top-right" key="noti">` ใน `main-layout.component.html`
- เมื่อ SignalR ได้ event ที่มี Toast = "แสดง" + drawer ปิดอยู่ → NotiStore เรียก `MessageService.add()` แสดง toast
- Toast severity mapping: `primary` → info, `success` → success, `danger` → error, `warning` → warn, `info` → info
- Toast click → ปิด toast + navigate ไปหน้าที่เกี่ยวข้อง (ดู §4.8)

---

## 9. SignalR Hub Implementation

### 9.1 Backend Hub

```
NotificationHub : Hub
├── OnConnectedAsync() → Join groups ตาม user permissions
├── OnDisconnectedAsync() → Leave groups
├── SendToGroup(group, notification) → ส่ง noti ไปยังกลุ่ม
└── AcknowledgeCallWaiter(tableId) → Clear "เรียกพนักงาน" event
```

### 9.2 Server-side Trigger

เมื่อ Business Service ต้องการส่ง notification:

```csharp
// ตัวอย่าง: Order Service ส่งครัว
await _notificationService.SendAsync(new NotificationModel
{
    EventType = "NEW_ORDER",
    Title = "ออเดอร์ใหม่",
    Message = $"โต๊ะ {tableName} — {itemsSummary}",
    TableId = tableId,
    OrderId = orderId,
    TargetGroup = "Kitchen"
});
```

`NotificationService` จะ:
1. บันทึกลง `TbNotification`
2. ส่งผ่าน SignalR → `NotificationHub.SendToGroup("Kitchen", ...)`

---

## 10. จุดเชื่อมต่อระบบอื่น

| ระบบ | Events ที่ trigger |
|------|-------------------|
| **Order System** ([REQ-order-system](REQ-order-system.md)) | NEW_ORDER (ส่งครัว), ORDER_READY (KDS เสร็จ), CALL_WAITER (ลูกค้ากด), REQUEST_BILL (ลูกค้ากด), ORDER_CANCELLED (staff cancel) |
| **Table System** ([REQ-table-system](REQ-table-system.md)) | RESERVATION_REMINDER (scheduler 30 นาที) |
| **Payment System** ([REQ-payment-system](REQ-payment-system.md)) | SLIP_UPLOADED (ลูกค้าส่งสลิป → Cashier), PAYMENT_COMPLETED (ชำระเงินเสร็จ → Floor + Manager) |
| **Self-Order System** ([REQ-self-order-system](REQ-self-order-system.md)) | CALL_WAITER + REQUEST_BILL + NEW_ORDER จาก Customer Mobile Web |

### 10.1 Reservation Reminder Scheduler

- ใช้ **Background Service** (IHostedService) check ทุก 5 นาที
- Logic: ดึง reservations ที่ status = CONFIRMED + ReservationDate = วันนี้ + เวลาจองอีก ≤ 30 นาที + ReminderSent = false
- ส่ง RESERVATION_REMINDER + mark ReminderSent = true

---

## 11. Validation & Edge Cases

| กรณี | การจัดการ |
|------|----------|
| User ไม่อยู่ใน group ที่ noti ส่ง | ไม่ได้รับ noti (SignalR group filter) |
| SignalR disconnect | Auto-reconnect + โหลด noti ที่พลาดจาก API (`loadNotifications()`) |
| Notification เก่ามาก | Auto-cleanup 7 วัน (Background Service) |
| CALL_WAITER spam | Cooldown 60 วินาที (จัดการที่ Order System — ดู REQ-order-system §17.3) |
| ส่ง noti ซ้ำ (SignalR retry) | Frontend deduplicate ด้วย notificationId |
| Toast overflow | แสดงสูงสุด 3 toast พร้อมกัน, ใหม่สุดอยู่บนสุด |
| Drawer เปิดอยู่ + noti ใหม่เข้า | เพิ่มใน list ทันที, **ไม่แสดง toast** (เห็นใน drawer แล้ว) |
| เคลียร์แล้ว + noti ใหม่เข้า | แสดงตามปกติ (ClearedAt < CreatedAt ของ noti ใหม่) |
| หลาย tab เปิดพร้อมกัน | ใช้ SignalR connection 1 ชุดต่อ tab — mark read ผ่าน API → tab อื่น sync ตอน focus |

---

## 12. สรุปไฟล์ที่ต้องสร้าง/แก้ไข

### Backend

| ไฟล์ | หมายเหตุ |
|------|----------|
| `POS.Main.Dal/Entities/Notification/TbNotification.cs` | Entity |
| `POS.Main.Dal/Entities/Notification/TbNotificationRead.cs` | Entity (มี ClearedAt) |
| `POS.Main.Dal/EntityConfigurations/` | 2 configuration files |
| `POS.Main.Repositories/` | NotificationRepository |
| `POS.Main.Business.Notification/` | NotificationService (send + query + cleanup + clear) |
| `RBMS.POS.WebAPI/Hubs/NotificationHub.cs` | SignalR Hub |
| `RBMS.POS.WebAPI/Controllers/NotificationsController.cs` | API Controller (5 endpoints) |
| `RBMS.POS.WebAPI/Services/ReservationReminderService.cs` | Background Service (IHostedService) |
| Migration | สร้างตาราง TbNotification + TbNotificationRead |

### Frontend

| Component/Service | หมายเหตุ |
|-------------------|----------|
| `NotiStore` (`core/services/noti-store.service.ts`) | State management (Signals) + API + Toast |
| `NotificationSignalRService` (`core/services/notification-signalr.service.ts`) | SignalR client → NotiStore |
| `NotificationDrawerComponent` (`shared/components/notification-drawer/`) | Sidebar Drawer UI |
| `main-layout.component.html` | เพิ่ม `<p-toast>` + `<app-notification-drawer>` |
| `header.component.ts` | เปลี่ยน bell click → `notiStore.toggleDrawer()` |
| ลบ `notification-panel/` (skeleton เดิม) | แทนที่ด้วย notification-drawer |
| ลบ layout actions/state เกี่ยวกับ notification | แทนที่ด้วย NotiStore signals |
