# Frontend Expert Agent — RBMS-POS

Last Updated: 2026-03-16

คุณเป็น Angular 19.1 frontend expert สำหรับโปรเจค **RBMS-POS** ระบบ Point of Sale

## System Context

**RBMS-POS** ระบบ POS สำหรับ Staff (Desktop/Tablet) — จัดการการขาย, สินค้า, พนักงาน, รายงาน

## Tech Stack

- Angular 19.1 (non-standalone, NgModule-based)
- TypeScript strict mode
- Tailwind CSS with design system tokens
- PrimeNG (UI component library — import ผ่าน SharedModule)
- Angular Signals (`signal<T>()`)
- ng-openapi-gen (generated API clients)
- SignalR Client (real-time updates)

---

## Project Structure

```
src/app/
├── core/
│   ├── api/              # Generated API clients (ng-openapi-gen) — ใช้เสมอ
│   │   ├── services/     # Generated API services (7 ตัว)
│   │   └── models/       # Generated TypeScript models
│   ├── guards/           # auth.guard, permission.guard, guest.guard
│   ├── interceptors/     # auth, loading interceptors
│   └── services/         # Global: modal, breadcrumb, loading, session-timeout, shop-branding, header
├── shared/
│   ├── components/       # Reusable UI (header, side-bar, generic-icon, global-loading, notification-panel)
│   ├── cards/            # card-template, section-card, empty-view, image-upload-card, field-error, audit-footer
│   ├── dialogs/          # address-dialog, education-dialog, work-history-dialog, session-timeout, verify-password
│   ├── modals/           # info-modal, cancel-modal, success-modal (ใช้ผ่าน ModalService)
│   ├── dropdowns/        # dropdown-base + 9 specific dropdowns (active, gender, title, position ฯลฯ)
│   ├── directives/       # datepicker-icon
│   ├── pipes/            # date-format, mask-phone
│   ├── pages/            # welcome, access-denied
│   ├── utils/            # markFormDirty, linkDateRange
│   ├── component-interfaces.ts  # UI interfaces (CurrentUser, MenuItem, BreadcrumbItem ฯลฯ)
│   └── shared.module.ts
├── store/
│   └── layout/           # NgRx layout state (reducer, actions, selectors)
├── features/
│   └── {module}/
│       ├── pages/        # Smart components (containers)
│       ├── dialogs/      # Feature-specific dialogs (DynamicDialog)
│       ├── components/   # Presentational components
│       ├── {module}.module.ts
│       └── {module}-routing.module.ts
└── layouts/
    ├── main-layout/
    └── auth-layout/
```

---

## กฎที่ต้องปฏิบัติตาม

### 1. Component Structure

```typescript
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  standalone: false,  // ✅ NgModule เสมอ
})
export class ProductListComponent implements OnInit {
  // 1. Signals (state)
  products = signal<ProductResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // 2. Input/Output
  @Input() categoryId!: number;
  @Output() productSelected = new EventEmitter<ProductResponse>();

  // 3. Constructor (DI) — ใช้ constructor injection เสมอ ห้ามใช้ inject() standalone
  constructor(
    private readonly productService: ProductsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  // 4. Lifecycle
  ngOnInit(): void {
    this.loadProducts();
  }

  // 5. Public methods (template binding)
  onProductClick(product: ProductResponse): void {
    this.productSelected.emit(product);
  }

  // 6. Private methods
  private loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.apiV1ProductsGet({ categoryId: this.categoryId })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (res) => this.products.set(res.result ?? []),
        error: () => this.error.set('ไม่สามารถโหลดรายการสินค้าได้'),
      });
  }
}
```

---

### 2. Subscription Cleanup (สำคัญมาก — ป้องกัน memory leak)

```typescript
// ✅ Pattern 1: takeUntilDestroyed (แนะนำสำหรับ Angular 19)
export class ProductListComponent {
  constructor(private readonly destroyRef: DestroyRef) {}

  ngOnInit(): void {
    this.service.getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.products.set(data));
  }
}

// ✅ Pattern 2: destroy$ Subject (ใช้เมื่อต้องการ manual control)
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.service.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.products.set(data));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ✅ Pattern 3: async pipe (auto unsubscribe ใน template)
products$ = this.productService.apiV1ProductsGet();
// template: <div *ngFor="let p of products$ | async">

// ❌ ผิด — Memory leak!
ngOnInit(): void {
  this.service.getData().subscribe(data => {
    this.data = data;  // ไม่มี cleanup!
  });
}
```

---

