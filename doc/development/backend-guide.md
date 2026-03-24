# คู่มือพัฒนา Backend — RBMS-POS

> อัพเดตล่าสุด: 2026-03-16
>
> **เอกสารที่เกี่ยวข้อง:**
> - [backend-coding-standards.md](backend-coding-standards.md) — DO/DON'T ละเอียดทุก layer
> - [module-development-workflow.md](module-development-workflow.md) — End-to-End 16 ขั้นตอน (Backend + Frontend)
> - [backend-expert.md](../agents/backend-expert.md) — AI Agent spec สำหรับ Backend

---

## ภาพรวม Architecture

ระบบใช้ **N-Tier Layered Architecture** แบ่งเป็น 5 Layer เรียงตาม dependency direction:

```
┌─────────────────────────────────────────────┐
│  RBMS.POS.WebAPI           (API Layer)       │  ← Controllers, Middleware, Program.cs
├─────────────────────────────────────────────┤
│  POS.Main.Business.*       (Business Layer)  │  ← Services, Models, Manual Mappers
├─────────────────────────────────────────────┤
│  POS.Main.Repositories     (Repository)      │  ← Repository interfaces + UnitOfWork
├─────────────────────────────────────────────┤
│  POS.Main.Dal              (Data Access)     │  ← Entities, DbContext, Migrations, Configs
├─────────────────────────────────────────────┤
│  POS.Main.Core             (Core/Domain)     │  ← Enums, Constants, Exceptions, Helpers
└─────────────────────────────────────────────┘
```

**กฎ Dependency (ห้าม Circular Reference):**
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

## โครงสร้างไฟล์

```
Backend-POS/POS.Main/
├── RBMS.POS.WebAPI/
│   └── Controllers/{Name}Controller.cs
│
├── POS.Main.Business.Admin/          ← Auth, ServiceCharge, ShopSettings, File, S3, JWT
├── POS.Main.Business.Authorization/  ← Position, Permission (RBAC)
├── POS.Main.Business.Menu/           ← Menu management
├── POS.Main.Business.HumanResource/  ← Employee + sub-entities (Address, Education, WorkHistory)
│   └── {SubFolder}/
│       ├── Interfaces/
│       │   └── I{Name}Service.cs
│       ├── Services/
│       │   └── {Name}Service.cs
│       └── Models/
│           ├── {Name}ResponseModel.cs
│           ├── Create{Name}RequestModel.cs
│           ├── Update{Name}RequestModel.cs
│           └── {Name}Mapper.cs        ← Manual Mapper (static class)
│
├── POS.Main.Repositories/
│   ├── Interfaces/I{Name}Repository.cs
│   ├── Implementations/{Name}Repository.cs
│   └── UnitOfWork/
│       ├── IUnitOfWork.cs
│       └── UnitOfWork.cs
│
├── POS.Main.Dal/
│   ├── Entities/{Domain}/Tb{Name}.cs
│   ├── EntityConfigurations/Tb{Name}Configuration.cs
│   └── POSMainContext.cs
│
└── POS.Main.Core/
    ├── Enums/E{Name}.cs
    └── Exceptions/
        ├── ValidationException.cs
        ├── EntityNotFoundException.cs
        └── BusinessException.cs
```

---

## Patterns หลักแต่ละ Layer

### Layer 1: Entity (POS.Main.Dal)

Entity **ต้อง** inherit `BaseEntity` และใช้ prefix `Tb`:

```csharp
// POS.Main.Dal/Entities/{Domain}/TbProduct.cs
public class TbProduct : BaseEntity
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual TbCategory Category { get; set; } = null!;
}
```

**BaseEntity** (Audit + Soft Delete — อยู่ใน POS.Main.Dal):

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

    // Navigation properties for audit
    public virtual TbEmployee? CreatedByEmployee { get; set; }
    public virtual TbEmployee? UpdatedByEmployee { get; set; }
}
```

### Layer 2: Entity Configuration (POS.Main.Dal)

ใช้ **Fluent API เท่านั้น** — ห้าม Data Annotations บน Entity:

```csharp
// POS.Main.Dal/EntityConfigurations/TbProductConfiguration.cs
public class TbProductConfiguration : IEntityTypeConfiguration<TbProduct>
{
    public void Configure(EntityTypeBuilder<TbProduct> builder)
    {
        builder.ToTable("TbProducts");
        builder.HasKey(x => x.ProductId);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.HasOne(x => x.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.DeleteFlag);

        // Query Filter — ซ่อน soft-deleted records อัตโนมัติ
        builder.HasQueryFilter(x => !x.DeleteFlag);
    }
}
```

### Layer 3: Repository (POS.Main.Repositories)

```csharp
// Interface
public interface IProductRepository : IGenericRepository<TbProduct>
{
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken ct = default);
    IQueryable<TbProduct> GetActiveProducts();
}

// Implementation
public class ProductRepository : GenericRepository<TbProduct>, IProductRepository
{
    public ProductRepository(POSMainContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken ct = default)
        => await _dbSet.AnyAsync(p => p.Name == name
            && (excludeId == null || p.ProductId != excludeId), ct);

    public IQueryable<TbProduct> GetActiveProducts()
        => _dbSet.Where(p => p.IsActive);  // DeleteFlag กรองด้วย QueryFilter อัตโนมัติ
}
```

### UnitOfWork — Lazy Initialization Pattern

```csharp
// Interface
public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    ICategoryRepository Categories { get; }
    Task<int> CommitAsync(CancellationToken ct = default);
}

// Implementation — Lazy init ทุก Repository
public class UnitOfWork : IUnitOfWork
{
    private readonly POSMainContext _context;
    private IProductRepository? _products;
    private ICategoryRepository? _categories;

    public UnitOfWork(POSMainContext context) => _context = context;

    public IProductRepository Products =>
        _products ??= new ProductRepository(_context);

    public ICategoryRepository Categories =>
        _categories ??= new CategoryRepository(_context);

