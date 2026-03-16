# ภาพรวมสถาปัตยกรรมระบบ RBMS-POS

**Last Updated: 2026-03-16**

> **เอกสารที่เกี่ยวข้อง:**
> - [backend-guide.md](../development/backend-guide.md) — คู่มือพัฒนา Backend + 10-Step Workflow + Database Conventions

---

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Frontend** | Angular 19.1, Tailwind CSS 3.4, PrimeNG, Angular Signals, ng-openapi-gen, SignalR Client |
| **Backend** | ASP.NET Core 9.0, Entity Framework Core, SignalR |
| **Database** | SQL Server |
| **API Docs** | Swagger/OpenAPI (Swashbuckle) |

---

## สถาปัตยกรรม Backend (N-Tier)

```
RBMS.POS.WebAPI                    → Controllers, Filters, Hubs, Program.cs
POS.Main.Business.Admin            → Auth, ServiceCharge, ShopSettings, File, S3, JWT, ReCaptcha, Email
POS.Main.Business.Authorization    → Position, Permission (RBAC)
POS.Main.Business.Menu             → Menu
POS.Main.Business.HumanResource    → Employee + sub-entities (Address, Education, WorkHistory)
POS.Main.Repositories             → Repository interfaces + implementations, UnitOfWork
POS.Main.Dal                      → Entities, DbContext, Migrations, Entity Configurations
POS.Main.Core                     → Enums, Constants, Custom Exceptions, Helpers
```

**ทิศทาง Dependency (ห้าม Circular Reference):**

```
WebAPI → Business.* (Admin / Authorization / Menu / HumanResource) → Repositories → Dal → Core
```

**Data Flow:**

```
Request → Controller → Service → Repository → Database
                ↓           ↓          ↓
Response ← DTO Mapping ← Entity ← EF Core
```

---

## โครงสร้างไฟล์ Backend

```
Backend-POS/POS.Main/
├── RBMS.POS.WebAPI/
│   ├── Controllers/BaseController.cs + {Name}Controller.cs
│   ├── Filters/GlobalExceptionFilter.cs + CustomOperationIdFilter.cs + PermissionAuthorizeAttribute.cs
│   ├── Hubs/OrderHub.cs              ← SignalR Hub (stub — รอ Order Module)
│   └── Program.cs
│
├── POS.Main.Business.Admin/              ← Auth, ServiceCharge, ShopSettings, File, S3, JWT
├── POS.Main.Business.Authorization/      ← Position, Permission (RBAC)
├── POS.Main.Business.Menu/               ← Menu
├── POS.Main.Business.HumanResource/      ← Employee + sub-entities
│   └── {SubFolder}/
│       ├── Interfaces/I{Name}Service.cs
│       ├── Services/{Name}Service.cs
│       └── Models/                        ← DTOs + Manual Mappers
│
├── POS.Main.Repositories/
│   ├── Interfaces/I{Name}Repository.cs
│   ├── Implementations/{Name}Repository.cs
│   └── UnitOfWork/IUnitOfWork.cs + UnitOfWork.cs
│
├── POS.Main.Dal/
│   ├── Entities/{Domain}/Tb{Name}.cs      ← ต้อง inherit BaseEntity
│   ├── EntityConfigurations/Tb{Name}Configuration.cs
│   └── POSMainContext.cs
│
└── POS.Main.Core/
    ├── Enums/E{Name}.cs
    ├── Exceptions/                        ← ValidationException, EntityNotFoundException, BusinessException
    └── Models/                            ← BaseResponseModel, PaginationModel, ListResponseModel
```

---

## สถาปัตยกรรม Frontend (Module-Based)

```
src/app/
├── core/
│   ├── api/services/          ← Generated API clients (ng-openapi-gen)
│   ├── api/models/            ← Generated TypeScript models
│   ├── guards/
│   └── interceptors/
│
├── shared/
│   ├── components/            ← header, side-bar, generic-icon, global-loading, notification-panel
│   ├── cards/                 ← card-template, section-card, empty-view, image-upload-card, field-error, audit-footer
│   ├── dialogs/               ← address-dialog, education-dialog, work-history-dialog, session-timeout, verify-password
│   ├── modals/                ← info-modal, cancel-modal, success-modal
│   ├── dropdowns/             ← dropdown-base + 9 specific dropdowns (active, gender, title, position ฯลฯ)
│   ├── pipes/
│   ├── directives/
│   ├── utils/                 ← markFormDirty, linkDateRange
│   ├── pages/                 ← welcome, access-denied
│   ├── component-interfaces.ts
│   └── shared.module.ts
│
├── layouts/
│   ├── main-layout/
│   └── auth-layout/
│
└── features/                  ← Lazy-loaded feature modules
    ├── {module}/
    │   ├── pages/{page}/      ← Components
    │   ├── components/
    │   └── {module}.module.ts
```

---

## หลักการพัฒนา Frontend

| หัวข้อ | กฎ |
|--------|-----|
| Component | `standalone: false`, declare ใน NgModule เสมอ |
| State Management | Angular Signals (`signal<T>()`) สำหรับ state management — ไม่ใช้ BehaviorSubject |
| Subscription Cleanup | `takeUntilDestroyed(destroyRef)` เป็นหลัก |
| API Client | ใช้ Generated service จาก `core/api/` เท่านั้น — ห้าม HttpClient โดยตรง |
| UI Components | PrimeNG (Table, Dropdown, Button, Dialog ฯลฯ) — import ผ่าน SharedModule |
| Styling | Tailwind design tokens (`primary-*`, `surface-*`, `success-*`, `danger-*`) |
| Lazy Loading | Feature module ทุกตัวต้อง lazy load |

