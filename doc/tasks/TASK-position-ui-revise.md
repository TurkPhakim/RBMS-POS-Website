# TASK: Revise UI หน้าจัดการตำแหน่งงาน + Permission

> สถานะ: เสร็จสมบูรณ์ | สร้างเมื่อ: 2026-03-16

## สรุป

Revise UI หน้า Position List และ Position Manage ให้อ้างอิง pattern จาก Employee List/Manage ที่ทำเสร็จแล้ว

**ไม่ต้องแก้ Backend** — ใช้ API ที่มีอยู่ทั้งหมด

---

## Phase 1: Position List — Revise UI

### ปัญหาปัจจุบัน
- ไม่มี Search, Filter, Pagination
- ไม่มี Permission check (canCreate, canDelete)
- Header ไม่มี icon
- UI ไม่สอดคล้องกับ Employee List

### เป้าหมาย
- เพิ่ม Search (ค้นหาชื่อตำแหน่ง) + Filter สถานะ + Pagination
- เพิ่ม Permission check
- ปรับ UI ให้ตรงกับ Employee List pattern

### ไฟล์ที่แก้
- `features/admin/pages/position-list/position-list.component.ts`
- `features/admin/pages/position-list/position-list.component.html`

### สถานะ: ✅ เสร็จแล้ว

---

## Phase 2: Position Manage — เพิ่มตาราง employees

### ปัญหาปัจจุบัน
- ไม่มีข้อมูลว่าตำแหน่งนี้มีพนักงานคนไหนบ้าง

### เป้าหมาย
- เพิ่ม section card "พนักงานในตำแหน่งนี้" (เฉพาะ Edit mode)
- แสดง: รหัส, รูปภาพ, ชื่อ+นามสกุลไทย, อีเมล, ประเภทการจ้าง, สถานะ
- Pagination page ทีละ 5 คน

### ไฟล์ที่แก้
- `features/admin/pages/position-manage/position-manage.component.ts`
- `features/admin/pages/position-manage/position-manage.component.html`

### สถานะ: ✅ เสร็จแล้ว
