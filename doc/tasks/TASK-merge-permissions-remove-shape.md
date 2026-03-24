# TASK: รวม Permission โมดูลโต๊ะ + ลบฟิลด์ Shape + เปลี่ยนชื่อ Module

> สถานะ: เสร็จสิ้น | วันที่: 2026-03-19

## สรุป

รวม permission ที่แยกอยู่ 3 กลุ่ม (table-manage, zone, floor-object) ให้เหลือ 2 กลุ่ม + ลบฟิลด์ Shape ออกจาก DB/Backend ทั้งหมด + เปลี่ยนชื่อ/ลำดับ child modules

## โครงสร้างใหม่

| ลำดับ | ชื่อ Module | Permission | ใช้สำหรับ |
|-------|-----------|-----------|----------|
| 1 | จัดวางผังร้าน | `floor-plan.*` | ผังโต๊ะ + วัตถุบนผัง CRUD |
| 2 | จัดการโซน/โต๊ะ | `table-manage.*` | โต๊ะ CRUD + โซน CRUD |
| 3 | จัดการการจองโต๊ะ | `reservation.*` | การจอง CRUD |

## Phase 1: Backend — ลบ Shape + รวม Permissions

- [x] ลบ `ETableShape` enum
- [x] ลบ Shape จาก Entity/Config/Models/Mapper/Service
- [x] รวม Permissions: Zone → `table-manage.*`, FloorObject → `floor-plan.*`
- [x] Migration: `RemoveShapeAndMergePermissions` — drop Shape column + ปรับ permission data

## Phase 2: gen-api

- [x] Restart Backend + ตรวจ Swagger (Shape หายครบ)
- [x] ผู้ใช้รัน gen-api

## Phase 3: Frontend — อัพเดต Permissions

- [x] `table-routing.module.ts` — floor-plan route ใช้ `floor-plan.read`
- [x] `zone-list.component.ts/html` — ลบ zone/table permission แยก ใช้ `table-manage.*` ตัวเดียว
- [x] `floor-plan.component.ts` — `floor-object.*` → `floor-plan.*`
- [x] `table-manage.component.ts` — ลบ `shape: 'Square'` hardcode
- [x] `side-bar.component.ts` — `zone.read` → `table-manage.read` / `floor-plan.read`
- [x] `position-manage.component.ts` — เพิ่ม `floor-plan` + `reservation` ใน moduleIconMap

## Phase 4: เปลี่ยนชื่อ/ลำดับ Module

- [x] Migration: `RenameTableChildModules` — เปลี่ยนชื่อ + SortOrder ใน DB
