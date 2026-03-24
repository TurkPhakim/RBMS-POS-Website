# TASK: ระบบเปลี่ยนรหัสผ่าน (Change Password)

> สร้าง: 2026-03-17 | สถานะ: กำลังทำ

## สรุป
เพิ่มฟีเจอร์เปลี่ยนรหัสผ่าน สำหรับผู้ใช้ที่ login แล้ว กดจากเมนูเพิ่มเติมใน header → เปิด Dialog กรอกรหัสผ่านเก่า + รหัสผ่านใหม่ + ยืนยัน พร้อม Password Strength Indicator

## Phase 1: Backend

### 1.1 สร้าง ChangePasswordRequestModel
- **เป้าหมาย**: Request model สำหรับ change-password endpoint
- **ไฟล์ใหม่**: `POS.Main.Business.Admin/Models/Auth/ChangePasswordRequestModel.cs`
- **Fields**: CurrentPassword (Required), NewPassword (Required, 8-128), ConfirmPassword (Required, Compare)

### 1.2 เพิ่ม ChangePasswordAsync ใน IAuthService + AuthService
- **เป้าหมาย**: Business logic สำหรับเปลี่ยนรหัสผ่าน
- **ไฟล์แก้ไข**: `IAuthService.cs`, `AuthService.cs`
- **Logic**: ตรวจรหัสเก่า → password policy → history check → เปลี่ยน

### 1.3 เพิ่ม endpoint ใน AuthController
- **เป้าหมาย**: POST /api/admin/auth/change-password
- **ไฟล์แก้ไข**: `AuthController.cs`

### สถานะ
- [ ] 1.1 ChangePasswordRequestModel
- [ ] 1.2 IAuthService + AuthService
- [ ] 1.3 AuthController endpoint

## Phase 2: gen-api
- [ ] Restart Backend → ผู้ใช้รัน `npm run gen-api`

## Phase 3: Frontend

### 3.1 สร้าง ChangePasswordDialogComponent
- **เป้าหมาย**: Dialog สำหรับเปลี่ยนรหัสผ่าน
- **ไฟล์ใหม่**: `shared/dialogs/change-password/` (2 ไฟล์)

### 3.2 อัพเดต SharedModule + Header
- **เป้าหมาย**: เปิด Dialog จากปุ่มเมนูใน header
- **ไฟล์แก้ไข**: `shared.module.ts`, `header.component.ts`, `header.component.html`

### สถานะ
- [ ] 3.1 ChangePasswordDialogComponent
- [ ] 3.2 SharedModule + Header
