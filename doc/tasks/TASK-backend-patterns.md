# TASK: Reusable Backend Patterns — BaseEntity, Response Models, BaseController, GlobalExceptionFilter

**สถานะ**: DONE (Backend) / PENDING (Frontend Revise)
**วันที่เริ่ม**: 2026-03-10
**วันที่เสร็จ (Backend)**: 2026-03-10

> นำ Reusable Patterns จากโปรเจคก่อนหน้ามา adapt ให้เข้ากับ RBMS-POS — ครอบคลุม Entity Tracking, Response Models, BaseController, GlobalExceptionFilter
> เอกสารอ้างอิง: [backend-guide.md](../development/backend-guide.md) (section "Reusable Patterns")

---

## กฎที่ต้องยึดถือตลอดการทำ Task

### 1. ห้ามใช้ AutoMapper เด็ดขาด
```csharp
// ห้ามทำ
CreateMap<TbProduct, ProductResponse>();

// ทำแบบนี้เสมอ — Manual Mapper (static class)
public static class ProductMapper
{
    public static ProductResponse ToResponse(TbProduct entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name
    };
}
```

### 2. ห้าม try-catch ใน Controller
```csharp
// ห้ามทำ
public async Task<IActionResult> Get(int id)
{
    try { ... }
    catch (Exception ex) { return StatusCode(500, ...); }
}

// ทำแบบนี้เสมอ — GlobalExceptionFilter จัดการ
public async Task<IActionResult> Get(int id, CancellationToken ct = default)
    => Success(await _productService.GetByIdAsync(id, ct));
```

### 3. Naming Convention ใหม่
```
Entity class  → Tb{Name}          เช่น TbProduct, TbEmployee
Enum          → E{Name}           เช่น EUserRole, EGender (ไม่ใช่ UserRole, Gender)
Soft Delete   → DeleteFlag         (ไม่ใช่ IsDeleted)
Response      → BaseResponseModel<T>  (ไม่ใช่ ApiResponse<T>)
Request DTO   → {Action}{Entity}Request   เช่น CreateEmployeeRequest (ไม่ใช่ CreateEmployeeRequestDto)
Response DTO  → {Entity}Response          เช่น EmployeeResponse (ไม่ใช่ EmployeeResponseDto)
```

### 4. Async/await + CancellationToken ทุก I/O
```csharp
// ทุก method ที่ทำ I/O ต้อง forward CancellationToken
Task<ProductResponse> GetByIdAsync(int id, CancellationToken ct = default);
```

---

## Dependencies / สิ่งที่ต้องเตรียม

| สิ่งที่ต้องมี | สถานะ | หมายเหตุ |
|--------------|-------|---------|
| เอกสาร Reusable Patterns ใน backend-guide.md | มีแล้ว | section "Reusable Patterns" |
| กฎใน CLAUDE.md | มีแล้ว | อัพเดตแล้ว |
| DO/DON'T ใน backend-coding-standards.md | มีแล้ว | section 14 |
| SQL Server ใช้งานได้ | ต้องมี | ใช้สร้าง Migration + ทดสอบ |
| Backend build ผ่าน | ต้องตรวจ | `dotnet build` ก่อนเริ่ม |

---

## แผนการทำงาน (แบ่งเป็น Phase)

> ทำตามลำดับ — Phase 1 เป็น Foundation ที่ Phase อื่นพึ่งพา

---

### Phase 1 — Foundation: BaseEntity + Exceptions + Rename

กระทบ: ทุก Entity, DbContext | ความซับซ้อน: สูง

#### 1.1 สร้าง BaseEntity class (`POS.Main.Dal/Entities/BaseEntity.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี Base class — ทุก Entity define audit fields ซ้ำกันเอง (CreatedAt, UpdatedAt, IsDeleted, etc.)
- Entity `Employee` มี 6 audit fields ที่ซ้ำกับทุก Entity อื่น

**เป้าหมาย:**
- สร้าง `BaseEntity` abstract class ชั้นเดียว รวม audit fields ทั้งหมด:
```csharp
public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public bool DeleteFlag { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? DeletedBy { get; set; }
}
```

