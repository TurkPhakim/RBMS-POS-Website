# RBMS-POS — โครงสร้างโปรเจคจริง

> อ้างอิงจากไฟล์ที่มีในโปรเจคจริง — อัปเดตล่าสุด 2026-03-16

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
    ├── RBMS.POS.WebAPI/              ← Entry point (Controllers, Filters, Hubs, Program.cs)
    ├── POS.Main.Business.Admin/      ← Service: Auth, ServiceCharge, ShopSettings, File, S3, JWT, ReCaptcha, Email
    ├── POS.Main.Business.Authorization/ ← Service: Position, Permission
    ├── POS.Main.Business.HumanResource/ ← Service: Employee + sub-entities (Address, Education, WorkHistory)
    ├── POS.Main.Business.Menu/       ← Service: Menu
    ├── POS.Main.Repositories/        ← Repository + UnitOfWork
    ├── POS.Main.Dal/                 ← DbContext + Entities + Migrations
    └── POS.Main.Core/                ← Enums + Exceptions + Helpers + Models + Constants + Settings
```

> **หมายเหตุ**: Business Layer ถูก split เป็น 4 projects แยกตาม domain
> ไม่ใช่ project เดียว — เพิ่ม project ใหม่เมื่อสร้าง domain ใหม่

---

### RBMS.POS.WebAPI

```
RBMS.POS.WebAPI/
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── Controllers/
│   ├── BaseController.cs              ← abstract base: Success<T>(), Success(), ListSuccess<T>(), PagedSuccess<T>(), GetIpAddress(), GetUserId()
│   ├── AuthController.cs             api/admin/auth — login, logout, refresh-token, forgot-password, verify-otp, reset-password
│   ├── FileController.cs             api/admin/file — download file
│   ├── HumanResourceController.cs    api/humanresource — GET/POST/PUT/DELETE + search + filter + my-profile
│   ├── MenusController.cs            api/menu — GET/POST/PUT/DELETE + category + available + search
│   ├── ServiceChargesController.cs   api/admin/servicecharges — GET/POST/PUT/DELETE + dropdown
│   ├── ShopSettingsController.cs     api/admin/shop-settings — GET/PUT + branding + welcome-info
│   └── PositionsController.cs        api/admin/positions — GET/POST/PUT/DELETE + dropdown + permissions
├── Filters/
│   ├── GlobalExceptionFilter.cs           ← Exception → HTTP status mapping อัตโนมัติ
│   ├── PermissionAuthorizeAttribute.cs    ← Permission-based authorization
│   └── CustomOperationIdFilter.cs         ← Auto-generate Swagger operationId ({Controller}_{Action}_{Method})
└── Hubs/
    └── OrderHub.cs                        ← SignalR Hub (stub — รอ Order Module)
```

---

### POS.Main.Business.Admin

```
POS.Main.Business.Admin/
├── Interfaces/
│   ├── IAuthService.cs
│   ├── IJwtTokenService.cs
│   ├── IS3StorageService.cs
│   ├── IFileService.cs
│   ├── IServiceChargeService.cs
│   ├── IShopSettingsService.cs
│   └── IReCaptchaService.cs
├── Services/
│   ├── AuthService.cs
│   ├── JwtTokenService.cs
│   ├── S3StorageService.cs
│   ├── FileService.cs
│   ├── ServiceChargeService.cs
│   ├── ShopSettingsService.cs
│   └── ReCaptchaService.cs
└── Models/
    ├── AdminSettings/
    │   ├── CreateServiceChargeRequestModel.cs
    │   ├── UpdateServiceChargeRequestModel.cs
    │   ├── ServiceChargeResponseModel.cs
    │   ├── ServiceChargeDropdownModel.cs
    │   └── ServiceChargeMapper.cs          ← Manual Mapper (static class)
    ├── Auth/
    │   ├── LoginRequestModel.cs
    │   ├── LoginResponseModel.cs
    │   ├── RefreshTokenRequestModel.cs
    │   ├── TokenResponseModel.cs
    │   ├── UserModel.cs
    │   ├── ForgotPasswordRequestModel.cs
    │   ├── ForgotPasswordResponseModel.cs
    │   ├── VerifyOtpRequestModel.cs
    │   ├── VerifyOtpResponseModel.cs
    │   ├── ResetPasswordRequestModel.cs
    │   ├── VerifyPasswordRequestModel.cs
    │   └── AuthMapper.cs                  ← Manual Mapper (static class)
    ├── Files/
    │   ├── FileResponseModel.cs
    │   ├── FileDownloadResult.cs
    │   └── FileMapper.cs                  ← Manual Mapper (static class)
    └── ShopSettings/
        ├── UpdateShopSettingsRequestModel.cs
        ├── ShopSettingsResponseModel.cs
        ├── ShopBrandingResponseModel.cs
        ├── WelcomeShopInfoResponseModel.cs
        ├── OperatingHourModel.cs
        └── ShopSettingsMapper.cs          ← Manual Mapper (static class)