    public async Task<int> CommitAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);
}
```

### Layer 4: Service (POS.Main.Business.Admin)

```csharp
// Interface: POS.Main.Business.Admin/{Module}/Interfaces/IProductService.cs
public interface IProductService
{
    Task<ProductResponseModel> GetProductByIdAsync(int id, CancellationToken ct = default);
    Task<ProductResponseModel> CreateProductAsync(CreateProductRequestModel request, CancellationToken ct = default);
    Task DeleteProductAsync(int id, CancellationToken ct = default);
}

// Implementation
public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IUnitOfWork unitOfWork, ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ProductResponseModel> CreateProductAsync(
        CreateProductRequestModel request, CancellationToken ct = default)
    {
        // 1. Guard clauses — throw specific exceptions
        if (await _unitOfWork.Products.ExistsByNameAsync(request.Name, ct: ct))
            throw new ValidationException($"สินค้าชื่อ '{request.Name}' มีอยู่แล้ว");

        // 2. Manual Map + Persist (ไม่ต้อง try-catch — GlobalExceptionFilter จัดการ unhandled exceptions)
        var product = ProductMapper.ToEntity(request);
        await _unitOfWork.Products.AddAsync(product, ct);
        await _unitOfWork.CommitAsync(ct);  // Commit ครั้งเดียวต่อ transaction

        _logger.LogInformation("Product {ProductId} '{Name}' created", product.ProductId, product.Name);
        return ProductMapper.ToResponse(product);
    }

    public async Task DeleteProductAsync(int id, CancellationToken ct = default)
    {
        var product = await _unitOfWork.Products
            .GetAll()
            .FirstOrDefaultAsync(p => p.ProductId == id, ct);

        if (product == null)
            throw new EntityNotFoundException("Product", id);  // → 404

        // Soft delete — DbContext auto-stamp DeletedAt/DeletedBy ผ่าน SaveChanges override
        product.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);
    }
}
```

**Exception types และ HTTP status ที่ได้ (จัดการโดย `GlobalExceptionFilter`):**

| Exception | HTTP Status | Code | ใช้เมื่อ |
|-----------|-------------|------|---------|
| `ValidationException` | 400 | `VALIDATION_ERROR` | ข้อมูล input ผิด |
| `EntityNotFoundException` | 404 | `NOT_FOUND` | ไม่พบข้อมูล |
| `BusinessException` | 422 | `BUSINESS_ERROR` | Business rule ถูก violate |
| `AccountLockedException` | 423 | `ACCOUNT_LOCKED` | บัญชีถูกล็อค |
| `AccountDisabledException` | 403 | `ACCOUNT_DISABLED` | บัญชีถูกปิดการใช้งาน |
| `InvalidCredentialsException` | 401 | `INVALID_CREDENTIALS` | ข้อมูลเข้าสู่ระบบไม่ถูกต้อง |
| `InvalidRefreshTokenException` | 401 | `INVALID_REFRESH_TOKEN` | Refresh token ไม่ถูกต้อง |
| `AuthenticationException` | 401 | `AUTHENTICATION_ERROR` | Authentication ล้มเหลว |
| `UnauthorizedAccessException` | 401 | `UNAUTHORIZED` | ไม่มีสิทธิ์เข้าถึง |
| อื่นๆ (unhandled) | 500 | `INTERNAL_ERROR` | ข้อผิดพลาดภายในระบบ |

### Manual Mapper (Static Class)

```csharp
// POS.Main.Business.Admin/{Module}/Models/ProductMapper.cs
public static class ProductMapper
{
    public static ProductResponseModel ToResponse(TbProduct entity)
    {
        return new ProductResponseModel
        {
            ProductId = entity.ProductId,
            Name = entity.Name,
            Price = entity.Price,
            Stock = entity.Stock,
            CategoryName = entity.Category?.Name ?? string.Empty,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };
    }

    public static TbProduct ToEntity(CreateProductRequestModel request)
    {
        return new TbProduct
        {
            Name = request.Name,
            Price = request.Price,
            CategoryId = request.CategoryId,
            IsActive = true
        };
    }

