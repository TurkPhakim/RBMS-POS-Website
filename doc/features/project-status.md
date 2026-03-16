# RBMS-POS — สถานะโปรเจคและ Workflow

> **อ้างอิงจากโค้ดที่มีอยู่จริง** — อัปเดตล่าสุด 2026-03-16

---

## ภาพรวมสถานะ

| ส่วน | สถานะ |
| ---- | ------ |
| Authentication (Login/Logout/Token/Forgot/Reset Password) | ✅ เสร็จ |
| Menu Management | ✅ เสร็จ |
| Employee Management (+ Address/Education/WorkHistory + User Account) | ✅ เสร็จ |
| Service Charge | ✅ เสร็จ |
| Position Management (RBAC) | ✅ เสร็จ |
| Shop Settings (ข้อมูลร้าน + เวลาทำการ + Logo/QR Code) | ✅ เสร็จ |
| File Management (S3 Storage) | ✅ เสร็จ (ใช้ผ่าน Menu/Employee/ShopSettings) |
| Order / Table / Payment / Kitchen | ⚠️ มีหน้า Frontend stub แต่ยังไม่มี Backend API |
| Profile | ⚠️ มีหน้า Frontend stub เท่านั้น |

---

## Workflow ที่ทำงานได้จริง

### 1. Authentication Flow

```
User เปิด http://localhost:4300
        │
        ▼
[Auth Guard] ตรวจ token ใน localStorage
        │
   ไม่มี token ──────────────────────────────────────────────┐
        │                                                     │
        ▼                                                     ▼
/auth/login (LoginComponent)                        /  (WelcomeComponent)
        │                                           Header + Sidebar พร้อมใช้
        │ กรอก username/password
        ▼
POST /api/admin/auth/login
        │
   ✅ สำเร็จ → บันทึก accessToken + refreshToken ใน localStorage
        │       บันทึก user info (role, name)
        │       Redirect ไป /
        │
   ❌ ล้มเหลว → แสดง error message
               (Invalid creds / Account locked / Disabled)
```

- **Account Lockout:** ผิด 5 ครั้ง → ล็อค 15 นาที
- **Token Refresh:** Interceptor จัดการอัตโนมัติเมื่อได้รับ 401
- **Forgot Password:** POST forgot-password → OTP → verify-otp → reset-password
- **Verify Password:** ตรวจสอบรหัสผ่านปัจจุบันก่อนดำเนินการ

---

### 2. Menu Management Flow

```
Sidebar → /menu
        │
        ▼
MenuListComponent
        │── GET /api/menu              → แสดงรายการทั้งหมด
        │── GET /api/menu/search       → ค้นหาตามชื่อ
        │── GET /api/menu/category/{cat} → filter ตามหมวด
        │── GET /api/menu/available    → เฉพาะที่ available
        │
        ├── [เพิ่ม] → /menu/create → MenuManageComponent
        │              POST /api/menu (multipart/form-data + image upload S3)
        │
        └── [แก้ไข] → /menu/update/{menuId} → MenuManageComponent
                       PUT /api/menu/{menuId} (multipart/form-data + image upload S3)

[ลบ] → DELETE /api/menu/{menuId}  (soft delete)
```

- **หมวดหมู่:** ตาม Enum `MenuCategory`
- **Validation:** ชื่อซ้ำไม่ได้ (IsNameExistsAsync)
- **รูปภาพ:** Upload ผ่าน S3 → เก็บ FileId ใน TbMenus.ImageFileId → TbFiles

---

### 3. Employee Management Flow

```
Sidebar → /hr
        │
        ▼
EmployeeListComponent
        │── GET /api/humanresource              → รายการทั้งหมด
        │── GET /api/humanresource/search       → ค้นหา
        │── GET /api/humanresource/status/{s}   → filter ตามสถานะ
        │── GET /api/humanresource/user/{userId} → ดูตาม userId
        │
        ├── [เพิ่ม] → /hr/create → EmployeeManageComponent
        │              POST /api/humanresource (+ image upload S3)
        │
        └── [แก้ไข] → /hr/update/{employeeId} → EmployeeManageComponent
                       PUT /api/humanresource/{employeeId} (+ image upload S3)

[ลบ] → DELETE /api/humanresource/{employeeId}  (soft delete)
[สร้าง User Account] → POST /api/humanresource/{employeeId}/create-user
```

