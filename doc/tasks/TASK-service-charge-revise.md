# TASK: ปรับปรุงระบบ Service Charge

> สถานะ: กำลังดำเนินการ | วันที่สร้าง: 2026-03-14

## สรุป

ปรับปรุงระบบ Service Charge ให้รองรับวันที่เริ่มต้น/สิ้นสุด, เปลี่ยนเป็น Hard Delete, สร้าง Dropdown Component ใหม่ และปรับโค้ดให้ตรงมาตรฐานโปรเจค (permissions, filters, UI patterns)

## Phase 1: Backend — Entity + Migration
- [ ] เพิ่ม `StartDate`, `EndDate` ใน `TbServiceCharge`
- [ ] เพิ่ม column config + indexes ใน Configuration
- [ ] สร้าง Migration `AddDateRangeToServiceCharge`

## Phase 2: Backend — Models, Mapper, Repository
- [ ] อัพเดต Create/Update Request Models (เพิ่ม dates)
- [ ] อัพเดต Response Model (เพิ่ม dates)
- [ ] อัพเดต Dropdown Model (Label = `{Name} ({Rate}%)`)
- [ ] อัพเดต Mapper (map dates + label format)
- [ ] เพิ่ม `GetActiveInDateRangeForDropdownAsync()` ใน Repository

## Phase 3: Backend — Service + Controller
- [ ] เพิ่ม date validation (EndDate >= StartDate)
- [ ] เปลี่ยน Delete เป็น Hard Delete
- [ ] Dropdown ใช้ filter วันที่
- [ ] อัพเดต Controller docs

## Phase 4: Frontend — gen-api
- [ ] รัน `npm run gen-api`

## Phase 5: Frontend — List Page
- [ ] เพิ่ม filter (สถานะ + วันที่เริ่มต้น)
- [ ] เพิ่ม permission checks (canCreate, canDelete)
- [ ] เพิ่มคอลัมน์วันที่
- [ ] ปรับ UI ตามมาตรฐาน

## Phase 6: Frontend — Manage Page
- [ ] เพิ่ม date picker คู่ + linkDateRange
- [ ] เพิ่ม permission read-only
- [ ] ใช้ `<app-section-card>`

## Phase 7: Frontend — Dropdown Component ใหม่
- [ ] สร้าง `ServiceChargeDropdownComponent`
- [ ] ลงทะเบียนใน SharedModule

## Phase 8: Routing — Permission Guard
- [ ] เพิ่ม PermissionGuard บน create route

## Phase 9: เอกสาร
- [ ] อัพเดต `database-api-reference.md`
