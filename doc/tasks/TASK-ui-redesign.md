# TASK: UI Redesign — RBMS-POS Frontend

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-04
**วันที่เสร็จ**: -

> ทิศทาง: **Modern & Professional** | Font: Sarabun | Theme: Orange + Slate
> อ้างอิง: [design-system.md](../architecture/design-system.md)

---

## กฎที่ต้องยึดถือตลอดการ redesign

### 1. ห้าม inline SVG path ใน HTML
```html
<!-- ❌ ห้ามทำ -->
<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4..."/></svg>

<!-- ✅ ทำแบบนี้เสมอ -->
<img src="images/icons/pen-edit.svg" class="w-5 h-5" alt="">
```

### 2. ไอคอนทุกตัวต้องอยู่ใน `public/images/icons/`
- ไฟล์ `.svg` ทุกตัวต้องอยู่ในโฟลเดอร์นี้เท่านั้น
- ห้าม `class="invert"` — SVG ควรออกแบบให้ใช้ได้เลย หรือใช้ CSS filter ที่ถูกต้อง

### 3. ถ้าไม่รู้ว่าจะใช้ไอคอนอะไร → ใช้ `admin-setting.svg` ชั่วคราว
AI จะระบุไว้ในโค้ดว่า:
```html
<!-- TODO: replace with [ชื่อไอคอนที่ควรใช้].svg -->
<img src="images/icons/admin-setting.svg" class="w-5 h-5" alt="">
```

### 4. วิธีเปลี่ยนไอคอน (เมื่อผู้ใช้เตรียมไฟล์พร้อมแล้ว)
1. วางไฟล์ `.svg` ใหม่ใน `public/images/icons/`
2. หา `TODO: replace with [ชื่อ].svg` ใน component นั้น
3. เปลี่ยน `src="images/icons/admin-setting.svg"` → `src="images/icons/[ชื่อจริง].svg"`
4. ลบ comment `TODO:` ออก

### 5. ใช้ CSS token จาก design system เสมอ
```html
<!-- ❌ ห้ามใช้ class สี raw -->
<div class="bg-orange-500 text-slate-700 border-gray-200">

<!-- ✅ ใช้ token เสมอ -->
<div class="bg-primary text-surface-dark border-surface-border">
```

### 6. ห้ามเขียนไฟล์ `.css` เว้นแต่จำเป็นจริงๆ
- **Style ทุกอย่างเขียนเป็น Tailwind class ใน HTML template** (`class="..."`)
- ถ้าหลีกเลี่ยงไม่ได้จริงๆ (เช่น animation ที่ซับซ้อน, scrollbar custom) ให้เขียนใน `styles.css` เท่านั้น — **ห้ามสร้างไฟล์ `.css` ใหม่**
- ก่อนเขียน `.css` ต้องบอกผู้ใช้ก่อนว่าทำไมถึงหลีกเลี่ยงไม่ได้

---

## Icons — สิ่งที่มีแล้ว vs ต้องเพิ่ม

### ✅ มีแล้ว (ใช้ได้เลย)

| ไฟล์ | ใช้ที่ไหน |
|------|----------|
| `dashboard.svg` | Sidebar: Dashboard |
| `menu-restaurant.svg` | Sidebar: Menu |
| `orders.svg` | Sidebar: Order |
| `table.svg` | Sidebar: Table |
| `cashier.svg` | Sidebar: Cashier/Sales |
| `kitchen.svg` | Sidebar: Kitchen Display |
| `human-resource.svg` | Sidebar: HR |
| `admin-setting.svg` | Sidebar: Admin Setting |
| `web-setting.svg` | Sidebar: (ไม่ได้ใช้ในตอนนี้) |
| `profile.svg` | Header: profile dropdown |
| `logout.svg` | Header: ปุ่ม logout |
| `notification-bell.svg` | Header: notification |
| `pen-edit.svg` | Actions: Edit button ทุกหน้า |
| `trash.svg` | Actions: Delete button ทุกหน้า |
| `empty-box.svg` | Empty state ทุกหน้า |
| `human.svg` | HR: avatar placeholder |
| `image-preview.svg` | Menu: image placeholder |
| `knife-fork.svg` | Sidebar footer logo / Welcome page |
| `arrow.svg` | Navigation: back button, breadcrumb |
| `coin.svg` | Service Charge / Payment |
| `login.svg` | Login page |
| `food.svg` | Menu: Food category icon |
| `champagne.svg` | Menu: Beverage category icon |

### ⚠️ ยังไม่มี — ต้องเพิ่ม (ผู้ใช้เตรียมเอง)