- **Sub-entities:** Address, Education, WorkHistory — CRUD แยกอิสระ
- **User Account:** สร้าง TbUsers เชื่อมกับ Employee เพื่อเข้าระบบได้
- **รูปภาพ:** Upload ผ่าน S3 → เก็บ FileId ใน TbEmployees.ImageFileId → TbFiles

---

### 4. Service Charge Flow

```
Sidebar → /admin-setting
        │
        ▼
ServiceChargeListComponent
        │── GET /api/admin/servicecharges           → รายการทั้งหมด
        │── GET /api/admin/servicecharges/dropdown  → สำหรับ dropdown (active + date range filter)
        │
        ├── [เพิ่ม/แก้ไข] → ServiceChargeManageComponent (Dialog)
        │                    POST / PUT /api/admin/servicecharges/{serviceChargeId}
        │
        └── [ลบ] → DELETE /api/admin/servicecharges/{serviceChargeId} (hard delete)
```

- **Dropdown:** filter เฉพาะ active + date range ที่ตรงกับวันปัจจุบัน
- **Hard Delete:** ไม่ใช้ soft delete เหมือน module อื่น

---

### 5. Position Management Flow (RBAC)

```
Sidebar → /admin-setting/positions
        │
        ▼
PositionListComponent
        │── GET /api/admin/positions           → รายการตำแหน่งทั้งหมด
        │── GET /api/admin/positions/dropdown  → สำหรับ dropdown
        │
        ├── [เพิ่ม] → /admin-setting/positions/create
        │              POST /api/admin/positions
        │
        ├── [แก้ไข] → /admin-setting/positions/update/{positionId}
        │              PUT /api/admin/positions/{positionId}
        │
        └── [ลบ] → DELETE /api/admin/positions/{positionId} (soft delete)

Permission Matrix:
        │── GET /api/admin/positions/modules/tree        → Module tree structure
        │── GET /api/admin/positions/{positionId}/permissions → สิทธิ์ปัจจุบัน
        │── PUT /api/admin/positions/{positionId}/permissions → อัพเดตสิทธิ์
        │── GET /api/admin/positions/me/permissions       → สิทธิ์ของ user ปัจจุบัน
```

- **Module Tree:** โครงสร้าง Module → Authorize Matrix → กำหนดสิทธิ์ตาม Position
- **Permission:** ผูกสิทธิ์ผ่าน TbAuthorizeMatrixPositions (Position + AuthorizeMatrix)

---

### 6. Shop Settings Flow

```
Sidebar → /admin-setting/shop-settings
        │
        ▼
ShopSettingsComponent
        │── GET /api/admin/shop-settings            → ข้อมูลร้านทั้งหมด (singleton)
        │── GET /api/admin/shop-settings/branding   → Logo + QR Code
        │── GET /api/admin/shop-settings/welcome    → ข้อมูลหน้า Welcome
        │
        └── [บันทึก] → PUT /api/admin/shop-settings (+ Logo/QR upload .png only)

Operating Hours:
        └── 7 records (จันทร์–อาทิตย์) → แก้ไขเวลาเปิด-ปิดร้าน
```

- **Singleton:** มีแค่ 1 record — ใช้ GET/PUT ไม่มี POST/DELETE
- **Logo/QR Code:** Upload .png only ผ่าน S3
- **Operating Hours:** 7 records สำหรับแต่ละวันในสัปดาห์ (TbShopOperatingHours)

---

## สิ่งที่ยังขาด (มีหน้า Frontend stub แต่ไม่มี Backend API)