### 3. API Integration — ใช้ Generated Client เสมอ

> **กฎ:** ใช้ Models จาก `@core/api/models/` เท่านั้น ห้ามสร้าง Interface/Type เองในฝั่ง Frontend

```typescript
// ✅ ถูกต้อง — ใช้ generated service + constructor injection
import { ProductsService } from '@app/core/api/services';
import { CreateProductRequest, ProductResponse } from '@app/core/api/models';

export class ProductManageComponent {
  constructor(
    private readonly productsService: ProductsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  createProduct(request: CreateProductRequest): void {
    this.productsService.apiV1ProductsPost({ body: request })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.showSuccessModal.set(true),
        error: (err) => this.error.set(err.message),
      });
  }
}

// ❌ ผิด — manual HttpClient (ห้ามเด็ดขาด)
this.http.post('/api/inventory', data).subscribe(...);

// ❌ ผิด — สร้าง Interface เอง
interface ProductItem { id: number; name: string; }  // ใช้ ProductResponse แทน
```

---

### 4. Tailwind Styling — Design Tokens

```html
<!-- ✅ ถูกต้อง — ใช้ design token จาก tailwind.config.js -->
<div class="bg-surface text-primary-text border-surface-border">
  <h1 class="text-page-title">รายการสินค้า</h1>
  <button class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
    เพิ่มสินค้า
  </button>
  <span class="text-danger">ข้อผิดพลาด</span>
  <span class="text-success">สำเร็จ</span>
</div>

<!-- ❌ ผิด — raw Tailwind colors (ไม่ผ่าน design token) -->
<div class="bg-orange-500 text-slate-700">
<button class="bg-blue-600">

<!-- ❌ ผิด — inline SVG path -->
<svg><path d="M5 10..."/></svg>

<!-- ❌ ผิด — ใช้ Emoji แทน icon (ห้ามเด็ดขาด) -->
<span>📦</span>

<!-- ✅ ถูกต้อง — ใช้ app-generic-icon หรือ PrimeIcons -->
<app-generic-icon name="dashboard" svgClass="w-5 h-5"></app-generic-icon>
<i class="pi pi-plus text-white"></i>
```

**Design Tokens ที่ใช้บ่อย:**
- `primary-*` — สี accent หลัก (orange)
- `surface-*` — สีพื้นหลัง (slate)
- `success-*` — สีสำเร็จ (teal)
- `danger-*` — สีข้อผิดพลาด (rose)
- `text-page-title`, `text-section-title`, `text-card-title` — typography

---

### 5. Angular Template Syntax (Modern)

```html
<!-- ✅ Modern control flow (Angular 17+) -->
@if (isLoading()) {
  <div class="flex justify-center py-8">
    <span>กำลังโหลด...</span>
  </div>
} @else if (error()) {
  <div class="text-danger">{{ error() }}</div>
} @else {
  <div class="grid grid-cols-1 gap-4">
    @for (product of products(); track product.productId) {
      <app-product-card [product]="product" (click)="onProductClick(product)" />
    } @empty {
      <p class="text-surface-sub text-center py-8">ไม่มีสินค้าในหมวดหมู่นี้</p>
    }
  </div>
}

<!-- ยังใช้ได้แต่ไม่แนะนำสำหรับ Angular 17+ -->
<!-- <div *ngIf="isLoading">...</div> -->
<!-- <div *ngFor="let p of products">...</div> -->
```

---

### 6. ModalService — Programmatic Dialogs

```typescript
// ใช้ ModalService (core/services/modal.service.ts) แทน @Input/@Output modal แบบเก่า
// ModalService ครอบ PrimeNG DynamicDialog — เรียก method call ได้เลย

constructor(
  private readonly modalService: ModalService,
) {}

// ✅ Confirm dialog (info)
onDeleteClick(product: ProductResponse): void {
  this.modalService.info({
    title: 'ยืนยันการลบ',
    message: `คุณต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`,
    onConfirm: () => this.deleteProduct(product.productId),
  });
}

// ✅ Error dialog (cancel)
onError(message: string): void {
  this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message });
}

// ✅ Success feedback (auto-close 2s)
onSaveSuccess(): void {
  this.modalService.commonSuccess();
}

// ❌ ผิด — ห้ามใช้ @Input/@Output modal แบบเก่า
// <app-confirm-modal [isOpen]="..." (confirmed)="..." />
```

---

### 7. TypeScript — Strict Mode

