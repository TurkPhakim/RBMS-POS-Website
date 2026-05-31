# RBMS-POS — โครงสร้างโปรเจคจริง

> อ้างอิงจากไฟล์ที่มีในโปรเจคจริง — อัปเดตล่าสุด 2026-05-30

---

## Root Level

```
RBMS-POS/
├── README.md                         ← Project overview + documentation index
├── CLAUDE.md                         ← Claude Code instructions
├── docker-compose.yml                ← Full-stack deployment (Backend + Frontend + SQL Server + MinIO + Nginx)
├── swagger-spec.json                 ← OpenAPI snapshot
├── Backend-POS/                      ← Backend (.NET 9)
├── Frontend-POS/
│   ├── RBMS-POS-Client/              ← Admin/Staff (Angular 19)
│   └── RBMS-POS-Mobile-Web/          ← Self-Order Mobile Web (Angular 19)
└── doc/                              ← Documentation (ทุกเอกสาร)
```

---

## Backend

### Solution Structure

```
Backend-POS/
├── RBMS.POS.sln
├── SETUP_DATABASE.bat                ← script run EF migration ครั้งแรก
└── POS.Main/
    ├── RBMS.POS.WebAPI/              ← Entry point (Controllers, Hubs, Filters, Program.cs)
    ├── POS.Main.Business.Admin/         ← Auth, JWT, S3, File, ServiceCharge, ShopSettings, User, Cashier, Dashboard, Email, ReCaptcha
    ├── POS.Main.Business.Authorization/ ← Position, Permission
    ├── POS.Main.Business.HumanResource/ ← Employee + Address/Education/WorkHistory
    ├── POS.Main.Business.Menu/          ← Menu, Category, Option Group
    ├── POS.Main.Business.Notification/  ← Notification + SignalR Delivery
    ├── POS.Main.Business.Order/         ← Order, OrderBill, Kitchen, Customer/SelfOrder, QrRedirect
    ├── POS.Main.Business.Payment/       ← Payment, Receipt, Slip OCR
    ├── POS.Main.Business.Table/         ← Zone, Table, FloorObject, Reservation, TableLink
    ├── POS.Main.Repositories/        ← Repository + UnitOfWork
    ├── POS.Main.Dal/                 ← DbContext + Entities + Migrations + Configurations
    └── POS.Main.Core/                ← Enums + Exceptions + Helpers + Models + Settings + Constants
```

> **หมายเหตุ**: Business Layer แบ่งเป็น 8 projects ตาม Domain — เพิ่ม project ใหม่เมื่อสร้าง domain ใหม่ (ไม่ผูก service กับ project ผิด domain)

---

### RBMS.POS.WebAPI

```
RBMS.POS.WebAPI/
├── Program.cs                        ← DI registration, Swagger, JWT, CORS, SignalR
├── appsettings.json
├── appsettings.Development.json
│
├── Controllers/                      ← 23 controllers + BaseController
│   ├── BaseController.cs                       ← Helper: Success<T>(), ListSuccess<T>(), PagedSuccess<T>(), ToActionResult(), GetUserId(), GetIpAddress()
│   ├── AuthController.cs                       ← api/admin/auth (login, logout, refresh, forgot, OTP, reset, change, verify, PIN)
│   ├── UsersController.cs                      ← api/admin/users (list, update, reset-login-attempts)
│   ├── PositionsController.cs                  ← api/admin/positions (CRUD + permissions + module tree)
│   ├── ServiceChargesController.cs             ← api/admin/servicecharges (CRUD + dropdown)
│   ├── ShopSettingsController.cs               ← api/admin/shop-settings (GET/PUT + branding + welcome + current-period)
│   ├── FileController.cs                       ← api/admin/file (download)
│   ├── HumanResourceController.cs              ← api/humanresource (Employee CRUD + sub-entities + create-user + me/profile)
│   ├── MenuItemsController.cs                  ← api/menu/items (Menu CRUD)
│   ├── MenuCategoriesController.cs             ← api/menu/categories (Sub Category CRUD + sort-order)
│   ├── MenuOptionsController.cs                ← api/menu/options (Option Group CRUD)
│   ├── TablesController.cs                     ← api/table/tables (CRUD + open/close/clean/move/link/unlink)
│   ├── ZonesController.cs                      ← api/table/zones (CRUD + sort-order)
│   ├── FloorObjectsController.cs               ← api/table/floor-objects (CRUD + positions)
│   ├── ReservationsController.cs               ← api/table/reservations (CRUD + confirm/check-in/cancel/no-show)
│   ├── OrdersController.cs                     ← api/order/orders (CRUD + send-kitchen + serve + split-bill + void + update-charges)
│   ├── KitchenController.cs                    ← api/kitchen (orders + prepare/ready)
│   ├── PaymentsController.cs                   ← api/payment/payments (cash + QR + slip + receipt + history)
│   ├── CashierSessionsController.cs            ← api/cashier/sessions (open/close + cash-in/out + history)
│   ├── DashboardController.cs                  ← api/dashboard (overview + top-selling + peak-hours + sales-report)
│   ├── NotificationsController.cs              ← api/notifications (list + unread-count + read + clear)
│   ├── CustomerController.cs                   ← api/customer (bill + claim/release + upload-slip + status)
│   ├── SelfOrderController.cs                  ← api/customer (auth + menu + cart + orders + actions)
│   └── QrRedirectController.cs                 ← q/{code} (redirect QR short code)
│
├── Filters/
│   ├── GlobalExceptionFilter.cs                ← Exception → HTTP status mapping
│   ├── PermissionAuthorizeAttribute.cs         ← [PermissionAuthorize("xxx.read")]
│   ├── CustomerAuthorizeAttribute.cs           ← ตรวจ CustomerSession token (Self-Order)
│   └── CustomOperationIdFilter.cs              ← Auto-generate Swagger operationId ({Controller}_{Action}_{Method})
│
└── Hubs/
    ├── OrderHub.cs                             ← SignalR Hub — Order/Table/Kitchen real-time
    └── NotificationHub.cs                      ← SignalR Hub — Notification real-time
```