```

---

### POS.Main.Business.Authorization

```
POS.Main.Business.Authorization/
├── Interfaces/
│   ├── IPositionService.cs
│   └── IPermissionService.cs
├── Services/
│   ├── PositionService.cs
│   └── PermissionService.cs
└── Models/
    ├── Position/
    │   ├── CreatePositionRequestModel.cs
    │   ├── UpdatePositionRequestModel.cs
    │   ├── PositionResponseModel.cs
    │   ├── PositionDropdownModel.cs
    │   └── PositionMapper.cs              ← Manual Mapper (static class)
    └── Permission/
        ├── ModuleTreeResponseModel.cs
        ├── PermissionMatrixResponseModel.cs
        └── UpdatePermissionsRequestModel.cs
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
    ├── MyProfileResponseModel.cs
    ├── EmployeeMapper.cs                  ← Manual Mapper (static class)
    ├── CreateUserAccountResponseModel.cs
    ├── Address/                            ← Address sub-entity models
    ├── Education/                          ← Education sub-entity models
    └── WorkHistory/                        ← WorkHistory sub-entity models
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
    └── MenuMapper.cs                      ← Manual Mapper (static class)
```

---

### POS.Main.Core

```
POS.Main.Core/
├── Constants/
│   ├── constResultType.cs          "success" / "fail"
│   └── Permissions.cs              Nested static classes (permission codes)
├── Enums/
│   ├── EGender.cs                  Male, Female, NotSpecified
│   ├── ETitle.cs                   นาย, นาง, นางสาว ฯลฯ
│   ├── EEmploymentStatus.cs        Active, Resigned, Terminated, Suspended
│   ├── EMenuCategory.cs            หมวดหมู่เมนูอาหาร
│   ├── EDayOfWeek.cs               วันในสัปดาห์
│   ├── EAddressType.cs             ประเภทที่อยู่
│   ├── ENationality.cs             สัญชาติ
│   └── EReligion.cs                ศาสนา
├── Exceptions/
│   ├── AuthenticationException.cs         ← base auth exception
│   ├── AccountLockedException.cs          ← 423 (บัญชีถูกล็อค)
│   ├── AccountDisabledException.cs        ← 403 (บัญชีถูกปิด)
│   ├── InvalidCredentialsException.cs     ← 401 (รหัสผ่านผิด)
│   ├── InvalidRefreshTokenException.cs    ← 401 (token ไม่ถูกต้อง)
│   ├── ValidationException.cs             ← 400 (input ผิด)
│   ├── EntityNotFoundException.cs         ← 404 (ไม่พบข้อมูล)
│   └── BusinessException.cs              ← 422 (business rule violated)
├── Helpers/
│   ├── IPasswordHasher.cs
│   └── PasswordHasher.cs           BCrypt implementation
├── Interfaces/
│   └── IEmailService.cs            ← Email service interface (implement ใน Business.Admin)
├── Settings/
│   ├── JwtSettings.cs              ← JWT configuration
│   ├── S3Settings.cs               ← S3 storage configuration
│   └── ReCaptchaSettings.cs        ← Google ReCaptcha configuration
└── Models/
    ├── BaseResponseModel.cs         ← BaseResponseModel<T> { Status, Result, Message, Code, Errors }
    ├── PaginationModel.cs           ← รับ params: Search, Page, ItemPerPage
    ├── PaginationResult.cs          ← PaginationResult<T> { Results, Page, Total, ItemPerPage }
    ├── ListResponseModel.cs         ← ListResponseModel<T> { Results, TotalItems }
    └── SmtpSettings.cs              ← SMTP email configuration
