# TASK: หน้าโปรไฟล์ผู้ใช้ (Profile)

> สร้าง: 2026-03-16 | สถานะ: เสร็จสิ้น (รอ gen-api + ทดสอบ)

## สรุป

สร้างหน้า Profile ให้ผู้ใช้ที่ login ดูข้อมูลพนักงานของตัวเอง + แก้ไขเฉพาะบาง fields ได้ เข้าจากปุ่ม "โปรไฟล์" ใน Header dropdown

## ขอบเขต

### Fields ที่แก้ไขได้
- รูปภาพ, Username, LineId, บัญชีธนาคาร, เลขที่บัญชี, วันที่สิ้นสุดงาน, เบอร์โทร
- เพิ่ม/แก้ไข/ลบ: ที่อยู่, ประวัติการศึกษา, ประวัติการทำงาน

### Fields ที่ Disabled (ดูได้อย่างเดียว)
- ข้อมูลส่วนบุคคล (ชื่อ, นามสกุล, เพศ, วันเกิด, บัตรประชาชน, สัญชาติ, ศาสนา)
- ข้อมูลการจ้างงาน (ตำแหน่ง, ประเภทการจ้าง, วันเริ่มงาน, เงินเดือน/ค่าจ้าง)
- อีเมล, สถานะการใช้งาน

---

## Phase 1: Backend API — ✅ เสร็จสิ้น

| Sub-task | สถานะ |
|----------|--------|
| 1.1 สร้าง `UpdateProfileRequestModel` | ✅ |
| 1.2 เพิ่ม `EmployeeMapper.UpdateProfileEntity` | ✅ |
| 1.3 เพิ่ม Service methods (`GetMyFullProfileAsync`, `UpdateMyProfileAsync`) | ✅ |
| 1.4 เพิ่ม Controller endpoints (`GET/PUT /me/profile`) | ✅ |

## Phase 2: Frontend — ✅ เสร็จสิ้น (รอ gen-api)

| Sub-task | สถานะ |
|----------|--------|
| 2.1 `npm run gen-api` | ❌ (ต้องรัน Backend ก่อน) |
| 2.2 Implement `ProfileComponent` (TS) | ✅ |
| 2.3 Implement `ProfileComponent` (HTML) | ✅ |

## Phase 3: เอกสาร — ✅ เสร็จสิ้น

| Sub-task | สถานะ |
|----------|--------|
| 3.1 อัพเดต `database-api-reference.md` | ✅ |