---

### Business Modules

#### POS.Main.Business.Admin

ครอบคลุม Auth + Master Data ของผู้ดูแลระบบ + Cashier Session + Dashboard

```
POS.Main.Business.Admin/
├── Interfaces/
│   ├── IAuthService.cs                    ← Login, Logout, Refresh, Forgot/Reset/Change Password, PIN
│   ├── IJwtTokenService.cs                ← Generate + Validate JWT
│   ├── IReCaptchaService.cs               ← Verify Google ReCaptcha
│   ├── IS3StorageService.cs               ← S3/MinIO operations
│   ├── IFileService.cs                    ← TbFile CRUD + S3
│   ├── IServiceChargeService.cs           ← ServiceCharge CRUD
│   ├── IShopSettingsService.cs            ← ShopSettings + OperatingHours
│   ├── IUserService.cs                    ← User Management (list, reset attempts)
│   ├── ICashierSessionService.cs          ← เปิด/ปิดกะ + เงินสดเข้า-ออก
│   └── IDashboardService.cs               ← Overview, Top Selling, Peak Hours, Sales Report
│
├── Services/
│   └── (implementation ทั้งหมดของ interface ด้านบน)
│
└── Models/
    ├── Auth/                              ← Login, Refresh, Forgot, ResetPassword, ChangePassword, PIN
    ├── AdminSettings/                     ← ServiceCharge models
    ├── ShopSettings/                      ← ShopSettings, Branding, Welcome, OperatingHour
    ├── User/                              ← User list/detail/update models
    ├── Files/                             ← FileResponse, FileDownloadResult
    ├── CashierSession/                    ← Open/Close/CashIn/CashOut models
    └── Dashboard/                         ← Overview, TopSelling, PeakHour, SalesReport models
```

#### POS.Main.Business.Authorization

```
POS.Main.Business.Authorization/
├── Interfaces/
│   ├── IPositionService.cs                ← Position CRUD + dropdown
│   └── IPermissionService.cs              ← Module tree + Permission Matrix CRUD + GetUserPermissions
├── Services/
└── Models/
    ├── Position/
    └── Permission/
```

#### POS.Main.Business.HumanResource

```
POS.Main.Business.HumanResource/
├── Interfaces/
│   └── IEmployeeService.cs                ← Employee CRUD + Addresses/Educations/WorkHistories + Create User + My Profile
├── Services/
└── Models/
    ├── Address/
    ├── Education/
    ├── WorkHistory/
    ├── CreateEmployeeRequestModel.cs
    ├── UpdateEmployeeRequestModel.cs
    ├── EmployeeResponseModel.cs
    ├── MyProfileResponseModel.cs
    ├── CreateUserAccountResponseModel.cs
    └── EmployeeMapper.cs
```

#### POS.Main.Business.Menu

```
POS.Main.Business.Menu/
├── Interfaces/
│   ├── IMenuService.cs                    ← Menu CRUD (filter by category type: food/beverage/dessert)
│   ├── IMenuCategoryService.cs            ← Sub Category CRUD + sort-order
│   └── IMenuOptionService.cs              ← Option Group + Option Items CRUD
├── Services/
└── Models/
    ├── Menu/
    ├── Category/
    └── Option/
```

#### POS.Main.Business.Notification

```
POS.Main.Business.Notification/
├── Interfaces/
│   ├── INotificationService.cs            ← CRUD + Mark Read + Clear
│   └── INotificationDeliveryService.cs    ← SignalR broadcast helper
├── Services/
└── Models/
```

#### POS.Main.Business.Order

ครอบคลุม Order + Bill + Kitchen + Self-Order (Customer)

```
POS.Main.Business.Order/
├── Interfaces/
│   ├── IOrderService.cs                   ← Order CRUD + items + send-kitchen + serve + void
│   ├── IOrderBillService.cs               ← Request bill + Split (by-item/by-amount) + Unsplit + Update charges
│   ├── IOrderSignalRService.cs            ← Broadcast helpers
│   ├── IKitchenService.cs                 ← Kitchen queue + prepare/ready
│   ├── ICustomerService.cs                ← Self-Order: bill, claim/release, upload slip
│   ├── ISelfOrderService.cs               ← Self-Order: auth, menu, cart, orders, actions
│   └── IQrRedirectService.cs              ← Short URL → Long URL
├── Services/
└── Models/
    ├── Order/
    ├── OrderItem/
    ├── OrderBill/
    ├── Kitchen/
    ├── Customer/                          ← Self-Order Customer (Mobile)
    └── SelfOrder/
```

#### POS.Main.Business.Payment

```
POS.Main.Business.Payment/
├── Interfaces/
│   ├── IPaymentService.cs                 ← Cash + QR confirm + Upload Slip + Get by Order + History
│   ├── IReceiptService.cs                 ← Generate receipt + consolidated receipt
│   └── ISlipOcrService.cs                 ← OCR สลิป → ตรวจยอด + วันที่ + บัญชีปลายทาง
├── Services/
└── Models/
```

#### POS.Main.Business.Table

```
POS.Main.Business.Table/
├── Interfaces/
│   ├── ITableService.cs                   ← Table CRUD + positions + operations (open/close/clean/move/set-available)
│   ├── IZoneService.cs                    ← Zone CRUD + active + sort-order
│   ├── IFloorObjectService.cs             ← FloorObject CRUD + positions
│   ├── IReservationService.cs             ← Reservation CRUD + confirm/check-in/cancel/no-show + today
│   └── ITableLinkService.cs               ← Link tables + Unlink + Group code
├── Services/
└── Models/
    ├── Table/
    ├── Zone/
    ├── FloorObject/
    ├── Reservation/
    └── TableLink/
```