| ต้องการไฟล์ | ใช้ที่ไหน | ชั่วคราวใช้ |
|------------|---------|------------|
| `plus.svg` | ปุ่ม "เพิ่ม" ทุกหน้า | `admin-setting.svg` |
| `search.svg` | Search input ทุกหน้า | `admin-setting.svg` |
| `eye.svg` | Login: แสดงรหัสผ่าน | `admin-setting.svg` |
| `eye-off.svg` | Login: ซ่อนรหัสผ่าน | `admin-setting.svg` |
| `close.svg` | Modal close / error dismiss | `admin-setting.svg` |
| `check.svg` | Success state / confirm | `admin-setting.svg` |
| `hamburger.svg` | Sidebar toggle (header) | `admin-setting.svg` |
| `user.svg` | Login: username field icon | `admin-setting.svg` |
| `lock.svg` | Login: password field icon | `admin-setting.svg` |
| `filter.svg` | Filter bar (optional) | `admin-setting.svg` |

---

## แผนการ Redesign (ทีละ Feature)

> ทำตามลำดับ — Global Layout ก่อน เพราะกระทบทุกหน้า

---

### Phase 1 — Global Layout (ทำก่อนทุกอย่าง)

กระทบ: ทุกหน้าในระบบ | ความซับซ้อน: ปานกลาง

#### 1.1 Sidebar (`side-bar.component.html`)

**ปัญหาปัจจุบัน:**
- ใช้ `bg-gradient-to-br from-orange-300 via-orange-200 to-amber-300` — ไม่ตรง design system
- `class="invert"` บน notification-bell (ผิด pattern)

**เป้าหมาย:**
- Background: `bg-surface-sidebar` (dark slate `#1e293b`)
- Logo/brand area: แสดง `knife-fork.svg` + ชื่อ RBMS-POS สีขาว
- Nav items: icon สีขาว 60% opacity, active = `bg-primary-subtle` + icon สีส้ม
- Active indicator: เส้นแถบส้มซ้ายมือ (`border-l-4 border-primary`)
- Footer: ชื่อระบบสีขาวจาง

**Icons:** ใช้ SVG ที่มีอยู่ทั้งหมด ไม่ต้องเพิ่ม

**Class เก่า → ใหม่:**
```
bg-gradient-to-br from-orange-300 ... → bg-surface-sidebar
text-gray-700                         → text-white/60 (inactive) / text-white (active)
bg-orange-400/40                      → bg-white/10 border-l-4 border-primary
```

---

#### 1.2 Header (`header.component.html`)

**ปัญหาปัจจุบัน:**
- `bg-gradient-to-r from-orange-400 to-amber-400` — ควรเป็น gradient ที่ใช้ token
- `class="invert"` บน notification-bell — ต้องลบออก
- Inline SVG: hamburger icon (3 เส้น), dropdown chevron, close X

**เป้าหมาย:**
- Background: `bg-gradient-to-r from-primary to-primary-dark`
- Hamburger toggle: เปลี่ยนเป็น `hamburger.svg` (TODO หากยังไม่มี)
- Notification bell: `notification-bell.svg` (ไม่ใช้ invert — ต้องให้ SVG เป็นสีขาวเอง หรือ filter)
- Profile dropdown: `profile.svg` + ชื่อ + `arrow.svg` rotated
- Logout: `logout.svg`
- ลบ inline SVG ทั้งหมดออก

**Icons ที่ต้องเพิ่ม:** `hamburger.svg`, `close.svg`

---

#### 1.3 Main Layout (`main-layout.component.html`)

**ปัญหาปัจจุบัน:**
- `bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50` — ไม่ใช้ token

**เป้าหมาย:**
- Background: `bg-surface` (เรียบง่าย ไม่มี gradient)

---

#### 1.4 Breadcrumb (`top-breadcrumb.component.html`)

**ปัญหาปัจจุบัน:**
- `bg-gray-200` — ไม่ใช้ token
- `text-orange-500` — ไม่ใช้ token

**เป้าหมาย:**
- Background: `bg-surface-card border-b border-surface-border`
- Active crumb: `text-primary`
- Separator: `arrow.svg` ขนาดเล็ก หรือ `/` text

---

### Phase 2 — Login Page (`auths/pages/login/`)

ความซับซ้อน: สูง (มี inline SVG เยอะมาก)

