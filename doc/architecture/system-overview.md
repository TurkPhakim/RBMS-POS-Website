# ภาพรวมสถาปัตยกรรมระบบ RBMS-POS

> Last Updated: 2026-05-30 — อ้างอิงจาก source code จริง

> **เอกสารที่เกี่ยวข้อง:**
> - [project-status.md](../features/project-status.md) — สถานะระบบ + Workflow ทุกโมดูล
> - [database-api-reference.md](database-api-reference.md) — Schema + Endpoints ทั้งหมด
> - [project-structure.md](project-structure.md) — โครงสร้างไฟล์ในโปรเจค
> - [backend-guide.md](../development/backend-guide.md) — คู่มือพัฒนา Backend

---

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี | เวอร์ชัน |
|------|-----------|---------|
| **Backend** | ASP.NET Core | 9.0 |
| | Entity Framework Core | 9.0 |
| | SignalR | (built-in .NET 9) |
| | BCrypt.Net-Next | 4.0 |
| | AWSSDK.S3 (สำหรับ MinIO) | 3.7 |
| | Swashbuckle.AspNetCore | 9.0 |
| **Frontend (Admin)** | Angular | 19.1 |
| | PrimeNG | 19.x |
| | Tailwind CSS | 3.4 |
| | ng-openapi-gen | latest |
| | @microsoft/signalr | 8.x |
| | ng2-charts | latest |
| **Frontend (Mobile)** | Angular | 19.1 |
| | Tailwind CSS | 3.4 |
| | @microsoft/signalr | 8.x |
| **Database** | SQL Server | 2022 |
| **Object Storage** | MinIO (S3-compatible) | latest |
| **Reverse Proxy** | Nginx (Production) | latest |
| **Containerization** | Docker Compose | — |

---

## สถาปัตยกรรมโดยรวม

```
┌──────────────────────────────────────────────────────────────────┐
│  Client Layer                                                    │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐   │
│  │ Admin/Staff Client   │  │ Mobile Web (Self-Order)         │   │
│  │ Angular 19 + PrimeNG │  │ Angular 19 + Tailwind           │   │
│  │ :4300                │  │ :4400                           │   │
│  └──────────┬───────────┘  └─────────────┬───────────────────┘   │
└─────────────┼──────────────────────────────┼─────────────────────┘
              │ HTTPS (REST + SignalR/WS)    │
              ▼                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Backend Layer — ASP.NET Core 9.0 (Port 5300)                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ WebAPI Layer                                               │  │
│  │  ├─ Controllers (23 — thin, no business logic)             │  │
│  │  ├─ Hubs (OrderHub, NotificationHub)                       │  │
│  │  ├─ Filters (GlobalException, PermissionAuthorize,         │  │
│  │  │           CustomOperationId, CustomerAuthorize)         │  │
│  │  ├─ Middleware (Auth, CORS, ExceptionHandling)             │  │
│  │  └─ Program.cs (DI registration, Swagger, JWT setup)       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Business Layer — 8 Modules                                 │  │
│  │  ├─ Admin (Auth, JWT, ServiceCharge, ShopSettings, File,   │  │
│  │  │         S3, Email, ReCaptcha, Cashier Session, User Mgmt)│  │
│  │  ├─ Authorization (Position, Permission Matrix)            │  │
│  │  ├─ HumanResource (Employee + sub-entities)                │  │
│  │  ├─ Menu (Menu, Category, Option Group)                    │  │
│  │  ├─ Notification (Notification, NotificationHub Service)   │  │
│  │  ├─ Order (Order, OrderItem, OrderBill, Split Bill,        │  │
│  │  │         Kitchen, Customer/Self-Order, QR Redirect)      │  │
│  │  ├─ Payment (Cash, QR, Slip OCR, Receipt, Dashboard)       │  │
│  │  └─ Table (Zone, Table, Floor Object, Reservation,         │  │
│  │            Table Link/Merge)                               │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Repository Layer                                           │  │
│  │  ├─ IGenericRepository<T> + GenericRepository<T>           │  │
│  │  ├─ Specific Repositories (~37 ตัว — 1 ต่อ entity)         │  │
│  │  └─ IUnitOfWork (lazy-init properties + CommitAsync())     │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Data Access Layer (DAL)                                    │  │
│  │  ├─ POSMainContext (DbContext) — 37 DbSets                 │  │
│  │  ├─ Entities (37 — inherit BaseEntity)                     │  │
│  │  ├─ Entity Configurations (Fluent API)                     │  │
│  │  ├─ SaveChanges override → auto-stamp audit fields         │  │
│  │  ├─ Global Query Filter → ซ่อน DeleteFlag=true             │  │
│  │  └─ Migrations (53 — chronological)                        │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │ Core Layer                                                 │  │
│  │  ├─ Enums, Exceptions (Validation/NotFound/Business/Auth)  │  │
│  │  ├─ Helpers (PasswordHasher BCrypt)                        │  │
│  │  ├─ Settings (JwtSettings, S3Settings, SmtpSettings, ...)  │  │
│  │  └─ Models (BaseResponseModel<T>, PaginationModel/Result)  │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────┬──────────────────────────────┬─────────────────────┘
              │                              │
              ▼                              ▼
┌──────────────────────────┐  ┌───────────────────────────────────┐
│  SQL Server 2022         │  │  MinIO (S3-compatible Storage)    │
│  RBMS_POS Database       │  │  รูปเมนู / Logo / QR / สลิป       │
└──────────────────────────┘  └───────────────────────────────────┘
```

