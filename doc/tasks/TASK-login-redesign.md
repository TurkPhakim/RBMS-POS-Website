# TASK: Login Page Redesign

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-11
**วันที่เสร็จ**: 2026-03-11

> ปรับหน้า Login ให้เข้ากับธีม Modern Dashboard + ตรงมาตรฐาน FE (design tokens, constructor injection, signals, modern control flow, ห้าม inline SVG)

---

## กฎที่ต้องยึดถือ

- ใช้ design tokens เท่านั้น (ห้าม raw colors)
- ห้าม inline SVG → ใช้ `<img src="images/icons/xxx.svg">`
- `@if` แทน `*ngIf`
- constructor injection แทน `inject()`
- ใช้ signals สำหรับ component state
- ใช้ `app-success-modal` แทน custom modal
- Desktop only (ห้าม responsive classes)

---

## ไฟล์ที่แก้

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `login.component.ts` | constructor injection, signals, ลบ styleUrls, ใช้ app-success-modal |
| `login.component.html` | ออกแบบ UI ใหม่ทั้งหน้า |
| `login.component.css` | **ลบ** (ย้าย password-input ไป global) |
| `auths.module.ts` | เพิ่ม SharedModule |
| `src/styles.css` | เพิ่ม .password-input hide rules |
| `public/images/icons/` | สร้าง: user.svg, lock.svg, eye.svg, eye-off.svg |

---

## สรุปการเปลี่ยนแปลง

### login.component.ts
- `inject()` ทั้ง 5 ตัว → constructor injection
- `loading`, `showPassword` → signals
- ลบ `error` string → เพิ่ม `showErrorModal` + `errorMessage` signals
- ลบ `showSuccessModal` boolean → signal
- ลบ `clearError()` → `onErrorModalClosed()`
- เพิ่ม `onSuccessModalClosed()` (ใช้กับ app-success-modal)
- ลบ `styleUrls`

### login.component.html
- ลบ inline SVG ทั้ง 8 จุด → `<img src="images/icons/xxx.svg">`
- `bg-orange-gradient` → `bg-surface`
- ลบ responsive classes (`sm:px-6 lg:px-8`)
- ลบ undefined classes (`animate-fade-in`, `animate-slide-up`)
- raw colors ทั้งหมด → design tokens
- `*ngIf` → `@if`
- Logo ลดขนาด `h-60 w-60` → `h-24 w-24`
- ลบ gradient text → `text-page-title text-surface-dark`
- ลบ custom success modal → ใช้ `<app-success-modal>`
- ลบ inline error alert → ใช้ `<app-confirm-modal type="warning">` เป็น Error Modal

### login.component.css → ลบ
- `.password-input` hide rules → ย้ายไป `src/styles.css` (global)
- `.animate-scale-in`, `.animate-progress` → ไม่จำเป็นแล้ว

### auths.module.ts
- เพิ่ม `SharedModule` ใน imports (เพื่อใช้ shared dialogs + PrimeNG)
- ลบ `CommonModule`, `RouterModule` (SharedModule export ให้แล้ว)

### styles.css
- เพิ่ม `.password-input::-ms-reveal` + `::-webkit-credentials-auto-fill-button` rules

### Icons สร้างใหม่
- `user.svg` — username field icon
- `lock.svg` — password field icon
- `eye.svg` — show password
- `eye-off.svg` — hide password