**ปัญหาปัจจุบัน:**
- Inline SVG: user icon, lock icon, eye/eye-off, error icon, close, arrow, spinner, check
- `bg-orange-gradient` (custom class ที่ถูกลบจาก config แล้ว)
- `from-primary-500 to-primary-600` — ต้องเปลี่ยนเป็น `from-primary to-primary-dark`

**เป้าหมาย (redesign ทั้งหมด):**
- Background: `bg-surface` หรือ subtle warm gradient
- Login card: กลางหน้า, `bg-surface-card rounded-2xl shadow-xl`
- Header card: logo `knife-fork.svg` + ชื่อระบบ
- Field icons: `user.svg` (username), `lock.svg` (password)
- Eye toggle: `eye.svg` / `eye-off.svg`
- Submit button: `bg-primary hover:bg-primary-dark`
- Error banner: `bg-danger-bg border-l-4 border-danger text-danger`

**Icons ที่ต้องเพิ่ม:** `user.svg`, `lock.svg`, `eye.svg`, `eye-off.svg`, `close.svg`, `check.svg`

---

### Phase 3 — Welcome Page (`shared/pages/welcome/`)

ความซับซ้อน: ต่ำ

**ปัญหาปัจจุบัน:**
- Gradient text `bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600`
- Role badge `bg-gradient-to-r from-orange-300 to-amber-300`
- หลาย gradient ไม่ตรง token

**เป้าหมาย:**
- Welcome card: `bg-surface-card rounded-2xl shadow-sm`
- Title: `text-surface-dark` + accent `text-primary`
- Role badge: `bg-primary-subtle text-primary-text rounded-full`
- Time display: `bg-surface border border-surface-border rounded-xl`
- Shortcut cards: แต่ละ module เป็น card สี้ขาว hover `bg-primary-subtle`

---

### Phase 4 — Service Charge (Admin)

2 หน้า: List + Manage | ความซับซ้อน: ต่ำ (เริ่มจากอันนี้ก่อนถ้าต้องการ practice)

#### 4.1 Service Charge List

**ปัญหาปัจจุบัน:**
- `text-orange-500` (heading) — ใช้ token
- `bg-orange-400 hover:bg-orange-600` (buttons) — ใช้ token
- Inline SVG: add icon, delete icon, edit icon

**เป้าหมาย:**
```
Page header:
  ชื่อหน้า: text-page-title text-surface-dark
  ปุ่มเพิ่ม: bg-primary hover:bg-primary-dark
             icon: plus.svg (TODO ถ้ายังไม่มี → admin-setting.svg)

Table:
  Header: from-primary to-primary-dark
  Row hover: hover:bg-primary-subtle
  Edit btn: bg-primary-subtle hover:bg-primary-light icon: pen-edit.svg
  Delete btn: bg-danger-bg hover:bg-danger-bg text-danger icon: trash.svg
  Empty state: empty-box.svg + text-surface-sub

Status badge:
  Active:   bg-success-bg text-success-text
  Inactive: bg-surface text-surface-sub
```

#### 4.2 Service Charge Manage

**ปัญหาปัจจุบัน:**
- Card headers ใช้ gradient สีต่างกัน (orange, green, red)
- Inline SVG: info icon, percentage, settings, error, save/spinner

**เป้าหมาย:**
- Section headers ทุกอัน: `bg-gradient-to-r from-primary to-primary-dark text-white`
- Form fields: ตาม pattern ใน design-system.md
- Submit: `bg-primary hover:bg-primary-dark`
- Status toggle: ใช้ styled checkbox สีส้ม (ไม่ใช้สีแดงตามเดิม)
- Icons ใน section header: ใช้ `coin.svg` (Service Charge), `admin-setting.svg` (Status)

---

### Phase 5 — Menu

2 หน้า: List + Manage | ความซับซ้อน: ปานกลาง

#### 5.1 Menu List

**ปัญหาปัจจุบัน:**
- สีส้มแบบ raw (`text-orange-500`, `bg-orange-400`)
- Filter buttons ใช้ orange/blue/purple — ไม่สม่ำเสมอ
- Inline SVG: list icon, food/beverage icons

**เป้าหมาย:**
```
Category filter buttons:
  All:       active = bg-primary text-white
  อาหาร:     icon = food.svg
  เครื่องดื่ม: icon = champagne.svg
  (style active: bg-primary, inactive: bg-surface border-surface-border)

Table:
  Image column: rounded-lg overflow-hidden, placeholder: image-preview.svg
  Category badge: food = bg-primary-subtle text-primary-text
                  beverage = bg-success-bg text-success-text
```

#### 5.2 Menu Manage

