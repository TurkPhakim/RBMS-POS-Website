# TASK: ModalService — แทนที่ระบบ Modal เดิม

> สร้าง: 2026-03-13 | สถานะ: กำลังทำ

## เป้าหมาย

แทนที่ระบบ Modal แบบ @Input/@Output + template binding (confirm-modal, success-modal, error-modal) ด้วย `ModalService` ที่ครอบ PrimeNG DynamicDialog ให้เรียก method call เดียวจบ

## ปัญหาปัจจุบัน

ทุก page ต้องมี boilerplate ซ้ำ:
- ~6 signals: `showDeleteModal`, `showSuccessModal`, `showErrorModal`, `successMessage`, `errorMessage`, `selectedItem`
- ~4 methods: `cancelDelete()`, `closeSuccessModal()`, `closeErrorModal()`
- ~20 บรรทัด template

## Phase 1: สร้าง ModalService + Modal Components

| Sub-task | สถานะ |
|----------|-------|
| 1.1 สร้าง `core/services/modal.service.ts` | |
| 1.2 สร้าง `shared/modals/info-modal/` | |
| 1.3 สร้าง `shared/modals/cancel-modal/` | |
| 1.4 สร้าง `shared/modals/success-modal/` (ตัวใหม่) | |

## Phase 2: CSS + Module Setup

| Sub-task | สถานะ |
|----------|-------|
| 2.1 เพิ่ม `.alert-dialog` CSS ใน `styles.css` | |
| 2.2 อัพเดต `shared.module.ts` | |

## Phase 3: Migrate 9 หน้า

| Sub-task | สถานะ |
|----------|-------|
| position-list | |
| service-charge-list | |
| employee-list | |
| menu-list | |
| position-manage | |
| service-charge-manage | |
| employee-manage | |
| menu-manage | |
| login | |

## Phase 4: Cleanup

| Sub-task | สถานะ |
|----------|-------|
| ลบ `shared/modals/confirm-modal/` | |
| ลบ `shared/modals/error-modal/` | |
| ลบ CSS animation ที่ไม่ใช้ | |
| ลบ DialogService provider จาก component เดิม | |

## Phase 5: อัพเดตเอกสาร

| Sub-task | สถานะ |
|----------|-------|
| อัพเดต MEMORY.md | |
| อัพเดต CLAUDE.md | |