    public static void UpdateEntity(TbProduct entity, UpdateProductRequestModel request)
    {
        entity.Name = request.Name;
        entity.Price = request.Price;
        entity.CategoryId = request.CategoryId;
        entity.IsActive = request.IsActive;
    }
}
```

### Layer 5: Controller (RBMS.POS.WebAPI)

Controller **ต้องบาง** — ไม่มี try-catch, ไม่มี business logic:

```csharp
[ApiController]
[Route("api/inventory")]
[Authorize]
[Produces("application/json")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
        => _productService = productService;

    /// <summary>Get all products with optional filtering</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] ProductFilter filter, CancellationToken ct = default)
        => Success(await _productService.GetProductsAsync(filter, ct));

    /// <summary>Get product by ID</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductResponseModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
        => Success(await _productService.GetProductByIdAsync(id, ct));

    /// <summary>Create a new product</summary>
    [HttpPost]
    [ProducesResponseType(typeof(BaseResponseModel<ProductResponseModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductRequestModel request, CancellationToken ct = default)
        => Success(await _productService.CreateProductAsync(request, ct));

    /// <summary>Delete product (soft delete)</summary>
    [HttpDelete("{productId}")]
    [ProducesResponseType(typeof(BaseResponseModel<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(int productId, CancellationToken ct = default)
    {
        await _productService.DeleteProductAsync(productId, ct);
        return Success("ลบสำเร็จ");
    }
}
```

> **หมายเหตุ**: `GlobalExceptionFilter` ใน `RBMS.POS.WebAPI` จัดการ exceptions → HTTP responses อัตโนมัติ ไม่ต้องเขียน try-catch ใน Controller

### Dependency Injection — Manual Registration

```csharp
// Program.cs — Register Service และ Repository ด้วยมือทีละตัว
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<IShopSettingsService, ShopSettingsService>();
// ... register ทีละตัว
```

> ใช้ manual DI registration — register Service/Repository ทีละตัวใน `Program.cs` เพื่อความชัดเจนและควบคุมได้

---

## 10-Step Workflow การสร้าง Feature ใหม่

### ตัวอย่าง: Product Module

---

### Step 1: สร้าง Enum (ถ้าจำเป็น)

**ที่ตั้ง:** `POS.Main.Core/Enums/`

```csharp
// EProductStatus.cs
namespace POS.Main.Core.Enums;

public enum EProductStatus
{
    Active = 1,    // สินค้าพร้อมขาย
    Inactive = 2,  // สินค้าหยุดขาย
}
```

**เมื่อต้องสร้าง Enum:** เมื่อ field มี set ของค่าที่จำกัด เช่น status, type, category

---

### Step 2: สร้าง Entity

**ที่ตั้ง:** `POS.Main.Dal/Entities/{Domain}/`

```csharp
// POS.Main.Dal/Entities/Inventory/TbProduct.cs
// หมายเหตุ: ไฟล์อยู่ใน sub-folder ตาม domain แต่ใช้ flat namespace เสมอ
namespace POS.Main.Dal.Entities;

public class TbProduct : BaseEntity
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual TbCategory Category { get; set; } = null!;
}
```

**กฎ Entity:**
- ชื่อคลาสต้องขึ้นต้นด้วย `Tb` เสมอ
- **ต้อง inherit `BaseEntity`** — ห้าม define audit fields ซ้ำ
- **ข้อยกเว้น:** Entity ที่เป็น lifecycle/log (เช่น TbRefreshToken, TbLoginHistory) ไม่ต้อง inherit BaseEntity เพราะมี lifecycle เฉพาะตัว (เช่น token expiry, login date) ไม่ต้องมี soft delete หรือ full audit tracking
- Primary Key ตั้งชื่อ `{ClassName}Id` (เช่น `ProductId`)
- Soft Delete ใช้ `DeleteFlag` จาก `BaseEntity` — ห้าม `IsDeleted` หรือ `IsActive` เป็น soft delete flag
- **Entity sub-folders ตาม domain** (Auth, HumanResource, Menu, Admin) แต่ **ทุก Entity ใช้ flat namespace `POS.Main.Dal.Entities`**

---

### Step 3: สร้าง Entity Configuration (Fluent API)

**ที่ตั้ง:** `POS.Main.Dal/EntityConfigurations/`

```csharp
// TbProductConfiguration.cs
public class TbProductConfiguration : IEntityTypeConfiguration<TbProduct>
{
    public void Configure(EntityTypeBuilder<TbProduct> builder)
    {
        builder.ToTable("TbProducts");
        builder.HasKey(x => x.ProductId);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        // Enum — เก็บเป็น string ในฐานข้อมูล
        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Relationship
        builder.HasOne(x => x.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.DeleteFlag);

        // Query Filter (ซ่อน soft-deleted records อัตโนมัติทุก query)
        builder.HasQueryFilter(x => !x.DeleteFlag);
    }
}
```

---

### Step 4: เพิ่ม DbSet และ ApplyConfiguration ใน DbContext

**ที่ตั้ง:** `POS.Main.Dal/POSMainContext.cs`

```csharp
public class POSMainContext : DbContext
{
    // เพิ่ม DbSet ใหม่
    public DbSet<TbProduct> Products { get; set; }  // ← เพิ่ม

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new TbProductConfiguration());  // ← เพิ่ม
    }
}
```

---

### Step 5: สร้าง Migration และ Update Database

```bash
# รันจาก Backend-POS/ directory
dotnet ef migrations add Add{Feature}Tables \
  --project POS.Main/POS.Main.Dal \
  --startup-project POS.Main/RBMS.POS.WebAPI

# ตรวจสอบไฟล์ Migration ใน POS.Main.Dal/Migrations/ ก่อน apply
dotnet ef database update \
  --project POS.Main/POS.Main.Dal \
  --startup-project POS.Main/RBMS.POS.WebAPI

# ถ้า Migration ผิด
dotnet ef migrations remove \
  --project POS.Main/POS.Main.Dal \
  --startup-project POS.Main/RBMS.POS.WebAPI
```

**สิ่งที่ต้องตรวจสอบในไฟล์ Migration:**
- Column types ถูกต้อง (decimal, nvarchar, int)
- Indexes ครบ
- Foreign Keys ถูกต้อง
- ไม่มี data ที่ไม่ต้องการใน `Up()`

> **กฎเหล็ก:** ต้อง `database update` **ทันที** หลังตรวจสอบ Migration file — ห้ามข้ามไปทำ Repository/Service ก่อน เพราะจะทำให้ run backend ไม่ได้

---

### Step 6: สร้าง Repository Interface + Implementation

**Interface** (`POS.Main.Repositories/Interfaces/IProductRepository.cs`):

```csharp
public interface IProductRepository : IGenericRepository<TbProduct>
{
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken ct = default);
    IQueryable<TbProduct> GetActiveProducts();
    Task<TbProduct?> GetByIdWithCategoryAsync(int id, CancellationToken ct = default);
}
```

**Implementation** (`POS.Main.Repositories/Implementations/ProductRepository.cs`):

```csharp
public class ProductRepository : GenericRepository<TbProduct>, IProductRepository
{
    public ProductRepository(POSMainContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken ct = default)
        => await _dbSet.AnyAsync(p => p.Name == name
            && (excludeId == null || p.ProductId != excludeId), ct);

    public IQueryable<TbProduct> GetActiveProducts()
        => _dbSet.Where(p => p.IsActive);

    public async Task<TbProduct?> GetByIdWithCategoryAsync(int id, CancellationToken ct = default)
        => await _dbSet
            .AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.ProductId == id, ct);
}
```

---

### Step 7: เพิ่ม Repository ใน UnitOfWork

**เพิ่มใน Interface** (`IUnitOfWork.cs`):

```csharp
public interface IUnitOfWork : IDisposable
{
    // ... existing repositories ...
    IProductRepository Products { get; }  // ← เพิ่ม
    Task<int> CommitAsync(CancellationToken ct = default);
}
```

**เพิ่มใน Implementation** (`UnitOfWork.cs`) — ใช้ Lazy init:

```csharp
private IProductRepository? _products;
public IProductRepository Products =>
    _products ??= new ProductRepository(_context);  // ← เพิ่ม
```

---

### Step 8: สร้าง DTOs, Manual Mapper, Service Interface, Service Implementation

**ที่ตั้ง:** `POS.Main.Business.Admin/{Module}/`

**Request/Response DTOs** (`Models/`):

```csharp
// CreateProductRequestModel.cs
public class CreateProductRequestModel
{
    [Required(ErrorMessage = "กรุณาระบุชื่อสินค้า")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "ราคาต้องมากกว่า 0")]
    public decimal Price { get; set; }

    [Required]
    public int CategoryId { get; set; }
}

