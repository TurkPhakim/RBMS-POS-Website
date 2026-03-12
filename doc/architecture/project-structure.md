# RBMS-POS — โครงสร้างโปรเจคจริง

> อ้างอิงจากไฟล์ที่มีในโปรเจคจริง — อัปเดตล่าสุด 2026-03-11

---

## Root Level

```
RBMS-POS/
├── README.md                     ← Project overview + documentation index
├── CLAUDE.md                     ← Claude Code instructions
├── swagger-spec.json             ← OpenAPI snapshot (backup)
├── Backend-POS/
├── Frontend-POS/
└── doc/
```

---

## Backend

### Solution Structure

```
Backend-POS/
├── RBMS.POS.sln
├── SETUP_DATABASE.bat            ← รัน EF migration ครั้งแรก
└── POS.Main/
    ├── RBMS.POS.WebAPI/          ← Entry point (Controllers, Filters, Program.cs)
    ├── POS.Main.Business.Admin/  ← Service: Auth + ServiceCharge + File
    ├── POS.Main.Business.HumanResource/  ← Service: Employee
    ├── POS.Main.Business.Menu/   ← Service: Menu
    ├── POS.Main.Repositories/    ← Repository + UnitOfWork
    ├── POS.Main.Dal/             ← DbContext + Entities + Migrations
    └── POS.Main.Core/            ← Enums + Exceptions + Helpers + Models
```

> **หมายเหตุ**: Business Layer ถูก split เป็น 3 projects แยกตาม domain
> ไม่ใช่ project เดียว — เพิ่ม project ใหม่เมื่อสร้าง domain ใหม่

---

### RBMS.POS.WebAPI

```
RBMS.POS.WebAPI/
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── Controllers/
│   ├── BaseController.cs             ← abstract base: Success(), ListSuccess(), GetUserId()
│   ├── AuthController.cs             api/admin/auth — login, logout, refresh-token
│   ├── FileController.cs             api/admin/file — download file
│   ├── HumanResourceController.cs    api/humanresource — GET/POST/PUT/DELETE + search + filter
│   ├── MenusController.cs            api/menu — GET/POST/PUT/DELETE + category + available + search
│   └── ServiceChargesController.cs   api/admin/servicecharges — GET/POST/PUT/DELETE + dropdown
├── Filters/
│   └── GlobalExceptionFilter.cs      ← Exception → HTTP status mapping อัตโนมัติ
└── Hubs/
    └── OrderHub.cs                   ← SignalR Hub (stub — รอ Order Module)
```

---

### POS.Main.Business.Admin

```
POS.Main.Business.Admin/
├── Interfaces/
│   ├── IAuthService.cs
│   ├── IJwtTokenService.cs
│   ├── IServiceChargeService.cs
│   ├── IFileService.cs
│   └── IS3StorageService.cs
├── Services/
│   ├── AuthService.cs
│   ├── JwtTokenService.cs
│   ├── ServiceChargeService.cs
│   ├── FileService.cs
│   └── S3StorageService.cs
└── Models/
    ├── AdminSettings/
    │   ├── CreateServiceChargeRequestModel.cs
    │   ├── UpdateServiceChargeRequestModel.cs
    │   ├── ServiceChargeResponseModel.cs
    │   ├── ServiceChargeDropdownModel.cs
    │   └── ServiceChargeMapper.cs       ← Manual Mapper (static class)
    ├── Auth/
    │   ├── LoginRequestModel.cs
    │   ├── LoginResponseModel.cs
    │   ├── RefreshTokenRequestModel.cs
    │   ├── TokenResponseModel.cs
    │   ├── UserModel.cs
    │   └── AuthMapper.cs               ← Manual Mapper (static class)
    └── Files/
        ├── FileResponseModel.cs
        ├── FileDownloadResult.cs
        └── FileMapper.cs               ← Manual Mapper (static class)
```

---

### POS.Main.Business.HumanResource

```
POS.Main.Business.HumanResource/
├── Interfaces/
│   └── IEmployeeService.cs
├── Services/
│   └── EmployeeService.cs
└── Models/
    ├── CreateEmployeeRequestModel.cs
    ├── UpdateEmployeeRequestModel.cs
    ├── EmployeeResponseModel.cs
    └── EmployeeMapper.cs               ← Manual Mapper (static class)
```

---

### POS.Main.Business.Menu

```
POS.Main.Business.Menu/
├── Interfaces/
│   └── IMenuService.cs
├── Services/
│   └── MenuService.cs
└── Models/
    ├── CreateMenuRequestModel.cs
    ├── UpdateMenuRequestModel.cs
    ├── MenuResponseModel.cs
    └── MenuMapper.cs                   ← Manual Mapper (static class)
```

