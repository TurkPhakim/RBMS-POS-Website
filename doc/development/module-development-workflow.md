# Module Development Workflow — RBMS-POS

> อัพเดตล่าสุด: 2026-03-10
>
> **Related docs:** [backend-guide.md](backend-guide.md) | [frontend-guidelines.md](frontend-guidelines.md) | [ai-prompting-guide.md](ai-prompting-guide.md)

คู่มือขั้นตอนการพัฒนา 1 Module ตั้งแต่ Backend ไปจนถึง Frontend

---

## End-to-End Development Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MODULE DEVELOPMENT FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BACKEND (ASP.NET Core 9)               FRONTEND (Angular 19.1)         │
│  ───────────────────────                ────────────────────            │
│                                                                          │
│  1. Design (SA) — Entity, API, Rules                                     │
│         ↓                                                                │
│  2. Entity + Configuration                                               │
│         ↓                                                                │
│  3. Migration                                                            │
│         ↓                                                                │
│  4. Repository (interface + impl)                                        │
│         ↓                                                                │
│  5. Unit of Work (add repository)                                        │
│         ↓                                                                │
│  6. DTOs (Request / Response)                                            │
│         ↓                                                                │
│  7. Manual Mapper (static class)                                         │
│         ↓                                                                │
│  8. Service (interface + impl)                                           │
│         ↓                                                                │
│  9. Controller + XML comments                                            │
│         ↓                                                                │
│  10. Register DI + Run Swagger       →  11. Generate API Client          │
│                                              ↓                           │
│                                         12. Create Feature Module        │
│                                              ↓                           │
│                                         13. Pages (smart components)     │
│                                              ↓                           │
│                                         14. Components (presentational)  │
│                                              ↓                           │
│                                         15. Routing + Guards             │
│                                              ↓                           │
│                                         16. Integration Test             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Backend Development

### Step 1: Design (System Analyst)

ก่อนเขียนโค้ด ต้องออกแบบก่อนเสมอ — ดูรายละเอียดใน [system-analyst.md](../agents/system-analyst.md)

**Output ที่ต้องได้:**
- Entity schema + relationships
- API endpoints (method + path + request/response)
- Business rules
- DTOs structure

### Step 2: Create Entity

```csharp
// POS.Main.Dal/Entities/{Module}/TbProduct.cs
public class TbProduct : BaseEntity
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual TbCategory Category { get; set; } = null!;
}
```

### Step 3: Create Entity Configuration

```csharp
// POS.Main.Dal/EntityConfigurations/TbProductConfiguration.cs
public class TbProductConfiguration : IEntityTypeConfiguration<TbProduct>
{
    public void Configure(EntityTypeBuilder<TbProduct> builder)
    {
        builder.ToTable("TbProducts");
        builder.HasKey(x => x.ProductId);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        builder.HasOne(x => x.Category).WithMany(c => c.Products)
            .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.DeleteFlag);
    }
}
```

Add DbSet ใน POSMainContext:
```csharp
public DbSet<TbProduct> Products { get; set; }
```

### Step 4: Create Migration

```bash
cd Backend-POS
dotnet ef migrations add AddProductTable \
    --project POS.Main/POS.Main.Dal \
    --startup-project POS.Main/RBMS.POS.WebAPI

dotnet ef database update \
    --project POS.Main/POS.Main.Dal \
    --startup-project POS.Main/RBMS.POS.WebAPI
```

### Step 5: Create Repository

```csharp
// Interface: POS.Main.Repositories/Interfaces/IProductRepository.cs
public interface IProductRepository : IGenericRepository<TbProduct>
{
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken ct = default);
}

// Implementation: POS.Main.Repositories/Implementations/ProductRepository.cs
public class ProductRepository : GenericRepository<TbProduct>, IProductRepository
{
    public ProductRepository(POSMainContext context) : base(context) { }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken ct = default)
        => await _dbSet.AnyAsync(p => p.Name == name && !p.DeleteFlag
                                  && (excludeId == null || p.ProductId != excludeId), ct);
}
```

