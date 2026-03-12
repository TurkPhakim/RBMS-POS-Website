# Backend Expert Agent — RBMS-POS

Last Updated: 2026-03-11

คุณเป็น ASP.NET Core 9.0 backend expert สำหรับโปรเจค **RBMS-POS** ระบบ Point of Sale

## System Context

**RBMS-POS** ระบบ POS ที่รองรับ:

- จัดการการขาย (POS transactions, ใบเสร็จ)
- จัดการพนักงาน (Human Resource)
- รายงานและสถิติ (Reports & Analytics)

## Architecture

```
RBMS.POS.WebAPI                    → Controllers, Filters, Hubs, Program.cs
POS.Main.Business.Admin            → Auth, ServiceCharge, File (Services, DTOs, Mappers)
POS.Main.Business.Menu             → Menu (Services, DTOs, Mappers)
POS.Main.Business.HumanResource    → Employee (Services, DTOs, Mappers)
POS.Main.Repositories             → Repository interfaces + implementations, UnitOfWork
POS.Main.Dal                      → Entities, DbContext, Migrations, Entity Configurations
POS.Main.Core                     → Enums, Constants, Custom Exceptions, Helpers
```

**Dependency direction:**

```
WebAPI → Business.* → Repositories → Dal → Core
```

---

## กฎที่ต้องปฏิบัติตาม

### 1. Controllers — Thin Controller Pattern

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    // ✅ ถูกต้อง — thin, ไม่มี business logic
    /// <summary>Get product by ID</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
    {
        var result = await _productService.GetProductByIdAsync(id, ct);
        return Success(result);
    }

    // ❌ ผิด — มี try-catch ใน controller (ให้ GlobalExceptionFilter จัดการ)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductBad(int id)
    {
        try { ... }
        catch (Exception ex) { return BadRequest(ex.Message); }
    }

    // ❌ ผิด — มี business logic ใน controller
    [HttpPost]
    public async Task<IActionResult> CreateProductBad(CreateProductRequest req)
    {
        if (req.Price < 0) return BadRequest("Price invalid"); // ควรอยู่ใน Service
        var product = new TbProduct { ... };                   // ควรอยู่ใน Service
    }
}
```

**Controller Rules:**

- Inherit จาก `BaseController`
- ห้ามมี `try-catch` — ใช้ GlobalExceptionFilter
- ห้ามมี business logic หรือ validation logic
- ใช้ `[Authorize]` หรือ `[AllowAnonymous]` ทุก endpoint
- รับ `CancellationToken ct = default` ทุก async method
- มี XML comments (`///`) และ `[ProducesResponseType]` ทุก action

---

### 2. Services — Business Logic Layer

```csharp
public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IUnitOfWork unitOfWork, ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ProductResponse> CreateProductAsync(
        CreateProductRequest request,
        CancellationToken ct = default)
    {
        // 1. Guard clauses / validation
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("กรุณาระบุชื่อสินค้า");

        try
        {
            // 2. Business rules — เรียก Repository method (ห้าม LINQ โดยตรง)
            var nameExists = await _unitOfWork.Products
                .IsNameExistsAsync(request.Name, ct);

            if (nameExists)
                throw new ValidationException($"สินค้าชื่อ '{request.Name}' มีอยู่แล้ว");

            // 3. Create entity — manual mapping (ห้ามใช้ AutoMapper)
            var product = new TbProduct
            {
                Name = request.Name,
                Price = request.Price,
                CategoryId = request.CategoryId,
            };

            // 4. Save — Commit ครั้งเดียวต่อ transaction
            await _unitOfWork.Products.InsertAsync(product, ct);
            await _unitOfWork.CommitAsync(ct);

            _logger.LogInformation("Product {ProductId} '{Name}' created",
                product.ProductId, product.Name);

            // 5. Return — manual mapping (ห้ามใช้ AutoMapper)
            return new ProductResponse
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Price = product.Price,
                CategoryId = product.CategoryId,
            };
        }
        catch (ValidationException) { throw; }
        catch (EntityNotFoundException) { throw; }
        catch (BusinessException) { throw; }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product '{Name}'", request.Name);
            throw new BusinessException("เกิดข้อผิดพลาดในการสร้างสินค้า");
        }
    }
}
```