---

### POS.Main.Core

```
POS.Main.Core/
├── Constants/
│   └── constResultType.cs        "success" / "fail"
├── Enums/
│   ├── EUserRole.cs              Cashier=1, Manager=2, Admin=3
│   ├── EEmploymentStatus.cs      Active, Resigned, Terminated, Suspended
│   ├── EGender.cs                Male, Female, NotSpecified
│   └── EMenuCategory.cs          หมวดหมู่เมนูอาหาร
├── Exceptions/
│   ├── AuthenticationException.cs       ← base auth exception
│   ├── AccountLockedException.cs        ← 423 (บัญชีถูกล็อค)
│   ├── AccountDisabledException.cs      ← 403 (บัญชีถูกปิด)
│   ├── InvalidCredentialsException.cs   ← 401 (รหัสผ่านผิด)
│   ├── InvalidRefreshTokenException.cs  ← 401 (token ไม่ถูกต้อง)
│   ├── ValidationException.cs           ← 400 (input ผิด)
│   ├── EntityNotFoundException.cs       ← 404 (ไม่พบข้อมูล)
│   └── BusinessException.cs            ← 422 (business rule violated)
├── Helpers/
│   ├── IPasswordHasher.cs
│   └── PasswordHasher.cs         BCrypt implementation
└── Models/
    ├── BaseResponseModel.cs       ← BaseResponseModel<T> { Status, Result, Message, Code, Errors }
    ├── PaginationModel.cs         ← รับ params: Search, Page, ItemPerPage
    ├── PaginationResult.cs        ← PaginationResult<T> { Results, Page, Total, ItemPerPage }
    └── ListResponseModel.cs       ← ListResponseModel<T> { Results, TotalItems }
```

---

### POS.Main.Dal

```
POS.Main.Dal/
├── POSMainContext.cs              ← DbContext: 7 DbSets, SaveChanges override (auto-stamp audit)
├── Entities/
│   ├── BaseEntity.cs              ← abstract: CreatedAt/By, UpdatedAt/By, DeleteFlag/At/By + Navigation
│   ├── Auth/
│   │   ├── TbUser.cs              ← UserId(Guid), Username, Role, FailedLoginAttempts, LockedUntil
│   │   ├── TbRefreshToken.cs      ← ไม่ inherit BaseEntity (lifecycle เฉพาะ)
│   │   └── TbLoginHistory.cs      ← ไม่ inherit BaseEntity (log entity)
│   ├── Admin/
│   │   └── TbServiceCharge.cs     ← ServiceChargeId(int), Name, PercentageRate
│   ├── Common/
│   │   └── TbFile.cs              ← FileId(int), FileName, MimeType, FileExtension, FileSize, S3Key
│   ├── Menu/
│   │   └── TbMenu.cs              ← MenuId(int), NameThai, NameEnglish, Price, Category, ImageFileId(FK→TbFile)
│   └── HumanResource/
│       └── TbEmployee.cs          ← EmployeeId(int), Names, Gender, Status, Salary, ImageFileId(FK→TbFile)
├── EntityConfigurations/          ← Fluent API (1 file ต่อ 1 Entity)
│   ├── TbUserConfiguration.cs
│   ├── TbRefreshTokenConfiguration.cs
│   ├── TbLoginHistoryConfiguration.cs
│   ├── TbServiceChargeConfiguration.cs
│   ├── TbFileConfiguration.cs
│   ├── TbMenuConfiguration.cs
│   └── TbEmployeeConfiguration.cs
└── Migrations/
    ├── 20251102_InitialAuthMigration          Users, RefreshTokens, LoginHistory
    ├── 20251102_RemovePasswordResetTokens     ตัด PasswordResetTokens ออก
    ├── 20251103_AddServiceChargeTable         ServiceCharges
    ├── 20251103_AddMenuTable                  Menus
    ├── 20251104_UpdateMenuImageUrlToMax       ขยาย ImageUrl
    ├── 20251104_AddEmployeeTable              Employees
    ├── 20260310_StandardizeEntitySchema       เพิ่ม Audit FK + Navigation properties
    ├── 20260310_StandardizeNamingConvention    เปลี่ยนชื่อ columns ตามมาตรฐาน
    └── 20260310_AddFileManagementSystem       TbFiles table + ImageUrl → ImageFileId
```

---

### POS.Main.Repositories

