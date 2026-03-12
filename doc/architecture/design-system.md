# RBMS-POS Design System

> ทิศทาง: **Modern & Professional** — สะอาด, อ่านง่าย, เหมาะทุก role (Cashier / Manager / Admin)
> Font: **Sarabun** — Thai+English, นิยมใช้ใน food app ไทย (Wongnai, LINE MAN, Grab Food TH)
> อัปเดตล่าสุด 2026-03-10

---

## โครงสร้าง Design System

```
tailwind.config.js    ← กำหนด color token + CSS variables ทั้งหมด (แก้ที่นี่ที่เดียว)
src/styles.css        ← base reset (bg-surface, text-surface-dark)
src/index.html        ← โหลด Sarabun font จาก Google Fonts
```

**หลักการ:** ต้องการเปลี่ยนสีทั้งหมด → แก้แค่ block `:root` ใน `tailwind.config.js`

---

## Color Tokens (CSS Variables)

### Primary — Orange

| Token | Class | Hex | ใช้เมื่อ |
|-------|-------|-----|---------|
| `--color-primary` | `bg-primary` / `text-primary` | `#f97316` | button หลัก, table header |
| `--color-primary-dark` | `bg-primary-dark` | `#ea580c` | hover state, gradient end |
| `--color-primary-subtle` | `bg-primary-subtle` | `#fff7ed` | row hover, active nav bg |
| `--color-primary-light` | `border-primary-light` | `#fed7aa` | border อ่อน |
| `--color-primary-badge` | `text-primary-badge` | `#fb923c` | icon fill, badge |
| `--color-primary-text` | `text-primary-text` | `#7c2d12` | text บน bg ส้มอ่อน |

### Surface — Slate

| Token | Class | Hex | ใช้เมื่อ |
|-------|-------|-----|---------|
| `--color-surface` | `bg-surface` | `#f8fafc` | page background |
| `--color-surface-card` | `bg-surface-card` | `#ffffff` | card, table body |
| `--color-surface-border` | `border-surface-border` | `#e2e8f0` | divider, card border |
| `--color-surface-muted` | `bg-surface-muted` | `#cbd5e1` | disabled element |
| `--color-surface-sub` | `text-surface-sub` | `#64748b` | secondary/muted text |
| `--color-surface-dark` | `text-surface-dark` | `#334155` | primary text |
| `--color-surface-sidebar` | `bg-surface-sidebar` | `#1e293b` | sidebar, header dark |

### Status Colors

| Token | Class | Hex | ใช้เมื่อ |
|-------|-------|-----|---------|
| `--color-success` | `text-success` | `#14b8a6` | Active / Available |
| `--color-success-bg` | `bg-success-bg` | `#ccfbf1` | badge bg |
| `--color-success-text` | `text-success-text` | `#0f766e` | badge text |
| `--color-danger` | `text-danger` | `#f43f5e` | Delete / Error / Locked |
| `--color-danger-bg` | `bg-danger-bg` | `#fff1f2` | badge bg |
| `--color-danger-dark` | `hover:bg-danger-dark` | `#be123c` | hover |
| `--color-warning` | `text-warning` | `#fbbf24` | Pending |
| `--color-warning-bg` | `bg-warning-bg` | `#fef3c7` | badge bg |

---

## Typography

```
Font: Sarabun (weights: 300, 400, 500, 600, 700)

Page title (h1)     text-page-title      → 1.75rem  700
Section title (h2)  text-section-title   → 1.125rem 600
Card title (h3)     text-card-title      → 1rem     600
Body text           text-sm text-surface-dark
Label/Caption       text-xs text-surface-sub
Table header        text-sm font-semibold text-white (บน orange gradient)
Table body cell     text-sm text-surface-dark
```

---

## Spacing & Shape

```
Page padding        p-6
Card padding        p-5 (medium), p-4 (small)
Card radius         rounded-xl
Button radius       rounded-lg
Input radius        rounded-lg
Modal radius        rounded-2xl
Badge radius        rounded-full

Shadow
  Card              shadow-sm hover:shadow-md
  Dropdown/Modal    shadow-xl
  Sidebar           shadow-2xl
  Button            shadow-sm
```

---

## Component Patterns

### Page Layout

```html
<div class="p-6 space-y-5">

  <!-- Page Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-page-title text-surface-dark">ชื่อหน้า</h1>
    <button class="flex items-center gap-2 bg-primary hover:bg-primary-dark
                   text-white text-sm font-semibold px-4 py-2.5 rounded-lg
                   shadow-sm transition-colors duration-200">
      เพิ่มรายการ
    </button>
  </div>

  <!-- Filter / Search bar -->
  <div class="bg-surface-card rounded-xl shadow-sm p-5 border border-surface-border">
    ...
  </div>

  <!-- Table Card -->
  <div class="bg-surface-card rounded-xl shadow-sm overflow-hidden border border-surface-border">
    ...
  </div>

</div>
```

### Button Classes