---

## ทิศทาง Dependency

```
WebAPI
   ↓
Business.Admin, Business.Authorization, Business.HumanResource, Business.Menu,
Business.Notification, Business.Order, Business.Payment, Business.Table
   ↓
Repositories
   ↓
Dal
   ↓
Core
```

**กฎที่ต้องยึด:**
- ไม่มี Circular Reference
- Business modules ระดับเดียวกัน "อ้างอิงข้าม" ผ่าน Interface ใน Core เท่านั้น (เช่น `IEmailService` interface อยู่ใน Core, implementation อยู่ใน Business.Admin)
- WebAPI ไม่ touch DAL โดยตรง — ผ่าน Business เสมอ
- Business ไม่ touch DbContext โดยตรง — ผ่าน Repository + UnitOfWork

---

## Data Flow: Request → Response

```
1. Angular Component
   เรียก Generated API Service (เช่น OrdersService.create(...))
                ↓
2. AuthInterceptor แนบ Bearer JWT + LoadingInterceptor toggle global loading
                ↓
3. HTTP Request → ASP.NET Core Middleware Pipeline
   - CORS → AuthN (JWT validation) → AuthZ (PermissionAuthorize) → ExceptionHandling
                ↓
4. Controller (thin)
   - รับ DTO → Validate (DataAnnotations) → เรียก Service
                ↓
5. Service
   - Business validation → ดึงข้อมูลผ่าน Repository → ประมวลผล
   - Throw specific exception ถ้าผิด (ValidationException, EntityNotFoundException,
     BusinessException) → จัดการโดย GlobalExceptionFilter
                ↓
6. Repository
   - Query ผ่าน UnitOfWork → คืน Entity
                ↓
7. EF Core
   - แปลง LINQ → SQL → ส่งไปที่ SQL Server
                ↓
8. Service (กลับ)
   - Manual Mapping: Entity → Response Model (object initializer + Mapper)
   - หากเป็น write operation → UnitOfWork.CommitAsync() ครั้งเดียว
                ↓
9. Controller return
   - Success(result)  → BaseResponseModel<T> { status:"success", result, ... }
   - หรือ ToActionResult(paginationResult) → PaginationResult<T>
                ↓
10. SignalR (ถ้ามีการเปลี่ยนแปลงที่ต้อง real-time)
    - เรียก IHubContext.Clients.Group(group).SendAsync("Event", data)
                ↓
11. Frontend
    - HttpResponse → อัพเดต Signal → View อัพเดตอัตโนมัติ
    - SignalR client รับ event → อัพเดต Signal ที่เกี่ยวข้อง
```

---

