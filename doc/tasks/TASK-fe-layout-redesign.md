# TASK: Frontend Layout & Shared Components Redesign

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-11
**วันที่เสร็จ**: 2026-03-11

> ปรับ Layout หลัก (main-layout, header, sidebar, breadcrumb, welcome) ให้ตรงมาตรฐาน FE + Design System + PrimeNG
> อ้างอิง: [design-system.md](../architecture/design-system.md) | [frontend-guidelines.md](../development/frontend-guidelines.md) | [frontend-coding-standards.md](../development/frontend-coding-standards.md) | [TASK-ui-redesign.md](TASK-ui-redesign.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

### 1. Pattern มาตรฐาน FE ที่ต้องแก้ทุก component

| กฎ | ปัจจุบัน (ผิด) | ต้องเปลี่ยนเป็น |
|----|---------------|-----------------|
| Constructor injection | `inject()` function | `constructor(private readonly x: X)` |
| ห้าม OnPush | `changeDetection: OnPush` | ลบออก (ใช้ Signals แทน) |
| Modern control flow | `*ngIf`, `*ngFor` | `@if`, `@for` |
| Design tokens | raw colors (`bg-gray-200`, `text-orange-500`) | tokens (`bg-surface`, `text-primary`) |
| ห้าม inline SVG | `<svg><path d="..."/></svg>` | `<img src="icons/xxx.svg">` |
| ห้าม `any` type | `currentUser: any` | ใช้ generated model หรือ specific type |
| ห้าม CSS file ที่ไม่จำเป็น | `.component.css` ที่มีแค่ `:host` | ลบ `styleUrls` + ลบไฟล์ CSS |
| ห้าม `console.log` | `console.log(...)` | ลบออก |
| PrimeNG เป็นมาตรฐาน | custom dropdown/menu | ใช้ PrimeNG components |

### 2. ห้าม inline SVG path ใน HTML
```html
<!-- ❌ ห้ามทำ -->
<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>

<!-- ✅ ทำแบบนี้เสมอ -->
<img src="icons/hamburger.svg" class="w-7 h-7" alt="">
```

### 3. ใช้ CSS token เสมอ
```html
<!-- ❌ ห้ามใช้สี raw -->
<div class="bg-orange-400 text-gray-700 border-gray-200">

<!-- ✅ ใช้ token -->
<div class="bg-primary text-surface-dark border-surface-border">
```

### 4. ห้าม Responsive ถ้าไม่ได้บอก
- **ออกแบบสำหรับ Desktop เท่านั้น** — ห้ามเพิ่ม responsive classes (`md:`, `lg:`, `sm:`, `hidden md:flex` ฯลฯ) ถ้าไม่ได้ระบุว่าต้องรองรับอุปกรณ์อื่น
- ถ้าต้องการ responsive ภายหลัง จะแจ้งเป็นรายหน้าไป
- **เป้าหมาย**: ลด class ที่ไม่จำเป็น ให้โค้ดสะอาด

---

## สรุปการเปลี่ยนแปลง

### Phase 0 — ติดตั้ง PrimeNG + Config ✅

- ติดตั้ง `primeng@19.2.0-lts`, `primeicons`, `@primeng/themes`
- เพิ่ม `primeicons.css` ใน `angular.json`
- เพิ่ม `BrowserAnimationsModule` + `providePrimeNG({ theme: { preset: Lara } })` ใน `app.module.ts`
- เพิ่ม PrimeNG modules 20+ ตัวใน `shared.module.ts`

### Phase 1 — Main Layout ✅

- ลบ `ChangeDetectionStrategy.OnPush` + `styleUrls`
- `bg-gray-50` → `bg-surface`, ลบ gradient, ลบ responsive classes, ลบ commented mobile overlay
- ลบ `main-layout.component.css`

### Phase 2 — Breadcrumb ✅

- `inject()` → constructor injection
- `ChangeDetectorRef` → `signal<BreadcrumbItem[]>([])` + `DestroyRef` + `takeUntilDestroyed`
- `*ngFor/*ngIf` → `@for/@if` + design tokens (`bg-surface-card`, `text-surface-sub`, `hover:text-primary`)
- ลบ `top-breadcrumb.component.css`

### Phase 3 — Sidebar ✅

- `inject()` → constructor injection, ลบ `console.log` + unnecessary subscription
- `isCollapsed$ | async` → `toSignal()` signal ใน constructor (แก้ TS2729)
- Dark theme: `bg-surface-sidebar text-white`, `hover:bg-white/5`, active = `bg-white/10 border-l-4 border-primary`
- Icons: `brightness-0 invert` สำหรับ dark bg
- ลบ decorative gradient overlays, `*ngFor/*ngIf` → `@for/@if`
- ลบ `side-bar.component.css`

### Phase 4 — Header ✅

- `inject()` → constructor injection, `currentUser: any` → typed interface
- `showProfileMenu`, `isLoggedIn` → signals
- ลบ inline SVG ทั้งหมด → `<img>` icons (สร้าง `hamburger.svg`, `chevron-down.svg` ใหม่)
- ลบ notification panel (ยังไม่มี feature จริง → ลดความซับซ้อน)
- `from-orange-400 to-amber-400` → `from-primary to-primary-dark`
- Profile dropdown: design tokens (`bg-surface-card`, `text-danger`, `bg-danger-bg`)
- ย้าย `.logout-icon-red` → `.icon-danger` ใน `styles.css` (global)
- ลบ `header.component.css`

### Phase 5 — Welcome ✅

- ลบ `ChangeDetectorRef` → `currentTime = signal(new Date())`
- `getGreeting()` → `greeting = computed(...)`
- `currentUser: any` → typed interface
- ลดขนาด: logo `h-60→h-32`, time `text-7xl→text-4xl`
- ลบ `min-h-screen`, gradient text, raw colors ทั้งหมด → design tokens
- Role badge: `bg-primary-subtle text-primary-text`
- Time: `text-primary font-mono`
- ลบ `welcome.component.css`

---

## Icons สร้างใหม่

| ไฟล์ | ใช้ที่ไหน |
|------|---------|
| `hamburger.svg` | Header: sidebar toggle |
| `chevron-down.svg` | Header: profile dropdown arrow |

---

## Global CSS เพิ่ม (`styles.css`)

```css
.icon-danger {
  filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}
```

---

## CSS Files ที่ลบ

- `main-layout.component.css`
- `top-breadcrumb.component.css`
- `side-bar.component.css`
- `header.component.css`
- `welcome.component.css`

---

## Related Docs

- [design-system.md](../architecture/design-system.md) — Color tokens + component patterns
- [frontend-guidelines.md](../development/frontend-guidelines.md) — FE patterns + PrimeNG rules
- [frontend-coding-standards.md](../development/frontend-coding-standards.md) — DO/DON'T ละเอียด
- [TASK-ui-redesign.md](TASK-ui-redesign.md) — แผน redesign ภาพรวมทั้งระบบ