**Service Rules:**

- Implement `IXxxService`
- **try-catch อยู่ในชั้น Service เท่านั้น** — re-throw business exceptions, wrap unexpected exception เป็น `BusinessException`
- **ห้ามใช้ AutoMapper เด็ดขาด** — ใช้ object initializer (manual mapping) เสมอ
- **เรียก Repository methods เท่านั้น** — ห้ามเขียน LINQ โดยตรงใน Service
- Throw specific exceptions (ห้าม throw generic `Exception`):
  - `ValidationException` — input ไม่ถูกต้อง → HTTP 400
  - `EntityNotFoundException` — ไม่พบข้อมูล → HTTP 404
  - `BusinessException` — business rule ไม่ผ่าน → HTTP 422
- ห้ามใช้ `DbContext` โดยตรง — ต้องผ่าน `IUnitOfWork`
- **Commit ครั้งเดียว** ต่อ transaction

---

### 3. Data Access — Repository Pattern

Repository เป็นผู้ execute query ทั้งหมด — Service ต้องเรียก Repository methods เท่านั้น ห้ามเขียน LINQ ใน Service

```csharp
// ✅ ถูกต้อง — Repository interface กำหนด methods ชัดเจน
public interface IProductRepository : IGenericRepository<TbProduct>
{
    Task<bool> IsNameExistsAsync(string name, CancellationToken ct = default);
    Task<List<ProductListResponse>> GetActiveListAsync(CancellationToken ct = default);
    Task<ProductDetailResponse?> GetDetailByIdAsync(int id, CancellationToken ct = default);
    Task<(List<ProductListResponse> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search, CancellationToken ct = default);
}

// ✅ ถูกต้อง — Repository implementation — LINQ อยู่ที่นี่เท่านั้น
public class ProductRepository : GenericRepository<TbProduct>, IProductRepository
{
    public async Task<bool> IsNameExistsAsync(string name, CancellationToken ct = default)
        => await GetAll().AsNoTracking()
            .AnyAsync(p => p.Name == name && !p.DeleteFlag, ct);

    public async Task<List<ProductListResponse>> GetActiveListAsync(CancellationToken ct = default)
        => await GetAll().AsNoTracking()
            .Where(p => !p.DeleteFlag && p.IsActive)
            .OrderBy(p => p.Name)
            .Select(p => new ProductListResponse
            {
                ProductId = p.ProductId,
                Name = p.Name,
                Price = p.Price,
                CategoryName = p.Category.Name,
            })
            .ToListAsync(ct);
}

// ✅ ถูกต้อง — Service เรียก Repository method (ไม่ทำ LINQ เอง)
var products = await _unitOfWork.Products.GetActiveListAsync(ct);
var nameExists = await _unitOfWork.Products.IsNameExistsAsync(request.Name, ct);

// ❌ ผิด — Service เขียน LINQ โดยตรง
var products = await _unitOfWork.Products.GetAll()
    .Where(p => !p.DeleteFlag).ToListAsync(ct);  // ควรอยู่ใน Repository

// ❌ ผิด — N+1 Query Problem
foreach (var product in products)
{
    var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId); // query ในลูป!
}

// ❌ ผิด — Commit ในลูป
foreach (var item in items)
{
    await _unitOfWork.Items.InsertAsync(item);
    await _unitOfWork.CommitAsync(); // ช้า + ไม่ atomic
}
```

---

### 4. Async/Await Rules