## Backend Module Breakdown (8 Modules)

| Module Project | บริการที่ให้ (Services) | Controller ที่อยู่ใน WebAPI |
| --- | --- | --- |
| `POS.Main.Business.Admin` | AuthService, JwtTokenService, ReCaptchaService, EmailService (impl), S3StorageService, FileService, ServiceChargeService, ShopSettingsService, UserService, CashierSessionService, DashboardService | Auth, Users, ServiceCharges, ShopSettings, File, CashierSessions, Dashboard |
| `POS.Main.Business.Authorization` | PositionService, PermissionService | Positions |
| `POS.Main.Business.HumanResource` | EmployeeService (+ Address, Education, WorkHistory) | HumanResource |
| `POS.Main.Business.Menu` | MenuService, MenuCategoryService, MenuOptionService | MenuItems, MenuCategories, MenuOptions |
| `POS.Main.Business.Notification` | NotificationService, NotificationDeliveryService (SignalR) | Notifications |
| `POS.Main.Business.Order` | OrderService, OrderBillService, OrderSignalRService, KitchenService, CustomerService (Self-Order), QrRedirectService | Orders, Kitchen, Customer, SelfOrder, QrRedirect |
| `POS.Main.Business.Payment` | PaymentService, ReceiptService, SlipOcrService | Payments |
| `POS.Main.Business.Table` | TableService, ZoneService, FloorObjectService, ReservationService, TableLinkService | Tables, Zones, FloorObjects, Reservations |

> **หมายเหตุ**: บาง Controller ใช้ Service จากหลาย Module (เช่น OrdersController ใช้ทั้ง OrderService + PaymentService สำหรับ split-bill update-charges)

---

## Frontend Architecture

### Admin/Staff Client (RBMS-POS-Client)

```
src/app/
├── core/
│   ├── api/                       ← Generated ng-openapi-gen
│   │   ├── services/              ← 23 services (1 ต่อ 1 controller)
│   │   ├── models/                ← TypeScript interfaces
│   │   └── fn/                    ← Functional API calls
│   ├── guards/                    ← AuthGuard, GuestGuard, PermissionGuard
│   ├── interceptors/              ← AuthInterceptor, LoadingInterceptor
│   ├── providers/                 ← API config (rootUrl + token)
│   └── services/                  ← 12+ custom services (Auth, Modal, Loading,
│                                    Notification, SignalR, Breadcrumb, Sidebar,
│                                    ShopBranding, SessionTimeout, ฯลฯ)
│
├── store/                         ← NgRx (Layout state เท่านั้น)
│   └── layout/                    ← sidebar collapse, notification, breadcrumb buttons
│
├── layouts/
│   ├── main-layout/               ← Header + Sidebar + Outlet (มี Auth + Permission)
│   └── auth-layout/               ← สำหรับหน้า public (login, reset-password)
│
├── shared/
│   ├── components/                ← Reusable: header, sidebar, breadcrumb, global-loading,
│   │                                generic-icon, notification-panel
│   ├── cards/                     ← card-template, section-card, image-upload-card,
│   │                                field-error, audit-footer, empty-view
│   ├── dialogs/                   ← Specific dialogs (address, education, work-history,
│   │                                session-timeout, verify-password)
│   ├── modals/                    ← ProgrammaticDialogs: info, cancel, success
│   ├── dropdowns/                 ← 15+ shared dropdowns (extends DropdownBaseComponent)
│   ├── pipes/                     ← date-format, mask-phone, national-id-mask
│   ├── directives/                ← datepicker-icon
│   ├── pages/                     ← welcome, access-denied
│   ├── utils/                     ← markFormDirty, linkDateRange
│   └── shared.module.ts
│
└── features/                      ← Lazy-loaded modules (10)
    ├── auths/                     ← /auth/login, /auth/reset-password
    ├── admin/                     ← /admin-setting/* (users, positions, service-charges, shop-settings)
    ├── human-resource/            ← /human-resource/employees
    ├── menu/                      ← /menu/* (categories, food, beverage, dessert, options)
    ├── dashboard/                 ← /dashboard, /dashboard/sales
    ├── table/                     ← /table/* (floor-plan, zones, reservations)
    ├── order/                     ← /order/* (overview, list, detail, add-items)
    ├── kitchen-display/           ← /kitchen-display/* (food, beverage, dessert)
    ├── payment/                   ← /payment/* (checkout, session-history, payment-history)
    └── profile/                   ← /profile
```