### Step 6: Add to Unit of Work

```csharp
// IUnitOfWork.cs
IProductRepository Products { get; }

// UnitOfWork.cs
private IProductRepository? _products;
public IProductRepository Products => _products ??= new ProductRepository(_context);
```

### Step 7: Create DTOs

```csharp
// POS.Main.Business.Admin/Inventory/Models/ProductRequest.cs
public class CreateProductRequest
{
    [Required] [StringLength(200)] public string Name { get; set; } = string.Empty;
    [Required] [Range(0, 9999999)] public decimal Price { get; set; }
    public int CategoryId { get; set; }
}

// POS.Main.Business.Admin/Inventory/Models/ProductResponse.cs
public class ProductResponse
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Step 8: Create Mapper Class (Manual Mapping)

```csharp
// POS.Main.Business.Admin/Inventory/Models/ProductMapper.cs
public static class ProductMapper
{
    public static ProductResponse ToResponse(TbProduct entity)
    {
        return new ProductResponse
        {
            ProductId = entity.ProductId,
            Name = entity.Name,
            Price = entity.Price,
            CategoryName = entity.Category?.Name ?? string.Empty,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };
    }

    public static TbProduct ToEntity(CreateProductRequest request)
    {
        return new TbProduct
        {
            Name = request.Name,
            Price = request.Price,
            CategoryId = request.CategoryId
        };
    }
}
```

### Step 9: Create Service

```csharp
// Interface
public interface IProductService
{
    Task<ProductResponse> GetProductByIdAsync(int id, CancellationToken ct = default);
    Task<ProductResponse> CreateProductAsync(CreateProductRequest request, CancellationToken ct = default);
    Task DeleteProductAsync(int id, CancellationToken ct = default);
}

// Implementation
public class ProductService : IProductService
{
    // ... ดูตัวอย่างใน backend-guide.md
}
```

### Step 10: Create Controller

```csharp
// RBMS.POS.WebAPI/Controllers/ProductsController.cs
[ApiController]
[Route("api/inventory")]
[Authorize]
[Produces("application/json")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;
    public ProductsController(IProductService productService) => _productService = productService;

    /// <summary>Get all products</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductResponse>), 200)]
    public async Task<IActionResult> GetProducts(CancellationToken ct = default)
        => Success(await _productService.GetProductsAsync(ct));

    /// <summary>Create product</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProductResponse), 201)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest req, CancellationToken ct = default)
    {
        var result = await _productService.CreateProductAsync(req, ct);
        return CreatedAtAction(nameof(GetProducts), new { id = result.ProductId }, result);
    }
}
```

Register ใน Program.cs (Manual DI):
```csharp
builder.Services.AddScoped<IProductService, ProductService>();
```

**→ รัน backend และเปิด Swagger ตรวจสอบก่อนไปทำ Frontend**

---

## Part 2: Frontend Development

### Step 11: Generate API Client

```bash
cd Frontend-POS/RBMS-POS-Client
npm run gen-api
```

จะสร้าง:
- `src/app/core/api/models/product-response.ts`
- `src/app/core/api/models/create-product-request.ts`
- `src/app/core/api/services/products.service.ts`

### Step 12: Create Feature Module

```bash
ng generate module features/inventory --routing
ng generate component features/inventory/pages/product-list --module features/inventory
ng generate component features/inventory/pages/product-manage --module features/inventory
ng generate component features/inventory/components/product-card --module features/inventory
```

### Step 13: Create Pages (Smart Components)

```typescript
// product-list.component.ts
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: false
})
export class ProductListComponent implements OnInit {
  products = signal<ProductResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  showDeleteConfirm = signal(false);
  selectedProduct = signal<ProductResponse | null>(null);

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void { this.loadProducts(); }