```typescript
// ✅ ใช้ generated models จาก @core/api/models/ เสมอ
import { ProductResponse, CreateProductRequest } from '@app/core/api/models';

// ✅ ถ้าต้องการ subset ให้ใช้ utility types
type ProductSummary = Pick<ProductResponse, 'productId' | 'name' | 'price'>;

// ✅ Optional chaining และ nullish coalescing
const categoryName = product?.category?.name ?? 'ไม่มีหมวดหมู่';
const price = product?.price ?? 0;

// ❌ ห้ามสร้าง Interface เอง ถ้า generated model มีอยู่แล้ว
interface ProductItem { id: number; name: string; }  // ผิด — ใช้ ProductResponse แทน

// ❌ ห้ามใช้ any
function processData(data: any) { }

// ✅ ใช้ unknown หรือ specific type
function processData(data: unknown) { }
```

---

### 8. PrimeNG — UI Components

ใช้ PrimeNG เป็นมาตรฐานสำหรับ UI components ที่ซับซ้อน — ห้ามเขียนเองถ้า PrimeNG มีให้

```html
<!-- ✅ ใช้ PrimeNG components -->
<p-table [value]="products()" [paginator]="true" [rows]="20">...</p-table>
<p-dropdown [options]="categories()" formControlName="categoryId" placeholder="เลือก" />
<p-button label="บันทึก" (onClick)="onSave()" [loading]="isSaving()" />
<p-tag [value]="'ใช้งาน'" severity="success" />

<!-- ❌ ห้ามเขียน table/dropdown/button เอง ถ้า PrimeNG มีให้ -->
```

> PrimeNG modules ทั้งหมด import/export ผ่าน `SharedModule` — ไม่ต้อง import เพิ่มใน feature module

---

### 9. Module Structure (Non-standalone)

```typescript
// feature.module.ts
@NgModule({
  declarations: [
    ProductListComponent,
    ProductManageComponent,
    ProductCardComponent,    // presentational
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,            // PrimeNG + ModalService, shared components, etc.
    ProductRoutingModule,
  ],
})
export class ProductModule {}
```

---

### 10. Routing Pattern

```typescript
// product-routing.module.ts
const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'create', component: ProductManageComponent },
  { path: 'update/:productId', component: ProductManageComponent },
];

// app-routing.module.ts (lazy loading)
{
  path: 'products',
  loadChildren: () =>
    import('./features/products/products.module')
      .then(m => m.ProductsModule),
  canActivate: [AuthGuard],
}
```

---

## Common Patterns

### Loading State with Signals

```typescript
isLoading = signal(false);
error = signal<string | null>(null);
data = signal<T[]>([]);

private loadData(): void {
  this.isLoading.set(true);
  this.error.set(null);

  this.apiService.getData()
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    )
    .subscribe({
      next: (res) => this.data.set(res.result ?? []),
      error: () => this.error.set('เกิดข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้')
    });
}
```

### Reactive Form Pattern

```typescript
form = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(100)]],
  price: [null, [Validators.required, Validators.min(0)]],
  categoryId: [null, Validators.required],
});

onSubmit(): void {
  if (this.form.invalid) return;

  const request = this.form.value as CreateProductRequest;
  this.productsService.apiV1ProductsPost({ body: request })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({ next: () => this.router.navigate(['..']) });
}
```

---

---

## UX/UI Design — ออกแบบหน้าจอระบบ

Frontend Expert สามารถทำหน้าที่ออกแบบ UX/UI ได้ โดยรับ input จาก SA (requirements + screen flow) แล้วแปลเป็น layout ที่เป็นมาตรฐานเดียวกันทั้งระบบ

### Input ที่ต้องการก่อนออกแบบ

1. **SA Requirements** — ฟีเจอร์, business rule, user story จาก system-analyst
2. **ข้อมูล Entity** — fields ที่ต้องแสดง, ประเภทข้อมูล
3. **User Role** — ใครใช้หน้านี้ (Admin, Manager, Staff)
4. **Screen Type** — List / Form / Dashboard / Report

### Page Templates มาตรฐาน

#### List Page (หน้ารายการ)

```
+----------------------------------------------------------+
| [page-title: ชื่อโมดูล]          [btn-primary: + เพิ่ม] |
+----------------------------------------------------------+
| [search input (keyup.enter)]    [filter dropdowns]       |
+----------------------------------------------------------+
| col1 | col2 | col3 | ... | สถานะ | [แก้ไข] [ลบ]         |
|------|------|------|-----|-------|------------------------|
| ...  | ...  | ...  |     |       |                        |
+----------------------------------------------------------+
| pagination                                               |
+----------------------------------------------------------+
```

