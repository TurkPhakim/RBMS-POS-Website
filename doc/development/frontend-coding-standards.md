# Frontend Coding Standards — RBMS-POS

> อัพเดตล่าสุด: 2026-03-11
>
> **Related:** [frontend-guidelines.md](frontend-guidelines.md) | [module-development-workflow.md](module-development-workflow.md) | [design-system.md](../architecture/design-system.md)

มาตรฐานการเขียนโค้ด Frontend (Angular 19+) พร้อมตัวอย่าง DO และ DON'T สำหรับ RBMS-POS

---

## สารบัญ

1. [Naming Conventions](#1-naming-conventions)
2. [Component Patterns](#2-component-patterns)
3. [Template Patterns](#3-template-patterns)
4. [Service Patterns](#4-service-patterns)
5. [Reactive Patterns (RxJS)](#5-reactive-patterns-rxjs)
6. [Forms](#6-forms)
7. [Routing](#7-routing)
8. [Error Handling](#8-error-handling)
9. [Styling (Tailwind + Design Tokens)](#9-styling-tailwind--design-tokens)
10. [Performance](#10-performance)
11. [Code Organization](#11-code-organization)
12. [Summary Checklist](#12-summary-checklist)

---

## 1. Naming Conventions

### 1.1 File Naming

```typescript
// ✅ DO: ใช้ kebab-case สำหรับชื่อไฟล์
product-list.component.ts
product-list.component.html
product-form.component.ts
products.service.ts        // generated API service
product.model.ts
employee-status.pipe.ts
auth.guard.ts
auth.interceptor.ts

// ✅ DO: ใช้ suffix ที่ถูกต้อง
*.component.ts      // Component
*.service.ts        // Service (generated หรือ facade)
*.pipe.ts           // Pipe
*.directive.ts      // Directive
*.guard.ts          // Guard
*.interceptor.ts    // Interceptor
*.module.ts         // NgModule

// ❌ DON'T: ใช้ camelCase หรือ PascalCase
productList.component.ts      // ผิด
ProductList.component.ts      // ผิด
product_list.component.ts     // ผิด
```

### 1.2 Class & Interface Naming

```typescript
// ✅ DO: ใช้ PascalCase สำหรับ Class
export class ProductListComponent {}
export class ProductsService {} // generated
export class InventoryModule {}

// ✅ DO: ใช้ PascalCase (ไม่มี I prefix) สำหรับ Interface/Type
export interface ProductResponse {}
export interface CreateProductRequest {}

// ❌ DON'T: ใช้ prefix "I" (Angular convention ไม่ใช้ — แตกต่างจาก C# backend)
export interface IProductResponse {} // ผิด
export interface IMenuItem {} // ผิด
```

### 1.3 Variable & Function Naming

```typescript
// ✅ DO: ใช้ camelCase สำหรับ variables, functions, signals
products = signal<ProductResponse[]>([]);
isLoading = signal(false);
error = signal<string | null>(null);
selectedProductId = signal<number | null>(null);

function onSave(): void {}
function onDelete(id: number): void {}

// ✅ DO: ใช้ $ suffix สำหรับ Observable เท่านั้น
products$: Observable<ProductResponse[]>;
isLoading$: Observable<boolean>;

// ✅ DO: Signal ไม่ใช้ $ suffix
products = signal<ProductResponse[]>([]); // ✅ Signal — ไม่มี $
products$ = this.productsService.apiV1ProductsGet(); // ✅ Observable — มี $

// ❌ DON'T: ใช้ PascalCase สำหรับ variables
const Products = []; // ผิด
let IsLoading = false; // ผิด

// ❌ DON'T: ใช้ any type
const data: any = {}; // ผิด — ใช้ type จาก generated models แทน
```

### 1.4 Constants

```typescript
// ✅ DO: ใช้ UPPER_SNAKE_CASE สำหรับ constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE_MB = 5;

// ✅ DO: Group related constants ใน object
export const ROUTES = {
  LOGIN: "/auth/login",
  DASHBOARD: "/dashboard",
  INVENTORY: "/inventory",
  EMPLOYEES: "/employees",
} as const;

// ❌ DON'T: ใช้ camelCase สำหรับ constants
export const defaultPageSize = 20; // ผิด
```

---

## 2. Component Patterns

### 2.1 Component Structure (RBMS Standard)

```typescript
// ✅ DO: Component structure มาตรฐาน RBMS-POS
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  standalone: false, // ✅ RBMS ใช้ NgModule — standalone: false เสมอ
})
export class ProductListComponent implements OnInit {
  // 1. Signals (ใช้แทน Observable-based state)
  products = signal<ProductResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // 2. Computed signals (derived state — ไม่ต้องมี subscription)
  productCount = computed(() => this.products().length);
  hasProducts = computed(() => this.products().length > 0);

  // 3. Input/Output
  @Input() showActions = true;
  @Output() productSelected = new EventEmitter<ProductResponse>();

  constructor(
    private readonly productsService: ProductsService,
    private readonly destroyRef: DestroyRef, // ✅ สำหรับ takeUntilDestroyed
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // 4. Public methods (for template)
  onEditProduct(product: ProductResponse): void {
    this.productSelected.emit(product);
  }

  onDeleteProduct(id: number): void {
    // Confirm then call service
  }

  // 5. TrackBy function
  trackByProductId(_: number, product: ProductResponse): number {
    return product.productId!;
  }

  // 6. Private methods
  private loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productsService
      .apiV1ProductsGet()
      .pipe(takeUntilDestroyed(this.destroyRef)) // ✅ primary cleanup
      .subscribe({
        next: (res) => {
          this.products.set(res.result ?? []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? "ไม่สามารถโหลดข้อมูลได้");
          this.isLoading.set(false);
        },
      });
  }
}

// ❌ DON'T: Component ที่ไม่ดี
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  standalone: true, // ❌ RBMS ใช้ standalone: false
})
export class BadProductListComponent {
  products: ProductResponse[] = []; // ❌ ไม่ใช้ Signals
  loading = false;

  constructor(private http: HttpClient) {} // ❌ Inject HttpClient โดยตรง

  ngOnInit() {
    this.loading = true;
    this.http.get<any>("/api/products").subscribe(
      // ❌ manual HTTP + any type
      (data: any) => {
        this.products = data;
        this.loading = false;
      },
      // ❌ ไม่มี error handling + ไม่มี unsubscribe
    );
  }
}
```

### 2.2 Input/Output Best Practices

```typescript
// ✅ DO: Proper Input/Output usage
@Component({ ... })
export class ProductFormComponent implements OnChanges {
  // Required input — ใช้ ! assertion
  @Input() categories!: CategoryResponse[];

  // Optional input with default
  @Input() product: ProductResponse | null = null;
  @Input() mode: 'create' | 'edit' = 'create';

  // Outputs
  @Output() save = new EventEmitter<CreateProductRequest>();
  @Output() cancel = new EventEmitter<void>();

  // ✅ DO: ใช้ ngOnChanges สำหรับ input ที่ซับซ้อน
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.form.patchValue(this.product);
    }
  }
}

// ❌ DON'T: Mutate Input โดยตรง
export class BadComponent {
  @Input() items: ProductResponse[] = [];

  addItem(item: ProductResponse): void {
    this.items.push(item);  // ❌ Mutating input array
  }
}
```

---

## 3. Template Patterns

### 3.1 Modern Control Flow (Angular 17+)

```html
<!-- ✅ DO: ใช้ @if/@for/@switch (Angular 17+ — RBMS standard) -->
@if (isLoading()) {
<div class="flex justify-center p-8">
  <span class="text-surface-sub">กำลังโหลด...</span>
</div>
} @else if (error()) {
<div class="bg-danger-bg border border-surface-border rounded-lg p-4">
  <p class="text-danger">{{ error() }}</p>
</div>
} @else { @for (product of products(); track product.productId) {
<app-product-card [product]="product" />
} @empty {
<app-empty-state message="ไม่มีสินค้า" />
} } @switch (product.status) { @case ('Active') {
<span class="badge-success">ใช้งาน</span>
} @case ('Inactive') {
<span class="badge-surface">ปิดใช้งาน</span>
} @default {
<span class="badge-surface">{{ product.status }}</span>
} }

<!-- ❌ DON'T: ใช้ *ngIf/*ngFor (old syntax) เมื่อ new syntax ใช้ได้ -->
<div *ngIf="!isLoading">...</div>
<!-- Old syntax -->
<div *ngFor="let item of items">{{ item.name }}</div>
<!-- Old syntax -->
```

### 3.2 Signal-based Templates

```html
<!-- ✅ DO: ใช้ signal() ใน template โดยตรง — ไม่ต้องใช้ async pipe -->
<h1 class="text-page-title">สินค้า ({{ productCount() }})</h1>

<button class="btn-primary" [disabled]="isLoading()" (click)="onSave()">
  @if (isLoading()) { กำลังบันทึก... } @else { บันทึก }
</button>

<!-- ❌ DON'T: ใช้ async pipe กับ signal -->
<div>{{ products$ | async }}</div>
<!-- ผิด — signal ไม่ใช่ Observable -->
```

### 3.3 Event Handling

```html
<!-- ✅ DO: Proper event binding -->
<button (click)="onSave()">บันทึก</button>
<input (input)="onSearchChange($event)" />
<form (ngSubmit)="onSubmit()">...</form>

<!-- ✅ DO: ค้นหาด้วย Enter key เท่านั้น -->
<input [formControl]="searchControl" (keyup.enter)="onSearch()" placeholder="ค้นหา..." />

<!-- ❌ DON'T: Logic ซับซ้อนใน template -->
<button (click)="items.push(newItem); recalculate(); saveLocal()">เพิ่ม</button>
```

### 3.4 Template References

```html
<!-- ✅ DO: ใช้ template references อย่างเหมาะสม -->
<input #searchInput type="text" (keyup.enter)="onSearch(searchInput.value)" />

<!-- ✅ DO: ng-template สำหรับ reusable UI fragments -->
<ng-template #emptyState>
  <div class="flex flex-col items-center p-8 text-surface-sub">
    <app-generic-icon name="empty-box" svgClass="w-16 h-16" class="mb-2"></app-generic-icon>
    <p>ไม่มีข้อมูล</p>
  </div>
</ng-template>

@if (hasProducts()) {
<!-- แสดงรายการ -->
} @else {
<ng-container *ngTemplateOutlet="emptyState" />
}
```

---

## 4. Service Patterns

### 4.1 Using Generated API Services

> **กฎ:** ต้องใช้ Models และ Types จาก `@core/api/models/` เท่านั้น ห้ามสร้าง Interface หรือ Type ขึ้นมาเองใน Frontend — generated models คือ single source of truth ของ API contract หากต้องการ type พิเศษที่ backend ไม่มี ให้ต่อยอดด้วย TypeScript utility types (`Pick<>`, `Partial<>`, `Omit<>`) จาก generated models เท่านั้น

```typescript
// ✅ DO: ใช้ generated services จาก ng-openapi-gen เสมอ
import { ProductsService } from '@core/api/services/products.service';
import { ProductResponse } from '@core/api/models/product-response';
import { CreateProductRequest } from '@core/api/models/create-product-request';

@Component({ ... })
export class ProductListComponent {
  products = signal<ProductResponse[]>([]);

  constructor(
    private readonly productsService: ProductsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  loadProducts(): void {
    this.productsService.apiV1ProductsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.products.set(res.result ?? []),
      });
  }

  createProduct(request: CreateProductRequest): void {
    this.productsService.apiV1ProductsPost({ body: request })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadProducts(),
      });
  }
}

// ❌ DON'T: Direct HTTP calls เมื่อมี generated service อยู่แล้ว
@Injectable({ providedIn: 'root' })
export class BadProductService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>('/api/inventory');  // ❌
  }
}
```

### 4.2 Facade Services (สำหรับ business logic ที่ซับซ้อน)

```typescript
// ✅ DO: Facade service สำหรับ operations ที่ต้องประกอบหลาย API calls
@Injectable({ providedIn: "root" })
export class CartFacadeService {
  private readonly cartItems = signal<CartItem[]>([]);

  readonly items = this.cartItems.asReadonly();
  readonly total = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  readonly count = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0),
  );

  addItem(product: ProductResponse, quantity = 1): void {
    const current = this.cartItems();
    const existingIndex = current.findIndex(
      (i) => i.productId === product.productId,
    );

    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
      this.cartItems.set(updated);
    } else {
      this.cartItems.set([
        ...current,
        {
          productId: product.productId!,
          name: product.name!,
          price: product.price!,
          quantity,
        },
      ]);
    }
  }

  removeItem(productId: number): void {
    this.cartItems.update((items) =>
      items.filter((i) => i.productId !== productId),
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }
}
```

### 4.3 Singleton Services

```typescript
// ✅ DO: ใช้ providedIn: 'root' สำหรับ singleton services
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly currentUser = signal<UserInfo | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor(
    private readonly authApi: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
  ) {
    this.loadStoredUser();
  }

  login(username: string, password: string): Observable<void> {
    return this.authApi
      .apiV1AuthLoginPost({ body: { username, password } })
      .pipe(
        tap((res) => {
          if (res.result) {
            this.tokenService.setToken(res.result.token!);
            this.currentUser.set(res.result.user ?? null);
          }
        }),
        map(() => void 0),
      );
  }

  logout(): void {
    this.tokenService.clearToken();
    this.currentUser.set(null);
    this.router.navigate(["/auth/login"]);
  }

  private loadStoredUser(): void {
    const token = this.tokenService.getToken();
    if (token) {
      // decode or call /me endpoint
    }
  }
}
```

---

## 5. Reactive Patterns (RxJS)

### 5.1 Subscription Cleanup

```typescript
// ✅ DO: ใช้ takeUntilDestroyed เป็น primary pattern ของ RBMS
@Component({ ... })
export class ProductListComponent implements OnInit {
  constructor(private readonly destroyRef: DestroyRef) {}

  ngOnInit(): void {
    // ✅ primary — ไม่ต้อง implement OnDestroy
    this.productsService.apiV1ProductsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.products.set(res.result ?? []) });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),  // ✅
    ).subscribe(value => this.onSearch(value ?? ''));
  }
}

// ✅ DO: destroy$ pattern (acceptable alternative สำหรับ class ที่ implement OnDestroy อยู่แล้ว)
@Component({ ... })
export class LegacyComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.someService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(...);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ❌ DON'T: ลืม unsubscribe
export class BadComponent {
  ngOnInit(): void {
    this.productsService.apiV1ProductsGet().subscribe(res => {
      // ❌ Memory leak — ไม่มี takeUntilDestroyed หรือ takeUntil
    });
  }
}
```

### 5.2 Common RxJS Operators

```typescript
// ✅ DO: ใช้ operator ที่เหมาะกับ use case

// map — Transform data
this.productsService.apiV1ProductsGet().pipe(map((res) => res.result ?? []));

// switchMap — Cancel previous, use latest
// ✅ DO: trigger ค้นหาเฉพาะเมื่อกด Enter เท่านั้น
// Template: <input [formControl]="searchControl" (keyup.enter)="onSearch()" />
onSearch(): void {
  this.productsService.apiV1ProductsGet({ search: this.searchControl.value ?? '' })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({ next: (res) => this.products.set(res.result ?? []) });
}

// ❌ DON'T: ใช้ debounceTime + distinctUntilChanged สำหรับ search input
// ทำให้ API ถูกเรียกทุกครั้งที่ user พิมพ์ แม้จะ delay แล้วก็ตาม — ใช้ Enter trigger แทน
this.searchControl.valueChanges.pipe(
  debounceTime(300),       // ❌ ห้ามใช้สำหรับ search
  distinctUntilChanged(),  // ❌
  switchMap((term) => this.productsService.apiV1ProductsGet({ search: term })),
);

// exhaustMap — Ignore new until current completes (form submit — prevent double submit)
this.submitClick$.pipe(
  exhaustMap((formData) =>
    this.productsService.apiV1ProductsPost({ body: formData }),
  ),
);

// concatMap — Queue requests, maintain order
this.items$.pipe(
  concatMap((item) => this.processItem(item)), // ✅ Process in order
);

// forkJoin — Parallel independent requests
forkJoin({
  categories: this.categoriesService.apiV1CategoriesGet(),
  suppliers: this.suppliersService.apiV1SuppliersGet(),
}).subscribe(({ categories, suppliers }) => {
  // Both complete before entering here
});

// combineLatest — Combine multiple streams (re-emits on any change)
combineLatest([this.products$, this.selectedCategory$]).pipe(
  map(([products, categoryId]) =>
    categoryId ? products.filter((p) => p.categoryId === categoryId) : products,
  ),
);

// catchError — Handle errors in stream
this.productsService.apiV1ProductsGet().pipe(
  catchError((err) => {
    this.error.set(err.message ?? "เกิดข้อผิดพลาด");
    return of({ result: [] });
  }),
);

// finalize — Always execute (hide loading)
this.productsService.apiV1ProductsGet().pipe(
  finalize(() => this.isLoading.set(false)), // ✅ ทำงานทั้ง success และ error
);
```

> **กฎ:** การแสดงผลลัพธ์ให้ผู้ใช้ทราบ ทั้ง success และ error ต้องใช้ Shared Modal เท่านั้น
> - Success → ใช้ `app-success-modal` จาก SharedModule
> - Error → ใช้ `app-error-modal` หรือแสดง error signal ใน template
> - ห้ามใช้ `alert()`, browser notification, หรือ toast library ที่ไม่ได้อยู่ใน SharedModule

### 5.3 Combining Observables

```typescript
// ✅ DO: forkJoin สำหรับ parallel initialization
private loadInitialData(): void {
  forkJoin({
    categories: this.categoriesService.apiV1CategoriesGet(),
    units: this.unitsService.apiV1UnitsGet(),
  }).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ categories, units }) => {
        this.categories.set(categories.result ?? []);
        this.units.set(units.result ?? []);
      },
    });
}

// ✅ DO: switchMap สำหรับ route params → load detail
private loadProductFromRoute(): void {
  this.route.params.pipe(
    map(params => +params['id']),
    switchMap(id => this.productsService.apiV1ProductsIdGet({ id })),
    takeUntilDestroyed(this.destroyRef),
  ).subscribe({
    next: (res) => {
      if (res.result) this.form.patchValue(res.result);
    },
  });
}
```

---

## 6. Forms

### 6.1 Reactive Forms

```typescript
// ✅ DO: Properly structured reactive form
@Component({ ... })
export class ProductFormComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly destroyRef: DestroyRef,
    private readonly productsService: ProductsService,
    private readonly router: Router,
  ) {}

  isSaving = signal(false);
  serverError = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      barcode: ['', Validators.maxLength(50)],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: [null, Validators.required],
      isActive: [true],
    });
  }

  // ✅ DO: Form helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors) return '';
    if (field.errors['required']) return 'กรุณากรอกข้อมูล';
    if (field.errors['maxlength']) return `ความยาวสูงสุด ${field.errors['maxlength'].requiredLength} ตัวอักษร`;
    if (field.errors['min']) return `ค่าต่ำสุดคือ ${field.errors['min'].min}`;
    if (field.errors['serverError']) return field.errors['serverError'];
    return 'ข้อมูลไม่ถูกต้อง';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();  // ✅ แสดง error ทุก field
      return;
    }

    this.isSaving.set(true);
    this.serverError.set(null);

    this.productsService.apiV1ProductsPost({ body: this.form.value })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/inventory/products']);
        },
        error: (err) => {
          this.isSaving.set(false);
          if (err.error?.errors) {
            this.setServerErrors(err.error.errors);
          } else {
            this.serverError.set(err.error?.message ?? 'บันทึกไม่สำเร็จ');
          }
        },
        complete: () => this.isSaving.set(false),
      });
  }

  // ✅ DO: Handle server-side validation errors (FluentValidation response)
  private setServerErrors(errors: Record<string, string[]>): void {
    for (const [key, messages] of Object.entries(errors)) {
      const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
      const control = this.form.get(fieldName);
      if (control) {
        control.setErrors({ serverError: messages[0] });
      }
    }
  }
}
```

### 6.2 Form Template

```html
<!-- ✅ DO: Proper form template ใช้ Tailwind + design tokens -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  @if (serverError()) {
  <div class="bg-danger-bg border border-surface-border rounded-lg p-3 mb-4">
    <p class="text-danger text-sm">{{ serverError() }}</p>
  </div>
  }

  <!-- Text input with validation -->
  <div class="flex flex-col gap-1 mb-4">
    <label for="name" class="text-sm font-medium text-surface-dark">
      ชื่อสินค้า <span class="text-danger">*</span>
    </label>
    <input
      id="name"
      formControlName="name"
      type="text"
      class="input-field"
      [class.input-error]="isFieldInvalid('name')"
      placeholder="ระบุชื่อสินค้า"
    />
    @if (isFieldInvalid('name')) {
    <span class="text-danger text-xs">{{ getFieldError('name') }}</span>
    }
  </div>

  <!-- Number input -->
  <div class="flex flex-col gap-1 mb-4">
    <label for="price" class="text-sm font-medium text-surface-dark">
      ราคา <span class="text-danger">*</span>
    </label>
    <input
      id="price"
      formControlName="price"
      type="number"
      min="0"
      step="0.01"
      class="input-field"
      [class.input-error]="isFieldInvalid('price')"
    />
    @if (isFieldInvalid('price')) {
    <span class="text-danger text-xs">{{ getFieldError('price') }}</span>
    }
  </div>

  <!-- Select -->
  <div class="flex flex-col gap-1 mb-4">
    <label for="categoryId" class="text-sm font-medium text-surface-dark">
      หมวดหมู่ <span class="text-danger">*</span>
    </label>
    <select
      id="categoryId"
      formControlName="categoryId"
      class="input-field"
      [class.input-error]="isFieldInvalid('categoryId')"
    >
      <option value="">-- เลือกหมวดหมู่ --</option>
      @for (cat of categories(); track cat.categoryId) {
      <option [value]="cat.categoryId">{{ cat.name }}</option>
      }
    </select>
    @if (isFieldInvalid('categoryId')) {
    <span class="text-danger text-xs"
      >{{ getFieldError('categoryId') }}</span
    >
    }
  </div>

  <!-- Checkbox -->
  <div class="flex items-center gap-2 mb-6">
    <input
      id="isActive"
      formControlName="isActive"
      type="checkbox"
      class="w-4 h-4"
    />
    <label for="isActive" class="text-sm text-surface-dark">เปิดใช้งาน</label>
  </div>

  <!-- Submit buttons -->
  <div class="flex justify-end gap-3">
    <button type="button" class="btn-outline" routerLink="..">ยกเลิก</button>
    <button type="submit" class="btn-primary" [disabled]="isSaving()">
      @if (isSaving()) { กำลังบันทึก... } @else { บันทึก }
    </button>
  </div>
</form>
```

### 6.3 Dynamic Forms (FormArray)

```typescript
// ✅ DO: FormArray สำหรับ dynamic items
export class SaleFormComponent {
  form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      customerId: [null as number | null],
      items: this.fb.array([], Validators.minLength(1)),
    });
  }

  get items(): FormArray {
    return this.form.get("items") as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      note: [""],
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }
}
```

---

## 7. Routing

### 7.1 Route Configuration

```typescript
// ✅ DO: Well-organized routes with lazy loading
export const routes: Routes = [
  // Auth routes (unauthenticated only)
  {
    path: "auth",
    canActivate: [guestGuard],
    loadChildren: () =>
      import("./features/auth/auth.module").then((m) => m.AuthModule),
  },

  // Protected routes
  {
    path: "",
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("./features/dashboard/dashboard.module").then(
            (m) => m.DashboardModule,
          ),
      },
      {
        path: "inventory",
        canActivate: [roleGuard],
        data: { roles: ["Admin", "Manager"] }, // ✅ Role-based access
        loadChildren: () =>
          import("./features/inventory/inventory.module").then(
            (m) => m.InventoryModule,
          ),
      },
      {
        path: "employees",
        canActivate: [roleGuard],
        data: { roles: ["Admin"] },
        loadChildren: () =>
          import("./features/employees/employees.module").then(
            (m) => m.EmployeesModule,
          ),
      },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },

  // Fallback
  { path: "**", redirectTo: "/auth/login" },
];
```

### 7.2 Route Guards

```typescript
// ✅ DO: Functional guard (Angular 14+)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    // ✅ Signal — ไม่ต้องใช้ Observable
    router.navigate(["/auth/login"]);
    return false;
  }
  return true;
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data["roles"] as string[];
  const user = authService.user(); // ✅ Signal

  if (!user || !requiredRoles.includes(user.role)) {
    router.navigate(["/access-denied"]);
    return false;
  }
  return true;
};

// ✅ DO: CanDeactivate สำหรับ unsaved changes
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component,
) => {
  if (component.hasUnsavedChanges()) {
    return confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?");
  }
  return true;
};

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}
```

---

## 8. Error Handling

### 8.1 HTTP Error Interceptor

```typescript
// ✅ DO: Centralized error handling ใน interceptor
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "เกิดข้อผิดพลาดที่ไม่คาดคิด";

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || "ข้อมูลไม่ถูกต้อง";
          break;
        case 401:
          errorMessage = "กรุณาเข้าสู่ระบบใหม่";
          inject(Router).navigate(["/auth/login"]);
          break;
        case 403:
          errorMessage = "คุณไม่มีสิทธิ์ดำเนินการนี้";
          break;
        case 404:
          errorMessage = "ไม่พบข้อมูลที่ร้องขอ";
          break;
        case 422:
          errorMessage = error.error?.message || "ไม่สามารถดำเนินการได้";
          break;
        case 500:
          errorMessage = "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์";
          break;
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        errors: error.error?.errors,
      }));
    }),
  );
};
```

> **กฎ:** ห้าม validate และจัดการ error เกินจำเป็น
> - ทำ validation เฉพาะที่มี business requirement จริงๆ — ห้าม validate มั่วจนโค้ดรก
> - HTTP errors (400/401/403/404/422/500) จัดการที่ global interceptor ข้างบน ไม่ต้องซ้ำใน component
> - Component ทำหน้าที่รับ error message จาก interceptor แล้วแสดงผ่าน Shared Modal เท่านั้น

### 8.2 Component Error Handling

```typescript
// ✅ DO: Signal-based error state
@Component({ ... })
export class ProductListComponent {
  products = signal<ProductResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productsService.apiV1ProductsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.products.set(res.result ?? []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'ไม่สามารถโหลดข้อมูลได้');
          this.isLoading.set(false);
        },
      });
  }

  retry(): void {
    this.loadProducts();
  }
}
```

```html
<!-- Template: แสดง error state + retry -->
@if (isLoading()) {
<div class="flex justify-center p-8">กำลังโหลด...</div>
} @else if (error()) {
<div
  class="bg-danger-bg border border-surface-border rounded-lg p-4 flex items-center justify-between"
>
  <p class="text-danger">{{ error() }}</p>
  <button class="btn-outline btn-sm" (click)="retry()">ลองใหม่</button>
</div>
} @else {
<!-- Display products -->
}
```

---

## 9. Styling (Tailwind + Design Tokens)

### 9.1 RBMS Design Tokens (ใช้ทุกครั้ง — ห้ามใช้ raw colors)

```html
<!-- ✅ DO: ใช้ design tokens เสมอ -->
<div class="bg-primary text-white">Primary button</div>
<div class="bg-surface-card text-surface-dark">Card background</div>
<div class="bg-success-bg text-success">Success state</div>
<div class="bg-danger-bg border border-surface-border text-danger">
  Error state
</div>

<!-- ✅ DO: Typography tokens -->
<h1 class="text-page-title">หน้าหลัก</h1>
<h2 class="text-section-title">จัดการสินค้า</h2>
<h3 class="text-card-title">ข้อมูลสินค้า</h3>

<!-- ❌ DON'T: ใช้ raw colors -->
<div class="bg-orange-500">...</div>
<!-- ผิด — ใช้ bg-primary แทน -->
<div class="text-slate-700">...</div>
<!-- ผิด — ใช้ text-surface-dark แทน -->
<div class="bg-red-100">...</div>
<!-- ผิด — ใช้ bg-danger-bg แทน -->
<div class="bg-green-100">...</div>
<!-- ผิด — ใช้ bg-success-bg แทน -->
```

### 9.2 Layout Patterns

```html
<!-- ✅ DO: Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  @for (product of products(); track product.productId) {
  <app-product-card [product]="product" />
  }
</div>

<!-- ✅ DO: Card pattern -->
<div class="bg-surface-card rounded-xl shadow-sm border border-surface-border p-4">
  <h3 class="text-card-title mb-2">{{ product.name }}</h3>
  <p class="text-surface-sub text-sm">{{ product.description }}</p>
</div>

<!-- ✅ DO: Status badge pattern -->
<span
  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  [ngClass]="{
    'bg-success-bg text-success': product.isActive,
    'bg-surface text-surface-sub': !product.isActive
  }"
>
  {{ product.isActive ? 'ใช้งาน' : 'ปิดใช้งาน' }}
</span>

<!-- ✅ DO: Button patterns -->
<button
  class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
>
  บันทึก
</button>
<button
  class="border border-surface-border text-surface-dark hover:bg-surface px-4 py-2 rounded-lg font-medium transition-colors"
>
  ยกเลิก
</button>
<button
  class="bg-danger hover:bg-danger-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
>
  ลบ
</button>
```

### 9.3 ห้ามเขียน CSS ไฟล์แยก

```typescript
// ❌ DON'T: เขียน .css หรือ .scss สำหรับ style ที่ Tailwind ทำได้
// product-list.component.scss
.card {
  background: white;      // ❌ ใช้ bg-white แทน
  padding: 16px;          // ❌ ใช้ p-4 แทน
  border-radius: 8px;     // ❌ ใช้ rounded-lg แทน
}

// ✅ DO: เขียน class ใน HTML template โดยตรง
// <div class="bg-white p-4 rounded-lg">
```

### 9.4 ไม่ใช้ inline SVG

```html
<!-- ❌ DON'T: Inline SVG path ใน template -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ...>
  <path d="M12 2L2 7l10 5 10-5-10-5z" ... />
  <!-- ❌ -->
</svg>

<!-- ❌ DON'T: ใช้ <img> สำหรับ icon -->
<img src="images/icons/product.svg" alt="" class="w-5 h-5" />

<!-- ✅ DO: ใช้ app-generic-icon สำหรับ custom SVG icon -->
<app-generic-icon name="dashboard" svgClass="w-5 h-5"></app-generic-icon>

<!-- ✅ DO: ใช้ PrimeIcons สำหรับ icon ทั่วไป -->
<i class="pi pi-plus text-white"></i>
```

---

## 10. Performance

### 10.1 Change Detection + Signals

```typescript
// ✅ DO: Signals จัดการ state และ derived data อย่างมีประสิทธิภาพ
@Component({
  standalone: false,
})
export class ProductCardComponent {
  @Input() product!: ProductResponse;

  // computed signal — recalculates only when dependency changes
  discountedPrice = computed(
    () => this.product.price! * (1 - (this.product.discountPercent ?? 0) / 100),
  );
}
```

### 10.2 TrackBy in @for

```html
<!-- ✅ DO: ใช้ track ใน @for เสมอ -->
@for (product of products(); track product.productId) {
<app-product-card [product]="product" />
}

<!-- ❌ DON'T: ขาด track — Angular จะ re-render ทุก item เมื่อ array เปลี่ยน -->
@for (product of products()) {
<!-- ❌ ขาด track -->
<app-product-card [product]="product" />
}
```

### 10.3 Lazy Loading

```typescript
// ✅ DO: Lazy load ทุก feature module
const routes: Routes = [
  {
    path: "inventory",
    loadChildren: () =>
      import("./features/inventory/inventory.module").then(
        (m) => m.InventoryModule,
      ),
    // ✅ โหลดเฉพาะเมื่อ user navigate มา
  },
];
```

### 10.4 Memory Management

```typescript
// ✅ DO: Cleanup setInterval, setTimeout
@Component({ ... })
export class DashboardComponent implements OnDestroy {
  private refreshTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.refreshTimer = setInterval(() => this.loadStats(), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshTimer);
    // Subscriptions cleaned up automatically via takeUntilDestroyed
  }
}
```

---

## 11. Code Organization

### 11.1 Feature Module Structure (RBMS pattern)

```
features/inventory/
├── inventory.module.ts
├── inventory-routing.module.ts
├── pages/
│   ├── product-list/
│   │   ├── product-list.component.ts
│   │   └── product-list.component.html
│   └── product-form/
│       ├── product-form.component.ts
│       └── product-form.component.html
└── components/
    └── product-card/
        ├── product-card.component.ts
        └── product-card.component.html
```

> **หมายเหตุ:** ไม่ต้องสร้าง `services/` ใน feature — ใช้ generated services จาก `core/api/services/` โดยตรง

### 11.2 Import Order

```typescript
// ✅ DO: Organize imports in order
// 1. Angular core
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  DestroyRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

// 2. Angular libraries
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

// 3. RxJS
import { Observable, forkJoin, combineLatest } from "rxjs";
import { map, switchMap, catchError, finalize } from "rxjs/operators";

// 4. Generated API (core/api)
import { ProductsService } from "@core/api/services/products.service";
import { ProductResponse } from "@core/api/models/product-response";
import { CreateProductRequest } from "@core/api/models/create-product-request";

// 5. App services / shared
import { AuthService } from "@core/services/auth.service";
```

### 11.3 Module Declaration Order

```typescript
// ✅ DO: Declaration order ใน NgModule
@NgModule({
  declarations: [
    // Pages first
    ProductListComponent,
    ProductFormComponent,
    // Then sub-components
    ProductCardComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class InventoryModule {}
```

---

## 12. PrimeNG Integration

### 12.1 กฎการใช้ PrimeNG

```typescript
// ✅ DO: ใช้ PrimeNG components สำหรับ UI ที่ซับซ้อน
// Table, Dropdown, Dialog, Toast, InputText, InputNumber, Button, Tag, Badge ฯลฯ
// PrimeNG modules ทั้งหมด import/export ผ่าน SharedModule แล้ว

// ❌ DON'T: เขียน custom component เองถ้า PrimeNG มีให้
// ห้ามเขียน table component เอง (ใช้ p-table)
// ห้ามเขียน dropdown เอง (ใช้ p-dropdown)
// ห้ามเขียน spinner เอง (ใช้ p-progressSpinner)

// ❌ DON'T: เขียน Dialog inline ใน page template
// ห้ามใช้ <p-dialog [(visible)]="..."> ใน page component

// ✅ DO: สร้าง Dialog เป็น component แยก + เปิดผ่าน DialogService (DynamicDialog)
// Dialog component วางใน features/{module}/dialogs/{name}/
// รับ data ผ่าน DynamicDialogConfig, return ผลลัพธ์ผ่าน DynamicDialogRef.close()
// เพิ่ม providers: [DialogService] ใน component ที่เปิด Dialog
```

### 12.2 PrimeNG Template Patterns

```html
<!-- ✅ DO: ใช้ p-table สำหรับ data table -->
<p-table [value]="products()" [paginator]="true" [rows]="20"
         [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 20, 50]"
         currentPageReportTemplate="แสดง {first} ถึง {last} จาก {totalRecords} รายการ">
  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="name">ชื่อ <p-sortIcon field="name" /></th>
      <th>ราคา</th>
      <th>สถานะ</th>
      <th>จัดการ</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-product>
    <tr>
      <td>{{ product.name }}</td>
      <td>{{ product.price | number:'1.2-2' }}</td>
      <td>
        <p-tag [value]="product.isActive ? 'ใช้งาน' : 'ปิด'"
               [severity]="product.isActive ? 'success' : 'secondary'" />
      </td>
      <td>
        <p-button icon="pi pi-pencil" [rounded]="true" [text]="true"
                  (onClick)="onEdit(product)" />
        <p-button icon="pi pi-trash" [rounded]="true" [text]="true"
                  severity="danger" (onClick)="onDelete(product)" />
      </td>
    </tr>
  </ng-template>
  <ng-template pTemplate="emptymessage">
    <tr><td colspan="4" class="text-center py-8 text-surface-sub">ไม่มีข้อมูล</td></tr>
  </ng-template>
</p-table>

<!-- ✅ DO: ใช้ p-dropdown สำหรับ select -->
<p-dropdown [options]="categories()" optionLabel="name" optionValue="categoryId"
            formControlName="categoryId" placeholder="เลือกหมวดหมู่"
            [filter]="true" filterPlaceholder="ค้นหาหมวดหมู่..." />

<!-- ✅ DO: ใช้ p-button สำหรับปุ่ม -->
<p-button label="บันทึก" (onClick)="onSave()" [loading]="isSaving()" />
<p-button label="ยกเลิก" severity="secondary" [outlined]="true" (onClick)="onCancel()" />
<p-button label="ลบ" severity="danger" (onClick)="onDelete()" />

<!-- ❌ DON'T: เขียน table/dropdown/button เอง ถ้า PrimeNG มีให้ -->
<table class="w-full"><thead>...</thead></table>
<select formControlName="categoryId"><option>...</option></select>
<button class="bg-primary ...">บันทึก</button>
```

### 12.3 PrimeNG + Tailwind อยู่ร่วมกัน

```html
<!-- ✅ DO: ใช้ Tailwind สำหรับ layout + spacing, PrimeNG สำหรับ components -->
<div class="p-6 space-y-5">
  <div class="flex items-center justify-between">
    <h1 class="text-page-title text-surface-dark">รายการสินค้า</h1>
    <p-button label="เพิ่มสินค้า" icon="pi pi-plus" (onClick)="onCreate()" />
  </div>

  <div class="bg-surface-card rounded-xl shadow-sm border border-surface-border p-5">
    <p-table [value]="products()" ...>...</p-table>
  </div>
</div>

<!-- ❌ DON'T: ใช้ Tailwind สร้าง UI component ที่ PrimeNG มีอยู่แล้ว -->
```

---

## 13. Summary Checklist

### ก่อนสร้าง Component ใหม่

- [ ] `standalone: false` — declare ใน NgModule
- [ ] ใช้ constructor injection สำหรับ dependencies
- [ ] ใช้ `signal<T>()` สำหรับ component state
- [ ] `DestroyRef` inject ผ่าน constructor ถ้ามี subscription
- [ ] `@if/@for` แทน `*ngIf/*ngFor`
- [ ] `track` ใน `@for`
- [ ] ใช้ PrimeNG components แทนการเขียนเอง (Table, Dropdown, Button ฯลฯ)
- [ ] ใช้ design tokens — ห้ามใช้ raw colors
- [ ] Component นี้มีการใช้งานจริง — ไม่ใช่ Dead Code

### Code Review Checklist

- [ ] Subscriptions ทุกตัวมี `takeUntilDestroyed` หรือ `takeUntil(destroy$)`
- [ ] ไม่มี direct HttpClient — ใช้ generated services เท่านั้น
- [ ] ไม่มี `any` type — ใช้ generated models จาก `@core/api/models/` เท่านั้น
- [ ] ไม่มี custom Interface/Type ที่ generated models ครอบคลุมอยู่แล้ว
- [ ] Success/Error แสดงผ่าน Shared Modal — ไม่ใช้ `alert()` หรือ toast อื่น
- [ ] Search input trigger ด้วย Enter key — ไม่ใช้ debounce
- [ ] Loading state จัดการครบถ้วน (set false ทั้ง next และ error)
- [ ] Form: `markAllAsTouched()` ก่อน validate + server errors map กลับ control
- [ ] Template: ใช้ RBMS design tokens เท่านั้น
- [ ] ไม่มี inline SVG path — ใช้ `<app-generic-icon>` หรือ `pi pi-*` แทน
- [ ] ใช้ PrimeNG components (p-table, p-dropdown, p-button ฯลฯ) — ไม่เขียนเอง
- [ ] ไม่มีไฟล์ `.css/.scss` ที่สร้างใหม่โดยไม่จำเป็น
- [ ] Lazy loading ครบทุก feature module