---

### POS.Main.Repositories

```
POS.Main.Repositories/
├── Interfaces/                            ← 35 interfaces (1 ต่อ entity)
│   ├── IGenericRepository.cs              ← Base CRUD
│   ├── IUserRepository.cs                 ← Specific queries (GetByUsername, GetByEmail)
│   ├── IRefreshTokenRepository.cs
│   ├── IPasswordResetTokenRepository.cs
│   ├── IPasswordHistoryRepository.cs
│   ├── IServiceChargeRepository.cs
│   ├── IShopSettingsRepository.cs
│   ├── IFileRepository.cs
│   ├── IMenuRepository.cs
│   ├── IMenuSubCategoryRepository.cs
│   ├── IOptionGroupRepository.cs
│   ├── IMenuOptionGroupRepository.cs
│   ├── IEmployeeRepository.cs
│   ├── IEmployeeAddressRepository.cs
│   ├── IEmployeeEducationRepository.cs
│   ├── IEmployeeWorkHistoryRepository.cs
│   ├── IPositionRepository.cs
│   ├── IModuleRepository.cs
│   ├── IAuthorizeMatrixRepository.cs
│   ├── IAuthorizeMatrixPositionRepository.cs
│   ├── IZoneRepository.cs
│   ├── ITableRepository.cs
│   ├── ITableLinkRepository.cs
│   ├── IFloorObjectRepository.cs
│   ├── IReservationRepository.cs
│   ├── IOrderRepository.cs
│   ├── IOrderItemRepository.cs
│   ├── IOrderItemOptionRepository.cs
│   ├── IOrderBillRepository.cs
│   ├── IPaymentRepository.cs
│   ├── ICashierSessionRepository.cs
│   ├── ICashDrawerTransactionRepository.cs
│   ├── INotificationRepository.cs
│   ├── INotificationReadRepository.cs
│   └── ICustomerSessionRepository.cs
│
├── Implementations/                       ← 35 implementations (mirror interface)
│
└── UnitOfWork/
    ├── IUnitOfWork.cs                     ← Lazy-init repository properties + CommitAsync()
    └── UnitOfWork.cs                      ← Lazy initialization pattern
```

---

### POS.Main.Dal

```
POS.Main.Dal/
├── POSMainContext.cs                      ← DbContext: ~37 DbSets, SaveChanges override (audit), Global Query Filter (DeleteFlag)
│
├── Entities/                              ← จัดกลุ่มตาม Domain (11 folders, 37 entities)
│   ├── BaseEntity.cs                      ← abstract: CreatedAt/By, UpdatedAt/By, DeleteFlag/At/By + Navigation
│   │
│   ├── Auth/
│   │   ├── TbUser.cs                      ← UserId(Guid), Username, Email, PasswordHash, IsActive, FailedLoginAttempts, LockoutCount, LockedUntil, PinCodeHash, IsLockedByAdmin
│   │   ├── TbRefreshToken.cs              ← lifecycle เฉพาะ (ไม่ inherit BaseEntity)
│   │   ├── TbPasswordResetToken.cs        ← OTP lifecycle
│   │   └── TbPasswordHistory.cs           ← Password log (append-only)
│   │
│   ├── Authorization/
│   │   ├── TbmPosition.cs                 ← Master Data
│   │   ├── TbmPermission.cs               ← Master Data (read/create/update/delete)
│   │   ├── TbmModule.cs                   ← Tree structure (self-ref ParentModuleId)
│   │   ├── TbmAuthorizeMatrix.cs          ← Module + Permission → PermissionPath
│   │   └── TbAuthorizeMatrixPosition.cs   ← Position + Matrix (M:M)
│   │
│   ├── Admin/
│   │   ├── TbServiceCharge.cs             ← Name, PercentageRate, IsActive, StartDate?, EndDate?
│   │   ├── TbShopSettings.cs              ← Singleton: ShopName(TH/EN), TaxId, FoodType, Logo, QR, Bank, WiFi, PromptPay
│   │   └── TbShopOperatingHour.cs         ← 7 records (จันทร์-อาทิตย์) — OpenTime1/2 + CloseTime1/2
│   │
│   ├── Common/
│   │   └── TbFile.cs                      ← Metadata ไฟล์: FileName, MimeType, FileExtension, FileSize, S3Key
│   │
│   ├── HumanResource/
│   │   ├── TbEmployee.cs                  ← Names, Title, Gender, PositionId, ImageFileId, UserId, IsFullTime, Salary, HourlyRate
│   │   ├── TbEmployeeAddress.cs           ← AddressType, HouseNumber, Province, ...
│   │   ├── TbEmployeeEducation.cs         ← Level, Major, Institution, Gpa
│   │   └── TbEmployeeWorkHistory.cs       ← Workplace, Position, StartDate, EndDate
│   │
│   ├── Menu/
│   │   ├── TbMenu.cs                      ← NameThai/English, Price, CostPrice, CategoryType (food/beverage/dessert), SubCategoryId, ImageFileId, Tags, PeriodStart, PeriodEnd
│   │   ├── TbMenuSubCategory.cs           ← CategoryType + Name + SortOrder
│   │   ├── TbOptionGroup.cs               ← OptionGroupName + CategoryType
│   │   ├── TbOptionItem.cs                ← OptionGroupId + ItemName + PriceAdjustment + CostPrice
│   │   └── TbMenuOptionGroup.cs           ← M:M (Menu + OptionGroup)
│   │
│   ├── Table/
│   │   ├── TbZone.cs                      ← ZoneName + SortOrder
│   │   ├── TbTable.cs                     ← TableName + ZoneId + TableSize + TableStatus + PositionX/Y + QrToken + QrShortCode + ActiveOrderId
│   │   ├── TbTableLink.cs                 ← GroupCode (รวมโต๊ะหลายตัว)
│   │   ├── TbFloorObject.cs               ← ObjectType (Pillar/Divider/Walkway/Counter/Decoration), Label, ZoneId?, PositionX/Y (double)
│   │   └── TbReservation.cs               ← CustomerName, Phone, TableId, ReservationDate, GuestCount, Status, Note
│   │
│   ├── Order/
│   │   ├── TbOrder.cs                     ← TableId, OrderNumber, Status (EOrderStatus: Open/Billing/Completed), GuestCount, SubTotal, Note
│   │   ├── TbOrderItem.cs                 ← OrderId, MenuId, MenuNameThai/English, CategoryType, Quantity, UnitPrice, OptionsTotalPrice, TotalPrice, Status (Pending/Sent/Preparing/Ready/Served/Voided/Cancelled), OrderedBy (string), CostPrice, OrderBillId?, SourceTableId?, CancelledBy?, CancelReason?
│   │   ├── TbOrderItemOption.cs           ← OrderItemId, OptionGroupId, OptionItemId, OptionGroupName, OptionItemName, AdditionalPrice, CostPrice (ไม่ inherit BaseEntity)
│   │   └── TbOrderBill.cs                 ← OrderId, BillNumber, BillType, SubTotal, NetAmount, ServiceChargeRate/Amount, VatRate/Amount, GrandTotal, SplitCount/Index, Status, ClaimedBySessionId (int), CustomerSlipFileId, CustomerSlipOcrAmount/Date/AccountNumber, CustomerSlipVerificationStatus
│   │
│   ├── Payment/
│   │   ├── TbPayment.cs                   ← OrderBillId, CashierSessionId, PaymentMethod (Cash/QR), Amount, AmountTendered, ChangeAmount, ProcessedAt, ReceivedByEmployeeId
│   │   ├── TbCashierSession.cs            ← OpenedByEmployeeId, OpeningBalance, ClosingBalance, ExpectedBalance, Difference, ShiftPeriod, Status, OpenedAt, ClosedAt
│   │   └── TbCashDrawerTransaction.cs     ← CashierSessionId, TransactionType (CashIn/CashOut), Amount, Reason, RecordedAt
│   │
│   ├── Notification/
│   │   ├── TbNotification.cs              ← NotificationType, Title, Body, RelatedEntityType, RelatedEntityId, TargetGroups, CreatedAt
│   │   └── TbNotificationRead.cs          ← NotificationId + UserId + ReadAt
│   │
│   └── Customer/
│       └── TbCustomerSession.cs           ← TableId, SessionToken, QrTokenNonce, Nickname, DeviceFingerprint, IsActive, ExpiresAt
│
├── EntityConfigurations/                  ← Fluent API (1 ต่อ entity)
│
└── Migrations/                            ← 53 migrations (ดู project-status.md สำหรับ timeline)
```