```html
<!-- Primary -->
<button class="flex items-center gap-2 bg-primary hover:bg-primary-dark
               text-white text-sm font-semibold px-4 py-2.5 rounded-lg
               shadow-sm transition-colors duration-200">

<!-- Danger -->
<button class="flex items-center gap-2 bg-danger hover:bg-danger-dark
               text-white text-sm font-semibold px-4 py-2.5 rounded-lg
               shadow-sm transition-colors duration-200">

<!-- Secondary (outline) -->
<button class="flex items-center gap-2 border border-surface-border hover:bg-surface
               text-surface-dark text-sm font-semibold px-4 py-2.5 rounded-lg
               transition-colors duration-200">

<!-- Icon button (circular) -->
<button class="w-9 h-9 flex items-center justify-center rounded-full
               bg-primary-subtle hover:bg-primary-light text-primary
               transition-colors duration-200">
```

### Table Pattern

```html
<table class="w-full text-sm">
  <thead>
    <tr class="bg-gradient-to-r from-primary to-primary-dark text-white">
      <th class="px-4 py-3 text-left font-semibold">คอลัมน์</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-surface-border hover:bg-primary-subtle transition-colors">
      <td class="px-4 py-3 text-surface-dark">ข้อมูล</td>
    </tr>
  </tbody>
</table>
```

### Status Badge Pattern

```html
<!-- Active / Available -->
<span class="px-3 py-1 rounded-full text-xs font-semibold bg-success-bg text-success-text">
  ใช้งาน
</span>

<!-- Inactive -->
<span class="px-3 py-1 rounded-full text-xs font-semibold bg-surface text-surface-sub">
  ปิดใช้งาน
</span>

<!-- Danger / Locked -->
<span class="px-3 py-1 rounded-full text-xs font-semibold bg-danger-bg text-danger">
  ถูกล็อค
</span>

<!-- Warning / Pending -->
<span class="px-3 py-1 rounded-full text-xs font-semibold bg-warning-bg text-warning-dark">
  รอดำเนินการ
</span>
```

### Form Input Pattern

```html
<div class="space-y-1.5">
  <label class="text-sm font-semibold text-surface-dark">ชื่อ</label>
  <input
    type="text"
    class="w-full border border-surface-border rounded-lg px-3 py-2.5 text-sm
           text-surface-dark placeholder:text-surface-muted bg-surface-card
           focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
           transition-colors duration-200"
    placeholder="กรอกชื่อ"
  >
  <!-- Error state: เพิ่ม class border-danger focus:ring-danger -->
</div>
```

---

## Icon System

| วิธี | ใช้เมื่อ | ตัวอย่าง |
|------|----------|----------|
| `<app-generic-icon>` | icon เฉพาะทาง (ออกแบบเอง) | `<app-generic-icon name="dashboard" class="text-primary">` |
| `<i class="pi pi-*">` | icon ทั่วไป (plus, search, chevron) | `<i class="pi pi-plus text-white">` |

- เปลี่ยนสีผ่าน `text-*` class (เช่น `text-danger`, `text-success`, `text-white`)
- SVG ไฟล์อยู่ที่ `public/images/icons/` ใช้ `currentColor` ทุกไฟล์
- ดูคู่มือเต็มที่ [icon-system.md](icon-system.md)

---

## PrimeNG + Tailwind CSS

ใช้ **PrimeNG** สำหรับ UI components ที่ซับซ้อน (Table, Dropdown, Dialog, Toast ฯลฯ) ร่วมกับ **Tailwind CSS** สำหรับ layout และ styling ทั่วไป

| ใช้อะไร | สำหรับ |
|---------|-------|
| **PrimeNG** | Data table, Dropdown, Dialog, Button, Tag, Badge, Toast, InputText, InputNumber, FileUpload, TabView ฯลฯ |
| **Tailwind CSS** | Layout (flex, grid, spacing), typography tokens, color tokens, backgrounds, borders, responsive |
| **Custom Components** | confirm-modal, success-modal (เฉพาะ RBMS-POS UX) |

```html
<!-- ✅ PrimeNG component + Tailwind layout -->
<div class="p-6 space-y-5">
  <h1 class="text-page-title text-surface-dark">รายการสินค้า</h1>
  <div class="bg-surface-card rounded-xl shadow-sm border border-surface-border p-5">
    <p-table [value]="products()" [paginator]="true" [rows]="20">...</p-table>
  </div>
</div>
```

> PrimeNG modules ทั้งหมด import/export ผ่าน `SharedModule` — feature modules ไม่ต้อง import เพิ่มเอง

---

## การเปลี่ยนธีม (ถ้าต้องการในอนาคต)

เปลี่ยนสีทั้งระบบ → แก้แค่ block `:root` ใน `tailwind.config.js`:

```javascript
":root": {
  "--color-primary":      "#ใส่สีใหม่",
  "--color-primary-dark": "#ใส่สีใหม่",
  // ... ทุก component อัปเดตอัตโนมัติ
}
```

---

## Related Docs

- [project-structure.md](project-structure.md) — โครงสร้างไฟล์ Frontend
- [system-overview.md](system-overview.md) — Architecture overview