// ProductResponseModel.cs
public class ProductResponseModel
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Manual Mapper** (`Models/ProductMapper.cs`):

```csharp
public static class ProductMapper
{
    public static ProductResponseModel ToResponse(TbProduct entity)
    {
        return new ProductResponseModel
        {
            ProductId = entity.ProductId,
            Name = entity.Name,
            Price = entity.Price,
            Stock = entity.Stock,
            CategoryName = entity.Category?.Name ?? string.Empty,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };
    }

    public static TbProduct ToEntity(CreateProductRequestModel request)
    {
        return new TbProduct
        {
            Name = request.Name,
            Price = request.Price,
            CategoryId = request.CategoryId,
            IsActive = true
        };
    }

    public static void UpdateEntity(TbProduct entity, UpdateProductRequestModel request)
    {
        entity.Name = request.Name;
        entity.Price = request.Price;
        entity.CategoryId = request.CategoryId;
        entity.IsActive = request.IsActive;
    }
}
```

**Service** (`Services/ProductService.cs`):

```csharp
public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IUnitOfWork uow, ILogger<ProductService> logger)
    {
        _unitOfWork = uow;
        _logger = logger;
    }

    public async Task<IEnumerable<ProductResponseModel>> GetProductsAsync(CancellationToken ct = default)
    {
        var products = await _unitOfWork.Products
            .GetActiveProducts()
            .AsNoTracking()
            .Include(p => p.Category)
            .ToListAsync(ct);

        return products.Select(ProductMapper.ToResponse);
    }

    public async Task<ProductResponseModel> GetProductByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await _unitOfWork.Products.GetByIdWithCategoryAsync(id, ct)
            ?? throw new EntityNotFoundException("Product", id);

        return ProductMapper.ToResponse(product);
    }

    public async Task<ProductResponseModel> CreateProductAsync(
        CreateProductRequestModel request, CancellationToken ct = default)
    {
        if (await _unitOfWork.Products.ExistsByNameAsync(request.Name, ct: ct))
            throw new ValidationException($"สินค้าชื่อ '{request.Name}' มีอยู่แล้ว");

        var product = ProductMapper.ToEntity(request);
        await _unitOfWork.Products.AddAsync(product, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Product {ProductId} created", product.ProductId);
        return ProductMapper.ToResponse(product);
    }

    public async Task DeleteProductAsync(int id, CancellationToken ct = default)
    {
        var product = await _unitOfWork.Products.GetAll()
            .FirstOrDefaultAsync(p => p.ProductId == id, ct)
            ?? throw new EntityNotFoundException("Product", id);

        // Soft delete — DbContext auto-stamp DeletedAt/DeletedBy
        product.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);
    }
}
```

---

### Step 9: สร้าง Controller

**ที่ตั้ง:** `RBMS.POS.WebAPI/Controllers/ProductsController.cs`

```csharp
[ApiController]
[Route("api/inventory")]
[Authorize]
[Produces("application/json")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
        => _productService = productService;

    /// <summary>ดึงรายการสินค้าทั้งหมด</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts(CancellationToken ct = default)
        => Success(await _productService.GetProductsAsync(ct));

    /// <summary>ดึงสินค้าตาม ID</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductResponseModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
        => Success(await _productService.GetProductByIdAsync(id, ct));

    /// <summary>สร้างสินค้าใหม่</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductResponseModel), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductRequestModel request, CancellationToken ct = default)
    {
        var result = await _productService.CreateProductAsync(request, ct);
        return CreatedAtAction(nameof(GetProduct), new { id = result.ProductId }, result);
    }

    /// <summary>ลบสินค้า (Soft Delete)</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken ct = default)
    {
        await _productService.DeleteProductAsync(id, ct);
        return NoContent();
    }
}
```

> **Route Pattern:** ใช้ explicit route per controller `[Route("api/{module}")]` แทน `[Route("api/v1/[controller]")]`
> - Module เดียว Controller เดียว: `api/{module}` เช่น `api/menu`, `api/humanresource`, `api/inventory`
> - Module ที่มีหลาย Controller (Admin): `api/{module}/{controller}` เช่น `api/admin/auth`, `api/admin/servicecharges`, `api/admin/file`
> - BaseController ไม่มี `[Route]` attribute — แต่ละ Controller ระบุ route เอง

---

### Step 10: ทดสอบด้วย Swagger

```bash
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet build   # ตรวจสอบ compile error ก่อน
dotnet run

# เปิด Swagger UI
# https://localhost:{port}/swagger
```

ทดสอบ endpoints ตามลำดับ:
1. `POST /api/inventory` — สร้างข้อมูลทดสอบ
2. `GET /api/inventory` — ตรวจสอบข้อมูล
3. `GET /api/inventory/{id}` — ตรวจสอบ id ที่สร้าง
4. `DELETE /api/inventory/{id}` — ตรวจสอบ soft delete
5. `GET /api/inventory/{id}` อีกครั้ง — ต้องได้ 404

เมื่อ Backend พร้อม → Generate TypeScript client:
```bash
cd Frontend-POS/RBMS-POS-Client
npm run gen-api
```

---

### Step 10.5: Permission Constants + Seed Data (ถ้า module มี authorization)

> **กฎเหล็ก:** ถ้า Controller endpoints ใช้ `[HasPermission]` หรือ authorization → **ต้อง** seed permission data ก่อนไปทำ Frontend — ถ้าไม่ seed user จะเข้า endpoint ไม่ได้

**ขั้นตอน:**

**1. เพิ่ม Permission Constants** ใน `POS.Main.Core/Constants/Permissions.cs`:

```csharp
public static class Inventory
{
    public const string Read = "inventory.read";
    public const string Create = "inventory.create";
    public const string Update = "inventory.update";
    public const string Delete = "inventory.delete";
}
```

**2. สร้าง Seed Migration** — Empty migration สำหรับใส่ seed data:

```bash
dotnet ef migrations add SeedInventoryPermissions \
    --project POS.Main/POS.Main.Dal \
    --startup-project POS.Main/RBMS.POS.WebAPI
```

**3. เพิ่ม seed data ใน Migration file:**

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    // 1. Insert Module (ถ้ายังไม่มี)
    migrationBuilder.InsertData(
        table: "TbmModules",
        columns: new[] { "ModuleId", "CreatedAt", "DeleteFlag", "IsActive",
                         "ModuleCode", "ModuleName", "ParentModuleId", "SortOrder" },
        values: new object[] { 20, new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                               false, true, "inventory", "คลังสินค้า", null, 5 });

    // 2. Insert AuthorizeMatrix entries (Module + Permission combinations)
    migrationBuilder.InsertData(
        table: "TbmAuthorizeMatrices",
        columns: new[] { "AuthorizeMatrixId", "CreatedAt", "DeleteFlag",
                         "ModuleId", "PermissionId", "PermissionPath" },
        values: new object[,]
        {
            { 36, new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc), false,
              20, 1, "inventory.read" },
            { 37, new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc), false,
              20, 2, "inventory.create" },
            { 38, new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc), false,
              20, 3, "inventory.update" },
            { 39, new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc), false,
              20, 4, "inventory.delete" },
        });

    // 3. Grant Admin position (ID=1) ทุก permission
    migrationBuilder.Sql(@"
        INSERT INTO [TbAuthorizeMatrixPositions]
            ([AuthorizeMatrixId], [PositionId], [CreatedAt], [DeleteFlag])
        VALUES
            (36, 1, '2025-01-01T00:00:00Z', 0),
            (37, 1, '2025-01-01T00:00:00Z', 0),
            (38, 1, '2025-01-01T00:00:00Z', 0),
            (39, 1, '2025-01-01T00:00:00Z', 0);
    ");
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql("DELETE FROM [TbAuthorizeMatrixPositions] WHERE [AuthorizeMatrixId] IN (36,37,38,39);");
    migrationBuilder.DeleteData(table: "TbmAuthorizeMatrices",
        keyColumn: "AuthorizeMatrixId", keyValues: new object[] { 36, 37, 38, 39 });
    migrationBuilder.DeleteData(table: "TbmModules",
        keyColumn: "ModuleId", keyValue: 20);
}
```

**4. Apply migration ทันที:**

```bash
dotnet ef database update \
    --project POS.Main/POS.Main.Dal \
    --startup-project POS.Main/RBMS.POS.WebAPI
```

> **ตัวอย่างจริงในโปรเจค:**
> - [20260311143050_AddPositionBasedRbac.cs](../../Backend-POS/POS.Main/POS.Main.Dal/Migrations/20260311143050_AddPositionBasedRbac.cs) — seed ทุก module ครั้งแรก
> - [20260316093337_SeedUserManagementPermissions.cs](../../Backend-POS/POS.Main/POS.Main.Dal/Migrations/20260316093337_SeedUserManagementPermissions.cs) — เพิ่ม module เดียว

---

## Reusable Patterns

> Pattern มาตรฐานที่ใช้ร่วมกันทั้งโปรเจค — ทุก module ต้องทำตาม

### BaseEntity — Audit + Soft Delete

```csharp
// POS.Main.Dal/Entities/BaseEntity.cs
public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public bool DeleteFlag { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? DeletedBy { get; set; }

    // Navigation properties for audit
    public virtual TbEmployee? CreatedByEmployee { get; set; }
    public virtual TbEmployee? UpdatedByEmployee { get; set; }
}

// ✅ ทุก Entity ต้อง inherit BaseEntity
public class TbProduct : BaseEntity
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    // ... ห้าม define CreatedAt, UpdatedAt, DeleteFlag ซ้ำ
}
```

### SaveChanges Override — Auto-stamp Tracking Fields

```csharp
// POSMainContext.cs — override SaveChangesAsync
public override async Task<int> SaveChangesAsync(
    bool acceptAllChangesOnSuccess, CancellationToken ct = default)
{
    StampTrackingFields();
    return await base.SaveChangesAsync(acceptAllChangesOnSuccess, ct);
}

private void StampTrackingFields()
{
    var now = DateTime.UtcNow;
    var userId = GetCurrentUserId();  // จาก IHttpContextAccessor

    foreach (var entry in ChangeTracker.Entries<BaseEntity>())
    {
        if (entry.State == EntityState.Added)
        {
            entry.Entity.CreatedAt = now;
            entry.Entity.CreatedBy = userId;
        }

        if (entry.State == EntityState.Modified)
        {
            entry.Entity.UpdatedAt = now;
            entry.Entity.UpdatedBy = userId;
        }

        if (entry.Entity.DeleteFlag && entry.Property(nameof(BaseEntity.DeleteFlag)).IsModified)
        {
            entry.Entity.DeletedAt = now;
            entry.Entity.DeletedBy = userId;
        }
    }
}
```

### Global Query Filter — ซ่อน Soft Delete อัตโนมัติ

```csharp
// OnModelCreating — apply อัตโนมัติทุก Entity ที่ inherit BaseEntity
foreach (var entityType in modelBuilder.Model.GetEntityTypes())
{
    if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
    {
        var parameter = Expression.Parameter(entityType.ClrType, "e");
        var deleteFlagProperty = Expression.Property(parameter, nameof(BaseEntity.DeleteFlag));
        var filter = Expression.Lambda(
            Expression.Equal(deleteFlagProperty, Expression.Constant(false)), parameter);
        entityType.SetQueryFilter(filter);
    }
}

// ปกติ: ซ่อน record ที่ถูกลบอัตโนมัติ
var products = await _context.Products.ToListAsync();

// กรณีพิเศษ: ดูรวมข้อมูลที่ถูกลบ
var all = await _context.Products.IgnoreQueryFilters().ToListAsync();
```

### Exception Classes — ใน POS.Main.Core/Exceptions/

```csharp
// ValidationException → 400 Bad Request
public class ValidationException : Exception
{
    public Dictionary<string, string[]>? Errors { get; }
    public ValidationException(string message) : base(message) { }
    public ValidationException(string message, Dictionary<string, string[]> errors)
        : base(message) { Errors = errors; }
}