| Module | หน้าที่มี | สิ่งที่ขาด |
| ------ | --------- | ---------- |
| **Order** | OrderListComponent | ไม่มี Order Entity, ไม่มี API |
| **Table** | TableComponent | ไม่มี Table Entity, ไม่มี API |
| **Payment** | PaymentComponent | ไม่มี Payment Entity, ไม่มี API |
| **Kitchen Display** | KitchenDisplayComponent | ไม่มี API, SignalR hub ยังเป็น stub |
| **Profile** | ProfileComponent | ไม่มี Profile API |

---

## โครงสร้าง Database ที่มีจริง (20 ตาราง)

```
RBMS_POS Database
│
├── Authentication & Users
│   ├── TbUsers                    ← ผู้ใช้ระบบ (login credentials, role, lockout)
│   ├── TbRefreshTokens            ← JWT refresh tokens
│   ├── TbLoginHistories           ← บันทึกการ login ทุกครั้ง
│   ├── TbPasswordResetTokens      ← OTP สำหรับ forgot password
│   └── TbPasswordHistories        ← ประวัติรหัสผ่าน (ป้องกันใช้ซ้ำ)
│
├── Admin Settings
│   ├── TbServiceCharges           ← ค่าบริการ (+ date range)
│   ├── TbShopSettings             ← ข้อมูลร้าน (singleton)
│   └── TbShopOperatingHours       ← เวลาทำการ 7 วัน
│
├── Menu
│   └── TbMenus                    ← เมนูอาหาร (ชื่อ, ราคา, หมวด, ImageFileId → TbFiles)
│
├── File
│   └── TbFiles                    ← metadata ไฟล์ (FileName, MimeType, S3Key)
│
├── Human Resource
│   ├── TbEmployees                ← พนักงาน (ชื่อ, ตำแหน่ง, สถานะ, ImageFileId → TbFiles)
│   ├── TbEmployeeAddresses        ← ที่อยู่พนักงาน
│   ├── TbEmployeeEducations       ← ประวัติการศึกษา
│   └── TbEmployeeWorkHistories    ← ประวัติการทำงาน
│
└── Position & RBAC
    ├── TbmPositions               ← ตำแหน่งงาน (master data)
    ├── TbmPermissions             ← สิทธิ์ (master data)
    ├── TbmModules                 ← โมดูล (master data, tree structure)
    ├── TbmAuthorizeMatrices       ← เมทริกซ์สิทธิ์ (Module + Permission)
    └── TbAuthorizeMatrixPositions ← ผูกสิทธิ์กับตำแหน่ง (AuthorizeMatrix + Position)
```

---

## Migrations ทั้งหมด (20 migrations)

| ลำดับ | ชื่อ Migration | รายละเอียด |
| ----- | ------------- | ---------- |
| 1 | `InitialAuthMigration` | สร้าง Users, RefreshTokens, LoginHistory |
| 2 | `RemovePasswordResetTokens` | ตัด password reset ออก (ย้ายไปใช้ flow ใหม่ภายหลัง) |
| 3 | `AddServiceChargeTable` | เพิ่ม ServiceCharges |
| 4 | `AddMenuTable` | เพิ่ม Menus |
| 5 | `UpdateMenuImageUrlToMax` | ขยาย ImageUrl field |
| 6 | `AddEmployeeTable` | เพิ่ม Employees |
| 7 | `StandardizeEntitySchema` | เพิ่ม Audit FK + Navigation properties |
| 8 | `StandardizeNamingConvention` | เปลี่ยนชื่อ columns ตามมาตรฐาน |
| 9 | `AddFileManagementSystem` | สร้าง TbFiles, เปลี่ยน ImageUrl → ImageFileId FK |
| 10 | `AddPositionBasedRbac` | สร้าง Positions, Permissions, Modules, AuthorizeMatrices |
| 11 | `ChangeTitleToEnum` | เปลี่ยน Title เป็น Enum |
| 12 | `AddShopSettingsTables` | สร้าง ShopSettings + ShopOperatingHours |
| 13 | `ExpandEmployeeModule` | เพิ่ม Address, Education, WorkHistory sub-entities |
| 14 | `RemoveEthnicityAndUpdateEnums` | ลบ Ethnicity field, อัพเดต Enums |
| 15 | `AddLockoutCountToUser` | เพิ่ม LockoutCount ใน TbUsers |
| 16 | `RemoveSeedUsers` | ลบ Seed data ของ Users |
| 17 | `AddFullTimeAndHourlyRate` | เพิ่ม FullTime flag + HourlyRate ใน Employee |
| 18 | `AddDateRangeToServiceCharge` | เพิ่ม StartDate/EndDate ใน ServiceCharge |
| 19 | `AddForgotPasswordTables` | สร้าง PasswordResetTokens + PasswordHistories |
| 20 | `AddShopEmailToShopSettings` | เพิ่ม Email field ใน ShopSettings |