---

### POS.Main.Core

```
POS.Main.Core/
├── Constants/
│   ├── constResultType.cs                 ← "success" / "fail"
│   └── Permissions.cs                     ← Nested static class (Permission codes ทุกโมดูล)
│
├── Enums/                                 ← 22 enums
│   ├── EAddressType.cs                    ← House, Office, Other
│   ├── EBillStatus.cs                     ← Pending, Paid, Cancelled, Voided
│   ├── EBillType.cs                       ← Full, SplitByItem, SplitByAmount
│   ├── ECashDrawerTransactionType.cs      ← CashIn, CashOut
│   ├── ECashierSessionStatus.cs           ← Open, Closed
│   ├── EDayOfWeek.cs                      ← Monday-Sunday
│   ├── EEmploymentStatus.cs               ← Active, Resigned, Terminated, Suspended
│   ├── EFloorObjectType.cs                ← Pillar, Divider, Walkway, Counter, Decoration
│   ├── EGender.cs                         ← Male, Female, NotSpecified
│   ├── EGuestType.cs                      ← (สำหรับ reservation)
│   ├── EMenuCategory.cs                   ← Food, Beverage, Dessert
│   ├── EMenuTag.cs                        ← Spicy, Cold, Hot, Recommended, ฯลฯ
│   ├── ENationality.cs                    ← ไทย, อื่นๆ
│   ├── EOrderItemStatus.cs                ← Pending, Sent, Preparing, Ready, Served, Cancelled, Voided
│   ├── EOrderStatus.cs                    ← Open, Billing, Completed, Cancelled
│   ├── EPaymentMethod.cs                  ← Cash, QrPromptPay, QrBank
│   ├── EReligion.cs                       ← Buddhism, Christianity, Islam, ฯลฯ
│   ├── EReservationStatus.cs              ← Pending, Confirmed, CheckedIn, Cancelled, NoShow
│   ├── ESlipVerificationStatus.cs         ← Pending, Verified, Rejected
│   ├── ETableSize.cs                      ← Small, Medium, Large, ExtraLarge
│   ├── ETableStatus.cs                    ← Available, Occupied, Reserved, Cleaning, Unavailable
│   └── ETitle.cs                          ← นาย, นาง, นางสาว, ด.ช., ด.ญ.
│
├── Exceptions/
│   ├── AuthenticationException.cs         ← base
│   ├── AccountLockedException.cs          ← HTTP 423
│   ├── AccountDisabledException.cs        ← HTTP 403
│   ├── InvalidCredentialsException.cs     ← HTTP 401
│   ├── InvalidRefreshTokenException.cs    ← HTTP 401
│   ├── ValidationException.cs             ← HTTP 400
│   ├── EntityNotFoundException.cs         ← HTTP 404
│   └── BusinessException.cs               ← HTTP 422
│
├── Helpers/
│   ├── IPasswordHasher.cs
│   └── PasswordHasher.cs                  ← BCrypt
│
├── Interfaces/
│   └── IEmailService.cs                   ← Interface (impl ใน Business.Admin)
│
├── Settings/
│   ├── JwtSettings.cs                     ← Issuer, Audience, SecretKey, AccessTokenExpiry, RefreshTokenExpiry
│   ├── S3Settings.cs                      ← Endpoint, AccessKey, SecretKey, Bucket
│   ├── ReCaptchaSettings.cs               ← SiteKey, SecretKey, MinimumScore
│   └── SmtpSettings.cs                    ← Host, Port, Username, Password, FromEmail
│
└── Models/
    ├── BaseResponseModel.cs               ← BaseResponseModel<T> { Status, Result, Message, Code, Errors }
    ├── PaginationModel.cs                 ← Search, Page, ItemPerPage
    ├── PaginationResult.cs                ← PaginationResult<T> { Results, Page, Total, ItemPerPage }
    └── ListResponseModel.cs               ← { Results, TotalItems }
```

