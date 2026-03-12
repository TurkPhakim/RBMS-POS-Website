# TASK: Revise Human Resource Module (Frontend)

> สถานะ: DONE | เริ่ม: 2026-03-11 | เสร็จ: 2026-03-11

## เป้าหมาย

เขียน HR Module ใหม่ตามมาตรฐาน RBMS-POS — PrimeNG, design tokens, Thai, sidebar L2 menu, constructor injection, signals

## ปัญหาปัจจุบัน

- ใช้ raw Tailwind colors (blue-500, gray-600, teal-500, purple-500, green-500, red-500)
- inline SVG ~30+ จุด
- `ChangeDetectionStrategy.OnPush` + `inject()`
- `response.data` แทน `response.results`/`response.result`
- import model ผิดชื่อ (Dto/ชื่อเก่า)
- ไม่ใช้ PrimeNG components
- hardcoded breadcrumb + ข้อความ English
- CSS checkbox toggle, CommonModule/ReactiveFormsModule ซ้ำ

---

## Phase 1: Sidebar + Routing + Module

| Sub-task | สถานะ |
|----------|--------|
| 1.1 Sidebar menu HR → parent + children | DONE |
| 1.2 Routing: redirect + nested + `:employeeId` | DONE |
| 1.3 Module: ลบ CommonModule, ReactiveFormsModule | DONE |

## Phase 2: Rewrite EmployeeListComponent

| Sub-task | สถานะ |
|----------|--------|
| 2.1 .ts: ลบ OnPush/inject/CDR, constructor injection, fix models/response/messages | DONE |
| 2.2 .html: PrimeNG + design tokens + Thai | DONE |
| 2.3 ลบ employee-list.component.css | DONE |

## Phase 3: Rewrite EmployeeManageComponent

| Sub-task | สถานะ |
|----------|--------|
| 3.1 .ts: ลบ OnPush/inject/CDR, constructor injection, fix models/response/messages | DONE |
| 3.2 .html: PrimeNG + design tokens + Thai + ลบ breadcrumb | DONE |
| 3.3 ลบ employee-manage.component.css | DONE |

## Verification

- [x] `ng build` — ไม่มี error ใหม่ (errors ทั้งหมดเป็น pre-existing จาก auth/menu modules)
- [x] Sidebar: "Human Resource" parent → "รายการพนักงาน" L2
- [x] List: p-table + p-tag + filter + Thai
- [x] Form: pInputText + p-dropdown + p-inputNumber + p-inputSwitch
- [x] ไม่มี inline SVG, raw colors, .css files

## ไฟล์ที่แก้ไข

| การกระทำ | ไฟล์ |
|----------|------|
| แก้ไข | `shared/components/side-bar/side-bar.component.ts` |
| เขียนใหม่ | `features/human-resource/human-resource-routing.module.ts` |
| เขียนใหม่ | `features/human-resource/human-resource.module.ts` |
| เขียนใหม่ | `features/human-resource/pages/employee-list/employee-list.component.ts` |
| เขียนใหม่ | `features/human-resource/pages/employee-list/employee-list.component.html` |
| เขียนใหม่ | `features/human-resource/pages/employee-manage/employee-manage.component.ts` |
| เขียนใหม่ | `features/human-resource/pages/employee-manage/employee-manage.component.html` |
| ลบ | `employee-list.component.css` |
| ลบ | `employee-manage.component.css` |