```

---

### POS.Main.Dal

```
POS.Main.Dal/
├── POSMainContext.cs              ← DbContext: 19 DbSets, SaveChanges override (auto-stamp audit), Global Query Filter
├── Entities/
│   ├── BaseEntity.cs              ← abstract: CreatedAt/By, UpdatedAt/By, DeleteFlag/At/By + Navigation
│   ├── Auth/
│   │   ├── TbUser.cs              ← UserId(Guid), Username, Email, PasswordHash, IsActive, FailedLoginAttempts, LockoutCount, LockedUntil
│   │   ├── TbRefreshToken.cs      ← ไม่ inherit BaseEntity (lifecycle เฉพาะ)
│   │   ├── TbLoginHistory.cs      ← ไม่ inherit BaseEntity (log entity)
│   │   ├── TbPasswordResetToken.cs ← ไม่ inherit BaseEntity (OTP lifecycle)
│   │   └── TbPasswordHistory.cs   ← ไม่ inherit BaseEntity (password log)
│   ├── Admin/
│   │   ├── TbServiceCharge.cs     ← ServiceChargeId(int), Name, PercentageRate, IsActive, StartDate?, EndDate?
│   │   ├── TbShopSettings.cs      ← ShopSettingsId(int), ShopNameThai/English, TaxId, FoodType, LogoFileId?, PaymentQrCodeFileId?
│   │   └── TbShopOperatingHour.cs ← ShopOperatingHourId(int), ShopSettingsId FK, EDayOfWeek, IsOpen, OpenTime/CloseTime
│   ├── Common/
│   │   └── TbFile.cs              ← FileId(int), FileName, MimeType, FileExtension, FileSize, S3Key
│   ├── Menu/
│   │   └── TbMenu.cs              ← MenuId(int), NameThai, NameEnglish, Price, EMenuCategory, ImageFileId?
│   ├── HumanResource/
│   │   ├── TbEmployee.cs          ← EmployeeId(int), Names, ETitle?, EGender, PositionId?, ImageFileId?, UserId?, IsFullTime, Salary?, HourlyRate?
│   │   ├── TbEmployeeAddress.cs   ← EmployeeAddressId(int), EmployeeId FK, EAddressType, HouseNumber, Province ฯลฯ
│   │   ├── TbEmployeeEducation.cs ← EmployeeEducationId(int), EmployeeId FK, EducationLevel, Major?, Institution, Gpa?
│   │   └── TbEmployeeWorkHistory.cs ← EmployeeWorkHistoryId(int), EmployeeId FK, Workplace, Position?, StartDate, EndDate?
│   └── Authorization/
│       ├── TbmPosition.cs         ← PositionId(int), PositionName, Description?, IsActive
│       ├── TbmPermission.cs       ← PermissionId(int), PermissionName, PermissionCode, SortOrder
│       ├── TbmModule.cs           ← ModuleId(int), ModuleName, ModuleCode, ParentModuleId? (self-ref), SortOrder, IsActive
│       ├── TbmAuthorizeMatrix.cs  ← AuthorizeMatrixId(int), ModuleId FK, PermissionId FK, PermissionPath
│       └── TbAuthorizeMatrixPosition.cs ← AuthorizeMatrixPositionId(int), AuthorizeMatrixId FK, PositionId FK
├── EntityConfigurations/          ← Fluent API (1 ไฟล์ต่อ 1 Entity — 19 ไฟล์)
│   ├── TbUserConfiguration.cs
│   ├── TbRefreshTokenConfiguration.cs
│   ├── TbLoginHistoryConfiguration.cs
│   ├── TbPasswordResetTokenConfiguration.cs
│   ├── TbPasswordHistoryConfiguration.cs
│   ├── TbServiceChargeConfiguration.cs
│   ├── TbShopSettingsConfiguration.cs
│   ├── TbShopOperatingHourConfiguration.cs
│   ├── TbFileConfiguration.cs
│   ├── TbMenuConfiguration.cs
│   ├── TbEmployeeConfiguration.cs
│   ├── TbEmployeeAddressConfiguration.cs
│   ├── TbEmployeeEducationConfiguration.cs
│   ├── TbEmployeeWorkHistoryConfiguration.cs
│   ├── TbmPositionConfiguration.cs
│   ├── TbmPermissionConfiguration.cs
│   ├── TbmModuleConfiguration.cs
│   ├── TbmAuthorizeMatrixConfiguration.cs
│   └── TbAuthorizeMatrixPositionConfiguration.cs
└── Migrations/                    ← 20 migrations
    ├── InitialAuthMigration                  ← Users, RefreshTokens, LoginHistory
    ├── RemovePasswordResetTokens             ← ตัด PasswordResetTokens ออก
    ├── AddServiceChargeTable                 ← ServiceCharges
    ├── AddMenuTable                          ← Menus
    ├── UpdateMenuImageUrlToMax               ← ขยาย ImageUrl
    ├── AddEmployeeTable                      ← Employees
    ├── StandardizeEntitySchema               ← เพิ่ม Audit FK + Navigation properties
    ├── StandardizeNamingConvention            ← เปลี่ยนชื่อ columns ตามมาตรฐาน
    ├── AddFileManagementSystem               ← TbFiles table + ImageUrl → ImageFileId
    ├── AddPositionBasedRbac                  ← TbmPosition, TbmPermission, TbmModule, TbmAuthorizeMatrix, TbAuthorizeMatrixPosition
    ├── ChangeTitleToEnum                     ← Title เปลี่ยนเป็น ETitle enum
    ├── AddShopSettingsTables                 ← TbShopSettings, TbShopOperatingHour
    ├── ExpandEmployeeModule                  ← TbEmployeeAddress, TbEmployeeEducation, TbEmployeeWorkHistory
    ├── RemoveEthnicityAndUpdateEnums         ← ลบ Ethnicity + อัพเดต enums
    ├── AddLockoutCountToUser                 ← เพิ่ม LockoutCount ใน TbUser
    ├── RemoveSeedUsers                       ← ลบ seed users
    ├── AddFullTimeAndHourlyRate              ← เพิ่ม IsFullTime, HourlyRate ใน TbEmployee
    ├── AddDateRangeToServiceCharge           ← เพิ่ม StartDate, EndDate ใน TbServiceCharge
    ├── AddForgotPasswordTables               ← TbPasswordResetToken, TbPasswordHistory
    └── AddShopEmailToShopSettings            ← เพิ่ม ShopEmail ใน TbShopSettings