---

## Frontend Admin Client (RBMS-POS-Client)

### Config Files (root)

```
RBMS-POS-Client/
├── angular.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── ng-openapi-gen.json           ← Config สำหรับ generate API client
├── swagger.json                  ← OpenAPI spec snapshot
├── fix-api-exports.js            ← Script patch generated code (multipart/form-data nested objects)
└── public/
    ├── icons/                    ← SVG icons (สำหรับ <app-generic-icon>)
    └── images/                   ← Logo + รูปภาพประกอบ
```

---

### src/app/

```
src/app/
├── app.module.ts                         ← root module (BrowserModule, NgRx Store, HttpClient, SharedModule, PrimeNG)
├── app-routing.module.ts                 ← redirect → LayoutsModule
├── app.component.ts
│
├── store/                                ← NgRx
│   └── layout/                           ← layoutReducer, actions, selectors (sidebar, notification, buttons)
│
├── core/                                 ← Singleton services
│   ├── api/                              ← AUTO-GENERATED จาก swagger (ห้ามแก้ด้วยมือ)
│   │   ├── api-configuration.ts
│   │   ├── models/                       ← TypeScript interfaces
│   │   ├── services/                     ← 23 API services (1 ต่อ controller)
│   │   └── fn/                           ← Function-based API calls
│   ├── providers/
│   │   └── api-config.provider.ts        ← rootUrl + token จาก environment
│   ├── guards/
│   │   ├── auth.guard.ts                 ← Redirect ไป login ถ้าไม่มี token
│   │   ├── guest.guard.ts                ← Redirect ออกจาก login ถ้ามี token แล้ว
│   │   └── permission.guard.ts           ← Block ถ้าไม่มี permission ที่ระบุ
│   ├── interceptors/
│   │   ├── auth.interceptor.ts           ← Inject Bearer + refresh on 401 (bypass สำหรับ /verify-password, /pin/verify, /change-password)
│   │   └── loading.interceptor.ts        ← Global loading state
│   ├── models/                           ← Custom models (auth, notification, signalr-events)
│   └── services/
│       ├── auth.service.ts               ← Token + user + login/logout
│       ├── breadcrumb.service.ts         ← Breadcrumb + Action buttons
│       ├── header.service.ts             ← Header state
│       ├── sidebar.service.ts            ← Sidebar state
│       ├── modal.service.ts              ← Programmatic dialogs (info, cancel, commonSuccess)
│       ├── loading.service.ts            ← Global loading
│       ├── session-timeout.service.ts    ← Idle detection + warning dialog
│       ├── shop-branding.service.ts      ← Logo + ชื่อร้าน (cache)
│       ├── notification.service.ts       ← Notification list + unread count
│       ├── signalr.service.ts            ← OrderHub + NotificationHub connection
│       └── permission.service.ts         ← hasPermission(...) helper
│
├── layouts/
│   ├── layouts.module.ts
│   ├── layout-routing.module.ts
│   ├── main-layout/
│   │   └── main-layout.component.ts      ← Header + Sidebar + Breadcrumb + Router outlet
│   └── auth-layout/
│       └── auth-layout.component.ts      ← Login/Reset password layout
│
├── shared/
│   ├── shared.module.ts                  ← PrimeNG modules + common declarations
│   ├── component-interfaces.ts           ← CurrentUser, MenuItem, BreadcrumbItem, SelectOption ฯลฯ
│   │
│   ├── components/
│   │   ├── generic-icon/                 ← SVG icon (currentColor + cache)
│   │   ├── header/                       ← Top bar: toggle + profile + notification bell
│   │   ├── side-bar/                     ← Navigation (เห็นเฉพาะ menu ที่มี permission)
│   │   ├── top-breadcrumb/               ← Breadcrumb + action buttons
│   │   ├── global-loading/               ← Lottie loading overlay
│   │   └── notification-panel/           ← Drawer แสดงรายการ notification
│   │
│   ├── cards/
│   │   ├── card-template/                ← มาตรฐาน Card (headerLabel + ng-content + p-footer)
│   │   ├── section-card/                 ← Section card สำหรับ group form
│   │   ├── empty-view/                   ← Empty state placeholder
│   │   ├── image-upload-card/            ← Image upload + preview (S3)
│   │   ├── field-error/                  ← Validation error (dirty-only)
│   │   └── audit-footer/                 ← CreatedBy/At + UpdatedBy/At
│   │
│   ├── dialogs/
│   │   ├── address-dialog/
│   │   ├── education-dialog/
│   │   ├── work-history-dialog/
│   │   ├── session-timeout/              ← Idle timeout warning
│   │   └── verify-password-dialog/       ← ยืนยันรหัสผ่านก่อน sensitive action
│   │
│   ├── modals/
│   │   ├── info-modal/                   ← Confirm (ModalService.info)
│   │   ├── cancel-modal/                 ← Error (ModalService.cancel)
│   │   └── success-modal/                ← Success auto-close (ModalService.commonSuccess)
│   │
│   ├── dropdowns/                        ← 25+ shared dropdowns extends DropdownBaseComponent
│   │   ├── dropdown-base.component.ts    ← ControlValueAccessor base
│   │   ├── active-status-dropdown/
│   │   ├── address-type-dropdown/
│   │   ├── availability-status-dropdown/
│   │   ├── available-table-dropdown/
│   │   ├── floor-object-type-dropdown/
│   │   ├── gender-dropdown/
│   │   ├── menu-category-dropdown/
│   │   ├── nationality-dropdown/
│   │   ├── notification-table-dropdown/
│   │   ├── order-status-dropdown/
│   │   ├── period-dropdown/
│   │   ├── position-dropdown/            ← Load จาก API
│   │   ├── religion-dropdown/
│   │   ├── reservation-available-dropdown/
│   │   ├── reservation-status-dropdown/
│   │   ├── service-charge-dropdown/      ← Load จาก API
│   │   ├── shift-period-dropdown/
│   │   ├── source-table-dropdown/
│   │   ├── sub-category-dropdown/        ← Load จาก API
│   │   ├── table-dropdown/               ← Load จาก API
│   │   ├── table-size-dropdown/
│   │   ├── table-status-dropdown/
│   │   ├── title-dropdown/
│   │   ├── user-status-dropdown/
│   │   └── zone-dropdown/                ← Load จาก API
│   │
│   ├── pipes/
│   │   ├── date-format.pipe.ts
│   │   ├── mask-phone.pipe.ts
│   │   └── national-id-mask.pipe.ts
│   │
│   ├── pages/
│   │   ├── welcome/                      ← หน้าแรกหลัง login (banner ของร้าน)
│   │   └── access-denied/                ← หน้า 403
│   │
│   ├── directives/
│   │   └── datepicker-icon.directive.ts  ← Icon สำหรับ PrimeNG DatePicker
│   │
│   └── utils/
│       ├── form-utils.ts                 ← markFormDirty(), linkDateRange()
│       └── index.ts
│
└── features/                             ← Lazy-loaded (10 modules)
    │
    ├── auths/                            ← /auth/*  (PUBLIC)
    │   ├── auths.module.ts
    │   ├── auths-routing.module.ts
    │   ├── pages/
    │   │   ├── login/
    │   │   └── reset-password/
    │   └── dialogs/
    │       ├── forgot-password-dialog/
    │       └── verify-otp-dialog/
    │
    ├── admin/                            ← /admin-setting/*
    │   ├── admin.module.ts
    │   ├── admin-routing.module.ts
    │   ├── pages/
    │   │   ├── user-list/
    │   │   ├── user-manage/
    │   │   ├── position-list/
    │   │   ├── position-manage/          ← + Permission Matrix
    │   │   ├── service-charge-list/
    │   │   └── shop-settings/            ← Tabs: ข้อมูลร้าน / เวลาทำการ / ธนาคาร+WiFi+PromptPay / Branding
    │   └── dialogs/
    │       └── service-charge-manage-dialog/
    │
    ├── human-resource/                   ← /human-resource/*
    │   ├── pages/
    │   │   ├── employee-list/
    │   │   └── employee-manage/          ← Tabs: ข้อมูล / ที่อยู่ / การศึกษา / ประวัติงาน / Account
    │   └── dialogs/
    │       ├── create-user-dialog/
    │       └── credentials-dialog/
    │
    ├── menu/                             ← /menu/*
    │   ├── pages/
    │   │   ├── menu-list/                ← reusable (food / beverage / dessert)
    │   │   ├── menu-manage/
    │   │   ├── sub-category-list/        ← + Drag & Drop sort
    │   │   ├── sub-category-manage/
    │   │   ├── option-group-list/
    │   │   └── option-group-manage/
    │   └── dialogs/
    │       └── sub-category-create-dialog/
    │
    ├── dashboard/                        ← /dashboard/*
    │   └── pages/
    │       ├── dashboard-overview/       ← KPI cards + charts
    │       └── sales-report/             ← Date range + comparison chart
    │
    ├── table/                            ← /table/*
    │   ├── pages/
    │   │   ├── floor-plan/               ← Drag & Drop ผังร้าน
    │   │   ├── zone-table-list/          ← Tabs: Zone + Tables
    │   │   └── reservation-list/         ← Calendar View
    │   └── dialogs/
    │       ├── zone-dialog/
    │       ├── table-dialog/
    │       ├── floor-object-dialog/
    │       ├── reservation-dialog/
    │       └── table-action-dialog/
    │
    ├── order/                            ← /order/*
    │   ├── pages/
    │   │   ├── order-overview/           ← ภาพรวมร้าน (8 สถานะ — real-time)
    │   │   ├── order-list/
    │   │   ├── order-detail/
    │   │   └── staff-order/              ← Staff สั่งอาหารแทนลูกค้า
    │   └── dialogs/
    │       ├── send-bill-dialog/
    │       ├── split-bill-dialog/
    │       ├── void-bill-dialog/
    │       ├── cancel-reason-dialog/
    │       ├── menu-item-dialog/
    │       └── open-table-dialog/
    │
    ├── kitchen-display/                  ← /kitchen-display/*
    │   └── pages/
    │       └── kitchen-display/          ← reusable (food / beverage / dessert)
    │
    ├── payment/                          ← /payment/*
    │   ├── pages/
    │   │   ├── payment/                  ← รอบการขายปัจจุบัน
    │   │   ├── checkout/                 ← หน้าชำระเงิน (cash / QR)
    │   │   ├── session-history/
    │   │   ├── session-detail/
    │   │   └── payment-history/
    │   └── dialogs/
    │       ├── qr-payment-dialog/        ← QR + Upload slip
    │       ├── cash-payment-dialog/
    │       ├── cash-drawer-dialog/       ← เงินเข้า/ออก
    │       └── close-session-dialog/
    │
    └── profile/                          ← /profile
        └── pages/
            └── profile/                  ← แก้ข้อมูล + เปลี่ยนรหัสผ่าน + PIN
```