---

## หลักการพัฒนา Backend

| หัวข้อ | กฎ |
|--------|-----|
| Entity | ชื่อขึ้นต้นด้วย `Tb`, inherit `BaseEntity` |
| Entity Config | Fluent API เท่านั้น — ห้าม Data Annotations บน Entity |
| Soft Delete | ใช้ `DeleteFlag` จาก `BaseEntity` — ห้าม hard delete |
| Repository | ผ่าน `IGenericRepository` + `IUnitOfWork` เสมอ — ห้าม DbContext โดยตรง |
| UnitOfWork | Lazy initialization pattern |
| Service | Throw `ValidationException`/`EntityNotFoundException`/`BusinessException` |
| Controller | บาง, ไม่มี try-catch — `GlobalExceptionFilter` จัดการ error อัตโนมัติ |
| DI | Manual registration ใน Program.cs (AddScoped แต่ละ Service/Repository) |
| Async | Async/await ทุก I/O + forward `CancellationToken` เสมอ |
| Transaction | `CommitAsync()` ครั้งเดียวต่อ operation |
| Audit | ทุก Entity inherit `BaseEntity` (audit fields: `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `DeleteFlag`, `DeletedAt`, `DeletedBy`) |

---

## Error Handling

```csharp
// Service — throw specific exception (ไม่ต้อง try-catch ใน Controller)
throw new ValidationException("ข้อความ");      // → HTTP 400
throw new EntityNotFoundException("Name", id);  // → HTTP 404
throw new BusinessException("ข้อความ");         // → HTTP 422

// Controller — บาง ไม่มี try-catch
public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
    => Success(await _productService.GetProductByIdAsync(id, ct));
```

---

## Data Flow: Request → Response

```
1. Angular Component เรียก Generated API Service
         ↓
2. HTTP Request (Bearer JWT)
         ↓
3. Middleware (CORS, Auth, Rate Limit)
         ↓
4. Controller รับ Request → เรียก Service
         ↓
5. Service: Validate → Repository → Business Logic → CommitAsync
         ↓
6. Manual Mapping: Entity → DTO (object initializer)
         ↓
7. Controller return Success(result)
         ↓
8. Angular Component อัพเดต Signal → View อัพเดตอัตโนมัติ
```

---

## โมดูลหลักของระบบ

| โมดูล | หน้าที่ | สถานะ |
|-------|---------|-------|
| **Authentication** | Login, JWT, Forgot/Reset Password, Position-based RBAC | ✅ เสร็จ |
| **Menu** | จัดการเมนูอาหาร, หมวดหมู่, รูปภาพ (S3) | ✅ เสร็จ |
| **Human Resource** | จัดการพนักงาน + ที่อยู่/การศึกษา/ประวัติงาน + สร้างบัญชีผู้ใช้ | ✅ เสร็จ |
| **Admin Settings** | ค่าบริการ (Service Charge) | ✅ เสร็จ |
| **Position / Authorization** | จัดการตำแหน่ง + Permission Matrix (RBAC) | ✅ เสร็จ |
| **Shop Settings** | ข้อมูลร้านค้า, เวลาทำการ, โลโก้/QR Code | ✅ เสร็จ |
| **File Management** | จัดการไฟล์กลาง (S3) — ใช้ผ่าน Menu/Employee/ShopSettings | ✅ เสร็จ |
| **Order / Table / Payment** | POS transactions | ⚠️ ยังไม่เริ่ม (มี Frontend stub) |
| **Kitchen Display** | SignalR real-time | ⚠️ ยังไม่เริ่ม (Hub stub) |
| **Reports** | รายงานยอดขาย | ยังไม่เริ่ม |

---

## คำสั่งที่ใช้บ่อย

```bash
# Backend
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet run                     # รัน API (Swagger: https://localhost:{port}/swagger)

# Migration (รันจาก Backend-POS/)
dotnet ef migrations add Add{Feature} --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI
dotnet ef database update      --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI

# Frontend
cd Frontend-POS/RBMS-POS-Client
ng serve                       # Dev server: http://localhost:4300
npm run gen-api                # Generate TypeScript client จาก Swagger
```

---

## Checklist เพิ่ม Module ใหม่

### Backend
- [ ] Enum ใน `POS.Main.Core/Enums/`
- [ ] Entity `Tb{Name} : BaseEntity` ใน `POS.Main.Dal/Entities/{Domain}/`
- [ ] Entity Configuration (Fluent API) + `HasQueryFilter(!DeleteFlag)`
- [ ] เพิ่ม DbSet + `ApplyConfiguration` ใน DbContext
- [ ] สร้าง Migration + ตรวจสอบ + Apply
- [ ] Repository Interface + Implementation
- [ ] เพิ่ม Repository ใน UnitOfWork (lazy init)
- [ ] DTOs + Manual Mapper ใน `POS.Main.Business.{Module}/Models/`
- [ ] Service Interface + Implementation
- [ ] Controller extends `BaseController` — ไม่มี try-catch
- [ ] ทดสอบทุก endpoint ใน Swagger
- [ ] อัพเดต [database-api-reference.md](database-api-reference.md) (ตาราง, API, ความสัมพันธ์, Enum)

### Frontend
- [ ] `npm run gen-api` หลัง Backend พร้อม
- [ ] สร้าง Feature Module (lazy-loaded)
- [ ] Component ใช้ `standalone: false` + Signals
- [ ] ใช้ PrimeNG components (p-table, p-dropdown, p-button ฯลฯ) — ห้ามเขียนเอง
- [ ] Subscription cleanup ด้วย `takeUntilDestroyed`
- [ ] ใช้ design tokens เท่านั้น
