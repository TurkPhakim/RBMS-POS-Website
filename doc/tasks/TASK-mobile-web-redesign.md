# TASK: Redesign Mobile Web — เมนู, ตะกร้า, ออเดอร์

> สร้าง: 2026-03-29
> สถานะ: ✅ เสร็จสมบูรณ์

## เป้าหมาย
Redesign หน้า เมนู / ตะกร้า / ออเดอร์ ของ Mobile Web ให้อ้างอิงดีไซน์จาก:
- **หน้าสั่งอาหาร (Staff Order)** → เมนู + ตะกร้า
- **หน้ารายละเอียดออเดอร์ (Order Detail)** → ออเดอร์

ข้อกำหนดพิเศษ: **ตัวเลือกเสริม (Option Groups) ใช้เป็น Page แทน Dialog** เพราะพื้นที่มือถือจำกัด + มี textarea หมายเหตุด้วย

## Base Path
`Frontend-POS/RBMS-POS-Mobile-Web/src/app/`

---

## Phase 1: หน้าเมนู (Menu Browse) — ปรับ UI ให้อ้างอิง Staff

### Sub-tasks
- ✅ 1.1 ปรับ `menu-browse.component.ts` — เพิ่ม categories config (3 สี: cat-food/drink/dessert) พร้อม activeClass, inactiveClass, chipActiveClass, chipInactiveClass
- ✅ 1.2 ปรับ `menu-browse.component.html` — category tabs ใช้ dynamic class binding ตาม category, sub-category chips เปลี่ยนสีตาม category
- ✅ 1.3 ปรับ `menu-card.component.ts` — รับ @Input `cardRingClass` จาก parent
- ✅ 1.4 ปรับ `menu-card.component.html` — card ring สีตาม category (active: แทน hover:), ตรวจ styling ครบเหมือน Staff
- ✅ 1.5 แก้ `menu-browse.component.ts` — onCardClick ถ้ามี options → navigate ไป `/menu/:menuId` แทนเปิด dialog

### Design — Category Tabs (3 สี)
```
┌────────────────────────────────────┐
│ [อาหาร]  [เครื่องดื่ม]  [ของหวาน]  │  ← 3 สี: cat-food/drink/dessert
├────────────────────────────────────┤
│ 🔍 ค้นหาเมนู...                    │
├────────────────────────────────────┤
│ (ทั้งหมด)(ข้าว)(ก๋วยเตี๋ยว)...      │  ← chips สีตาม active category
├────────────────────────────────────┤
│ ┌──────┐  ┌──────┐                 │
│ │ รูป  │  │ รูป  │  ← 2 columns   │
│ │ชื่อ  │  │ชื่อ  │                  │
│ │ราคา  │  │ราคา  │                  │
│ └──────┘  └──────┘                 │
└────────────────────────────────────┘
```

---

## Phase 2: หน้ารายละเอียดเมนู (Menu Detail Page) — สร้างใหม่

### Sub-tasks
- ✅ 2.1 สร้าง `features/menu/pages/menu-detail/menu-detail.component.ts`
- ✅ 2.2 สร้าง `features/menu/pages/menu-detail/menu-detail.component.html`
- ✅ 2.3 เพิ่ม route `{ path: ':menuId', component: MenuDetailComponent }` ใน `menu.module.ts` (routing อยู่ใน module เดียวกัน)
- ✅ 2.4 declare `MenuDetailComponent` ใน `menu.module.ts`
- ✅ 2.5 ลบ `MenuDetailSheetComponent` ออกจาก module + ลบไฟล์ `features/menu/dialogs/menu-detail-sheet/`

### Design — Menu Detail Page Layout
```
┌────────────────────────────────────┐
│ ← ย้อนกลับ             ชื่อเมนู   │  ← sticky header
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │        รูปเมนู (aspect-video)   │ │
│ └────────────────────────────────┘ │
│ ชื่อเมนู (ไทย)          ฿xxx      │
│ ชื่อเมนู (อังกฤษ)                  │
│ คำอธิบาย...                        │
│ [แนะนำ] [ใหม่]                     │
├────────────────────────────────────┤
│ กลุ่มตัวเลือก 1  [จำเป็น]          │
│ ○ ตัวเลือก A                       │
│ ○ ตัวเลือก B              +฿30    │
│ ● ตัวเลือก C              +฿50    │
├────────────────────────────────────┤
│ กลุ่มตัวเลือก 2  (สูงสุด 3)       │
│ ☐ ตัวเลือก X                       │
│ ☑ ตัวเลือก Y              +฿20    │
├────────────────────────────────────┤
│ หมายเหตุ                           │
│ ┌────────────────────────────────┐ │
│ │ เช่น ไม่ใส่ผัก, เผ็ดน้อย       │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤ ← fixed footer
│  [−]  2  [+]                       │
│  [ เพิ่มลงตะกร้า ฿xxx ]           │
└────────────────────────────────────┘
```

### Data Flow
- `ngOnInit()` → อ่าน `menuId` จาก route → `selfOrderGetMenuDetailGet({ menuId })`
- Radio: `maxSelections === 1` → replace selection
- Checkbox: `maxSelections > 1` → toggle selection
- Validation: required groups ต้องเลือกครบ minSelect
- "เพิ่มลงตะกร้า" → `cartService.addItem(...)` → navigate `/menu` + toast
- "ย้อนกลับ" → `router.navigate(['/menu'])`

### API ที่ใช้
- `SelfOrderService.selfOrderGetMenuDetailGet({ menuId })` → `CustomerMenuDetailResponseModel`