---

## Frontend Mobile Web (RBMS-POS-Mobile-Web)

```
RBMS-POS-Mobile-Web/
├── angular.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── ng-openapi-gen.json                   ← เฉพาะ Customer/SelfOrder/ShopSettings/QrRedirect APIs
├── swagger.json
└── src/app/
    ├── app.module.ts
    ├── app-routing.module.ts
    │
    ├── core/
    │   ├── api/                          ← Generated (เฉพาะ APIs ที่ใช้ฝั่งลูกค้า)
    │   ├── guards/
    │   │   └── customer-auth.guard.ts    ← ตรวจ CustomerSession token
    │   ├── interceptors/
    │   │   └── customer-token.interceptor.ts ← แนบ qrToken/customerToken
    │   ├── services/
    │   │   ├── customer-auth.service.ts  ← QR token + nickname state
    │   │   ├── cart.service.ts           ← Cart state (Signal)
    │   │   ├── shop-status.service.ts    ← เช็คร้านเปิด/ปิด
    │   │   └── customer-signalr.service.ts ← Subscribe OrderHub group: customer-{qrToken}
    │   └── models/
    │
    ├── layouts/
    │   └── customer-layout/              ← Header (โต๊ะ + nickname) + Footer Nav + Outlet
    │
    ├── shared/                           ← Component library (button, card, dialog, etc.)
    │
    └── features/                         ← 5 lazy-loaded modules
        ├── auths/                        ← /auth (QR token verify + ตั้ง nickname)
        ├── menu/                         ← /menu (browse), /menu/:menuId (detail + options)
        ├── cart/                         ← /cart (ตะกร้า + ยืนยันสั่ง)
        ├── orders/                       ← /orders (real-time tracking)
        ├── bill/                         ← /bill/waiting, /summary, /upload, /complete
        └── actions/                      ← Shared actions (call-waiter, request-bill, request-cash)
```