  onEditClick(product: ProductResponse): void {
    this.router.navigate(['inventory/products', product.productId, 'edit']);
  }

  onDeleteClick(product: ProductResponse): void {
    this.selectedProduct.set(product);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDelete(): void {
    const p = this.selectedProduct();
    if (!p) return;
    this.productsService.apiV1ProductsIdDelete({ id: p.productId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadProducts() });
    this.showDeleteConfirm.set(false);
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.productsService.apiV1ProductsGet()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.products.set(res.result ?? []),
        error: () => this.error.set('ไม่สามารถโหลดข้อมูลสินค้าได้')
      });
  }
}
```

### Step 14: Template

```html
<!-- product-list.component.html -->
<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-page-title">รายการสินค้า</h1>
    <a routerLink="create"
       class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
      + เพิ่มสินค้า
    </a>
  </div>

  @if (isLoading()) {
    <div class="flex justify-center py-12">กำลังโหลด...</div>
  } @else if (error()) {
    <div class="text-danger p-4 bg-danger-bg rounded-lg">{{ error() }}</div>
  } @else {
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (product of products(); track product.productId) {
        <app-product-card
          [product]="product"
          (editClicked)="onEditClick($event)"
          (deleteClicked)="onDeleteClick($event)" />
      } @empty {
        <p class="col-span-full text-surface-sub text-center py-12">
          ยังไม่มีสินค้า
        </p>
      }
    </div>
  }
</div>

<app-confirm-modal
  [isOpen]="showDeleteConfirm()"
  title="ยืนยันการลบ"
  message="คุณต้องการลบสินค้านี้ใช่หรือไม่?"
  [itemName]="selectedProduct()?.name"
  type="danger"
  (confirmed)="onConfirmDelete()"
  (cancelled)="showDeleteConfirm.set(false)" />
```

### Step 15: Routing + Guard

```typescript
// inventory-routing.module.ts
const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'create', component: ProductManageComponent },
  { path: ':id/edit', component: ProductManageComponent },
];

// app-routing.module.ts (lazy loading)
{
  path: 'inventory',
  canActivate: [AuthGuard],
  loadChildren: () =>
    import('./features/inventory/inventory.module').then(m => m.InventoryModule),
}
```

### Step 16: Integration Test

- เปิด browser ที่ http://localhost:4300
- ทดสอบ: list, create, edit, delete
- ตรวจ network tab ว่า API calls ถูกต้อง
- ตรวจ console ว่าไม่มี errors

---

## Feature Development Checklist

### Backend
- [ ] ออกแบบ Entity, API, Business Rules (SA)
- [ ] สร้าง Entity class ใน `POS.Main.Dal/Entities/`
- [ ] สร้าง Entity Configuration ใน `EntityConfigurations/`
- [ ] Add DbSet ใน `POSMainContext`
- [ ] สร้าง Migration + apply
- [ ] สร้าง Repository interface + implementation
- [ ] Add repository ใน UnitOfWork
- [ ] สร้าง Request/Response DTOs
- [ ] สร้าง Manual Mapper class
- [ ] สร้าง Service interface + implementation
- [ ] สร้าง Controller + XML comments + ProducesResponseType
- [ ] Register ใน Program.cs (ถ้าจำเป็น)
- [ ] ทดสอบใน Swagger UI

### Frontend
- [ ] รัน `npm run gen-api` หลัง backend พร้อม
- [ ] สร้าง Feature Module + Routing
- [ ] สร้าง Page components (smart)
- [ ] สร้าง Presentational components
- [ ] ใช้ generated API service (ห้าม manual HTTP)
- [ ] ใช้ PrimeNG components (p-table, p-dropdown, p-button ฯลฯ) — ห้ามเขียนเอง
- [ ] Implement subscription cleanup (destroyRef / destroy$)
- [ ] ใช้ design tokens ใน styling
- [ ] ทดสอบ integration แบบ end-to-end