---

## Endpoints ทั้งหมด (42 endpoints ใน 7 controllers)

### Auth Controller (`api/admin/auth`) — 7 endpoints

| Method | Endpoint | หน้าที่ |
| ------ | -------- | ------- |
| POST | `/api/admin/auth/login` | Login |
| POST | `/api/admin/auth/logout` | Logout |
| POST | `/api/admin/auth/refresh-token` | Refresh JWT |
| POST | `/api/admin/auth/forgot-password` | ส่ง OTP สำหรับ forgot password |
| POST | `/api/admin/auth/verify-otp` | ยืนยัน OTP |
| POST | `/api/admin/auth/reset-password` | ตั้งรหัสผ่านใหม่ |
| POST | `/api/admin/auth/verify-password` | ตรวจสอบรหัสผ่านปัจจุบัน |

### Positions Controller (`api/admin/positions`) — 10 endpoints

| Method | Endpoint | หน้าที่ |
| ------ | -------- | ------- |
| GET | `/api/admin/positions` | รายการตำแหน่งทั้งหมด |
| GET | `/api/admin/positions/{positionId}` | ตำแหน่งรายชิ้น |
| POST | `/api/admin/positions` | เพิ่มตำแหน่ง |
| PUT | `/api/admin/positions/{positionId}` | แก้ไขตำแหน่ง |
| DELETE | `/api/admin/positions/{positionId}` | ลบตำแหน่ง (soft) |
| GET | `/api/admin/positions/{positionId}/permissions` | ดูสิทธิ์ของตำแหน่ง |
| PUT | `/api/admin/positions/{positionId}/permissions` | อัพเดตสิทธิ์ของตำแหน่ง |
| GET | `/api/admin/positions/dropdown` | สำหรับ dropdown |
| GET | `/api/admin/positions/modules/tree` | โครงสร้าง Module tree |
| GET | `/api/admin/positions/me/permissions` | สิทธิ์ของ user ปัจจุบัน |

### Menus Controller (`api/menu`) — 8 endpoints

| Method | Endpoint | หน้าที่ |
| ------ | -------- | ------- |
| GET | `/api/menu` | รายการ menu ทั้งหมด |
| GET | `/api/menu/{menuId}` | Menu รายชิ้น |
| GET | `/api/menu/category/{category}` | Filter ตามหมวด |
| GET | `/api/menu/available` | เฉพาะที่เปิดขาย |
| GET | `/api/menu/search` | ค้นหาชื่อ menu |
| POST | `/api/menu` | เพิ่ม menu |
| PUT | `/api/menu/{menuId}` | แก้ไข menu |
| DELETE | `/api/menu/{menuId}` | ลบ menu (soft) |

### HumanResource Controller (`api/humanresource`) — 10+ endpoints