// EntityNotFoundException → 404 Not Found
public class EntityNotFoundException : Exception
{
    public EntityNotFoundException(string entityName, object id)
        : base($"{entityName} with ID '{id}' was not found.") { }
}

// BusinessException → 422 Unprocessable Entity
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message) { }
}
```

### BaseResponseModel — Standardized Response Format

```csharp
// POS.Main.Core/Models/BaseResponseModel.cs
public class BaseResponseModel<T>
{
    public string Status { get; set; } = constResultType.Fail;  // default = fail
    public T? Result { get; set; }
    public string? Message { get; set; }
    public string? Code { get; set; }
    public Dictionary<string, string[]>? Errors { get; set; }
}

// POS.Main.Core/Models/PaginationModel.cs — รับ params จาก client
public class PaginationModel
{
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int ItemPerPage { get; set; } = 10;
    public int Skip => (Page - 1) * ItemPerPage;
    public int Take => ItemPerPage;
    public string? OrderBy { get; set; }
    public bool? IsDescending { get; set; }
}

// POS.Main.Core/Models/PaginationResult.cs — ส่ง paginated results
public class PaginationResult<T>
{
    public string Status { get; set; } = constResultType.Fail;
    public List<T> Results { get; set; } = new();
    public int Page { get; set; }
    public int Total { get; set; }
    public int ItemPerPage { get; set; }
    public string? Message { get; set; }
}

// POS.Main.Core/Models/ListResponseModel.cs — list ไม่แบ่งหน้า
public class ListResponseModel<T>
{
    public string Status { get; set; } = constResultType.Fail;
    public List<T> Results { get; set; } = new();
    public int TotalItems => Results.Count;  // computed property
    public string? Message { get; set; }
}
```

### BaseController — Response Helpers

```csharp
// RBMS.POS.WebAPI/Controllers/BaseController.cs
[ApiController]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    // Single item response
    protected IActionResult Success<T>(T data, string? message = null)
        => Ok(new BaseResponseModel<T>
        {
            Status = constResultType.Success, Result = data, Message = message
        });

    // Response ไม่มี data
    protected IActionResult Success(string? message = null)
        => Ok(new BaseResponseModel<object>
        {
            Status = constResultType.Success, Message = message
        });

    // List response (ไม่แบ่งหน้า)
    protected IActionResult ListSuccess<T>(IEnumerable<T> data, string? message = null)
        => Ok(new ListResponseModel<T>
        {
            Status = constResultType.Success, Results = data.ToList(), Message = message
        });

    // Paginated response
    protected IActionResult PagedSuccess<T>(PaginationResult<T> result)
    {
        result.Status = constResultType.Success;
        return Ok(result);
    }

    // IP Address ของ client
    protected string GetIpAddress() { ... }

    // User ID จาก JWT (sub claim) — return Guid
    protected Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        return Guid.Parse(userIdClaim ?? Guid.Empty.ToString());
    }
}
```

### GlobalExceptionFilter — จัดการ Exceptions อัตโนมัติ

```csharp
// RBMS.POS.WebAPI/Filters/GlobalExceptionFilter.cs
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
        => _logger = logger;

    public void OnException(ExceptionContext context)
    {
        var (statusCode, code) = context.Exception switch
        {
            ValidationException              => (400, "VALIDATION_ERROR"),
            EntityNotFoundException          => (404, "NOT_FOUND"),
            BusinessException                => (422, "BUSINESS_ERROR"),
            AccountLockedException           => (423, "ACCOUNT_LOCKED"),
            AccountDisabledException         => (403, "ACCOUNT_DISABLED"),
            InvalidCredentialsException      => (401, "INVALID_CREDENTIALS"),
            InvalidRefreshTokenException     => (401, "INVALID_REFRESH_TOKEN"),
            AuthenticationException          => (401, "AUTHENTICATION_ERROR"),
            UnauthorizedAccessException      => (401, "UNAUTHORIZED"),
            _                                => (500, "INTERNAL_ERROR")
        };

        if (statusCode == 500)
            _logger.LogError(context.Exception, "Unhandled exception");
        else
            _logger.LogWarning(context.Exception, "Handled exception: {Code}", code);

        var response = new BaseResponseModel<object>
        {
            Status = constResultType.Fail,
            Code = code,
            Message = context.Exception.Message
        };

        if (context.Exception is ValidationException validationEx && validationEx.Errors != null)
        {
            response.Errors = validationEx.Errors;
        }

        context.Result = new ObjectResult(response) { StatusCode = statusCode };
        context.ExceptionHandled = true;
    }
}