---

#### 1.2 สร้าง Exception classes (`POS.Main.Core/Exceptions/`)

**ปัญหาปัจจุบัน:**
- Service ใช้ `KeyNotFoundException` (built-in) และ `InvalidOperationException` — ไม่สื่อความหมาย
- Controller ต้อง catch แยก exception type แล้ว map เป็น HTTP status เอง

**เป้าหมาย:**
- สร้าง 3 Exception classes:
```csharp
// POS.Main.Core/Exceptions/ValidationException.cs
public class ValidationException : Exception  // → 400

// POS.Main.Core/Exceptions/EntityNotFoundException.cs
public class EntityNotFoundException : Exception  // → 404
{
    public string EntityName { get; }
    public object EntityId { get; }
}

// POS.Main.Core/Exceptions/BusinessException.cs
public class BusinessException : Exception  // → 422
```

---

#### 1.3 Rename Entities → Tb prefix

**ปัญหาปัจจุบัน:**
- Entity classes ใช้ชื่อไม่มี prefix: `User`, `Employee`, `Menu`, `MenuCategory`, `ServiceCharge`, `Sale`, `SaleItem`, `Table`, `Order`, `OrderItem`

**เป้าหมาย:**
- เปลี่ยนชื่อ class ทุก Entity → `Tb{Name}`:

**Class เก่า → ใหม่:**
```
User           → TbUser
Employee       → TbEmployee
Menu           → TbMenu
MenuCategory   → TbMenuCategory
ServiceCharge  → TbServiceCharge
Sale           → TbSale
SaleItem       → TbSaleItem
Table          → TbTable
Order          → TbOrder
OrderItem      → TbOrderItem
```

- อัพเดต references ทั้งหมด: DbContext DbSet, Repository, Service, EntityConfiguration, Migration
- **ชื่อตารางใน DB ไม่ต้องเปลี่ยน** — ใช้ Fluent API `.ToTable("OriginalName")` ถ้าจำเป็น

---

#### 1.4 Entity inherit BaseEntity + ลบ audit fields ที่ซ้ำ

**ปัญหาปัจจุบัน:**
- ทุก Entity define audit fields ซ้ำ: `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IsDeleted`
- ตัวอย่าง `Employee.cs` มี fields เหล่านี้ที่ lines 128-148

**เป้าหมาย:**
- ทุก Entity inherit `BaseEntity`
- ลบ audit fields ที่ซ้ำออกจาก Entity class
```csharp
// เก่า
public class Employee
{
    public int Id { get; set; }
    public string FirstNameThai { get; set; } = string.Empty;
    // ... business fields ...
    public DateTime CreatedAt { get; set; }        // ซ้ำ
    public DateTime? UpdatedAt { get; set; }       // ซ้ำ
    public string? CreatedBy { get; set; }         // ซ้ำ
    public string? UpdatedBy { get; set; }         // ซ้ำ
    public bool IsDeleted { get; set; } = false;   // ซ้ำ
}

// ใหม่
public class TbEmployee : BaseEntity
{
    public int Id { get; set; }
    public string FirstNameThai { get; set; } = string.Empty;
    // ... business fields เท่านั้น — audit fields อยู่ใน BaseEntity แล้ว
}
```

---

#### 1.5 Rename `IsDeleted` → `DeleteFlag` ทุก Entity

**ปัญหาปัจจุบัน:**
- ใช้ `IsDeleted` (bool) เป็น soft delete field
- ไม่มี `DeletedAt`, `DeletedBy` สำหรับ audit trail

**เป้าหมาย:**
- `IsDeleted` → `DeleteFlag` (อยู่ใน BaseEntity แล้ว)
- เพิ่ม `DeletedAt` (DateTime?) + `DeletedBy` (int?) — อยู่ใน BaseEntity

**Dependencies:** ทำหลัง 1.4 (inherit BaseEntity แล้ว fields เหล่านี้มาจาก BaseEntity อัตโนมัติ)