| Method | Endpoint | หน้าที่ |
| ------ | -------- | ------- |
| GET | `/api/humanresource` | รายการพนักงาน |
| GET | `/api/humanresource/{employeeId}` | พนักงานรายคน |
| GET | `/api/humanresource/status/{status}` | Filter ตามสถานะ |
| GET | `/api/humanresource/user/{userId}` | ค้นหาตาม userId |
| GET | `/api/humanresource/search` | ค้นหาชื่อ |
| GET | `/api/humanresource/me` | ข้อมูลพนักงานของ user ปัจจุบัน |
| POST | `/api/humanresource` | เพิ่มพนักงาน |
| PUT | `/api/humanresource/{employeeId}` | แก้ไขพนักงาน |
| DELETE | `/api/humanresource/{employeeId}` | ลบพนักงาน (soft) |
| POST | `/api/humanresource/{employeeId}/create-user` | สร้าง User Account ให้พนักงาน |
| — | + Addresses/Educations/WorkHistories CRUD | Sub-entity endpoints |

### ServiceCharges Controller (`api/admin/servicecharges`) — 6 endpoints

| Method | Endpoint | หน้าที่ |
| ------ | -------- | ------- |
| GET | `/api/admin/servicecharges` | รายการค่าบริการ |
| GET | `/api/admin/servicecharges/{serviceChargeId}` | ค่าบริการรายชิ้น |
| GET | `/api/admin/servicecharges/dropdown` | สำหรับ dropdown |
| POST | `/api/admin/servicecharges` | เพิ่มค่าบริการ |
| PUT | `/api/admin/servicecharges/{serviceChargeId}` | แก้ไขค่าบริการ |
| DELETE | `/api/admin/servicecharges/{serviceChargeId}` | ลบค่าบริการ (hard) |

### ShopSettings Controller (`api/admin/shop-settings`) — 4 endpoints

| Method | Endpoint | หน้าที่ |
| ------ | -------- | ------- |
| GET | `/api/admin/shop-settings` | ข้อมูลร้านทั้งหมด |
| GET | `/api/admin/shop-settings/branding` | Logo + QR Code |
| GET | `/api/admin/shop-settings/welcome` | ข้อมูลหน้า Welcome |
| PUT | `/api/admin/shop-settings` | อัพเดตข้อมูลร้าน |

### File Controller (`api/admin/file`) — 1 endpoint

| Method | Endpoint | หน้าที่ |
| ------ | -------- | ------- |
| GET | `/api/admin/file/{fileId}` | Download ไฟล์ |

---

## สิ่งที่ควรทำต่อ (เรียงตาม priority)

### Priority 1 — Order System

- [ ] **Order** — Entity + API + Frontend (สำคัญที่สุดสำหรับ POS)

### Priority 2 — Table Management

- [ ] **Table** — จัดการโต๊ะ (Entity + API + Frontend)

### Priority 3 — Payment

- [ ] **Payment** — ชำระเงิน + เชื่อมกับ Order (Entity + API + Frontend)

### Priority 4 — Kitchen Display

- [ ] **Kitchen Display** — SignalR hub เชื่อม Order → ครัว (real-time)

### Priority 5 — Profile

- [ ] **Profile** — แก้ข้อมูลส่วนตัว, เปลี่ยน password

### Priority 6 — Reports

- [ ] **Reports** — ยอดขาย, stock, สรุปรายวัน/รายเดือน

---

## Related Docs

- [Database & API Reference](../architecture/database-api-reference.md) — อ้างอิงตาราง, API Endpoints, ความสัมพันธ์ทั้งหมด
- [System Overview](../architecture/system-overview.md) — N-Tier Architecture, Data flow
- [Backend Guide](../development/backend-guide.md) — คู่มือพัฒนา Backend + 10-Step Workflow + Database Conventions
- [Frontend Guidelines](../development/frontend-guidelines.md) — Frontend patterns + DO/DON'T
- [Module Development Workflow](../development/module-development-workflow.md) — End-to-End 16 ขั้นตอน
- [File Management](../architecture/file-management.md) — สถาปัตยกรรม TbFile + S3 Storage
- [Design System](../architecture/design-system.md) — Tokens, Typography, Color system
- [Icon System](../architecture/icon-system.md) — GenericIcon + PrimeIcons
