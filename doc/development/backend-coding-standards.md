# Backend Coding Standards — RBMS-POS

มาตรฐานการเขียนโค้ด Backend (ASP.NET Core 9) พร้อมตัวอย่าง ✅ DO และ ❌ DON'T

> อัพเดตล่าสุด: 2026-03-10
>
> **Related:** [backend-guide.md](backend-guide.md) | [module-development-workflow.md](module-development-workflow.md)

---

## สารบัญ

1. [Naming Conventions](#1-naming-conventions)
2. [Entity Layer](#2-entity-layer)
3. [Repository Layer](#3-repository-layer)
4. [Service Layer](#4-service-layer)
5. [Controller Layer](#5-controller-layer)
6. [DTO & Models](#6-dto--models)
7. [Validation](#7-validation)
8. [Error Handling](#8-error-handling)
9. [Database Queries](#9-database-queries)
10. [Async/Await Patterns](#10-asyncawait-patterns)
11. [Logging](#11-logging)
12. [Security](#12-security)
13. [Code Organization](#13-code-organization)
14. [Reusable Patterns](#14-reusable-patterns)

---

## 1. Naming Conventions

### 1.1 Entity Naming

```csharp
// ✅ DO: ใช้ prefix "Tb" สำหรับ Entity
public class TbProduct { }
public class TbSale { }
public class TbEmployee { }

// ✅ DO: ใช้ prefix "Tbm" สำหรับ Master Data
public class TbmPaymentMethod { }
public class TbmEmployeeRole { }

// ❌ DON'T: ไม่ใส่ prefix
public class Product { }
public class Sale { }

// ❌ DON'T: ใช้ prefix อื่น
public class tblProduct { }
public class EntityProduct { }
```

### 1.2 Interface & Class Naming

```csharp
// ✅ DO: Interface ขึ้นต้นด้วย "I"
public interface IProductService { }
public interface IProductRepository { }

// ✅ DO: Implementation ตรงกับ Interface (ไม่มี I)
public class ProductService : IProductService { }
public class ProductRepository : IProductRepository { }

// ❌ DON'T: Interface ไม่ขึ้นต้นด้วย I
public interface ProductService { }
public interface ProductServiceInterface { }
```

### 1.3 Method Naming

```csharp
// ✅ DO: ใช้ Async suffix สำหรับ async methods
public async Task<ProductResponseModel> GetProductByIdAsync(int id, CancellationToken ct = default)
public async Task<IEnumerable<ProductResponseModel>> GetProductsAsync(CancellationToken ct = default)
public async Task<ProductResponseModel> CreateProductAsync(CreateProductRequestModel request, CancellationToken ct = default)
public async Task<ProductResponseModel> UpdateProductAsync(int id, UpdateProductRequestModel request, CancellationToken ct = default)
public async Task DeleteProductAsync(int id, int deletedBy, CancellationToken ct = default)

// ❌ DON'T: ไม่ใส่ Async suffix
public async Task<ProductResponseModel> GetProductById(int id) { }
public async Task Create(CreateProductRequestModel request) { }

// ✅ DO: ใช้ชื่อที่สื่อความหมาย
public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default)
public async Task ToggleActiveStatusAsync(int id, CancellationToken ct = default)

// ❌ DON'T: ใช้ชื่อกำกวม
public async Task<bool> CheckAsync(int id) { }   // Check อะไร?
public async Task DoItAsync(int id) { }           // ทำอะไร?
```

### 1.4 Variable & Parameter Naming

```csharp
// ✅ DO: camelCase สำหรับ local variables และ parameters
public async Task<ProductResponseModel> GetProductByIdAsync(int productId, CancellationToken ct = default)
{
    var product = await _unitOfWork.Products.GetByIdAsync(productId, ct);
    var categoryName = product.Category?.Name ?? string.Empty;
    return ProductMapper.ToResponse(product);
}

// ✅ DO: _underscore prefix สำหรับ private fields
private readonly ILogger<ProductService> _logger;
private readonly IUnitOfWork _unitOfWork;

// ❌ DON'T: PascalCase สำหรับ local variables
var Product = await ...;   // ผิด
var _product = await ...;  // ผิด (underscore เฉพาะ private fields)

// ✅ DO: ใช้ชื่อ parameter ที่เจาะจง — ห้ามใช้ id เฉยๆ
GetMenuByIdAsync(int menuId, ...)
UpdateEmployeeAsync(int employeeId, ...)
DeleteServiceChargeAsync(int serviceChargeId, ...)
Download(int fileId, ...)

// ❌ DON'T: ใช้ int id กำกวม
GetMenuByIdAsync(int id, ...)      // id ของอะไร?
UpdateEmployeeAsync(int id, ...)   // ไม่ชัดเจน
```

> **หมายเหตุ**: กฎนี้ใช้ทั้ง stack — Controller, Service Interface, Service Impl, Repository override
> ยกเว้น `GenericRepository<T>` ที่เป็น generic base class (ใช้ `int id` ได้เพราะไม่รู้ชนิด Entity)

### 1.5 DTO Naming

```csharp
// ✅ DO: ชื่อชัดเจนตาม action + suffix Model
public class CreateProductRequestModel { }     // สร้าง
public class UpdateProductRequestModel { }     // แก้ไข
public class ProductResponseModel { }          // Response ทั่วไป
public class ProductListResponseModel { }      // Response รายการ

// ❌ DON'T: ชื่อกำกวม หรือไม่มี suffix Model
public class ProductModel { }             // Model อะไร? Request? Response?
public class Product { }                  // ซ้ำกับ Entity
public class ProductData { }              // Data อะไร?
public class CreateProductRequest { }     // ขาด suffix Model
```

---

## 2. Entity Layer

### 2.1 Entity Structure

```csharp
// ✅ DO: Entity ต้อง inherit BaseEntity
public class TbProduct : BaseEntity
{
    // Primary Key
    public int ProductId { get; set; }

    // Required fields
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }

    // Optional fields (nullable)
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }

    // Status flags
    public bool IsActive { get; set; } = true;

    // Navigation properties (virtual สำหรับ lazy loading)
    public virtual TbCategory Category { get; set; } = null!;
    public virtual ICollection<TbSaleItem> SaleItems { get; set; } = new List<TbSaleItem>();
}

// BaseEntity มี audit fields + soft delete + navigation อยู่แล้ว:
// CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, DeleteFlag, DeletedAt, DeletedBy
// CreatedByEmployee, UpdatedByEmployee (navigation → TbEmployee)

// **ข้อยกเว้น:** Entity ที่เป็น lifecycle/log (เช่น TbRefreshToken, TbLoginHistory)
// ไม่ต้อง inherit BaseEntity เพราะมี lifecycle เฉพาะตัว (เช่น token expiry, login date)
// ไม่ต้องมี soft delete หรือ full audit tracking

// ❌ DON'T: Entity ไม่ inherit BaseEntity หรือซ้ำ audit fields
public class TbProduct
{
    public int Id { get; set; }         // ผิด — ควรใช้ ProductId
    public string Name { get; set; }    // ผิด — ไม่มี default value
    public DateTime CreatedAt { get; set; }  // ผิด — ซ้ำกับ BaseEntity
}
```

### 2.2 Entity Configuration (Fluent API)

```csharp
// ✅ DO: ใช้ Fluent API ทั้งหมด
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

        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.DeleteFlag);
    }
}

// ❌ DON'T: ใช้ Data Annotations บน Entity
public class TbProduct : BaseEntity
{
    [Key]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; }  // ผิด — ใช้ Fluent API เท่านั้น
}

// ❌ DON'T: ใช้ [InverseProperty] attribute
// ห้ามใช้ [InverseProperty] — ใช้ Fluent API ใน EntityConfiguration แทนเสมอ
```

### 2.3 FK หลายตัวชี้ไป Parent เดียวกัน

เมื่อ Entity มี FK หลายตัวชี้ไป parent table เดียวกัน → **ต้อง config ด้วย Fluent API อย่างชัดเจน** (ห้ามปล่อยให้ EF เดาเอง)

```csharp
// ✅ DO: ใช้ Fluent API ระบุ FK ให้ชัดเจนทุกตัว
// กรณี BaseEntity มี 3 FK ชี้ไป TbEmployee (CreatedBy, UpdatedBy, DeletedBy)
// → config ด้วย loop ใน OnModelCreating()
modelBuilder.Entity(entityType.ClrType)
    .HasOne(typeof(TbEmployee), nameof(BaseEntity.CreatedByEmployee))
    .WithMany()
    .HasForeignKey(nameof(BaseEntity.CreatedBy))
    .OnDelete(DeleteBehavior.Restrict)
    .IsRequired(false);

// ✅ DO: กรณี Entity ปกติ — config ใน EntityConfiguration
builder.HasOne(x => x.Approver)
    .WithMany()
    .HasForeignKey(x => x.ApprovedBy)
    .OnDelete(DeleteBehavior.Restrict);

builder.HasOne(x => x.Requester)
    .WithMany()
    .HasForeignKey(x => x.RequestedBy)
    .OnDelete(DeleteBehavior.Restrict);

// ❌ DON'T: ใช้ [InverseProperty] attribute แทน Fluent API
[InverseProperty("CreatedRecords")]  // ห้าม — ใช้ Fluent API
public virtual TbEmployee? CreatedByEmployee { get; set; }
```

---

## 3. Repository Layer

### 3.1 Generic Repository Interface (อ้างอิง)

```csharp
// POS.Main.Repositories/Interfaces/IGenericRepository.cs
public interface IGenericRepository<T> where T : class
{
    IQueryable<T> GetAll();
    IQueryable<T> QueryNoTracking();
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken ct = default);
    void Update(T entity);
    void UpdateRange(IEnumerable<T> entities);
    void Delete(T entity);
    void DeleteRange(IEnumerable<T> entities);
}
```

### 3.2 Specific Repository

```csharp
// ✅ DO: Specific Repository สำหรับ domain-specific queries
public interface IProductRepository : IGenericRepository<TbProduct>
{
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken ct = default);
    IQueryable<TbProduct> GetActiveProducts();
}

// ✅ DO: Implementation ใช้ AsNoTracking สำหรับ read-only
public class ProductRepository : GenericRepository<TbProduct>, IProductRepository
{
    public ProductRepository(POSMainContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(
        string name, int? excludeId = null, CancellationToken ct = default)
    {
        return await _dbSet
            .AnyAsync(p => p.Name == name && !p.DeleteFlag
                       && (excludeId == null || p.ProductId != excludeId), ct);
    }

    public IQueryable<TbProduct> GetActiveProducts()
        => _dbSet.Where(p => p.IsActive && !p.DeleteFlag);
}

// ❌ DON'T: Query ที่ไม่ filter DeleteFlag
public async Task<List<TbProduct>> GetAllWrong()
{
    return await _dbSet.ToListAsync();  // ผิด — ไม่ filter DeleteFlag
}
```

### 3.3 Unit of Work

```csharp
// ✅ DO: Unit of Work รวม repositories ทั้งหมด
public interface IUnitOfWork : IDisposable
{
    IProductRepository Products { get; }
    ICategoryRepository Categories { get; }
    ISaleRepository Sales { get; }
    // เพิ่ม repository ตาม module

    Task<int> CommitAsync(CancellationToken ct = default);
}

// ✅ DO: Lazy initialization
public class UnitOfWork : IUnitOfWork
{
    private readonly POSMainContext _context;
    private IProductRepository? _products;

    public UnitOfWork(POSMainContext context) => _context = context;

    public IProductRepository Products =>
        _products ??= new ProductRepository(_context);

    public async Task<int> CommitAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);

    public void Dispose() => _context.Dispose();
}
```

---

## 4. Service Layer

### 4.1 Service Implementation

```csharp
// ✅ DO: Service ที่ถูกต้อง
// POS.Main.Business.Admin/{Module}/Services/{Name}Service.cs
public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductService> _logger;

    public ProductService(
        IUnitOfWork unitOfWork,
        ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // ✅ DO: Get method — AsNoTracking, proper error handling
    public async Task<ProductResponseModel> GetProductByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await _unitOfWork.Products
            .GetAll()
            .AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.ProductId == id && !p.DeleteFlag, ct);

        if (product == null)
            throw new EntityNotFoundException("Product", id);

        return ProductMapper.ToResponse(product);
    }

    // ✅ DO: Create method — validate, map, save
    public async Task<ProductResponseModel> CreateProductAsync(
        CreateProductRequestModel request, CancellationToken ct = default)
    {
        // 1. Validate business rules
        if (await _unitOfWork.Products.ExistsByNameAsync(request.Name, ct: ct))
            throw new ValidationException($"สินค้าชื่อ '{request.Name}' มีอยู่แล้ว");

        // 2. Map to entity (manual mapping)
        var product = ProductMapper.ToEntity(request);

        // 3. Set audit fields
        product.CreatedAt = DateTime.UtcNow;

        // 4. Save (commit ครั้งเดียว)
        await _unitOfWork.Products.AddAsync(product, ct);
        await _unitOfWork.CommitAsync(ct);

        // 5. Log
        _logger.LogInformation("Product created: {ProductId} - {Name}", product.ProductId, product.Name);

        return ProductMapper.ToResponse(product);
    }

    // ✅ DO: Update method — fetch, validate, update, save
    public async Task<ProductResponseModel> UpdateProductAsync(
        int id, UpdateProductRequestModel request, CancellationToken ct = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, ct);

        if (product == null || product.DeleteFlag)
            throw new EntityNotFoundException("Product", id);

        if (await _unitOfWork.Products.ExistsByNameAsync(request.Name, excludeId: id, ct: ct))
            throw new ValidationException($"สินค้าชื่อ '{request.Name}' มีอยู่แล้ว");

        ProductMapper.UpdateEntity(product, request);
        product.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Product updated: {ProductId}", id);

        return ProductMapper.ToResponse(product);
    }

    // ✅ DO: Delete method — soft delete
    public async Task DeleteProductAsync(int id, int deletedBy, CancellationToken ct = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, ct);

        if (product == null || product.DeleteFlag)
            throw new EntityNotFoundException("Product", id);

        product.DeleteFlag = true;
        product.DeletedAt = DateTime.UtcNow;
        product.DeletedBy = deletedBy;

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Product deleted: {ProductId}", id);
    }
}

// ❌ DON'T: Service patterns ที่ผิด
public class BadProductService : IProductService
{
    private readonly POSMainContext _context;  // ❌ ใช้ DbContext โดยตรง

    public async Task<ProductResponseModel> GetProductByIdAsync(int id)  // ❌ ไม่มี CancellationToken
    {
        var product = await _context.TbProducts.FindAsync(id);  // ❌ DbContext โดยตรง
        return new ProductResponseModel { Name = product.Name };       // ❌ ไม่ใช้ Mapper class
    }

    public async Task CreateProductAsync(CreateProductRequestModel request)
    {
        try   // ❌ generic try-catch ใน Service (ใช้ได้เฉพาะ transaction operations)
        {
            var product = new TbProduct { Name = request.Name };
            _context.TbProducts.Add(product);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Error", ex);  // ❌ Generic exception
        }
    }
}
```

### 4.2 Transaction สำหรับ Multiple Operations

```csharp
// ✅ DO: ใช้ BeginTransactionAsync สำหรับ complex operations
public async Task<SaleResponseModel> CreateSaleAsync(CreateSaleRequestModel request, CancellationToken ct = default)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync(ct);

    try
    {
        var sale = SaleMapper.ToEntity(request);
        sale.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Sales.AddAsync(sale, ct);
        await _unitOfWork.CommitAsync(ct);  // บันทึกเพื่อได้ SaleId

        decimal totalAmount = 0;
        foreach (var item in request.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, ct);
            if (product == null || !product.IsActive)
                throw new ValidationException($"สินค้า {item.ProductId} ไม่พร้อมขาย");

            var saleItem = new TbSaleItem
            {
                SaleId = sale.SaleId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            };
            await _unitOfWork.SaleItems.AddAsync(saleItem, ct);
            totalAmount += product.Price * item.Quantity;
        }

        sale.TotalAmount = totalAmount;
        _unitOfWork.Sales.Update(sale);
        await _unitOfWork.CommitAsync(ct);
        await transaction.CommitAsync(ct);

        return SaleMapper.ToResponseModel(sale);
    }
    catch
    {
        await transaction.RollbackAsync(ct);
        throw;  // Re-throw ให้ GlobalExceptionFilter จัดการ
    }
}
```

---

## 5. Controller Layer

### 5.1 Controller Pattern

```csharp
// ✅ DO: Controller ที่ถูกต้อง — Route ระบุตาม module
// Pattern: api/{module} สำหรับ single-controller module
//          api/{module}/{controller} สำหรับ multi-controller module (เช่น Admin)
[ApiController]
[Route("api/inventory")]
[Authorize]
[Produces("application/json")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    // ✅ DO: Thin endpoint — ไม่มี try-catch, ไม่มี business logic
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductResponseModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
    {
        var result = await _productService.GetProductByIdAsync(id, ct);
        return Success(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProductResponseModel), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductRequestModel request,
        CancellationToken ct = default)
    {
        var result = await _productService.CreateProductAsync(request, ct);
        return CreatedAtAction(nameof(GetProduct), new { id = result.ProductId }, result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProductResponseModel), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateProduct(
        int id,
        [FromBody] UpdateProductRequestModel request,
        CancellationToken ct = default)
    {
        var result = await _productService.UpdateProductAsync(id, request, ct);
        return Success(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken ct = default)
    {
        await _productService.DeleteProductAsync(id, GetUserId(), ct);
        return NoContent();
    }
}

// ❌ DON'T: Controller patterns ที่ผิด
[Route("api/products")]
public class BadProductController : ControllerBase  // ❌ ไม่ inherit BaseController
{
    private readonly POSMainContext _context;  // ❌ Inject DbContext ใน Controller

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        try   // ❌ try-catch ใน Controller
        {
            var product = await _context.TbProducts.FindAsync(id);  // ❌ Query ใน Controller
            return Ok(product);  // ❌ Expose Entity โดยตรง
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(CreateProductRequestModel request)
    {
        // ❌ ไม่มี [FromBody]
        // ❌ ไม่มี CancellationToken
        var product = new TbProduct { Name = request.Name };  // ❌ Business logic ใน Controller
        _context.TbProducts.Add(product);
        await _context.SaveChangesAsync();
        return Ok(product);
    }
}
```

---

## 6. DTO & Models

### 6.1 Request Models

```csharp
// ✅ DO: Request Model ที่ชัดเจน + suffix Model
// POS.Main.Business.Admin/{Module}/Models/

public class CreateProductRequestModel
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ImageUrl { get; set; }
}

public class UpdateProductRequestModel
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
}
```

### 6.2 Response Models

```csharp
// ✅ DO: Response Model ที่มีข้อมูลครบ + suffix Model
public class ProductResponseModel
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }

    // Flattened navigation data
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    // Audit info
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// ✅ DO: Simplified Model สำหรับ dropdown/list
public class ProductSimpleResponseModel
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
}
```

### 6.3 Manual Mapper

```csharp
// ✅ DO: ใช้ static mapper class
// POS.Main.Business.Admin/{Module}/Models/{Name}Mapper.cs
public static class ProductMapper
{
    public static ProductResponseModel ToResponse(TbProduct entity)
    {
        return new ProductResponseModel
        {
            ProductId = entity.ProductId,
            Name = entity.Name,
            Description = entity.Description,
            Price = entity.Price,
            IsActive = entity.IsActive,
            ImageUrl = entity.ImageUrl,
            CategoryId = entity.CategoryId,
            CategoryName = entity.Category?.Name ?? string.Empty,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
        };
    }

    public static TbProduct ToEntity(CreateProductRequestModel request)
    {
        return new TbProduct
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            IsActive = request.IsActive,
            ImageUrl = request.ImageUrl,
        };
    }

    public static void UpdateEntity(TbProduct entity, UpdateProductRequestModel request)
    {
        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.Price = request.Price;
        entity.CategoryId = request.CategoryId;
        entity.IsActive = request.IsActive;
        entity.ImageUrl = request.ImageUrl;
    }
}

// ❌ DON'T: ห้ามใช้ AutoMapper
public class ProductProfile : Profile { ... }
```

---

## 7. Validation

### 7.1 FluentValidation

```csharp
// ✅ DO: Validator ที่ครบถ้วน
// POS.Main.Business.Admin/{Module}/Validators/
public class CreateProductRequestModelValidator : AbstractValidator<CreateProductRequestModel>
{
    public CreateProductRequestModelValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("กรุณาระบุชื่อสินค้า")
            .MaximumLength(200).WithMessage("ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("ราคาต้องมากกว่า 0")
            .LessThanOrEqualTo(999999.99m).WithMessage("ราคาสูงสุด 999,999.99 บาท");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("กรุณาเลือกหมวดหมู่");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("คำอธิบายต้องไม่เกิน 1,000 ตัวอักษร")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
```

### 7.2 Guard Clauses ใน Service

```csharp
// ✅ DO: Guard clauses สำหรับ fail-fast
public async Task ProcessSaleAsync(int saleId, CancellationToken ct)
{
    var sale = await _unitOfWork.Sales.GetByIdAsync(saleId, ct)
        ?? throw new EntityNotFoundException("Sale", saleId);

    if (sale.DeleteFlag)
        throw new BusinessException("รายการขายนี้ถูกลบไปแล้ว");

    if (sale.IsPaid)
        throw new BusinessException("รายการขายนี้ชำระเงินแล้ว");

    // Process...
}

// ❌ DON'T: Nested if ลึกเกินไป
public async Task ProcessSaleBad(int saleId)
{
    var sale = await _unitOfWork.Sales.GetByIdAsync(saleId);
    if (sale != null)
    {
        if (!sale.DeleteFlag)
        {
            if (!sale.IsPaid)
            {
                // Process... (ลึกเกินไป)
            }
        }
    }
}
```

---

## 8. Error Handling

### 8.1 Exception Types

```csharp
// ✅ DO: ใช้ Exception ที่เหมาะสม
// POS.Main.Core/Exceptions/

throw new ValidationException("กรุณาระบุชื่อสินค้า");         // 400
throw new EntityNotFoundException("Product", id);              // 404
throw new BusinessException("สินค้านี้ไม่สามารถลบได้");         // 422

// พร้อม Errors dictionary (สำหรับ field-level errors)
throw new ValidationException("ข้อมูลไม่ถูกต้อง",
    new Dictionary<string, string[]>
    {
        ["name"] = new[] { "ชื่อสินค้าซ้ำ" },
        ["price"] = new[] { "ราคาต้องมากกว่า 0" }
    });

// ❌ DON'T: Generic Exception
throw new Exception("Product not found");           // ไม่บอก status code
throw new ApplicationException("Invalid data");     // Generic เกินไป
```

### 8.2 Error Mapping (อ้างอิง)

| Exception | Status Code | Code |
|-----------|------------|------|
| `ValidationException` | 400 Bad Request | `VALIDATION_ERROR` |
| `EntityNotFoundException` | 404 Not Found | `NOT_FOUND` |
| `BusinessException` | 422 Unprocessable Entity | `BUSINESS_ERROR` |
| `AccountLockedException` | 423 Locked | `ACCOUNT_LOCKED` |
| `AccountDisabledException` | 403 Forbidden | `ACCOUNT_DISABLED` |
| `InvalidCredentialsException` | 401 Unauthorized | `INVALID_CREDENTIALS` |
| `InvalidRefreshTokenException` | 401 Unauthorized | `INVALID_REFRESH_TOKEN` |
| `AuthenticationException` | 401 Unauthorized | `AUTHENTICATION_ERROR` |
| `UnauthorizedAccessException` | 401 Unauthorized | `UNAUTHORIZED` |
| อื่นๆ (unhandled) | 500 Internal Server Error | `INTERNAL_ERROR` |

---

## 9. Database Queries

### 9.1 Read-Only Queries

```csharp
// ✅ DO: AsNoTracking สำหรับ read-only
public async Task<IEnumerable<ProductResponseModel>> GetProductsAsync(CancellationToken ct)
{
    var products = await _unitOfWork.Products
        .GetAll()
        .AsNoTracking()       // ✅ ไม่ track changes
        .Where(p => !p.DeleteFlag)
        .Include(p => p.Category)
        .OrderBy(p => p.Name)
        .ToListAsync(ct);

    return products.Select(ProductMapper.ToResponse);
}

// ✅ DO: Projection สำหรับ select specific fields
public async Task<IEnumerable<ProductSimpleResponseModel>> GetForDropdownAsync(CancellationToken ct)
{
    return await _unitOfWork.Products
        .GetAll()
        .AsNoTracking()
        .Where(p => p.IsActive && !p.DeleteFlag)
        .Select(p => new ProductSimpleResponseModel  // ✅ Project เฉพาะที่ต้องการ
        {
            ProductId = p.ProductId,
            Name = p.Name,
            Price = p.Price
        })
        .OrderBy(p => p.Name)
        .ToListAsync(ct);
}
```

### 9.2 Pagination

```csharp
// ✅ DO: Pagination สำหรับ large datasets
public async Task<(IEnumerable<ProductResponseModel> Items, int TotalCount)> GetPagedAsync(
    int pageIndex, int pageSize, CancellationToken ct)
{
    var query = _unitOfWork.Products
        .GetAll()
        .AsNoTracking()
        .Where(p => !p.DeleteFlag);

    var totalCount = await query.CountAsync(ct);

    var items = await query
        .OrderBy(p => p.Name)
        .Skip((pageIndex - 1) * pageSize)
        .Take(pageSize)
        .Include(p => p.Category)
        .ToListAsync(ct);

    return (items.Select(ProductMapper.ToResponse), totalCount);
}

// ❌ DON'T: Load all แล้ว filter ใน memory
public async Task<IEnumerable<ProductResponseModel>> GetAllBad()
{
    var all = await _unitOfWork.Products.GetAll().ToListAsync();        // ❌ Load ทั้งหมด
    var filtered = all.Where(p => !p.DeleteFlag && p.IsActive).ToList(); // ❌ Filter ใน memory
    return filtered.Select(ProductMapper.ToResponse);
}

// ❌ DON'T: N+1 Query Problem
public async Task<IEnumerable<ProductResponseModel>> GetWithCategoriesBad()
{
    var products = await _unitOfWork.Products
        .GetAll()
        .Where(p => !p.DeleteFlag)
        .ToListAsync();

    foreach (var product in products)
    {
        // ❌ Query ทุก product — 100 products = 101 queries
        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        product.Category = category;
    }

    return products.Select(ProductMapper.ToResponse);
}
```

---

## 10. Async/Await Patterns

```csharp
// ✅ DO: รับ CancellationToken และส่งต่อทุก I/O call
public async Task<ProductResponseModel> CreateProductAsync(
    CreateProductRequestModel request, CancellationToken ct = default)
{
    var exists = await _unitOfWork.Products.ExistsByNameAsync(request.Name, ct: ct);  // ✅
    var product = ProductMapper.ToEntity(request);
    await _unitOfWork.Products.AddAsync(product, ct);  // ✅
    await _unitOfWork.CommitAsync(ct);                    // ✅
    return ProductMapper.ToResponse(product);
}

// ❌ DON'T: ไม่มี CancellationToken
public async Task<ProductResponseModel> CreateProductAsyncBad(CreateProductRequestModel request)  // ❌
{
    var product = ProductMapper.ToEntity(request);
    await _unitOfWork.Products.AddAsync(product);  // ❌ ไม่ pass ct
    await _unitOfWork.CommitAsync();                  // ❌ ไม่ pass ct
    return ProductMapper.ToResponse(product);
}

// ❌ DON'T: Blocking
public ProductResponseModel GetProductBlocking(int id)
{
    var product = _unitOfWork.Products.GetByIdAsync(id).Result;  // ❌ Deadlock risk
    return ProductMapper.ToResponse(product);
}

// ❌ DON'T: async void (ยกเว้น event handlers)
public async void ProcessProductBad(int id)  // ❌ async void
{
    await _unitOfWork.Products.GetByIdAsync(id);
}
```

---

## 11. Logging

### 11.1 Structured Logging

```csharp
// ✅ DO: Named parameters (searchable logs)
_logger.LogInformation(
    "Product created: {ProductId} - {Name}, Category: {CategoryId}",
    product.ProductId, product.Name, product.CategoryId);

_logger.LogWarning(
    "Product stock low: {ProductId} - {Name}, Stock: {Stock}",
    product.ProductId, product.Name, product.Stock);

_logger.LogError(ex,
    "Failed to process sale: {SaleId}, Amount: {Amount}",
    saleId, amount);

// ❌ DON'T: String interpolation ใน logging
_logger.LogInformation($"Product created: {product.ProductId}");  // ❌ ไม่ searchable

// ❌ DON'T: Log sensitive data
_logger.LogInformation("User logged in: Password={Password}", password);  // ❌ Security risk
```

### 11.2 Log Levels

```csharp
_logger.LogTrace("Entering {Method} with id={Id}", nameof(GetProductByIdAsync), id);  // Trace
_logger.LogDebug("Query returned {Count} products", products.Count);                  // Debug
_logger.LogInformation("Sale {SaleId} completed, Total: {Total}", saleId, total);    // Info
_logger.LogWarning("Retry {Attempt}/3 for order {OrderId}", attempt, orderId);        // Warning
_logger.LogError(ex, "Failed to process payment for {SaleId}", saleId);              // Error
_logger.LogCritical(ex, "Database connection failed");                                 // Critical
```

---

## 12. Security

### 12.1 SQL Injection Prevention

```csharp
// ✅ DO: EF Core parameterizes อัตโนมัติ
var products = await _unitOfWork.Products
    .GetAll()
    .Where(p => p.Name.Contains(searchTerm))  // ✅ EF parameterizes
    .ToListAsync(ct);

// ✅ DO: FromSqlInterpolated สำหรับ raw SQL
var products = await _context.TbProducts
    .FromSqlInterpolated($"SELECT * FROM TbProducts WHERE Name LIKE {searchTerm}")  // ✅
    .ToListAsync(ct);

// ❌ DON'T: String concatenation ใน raw SQL
var products = await _context.TbProducts
    .FromSqlRaw($"SELECT * FROM TbProducts WHERE Name LIKE '%{searchTerm}%'")  // ❌ SQL Injection!
    .ToListAsync(ct);
```

### 12.2 Authorization

```csharp
// ✅ DO: Role-based authorization
[Authorize(Roles = "Admin")]
[HttpPost]
public async Task<IActionResult> CreateProduct(...) { }

[Authorize(Roles = "Admin,Manager")]
[HttpGet("reports")]
public async Task<IActionResult> GetReports(...) { }

// ✅ DO: ราคา/เงิน คำนวณ server-side เสมอ
[HttpPost]
public async Task<IActionResult> CreateSale([FromBody] CreateSaleRequest request, CancellationToken ct)
{
    // ❌ ห้าม trust client-side total:
    // var sale = new TbSale { TotalAmount = request.TotalAmount };

    // ✅ คำนวณ server-side:
    var result = await _saleService.CreateSaleAsync(request, ct);  // Service คำนวณเอง
    return Success(result);
}
```

---

## 13. Code Organization

### 13.1 File Structure

```
POS.Main.Business.Admin/{Module}/
├── Models/
│   ├── CreateProductRequestModel.cs
│   ├── UpdateProductRequestModel.cs
│   ├── ProductResponseModel.cs
│   ├── ProductSimpleResponseModel.cs
│   └── ProductMapper.cs          ← Manual Mapper (static class)
├── Interfaces/
│   └── IProductService.cs
├── Services/
│   └── ProductService.cs
└── Validators/
    ├── CreateProductRequestModelValidator.cs
    └── UpdateProductRequestModelValidator.cs
```

### 13.2 Region Organization

```csharp
public class ProductService : IProductService
{
    #region Constructor & Dependencies

    private readonly ILogger<ProductService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork, ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    #endregion

    #region Read Operations

    public async Task<ProductResponseModel> GetProductByIdAsync(...) { }
    public async Task<IEnumerable<ProductResponseModel>> GetProductsAsync(...) { }

    #endregion

    #region Write Operations

    public async Task<ProductResponseModel> CreateProductAsync(...) { }
    public async Task<ProductResponseModel> UpdateProductAsync(...) { }
    public async Task DeleteProductAsync(...) { }

    #endregion
}
```

---

## Summary Checklist

### ก่อนสร้าง Module ใหม่

- [ ] Entity inherit `BaseEntity`, ใช้ `Tb` prefix
- [ ] Entity Configuration ใช้ Fluent API (ไม่ใช้ Data Annotations)
- [ ] Repository Interface และ Implementation
- [ ] เพิ่ม Repository ใน UnitOfWork
- [ ] Service Interface และ Implementation
- [ ] Models (RequestModel/ResponseModel) — ไม่ expose Entity
- [ ] Manual Mapper (static class)
- [ ] FluentValidation Validators
- [ ] Controller ด้วย route `api/{module}` (ระบุ explicit route ทุก Controller)
- [ ] XML comments + ProducesResponseType บน Controller

### Code Review Checklist

- [ ] ทุก async method มี CancellationToken parameter
- [ ] ทุก async method มี Async suffix
- [ ] Read queries ใช้ AsNoTracking
- [ ] ไม่มี try-catch ใน Controller
- [ ] Controller inherit `BaseController` + ใช้ `Success()` / `ToActionResult()`
- [ ] Route ระบุ explicit `[Route("api/{module}")]` — ไม่ใช้ `[controller]` convention
- [ ] ใช้ specific exception types ใน Service (ValidationException, EntityNotFoundException, BusinessException)
- [ ] Response ใช้ `BaseResponseModel<T>` / `PaginationResult<T>` / `ListResponseModel<T>`
- [ ] Structured logging (named parameters)
- [ ] ไม่ log sensitive data
- [ ] Business logic อยู่ใน Service เท่านั้น
- [ ] ไม่ expose Entity โดยตรง ใช้ DTOs
- [ ] ราคา/เงิน คำนวณ server-side

---

## 14. Reusable Patterns

### 14.1 BaseEntity

```csharp
// ✅ DO — inherit BaseEntity
public class TbProduct : BaseEntity
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
}

// ❌ DON'T — define audit fields ซ้ำ
public class TbProduct : BaseEntity
{
    public int ProductId { get; set; }
    public DateTime CreatedAt { get; set; }   // ❌ ซ้ำกับ BaseEntity
    public bool DeleteFlag { get; set; }       // ❌ ซ้ำกับ BaseEntity
}

// ❌ DON'T — ไม่ inherit BaseEntity
public class TbProduct
{
    public int ProductId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; }    // ❌ ชื่อผิด ต้องเป็น DeleteFlag
}
```

### 14.2 Controller + BaseController

```csharp
// ✅ DO — inherit BaseController, ไม่มี try-catch, ระบุ route explicit
[ApiController]
[Route("api/inventory")]
public class ProductsController : BaseController
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
        => Success(await _productService.GetProductByIdAsync(id, ct));

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] PaginationModel param, CancellationToken ct = default)
        => ToActionResult(await _productService.GetProductsAsync(param, ct));

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken ct = default)
    {
        await _productService.DeleteProductAsync(id, GetUserId(), ct);
        return Success("ลบสินค้าสำเร็จ");
    }
}

// ❌ DON'T — inherit ControllerBase + try-catch + สร้าง response ด้วยมือ
public class ProductsController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        try {
            var result = await _productService.GetProductByIdAsync(id);
            return Ok(new ApiResponse<ProductResponseModel> { Success = true, Data = result });
        }
        catch (Exception ex) {
            return StatusCode(500, new ApiErrorResponse { ... });
        }
    }
}
```

### 14.3 Response Models + constResultType

**กฎ: ห้าม hardcode string `"success"` / `"fail"` — ใช้ `constResultType` เสมอ**

```csharp
// POS.Main.Core/Constants/constResultType.cs
public static class constResultType
{
    public const string Success = "success";
    public const string Fail = "fail";
}
```

```csharp
// ✅ DO — ใช้ constResultType.Success ผ่าน BaseController helpers
return Success(ProductMapper.ToResponse(product));

// ✅ DO — ใช้ PaginationResult<T> สำหรับ paginated list
var result = new PaginationResult<ProductResponseModel>
{
    Page = param.Page,
    ItemPerPage = param.ItemPerPage,
    Total = totalCount,
    Results = products.Select(ProductMapper.ToResponse).ToList(),
    Status = constResultType.Success
};

// ✅ DO — ใช้ ListResponseModel<T> สำหรับ dropdown / list ไม่แบ่งหน้า
return ListSuccess(items);

// ❌ DON'T — hardcode string "success" / "fail"
Status = "success"   // ❌ ใช้ constResultType.Success แทน
Status = "fail"      // ❌ ใช้ constResultType.Fail แทน

// ❌ DON'T — สร้าง response ด้วยมือใน Controller
return Ok(new ApiResponse<ProductResponseModel> { Success = true, Data = product, Timestamp = DateTime.UtcNow });

// ❌ DON'T — สร้าง error response ด้วยมือ
return BadRequest(new ApiErrorResponse { Error = new ErrorDetail { Code = "...", Message = "..." } });
```

**Response Model defaults:**
- `BaseResponseModel<T>`, `ListResponseModel<T>`, `PaginationResult<T>` ทุกตัว default Status = `constResultType.Fail`
- BaseController helpers (`Success()`, `ListSuccess()`, `PagedSuccess()`) จะ set Status = `constResultType.Success` ให้อัตโนมัติ
- GlobalExceptionFilter set Status = `constResultType.Fail` สำหรับ error responses

### 14.4 Soft Delete

```csharp
// ✅ DO — set DeleteFlag แล้ว save (DbContext auto-stamp DeletedAt/DeletedBy)
product.DeleteFlag = true;
await _unitOfWork.CommitAsync(ct);

// ❌ DON'T — set DeletedAt/DeletedBy ด้วยมือ (DbContext จัดการให้)
product.DeleteFlag = true;
product.DeletedAt = DateTime.UtcNow;    // ❌ ไม่จำเป็น
product.DeletedBy = userId;              // ❌ ไม่จำเป็น

// ❌ DON'T — hard delete
_context.Products.Remove(product);
```