```

---

### POS.Main.Repositories

```
POS.Main.Repositories/
├── Interfaces/
│   ├── IGenericRepository.cs             ← base: GetAll, GetById(int/Guid), Add, Update, Delete ฯลฯ
│   ├── IUserRepository.cs
│   ├── IRefreshTokenRepository.cs
│   ├── ILoginHistoryRepository.cs
│   ├── IPasswordResetTokenRepository.cs
│   ├── IPasswordHistoryRepository.cs
│   ├── IServiceChargeRepository.cs
│   ├── IFileRepository.cs
│   ├── IMenuRepository.cs
│   ├── IEmployeeRepository.cs
│   ├── IEmployeeAddressRepository.cs
│   ├── IEmployeeEducationRepository.cs
│   ├── IEmployeeWorkHistoryRepository.cs
│   ├── IPositionRepository.cs
│   ├── IModuleRepository.cs
│   ├── IAuthorizeMatrixRepository.cs
│   ├── IAuthorizeMatrixPositionRepository.cs
│   └── IShopSettingsRepository.cs
├── Implementations/
│   ├── GenericRepository.cs
│   ├── UserRepository.cs
│   ├── RefreshTokenRepository.cs
│   ├── LoginHistoryRepository.cs
│   ├── PasswordResetTokenRepository.cs
│   ├── PasswordHistoryRepository.cs
│   ├── ServiceChargeRepository.cs
│   ├── FileRepository.cs
│   ├── MenuRepository.cs
│   ├── EmployeeRepository.cs
│   ├── EmployeeAddressRepository.cs
│   ├── EmployeeEducationRepository.cs
│   ├── EmployeeWorkHistoryRepository.cs
│   ├── PositionRepository.cs
│   ├── ModuleRepository.cs
│   ├── AuthorizeMatrixRepository.cs
│   ├── AuthorizeMatrixPositionRepository.cs
│   └── ShopSettingsRepository.cs
└── UnitOfWork/
    ├── IUnitOfWork.cs       ← 17 repository properties + CommitAsync()
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
└── fix-api-exports.js        ← script แก้ export type หลัง gen-api
```

---

### src/app/

```
src/app/
├── app.module.ts             ← root module: BrowserModule, NgRx StoreModule.forRoot, HttpClientModule, SharedModule, PrimeNG config
├── app-routing.module.ts     ← main routing: '' → LayoutsModule
├── app.component.ts
│
├── store/
│   └── layout/               ← NgRx: layoutReducer, layout.actions, layout.selectors (sidebar, notification, buttons)
│
├── core/                     ← singleton services ใช้ทั่วทั้ง app
│   ├── api/                  ← AUTO-GENERATED จาก swagger (ห้ามแก้ด้วยมือ)
│   │   ├── api-configuration.ts
│   │   ├── models/           ← TypeScript interfaces (generated)
│   │   ├── services/         ← 7 API services: auth, human-resource, menus, service-charges, positions, shop-settings, file
│   │   └── fn/               ← function-based API calls (ใช้โดย services)
│   ├── providers/            ← Manual providers (ไม่ถูก gen-api overwrite)
│   │   └── api-config.provider.ts  ← กำหนด rootUrl จาก environment
│   ├── guards/
│   │   ├── auth.guard.ts         ← redirect ไป login ถ้าไม่มี token
│   │   ├── guest.guard.ts        ← redirect ไป dashboard ถ้ามี token แล้ว
│   │   └── permission.guard.ts   ← block ถ้าไม่มี permission ที่ต้องการ
│   ├── interceptors/
│   │   ├── auth.interceptor.ts      ← inject Bearer token, handle 401 → refresh
│   │   └── loading.interceptor.ts   ← global loading state
│   ├── models/
│   │   └── auth.models.ts    ← LoginRequest, LoginResponse, User interfaces
│   └── services/
│       ├── auth.service.ts            ← เก็บ token/user state, login/logout
│       ├── breadcrumb.service.ts      ← จัดการ breadcrumb items + action buttons
│       ├── modal.service.ts           ← Programmatic dialogs (info, cancel, commonSuccess)
│       ├── loading.service.ts         ← Global loading state
│       ├── session-timeout.service.ts ← จัดการ session timeout
│       ├── shop-branding.service.ts   ← โหลด shop logo/branding
│       ├── header.service.ts          ← Header state management
│       └── sidebar.service.ts         ← Sidebar state management
│
├── layouts/
│   ├── layouts.module.ts
│   ├── layout-routing.module.ts
│   ├── main-layout/
│   │   └── main-layout.component.ts  ← Header + Sidebar + Router outlet
│   └── auth-layout/
│       └── auth-layout.component.ts   ← Login/Reset password layout
│
├── shared/
│   ├── shared.module.ts               ← PrimeNG modules, common declarations
│   ├── component-interfaces.ts        ← CurrentUser, MenuItem, BreadcrumbItem, Pbutton, BreadcrumbButton, SelectOption ฯลฯ
│   ├── components/
│   │   ├── generic-icon/              ← SVG icon component (currentColor + cache)
│   │   ├── header/                    ← top bar: toggle, profile, logout
│   │   ├── side-bar/                  ← navigation menu ทุก module
│   │   ├── top-breadcrumb/            ← breadcrumb แสดงตำแหน่งปัจจุบัน + action buttons
│   │   ├── global-loading/            ← Global loading spinner
│   │   └── notification-panel/        ← Notification panel
│   ├── cards/
│   │   ├── card-template/             ← Card layout มาตรฐาน (headerLabel, ng-content, p-footer)
│   │   ├── section-card/              ← Section grouping card
│   │   ├── empty-view/                ← Empty state placeholder
│   │   ├── image-upload-card/         ← Image upload card (S3)
│   │   ├── field-error/               ← Validation error display (dirty-only)
│   │   └── audit-footer/              ← แสดง CreatedBy/At, UpdatedBy/At
│   ├── dialogs/
│   │   ├── address-dialog/            ← Dialog เพิ่ม/แก้ไขที่อยู่
│   │   ├── education-dialog/          ← Dialog เพิ่ม/แก้ไขประวัติการศึกษา
│   │   ├── work-history-dialog/       ← Dialog เพิ่ม/แก้ไขประวัติการทำงาน
│   │   ├── session-timeout/           ← Session timeout warning dialog
│   │   └── verify-password-dialog/    ← Dialog ยืนยันรหัสผ่าน
│   ├── modals/
│   │   ├── info-modal/                ← Confirm dialog (ModalService.info)
│   │   ├── cancel-modal/              ← Error dialog (ModalService.cancel)
│   │   └── success-modal/             ← Success feedback auto-close (ModalService.commonSuccess)
│   ├── dropdowns/
│   │   ├── dropdown-base.component.ts ← ControlValueAccessor base class
│   │   ├── active-status/             ← Dropdown สถานะ Active/Inactive
│   │   ├── gender/                    ← Dropdown เพศ
│   │   ├── title/                     ← Dropdown คำนำหน้า
│   │   ├── nationality/               ← Dropdown สัญชาติ
│   │   ├── religion/                  ← Dropdown ศาสนา
│   │   ├── address-type/              ← Dropdown ประเภทที่อยู่
│   │   ├── position/                  ← Dropdown ตำแหน่งงาน (API)
│   │   ├── menu-category/             ← Dropdown หมวดหมู่เมนู
│   │   └── service-charge/            ← Dropdown ค่าบริการ (API)
│   ├── pipes/
│   │   ├── date-format.pipe.ts        ← แปลงวันที่เป็นรูปแบบไทย
│   │   ├── mask-phone.pipe.ts         ← ซ่อนเลขโทรศัพท์
│   │   └── national-id-mask.pipe.ts   ← ซ่อนเลขบัตรประชาชน
│   ├── pages/
│   │   ├── welcome/                   ← หน้าแรกหลัง login
│   │   └── access-denied/             ← หน้าไม่มีสิทธิ์เข้าถึง
│   ├── directives/
│   │   └── datepicker-icon.directive.ts ← Custom icon สำหรับ PrimeNG DatePicker
│   └── utils/
│       ├── form-utils.ts              ← markFormDirty(), linkDateRange()
│       └── index.ts                   ← barrel export
│
└── features/                 ← Lazy-loaded modules (10 modules)
    ├── auths/                route: /auth/login, /auth/reset-password      ← PUBLIC
    │   ├── auths.module.ts
    │   ├── auths-routing.module.ts
    │   ├── pages/
    │   │   ├── login/
    │   │   └── reset-password/
    │   └── dialogs/
    │       ├── forgot-password-dialog/
    │       └── verify-otp-dialog/
    ├── admin/                route: /admin-setting
    │   ├── admin.module.ts
    │   ├── admin-routing.module.ts
    │   └── pages/
    │       ├── service-charge-list/
    │       ├── service-charge-manage/
    │       ├── position-list/
    │       ├── position-manage/
    │       └── shop-settings/
    ├── human-resource/       route: /human-resource
    │   ├── human-resource.module.ts
    │   ├── human-resource-routing.module.ts
    │   ├── pages/
    │   │   ├── employee-list/
    │   │   └── employee-manage/
    │   └── dialogs/
    │       ├── create-user-dialog/
    │       └── credentials-dialog/
    ├── menu/                 route: /menu
    │   ├── menu.module.ts
    │   ├── menu-routing.module.ts
    │   └── pages/
    │       ├── menu-list/
    │       └── menu-manage/
    ├── dashboard/            route: /dashboard
    │   └── pages/
    │       └── dashboard/
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
├── pages/
│   ├── [entity]-list/
│   │   └── [entity]-list.component.ts
│   └── [entity]-manage/
│       └── [entity]-manage.component.ts
└── dialogs/                    (ถ้ามี)
    └── [dialog-name]/
        └── [dialog-name].component.ts