### Mobile Web (RBMS-POS-Mobile-Web)

```
src/app/
├── core/
│   ├── api/                       ← Generated (เฉพาะ CustomerController + SelfOrderController + ShopSettings)
│   ├── guards/                    ← CustomerAuthGuard
│   ├── services/                  ← Customer auth, cart state, SignalR, shop status
│   └── interceptors/              ← Customer token interceptor
│
├── layouts/
│   └── customer-layout/           ← Header (โต๊ะ + ชื่อเล่น) + Footer Nav + Outlet
│
├── shared/                        ← Component library สำหรับ mobile
│
└── features/                      ← 5 Lazy-loaded modules
    ├── auths/                     ← /auth (QR token verify)
    ├── menu/                      ← /menu, /menu/:menuId
    ├── cart/                      ← /cart
    ├── orders/                    ← /orders (real-time tracking)
    ├── bill/                      ← /bill/{waiting,summary,upload,complete}
    └── actions/                   ← Shared actions (call-waiter, request-bill, request-cash)
```

---

## หลักการ Backend

| หัวข้อ | กฎ |
| --- | --- |
| **Entity** | ทุก Entity ต้อง inherit `BaseEntity` (audit + soft delete) — ยกเว้น Log entity และ Session ที่มี lifecycle เฉพาะ |
| **Entity Config** | Fluent API เท่านั้น (ห้าม Data Annotations) — 1 Entity ต่อ 1 Configuration class |
| **Soft Delete** | ใช้ `DeleteFlag` ผ่าน `BaseEntity` — DbContext มี Global Query Filter |
| **Repository** | ผ่าน `IGenericRepository<T>` + `IUnitOfWork` — ห้าม `DbContext` โดยตรง |
| **UnitOfWork** | Lazy initialization pattern — 1 instance ต่อ 1 request scope |
| **Service** | Throw specific exception (Validation/NotFound/Business) — ไม่ต้อง try-catch |
| **Controller** | บาง, inherit `BaseController`, ใช้ helper `Success<T>()` / `ToActionResult()` |
| **DI** | Manual registration ใน `Program.cs` (AddScoped) |
| **Async** | Async/await ทุก I/O + forward `CancellationToken` |
| **Transaction** | `UnitOfWork.CommitAsync()` ครั้งเดียวต่อ operation — explicit `BeginTransactionAsync()` เฉพาะ flow ที่ต้อง atomic ข้าม module |
| **Logging** | Structured logging — `LogInformation("Get {Id}", id)` (ไม่ใช้ string interpolation) |
| **Mapping** | Manual mapping ผ่าน static Mapper class (ห้าม AutoMapper) |
| **Permission** | `[PermissionAuthorize("xxx.read")]` บน Controller method |
| **Response** | `BaseResponseModel<T>` (single), `PaginationResult<T>` (paged), `ListResponseModel<T>` (list) |

## หลักการ Frontend

| หัวข้อ | กฎ |
| --- | --- |
| **Component** | `standalone: false` (NgModule-based) |
| **State** | Angular Signals (`signal<T>()`) — ห้าม `BehaviorSubject` สำหรับ component state |
| **API Client** | ใช้ Generated service จาก `core/api/` — ห้าม HttpClient ตรงๆ |
| **Models** | ใช้ Generated TypeScript interface — ห้ามประกาศเอง |
| **Subscription** | `takeUntilDestroyed(destroyRef)` |
| **Control Flow** | `@if/@for/@switch` (Modern Angular) |
| **UI Library** | PrimeNG (Table, Dialog, Dropdown, Button) ผ่าน SharedModule |
| **Styling** | Tailwind design tokens (`primary-*`, `surface-*`, `success-*`, `danger-*`) |
| **Form Validation** | `markFormDirty()` แสดง error เมื่อกดบันทึก — ไม่ใช้ `markAllAsTouched()` |
| **Search** | Trigger ด้วย Enter key (ไม่ใช้ debounceTime) |
| **Pagination** | Server-Side (`[lazy]="true"` + `onLazyLoad`) สำหรับหน้า list |
| **Modal** | `ModalService.info/cancel/commonSuccess` (programmatic) — ไม่ใช้ @Input/@Output |
| **Lazy Loading** | Feature module ทุกตัว |
| **Dropdown** | Shared dropdown ที่ extends `DropdownBaseComponent` — ห้าม `<p-dropdown>` ใน template |