// Register ใน Program.cs
builder.Services.AddControllers(options =>
{
    options.Filters.Add<GlobalExceptionFilter>();
});
```

---

## Database Conventions

> กฎมาตรฐานการออกแบบฐานข้อมูลทั้งหมดรวมไว้ที่นี่ — รายละเอียดโค้ดดูได้ที่ Step 1-5 ด้านบน

### Naming

| สิ่งที่ตั้งชื่อ | รูปแบบ | ตัวอย่าง |
|----------------|--------|---------|
| Entity class | `Tb{Name}` (PascalCase, singular) | `TbProduct`, `TbEmployee` |
| Table name | `Tb{Name}s` (plural, ตั้งใน Fluent API) | `builder.ToTable("TbProducts")` |
| Primary Key | `{ClassName}Id` | `ProductId`, `EmployeeId` |
| Foreign Key | `{RelatedEntity}Id` | `CategoryId`, `CreatedBy` |
| Navigation property | PascalCase, singular/collection | `Category`, `Products` |
| Enum column | ชื่อตรงกับ Enum | `Status` → `EProductStatus` |

### กฎบังคับ

- **ทุก Entity ต้อง inherit `BaseEntity`** — ห้าม define `CreatedAt`, `UpdatedAt`, `DeleteFlag` เอง
- **Soft Delete เท่านั้น** — ใช้ `DeleteFlag` จาก `BaseEntity` ห้าม hard delete
- **Fluent API เท่านั้น** — ห้ามใช้ Data Annotations (`[Required]`, `[MaxLength]`) บน Entity (ใช้บน DTO ได้)
- **QueryFilter** — ทุก Entity ต้องมี `builder.HasQueryFilter(x => !x.DeleteFlag)`
- **OnDelete(DeleteBehavior.Restrict)** — ห้ามใช้ Cascade เพื่อป้องกันการลบข้อมูลสัมพันธ์โดยบังเอิญ
- **DateTime.UtcNow** — ทุก timestamp ต้องใช้ UTC ห้ามใช้ `DateTime.Now`

### Data Types มาตรฐาน

| ชนิดข้อมูล | Fluent API | หมายเหตุ |
|------------|-----------|---------|
| เงิน/ราคา | `.HasColumnType("decimal(18,2)")` | precision 18, scale 2 |
| ชื่อ/คำอธิบายสั้น | `.HasMaxLength(200)` | ปรับตามความเหมาะสม |
| คำอธิบายยาว | `.HasMaxLength(2000)` หรือไม่จำกัด | |
| Enum | `.HasConversion<string>().HasMaxLength(20)` | เก็บเป็น string ในฐานข้อมูล |
| Boolean | default จาก EF Core | |
| รหัสอ้างอิง | `int` | Primary Key, Foreign Key |

### Index

- **ต้องสร้าง Index** สำหรับ: Foreign Key columns, columns ที่ใช้ค้นหาบ่อย (IsActive, Status)
- **DeleteFlag** — ทุก Entity ต้องมี Index: `builder.HasIndex(x => x.DeleteFlag)`
- **Unique Index** — ใช้เมื่อ field ต้องไม่ซ้ำ: `builder.HasIndex(x => x.Code).IsUnique()`

### Migration

- **ต้องระบุ `--project` และ `--startup-project`** ทุกครั้ง
- **ตรวจสอบไฟล์ Migration** ก่อน `database update` เสมอ — ดู column types, indexes, FK
- **ถ้า Migration ผิดพลาด** → ใช้ `migrations remove` แล้วแก้ Entity/Config ก่อนสร้างใหม่
- **ห้ามแก้ไฟล์ Migration ที่ apply ไปแล้ว** — สร้าง Migration ใหม่แทน
- ดู commands ที่ section [Step 5: Migration](#step-5-สร้าง-migration-และ-update-database)

---

## Common Errors และวิธีแก้

### Error 1: Build Failed ก่อน Migration

```
Build failed. Run 'dotnet build' first.
```

**สาเหตุ:** Backend (`dotnet run`) กำลัง run อยู่

**วิธีแก้:** หยุด Backend (Ctrl+C) แล้ว build ใหม่:
```bash
dotnet build --project POS.Main/RBMS.POS.WebAPI
```

---

### Error 2: Invalid object name 'TbProducts'

```
Microsoft.Data.SqlClient.SqlException: Invalid object name 'TbProducts'
```

**สาเหตุ:** ยังไม่ได้ Apply Migration — ตารางยังไม่มีในฐานข้อมูล

**วิธีแก้:**
```bash
dotnet ef database update \
  --project POS.Main/POS.Main.Dal \
  --startup-project POS.Main/RBMS.POS.WebAPI
```

---

### Error 3: Duplicate Key ใน Migration

```
Cannot insert duplicate key row in object 'dbo.TbProducts' with unique index
```

**สาเหตุ:** Migration มี `InsertData` ที่ซ้ำกับข้อมูลที่มีอยู่แล้ว

**วิธีแก้:** เปิดไฟล์ Migration ที่สร้างใหม่ ลบส่วน `InsertData`/`UpdateData` ที่ซ้ำออก แล้ว Apply ใหม่

---

### Error 4: Service Not Found in DI

```
System.InvalidOperationException: Unable to resolve service for type 'IProductService'
```

**สาเหตุ:** ลืม register Service ใน `Program.cs`

**วิธีแก้:** เพิ่ม manual registration ใน `Program.cs`:
```csharp
builder.Services.AddScoped<IProductService, ProductService>();
```

---

### Error 5: Circular Dependency

```
System.InvalidOperationException: A circular dependency was detected
```

**สาเหตุ:** Project A reference Project B และ Project B reference Project A

**วิธีแก้:** ตรวจสอบ Project References ต้องเป็น one-way เท่านั้น:
```
WebAPI → Business.* (Admin / Authorization / Menu / HumanResource) → Repositories → Dal → Core
```
ห้าม Dal reference Repositories หรือ Business.Admin reference WebAPI

---

## Best Practices

### 1. ห้าม try-catch ใน Controller

```csharp
// ❌ ผิด
public async Task<IActionResult> GetProduct(int id)
{
    try { ... }
    catch (Exception ex) { return StatusCode(500, ...); }
}

// ✅ ถูก — ปล่อยให้ GlobalExceptionFilter จัดการ
public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
    => Success(await _productService.GetProductByIdAsync(id, ct));
```

### 2. throw Specific Exception ใน Service

```csharp
// ❌ ผิด
throw new Exception("ไม่พบสินค้า");
throw new KeyNotFoundException("Product not found");

// ✅ ถูก
throw new EntityNotFoundException("Product", id);   // → 404
throw new ValidationException("ชื่อซ้ำกัน");         // → 400
throw new BusinessException("สินค้าถูกลบไปแล้ว");   // → 422
```

### 3. AsNoTracking() สำหรับ Read-Only Queries

```csharp
// ✅ ดึงข้อมูล read-only — ไม่ต้อง track change
var products = await _unitOfWork.Products.GetAll()
    .AsNoTracking()
    .Include(p => p.Category)
    .ToListAsync(ct);

// ✅ ดึงสำหรับ update — ต้อง track change (ไม่ใส่ AsNoTracking)
var product = await _unitOfWork.Products.GetAll()
    .FirstOrDefaultAsync(p => p.ProductId == id, ct);
product.Name = request.Name;
await _unitOfWork.CommitAsync(ct);
```

### 4. Commit ครั้งเดียวต่อ Transaction

```csharp
// ✅ ถูก — Commit ทีเดียวหลังทำทุกอย่างเสร็จ
await _unitOfWork.Products.AddAsync(product, ct);
await _unitOfWork.Categories.Update(category);
await _unitOfWork.CommitAsync(ct);  // ← ครั้งเดียว