```

---

## Entity Summary

### Entity ที่ inherit BaseEntity (มี audit + soft delete)

| Entity | PK | Domain | Fields สำคัญ |
|--------|----|--------|-------------|
| `TbUser` | `UserId` (Guid) | Auth | Username, Email, PasswordHash, IsActive, FailedLoginAttempts, LockoutCount, LockedUntil |
| `TbServiceCharge` | `ServiceChargeId` (int) | Admin | Name, PercentageRate, IsActive, StartDate?, EndDate? |
| `TbShopSettings` | `ShopSettingsId` (int) | Admin | ShopNameThai/English, TaxId, FoodType, LogoFileId?, PaymentQrCodeFileId? |
| `TbShopOperatingHour` | `ShopOperatingHourId` (int) | Admin | ShopSettingsId FK, EDayOfWeek, IsOpen, OpenTime1/CloseTime1/OpenTime2/CloseTime2 |
| `TbFile` | `FileId` (int) | Common | FileName, MimeType, FileExtension, FileSize, S3Key |
| `TbMenu` | `MenuId` (int) | Menu | NameThai, NameEnglish, Price, EMenuCategory, ImageFileId? |
| `TbEmployee` | `EmployeeId` (int) | HR | Names, ETitle?, EGender, PositionId?, ImageFileId?, UserId?, IsFullTime, Salary?, HourlyRate? |
| `TbEmployeeAddress` | `EmployeeAddressId` (int) | HR | EmployeeId FK, EAddressType, HouseNumber, Province ฯลฯ |
| `TbEmployeeEducation` | `EmployeeEducationId` (int) | HR | EmployeeId FK, EducationLevel, Major?, Institution, Gpa? |
| `TbEmployeeWorkHistory` | `EmployeeWorkHistoryId` (int) | HR | EmployeeId FK, Workplace, Position?, StartDate, EndDate? |
| `TbmPosition` | `PositionId` (int) | Authorization | PositionName, Description?, IsActive |
| `TbmPermission` | `PermissionId` (int) | Authorization | PermissionName, PermissionCode, SortOrder |
| `TbmModule` | `ModuleId` (int) | Authorization | ModuleName, ModuleCode, ParentModuleId? (self-ref), SortOrder, IsActive |
| `TbmAuthorizeMatrix` | `AuthorizeMatrixId` (int) | Authorization | ModuleId FK, PermissionId FK, PermissionPath |
| `TbAuthorizeMatrixPosition` | `AuthorizeMatrixPositionId` (int) | Authorization | AuthorizeMatrixId FK, PositionId FK |

### Entity ที่ไม่ inherit BaseEntity (lifecycle เฉพาะ)

| Entity | PK | Domain | เหตุผล |
|--------|----|--------|--------|
| `TbRefreshToken` | `RefreshTokenId` (Guid) | Auth | มี expiry, revoke — ไม่ต้อง soft delete |
| `TbLoginHistory` | `LoginHistoryId` (Guid) | Auth | Log entity — ไม่ต้อง audit/delete |
| `TbPasswordResetToken` | `PasswordResetTokenId` (Guid) | Auth | OTP lifecycle — มี expiry, attempts |
| `TbPasswordHistory` | `PasswordHistoryId` (int) | Auth | Password log — append only |

### BaseEntity Fields (ทุก Entity ที่ inherit)

```
CreatedAt (DateTime)             — auto-stamp เมื่อ Add
CreatedBy (int?, FK→TbEmployee)  — auto-stamp จาก JWT
UpdatedAt (DateTime?)            — auto-stamp เมื่อ Modified
UpdatedBy (int?, FK→TbEmployee)  — auto-stamp จาก JWT
DeleteFlag (bool)                — soft delete flag
DeletedAt (DateTime?)            — auto-stamp เมื่อ DeleteFlag = true
DeletedBy (int?)                 — auto-stamp จาก JWT
CreatedByEmployee (nav)          — Navigation → TbEmployee
UpdatedByEmployee (nav)          — Navigation → TbEmployee
```

---

## Services Summary

### Backend Services (12)

| Module | Service | หน้าที่ |
|--------|---------|---------|
| Business.Admin | `IAuthService` | Login, Logout, Refresh Token, Forgot/Reset Password |
| Business.Admin | `IJwtTokenService` | สร้าง/ตรวจสอบ JWT Token |
| Business.Admin | `IS3StorageService` | Upload/Download ไฟล์จาก S3 |
| Business.Admin | `IFileService` | จัดการ TbFile records + S3 |
| Business.Admin | `IServiceChargeService` | CRUD ค่าบริการ |
| Business.Admin | `IShopSettingsService` | จัดการตั้งค่าร้าน + เวลาเปิด-ปิด |
| Business.Admin | `IReCaptchaService` | ตรวจสอบ Google ReCaptcha |
| Core | `IEmailService` | ส่งอีเมล (SMTP) |
| Business.Menu | `IMenuService` | CRUD เมนูอาหาร |
| Business.HumanResource | `IEmployeeService` | CRUD พนักงาน + sub-entities + user account |
| Business.Authorization | `IPositionService` | CRUD ตำแหน่งงาน |
| Business.Authorization | `IPermissionService` | จัดการ Permission Matrix |

---

## doc/

```
doc/
├── agents/
│   ├── system-analyst.md              ← SA Agent spec
│   ├── backend-expert.md              ← Backend Agent spec
│   ├── frontend-expert.md             ← Frontend Agent spec (+ UX/UI)
│   └── code-reviewer.md              ← Code Review Agent spec
├── architecture/
│   ├── project-structure.md           ← ไฟล์นี้
│   ├── system-overview.md             ← N-Tier pattern, Data flow
│   ├── design-system.md              ← Color tokens, Typography
│   ├── icon-system.md                ← ระบบ Icon (GenericIcon + PrimeIcons)
│   ├── file-management.md            ← สถาปัตยกรรมการจัดการไฟล์ (TbFile + S3)
│   ├── https-security.md             ← HTTPS + Security configuration
│   └── database-api-reference.md     ← อ้างอิงตาราง, API, ความสัมพันธ์
├── development/
│   ├── quick-start.md                ← รันโปรเจคครั้งแรก
│   ├── module-development-workflow.md ← End-to-End 16 ขั้นตอน
│   ├── backend-guide.md              ← 10-Step Workflow + Database Conventions
│   ├── backend-coding-standards.md   ← DO/DON'T ทุก layer
│   ├── frontend-guidelines.md        ← Frontend patterns
│   ├── frontend-coding-standards.md  ← DO/DON'T Frontend
│   └── ai-prompting-guide.md         ← คู่มือ AI Agents + prompt templates
├── features/
│   └── project-status.md             ← สถานะปัจจุบัน, Endpoints, next steps
├── requirements/
│   └── (ว่าง)
└── tasks/
    ├── README.md                      ← รูปแบบ Task tracking
    ├── TASK-ui-redesign.md            ← Task: UI Redesign
    ├── TASK-icon-system.md            ← Task: Icon System
    └── TASK-api-naming.md             ← Task: API Naming Pattern
```

---

## Related Docs

- [project-status.md](../features/project-status.md) — สิ่งที่ทำงานได้จริง vs ยังขาด
- [system-overview.md](system-overview.md) — N-Tier architecture + data flow
- [backend-guide.md](../development/backend-guide.md) — คู่มือพัฒนา Backend + 10-Step Workflow
- [frontend-guidelines.md](../development/frontend-guidelines.md) — Frontend patterns + DO/DON'T
- [file-management.md](file-management.md) — สถาปัตยกรรมการจัดการไฟล์
- [database-api-reference.md](database-api-reference.md) — อ้างอิงตาราง, API, ความสัมพันธ์
- [design-system.md](design-system.md) — Color tokens, Typography
- [icon-system.md](icon-system.md) — ระบบ Icon (GenericIcon + PrimeIcons)