---

## Real-time Architecture (SignalR)

ระบบใช้ SignalR broadcast event real-time แทน Polling — มี 2 Hub แยกกัน

### OrderHub (`/hubs/order`)

```
Backend: ทุก state change ใน Order/Table → broadcast ผ่าน OrderNotificationService
   ↓
Frontend: Client เลือก JoinGroup เอง (ไม่ auto-join)
   ├── kitchen           ← KDS ทุกสถานี (filter by CategoryType ฝั่ง client)
   ├── floor             ← พนักงานหน้าร้าน + แคชเชียร์ + ผู้จัดการ
   └── table_{tableId}   ← ลูกค้า Mobile Web Self-Order (1 group ต่อ 1 โต๊ะ)

Events ที่ broadcast:
   - NewOrderItems         → kitchen + floor + table_{id}
   - ItemStatusChanged     → kitchen + floor + table_{id}
   - ItemCancelled         → kitchen + floor
   - OrderUpdated          → floor
   - TableStatusChanged    → floor
   - RefreshOrders         → table_{id}
   - SlipUploaded          → floor + table_{id}
   - PaymentCompleted      → floor + table_{id}
   - BillClaimed / BillReleased / BillVoided → table_{id}
```

### NotificationHub (`/hubs/notification`)

```
Backend: เกิด business event ที่ต้องแจ้ง → NotificationDeliveryService
   ↓
   บันทึก TbNotification + ส่ง SignalR event "ReceiveNotification" ไปกลุ่ม
   ↓
Frontend: Auto-join groups ใน OnConnectedAsync ตาม Permission ของ User
   - Kitchen   ← มี kitchen-food.read หรือ kitchen-beverage.read หรือ kitchen-dessert.read
   - Floor     ← มี order-manage.read
   - Cashier   ← มี payment-manage.read
   - Manager   ← มี permission > 10 รายการ หรือ 3 groups ขึ้นไป

Frontend ทำอะไรกับ event:
   - Toast แสดงทันที (วินาทีปัจจุบัน)
   - Notification Drawer (ดึงประวัติจาก /api/notifications)
   - Badge unread count บน Bell icon
```

---

## Authentication Flow Detail

```
┌──────────────┐                                ┌──────────────┐
│  Browser     │                                │   Backend    │
└──────┬───────┘                                └──────┬───────┘
       │ POST /api/admin/auth/login                   │
       │ { username, password, recaptchaToken }       │
       ├──────────────────────────────────────────────►
       │                                              │
       │                                  ┌───────────┴────────────┐
       │                                  │ 1. ReCaptchaService    │
       │                                  │    verify token        │
       │                                  │ 2. UserRepository      │
       │                                  │    GetByUsername       │
       │                                  │ 3. PasswordHasher      │
       │                                  │    BCrypt.Verify       │
       │                                  │ 4. ตรวจสถานะ:           │
       │                                  │    - IsActive?         │
       │                                  │    - IsLockedByAdmin?  │
       │                                  │    - LockedUntil > now?│
       │                                  │ 5. ผิด → ++failedCount  │
       │                                  │    ถ้าครบ 5 → ล็อค 15 นาที│
       │                                  │ 6. ถูก → reset count    │
       │                                  │ 7. JwtTokenService     │
       │                                  │    - AccessToken (15m) │
       │                                  │    - RefreshToken (7d) │
       │                                  │ 8. PermissionService   │
       │                                  │    GetUserPermissions  │
       │                                  └───────────┬────────────┘
       │                                              │
       │  200 OK                                      │
       │  { accessToken, refreshToken, user,          │
       │    permissions: ["menu-food.read", ...] }    │
       ◄──────────────────────────────────────────────┤
       │                                              │
       │ localStorage.setItem('accessToken', ...)     │
       │ AuthService.setUser(...)                     │
       │ Router → /                                   │
       │                                              │
       │ ทุก HTTP request ถัดไป:                       │
       │ Authorization: Bearer {accessToken}          │
       ├──────────────────────────────────────────────►
       │                                              │
       │ ถ้า 401 → AuthInterceptor:                    │
       │ POST /api/admin/auth/refresh-token           │
       │ { refreshToken }                             │
       ├──────────────────────────────────────────────►
       │                                              │
       │  200 OK + new accessToken                    │
       ◄──────────────────────────────────────────────┤
       │  Retry original request                      │
       │                                              │
```