---

## doc/

```
doc/
├── agents/
│   ├── system-analyst.md              ← SA Agent spec
│   ├── backend-expert.md              ← Backend Agent spec
│   ├── frontend-expert.md             ← Frontend Agent spec (+ UX/UI)
│   └── code-reviewer.md               ← Code Review Agent spec
│
├── architecture/
│   ├── project-structure.md           ← ไฟล์นี้
│   ├── system-overview.md             ← N-Tier + Data Flow + Tech Stack
│   ├── database-api-reference.md      ← Schema + Endpoints ครบทั้งหมด
│   ├── design-system.md               ← Color tokens + Typography
│   ├── icon-system.md                 ← GenericIcon + PrimeIcons
│   ├── file-management.md             ← TbFile + S3/MinIO architecture
│   ├── https-security.md              ← HTTPS + Security
│   └── auto-cleanup.md                ← Background cleanup jobs
│
├── deployment/
│   ├── DEPLOYMENT-GUIDE.md            ← Production deployment guide
│   └── SERVER-INFO-CHECKLIST.md       ← Server info template
│
├── development/
│   ├── quick-start.md                 ← Setup + รันโปรเจคครั้งแรก
│   ├── module-development-workflow.md ← End-to-End 16 ขั้นตอน
│   ├── backend-guide.md               ← Backend 10-step + Conventions
│   ├── backend-coding-standards.md    ← DO/DON'T ทุก layer
│   ├── frontend-guidelines.md         ← Frontend patterns
│   ├── frontend-coding-standards.md   ← DO/DON'T Frontend
│   └── ai-prompting-guide.md          ← AI Agents + prompt templates
│
├── features/
│   └── project-status.md              ← สถานะระบบ + Workflow ทุกโมดูล
│
├── requirements/                      ← Business requirements (REQ-*)
│   ├── REQ-menu-system.md
│   ├── REQ-kitchen-system.md
│   ├── REQ-payment-system.md
│   ├── REQ-self-order-system.md
│   ├── REQ-noti-system.md
│   ├── REQ-table-system.md
│   ├── REQ-order-system.md
│   └── REQ-dashboard-system.md
│
└── tasks/                             ← Task tracking (เก็บเฉพาะระบบหลัก)
    ├── README.md
    ├── TASK-development-roadmap.md
    ├── TASK-backend-patterns.md
    ├── TASK-file-management.md
    ├── TASK-forgot-password.md
    ├── TASK-menu-system.md
    ├── TASK-shop-settings.md
    ├── TASK-table-system.md
    ├── TASK-order-system.md
    ├── TASK-kitchen-system.md
    ├── TASK-payment-system.md
    ├── TASK-notification-system.md
    ├── TASK-self-order-system.md
    ├── TASK-dashboard.md
    ├── TASK-employee-enhancement.md
    └── TASK-production-deployment.md
```

---

## Entity Summary

### Entity ที่ inherit BaseEntity (มี audit + soft delete) — 31 ตัว