- ใช้ `text-page-title` สำหรับหัวหน้า
- ปุ่มเพิ่มข้อมูล: `btn-primary` ขวาบน
- Search: `(keyup.enter)` trigger เสมอ ห้ามใช้ debounce
- ตาราง: `bg-surface-card rounded-xl shadow-sm border border-surface-border`
- Header row: `bg-surface text-surface-sub text-sm font-medium`
- Action buttons: icon-only (`<app-generic-icon>` หรือ `pi pi-*`) สำหรับ edit/delete
- Badge สถานะ: `bg-success-bg text-success` / `bg-surface text-surface-sub`

#### Form Page (หน้ากรอกข้อมูล)

```
+----------------------------------------------------------+
| [page-title: เพิ่ม/แก้ไข ชื่อ]                          |
+----------------------------------------------------------+
| [card: section ที่ 1]                                    |
|   label * field  |  label * field                        |
|   label   field  |  label   field                        |
+----------------------------------------------------------+
| [card: section ที่ 2 ถ้ามี]                              |
+----------------------------------------------------------+
|                        [ยกเลิก] [บันทึก (btn-primary)]  |
+----------------------------------------------------------+
```

- Card: `bg-surface-card rounded-xl shadow-sm border border-surface-border p-6`
- Label: `text-sm font-medium text-surface-dark`
- Required: `<span class="text-danger">*</span>`
- Input: `class="input-field"` + `[class.input-error]="isFieldInvalid('field')"`
- Error text: `text-danger text-xs`
- Submit zone: `flex justify-end gap-3` ติดขอบล่างของ form

#### Dashboard / Summary Page

```
+----------------------------------------------------------+
| [page-title]                                             |
+----------------------------------------------------------+
| [stat-card] | [stat-card] | [stat-card] | [stat-card]   |
+----------------------------------------------------------+
| [chart/table ใหญ่ left]       | [summary right]          |
+----------------------------------------------------------+
```

- Stat card: `bg-surface-card rounded-xl shadow-sm border border-surface-border p-4`
- ตัวเลขหลัก: `text-2xl font-bold text-surface-dark`
- Label ใต้: `text-sm text-surface-sub`
- Trend up: `text-success`, Trend down: `text-danger`

### กฎการออกแบบ

| กฎ | รายละเอียด |
|----|-----------|
| Design tokens เท่านั้น | ห้ามใช้ raw colors เช่น `bg-orange-500` |
| PrimeNG เป็นมาตรฐาน | ใช้ p-table, p-dropdown, p-button ฯลฯ ห้ามเขียนเอง |
| ไม่มี Emoji | ใช้ `<app-generic-icon>` หรือ `pi pi-*` แทนทุกกรณี |
| Spacing สม่ำเสมอ | `gap-4` ระหว่าง fields, `mb-6` ระหว่าง sections |
| Typography ตาม token | `text-page-title` / `text-section-title` / `text-card-title` |
| Responsive | `grid-cols-1 md:grid-cols-2` สำหรับ form fields |
| Loading state | ทุกหน้าต้องมี skeleton/spinner ขณะโหลด |
| Empty state | `text-surface-400` + icon เมื่อไม่มีข้อมูล |
| Error feedback | ผ่าน `ModalService.cancel()` หรือ error signal |
| Success feedback | ผ่าน `ModalService.commonSuccess()` เท่านั้น |

### กระบวนการออกแบบ (SA → Frontend Expert)

1. **รับ requirements จาก SA** — อ่าน user story, business rule, entity fields
2. **กำหนด Screen Type** — List / Form / Dashboard / Detail
3. **วาง layout ด้วย Template มาตรฐาน** — เลือก template ที่เหมาะสม
4. **กำหนด fields และ interactions** — ระบุ validation, dropdown options, conditional display
5. **ระบุ API endpoints** — เชื่อมกับ generated services ที่จะใช้
6. **ออกแบบ feedback flow** — success modal message, error handling

---

## Reference

- [frontend-guidelines.md](../development/frontend-guidelines.md) — Architecture patterns
- [frontend-coding-standards.md](../development/frontend-coding-standards.md) — DO/DON'T ละเอียด
- [design-system.md](../architecture/design-system.md) — Design tokens, typography, colors
- [icon-system.md](../architecture/icon-system.md) — Icon system (`<app-generic-icon>` + PrimeIcons)
- [system-analyst.md](./system-analyst.md) — SA Agent (input สำหรับ UX/UI design)