```csharp
// ✅ ถูกต้อง — ส่งต่อ CancellationToken + เรียก Repository method
public async Task<ProductResponse> GetProductAsync(int id, CancellationToken ct = default)
{
    try
    {
        var product = await _unitOfWork.Products.GetDetailByIdAsync(id, ct);

        if (product == null)
            throw new EntityNotFoundException("Product", id);

        return product;
    }
    catch (EntityNotFoundException) { throw; }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting product {ProductId}", id);
        throw new BusinessException("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
    }
}

// ❌ ผิด — .Result blocks thread (deadlock risk)
var product = _unitOfWork.Products.GetAll()
    .FirstOrDefaultAsync(p => p.ProductId == id).Result;

// ❌ ผิด — async void
public async void ProcessProduct(int id) { ... }

// ❌ ผิด — ไม่ forward CancellationToken
var data = await _unitOfWork.Products.GetAll()
    .FirstOrDefaultAsync(p => p.ProductId == id);  // ขาด ct!
```

---

### 5. Error Handling

```csharp
// Validation error (input ไม่ถูกต้อง)
if (string.IsNullOrWhiteSpace(request.Name))
    throw new ValidationException("กรุณาระบุชื่อสินค้า");

// Entity not found
var product = await _unitOfWork.Products
    .GetAll()
    .FirstOrDefaultAsync(p => p.ProductId == id, ct);
if (product == null)
    throw new EntityNotFoundException("Product", id);

// Business rule violation
if (product.DeleteFlag)
    throw new BusinessException("ไม่สามารถแก้ไขสินค้าที่ถูกลบแล้ว");

if (product.StockQuantity < request.Quantity)
    throw new BusinessException($"สินค้าคงเหลือไม่เพียงพอ (มี {product.StockQuantity} ชิ้น)");
```

---

### 6. Structured Logging

```csharp
// ✅ ถูกต้อง — named parameters (structured logging)
_logger.LogInformation("Product {ProductId} '{Name}' updated by user {UserId}",
    product.ProductId, product.Name, currentUserId);

_logger.LogWarning("Stock low for Product {ProductId}: {CurrentStock} remaining",
    product.ProductId, product.StockQuantity);

// ❌ ผิด — string interpolation (ไม่ searchable ใน log system)
_logger.LogInformation($"Product {product.ProductId} updated");
```

---

### 7. Naming Conventions

```csharp
// Classes, Methods, Properties → PascalCase
public class ProductService { }
public async Task<ProductResponse> CreateProductAsync() { }
public decimal TotalAmount { get; set; }

// Local variables, Parameters → camelCase
int productId = 1;
string productName = "Widget";

// Async methods → ลงท้ายด้วย Async
GetProductAsync(), CreateProductAsync(), UpdateStockAsync()

// Interfaces → prefix I
IProductService, IInventoryRepository

// Private fields → _camelCase
private readonly IUnitOfWork _unitOfWork;
private readonly ILogger<ProductService> _logger;

// Constants → PascalCase
private const decimal VatRate = 0.07m;
private const int MaxRetryCount = 3;
```

---

### 8. Dependency Injection (Manual Registration)

```csharp
// ✅ ลงทะเบียนด้วยมือใน Program.cs ทุก Service/Repository
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
```

---

## ตัวอย่าง Complete Feature: Soft Delete

```csharp
public async Task DeleteProductAsync(int id, CancellationToken ct = default)
{
    try
    {
        // เรียก Repository method — ห้ามเขียน LINQ ใน Service
        var product = await _unitOfWork.Products.GetByIdAsync(id, ct);

        if (product == null)
            throw new EntityNotFoundException("Product", id);

        if (product.DeleteFlag)
            throw new BusinessException("สินค้านี้ถูกลบไปแล้ว");

        // Soft delete — DbContext auto-stamp DeletedAt/DeletedBy
        product.DeleteFlag = true;

        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("Product {ProductId} soft-deleted", id);
    }
    catch (EntityNotFoundException) { throw; }
    catch (BusinessException) { throw; }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error deleting product {ProductId}", id);
        throw new BusinessException("เกิดข้อผิดพลาดในการลบสินค้า");
    }
}
```

---

## Reference

- [backend-guide.md](../development/backend-guide.md) — Architecture patterns + Database Conventions
- [module-development-workflow.md](../development/module-development-workflow.md) — Step-by-step workflow
