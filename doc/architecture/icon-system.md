# ระบบจัดการ Icon

> อัปเดตล่าสุด: 2026-03-16

---

## ภาพรวม

โปรเจคใช้ **2 วิธี** ในการแสดง icon:

| วิธี | Component/Class | ใช้เมื่อ |
|------|----------------|----------|
| `<app-generic-icon>` | Custom SVG component | icon ที่ออกแบบเอง (ร้านอาหาร, ครัว, modal ฯลฯ) |
| `<i class="pi pi-*">` | PrimeNG Icons | icon ทั่วไป (plus, search, chevron, close) |

---

## 1. `<app-generic-icon>` — Custom SVG Icon

### วิธีทำงาน

Component จะ **fetch ไฟล์ SVG** จาก `icons/{name}.svg` แบบ lazy-load แล้ว cache ไว้ใน static Map (ไม่โหลดซ้ำ)
SVG ถูก inject เข้า DOM ตรงๆ ทำให้รองรับ `currentColor` → เปลี่ยนสีผ่าน Tailwind `text-*` class ได้

### ที่อยู่ไฟล์

```
shared/components/generic-icon/
└── generic-icon.component.ts     ← Component (standalone: false, declare ใน SharedModule)

public/icons/                      ← SVG ไฟล์ทั้งหมด (34+ ไฟล์)
```

### การใช้งาน

```html
<!-- พื้นฐาน (ขนาด default w-5 h-5) -->
<app-generic-icon name="dashboard"></app-generic-icon>

<!-- กำหนดขนาด -->
<app-generic-icon name="trash" svgClass="w-8 h-8"></app-generic-icon>

<!-- กำหนดสี ผ่าน Tailwind text-* -->
<app-generic-icon name="check" svgClass="w-8 h-8" class="text-success"></app-generic-icon>
<app-generic-icon name="error" svgClass="w-8 h-8" class="text-danger"></app-generic-icon>
<app-generic-icon name="warning" svgClass="w-8 h-8" class="text-warning"></app-generic-icon>
<app-generic-icon name="hamburger" svgClass="w-6 h-6" class="text-white"></app-generic-icon>

<!-- Dynamic name (binding) -->
<app-generic-icon [name]="item.icon" svgClass="w-7 h-7"></app-generic-icon>
```

### @Input Properties

| Input | Type | Default | คำอธิบาย |
|-------|------|---------|----------|
| `name` | `string` | `''` | ชื่อไฟล์ SVG (ไม่ต้องใส่ `.svg` และ path) |
| `svgClass` | `string` | `'w-5 h-5'` | Tailwind class สำหรับ `<svg>` element (ขนาด) |

### การเพิ่ม icon ใหม่

1. วางไฟล์ `.svg` ใน `public/icons/`
2. ตั้งชื่อเป็น **kebab-case** (เช่น `my-new-icon.svg`)
3. **SVG ต้องใช้ `currentColor`** — ห้าม hardcode สี
4. ใช้ได้เลย — ไม่ต้อง import หรือ register เพิ่ม

```html
<app-generic-icon name="my-new-icon"></app-generic-icon>
```

### กฎ SVG ไฟล์

- **บังคับ**: ใช้ `fill="currentColor"` หรือ `stroke="currentColor"` — ห้าม `fill="#000000"`
- **บังคับ**: มี `viewBox` attribute เสมอ
- **ห้าม**: hardcode `width`/`height` ที่ไม่จำเป็น (component จะ strip ออกเอง)

---

## 2. PrimeNG Icons (`pi pi-*`)

ใช้สำหรับ **icon ทั่วไป** ที่ PrimeNG มีให้:

```html
<i class="pi pi-plus"></i>
<i class="pi pi-search text-surface-sub"></i>
<i class="pi pi-chevron-left text-primary"></i>
<i class="pi pi-times"></i>
```

### เมื่อไหร่ใช้ PrimeNG vs Custom SVG

| ใช้ PrimeNG (`pi pi-*`) | ใช้ Custom SVG (`app-generic-icon`) |
|--------------------------|--------------------------------------|
| ลูกศร navigation (chevron) | icon เฉพาะทาง (dashboard, kitchen, orders) |
| ปุ่ม +, -, search, close | icon ที่ออกแบบเองตาม RBMS design |
| icon ใน PrimeNG component | icon ใน modal (check, error, warning, trash) |
| icon เล็กๆ ใน UI control | icon หลักของหน้า/feature |

---

## กฎบังคับ

- **ห้ามใช้ `<img>` สำหรับ icon** — ใช้ `<app-generic-icon>` หรือ `pi pi-*` เท่านั้น
- **ห้ามใช้ CSS filter เปลี่ยนสี icon** — ใช้ `text-*` class แทน
- **ห้ามใช้ inline SVG path** — ใช้ไฟล์ SVG แยก
- **ห้ามใช้ Emoji** — ใช้ icon file แทน
- **Logo ยังใช้ `<img>` ได้** — เฉพาะรูปภาพจริง (PNG, JPG)

---

## รายชื่อ Icon ที่มี

| ชื่อ | ใช้ที่ |
|------|--------|
| `admin-setting` | Sidebar — Admin Setting |
| `arrow` | Admin Setting — navigation |
| `bell` | Header — notification icon |
| `cashier` | Sidebar — Payment |
| `champagne` | (สำรอง — ยังไม่ใช้) |
| `check` | Success Modal |
| `chevron-down` | Header — dropdown |
| `close` | (สำรอง — ยังไม่ใช้) |
| `coin` | Admin Setting — Service Charge |
| `dashboard` | Sidebar — Dashboard |
| `empty-box` | Empty state ทุกหน้า |
| `error` | Error/Cancel Modal |
| `eye` / `eye-off` | Login — toggle password |
| `food` | Menu List — placeholder รูปเมนู |
| `hamburger` | Header — toggle sidebar |
| `home` | (สำรอง — ยังไม่ใช้) |
| `human` | Employee — empty state |
| `human-resource` | Sidebar — HR |
| `image-preview` | Menu Manage, Shop Settings — image upload placeholder |
| `kitchen` | Sidebar — Kitchen Display |
| `knife-fork` | Sidebar — collapsed logo |
| `lock` | Login — password field |
| `login` | Login — submit button, Header — login option |
| `logout` | Header — logout |
| `menu-restaurant` | Sidebar — Menu |
| `notification-bell` | (สำรอง — ใช้ `bell` แทน) |
| `orders` | Sidebar — Order |
| `pen-edit` | Table action — แก้ไข (position-list, menu-list, employee, image-upload-card) |
| `profile` | Header — profile menu |
| `table` | Sidebar — Table |
| `trash` | Confirm Modal — delete |
| `user` | Login — username field |
| `warning` | Confirm Modal — warning |
| `web-setting` | Admin Setting — header |

---

## Related Docs

- [design-system.md](design-system.md) — Color tokens, typography
- [CLAUDE.md](../../CLAUDE.md) — กฎ frontend styling