| Domain | Entity | PK | PK Type |
|--------|--------|----|---------|
| Auth | TbUser | UserId | Guid |
| Authorization | TbmPosition | PositionId | int |
| Authorization | TbmPermission | PermissionId | int |
| Authorization | TbmModule | ModuleId | int |
| Authorization | TbmAuthorizeMatrix | AuthorizeMatrixId | int |
| Authorization | TbAuthorizeMatrixPosition | AuthMatrixPositionId | int |
| Admin | TbServiceCharge | ServiceChargeId | int |
| Admin | TbShopSettings | ShopSettingsId | int |
| Admin | TbShopOperatingHour | ShopOperatingHourId | int |
| Common | TbFile | FileId | int |
| HumanResource | TbEmployee | EmployeeId | int |
| HumanResource | TbEmployeeAddress | EmployeeAddressId | int |
| HumanResource | TbEmployeeEducation | EmployeeEducationId | int |
| HumanResource | TbEmployeeWorkHistory | EmployeeWorkHistoryId | int |
| Menu | TbMenu | MenuId | int |
| Menu | TbMenuSubCategory | SubCategoryId | int |
| Menu | TbOptionGroup | OptionGroupId | int (hard delete) |
| Menu | TbOptionItem | OptionItemId | int (hard delete) |
| Menu | TbMenuOptionGroup | MenuOptionGroupId | int (hard delete) |
| Table | TbZone | ZoneId | int |
| Table | TbTable | TableId | int |
| Table | TbTableLink | TableLinkId | int (hard delete) |
| Table | TbFloorObject | FloorObjectId | int |
| Table | TbReservation | ReservationId | int |
| Order | TbOrder | OrderId | int |
| Order | TbOrderItem | OrderItemId | int |
| Order | TbOrderBill | OrderBillId | int |
| Payment | TbPayment | PaymentId | int |
| Payment | TbCashierSession | CashierSessionId | int |
| Payment | TbCashDrawerTransaction | CashDrawerTransactionId | int |

### Entity ที่ไม่ inherit BaseEntity (lifecycle เฉพาะ) — 7 ตัว

| Domain | Entity | PK | เหตุผล |
|--------|--------|----|--------|
| Auth | TbRefreshToken | RefreshTokenId (Guid) | มี expiry, revoke |
| Auth | TbPasswordResetToken | PasswordResetTokenId (Guid) | OTP/Reset Token lifecycle |
| Auth | TbPasswordHistory | PasswordHistoryId (int) | Append-only log |
| Notification | TbNotification | NotificationId (int) | Hard delete (ข้อมูลชั่วคราว) |
| Notification | TbNotificationRead | NotificationReadId (int) | Hard delete |
| Customer | TbCustomerSession | CustomerSessionId (int) | มี expiry สำหรับ QR session |
| Order | TbOrderItemOption | OrderItemOptionId (int) | M:M snapshot table (Order item × Option) |

---

## Services Summary

### Backend Services (~25)

| Module | Service | หน้าที่ |
|--------|---------|---------|
| Business.Admin | AuthService | Login, Logout, Refresh, Forgot/Reset/Change Password, PIN setup/verify/change/reset |
| Business.Admin | JwtTokenService | Generate + Validate JWT |
| Business.Admin | ReCaptchaService | Verify Google ReCaptcha v3 |
| Business.Admin | S3StorageService | Upload/Download/Delete จาก MinIO/S3 |
| Business.Admin | FileService | TbFile CRUD + S3 integration |
| Business.Admin | ServiceChargeService | Service Charge CRUD + dropdown |
| Business.Admin | ShopSettingsService | Shop Settings + Operating Hours + Branding |
| Business.Admin | UserService | User list, reset login attempts, update |
| Business.Admin | CashierSessionService | เปิด-ปิดกะ + cash in/out + history |
| Business.Admin | DashboardService | Overview, Top Selling, Peak Hours, Sales Report |
| Business.Admin | EmailService (impl) | ส่งอีเมล SMTP |
| Business.Authorization | PositionService | Position CRUD + dropdown |
| Business.Authorization | PermissionService | Module tree + Permission Matrix + GetUserPermissions |
| Business.HumanResource | EmployeeService | Employee CRUD + sub-entities + create-user + my-profile |
| Business.Menu | MenuService | Menu CRUD (food/beverage/dessert) |
| Business.Menu | MenuCategoryService | Sub Category CRUD + sort-order |
| Business.Menu | MenuOptionService | Option Group + Option Items CRUD |
| Business.Notification | NotificationService | CRUD + Mark Read + Clear |
| Business.Notification | NotificationDeliveryService | SignalR broadcast helpers (ส่ง notification ไปกลุ่ม) |
| Business.Order | OrderService | Order CRUD + items + send-kitchen + serve + void + cancel |
| Business.Order | OrderBillService | Request bill + Split + Unsplit + Update charges |
| Business.Order | OrderSignalRService | Broadcast OrderUpdated, TableStatusChanged ฯลฯ |
| Business.Order | KitchenService | Kitchen queue + prepare/ready |
| Business.Order | CustomerService | Self-Order: bill, claim/release, upload slip |
| Business.Order | SelfOrderService | Self-Order: auth, menu, cart, orders, actions |
| Business.Order | QrRedirectService | Short URL → Long URL |
| Business.Payment | PaymentService | Cash + QR confirm + Upload Slip + Get + History |
| Business.Payment | ReceiptService | Generate receipt + consolidated receipt |
| Business.Payment | SlipOcrService | OCR สลิป |
| Business.Table | TableService | Table CRUD + operations |
| Business.Table | ZoneService | Zone CRUD + active + sort-order |
| Business.Table | FloorObjectService | FloorObject CRUD + positions |
| Business.Table | ReservationService | Reservation CRUD + status transitions |
| Business.Table | TableLinkService | Link/Unlink tables |

---

## Related Docs

- [project-status.md](../features/project-status.md) — สถานะ + Workflow ทุกระบบ
- [system-overview.md](system-overview.md) — N-Tier + Data Flow + Tech Stack
- [database-api-reference.md](database-api-reference.md) — Schema + Endpoints
- [backend-guide.md](../development/backend-guide.md) — คู่มือ Backend
- [frontend-guidelines.md](../development/frontend-guidelines.md) — คู่มือ Frontend
- [file-management.md](file-management.md) — File/S3 Architecture
- [design-system.md](design-system.md) — Design Tokens
- [icon-system.md](icon-system.md) — Icon System