```
POS.Main.Repositories/
├── Interfaces/
│   ├── IGenericRepository.cs       ← base: 13 methods (GetAll, GetById(int/Guid), Add, Update, Delete ฯลฯ)
│   ├── IUserRepository.cs          GetByUsernameAsync
│   ├── IRefreshTokenRepository.cs
│   ├── ILoginHistoryRepository.cs
│   ├── IServiceChargeRepository.cs  IsNameExistsAsync, GetActiveForDropdownAsync
│   ├── IFileRepository.cs            IGenericRepository<TbFile>
│   ├── IMenuRepository.cs           GetByCategoryAsync, GetAvailableMenusAsync, SearchByNameAsync
│   └── IEmployeeRepository.cs       GetByEmploymentStatusAsync, GetByUserIdAsync, SearchAsync
├── Implementations/
│   ├── GenericRepository.cs
│   ├── UserRepository.cs
│   ├── RefreshTokenRepository.cs
│   ├── LoginHistoryRepository.cs
│   ├── ServiceChargeRepository.cs
│   ├── FileRepository.cs
│   ├── MenuRepository.cs
│   └── EmployeeRepository.cs
└── UnitOfWork/
    ├── IUnitOfWork.cs       ← Users, RefreshTokens, LoginHistory, ServiceCharges, Files, Menus, Employees + CommitAsync
    └── UnitOfWork.cs        ← Lazy initialization pattern
```

---

## Frontend

### Config Files (root)

```
RBMS-POS-Client/
├── angular.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── ng-openapi-gen.json       ← config สำหรับ generate API client
├── swagger.json              ← OpenAPI spec snapshot (input ของ gen-api)
├── fix-api-exports.js        ← script แก้ export type หลัง gen-api
└── _templates/
    └── api-config.provider.ts  ← เก็บไว้ restore หลัง gen-api เขียนทับ
```

---

### src/app/

```
src/app/
├── app.module.ts             ← root module, register providers
├── app-routing.module.ts     ← main routing (lazy load ทุก feature)
├── app.component.ts
│
├── core/                     ← singleton services ใช้ทั่วทั้ง app
│   ├── api/                  ← AUTO-GENERATED จาก swagger (ห้ามแก้ด้วยมือ)
│   │   ├── api-config.provider.ts    ← MANUAL: กำหนด rootUrl จาก environment
│   │   ├── api-configuration.ts
│   │   ├── models/           ← TypeScript interfaces
│   │   ├── services/         ← 4 API services: auth, human-resource, menus, service-charges
│   │   └── fn/               ← function-based API calls (ใช้โดย services)
│   ├── guards/
│   │   ├── auth.guard.ts     ← redirect ไป login ถ้าไม่มี token
│   │   └── role.guard.ts     ← block ถ้า role ไม่ตรง
│   ├── interceptors/
│   │   └── auth.interceptor.ts  ← inject Bearer token, handle 401 → refresh
│   ├── models/
│   │   └── auth.models.ts    ← LoginRequest, LoginResponse, User interfaces
│   └── services/
│       ├── auth.service.ts   ← app-level: เก็บ token/user state, login/logout
│       └── sidebar.service.ts
│
├── layouts/
│   ├── layout-routing.module.ts
│   ├── layouts.module.ts
│   └── main-layout/
│       └── main-layout.component.ts  ← Header + Sidebar + Router outlet
│
├── shared/
│   ├── shared.module.ts
│   ├── component-interfaces.ts  ← UI interfaces (CurrentUser, MenuItem, BreadcrumbItem ฯลฯ)
│   ├── components/
│   │   ├── header/           ← top bar พร้อม toggle, profile, logout
│   │   ├── side-bar/         ← navigation menu ทุก module
│   │   ├── top-breadcrumb/   ← breadcrumb แสดงตำแหน่งปัจจุบัน
│   │   └── generic-icon/     ← SVG icon component (currentColor + cache)
│   ├── modals/
│   │   ├── confirm-modal/    ← delete/warning confirmation
│   │   ├── success-modal/    ← success feedback
│   │   └── error-modal/      ← error feedback
│   ├── pages/
│   │   └── welcome/          ← หน้าแรกหลัง login
│   └── pipes/
│       └── national-id-mask.pipe.ts
│
└── features/                 ← Lazy-loaded modules (10 modules)
    ├── auths/                route: /auth/login      ← PUBLIC
    ├── dashboard/            route: /dashboard
    ├── admin/                route: /admin-setting   ← ServiceCharge
    ├── human-resource/       route: /hr              ← Employee CRUD
    ├── menu/                 route: /menu            ← Menu CRUD
    ├── order/                route: /order           ⚠️ stub
    ├── table/                route: /table           ⚠️ stub
    ├── payment/              route: /payment         ⚠️ stub
    ├── kitchen-display/      route: /kitchen-display ⚠️ stub
    └── profile/              route: /profile         ⚠️ stub
```

---

### Feature Module Structure (pattern)