---

## Error Handling

```csharp
// Service throws specific exception
throw new ValidationException("กรุณาระบุชื่อสินค้า");                  // → HTTP 400
throw new EntityNotFoundException("Product", id);                     // → HTTP 404
throw new BusinessException("สินค้าถูกลบไปแล้ว");                       // → HTTP 422
throw new InvalidCredentialsException("Username/Password ไม่ถูกต้อง");  // → HTTP 401
throw new AccountLockedException("บัญชีถูกล็อค 15 นาที");              // → HTTP 423
throw new AccountDisabledException("บัญชีถูกปิด");                     // → HTTP 403

// Controller — thin, no try-catch
public class OrdersController : BaseController
{
    public async Task<IActionResult> GetOrder(int orderId, CancellationToken ct = default)
        => Success(await _orderService.GetOrderByIdAsync(orderId, ct));

    public async Task<IActionResult> GetOrders([FromQuery] PaginationModel param, CancellationToken ct = default)
        => ToActionResult(await _orderService.GetOrdersAsync(param, ct));
}
```

**GlobalExceptionFilter** จัดการทุก unhandled exception → return JSON ที่ format ตรงกันเสมอ:

```json
{
  "status": "fail",
  "result": null,
  "message": "ข้อความ error",
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "Name", "message": "..." }]
}
```

---

## File Management (S3/MinIO)

```
Upload Flow:
┌────────────────────────────────────────────────────────────────┐
│  Frontend                                                      │
│  - HTML form: <input type="file"> + ImageUploadCard            │
│  - FormData: file + metadata fields                            │
│  - POST /api/menu/items (multipart/form-data)                  │
└────────────────────────┬───────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────────┐
│  MenuItemsController.Create(...)                               │
└────────────────────────┬───────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────────┐
│  MenuService.CreateAsync(...)                                  │
│  1. Validate input                                             │
│  2. ถ้ามี file:                                                │
│     - FileService.UploadAsync(file)                            │
│         → S3StorageService.PutObjectAsync(bucket, key, stream) │
│         → คืน TbFile { FileId, FileName, MimeType, S3Key }    │
│  3. สร้าง TbMenu { ImageFileId = TbFile.FileId, ... }          │
│  4. UnitOfWork.CommitAsync()                                   │
└────────────────────────┬───────────────────────────────────────┘
                         ▼
                  Response { MenuId, ImageUrl: /api/admin/file/{fileId} }

Download Flow:
   GET /api/admin/file/{fileId}
      ↓
   FileService.GetFileStreamAsync(fileId)
      → S3StorageService.GetObjectAsync(bucket, key)
      ↓
   return FileStreamResult(stream, mimeType)
```

> ดูรายละเอียดที่ [file-management.md](file-management.md)

---

## Authorization (RBAC) — Position-Based Permission Matrix

