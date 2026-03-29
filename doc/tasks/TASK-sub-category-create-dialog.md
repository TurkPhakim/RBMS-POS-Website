# TASK: เปลี่ยน "เพิ่มหมวดหมู่เมนู" จาก Page → Dialog

> สร้าง: 2026-03-28

## เป้าหมาย
- **เพิ่มหมวดหมู่** → เปิดเป็น Dialog (ไม่ใช่ navigate ไป page ใหม่)
- **แก้ไขหมวดหมู่** → ยังคงเป็น Page เหมือนเดิม (กดไอคอนดวงตา)
- ลดความซ้ำซ้อนใน `sub-category-manage` (ลบ create logic ออก)

## Design — Dialog เพิ่มหมวดหมู่
- Layout: `app-card-template` + `card-dialog`
- Header: "เพิ่มหมวดหมู่{อาหาร/เครื่องดื่ม/ของหวาน}" (ตาม categoryType)
- Fields: ชื่อหมวดหมู่ (required) + สถานะการขาย (toggle, default เปิด)
- ไม่ต้องแสดง "ประเภทหลัก" เพราะรู้จาก tab
- ปุ่ม: ยกเลิก (secondary outlined) + บันทึก (primary)
- กดบันทึก → เรียก API create → `commonSuccess()` → close(true) → list reload
- Width: `30vw`

## Sub-tasks

### Phase 1: สร้าง Dialog + แก้ List
- ✅ สร้าง `create-sub-category-dialog` component
- ✅ แก้ `sub-category-list` — ปุ่มเพิ่มเปิด Dialog แทน navigate
- ✅ Declare ใน `menu.module.ts`

### Phase 2: ลดความซ้ำซ้อน
- ✅ ลบ create route จาก `menu-routing.module.ts`
- ✅ แก้ `sub-category-manage` เป็น edit-only (ลบ create logic, page header condition, createSubCategory method)

## ไฟล์ที่เกี่ยวข้อง
| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `features/menu/dialogs/create-sub-category-dialog/` | **สร้างใหม่** |
| `features/menu/pages/sub-category-list/sub-category-list.component.ts` | เปลี่ยนปุ่มเพิ่มจาก navigate → เปิด dialog |
| `features/menu/menu-routing.module.ts` | ลบ create route |
| `features/menu/menu.module.ts` | เพิ่ม declaration |
| `features/menu/pages/sub-category-manage/sub-category-manage.component.ts` | ลบ create logic |
| `features/menu/pages/sub-category-manage/sub-category-manage.component.html` | ลบ create condition |
