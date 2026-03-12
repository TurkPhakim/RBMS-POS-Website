# TASK: Revise Menu Module (Frontend)

> สถานะ: DONE | เริ่ม: 2026-03-11 | เสร็จ: 2026-03-11

## เป้าหมาย

เขียน Menu Module ใหม่ตามมาตรฐาน RBMS-POS — PrimeNG, design tokens, Thai, sidebar L2 menu, constructor injection, signals

## ปัญหาปัจจุบัน

- `inject()` แทน constructor injection (ทั้ง 2 components)
- `ChangeDetectionStrategy.OnPush` (ทั้ง 2 components)
- import model ผิดชื่อ: `MenuResponseDto`, `CreateMenuRequestDto`, `UpdateMenuRequestDto`, `MenuCategory`
- `response.data` แทน `response.results`/`response.result`
- Route param `:id` แทน `:menuId`
- `cdr.markForCheck()` x4 ใน manage component
- Raw Tailwind colors, ~15+ inline SVG, ข้อความ English
- Plain HTML table/select/button แทน PrimeNG
- CSS checkbox toggle, CommonModule/ReactiveFormsModule ซ้ำ

---

## Phase 1: Sidebar + Routing + Module

| Sub-task | สถานะ |
|----------|--------|
| 1.1 Sidebar menu Menu → parent + children | DONE |
| 1.2 Routing: redirect + nested + `:menuId` | DONE |
| 1.3 Module: ลบ CommonModule, ReactiveFormsModule | DONE |

## Phase 2: Rewrite MenuListComponent

| Sub-task | สถานะ |
|----------|--------|
| 2.1 .ts: ลบ OnPush/inject, constructor injection, fix models/response/messages | DONE |
| 2.2 .html: PrimeNG + design tokens + Thai | DONE |
| 2.3 ลบ menu-list.component.css | DONE |

## Phase 3: Rewrite MenuManageComponent

| Sub-task | สถานะ |
|----------|--------|
| 3.1 .ts: ลบ OnPush/inject/CDR, constructor injection, fix models/response/messages | DONE |
| 3.2 .html: PrimeNG + design tokens + Thai + ลบ breadcrumb | DONE |
| 3.3 ลบ menu-manage.component.css | DONE |

## Verification

- [x] `ng build` — ไม่มี error ใหม่ (errors ทั้งหมดเป็น pre-existing จาก auth/login modules)
- [x] Sidebar: "Menu" parent → "รายการเมนู" L2
- [x] List: p-table + p-tag + filter + Thai
- [x] Form: pInputText + pTextarea + p-dropdown + p-inputNumber + p-inputSwitch
- [x] ไม่มี inline SVG, raw colors, .css files

## ไฟล์ที่แก้ไข

| การกระทำ | ไฟล์ |
|----------|------|
| แก้ไข | `shared/components/side-bar/side-bar.component.ts` |
| แก้ไข | `features/menu/menu-routing.module.ts` |
| แก้ไข | `features/menu/menu.module.ts` |
| เขียนใหม่ | `features/menu/pages/menu-list/menu-list.component.ts` |
| เขียนใหม่ | `features/menu/pages/menu-list/menu-list.component.html` |
| เขียนใหม่ | `features/menu/pages/menu-manage/menu-manage.component.ts` |
| เขียนใหม่ | `features/menu/pages/menu-manage/menu-manage.component.html` |
| ลบ | `menu-list.component.css` |
| ลบ | `menu-manage.component.css` |