---

## Phase 3: หน้าตะกร้า (Cart Page) — ปรับ UI ให้อ้างอิง Staff

### Sub-tasks
- ✅ 3.1 ปรับ `cart-page.component.html` — note toggle + แก้ opacity modifier (hover:bg-danger/10 → hover:bg-danger-bg)
- ✅ 3.2 ปรับ `cart-page.component.ts` — เพิ่ม noteEditIndex toggle + toggleNote()

### Design — Cart Page Layout (อ้างอิง Staff Right Panel)
```
┌────────────────────────────────────┐
│ ╔══════════════════════════════╗   │
│ ║ 🛒  ตะกร้าของคุณ    3 รายการ ║   │  ← gradient header
│ ╚══════════════════════════════╝   │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ ข้าวผัดกุ้ง         📝  🗑    │ │  ← card with border
│ │ ตัวเลือก: ไข่ดาว (+10)        │ │
│ │ หมายเหตุ: เผ็ดน้อย            │ │  ← warning color
│ │ [−] 2 [+]          ฿180      │ │  ← pill spinner + price
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ ผัดกะเพรา           📝  🗑    │ │
│ │ [−] 1 [+]           ฿80      │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ spacer h-36                        │
├────────────────────────────────────┤ ← fixed footer
│ ┌────────────────────────────────┐ │
│ │ รวมทั้งหมด           ฿260     │ │  ← bg-primary-subtle
│ └────────────────────────────────┘ │
│ [ สั่งอาหาร ]                      │  ← primary button full-width
└────────────────────────────────────┘
```

### ปรับเทียบ Staff
- Quantity spinner: pill shape (`border rounded-full`)
- Note toggle: chat-message icon (สีเปลี่ยนเมื่อมี note)
- Card: `border border-surface-border rounded-xl`
- Total: `bg-primary-subtle rounded-xl`

---

## Phase 4: หน้าออเดอร์ (Order Tracking) — ปรับ UI ให้อ้างอิง Staff Order Detail

### Sub-tasks
- ✅ 4.1 ปรับ `order-tracking.component.html` — gradient banner header + card list + empty state ปรับใหม่
- ✅ 4.2 ปรับ `order-tracking.component.ts` — แก้ status classes: Sent→info-bg/info, Preparing→warning-bg/warning-dark, Ready→success-bg/success, Cancelled→danger-bg/danger

### Design — Order Tracking Layout (อ้างอิง Staff Order Detail)
```
┌────────────────────────────────────┐
│ ╔══════════════════════════════╗   │
│ ║ 🍽  ORDER-20260329-001      ║   │  ← gradient banner (primary)
│ ║ โซนชั้น 1 - โต๊ะ5            ║   │
│ ╠══════════════════════════════╣   │
│ ║ 3 รายการ    ยอดรวม ฿480     ║   │  ← stats bar
│ ╚══════════════════════════════╝   │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ ข้าวผัดกุ้ง         x2        │ │  ← card per item
│ │ ฿180            [กำลังทำ]     │ │  ← status badge (warning)
│ │ สั่งโดย: ลูกค้า               │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ ผัดกะเพรา           x1        │ │
│ │ ฿80             [เสร็จแล้ว]   │ │  ← status badge (success)
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Status Badge Colors (อ้างอิง Staff — ใช้ design tokens)
| Status | Background | Text |
|--------|-----------|------|
| Sent (รอทำ) | `bg-info-bg` | `text-info` |
| Preparing (กำลังทำ) | `bg-warning-bg` | `text-warning-dark` |
| Ready (เสร็จแล้ว) | `bg-success-bg` | `text-success` |
| Served (เสิร์ฟแล้ว) | `bg-surface` | `text-surface-muted` |
| Cancelled (ยกเลิก) | `bg-danger-bg` | `text-danger line-through` |

---

## สรุปไฟล์

### ไฟล์ใหม่
| ไฟล์ | รายละเอียด |
|------|-----------|
| `features/menu/pages/menu-detail/menu-detail.component.ts` | หน้าเลือก options (แทน dialog) |
| `features/menu/pages/menu-detail/menu-detail.component.html` | Template |

### ไฟล์แก้ไข
| ไฟล์ | รายละเอียด |
|------|-----------|
| `features/menu/pages/menu-browse/menu-browse.component.html` | category tabs สี, chips สี |
| `features/menu/pages/menu-browse/menu-browse.component.ts` | categories config 3 สี, click → navigate |
| `features/menu/components/menu-card/menu-card.component.html` | card ring สี, styling ตรง Staff |
| `features/menu/components/menu-card/menu-card.component.ts` | @Input cardRingClass |
| `features/menu/menu-routing.module.ts` | เพิ่ม route `:menuId` |
| `features/menu/menu.module.ts` | declare MenuDetail, ลบ MenuDetailSheet |
| `features/cart/pages/cart-page/cart-page.component.html` | layout ตาม Staff |
| `features/cart/pages/cart-page/cart-page.component.ts` | noteEditIndex toggle |
| `features/orders/pages/order-tracking/order-tracking.component.html` | header + card list |
| `features/orders/pages/order-tracking/order-tracking.component.ts` | แก้ status classes |

### ไฟล์ลบ
| ไฟล์ | รายละเอียด |
|------|-----------|
| `features/menu/dialogs/menu-detail-sheet/menu-detail-sheet.component.ts` | แทนด้วย page |
| `features/menu/dialogs/menu-detail-sheet/menu-detail-sheet.component.html` | แทนด้วย page |