**ปัญหาปัจจุบัน:**
- Section headers ใช้หลายสี (orange, blue, green, red) — ทำให้ดูรกมาก
- Image upload area: dashed hover
- Inline SVG: upload, edit, delete, checkmark

**เป้าหมาย:**
- Section headers ทุกอัน: `bg-gradient-to-r from-primary to-primary-dark` เหมือนกันหมด
- Sections แยกด้วย icons:
  - ข้อมูลพื้นฐาน: `menu-restaurant.svg`
  - รูปภาพ: `image-preview.svg`
  - ราคา: `coin.svg`
  - สถานะ: `admin-setting.svg`
- Image upload: dashed border `border-surface-border` hover `border-primary`

---

### Phase 6 — Human Resource

2 หน้า: List + Manage | ความซับซ้อน: สูงที่สุด

#### 6.1 Employee List

**ปัญหาปัจจุบัน:**
- ใช้ blue ทั้งหมด (`text-blue-500`, `bg-blue-500`) — ต่างจาก module อื่น
- Filter status buttons: blue/green/yellow/red/gray — ต้องเปลี่ยนเป็น token

**เป้าหมาย:**
```
เปลี่ยน blue ทั้งหมด → orange (primary) ให้สม่ำเสมอกับทั้งระบบ

Filter status:
  ทั้งหมด:    bg-surface text-surface-dark (inactive) / bg-primary text-white (active)
  Active:     bg-success-bg text-success-text
  Inactive:   bg-surface text-surface-sub
  Locked:     bg-danger-bg text-danger

Employee avatar: human.svg (ใช้อยู่แล้ว — ✅)
```

#### 6.2 Employee Manage

**ปัญหาปัจจุบัน:**
- Section headers ใช้สีต่างกัน 6 สี (blue, teal, purple, green, red)
- Inline SVG จำนวนมาก
- Focus rings ใช้ multiple colors

**เป้าหมาย:**
- Section headers: `from-primary to-primary-dark` ทุกอัน (สม่ำเสมอ)
- Section icons: ใช้ SVG ที่เหมาะสมต่ออัน:
  - ข้อมูลส่วนตัว: `human-resource.svg`
  - ติดต่อ: `profile.svg`
  - ข้อมูลการจ้างงาน: `admin-setting.svg`
  - ธนาคาร: `coin.svg`
  - รูปภาพ: `image-preview.svg`
  - สถานะ: `admin-setting.svg`
- Focus rings: `focus:ring-primary` ทุกอัน
- Upload photo: ใช้ `image-preview.svg` ตาม pattern เดียวกับ Menu

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1.3  Main Layout        ← เร็วสุด (1 บรรทัด)
2. Phase 1.4  Breadcrumb         ← ง่าย
3. Phase 1.1  Sidebar            ← กระทบทุกหน้า ทำก่อนดูว่าสีตัด
4. Phase 1.2  Header             ← ต้องเพิ่มไอคอนใหม่
5. Phase 4    Service Charge     ← เรียบง่าย เหมาะ practice pattern
6. Phase 5    Menu               ← สำคัญสำหรับร้านอาหาร
7. Phase 2    Login              ← ต้องเพิ่มไอคอนหลายตัว ทำทีหลัง
8. Phase 3    Welcome            ← cosmetic เท่านั้น
9. Phase 6    HR                 ← ซับซ้อนที่สุด ทำสุดท้าย
```

---

## ขั้นตอนเพิ่มไอคอนใหม่ (สำหรับผู้ใช้)

เมื่อต้องการเพิ่มไอคอนที่ยังขาดอยู่:

1. เตรียมไฟล์ `.svg` ที่ต้องการ (ดาวน์โหลดจาก heroicons.com, lucide.dev, etc.)
2. วางไฟล์ใน `Frontend-POS/RBMS-POS-Client/public/images/icons/`
3. ตั้งชื่อให้ตรงกับ TODO comment ในโค้ด
4. แจ้ง AI ว่า "เพิ่ม [ชื่อไฟล์].svg แล้ว ให้อัปเดต [feature] ให้ใช้ไอคอนจริง"

**แหล่งไอคอนที่แนะนำ (SVG ฟรี):**
- [heroicons.com](https://heroicons.com) — clean, minimal (แนะนำ)
- [lucide.dev](https://lucide.dev) — ครบมาก
- [tabler-icons.io](https://tabler-icons.io) — ครบมาก

---

## Related Docs

- [design-system.md](../architecture/design-system.md) — Color tokens + component patterns
- [project-status.md](../features/project-status.md) — สถานะ features ปัจจุบัน
