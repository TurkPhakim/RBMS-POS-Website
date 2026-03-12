# TASK: Admin Module Frontend Revise

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-11
**วันที่เสร็จ**: 2026-03-11

> เขียน Admin Module (Frontend) ใหม่ทั้งหมด ให้ตรงมาตรฐาน RBMS-POS, ใช้ PrimeNG, design tokens, ภาษาไทย, sidebar L2 menu
> เอกสารอ้างอิง: [frontend-guidelines.md](../development/frontend-guidelines.md), [frontend-coding-standards.md](../development/frontend-coding-standards.md), [design-system.md](../architecture/design-system.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- ห้าม `ChangeDetectionStrategy.OnPush` — ใช้ Angular Signals
- ห้าม `inject()` — ใช้ constructor injection
- ห้าม inline SVG — ใช้ `<app-generic-icon>` หรือ `pi pi-*`
- ห้าม raw Tailwind colors — ใช้ design tokens เท่านั้น
- ห้ามไฟล์ `.css` — ใช้ Tailwind utility ใน template
- ใช้ generated models (`*Model`) ไม่ใช่ `*Dto`
- Response: `response.result` (single), `response.results` (list)
- ข้อความ UI ทั้งหมดเป็นภาษาไทย

---

## แผนการทำงาน

### Phase 1 — เพิ่ม PrimeNG modules ใน SharedModule ✅

กระทบ: `shared.module.ts` | ความซับซ้อน: ต่ำ

#### 1.1 เพิ่ม InputSwitchModule + Textarea (`shared/shared.module.ts`)

**ปัญหาปัจจุบัน:**
- SharedModule ยังไม่มี `InputSwitchModule` และ `Textarea` (PrimeNG v19)

**เป้าหมาย:**
- เพิ่ม import + export ใน `PRIMENG_MODULES` array

---

### Phase 2 — Sidebar + Routing + ลบ Dashboard ✅

กระทบ: sidebar, routing, admin module | ความซับซ้อน: ปานกลาง

#### 2.1 Sidebar menu children (`shared/components/side-bar/side-bar.component.ts`)

**ปัญหาปัจจุบัน:**
- Admin Setting เป็น leaf item → คลิกแล้วเข้า Card dashboard

**เป้าหมาย:**
- เปลี่ยนเป็น parent item + children (L2 menu: Service Charges)

#### 2.2 Admin routing (`features/admin/admin-routing.module.ts`)

**ปัญหาปัจจุบัน:**
- path `''` → AdminSettingComponent (dashboard)
- route param ใช้ `:id` แทน `:serviceChargeId`

**เป้าหมาย:**
- path `''` → redirect to `service-charges`
- route param: `:serviceChargeId`
- breadcrumb data เป็นภาษาไทย

#### 2.3 ลบ AdminSettingComponent + อัปเดต Module

**ปัญหาปัจจุบัน:**
- AdminSettingComponent (Card dashboard) ไม่จำเป็นแล้ว

**เป้าหมาย:**
- ลบ folder `pages/admin-setting/` (3 ไฟล์)
- ลบ import + declaration ใน `admin.module.ts`

---

### Phase 3 — Rewrite ServiceChargeListComponent ✅

กระทบ: service-charge-list | ความซับซ้อน: ปานกลาง

#### 3.1 Rewrite .ts (`pages/service-charge-list/service-charge-list.component.ts`)

**ปัญหาปัจจุบัน:**
- ใช้ `OnPush`, `inject()`, `styleUrls`
- import `ServiceChargeResponseDto` (ผิด)
- ใช้ `response.data` แทน `response.results`
- ข้อความภาษาอังกฤษ

**เป้าหมาย:**
- constructor injection, ลบ OnPush/styleUrls
- import `ServiceChargeResponseModel`
- `response.results ?? []`
- ข้อความภาษาไทย + error modal

#### 3.2 Rewrite .html (`pages/service-charge-list/service-charge-list.component.html`)

**ปัญหาปัจจุบัน:**
- HTML table + inline SVG + raw Tailwind colors + ภาษาอังกฤษ

**เป้าหมาย:**
- `p-table`, `p-button`, `p-tag`, `p-progressSpinner`, `pTooltip`
- `app-generic-icon` สำหรับ action icons
- design tokens ทั้งหมด
- ข้อความภาษาไทย

#### 3.3 ลบ CSS file

- ลบ `service-charge-list.component.css`

---

### Phase 4 — Rewrite ServiceChargeManageComponent ✅

กระทบ: service-charge-manage | ความซับซ้อน: สูง

#### 4.1 Rewrite .ts (`pages/service-charge-manage/service-charge-manage.component.ts`)

**ปัญหาปัจจุบัน:**
- ใช้ `OnPush`, `inject()`, `ChangeDetectorRef`, `styleUrls`
- import `CreateServiceChargeRequestDto` / `UpdateServiceChargeRequestDto` (ผิด)
- ใช้ `response.data` แทน `response.result`
- route param `get('id')` แทน `get('serviceChargeId')`
- `cdr.markForCheck()` 4 จุด
- ข้อความภาษาอังกฤษ

**เป้าหมาย:**
- constructor injection, ลบ OnPush/CDR/styleUrls
- import `CreateServiceChargeRequestModel` / `UpdateServiceChargeRequestModel`
- `response.result`
- `get('serviceChargeId')`
- ข้อความภาษาไทย + error modal

#### 4.2 Rewrite .html (`pages/service-charge-manage/service-charge-manage.component.html`)

**ปัญหาปัจจุบัน:**
- hardcoded breadcrumb (40+ บรรทัด inline SVG)
- custom toggle (CSS checkbox hack)
- `<input type="number">` แทน `p-inputNumber`
- raw Tailwind colors (`from-orange-500`, `text-gray-600`, `from-green-500`, `from-red-500`)
- inline SVG ทุก section header + validation + buttons
- ข้อความภาษาอังกฤษ

**เป้าหมาย:**
- ลบ breadcrumb (ใช้ global breadcrumb แทน)
- `pInputText`, `pTextarea`, `p-inputNumber`, `p-inputSwitch`, `p-button`
- `p-progressSpinner` สำหรับ loading
- `pi pi-*` icons แทน inline SVG
- design tokens (`from-primary to-primary-dark`, `bg-surface-card`, `text-surface-dark`)
- ข้อความภาษาไทย
- เพิ่ม `app-error-modal`

#### 4.3 ลบ CSS file

- ลบ `service-charge-manage.component.css`

---

## สรุปไฟล์ที่เปลี่ยน

| การกระทำ | ไฟล์ |
|----------|------|
| แก้ไข | `shared/shared.module.ts` |
| แก้ไข | `shared/components/side-bar/side-bar.component.ts` |
| เขียนใหม่ | `features/admin/admin-routing.module.ts` |
| เขียนใหม่ | `features/admin/admin.module.ts` |
| เขียนใหม่ | `features/admin/pages/service-charge-list/service-charge-list.component.ts` |
| เขียนใหม่ | `features/admin/pages/service-charge-list/service-charge-list.component.html` |
| เขียนใหม่ | `features/admin/pages/service-charge-manage/service-charge-manage.component.ts` |
| เขียนใหม่ | `features/admin/pages/service-charge-manage/service-charge-manage.component.html` |
| ลบ | `features/admin/pages/admin-setting/` (3 ไฟล์) |
| ลบ | `service-charge-list.component.css` |
| ลบ | `service-charge-manage.component.css` |

---

## Verification

- `ng build` ผ่าน — ไม่มี error ใหม่ (error เดิมจาก menu-manage ยังอยู่ รอ fix ตอนทำ Menu module)
