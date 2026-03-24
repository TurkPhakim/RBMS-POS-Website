# ระบบจอครัว (Kitchen Display System — KDS)

> สถานะ: **Draft** | อัปเดตล่าสุด: 2026-03-18

---

## สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [KDS Layout (ภาพรวมหน้าจอ)](#2-kds-layout-ภาพรวมหน้าจอ)
3. [Order View (มุมมองตามออเดอร์)](#3-order-view-มุมมองตามออเดอร์)
4. [Menu View (มุมมองตามเมนู)](#4-menu-view-มุมมองตามเมนู)
5. ["รอเสิร์ฟ" Section](#5-รอเสิร์ฟ-section)
6. [Timer & Color System](#6-timer--color-system)
7. [Sound Alerts](#7-sound-alerts)
8. [Queue Management](#8-queue-management)
9. [SignalR Integration (OrderHub)](#9-signalr-integration-orderhub)
10. [Database Changes](#10-database-changes)
11. [API Endpoints](#11-api-endpoints)
12. [Frontend Components](#12-frontend-components)
13. [Permissions](#13-permissions)
14. [User Flows](#14-user-flows)
15. [Edge Cases & Decisions](#15-edge-cases--decisions)
16. [จุดเชื่อมต่อระบบอื่น](#16-จุดเชื่อมต่อระบบอื่น)
17. [สรุปไฟล์ที่ต้องสร้าง/แก้ไข](#17-สรุปไฟล์ที่ต้องสร้างแก้ไข)

---

## 1. ภาพรวม

### 1.1 บทนำ

KDS (Kitchen Display System) คือหน้าจอ full-screen สำหรับพนักงานครัว/บาร์/ขนมหวาน ใช้ดูและจัดการออเดอร์ที่เข้ามาแบบ real-time โดย:

- **2 โหมดการแสดงผล:**
  - **Order View** — จัดกลุ่มตามโต๊ะ/ออเดอร์ เรียงตามเวลาที่เข้ามา (FIFO)
  - **Menu View** — จัดกลุ่มตามชื่อเมนู เพื่อทำอาหารแบบ batch (เช่น ผัดข้าวผัดกุ้ง 5 จานพร้อมกัน)

- **3 routes แยกตามหมวดหมู่:**
  - `/kitchen-display/food` — อาหาร
  - `/kitchen-display/beverage` — เครื่องดื่ม
  - `/kitchen-display/dessert` — ของหวาน

- **Real-time** ผ่าน SignalR OrderHub (แยกจาก NotificationHub)

อ้างอิง: FoodStory POS, Toast POS KDS, Fresh KDS

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน | ที่ต้องการ |
|--------|----------|-----------|
| KDS | Stub placeholder component | Full KDS 2 view modes |
| OrderHub | Empty Hub class (registered `/hubs/order`) | Real-time order events 4 event types |
| CookingStartedAt | ไม่มี field | เพิ่ม field ใน TbOrderItem |
| Routes | 1 route `/kitchen-display` | 3 routes แยกหมวด (food/beverage/dessert) |
| รอเสิร์ฟ | ไม่มี | Section แสดง READY items + alert เมื่อรอ >5 นาที |
| Sound | ไม่มี | เสียงแจ้ง ออเดอร์ใหม่ / ยกเลิก / รอนาน |

### 1.3 ขอบเขต (Scope)

**ทำ:**
- 3-route KDS (อาหาร / เครื่องดื่ม / ของหวาน)
- Order View (card per order, per-item checkbox, batch actions)
- Menu View (aggregate by menu name, batch cooking workflow)
- "รอเสิร์ฟ" section (READY items, alert >5 นาที)
- Timer & color system (wait time, cooking time, ready time)
- Sound alerts (ออเดอร์ใหม่, ยกเลิก, รอนาน)
- SignalR OrderHub integration (4 event types)
- เพิ่ม CookingStartedAt field ใน TbOrderItem

**ไม่ทำ (Phase แรก):**
- Expo View (หน้ารวมศูนย์ทุกสถานี)
- Order entity / status flow definitions (owned by REQ-order-system)
- Floor staff "mark served" (ทำจาก Table Detail ตาม REQ-order-system Section 7.4)
- Notification bar (owned by REQ-noti-system)
- Sound file production (ใช้ placeholder files)

### 1.4 ความเป็นเจ้าของ (Ownership)

| เรื่อง | เจ้าของ |
|--------|---------|
| TbOrderItem, TbOrder entities | [REQ-order-system](REQ-order-system.md) |
| EOrderItemStatus enum & transitions | [REQ-order-system](REQ-order-system.md) Section 4 |
| KDS API endpoints (base definition) | [REQ-order-system](REQ-order-system.md) Section 12.3 |
| **CookingStartedAt field** | **เอกสารนี้** (Section 10) |
| **KDS Layout, interaction, view modes** | **เอกสารนี้** (Section 2–5) |
| **OrderHub events & payload** | **เอกสารนี้** (Section 9) |
| **Timer / color / sound** | **เอกสารนี้** (Section 6–7) |
| **Frontend components** | **เอกสารนี้** (Section 12) |

---

## 2. KDS Layout (ภาพรวมหน้าจอ)

### 2.1 Full-screen Mode

- KDS อยู่ภายใต้ **MainLayout** (มี sidebar + header + breadcrumb)
- มีปุ่ม **Fullscreen toggle** ซ่อน sidebar + header → แสดงเฉพาะ KDS header bar + order grid
- กดอีกครั้ง → กลับสู่ layout ปกติ
- รองรับจอใหญ่ (1920×1080+) เป็นหลัก, Tablet (1024×768) เป็นรอง

### 2.2 KDS Header Bar

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [อาหาร]  [เครื่องดื่ม]  [ของหวาน]    [Order View] [Menu View]                  │
│                                                                                  │
│                                        รอเสิร์ฟ (3)   🔊   14:32   [⛶ เต็มจอ]  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

| องค์ประกอบ | คำอธิบาย |
|-----------|---------|
| Category links | 3 ลิงก์ navigate ด้วย `router.navigate()` — active route highlight |
| View mode toggle | สลับ Order View / Menu View — state เก็บใน `localStorage` |
| รอเสิร์ฟ badge | จำนวน READY items ที่ยังไม่ SERVED (คลิกเพื่อ scroll ไปด้านล่าง) |
| Sound toggle | ปิด/เปิดเสียง — state เก็บใน `localStorage` |
| นาฬิกา | แสดงเวลาปัจจุบัน (HH:MM) |
| Fullscreen toggle | ซ่อน/แสดง sidebar + header |

### 2.3 Route Structure

| Route | Component | Permission | Route Data |
|-------|-----------|-----------|------------|
| `/kitchen-display` | redirect → `/kitchen-display/food` | — | — |
| `/kitchen-display/food` | `KitchenDisplayComponent` | `kitchen-food.read` | `{ categoryType: 1, categoryLabel: 'อาหาร' }` |
| `/kitchen-display/beverage` | `KitchenDisplayComponent` | `kitchen-beverage.read` | `{ categoryType: 2, categoryLabel: 'เครื่องดื่ม' }` |
| `/kitchen-display/dessert` | `KitchenDisplayComponent` | `kitchen-dessert.read` | `{ categoryType: 3, categoryLabel: 'ของหวาน' }` |

- ใช้ **component เดียว** `KitchenDisplayComponent` — อ่าน `categoryType` จาก `ActivatedRoute.data`
- เมื่อเปลี่ยน route → component re-init, API re-fetch, SignalR filter เปลี่ยน

### 2.4 Overall Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  KDS Header Bar (Section 2.2)                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Order Grid (Order View หรือ Menu View)                          │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ Card 1 │  │ Card 2 │  │ Card 3 │  │ Card 4 │                │
│  │        │  │        │  │        │  │        │                │
│  └────────┘  └────────┘  └────────┘  └────────┘                │
│                                                                  │
│  ┌────────┐  ┌────────┐                                         │
│  │ Card 5 │  │ Card 6 │                                         │
│  └────────┘  └────────┘                                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  รอเสิร์ฟ Section (collapsible)                          [▼]    │
│  ┌────────┐  ┌────────┐  ┌────────┐                             │
│  │ Ready  │  │ Ready  │  │ Ready  │                             │
│  └────────┘  └────────┘  └────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

- Order Grid ใช้ **CSS Grid/Flexbox wrap** — cards เรียงซ้ายไปขวา, บนลงล่าง
- จำนวน columns ขึ้นกับความกว้างจอ (responsive)
- รอเสิร์ฟ section อยู่ด้านล่างสุด — collapse/expand ด้วย toggle

---

## 3. Order View (มุมมองตามออเดอร์)

### 3.1 Concept

- จัดกลุ่ม order items ตามโต๊ะ/ออเดอร์ — 1 card = 1 order (filter เฉพาะ categoryType ปัจจุบัน)
- เรียง **FIFO** (ออเดอร์เก่าสุดอยู่ซ้ายบน)
- แต่ละ item มี **checkbox** สำหรับเลือกเปลี่ยนสถานะทีละรายการ

### 3.2 Card Layout

```
┌─────────────────────────────────┐
│  โต๊ะ A3              ⏱ 12:45  │  ← ชื่อโต๊ะ + wait timer
│  ORD-20260318-003               │  ← เลข order
│  ───────────────────────────── │
│  ☐ ข้าวผัดกุ้ง ×2               │  ← checkbox + ชื่อเมนู + จำนวน
│     + ไข่ดาว, เผ็ดน้อย          │  ← options (indent)
│     ※ ไม่ใส่ผัก                 │  ← note (indent, italic)
│                                 │
│  ☑ ส้มตำ ×1            ▶ 3:20  │  ← ☑ = กำลังทำ, ▶ cooking timer
│     ⚠ ใช้เวลานาน               │  ← SlowPreparation badge
│                                 │
│  ☐ ต้มยำกุ้ง ×1                 │
│     ※ ไม่ใส่เห็ด               │  ← note
│  ───────────────────────────── │
│  [เริ่มทำ]         [เสร็จแล้ว]   │  ← batch action buttons
└─────────────────────────────────┘
```

### 3.3 Per-item Status Display

| Status | การแสดงผล |
|--------|----------|
| SENT | Text ปกติ, checkbox ว่าง |
| PREPARING | Text สีส้ม + `▶ MM:SS` (cooking timer ตั้งแต่ CookingStartedAt) |
| CANCELLED | ~~Strikethrough~~ + สีแดง + badge "ยกเลิก" (แสดง 5 วินาทีแล้วลบ) |

> **หมายเหตุ:** READY items ไม่แสดงใน Order View card — ย้ายไป "รอเสิร์ฟ" section แล้ว

### 3.4 Card Border Color (ตาม wait time)

Wait time = `now - earliest SentToKitchenAt` ใน card

| เวลารอ | สี Timer | สี Border | หมายเหตุ |
|--------|----------|-----------|----------|
| 0–10 นาที | `text-success` | ปกติ (`border-surface-border`) | เขียว = ปกติ |
| 10–20 นาที | `text-warning` | `border-warning` | เหลือง = เริ่มนาน |
| > 20 นาที | `text-danger` | `border-danger` + pulse animation | แดง = เกินกำหนด |

### 3.5 Per-item Checkbox Behavior

| ปุ่ม | เงื่อนไข Enabled | Action | ผลลัพธ์ |
|------|------------------|--------|---------|
| **เริ่มทำ** | มี checked item ที่ status = SENT ≥ 1 | SENT → PREPARING | Set `CookingStartedAt = now` |
| **เสร็จแล้ว** | มี checked item ที่ status = PREPARING ≥ 1 | PREPARING → READY | Set `ReadyAt = now` |

- ทั้งสองปุ่มแสดงพร้อมกัน (สำหรับ card ที่มี mixed status)
- หลังกดปุ่ม → checkboxes reset เป็นว่างทั้งหมด
- **Checkbox scoped ต่อ card** — ไม่สามารถ check items ข้ามออเดอร์ใน Order View

### 3.6 Card Lifecycle

```
1. Items ใหม่เข้า (SENT)
   └── Card ปรากฏ + เสียงแจ้ง
       │
2. Staff check items + กด "เริ่มทำ"
   └── Checked SENT items → PREPARING (set CookingStartedAt)
       │
3. Staff check items + กด "เสร็จแล้ว"
   └── Checked PREPARING items → READY (set ReadyAt)
       └── Items ย้ายไป "รอเสิร์ฟ" section
           │
4. ทุก item ใน card เป็น READY หรือ CANCELLED
   └── Card หายจาก Order View
```

### 3.7 Card ที่มีเฉพาะบาง items ของ order

ถ้า order หนึ่งมีทั้งอาหาร + เครื่องดื่ม:
- KDS route อาหาร → แสดง card เฉพาะ items ที่ `categoryType = 1`
- KDS route เครื่องดื่ม → แสดง card เฉพาะ items ที่ `categoryType = 2`
- ถ้า order ไม่มี items ในหมวดนั้นเลย → ไม่แสดง card

---

## 4. Menu View (มุมมองตามเมนู)

### 4.1 Concept

- รวม items ที่เป็น **เมนูเดียวกัน** จากหลาย order เข้าด้วยกัน เพื่อทำ batch cooking
- เหมาะกับครัวที่ทำอาหารเดียวกันหลายจานพร้อมกัน (เช่น ผัดข้าวผัดกุ้ง 5 จาน)
- **อนุญาต batch ข้ามออเดอร์** — นี่คือจุดประสงค์หลักของ Menu View

### 4.2 Card Layout

```
┌──────────────────────────────────┐
│  ข้าวผัดกุ้ง + ไข่ดาว             │  ← ชื่อเมนู + options (ถ้ามี)
│  รอทำ: 3 จาน  |  กำลังทำ: 2 จาน  │  ← aggregate counts
│  ────────────────────────────── │
│  ☐ A3 ×2  ※ไม่ใส่ผัก     5:23   │  ← table + qty + note + wait time
│  ☐ B2 ×1                 3:45   │
│  ☑ C1 ×1         ▶ 2:10  0:30   │  ← ☑ = PREPARING, ▶ cooking timer
│  ☑ D4 ×1         ▶ 1:45  8:12   │
│  ────────────────────────────── │
│  [เริ่มทำ]           [เสร็จแล้ว]  │
└──────────────────────────────────┘
```

### 4.3 Grouping Rule

| เงื่อนไข | ผลลัพธ์ |
|----------|---------|
| MenuId เดียวกัน + options เดียวกัน | **Card เดียว** |
| MenuId เดียวกัน + options **ต่างกัน** | **Card แยก** (เช่น "ข้าวผัดกุ้ง" vs "ข้าวผัดกุ้ง + ไข่ดาว") |
| MenuId เดียวกัน + note **ต่างกัน** | **Card เดียว** (แสดง note ต่อ item) |

> **เหตุผล:** Options ที่ต่างกันหมายถึงวิธีทำต่างกัน (เช่น เผ็ดน้อย vs เผ็ดมาก) → แยก card
> Note ต่างกันเป็นแค่คำสั่งเสริม (เช่น "ไม่ใส่ผัก") → ไม่กระทบวิธีทำหลัก → card เดียว

### 4.4 Card Content

แต่ละ row ใน card แสดง:

| ข้อมูล | ตำแหน่ง | หมายเหตุ |
|--------|---------|----------|
| Checkbox | ซ้ายสุด | สำหรับ batch action |
| ชื่อโต๊ะ | หลัง checkbox | เช่น A3, B2 |
| จำนวน | ต่อจากชื่อโต๊ะ | เช่น ×2 |
| Note | ต่อจากจำนวน (ถ้ามี) | italic, เช่น ※ไม่ใส่ผัก |
| Cooking timer | ขวา (ถ้า PREPARING) | `▶ MM:SS` |
| Wait timer | ขวาสุด | `MM:SS` (since SentToKitchenAt) |

### 4.5 Sorting

- Cards เรียงตาม **oldest SentToKitchenAt** ใน group (FIFO)
- ภายใน card: rows เรียงตาม SentToKitchenAt (เก่าสุดอยู่บน)

### 4.6 Batch Action ข้ามออเดอร์

- Staff สามารถ check items จากหลาย order ภายใน card เดียว แล้วกด "เริ่มทำ"/"เสร็จแล้ว" พร้อมกัน
- API call: `PUT /api/kitchen/items/prepare` ด้วย `{ orderItemIds: [101, 205, 312] }` — items จากต่าง order

---

## 5. "รอเสิร์ฟ" Section

### 5.1 Concept

- แสดง items ที่ **READY** (ครัวทำเสร็จแล้ว) แต่ยังไม่ถูก **SERVED** (ยังไม่เสิร์ฟ)
- จัดกลุ่มตามโต๊ะ — เพื่อให้พนักงานเสิร์ฟหยิบอาหารได้ง่าย
- อยู่ด้านล่างของหน้า KDS — collapse/expand ได้

### 5.2 Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  รอเสิร์ฟ (5 รายการ)                                            [▼]    │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐   │
│  │ โต๊ะ A3   ⏱ 2:30  │  │ โต๊ะ B2   ⏱ 7:15  │  │ โต๊ะ C1   ⏱ 1:10  │   │
│  │ ─────────────────  │  │ ⚠ รอนาน!          │  │ ─────────────────  │   │
│  │ ข้าวผัดกุ้ง ×2    │  │ ─────────────────  │  │ แกงเขียวหวาน ×1   │   │
│  │ ส้มตำ ×1          │  │ ต้มยำกุ้ง ×1      │  │                    │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Timer & Alert

| เงื่อนไข | การแสดงผล |
|----------|----------|
| Ready < 5 นาที | Timer สีปกติ (`text-surface-sub`) |
| Ready ≥ 5 นาที | `border-danger` + badge "⚠ รอนาน!" + เสียงแจ้ง (ครั้งเดียว) |

- Timer = `now - ReadyAt` (ใช้ ReadyAt ที่เก่าสุดใน card)

### 5.4 Interaction

- **Read-only** — KDS ไม่มีปุ่ม "เสิร์ฟแล้ว"
- Floor staff ทำ READY → SERVED จาก **Table Detail** (ดู [REQ-order-system](REQ-order-system.md) Section 7.4)
- เมื่อ item ถูก SERVED → SignalR `ItemStatusChanged` → item หายจาก "รอเสิร์ฟ" อัตโนมัติ

### 5.5 Positioning & Toggle

- Default: **collapsed** (แสดงแค่ header bar + count badge)
- คลิก toggle [▼] → expand แสดง cards
- คลิกอีกครั้ง [▲] → collapse กลับ
- State เก็บใน `localStorage` (จำค่าเดิมเมื่อ refresh)
- คลิก "รอเสิร์ฟ (3)" ใน KDS Header → scroll ลงมา + auto-expand

### 5.6 Filter ตาม Category

- "รอเสิร์ฟ" section แสดง **เฉพาะ items ที่ตรงกับ category ปัจจุบัน**
- เช่น อยู่ route `/kitchen-display/food` → แสดงเฉพาะ READY items ที่ `categoryType = 1`

---

## 6. Timer & Color System

### 6.1 Timer Types

| Timer | สูตรคำนวณ | แสดงที่ | Format | Update |
|-------|----------|---------|--------|--------|
| **Wait Timer** | `now - SentToKitchenAt` | Order card header, Menu View per-row | `MM:SS` | ทุก 1 วินาที |
| **Cooking Timer** | `now - CookingStartedAt` | Per-item (เฉพาะ PREPARING) | `▶ MM:SS` | ทุก 1 วินาที |
| **Ready Timer** | `now - ReadyAt` | "รอเสิร์ฟ" card header | `⏱ MM:SS` | ทุก 1 วินาที |

### 6.2 Wait Time Color Thresholds

| เวลารอ | สี Timer | สี Card Border | CSS class |
|--------|----------|---------------|-----------|
| 0–10 นาที | เขียว | ปกติ | `text-success`, `border-surface-border` |
| 10–20 นาที | เหลือง/ส้ม | เหลือง | `text-warning`, `border-warning` |
| > 20 นาที | แดง | แดง + pulse | `text-danger`, `border-danger` + animation |

> **Phase 1:** Threshold hardcoded (10/20 นาที) — อนาคตอาจย้ายไป Shop Settings

### 6.3 SlowPreparation Badge

- Items ที่มี `EMenuTag.SlowPreparation` (bitflag 4) → แสดง badge "⚠ ใช้เวลานาน"
- ไม่เปลี่ยน timer threshold — เป็นแค่ visual indicator ให้ staff รู้ว่าเมนูนี้ใช้เวลานานเป็นปกติ

### 6.4 Timer Implementation

```
✅ ใช้ Date.now() - timestamp (คำนวณจริงทุกวินาที)
❌ ห้ามใช้ counter++ (drift เมื่อ tab inactive หรือ browser throttle)
```

- ใช้ `setInterval(() => tick(), 1000)` เพื่อ trigger re-render
- ฟังก์ชัน `tick()` ไม่ได้เพิ่ม counter — แค่ trigger Angular change detection
- Component คำนวณ display value จาก `Date.now() - item.sentToKitchenAt` ทุกรอบ

---

## 7. Sound Alerts

### 7.1 Sound Events

| Event | ไฟล์เสียง | เมื่อไหร่ | Batching |
|-------|----------|----------|----------|
| ออเดอร์ใหม่ | `new-order.mp3` | Items ใหม่เข้า KDS (SENT) | **1 ครั้ง/ออเดอร์** (ไม่ใช่ per-item) |
| ยกเลิกรายการ | `cancelled.mp3` | Item ถูก CANCELLED | Per-item |
| รอนานเกิน | `overdue.mp3` | Wait time > 20 นาที | **1 ครั้ง/card** เมื่อข้ามเกณฑ์ |
| รอเสิร์ฟนาน | `ready-overdue.mp3` | Ready time > 5 นาที | **1 ครั้ง/card** เมื่อข้ามเกณฑ์ |

### 7.2 Sound Batching & Debounce

- **New order:** เสียงเล่น 1 ครั้งเมื่อ `NewOrderItems` event เข้ามา (ไม่ว่า order จะมีกี่ items)
- **Overdue / Ready-overdue:** เล่น 1 ครั้งเมื่อ card ข้ามเกณฑ์ ไม่เล่นซ้ำ (ป้องกันเสียงรบกวน)
- **Global debounce:** สูงสุด 1 เสียง/3 วินาที — ถ้ามีหลาย events พร้อมกัน เล่นเฉพาะอันแรก

### 7.3 Sound Toggle

- ปุ่ม mute/unmute ใน KDS Header Bar
- State เก็บใน `localStorage` key `kds-sound-enabled`
- Browser autoplay policy: ต้อง user interaction อย่างน้อย 1 ครั้ง (เช่น click) ก่อนเล่นเสียงได้

### 7.4 Sound Files

- อยู่ใน `public/sounds/`
- Reuse จาก notification system ที่ทำได้ (ดู [REQ-noti-system](REQ-noti-system.md) Section 5)
- KDS-specific sounds: `overdue.mp3`, `ready-overdue.mp3` (สร้างใหม่)

---

## 8. Queue Management

### 8.1 Order View Sorting

- เรียง FIFO ตาม **earliest SentToKitchenAt** ใน card
- Cards ที่ overdue (wait > 20 นาที) **float ไปซ้ายบนสุด** อัตโนมัติ
- ภายใน priority เดียวกัน: เรียงตาม `OrderId` ascending

### 8.2 Menu View Sorting

- Cards เรียงตาม **oldest SentToKitchenAt** ของ item ใน group
- Rows ภายใน card เรียงตาม SentToKitchenAt (เก่าสุดอยู่บน)

### 8.3 Skip / Out-of-Order Cooking

- Staff เลือก check items ใดก็ได้อิสระ — **ไม่บังคับ FIFO**
- เหตุผล: kitchen staff รู้ workflow ของตัวเองดีกว่าระบบ (เช่น อาหารจานเดียวกันทำพร้อมกันได้)
- ไม่มี priority system เพิ่มเติมใน Phase 1

---

## 9. SignalR Integration (OrderHub)

### 9.1 Hub Specification

- **Hub class:** `OrderHub` (registered ที่ `/hubs/order`)
- **วัตถุประสงค์:** Broadcast real-time data สำหรับ KDS (แยกจาก NotificationHub ที่ใช้สำหรับ notification bar)
- **Connection:** ใช้ **group by tableId** — เพื่อให้ Customer (Self-Order) รับ events เฉพาะโต๊ะตัวเอง (ดู [REQ-self-order-system](REQ-self-order-system.md) §11.1)
- **KDS client:** join ทุก table group (เพื่อเห็นทุกออเดอร์) — client filter ตามหมวดอาหารเอง

### 9.2 Server → Client Events

| Event Name | Payload | Trigger |
|-----------|---------|---------|
| `NewOrderItems` | ดู 9.3 | Items ส่งครัว (PENDING → SENT) |
| `ItemStatusChanged` | ดู 9.4 | เปลี่ยนสถานะ item (SENT→PREPARING, PREPARING→READY, READY→SERVED) |
| `ItemCancelled` | ดู 9.5 | Item ถูกยกเลิก (SENT/PREPARING → CANCELLED) |
| `OrderUpdated` | ดู 9.6 | Order metadata เปลี่ยน (เช่น ย้ายโต๊ะ) |
| `TableClosed` | `{ tableId }` | Staff ปิดโต๊ะ (ชำระเงินเสร็จ) — Customer ใช้ redirect ไปหน้า Expired (ดู [REQ-self-order-system](REQ-self-order-system.md) §11.2) |

### 9.3 Payload: NewOrderItems

```json
{
  "orderId": 42,
  "tableName": "A3",
  "orderNumber": "ORD-20260318-003",
  "items": [
    {
      "orderItemId": 101,
      "menuId": 15,
      "menuNameThai": "ข้าวผัดกุ้ง",
      "quantity": 2,
      "categoryType": 1,
      "tags": 0,
      "note": "ไม่ใส่ผัก",
      "sentToKitchenAt": "2026-03-18T14:20:00Z",
      "options": [
        { "optionGroupName": "เพิ่มเติม", "optionItemName": "ไข่ดาว", "additionalPrice": 10.00 }
      ]
    }
  ]
}
```

### 9.4 Payload: ItemStatusChanged

```json
{
  "orderItemId": 101,
  "orderId": 42,
  "newStatus": "Preparing",
  "cookingStartedAt": "2026-03-18T14:25:00Z",
  "readyAt": null,
  "servedAt": null
}
```

### 9.5 Payload: ItemCancelled

```json
{
  "orderItemId": 101,
  "orderId": 42,
  "menuNameThai": "ข้าวผัดกุ้ง",
  "tableName": "A3",
  "cancelReason": "ลูกค้าเปลี่ยนใจ"
}
```

### 9.6 Payload: OrderUpdated

```json
{
  "orderId": 42,
  "tableName": "B5",
  "orderNumber": "ORD-20260318-003"
}
```

### 9.7 Client → Server

**ไม่มี** — KDS actions ทั้งหมด (เริ่มทำ, เสร็จแล้ว) ผ่าน **REST API** (PUT endpoints)

> **เหตุผล:** REST API เหมาะกว่าสำหรับ transactional operations (status change + timestamp update + validation) SignalR ใช้สำหรับ one-way broadcast เท่านั้น

### 9.8 Dual-publish Pattern

เมื่อ event เกิดขึ้น (เช่น ส่งออเดอร์เข้าครัว) Backend publish ไป **2 hubs** พร้อมกัน:

```
Backend Service
├── OrderHub.SendAsync("NewOrderItems", fullOrderData)    → KDS clients
└── NotificationHub.SendToGroup("Kitchen", notifSummary)  → Notification bar
```

- OrderHub: ส่งข้อมูลเต็ม (items, options, timestamps) สำหรับ KDS
- NotificationHub: ส่ง summary (ชื่อโต๊ะ + รายการสั้นๆ) สำหรับ bell icon

### 9.9 Frontend SignalR Service

สร้าง `KitchenSignalRService` (`core/services/kitchen-signalr.service.ts`):
- **Auto-connect** เมื่อเข้า KDS route (any of 3 routes)
- **Auto-disconnect** เมื่อออกจาก KDS route
- **Reconnect** with exponential backoff retry
- On `NewOrderItems` → เพิ่ม items ใน local state + เล่นเสียง
- On `ItemStatusChanged` → อัพเดต item status ใน local state
- On `ItemCancelled` → mark item cancelled + show briefly + remove
- On `OrderUpdated` → อัพเดต table name / order number ใน local state
- **On reconnect** → full re-fetch ผ่าน API (ป้องกัน missed events)

---

## 10. Database Changes

### 10.1 เพิ่ม CookingStartedAt ใน TbOrderItem

| Field | Type | Nullable | Default | หมายเหตุ |
|-------|------|----------|---------|----------|
| CookingStartedAt | datetime2 | ใช่ | null | Set เมื่อ status เปลี่ยน SENT → PREPARING |

**นี่คือ database change เดียว** ที่ KDS ต้องการ — ไม่มีตารางใหม่

### 10.2 Timeline ของ Timestamps

```
SentToKitchenAt    CookingStartedAt    ReadyAt         ServedAt
      │                  │                │               │
      ▼                  ▼                ▼               ▼
   [SENT] ──────── [PREPARING] ──── [READY] ──────── [SERVED]
      │    รอคิว        │    กำลังทำ      │    รอเสิร์ฟ    │
      │   (wait time)   │  (cooking time)  │  (ready time)  │
```

| ช่วงเวลา | สูตร | ความหมาย |
|----------|------|----------|
| Wait time | `CookingStartedAt - SentToKitchenAt` | เวลารอคิว (ตั้งแต่ส่งครัวจนเริ่มทำ) |
| Cooking time | `ReadyAt - CookingStartedAt` | เวลาทำอาหาร |
| Ready time | `ServedAt - ReadyAt` | เวลารอเสิร์ฟ |
| Total time | `ServedAt - SentToKitchenAt` | เวลาทั้งหมด |

### 10.3 Migration

ชื่อ Migration: `AddCookingStartedAtToOrderItem`

```sql
-- Up
ALTER TABLE TbOrderItem ADD CookingStartedAt datetime2 NULL;

-- Down
ALTER TABLE TbOrderItem DROP COLUMN CookingStartedAt;
```

> **สำคัญ:** ต้องอัพเดต [REQ-order-system](REQ-order-system.md) Section 3.3 ให้มี CookingStartedAt ด้วย

---

## 11. API Endpoints

### 11.1 KDS Endpoints

KDS ใช้ endpoints จาก `KitchenController` (ดู [REQ-order-system](REQ-order-system.md) Section 12.3)

| Method | Route | Permission | คำอธิบาย |
|--------|-------|-----------|---------|
| GET | `/api/kitchen/orders` | `kitchen-{category}.read` | ดึงรายการที่ต้องทำ (Backend ตรวจ permission ตาม categoryType) |
| PUT | `/api/kitchen/items/prepare` | `kitchen-{category}.update` | เริ่มทำ (batch) — Backend ตรวจ permission ต่อ item |
| PUT | `/api/kitchen/items/ready` | `kitchen-{category}.update` | เสร็จแล้ว (batch) — Backend ตรวจ permission ต่อ item |

> **หมายเหตุ:** `{category}` = `food` / `beverage` / `dessert` — Backend ตรวจ permission จาก `categoryType` ของแต่ละ item
> เช่น PUT items/prepare ด้วย items ที่เป็นอาหาร → ต้องมี `kitchen-food.update`

### 11.2 GET /api/kitchen/orders — Query Parameters

| Parameter | Type | Required | Default | หมายเหตุ |
|-----------|------|----------|---------|----------|
| categoryType | int | ใช่ | — | 1=อาหาร, 2=เครื่องดื่ม, 3=ของหวาน |
| includeReady | bool | ไม่ | false | true = รวม READY items (สำหรับ "รอเสิร์ฟ") |

### 11.3 GET Response Structure

```json
{
  "status": "success",
  "results": [
    {
      "orderId": 42,
      "orderNumber": "ORD-20260318-003",
      "tableId": 5,
      "tableName": "A3",
      "items": [
        {
          "orderItemId": 101,
          "menuId": 15,
          "menuNameThai": "ข้าวผัดกุ้ง",
          "quantity": 2,
          "status": "Sent",
          "categoryType": 1,
          "tags": 0,
          "note": "ไม่ใส่ผัก",
          "sentToKitchenAt": "2026-03-18T14:20:00Z",
          "cookingStartedAt": null,
          "readyAt": null,
          "options": [
            {
              "optionGroupName": "เพิ่มเติม",
              "optionItemName": "ไข่ดาว",
              "additionalPrice": 10.00
            }
          ]
        }
      ]
    }
  ]
}
```

### 11.4 PUT Batch Endpoints — Request Body

```json
// PUT /api/kitchen/items/prepare
// PUT /api/kitchen/items/ready
{
  "orderItemIds": [101, 102, 205]
}
```

- รองรับ items จาก **ต่าง order** (สำหรับ Menu View batch cooking)
- Backend validate: ทุก item ต้อง status ตรง (SENT สำหรับ prepare, PREPARING สำหรับ ready)
- Backend set timestamp + broadcast SignalR `ItemStatusChanged` ต่อ item

### 11.5 อัพเดตจาก REQ-order-system Section 12.3

เดิม REQ-order-system กำหนด per-order endpoints:
```
PUT /api/kitchen/orders/{orderId}/prepare   → ❌ เปลี่ยน
PUT /api/kitchen/orders/{orderId}/ready     → ❌ เปลี่ยน
```

เปลี่ยนเป็น **batch item endpoints:**
```
PUT /api/kitchen/items/prepare              → ✅ ใหม่
PUT /api/kitchen/items/ready                → ✅ ใหม่
```

> **เหตุผล:** Per-item checkbox + Menu View batch ต้องการ endpoints ที่รับ array of orderItemIds

---

## 12. Frontend Components

### 12.1 Routes

```typescript
// kitchen-display-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: 'food', pathMatch: 'full' },
  {
    path: 'food',
    component: KitchenDisplayComponent,
    canActivate: [PermissionGuard],
    data: { categoryType: 1, categoryLabel: 'อาหาร', permissions: ['kitchen-food.read'] }
  },
  {
    path: 'beverage',
    component: KitchenDisplayComponent,
    canActivate: [PermissionGuard],
    data: { categoryType: 2, categoryLabel: 'เครื่องดื่ม', permissions: ['kitchen-beverage.read'] }
  },
  {
    path: 'dessert',
    component: KitchenDisplayComponent,
    canActivate: [PermissionGuard],
    data: { categoryType: 3, categoryLabel: 'ของหวาน', permissions: ['kitchen-dessert.read'] }
  },
];
```

### 12.2 Component Tree

```
features/kitchen-display/
├── kitchen-display.module.ts
├── kitchen-display-routing.module.ts
├── pages/
│   └── kitchen-display/
│       ├── kitchen-display.component.ts        ← Main page (reuse 3 routes)
│       └── kitchen-display.component.html
└── components/
    ├── kitchen-header/
    │   ├── kitchen-header.component.ts         ← Category nav + controls
    │   └── kitchen-header.component.html
    ├── order-view/
    │   ├── order-view.component.ts             ← Order View grid
    │   └── order-view.component.html
    ├── order-card/
    │   ├── order-card.component.ts             ← Single order card
    │   └── order-card.component.html
    ├── menu-view/
    │   ├── menu-view.component.ts              ← Menu View grid
    │   └── menu-view.component.html
    ├── menu-group-card/
    │   ├── menu-group-card.component.ts        ← Single menu group card
    │   └── menu-group-card.component.html
    ├── ready-section/
    │   ├── ready-section.component.ts          ← "รอเสิร์ฟ" collapsible section
    │   └── ready-section.component.html
    └── ready-table-card/
        ├── ready-table-card.component.ts       ← Ready items grouped by table
        └── ready-table-card.component.html
```

### 12.3 Services

| Service | ที่อยู่ | หน้าที่ |
|---------|--------|--------|
| `KitchenSignalRService` | `core/services/kitchen-signalr.service.ts` | OrderHub connection, event handling, reconnect |
| `KitchenStateService` | `core/services/kitchen-state.service.ts` | State management (signals), data transformation |

### 12.4 State Management (Signals)

```typescript
// KitchenStateService
orders = signal<KitchenOrderModel[]>([]);          // active orders (items SENT/PREPARING)
readyItems = signal<KitchenReadyItemModel[]>([]);   // items READY (สำหรับ "รอเสิร์ฟ")
viewMode = signal<'order' | 'menu'>('order');       // current view mode
soundEnabled = signal<boolean>(true);                // sound toggle
isFullscreen = signal<boolean>(false);               // fullscreen toggle
isLoading = signal<boolean>(false);                  // loading state
readySectionExpanded = signal<boolean>(false);        // รอเสิร์ฟ section state
```

> **หมายเหตุ:** Models สำหรับ KDS ใช้ generated models จาก `gen-api` — ไม่สร้าง interface เอง

### 12.5 Layout Routing Update

ต้อง **แก้ `layout-routing.module.ts`** — เปลี่ยน permissions จาก `kitchen-order.read` เป็น array ของ 3 permissions:

```typescript
{
  path: 'kitchen-display',
  data: {
    breadcrumb: 'ครัว',
    permissions: ['kitchen-food.read', 'kitchen-beverage.read', 'kitchen-dessert.read']
  },
  canActivate: [PermissionGuard],  // ผ่านถ้ามีอย่างน้อย 1
  loadChildren: () => import('...').then(m => m.KitchenDisplayModule),
},
```

> **หมายเหตุ:** PermissionGuard ตรวจแบบ OR — มี permission ใดก็ได้จาก array ก็ผ่าน

ต้อง **แก้ sidebar config** (`side-bar.component.ts`) เปลี่ยน:
```typescript
// เดิม
{ label: 'ครัว', icon: 'chef-human', route: '/kitchen-display',
  permissions: ['kitchen-order.read'] }

// ใหม่
{ label: 'ครัว', icon: 'chef-human', route: '/kitchen-display',
  permissions: ['kitchen-food.read', 'kitchen-beverage.read', 'kitchen-dessert.read'] }
```

---

## 13. Permissions

### 13.1 Permissions แยกตามหมวดหมู่

เหมือนกับระบบเมนู (menu-food.*, menu-beverage.*, menu-dessert.*) — KDS แยก permission ตามสถานี:

| Permission | ค่า | คำอธิบาย |
|-----------|-----|---------|
| Kitchen Food Read | `kitchen-food.read` | เข้าหน้า KDS อาหาร |
| Kitchen Food Update | `kitchen-food.update` | เปลี่ยนสถานะ อาหาร (เริ่มทำ, เสร็จแล้ว) |
| Kitchen Beverage Read | `kitchen-beverage.read` | เข้าหน้า KDS เครื่องดื่ม |
| Kitchen Beverage Update | `kitchen-beverage.update` | เปลี่ยนสถานะ เครื่องดื่ม |
| Kitchen Dessert Read | `kitchen-dessert.read` | เข้าหน้า KDS ของหวาน |
| Kitchen Dessert Update | `kitchen-dessert.update` | เปลี่ยนสถานะ ของหวาน |

**รวม 6 permissions** (3 หมวด × 2 actions)

> **ต้องอัพเดต** `Permissions.cs` — เปลี่ยนจาก `KitchenDisplay` class เดิม (`kitchen-order.read/update`) เป็น 3 classes แยก
> **ต้อง seed** permissions ใหม่ใน Migration + ลบของเดิม

### 13.2 Permissions.cs Structure

```csharp
public static class KitchenFood
{
    public const string Read = "kitchen-food.read";
    public const string Update = "kitchen-food.update";
}

public static class KitchenBeverage
{
    public const string Read = "kitchen-beverage.read";
    public const string Update = "kitchen-beverage.update";
}

public static class KitchenDessert
{
    public const string Read = "kitchen-dessert.read";
    public const string Update = "kitchen-dessert.update";
}
```

### 13.3 Permission Check

| จุดตรวจ | Permission | วิธี |
|---------|-----------|------|
| Route `/kitchen-display/food` | `kitchen-food.read` | `PermissionGuard` + route data |
| Route `/kitchen-display/beverage` | `kitchen-beverage.read` | `PermissionGuard` + route data |
| Route `/kitchen-display/dessert` | `kitchen-dessert.read` | `PermissionGuard` + route data |
| Sidebar menu "ครัว" | `kitchen-food.read` OR `kitchen-beverage.read` OR `kitchen-dessert.read` | `hasAnyPermission()` |
| ปุ่ม "เริ่มทำ" / "เสร็จแล้ว" (food) | `kitchen-food.update` | `authService.hasPermission()` |
| ปุ่ม "เริ่มทำ" / "เสร็จแล้ว" (beverage) | `kitchen-beverage.update` | `authService.hasPermission()` |
| ปุ่ม "เริ่มทำ" / "เสร็จแล้ว" (dessert) | `kitchen-dessert.update` | `authService.hasPermission()` |

### 13.4 Sidebar & Category Links Visibility

- Sidebar "ครัว" แสดงเมื่อมี **อย่างน้อย 1** permission จาก 3 หมวด
- Category links ใน KDS Header → **ซ่อนหมวดที่ไม่มี permission**
  - เช่น bar staff มีแค่ `kitchen-beverage.*` → เห็นแค่ link "เครื่องดื่ม"
  - Default route redirect ไปหมวดแรกที่มี permission (ไม่ใช่ food เสมอ)

### 13.5 ตัวอย่างการกำหนดสิทธิ์

| บทบาท | Permissions |
|-------|------------|
| พ่อครัว (Head Chef) | `kitchen-food.read`, `kitchen-food.update` |
| บาร์เทนเดอร์ | `kitchen-beverage.read`, `kitchen-beverage.update` |
| คนทำขนม | `kitchen-dessert.read`, `kitchen-dessert.update` |
| ผู้จัดการ | ทั้ง 6 permissions |
| พนักงานเสิร์ฟ | ไม่มี kitchen permissions (ใช้ Table Detail แทน) |

---

## 14. User Flows

### 14.1 เปิด KDS

```
1. Staff login → sidebar แสดง "ครัว" (ถ้ามี kitchen-food/beverage/dessert.read อย่างน้อย 1)
2. กด "ครัว" → navigate ไปหมวดแรกที่มี permission (เช่น /kitchen-display/food)
3. Component init → connect OrderHub via SignalR
4. API call: GET /api/kitchen/orders?categoryType=1&includeReady=true
5. Orders ปรากฏเป็น cards (FIFO) + "รอเสิร์ฟ" section ด้านล่าง
6. Real-time updates ผ่าน SignalR ตลอดเวลาที่หน้า KDS เปิดอยู่
7. Category links ซ่อนหมวดที่ไม่มี permission (เช่น bar staff เห็นแค่ "เครื่องดื่ม")
```

### 14.2 ออเดอร์ใหม่เข้า

```
1. ลูกค้า/พนักงานกด "ส่งครัว" จากหน้า Order
2. Backend: items PENDING → SENT, set SentToKitchenAt = now
3. Backend publish: OrderHub → NewOrderItems + NotificationHub → NEW_ORDER
4. KDS รับ event → card ใหม่ปรากฏ (Order View) หรือ items เพิ่มใน card (Menu View)
5. เสียง new-order.mp3 เล่น (1 ครั้ง/order)
6. Timer เริ่มนับจาก SentToKitchenAt
```

### 14.3 เริ่มทำอาหาร (Order View)

```
1. Staff เห็น order card โต๊ะ A3 → ข้าวผัดกุ้ง ×2, ส้มตำ ×1, ต้มยำกุ้ง ×1
2. Staff check: ☑ ข้าวผัดกุ้ง ×2, ☑ ส้มตำ ×1 (เลือก 2 จาก 3)
3. กด "เริ่มทำ"
4. API: PUT /api/kitchen/items/prepare { orderItemIds: [101, 102] }
5. Backend: SENT → PREPARING, CookingStartedAt = now
6. SignalR: ItemStatusChanged × 2 items
7. Card อัพเดต: 2 items เป็นสีส้ม + cooking timer, ต้มยำกุ้ง ยังขาว (SENT)
8. Checkboxes reset
```

### 14.4 ทำเสร็จ

```
1. Staff check: ☑ ข้าวผัดกุ้ง ×2, ☑ ส้มตำ ×1 (PREPARING items)
2. กด "เสร็จแล้ว"
3. API: PUT /api/kitchen/items/ready { orderItemIds: [101, 102] }
4. Backend: PREPARING → READY, ReadyAt = now
5. SignalR: ItemStatusChanged × 2 items + NotificationHub ORDER_READY
6. Items ย้ายไป "รอเสิร์ฟ" section
7. Card ยังอยู่ (เพราะ ต้มยำกุ้ง ×1 ยัง SENT)
8. Floor staff ได้ noti: "อาหารพร้อมเสิร์ฟ — โต๊ะ A3"
```

### 14.5 Batch Cooking (Menu View)

```
1. Staff สลับเป็น Menu View
2. เห็น card "ข้าวผัดกุ้ง" — รอทำ 5 จาน จาก 4 โต๊ะ
3. Check ทั้ง 5 items → กด "เริ่มทำ"
4. API: PUT /api/kitchen/items/prepare { orderItemIds: [101, 205, 312, 415, 416] }
5. ทำเสร็จ → check ทั้ง 5 → กด "เสร็จแล้ว"
6. 5 items เป็น READY → ย้ายไป "รอเสิร์ฟ" จัดกลุ่มตามโต๊ะ
```

### 14.6 รายการถูกยกเลิก

```
1. Manager ยกเลิก "ส้มตำ ×1" ของโต๊ะ A3 จาก Table Detail
2. Backend: PREPARING → CANCELLED, set CancelledBy + CancelReason
3. SignalR: ItemCancelled event → KDS ทุกเครื่อง
4. KDS: item แสดง strikethrough + สีแดง + "ยกเลิก" badge
5. เสียง cancelled.mp3 เล่น
6. หลัง 5 วินาที → item ลบออกจาก card
7. ถ้า card ว่าง (ทุก item READY/CANCELLED) → card หายไป
```

### 14.7 รอเสิร์ฟนาน

```
1. ข้าวผัดกุ้ง ×2 ของโต๊ะ B2 เป็น READY มา 6 นาทีแล้ว (ยังไม่ SERVED)
2. "รอเสิร์ฟ" section: card โต๊ะ B2 → border แดง + badge "⚠ รอนาน!"
3. เสียง ready-overdue.mp3 เล่น (ครั้งเดียวเมื่อข้าม 5 นาที)
4. Staff ครัวบอก floor staff (ด้วยเสียง/วิทยุ)
5. Floor staff หยิบอาหาร → เสิร์ฟ → กด "เสิร์ฟแล้ว" ใน Table Detail
6. SignalR: ItemStatusChanged (READY → SERVED) → item หายจาก "รอเสิร์ฟ"
```

---

## 15. Edge Cases & Decisions

| กรณี | การจัดการ |
|------|----------|
| Check items ข้ามออเดอร์ใน Order View | **ไม่ได้** — checkbox scoped ต่อ card (1 card = 1 order) |
| Check items ข้ามออเดอร์ใน Menu View | **ได้** — นี่คือจุดประสงค์ของ Menu View |
| Mixed status ใน card (SENT + PREPARING) | แสดงทั้งสอง, ปุ่ม "เริ่มทำ" + "เสร็จแล้ว" แสดงพร้อมกัน |
| ทุก item ถูกยกเลิกใน card | Card หายไปจาก grid |
| SignalR disconnect | Auto-reconnect → **full re-fetch ผ่าน API** เมื่อ reconnect สำเร็จ |
| Multiple KDS screens (หลายจอ) | ทุกจอรับ events เดียวกัน, อัพเดตพร้อมกัน |
| Tab inactive → timer drift | ใช้ `Date.now() - timestamp` ไม่ใช่ counter → ไม่ drift |
| เมนูเดียวกัน options ต่างกัน (Menu View) | **Card แยก** (group by MenuId + options combination) |
| เมนูเดียวกัน note ต่างกัน (Menu View) | **Card เดียว** (แสดง note per-item แต่ทำเหมือนกัน) |
| New order sound spam (หลาย order พร้อมกัน) | **Debounce 3 วินาที** — เล่นเสียงแค่ครั้งแรก |
| Order มีทั้งอาหาร + เครื่องดื่ม | แสดงเฉพาะ items ที่ตรง categoryType ของ route ปัจจุบัน |
| Staff ไม่มี update permission ของหมวดนั้น | ปุ่ม "เริ่มทำ"/"เสร็จแล้ว" ซ่อน → ดูอย่างเดียว |
| Staff มี permission แค่บางหมวด | Category links ซ่อนหมวดที่ไม่มี permission, redirect ไปหมวดแรกที่มี |
| Batch items ข้ามหมวด (Menu View) | ไม่เกิด — Menu View แสดงเฉพาะ items ตาม route categoryType |
| ย้ายโต๊ะระหว่างทำอาหาร | SignalR `OrderUpdated` → อัพเดตชื่อโต๊ะบน card |

---

## 16. จุดเชื่อมต่อระบบอื่น

| ระบบ | ความสัมพันธ์ |
|------|-------------|
| **[REQ-order-system](REQ-order-system.md)** | เจ้าของ TbOrderItem + TbOrder entities, status flow (Section 4), KDS API endpoints (Section 12.3 — อัพเดต batch endpoints ตาม Section 11 ของเอกสารนี้), Floor staff "mark served" flow (Section 7.4) |
| **[REQ-noti-system](REQ-noti-system.md)** | Dual-hub architecture: OrderHub (KDS real-time) + NotificationHub (noti bar). Events: `NEW_ORDER` → Kitchen group, `ORDER_READY` → Floor group, `ORDER_CANCELLED` → Kitchen group (Section 3.1) |
| **[REQ-table-system](REQ-table-system.md)** | Table name แสดงบน KDS cards. ย้ายโต๊ะ → OrderHub `OrderUpdated` → KDS อัพเดตชื่อโต๊ะ |
| **[REQ-menu-system](REQ-menu-system.md)** | `EMenuCategory` (Food=1, Beverage=2, Dessert=3) ใช้ filter route. `EMenuTag.SlowPreparation` (bitflag 4) แสดง badge เตือนบน KDS |
| **[REQ-payment-system](REQ-payment-system.md)** | ไม่เกี่ยวข้องโดยตรง — Payment ทำงานหลัง Order COMPLETED |

---

## 17. สรุปไฟล์ที่ต้องสร้าง/แก้ไข

### Backend

| ไฟล์ | Action | หมายเหตุ |
|------|--------|----------|
| `POS.Main.Core/Constants/Permissions.cs` | แก้ไข | เปลี่ยน `KitchenDisplay` class → `KitchenFood`, `KitchenBeverage`, `KitchenDessert` (6 permissions) |
| `POS.Main.Dal/Entities/Order/TbOrderItem.cs` | แก้ไข | เพิ่ม `CookingStartedAt datetime2?` |
| `POS.Main.Dal/EntityConfigurations/TbOrderItemConfiguration.cs` | แก้ไข | เพิ่ม column config |
| `RBMS.POS.WebAPI/Hubs/OrderHub.cs` | แก้ไข | Implement event broadcasting |
| `POS.Main.Business.Order/Services/KitchenService.cs` | สร้างใหม่ | KDS business logic (get orders, batch prepare/ready) |
| `POS.Main.Business.Order/Interfaces/IKitchenService.cs` | สร้างใหม่ | Interface |
| `RBMS.POS.WebAPI/Controllers/KitchenController.cs` | สร้างใหม่ | 3 endpoints (GET + 2 PUT) |
| Migration: `AddCookingStartedAtToOrderItem` | สร้างใหม่ | เพิ่ม column |
| Migration: `UpdateKitchenPermissions` | สร้างใหม่ | ลบ `kitchen-order.*` เดิม + seed 6 permissions ใหม่ |

### Frontend

| ไฟล์ | Action | หมายเหตุ |
|------|--------|----------|
| `core/services/kitchen-signalr.service.ts` | สร้างใหม่ | OrderHub client |
| `core/services/kitchen-state.service.ts` | สร้างใหม่ | State management (signals) |
| `layouts/layout-routing.module.ts` | แก้ไข | เปลี่ยน permissions เป็น array 3 หมวด |
| `shared/components/side-bar/side-bar.component.ts` | แก้ไข | เปลี่ยน permissions เป็น array 3 หมวด |
| `features/kitchen-display/kitchen-display-routing.module.ts` | แก้ไข | 3 child routes + redirect + PermissionGuard แยกหมวด |
| `features/kitchen-display/kitchen-display.module.ts` | แก้ไข | Declare components |
| `features/kitchen-display/pages/kitchen-display/*` | แก้ไข | Main page component |
| `features/kitchen-display/components/kitchen-header/*` | สร้างใหม่ | Header bar |
| `features/kitchen-display/components/order-view/*` | สร้างใหม่ | Order View grid |
| `features/kitchen-display/components/order-card/*` | สร้างใหม่ | Order card |
| `features/kitchen-display/components/menu-view/*` | สร้างใหม่ | Menu View grid |
| `features/kitchen-display/components/menu-group-card/*` | สร้างใหม่ | Menu group card |
| `features/kitchen-display/components/ready-section/*` | สร้างใหม่ | รอเสิร์ฟ section |
| `features/kitchen-display/components/ready-table-card/*` | สร้างใหม่ | Ready items per table |
| `public/sounds/overdue.mp3` | สร้างใหม่ | เสียงรอนานเกิน |
| `public/sounds/ready-overdue.mp3` | สร้างใหม่ | เสียงรอเสิร์ฟนาน |
