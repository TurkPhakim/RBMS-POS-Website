# TASK: ระบบลืมรหัสผ่าน (Forgot Password)

> สร้าง: 2026-03-15 | สถานะ: เสร็จสมบูรณ์

## สรุป

สร้างระบบ OTP-based password reset ครบ flow — ตั้งแต่ขอ OTP → ยืนยัน OTP → ตั้งรหัสผ่านใหม่ พร้อม password strength indicator และ password policy enforcement

## Flow

```
Login → คลิก "ลืมรหัสผ่าน?"
  → Dialog 1: กรอก Username/Email → ส่ง OTP 6 หลักทางอีเมล
  → Dialog 2: กรอก OTP (นับถอยหลัง 3 นาที + ปุ่มส่งใหม่)
  → หน้า /auth/reset-password?token=xxx: ตั้งรหัสผ่านใหม่ (strength meter + checklist)
  → สำเร็จ → redirect Login + ส่งอีเมลยืนยัน
```

## Phases

### Phase 1: Backend — Entity + Migration
- [x] `TbPasswordResetToken` entity (OTP + Reset Token)
- [x] `TbPasswordHistory` entity (ประวัติรหัสผ่าน)
- [x] EntityConfiguration (2 ไฟล์)
- [x] DbContext + Migration `AddForgotPasswordTables`

### Phase 2: Backend — Repository
- [x] `IPasswordResetTokenRepository` + `PasswordResetTokenRepository`
- [x] `IPasswordHistoryRepository` + `PasswordHistoryRepository`
- [x] เพิ่ม `GetByUsernameOrEmailAsync` ใน UserRepository
- [x] เพิ่ม `RevokeAllByUserIdAsync` ใน RefreshTokenRepository
- [x] UnitOfWork อัพเดต

### Phase 3: Backend — Business Logic
- [x] Request/Response Models (4 ไฟล์)
- [x] `ForgotPasswordAsync` — ส่ง OTP + mask email
- [x] `VerifyOtpAsync` — ยืนยัน OTP → return resetToken (max 5 attempts)
- [x] `ResetPasswordAsync` — ตั้งรหัสผ่านใหม่ + password policy + revoke sessions
- [x] Email templates (OTP + Confirmation) — สไตล์เดียวกับ credential email
- [x] `ValidatePasswordPolicy` — 8-128 chars, uppercase, lowercase, digit, special char, no username

### Phase 4: Backend — Controller
- [x] POST `/api/admin/auth/forgot-password` [AllowAnonymous]
- [x] POST `/api/admin/auth/verify-otp` [AllowAnonymous]
- [x] POST `/api/admin/auth/reset-password` [AllowAnonymous]

### Phase 5: Frontend — Dialogs
- [x] `ForgotPasswordDialogComponent` (กรอก username/email → ส่ง OTP)
- [x] `VerifyOtpDialogComponent` (กรอก OTP + countdown 3 นาที + ปุ่มส่ง OTP อีกครั้ง)
- [x] `npm run gen-api` สร้าง TypeScript client

### Phase 6: Frontend — หน้า Reset Password
- [x] Layout เหมือน Login (branding ซ้าย + form ขวา)
- [x] Password strength meter (progress bar: weak/medium/strong)
- [x] Requirements checklist (5 ข้อ: ความยาว, uppercase, lowercase, digit, special)
- [x] Eye toggle สำหรับทั้ง password + confirm password

### Phase 7: Frontend — Integration
- [x] Login page wiring (ปุ่ม "ลืมรหัสผ่าน?" → Dialog chain → navigate)
- [x] Routing (`/auth/reset-password` route)
- [x] AuthsModule declarations (3 components ใหม่)
- [x] Build สำเร็จ ไม่มี error

## ไฟล์ที่สร้าง/แก้ไข

### Backend — ไฟล์ใหม่
- `POS.Main.Dal/Entities/Auth/TbPasswordResetToken.cs`
- `POS.Main.Dal/Entities/Auth/TbPasswordHistory.cs`
- `POS.Main.Dal/EntityConfigurations/TbPasswordResetTokenConfiguration.cs`
- `POS.Main.Dal/EntityConfigurations/TbPasswordHistoryConfiguration.cs`
- `POS.Main.Dal/Migrations/20260315..._AddForgotPasswordTables.cs`
- `POS.Main.Repositories/Interfaces/IPasswordResetTokenRepository.cs`
- `POS.Main.Repositories/Interfaces/IPasswordHistoryRepository.cs`
- `POS.Main.Repositories/Implementations/PasswordResetTokenRepository.cs`
- `POS.Main.Repositories/Implementations/PasswordHistoryRepository.cs`
- `POS.Main.Business.Admin/Models/Auth/ForgotPasswordRequestModel.cs`
- `POS.Main.Business.Admin/Models/Auth/ForgotPasswordResponseModel.cs`
- `POS.Main.Business.Admin/Models/Auth/VerifyOtpRequestModel.cs`
- `POS.Main.Business.Admin/Models/Auth/VerifyOtpResponseModel.cs`
- `POS.Main.Business.Admin/Models/Auth/ResetPasswordRequestModel.cs`

### Backend — ไฟล์แก้ไข
- `POS.Main.Dal/POSMainContext.cs` — เพิ่ม 2 DbSet
- `POS.Main.Repositories/Interfaces/IUserRepository.cs` — เพิ่ม `GetByUsernameOrEmailAsync`
- `POS.Main.Repositories/Implementations/UserRepository.cs` — implement method
- `POS.Main.Repositories/Interfaces/IRefreshTokenRepository.cs` — เพิ่ม `RevokeAllByUserIdAsync`
- `POS.Main.Repositories/Implementations/RefreshTokenRepository.cs` — implement method
- `POS.Main.Repositories/UnitOfWork/IUnitOfWork.cs` — เพิ่ม 2 properties
- `POS.Main.Repositories/UnitOfWork/UnitOfWork.cs` — เพิ่ม 2 lazy properties
- `POS.Main.Business.Admin/Interfaces/IAuthService.cs` — เพิ่ม 3 methods
- `POS.Main.Business.Admin/Services/AuthService.cs` — implement 3 methods + helpers + email templates
- `RBMS.POS.WebAPI/Controllers/AuthController.cs` — เพิ่ม 3 endpoints

### Frontend — ไฟล์ใหม่
- `features/auths/dialogs/forgot-password-dialog/forgot-password-dialog.component.ts`
- `features/auths/dialogs/forgot-password-dialog/forgot-password-dialog.component.html`
- `features/auths/dialogs/verify-otp-dialog/verify-otp-dialog.component.ts`
- `features/auths/dialogs/verify-otp-dialog/verify-otp-dialog.component.html`
- `features/auths/pages/reset-password/reset-password.component.ts`
- `features/auths/pages/reset-password/reset-password.component.html`

### Frontend — ไฟล์แก้ไข
- `features/auths/auths.module.ts` — declare 3 components ใหม่
- `features/auths/auths-routing.module.ts` — เพิ่ม reset-password route
- `features/auths/pages/login/login.component.ts` — เพิ่ม DialogService + forgot password flow
- `features/auths/pages/login/login.component.html` — เปลี่ยน link เป็น button