แต่ละ feature module ใช้โครงสร้างนี้:

```
features/[module-name]/
├── [module].module.ts          NgModule declaration
├── [module]-routing.module.ts  Routes ภายใน module
└── pages/
    ├── [entity]-list/
    │   └── [entity]-list.component.ts
    └── [entity]-manage/
        └── [entity]-manage.component.ts
```

---

## doc/

```
doc/
├── agents/
│   ├── system-analyst.md       ← SA Agent spec
│   ├── backend-expert.md       ← Backend Agent spec
│   ├── frontend-expert.md      ← Frontend Agent spec (+ UX/UI)
│   └── code-reviewer.md        ← Code Review Agent spec
├── architecture/
│   ├── project-structure.md        ← ไฟล์นี้
│   ├── system-overview.md          ← N-Tier pattern, Data flow
│   ├── design-system.md            ← Color tokens, Typography, Icons
│   ├── icon-system.md              ← ระบบ Icon (GenericIcon + PrimeIcons)
│   ├── file-management.md          ← สถาปัตยกรรมการจัดการไฟล์ (TbFile + S3)
│   └── database-api-reference.md   ← อ้างอิงตาราง, API, ความสัมพันธ์
├── development/
│   ├── quick-start.md          ← รันโปรเจคครั้งแรก
│   ├── module-development-workflow.md ← End-to-End 16 ขั้นตอน
│   ├── backend-guide.md        ← 10-Step Workflow + Database Conventions
│   ├── backend-coding-standards.md ← DO/DON'T ทุก layer
│   ├── frontend-guidelines.md  ← Frontend patterns
│   ├── frontend-coding-standards.md ← DO/DON'T Frontend
│   └── ai-prompting-guide.md   ← คู่มือ AI Agents + prompt templates
├── features/
│   └── project-status.md       ← สถานะปัจจุบัน, Endpoints, next steps
└── tasks/
    ├── README.md               ← รูปแบบ Task tracking
    ├── TASK-ui-redesign.md     ← Task: UI Redesign
    ├── TASK-backend-patterns.md ← Task: Reusable Backend Patterns
    └── TASK-file-management.md ← Task: File Management System
```

---

## Entity Summary

### Entity ที่ inherit BaseEntity (มี audit + soft delete)

| Entity | PK | Domain | Fields สำคัญ |
|--------|----|--------|-------------|
| `TbUser` | `UserId` (Guid) | Auth | Username, Role, IsActive, FailedLoginAttempts, LockedUntil |
| `TbServiceCharge` | `ServiceChargeId` (int) | Admin | Name, PercentageRate, IsActive |
| `TbFile` | `FileId` (int) | Common | FileName, MimeType, FileExtension, FileSize, S3Key |
| `TbMenu` | `MenuId` (int) | Menu | NameThai, NameEnglish, Price, Category, ImageFileId(FK→TbFile), IsAvailable |
| `TbEmployee` | `EmployeeId` (int) | HR | Names, Gender, Status, Salary, ImageFileId(FK→TbFile), UserId(FK→TbUser) |

### Entity ที่ไม่ inherit BaseEntity (lifecycle เฉพาะ)

| Entity | PK | Domain | เหตุผล |
|--------|----|--------|--------|
| `TbRefreshToken` | `RefreshTokenId` (Guid) | Auth | มี expiry, revoke — ไม่ต้อง soft delete |
| `TbLoginHistory` | `LoginHistoryId` (Guid) | Auth | Log entity — ไม่ต้อง audit/delete |

### BaseEntity Fields (ทุก Entity ที่ inherit)

```
CreatedAt (DateTime)         — auto-stamp เมื่อ Add
CreatedBy (int?, FK→TbEmployee)  — auto-stamp จาก JWT
UpdatedAt (DateTime?)        — auto-stamp เมื่อ Modified
UpdatedBy (int?, FK→TbEmployee)  — auto-stamp จาก JWT
DeleteFlag (bool)            — soft delete flag
DeletedAt (DateTime?)        — auto-stamp เมื่อ DeleteFlag = true
DeletedBy (int?)             — auto-stamp จาก JWT
CreatedByEmployee (nav)      — Navigation → TbEmployee
UpdatedByEmployee (nav)      — Navigation → TbEmployee
```

---

## Related Docs

- [project-status.md](../features/project-status.md) — สิ่งที่ทำงานได้จริง vs ยังขาด
- [system-overview.md](system-overview.md) — N-Tier architecture + data flow
- [backend-guide.md](../development/backend-guide.md) — คู่มือพัฒนา Backend + 10-Step Workflow
- [file-management.md](file-management.md) — สถาปัตยกรรมการจัดการไฟล์
