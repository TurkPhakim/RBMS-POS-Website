# TASK: ปรับปรุง Employee Module

> สร้าง: 2026-03-13
> สถานะ: กำลังดำเนินการ

## เป้าหมาย

เพิ่มข้อมูลส่วนตัว (สัญชาติ, เชื้อชาติ, ศาสนา, Line ID) + ตาราง 1-N (ที่อยู่, ประวัติการศึกษา, ประวัติการทำงาน) + Redesign หน้า Listing (Pagination + Search + Filter + Hard/Soft Delete)

## การตัดสินใจ

- ลบ: ถ้ามี User → Soft Delete, ถ้าไม่มี User → Hard Delete
- ที่อยู่: ตำบล/อำเภอ/จังหวัด เป็น Text box
- วุฒิการศึกษา: Text box (ไม่ใช่ Dropdown)
- ลบฟิลด์ EmploymentStatus ออกจาก TbEmployee

## Phases

### Phase 1: Backend — Enums ใหม่ ✅
- [x] ENationality, EEthnicity, EReligion, EAddressType

### Phase 2: Backend — Entity + Configuration + Migration
- [ ] แก้ไข TbEmployee (เพิ่ม/ลบ fields)
- [ ] สร้าง TbEmployeeAddress, TbEmployeeEducation, TbEmployeeWorkHistory
- [ ] สร้าง EntityConfiguration 3 ตัว
- [ ] แก้ไข TbEmployeeConfiguration
- [ ] แก้ไข POSMainContext
- [ ] สร้าง Migration

### Phase 3: Backend — Repository + UnitOfWork
- [ ] สร้าง Repository interfaces + implementations
- [ ] แก้ไข UnitOfWork

### Phase 4: Backend — Models + Mapper + Service + Controller
- [ ] สร้าง/แก้ไข DTOs
- [ ] แก้ไข Mapper
- [ ] แก้ไข Service + Controller
- [ ] เพิ่ม CRUD endpoints สำหรับ sub-entities

### Phase 5: Frontend — Dropdown Components
- [ ] Nationality, Ethnicity, Religion, AddressType dropdowns

### Phase 6: Frontend — Shared Dialogs
- [ ] AddressDialog, EducationDialog, WorkHistoryDialog

### Phase 7: Frontend — Employee Manage Page
- [ ] เพิ่ม Card ข้อมูลส่วนตัว + Section 1-N records

### Phase 8: Frontend — Employee List Redesign
- [ ] Pagination + Search + Filter + Delete logic

### Phase 9: API Regeneration + Test
- [ ] gen-api + build + test