---

#### 1.6 สร้าง Migration สำหรับ rename

**ปัญหาปัจจุบัน:**
- DB column ชื่อ `IsDeleted` ไม่มี `DeletedAt`, `DeletedBy`

**เป้าหมาย:**
- สร้าง Migration:
  - Rename column `IsDeleted` → `DeleteFlag`
  - เพิ่ม column `DeletedAt` (nullable DateTime)
  - เพิ่ม column `DeletedBy` (nullable int)
- ชื่อตารางใน DB ไม่เปลี่ยน (แค่ C# class name เปลี่ยน)

```bash
dotnet ef migrations add RenameToDeleteFlagAndAddDeleteAudit \
  --project POS.Main/POS.Main.Dal \
  --startup-project POS.Main/RBMS.POS.WebAPI
```

---

#### 1.7 Rename Enums → E prefix

**ปัญหาปัจจุบัน:**
- Enum classes ไม่มี `E` prefix ตาม naming convention: `UserRole`, `MenuCategory`, `Gender`, `EmploymentStatus`

**เป้าหมาย:**
- เปลี่ยนชื่อ Enum ทุกตัวให้ขึ้นต้นด้วย `E`:

**ไฟล์ที่ต้องแก้ (4 ไฟล์):**
```
POS.Main.Core/Enums/UserRole.cs          → EUserRole
POS.Main.Core/Enums/MenuCategory.cs      → EMenuCategory
POS.Main.Core/Enums/Gender.cs            → EGender
POS.Main.Core/Enums/EmploymentStatus.cs  → EEmploymentStatus
```

**สิ่งที่ต้องทำ:**
1. Rename enum class name (เช่น `public enum UserRole` → `public enum EUserRole`)
2. Rename ไฟล์ (เช่น `UserRole.cs` → `EUserRole.cs`)
3. อัพเดต references ทั้งหมด — Entity properties, Service, DTOs, Controller parameters ที่ใช้ enum เหล่านี้

**Dependencies:** ทำพร้อมกับ 1.3 (Entity rename) ได้ เพราะเป็นการ rename เหมือนกัน

---

#### 1.8 Rename DTOs → ลบ suffix `Dto`

**ปัญหาปัจจุบัน:**
- DTO classes ทุกตัวมี suffix `Dto` ที่ไม่ตรง naming convention (convention ใช้ `Request`/`Response` เป็น suffix)

**เป้าหมาย:**
- ลบ `Dto` suffix ออกจากทุก DTO class + rename ไฟล์

**Auth module (5 ไฟล์):**
```
LoginRequestDto         → LoginRequest
LoginResponseDto        → LoginResponse
RefreshTokenRequestDto  → RefreshTokenRequest
TokenResponseDto        → TokenResponse
UserDto                 → UserResponse
```

**AdminSettings module (4 ไฟล์):**
```
CreateServiceChargeRequestDto  → CreateServiceChargeRequest
UpdateServiceChargeRequestDto  → UpdateServiceChargeRequest
ServiceChargeResponseDto       → ServiceChargeResponse
ServiceChargeDropdownDto       → ServiceChargeDropdown
```

**Menu module (3 ไฟล์):**
```
MenuResponseDto         → MenuResponse
CreateMenuRequestDto    → CreateMenuRequest
UpdateMenuRequestDto    → UpdateMenuRequest
```

**HumanResource module (3 ไฟล์):**
```
EmployeeResponseDto     → EmployeeResponse
CreateEmployeeRequestDto → CreateEmployeeRequest
UpdateEmployeeRequestDto → UpdateEmployeeRequest
```

**สิ่งที่ต้องทำ (ต่อ DTO แต่ละตัว):**
1. Rename class name (ลบ `Dto` suffix)
2. Rename ไฟล์ (ลบ `Dto` suffix)
3. อัพเดต references — Service, Controller, MappingProfile (ก่อนลบ), Swagger XML comments
4. อัพเดต AutoMapper profile (ถ้ายังมี ณ ตอนนี้ — จะถูกลบใน Phase 5)

**Dependencies:** ทำก่อน Phase 5 (ลบ AutoMapper) — เปลี่ยนชื่อก่อน แล้วค่อยลบ AutoMapper ทีหลัง

---

### Phase 2 — DbContext: SaveChanges Override + Global Query Filter

กระทบ: DbContext | ความซับซ้อน: ปานกลาง

#### 2.1 Override SaveChanges/SaveChangesAsync (`POS.Main.Dal/POSMainContext.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี SaveChanges override — Service ต้อง set `CreatedAt`, `UpdatedAt` เองทุกครั้ง
- ลืม set audit fields → ข้อมูลไม่สมบูรณ์

**เป้าหมาย:**
- Override `SaveChangesAsync` (และ `SaveChanges`) ให้ auto-stamp:
  - `Added` → set `CreatedAt = DateTime.UtcNow`, `CreatedBy = currentUser`
  - `Modified` → set `UpdatedAt = DateTime.UtcNow`, `UpdatedBy = currentUser`
- ลบโค้ด set audit fields ใน Service ทุกตัว (ไม่ต้องทำเองอีกต่อไป)

```csharp
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    StampTrackingFields();
    return await base.SaveChangesAsync(ct);
}

private void StampTrackingFields()
{
    var entries = ChangeTracker.Entries<BaseEntity>();
    var now = DateTime.UtcNow;
    var user = _userIdGetter?.Invoke();

    foreach (var entry in entries)
    {
        switch (entry.State)
        {
            case EntityState.Added:
                entry.Entity.CreatedAt = now;
                entry.Entity.CreatedBy = user;
                break;
            case EntityState.Modified:
                entry.Entity.UpdatedAt = now;
                entry.Entity.UpdatedBy = user;
                break;
        }
    }
}
```

---

#### 2.2 Global Query Filter — auto-filter DeleteFlag (`POS.Main.Dal/POSMainContext.cs`)

**ปัญหาปัจจุบัน:**
- Repository ต้อง `.Where(x => !x.IsDeleted)` เองทุก query
- ลืมใส่ filter → แสดงข้อมูลที่ถูกลบ

**เป้าหมาย:**
- `OnModelCreating` สแกน Entity ทั้งหมดที่ inherit `BaseEntity` แล้วใส่ Query Filter อัตโนมัติ:
```csharp
// ใน OnModelCreating
foreach (var entityType in modelBuilder.Model.GetEntityTypes())
{
    if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
    {
        // HasQueryFilter(x => !x.DeleteFlag) สำหรับทุก Entity
        var parameter = Expression.Parameter(entityType.ClrType, "e");
        var property = Expression.Property(parameter, nameof(BaseEntity.DeleteFlag));
        var filter = Expression.Lambda(Expression.Not(property), parameter);
        entityType.SetQueryFilter(filter);
    }
}
```
- ลบ `.Where(x => !x.IsDeleted)` จาก Repository ทุกตัว
- ใช้ `.IgnoreQueryFilters()` เมื่อต้องการดึงข้อมูลที่ถูกลบด้วย

---

#### 2.3 ตั้งค่า UserIdGetter (`Program.cs` + `POSMainContext.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มีระบบดึง User ID อัตโนมัติสำหรับ audit fields

**เป้าหมาย:**
- DbContext รับ `Func<int?>` สำหรับดึง current user ID:
```csharp
// POSMainContext constructor
private readonly Func<int?>? _userIdGetter;

public POSMainContext(DbContextOptions<POSMainContext> options, Func<int?>? userIdGetter = null)
    : base(options)
{
    _userIdGetter = userIdGetter;
}
```
- Register ใน `Program.cs`:
```csharp
builder.Services.AddDbContext<POSMainContext>((sp, options) =>
{
    options.UseSqlServer(connectionString);
}, ServiceLifetime.Scoped);

builder.Services.AddScoped<Func<int?>>(sp =>
{
    var httpContext = sp.GetService<IHttpContextAccessor>()?.HttpContext;
    var claim = httpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    return () => claim != null ? int.Parse(claim) : null;
});
```

---

### Phase 3 — Response Models + BaseController

กระทบ: ทุก Service, ทุก Controller | ความซับซ้อน: สูง

#### 3.1 สร้าง BaseResponseModel (`POS.Main.Core/Models/BaseResponseModel.cs`)

**ปัญหาปัจจุบัน:**
- ใช้ `ApiResponse<T>` ที่มี `Success` (bool), `Data`, `Message`, `Timestamp`
- ไม่มี `Code`, `Errors` สำหรับ error detail

**เป้าหมาย:**
```csharp
public class BaseResponseModel<T>
{
    public string Status { get; set; } = "success";   // "success" | "fail"
    public T? Result { get; set; }
    public string? Message { get; set; }
    public string? Code { get; set; }                  // error code
    public object? Errors { get; set; }                // validation errors
}
```

---

#### 3.2 สร้าง PaginationModel (`POS.Main.Core/Models/PaginationModel.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี Pagination model — ทุก list endpoint return ทั้งหมดไม่มีแบ่งหน้า

**เป้าหมาย:**
```csharp
public class PaginationModel
{
    public int Page { get; set; } = 1;
    public int ItemPerPage { get; set; } = 10;
    public string? Search { get; set; }
    public string? OrderBy { get; set; }
    public bool IsDescending { get; set; } = false;

    public int Skip => (Page - 1) * ItemPerPage;
    public int Take => ItemPerPage;
}
```

---

#### 3.3 สร้าง PaginationResult (`POS.Main.Core/Models/PaginationResult.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี paginated response format

**เป้าหมาย:**
```csharp
public class PaginationResult<T>
{
    public string Status { get; set; } = "success";
    public List<T> Results { get; set; } = new();
    public int Page { get; set; }
    public int Total { get; set; }
    public int ItemPerPage { get; set; }
    public string? Message { get; set; }
}
```

---

#### 3.4 สร้าง ListResponseModel (`POS.Main.Core/Models/ListResponseModel.cs`)

**ปัญหาปัจจุบัน:**
- ใช้ `ApiResponse<IEnumerable<T>>` — ไม่สื่อว่าเป็น list response

**เป้าหมาย:**
```csharp
public class ListResponseModel<T>
{
    public string Status { get; set; } = "success";
    public List<T> Results { get; set; } = new();
    public string? Message { get; set; }
}
```

---

#### 3.5 สร้าง BaseController (`RBMS.POS.WebAPI/Controllers/BaseController.cs`)

**ปัญหาปัจจุบัน:**
- Controller inherit `ControllerBase` โดยตรง
- สร้าง response object เองทุก action — ซ้ำซ้อนมาก
- Controller อ้วน มี try-catch ทุก action

**เป้าหมาย:**
```csharp
[ApiController]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    // หมายเหตุ: ไม่มี [Route] attribute — แต่ละ Controller ระบุ route เอง เช่น [Route("api/menu")]
    protected IActionResult Success<T>(T data, string? message = null)
        => Ok(new BaseResponseModel<T>
        {
            Status = "success",
            Result = data,
            Message = message
        });

    protected IActionResult Success(string? message = null)
        => Ok(new BaseResponseModel<object>
        {
            Status = "success",
            Message = message
        });

    protected IActionResult ToActionResult<T>(PaginationResult<T> result)
        => Ok(result);

    protected string? GetCurrentUserId()
        => User?.Identity?.Name;
}
```

---

#### 3.6 ลบ ApiResponse, ApiErrorResponse, ErrorDetail

**ปัญหาปัจจุบัน:**
- `ApiResponse<T>` (`POS.Main.Business.Admin/Models/Common/ApiResponse.cs`)
- `ApiResponse` (non-generic version)
- `ApiErrorResponse` (`POS.Main.Business.Admin/Models/Common/ApiErrorResponse.cs`)
- `ErrorDetail` (อยู่ในไฟล์เดียวกับ ApiErrorResponse)

**เป้าหมาย:**
- ลบทั้ง 3 class (ApiResponse, ApiErrorResponse, ErrorDetail)
- แทนที่ด้วย `BaseResponseModel<T>` + GlobalExceptionFilter
- อัพเดต references ทั้งหมดใน Controller และ Service

---

### Phase 4 — GlobalExceptionFilter + Controller Cleanup

กระทบ: ทุก Controller | ความซับซ้อน: ปานกลาง

#### 4.1 สร้าง GlobalExceptionFilter (`RBMS.POS.WebAPI/Filters/GlobalExceptionFilter.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี global exception handler
- ทุก Controller มี try-catch ซ้ำกันทุก action (5+ actions x จำนวน controllers)

**เป้าหมาย:**
```csharp
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        var (statusCode, code) = context.Exception switch
        {
            ValidationException     => (400, "VALIDATION_ERROR"),
            EntityNotFoundException => (404, "NOT_FOUND"),
            BusinessException       => (422, "BUSINESS_ERROR"),
            UnauthorizedAccessException => (401, "UNAUTHORIZED"),
            _                       => (500, "INTERNAL_ERROR")
        };

        if (statusCode == 500)
            _logger.LogError(context.Exception, "Unhandled exception");
        else
            _logger.LogWarning(context.Exception, "Handled exception: {Code}", code);

        context.Result = new ObjectResult(new BaseResponseModel<object>
        {
            Status = "fail",
            Code = code,
            Message = context.Exception.Message
        })
        {
            StatusCode = statusCode
        };

        context.ExceptionHandled = true;
    }
}
```

---

#### 4.2 Register GlobalExceptionFilter ใน Program.cs

**ปัญหาปัจจุบัน:**
- `Program.cs` ไม่มี exception filter registration
- ยังมี AutoMapper registration อยู่

**เป้าหมาย:**
```csharp
// Program.cs
builder.Services.AddControllers(options =>
{
    options.Filters.Add<GlobalExceptionFilter>();
});
```

---

#### 4.3 ลบ try-catch จากทุก Controller

**ปัญหาปัจจุบัน:**
- ทุก action ใน Controller มี try-catch block ที่ซ้ำกัน
- ตัวอย่าง `ServiceChargesController.cs` มี try-catch 6 จุด (GetAll, GetById, GetDropdownList, Create, Update, Delete)

**เป้าหมาย:**
- ลบ try-catch ทั้งหมด — GlobalExceptionFilter จัดการ
- Controller บาง ทำแค่เรียก Service แล้ว wrap ด้วย `Success()`:
```csharp
// เก่า (30+ lines)
public async Task<IActionResult> GetAll()
{
    try
    {
        var serviceCharges = await _serviceChargeService.GetAllAsync();
        return Ok(new ApiResponse<IEnumerable<ServiceChargeResponseDto>>
        {
            Success = true,
            Data = serviceCharges,
            Message = "Service charges retrieved successfully",
            Timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving service charges");
        return StatusCode(500, new ApiErrorResponse { ... });
    }
}

// ใหม่ (2 lines)
[HttpGet]
public async Task<IActionResult> GetAll(CancellationToken ct = default)
    => Success(await _serviceChargeService.GetAllAsync(ct));
```

---

#### 4.4 Controller inherit BaseController แทน ControllerBase

**ปัญหาปัจจุบัน:**
- Controller inherit `ControllerBase` โดยตรง
- ทุก Controller ใส่ `[ApiController]`, `[Route(...)]`, `[Produces(...)]` ซ้ำ

**เป้าหมาย:**
- เปลี่ยน `: ControllerBase` → `: BaseController`
- ลบ `[ApiController]`, `[Produces("application/json")]` ออก (อยู่ใน BaseController แล้ว)
- เพิ่ม `[Route("api/{module}")]` explicit ต่อ Controller (เช่น `[Route("api/menu")]`, `[Route("api/admin/auth")]`)
- ลบ `ILogger` injection ถ้าไม่มีการใช้งาน custom logging (GlobalExceptionFilter log ให้แล้ว)

---

#### 4.5 Service throw specific exceptions

**ปัญหาปัจจุบัน:**
- Service throw `KeyNotFoundException` → ควรเป็น `EntityNotFoundException`
- Service throw `InvalidOperationException` → ควรเป็น `ValidationException` หรือ `BusinessException`

**เป้าหมาย:**
```csharp
// เก่า
throw new KeyNotFoundException($"Service charge with ID {id} not found");

// ใหม่
throw new EntityNotFoundException("ServiceCharge", id);

// เก่า
throw new InvalidOperationException("Service charge name already exists");

// ใหม่
throw new ValidationException("ชื่อ Service Charge ซ้ำ กรุณาใช้ชื่ออื่น");
```

---

### Phase 5 — ลบ AutoMapper + Manual Mapper

กระทบ: ทุก Service ที่ใช้ AutoMapper | ความซับซ้อน: ปานกลาง

#### 5.1 ลบ AutoMapper packages

**ปัญหาปัจจุบัน:**
- `POS.Main.Business.Admin.csproj` มี AutoMapper NuGet reference
- อาจมีใน project อื่นด้วย

**เป้าหมาย:**
```bash
dotnet remove POS.Main/POS.Main.Business.Admin/POS.Main.Business.Admin.csproj package AutoMapper
dotnet remove POS.Main/POS.Main.Business.Admin/POS.Main.Business.Admin.csproj package AutoMapper.Extensions.Microsoft.DependencyInjection
```

---

#### 5.2 ลบ MappingProfile ทุกตัว

**ปัญหาปัจจุบัน:**
- มี MappingProfile classes ที่ define mapping ระหว่าง Entity ↔ DTO

**เป้าหมาย:**
- ลบไฟล์ MappingProfile ทั้งหมด
- ค้นหาด้วย: `Glob "Backend-POS/**/*Profile*.cs"` หรือ `Grep "CreateMap" path=Backend-POS/`

---

#### 5.3 สร้าง Manual Mapper (static class) แทน

**ปัญหาปัจจุบัน:**
- Service ใช้ `_mapper.Map<TbProduct>(request)` — ต้องเปลี่ยนเป็น manual mapping

**เป้าหมาย:**
- สร้าง static Mapper class ต่อ feature:
```csharp
// POS.Main.Business.Admin/{Module}/Models/{Name}Mapper.cs
public static class ServiceChargeMapper
{
    public static ServiceChargeResponse ToResponse(TbServiceCharge entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Rate = entity.Rate,
        IsActive = entity.IsActive
    };

    public static TbServiceCharge ToEntity(CreateServiceChargeRequest request) => new()
    {
        Name = request.Name,
        Rate = request.Rate,
        IsActive = request.IsActive
    };
}
```

---

#### 5.4 ลบ AutoMapper registration จาก Program.cs

**ปัญหาปัจจุบัน:**
- `Program.cs` มี `builder.Services.AddAutoMapper(...)` หรือ `services.AddAutoMapper(...)`

**เป้าหมาย:**
- ลบบรรทัด registration ออก
- ลบ `using` ที่เกี่ยวกับ AutoMapper

---

### Phase 6 — ทดสอบ + gen-api

กระทบ: ทั้งระบบ | ความซับซ้อน: ต่ำ (แต่สำคัญ)

#### 6.1 dotnet build ผ่าน

**เป้าหมาย:**
```bash
cd Backend-POS/POS.Main
dotnet build
# ต้องไม่มี error
```

---

#### 6.2 dotnet ef database update

**เป้าหมาย:**
```bash
dotnet ef database update \
  --project POS.Main/POS.Main.Dal \
  --startup-project POS.Main/RBMS.POS.WebAPI
```

---

#### 6.3 ทดสอบทุก endpoint ใน Swagger

**เป้าหมาย:**
- รัน `dotnet run` แล้วเปิด Swagger
- ทดสอบ CRUD ทุก Controller:
  - GET (list) — ต้อง return `BaseResponseModel<T>` format
  - GET (by id) — ต้อง return `BaseResponseModel<T>` format
  - POST — ต้อง return 201 + `BaseResponseModel<T>`
  - PUT — ต้อง return 200 + `BaseResponseModel<T>`
  - DELETE — ต้อง soft delete (set DeleteFlag=true)
  - GET deleted item — ต้อง return 404 (Global Query Filter ซ่อนแล้ว)

---

#### 6.4 npm run gen-api (Frontend regenerate API client)

**เป้าหมาย:**
- Response format เปลี่ยนแล้ว → Frontend ต้อง regenerate:
```bash
cd Frontend-POS/RBMS-POS-Client
npm run gen-api
```
- ตรวจว่า generated models ใช้ `BaseResponseModel` format ถูกต้อง
- อัพเดต Frontend components ที่อ่าน `res.data` → `res.result`

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1.1  BaseEntity class                ← Foundation ที่ทุก Phase พึ่งพา
2. Phase 1.2  Exception classes               ← เตรียม Exception ก่อนใช้ใน Phase 4
3. Phase 1.3  Rename Entities → Tb prefix     ← ทำพร้อม 1.4, 1.5, 1.7, 1.8
4. Phase 1.4  Entity inherit BaseEntity       ← ลบ audit fields ที่ซ้ำ
5. Phase 1.5  IsDeleted → DeleteFlag          ← มากับ BaseEntity อัตโนมัติ
6. Phase 1.7  Rename Enums → E prefix         ← ทำพร้อม 1.3 (naming convention batch)
7. Phase 1.8  Rename DTOs → ลบ Dto suffix     ← ทำพร้อม 1.3 (naming convention batch)
8. Phase 1.6  Migration                       ← apply changes ลง DB
9. Phase 2.1  SaveChanges Override            ← auto-stamp tracking fields
10. Phase 2.2  Global Query Filter            ← auto-hide deleted records
11. Phase 2.3  UserIdGetter                   ← ให้ SaveChanges รู้ว่าใครทำ
12. Phase 3.1-3.4  Response Models            ← สร้าง models ก่อนใช้ใน Controller
13. Phase 3.5  BaseController                 ← ใช้ Response Models
14. Phase 3.6  ลบ ApiResponse/ApiErrorResponse← ลบของเก่า
15. Phase 4.1  GlobalExceptionFilter          ← สร้างก่อน cleanup Controller
16. Phase 4.2  Register Filter                ← เปิดใช้งาน
17. Phase 4.3-4.4  Controller Cleanup         ← ลบ try-catch + inherit BaseController
18. Phase 4.5  Service exceptions             ← เปลี่ยน exception types
19. Phase 5.1-5.4  ลบ AutoMapper              ← ทำหลังสุดเพราะกระทบเยอะ
20. Phase 6.1-6.4  ทดสอบ                      ← verify ทุกอย่างทำงาน
```

---

## หมายเหตุ

- **Phase 1-2 เป็น Breaking Change** — ทำแล้ว build ไม่ผ่านจนกว่าจะ update references ทั้งหมด ควรทำรวดเดียว (1.3 + 1.7 + 1.8 เป็น naming rename batch ทำพร้อมกันได้)
- **Phase 3-4 สามารถทำแยก Controller ได้** — ทำทีละ Controller เพื่อลดความเสี่ยง
- **Phase 5 อาจทำพร้อม Phase 3-4** — เพราะต้อง update Service methods อยู่แล้ว
- **Phase 6 ต้องทำหลังสุดเสมอ** — verify ว่าทุกอย่างทำงานถูกต้อง
- **Frontend กระทบ** — หลัง Phase 6.4 (gen-api) ต้องอัพเดต Frontend components ที่อ่าน `res.data` → `res.result`

---

## Related Docs

- [backend-guide.md](../development/backend-guide.md) — Reusable Patterns section (โค้ดตัวอย่างทั้งหมด)
- [backend-coding-standards.md](../development/backend-coding-standards.md) — DO/DON'T section 14
- [CLAUDE.md](../../CLAUDE.md) — Architecture rules + Naming Conventions