```
       TbmModule              TbmPermission
       (tree)                 (read/create/update/delete)
        │                            │
        └────────────┬───────────────┘
                     │ M:M
                     ▼
            TbmAuthorizeMatrix
            (PermissionPath เช่น "menu-food.read")
                     │
                     │ M:M
                     ▼
            TbAuthorizeMatrixPosition
                     │
                     │ N:1
                     ▼
                TbmPosition
                     │
                     │ 1:N
                     ▼
                 TbEmployee ── 1:1 ── TbUser
                                       │
                                       ▼
                                  Login → JWT (พร้อม permission list)
```

**Frontend ใช้ Permission อย่างไร:**

1. **Route Guard** (ตอน navigate):
```typescript
{
  path: 'order/list',
  component: OrderListComponent,
  canActivate: [PermissionGuard],
  data: { permissions: ['order-manage.read'] }
}
```

2. **Component-level** (แสดง/ซ่อนปุ่ม):
```typescript
constructor(private authService: AuthService) {
  this.canCreate = authService.hasPermission('order-manage.create');
  this.canUpdate = authService.hasPermission('order-manage.update');
}
```

3. **Sidebar** ดึง permission ของ user ปัจจุบัน → แสดงเฉพาะเมนูที่มีสิทธิ์

---

## คำสั่งที่ใช้บ่อย

### Backend

```bash
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet run                    # รัน API (Swagger: https://localhost:5300/swagger)
dotnet watch run              # Hot reload

# Migration (run จาก Backend-POS/)
dotnet ef migrations add Add{Feature} --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI
dotnet ef database update     --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI
dotnet ef migrations remove   --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI
```

### Frontend Admin Client

```bash
cd Frontend-POS/RBMS-POS-Client
npm install
npx ng serve                  # Dev server: http://localhost:4300
npm run gen-api               # Generate TypeScript client จาก Swagger
ng build --configuration production
```

### Frontend Mobile Web

```bash
cd Frontend-POS/RBMS-POS-Mobile-Web
npm install
npx ng serve                  # Dev server: http://localhost:4400
npm run gen-api
ng build --configuration production
```

### Docker (Dependencies)

```bash
docker compose up -d sqlserver minio minio-init
```

---

## Production Deployment Overview

ดูรายละเอียดที่ [doc/deployment/DEPLOYMENT-GUIDE.md](../deployment/DEPLOYMENT-GUIDE.md)

```
┌──────────────────────────────────────────────────────────┐
│  Internet                                                │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTPS (443)
                   ▼
┌──────────────────────────────────────────────────────────┐
│  Nginx (Reverse Proxy + SSL/TLS)                         │
│  - Certbot auto-renew                                    │
│  - Route /api/* → Backend                                │
│  - Route /hubs/* → Backend (WebSocket)                   │
│  - Route /client → Admin Client (static)                 │
│  - Route /mobile → Mobile Web (static)                   │
└─┬──────────────────────┬─────────────────────────────┬───┘
  │                      │                             │
  ▼                      ▼                             ▼
┌──────────────┐   ┌──────────────┐           ┌────────────────┐
│ Admin Client │   │ Mobile Web   │           │  Backend API   │
│ (Nginx)      │   │ (Nginx)      │           │ (.NET 9)       │
└──────────────┘   └──────────────┘           └────┬───────────┘
                                                   │
                       ┌───────────────────────────┼──────────────┐
                       ▼                           ▼              ▼
                ┌──────────────┐         ┌──────────────┐  ┌─────────┐
                │ SQL Server   │         │ MinIO        │  │ SMTP    │
                │ (Database)   │         │ (S3 Storage) │  │ (Email) │
                └──────────────┘         └──────────────┘  └─────────┘
```

---

## Related Docs

- [project-status.md](../features/project-status.md) — สถานะปัจจุบัน + Workflow ทุกระบบ
- [project-structure.md](project-structure.md) — โครงสร้างไฟล์
- [database-api-reference.md](database-api-reference.md) — Schema + API
- [file-management.md](file-management.md) — File/Image Architecture (S3/MinIO)
- [design-system.md](design-system.md) — Design Tokens + Typography
- [icon-system.md](icon-system.md) — Icon System
- [https-security.md](https-security.md) — Security Configuration
- [auto-cleanup.md](auto-cleanup.md) — Background Cleanup Jobs