// ❌ ผิด — Commit หลายครั้ง
await _unitOfWork.Products.AddAsync(product, ct);
await _unitOfWork.CommitAsync(ct);  // ← ครั้งแรก
await _unitOfWork.Categories.Update(category);
await _unitOfWork.CommitAsync(ct);  // ← ครั้งที่สอง (ไม่ atomic)
```

### 5. ห้าม Query ในลูป (N+1 Problem)

```csharp
// ❌ ผิด — N+1 queries
var products = await _unitOfWork.Products.GetAll().ToListAsync(ct);
foreach (var p in products)
{
    var category = await _unitOfWork.Categories.GetByIdAsync(p.CategoryId, ct); // query N ครั้ง
}

// ✅ ถูก — Load เดียว
var products = await _unitOfWork.Products.GetAll()
    .Include(p => p.Category)  // JOIN เดียว
    .ToListAsync(ct);
```

### 6. Forward CancellationToken ทุก Async Method

```csharp
// ✅ ถูก
public async Task<ProductResponseModel> GetProductByIdAsync(int id, CancellationToken ct = default)
{
    var product = await _unitOfWork.Products.GetAll()
        .FirstOrDefaultAsync(p => p.ProductId == id, ct);  // ← ส่งต่อ ct
    ...
}

// ❌ ผิด — ไม่ส่ง CancellationToken
var product = await _unitOfWork.Products.GetAll()
    .FirstOrDefaultAsync(p => p.ProductId == id);  // ← ไม่มี ct
```

### 7. Structured Logging

```csharp
// ✅ ถูก — Named parameters (searchable)
_logger.LogInformation("Product {ProductId} '{Name}' created by user {UserId}",
    product.ProductId, product.Name, userId);

// ❌ ผิด — String interpolation (ไม่ searchable)
_logger.LogInformation($"Product {product.ProductId} created");
```

### 8. Soft Delete เสมอ

```csharp
// ✅ ถูก — Soft Delete (DbContext auto-stamp DeletedAt/DeletedBy)
product.DeleteFlag = true;
await _unitOfWork.CommitAsync(ct);

// ❌ ผิด — Hard Delete
_unitOfWork.Products.Delete(product);
await _unitOfWork.CommitAsync(ct);
```

### 9. DateTime.UtcNow เสมอ

```csharp
sale.PaidAt = DateTime.UtcNow;  // ✅ ถูก
sale.PaidAt = DateTime.Now;     // ❌ ผิด (ขึ้นกับ timezone ของ server)

// หมายเหตุ: CreatedAt, UpdatedAt, DeletedAt ไม่ต้อง set ด้วยมือ — DbContext auto-stamp ให้
```

### 10. ห้าม Expose Entity โดยตรง

```csharp
// ❌ ผิด — return Entity โดยตรง
[HttpGet("{id}")]
public async Task<TbProduct> GetProduct(int id) { ... }

// ✅ ถูก — return DTO
[HttpGet("{id}")]
public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
    => Success(await _productService.GetProductByIdAsync(id, ct));
// ProductService return ProductResponseModel (DTO) ไม่ใช่ TbProduct
```

---

## Checklist ก่อน Deploy Feature

### Core & Enum
- [ ] Enum อยู่ใน `POS.Main.Core/Enums/E{Name}.cs`
- [ ] ค่า Enum เป็นตัวเลข (1, 2, 3...)

### Data Access Layer (Dal)
- [ ] Entity ชื่อ `Tb{Name}` inherit `BaseEntity`
- [ ] Entity Configuration ใช้ Fluent API (ไม่มี Data Annotations บน Entity)
- [ ] มี `HasQueryFilter(x => !x.DeleteFlag)`
- [ ] มี Index สำหรับ column ที่ค้นหาบ่อย
- [ ] เพิ่ม DbSet และ `ApplyConfiguration` ใน DbContext
- [ ] ตรวจสอบ Migration file ก่อน apply
- [ ] **`database update` ทันที** — ห้ามข้ามไปทำขั้นตอนอื่นก่อน
- [ ] ตรวจสอบ Schema ในฐานข้อมูลหลัง apply

### Repository Layer
- [ ] Interface extend `IGenericRepository<Tb{Name}>`
- [ ] Implementation extend `GenericRepository<Tb{Name}>`
- [ ] เพิ่ม Property ใน `IUnitOfWork` + lazy init ใน `UnitOfWork`

### Business Layer (Service)
- [ ] DTOs อยู่ใน `POS.Main.Business.Admin/{Module}/Models/`
- [ ] Naming: `Create{Name}RequestModel`, `Update{Name}RequestModel`, `{Name}ResponseModel`
- [ ] Manual Mapper (static class) แปลง Entity/DTO ครบทุก field ที่ต้องการ
- [ ] Service throw `EntityNotFoundException`/`ValidationException`/`BusinessException`
- [ ] `AsNoTracking()` สำหรับ read-only queries
- [ ] `CommitAsync` ครั้งเดียวต่อ operation
- [ ] Forward `CancellationToken` ทุก async call
- [ ] Structured logging (named parameters)

### API Layer (Controller)
- [ ] Route: `[Route("api/{module}")]` (explicit route ต่อ controller — ห้ามใช้ `[controller]` placeholder)
- [ ] extends `BaseController`
- [ ] **ไม่มี try-catch**
- [ ] XML comments ทุก action
- [ ] `[ProducesResponseType]` ครบทุก status code
- [ ] ใช้ `return Success(result)` จาก BaseController

### Permission + Seed Data
- [ ] เพิ่ม Permission constants ใน `Permissions.cs` (ถ้า module มี authorization)
- [ ] สร้าง Seed Migration — insert Module, AuthorizeMatrix, AuthorizeMatrixPositions
- [ ] **Apply migration ทันที** (`database update`)
- [ ] ทดสอบ Login แล้วเข้า endpoint ที่ต้องใช้ permission ได้

### ทดสอบ
- [ ] `dotnet build` ผ่าน
- [ ] ทดสอบทุก endpoint ใน Swagger
- [ ] ตรวจสอบ Response format ถูกต้อง
- [ ] ตรวจสอบ Error responses (404, 400, 422)
- [ ] Soft delete ทำงานถูกต้อง (GET หลังลบต้องได้ 404)
