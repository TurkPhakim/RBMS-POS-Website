# Frontend Guidelines — RBMS-POS

> อัพเดตล่าสุด: 2026-03-16
>
> **Related agents:** [frontend-expert.md](../agents/frontend-expert.md)
> **Related docs:** [design-system.md](../architecture/design-system.md) | [icon-system.md](../architecture/icon-system.md) | [frontend-coding-standards.md](frontend-coding-standards.md)

---

## Architecture Overview

```
src/app/
├── core/                    # Singleton services, กลาง app
│   ├── api/                 # Generated clients (ng-openapi-gen) — ห้ามแก้ด้วยมือ
│   │   ├── services/        # 7 API services: auth, human-resource, menus, service-charges, positions, shop-settings, file
│   │   └── models/          # Generated TypeScript interfaces
│   ├── providers/           # Manual providers (ไม่ถูก gen-api overwrite)
│   │   └── api-config.provider.ts  # rootUrl จาก environment
│   ├── guards/              # auth.guard, guest.guard, permission.guard
│   ├── interceptors/        # auth.interceptor, loading.interceptor
│   ├── models/              # auth.models.ts
│   └── services/            # auth, breadcrumb, modal, loading, session-timeout, shop-branding, header, sidebar
│
├── store/layout/            # NgRx Store: sidebar, notification, header/breadcrumb buttons
│
├── shared/                  # ใช้ร่วมกันทุก module
│   ├── components/          # header, side-bar, top-breadcrumb, generic-icon, global-loading, notification-panel
│   ├── cards/               # card-template, section-card, empty-view, image-upload-card, field-error, audit-footer
│   ├── dialogs/             # address-dialog, education-dialog, work-history-dialog, session-timeout, verify-password
│   ├── modals/              # info-modal, cancel-modal, success-modal (ModalService)
│   ├── dropdowns/           # dropdown-base + 9 specific (active, gender, title, nationality, religion, address-type, position, menu-category, service-charge)
│   ├── directives/          # datepicker-icon.directive
│   ├── pipes/               # date-format, mask-phone, national-id-mask
│   ├── pages/               # welcome, access-denied
│   ├── utils/               # markFormDirty, linkDateRange
│   ├── component-interfaces.ts
│   └── shared.module.ts
│
├── features/                # Feature modules (lazy-loaded)
│   └── {module}/
│       ├── pages/           # Smart components (list, manage)
│       ├── dialogs/         # Feature-specific dialogs
│       ├── {module}.module.ts
│       └── {module}-routing.module.ts
│
└── layouts/
    ├── main-layout/         # Header + Sidebar + Router outlet
    └── auth-layout/         # Login/Reset password layout
```

---

## Component Patterns

### Smart Component (Container) — pages/

Handles: state, API calls, lifecycle, routing

```typescript
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  standalone: false, // ✅ RBMS ใช้ NgModule — standalone: false เสมอ
})
export class ProductListComponent implements OnInit {
  // Signals for state
  products = signal<ProductResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly productsService: ProductsService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.productsService
      .apiV1ProductsGet()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (res) => this.products.set(res.result ?? []),
        error: () => this.error.set("ไม่สามารถโหลดข้อมูลสินค้าได้"),
      });
  }
}
```

> **กฎ:** ทุก Component ต้องมีการใช้งานจริง ห้ามทิ้ง Dead Code ไว้ใน Project ก่อนสร้าง Component ใหม่ให้พิจารณาก่อนว่าจะถูก render ที่ไหนและอย่างไร

### Presentational Component (Dumb) — components/

Handles: display only, @Input/@Output

```typescript
@Component({
  selector: "app-product-card",
  templateUrl: "./product-card.component.html",
  standalone: false,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  @Output() editClicked = new EventEmitter<ProductResponse>();
  @Output() deleteClicked = new EventEmitter<ProductResponse>();
}
```

---

## Subscription Cleanup

```typescript
// ✅ Pattern แนะนำ — takeUntilDestroyed (Angular 16+)
constructor(private readonly destroyRef: DestroyRef) {}

this.apiService.getData()
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(...);

// ✅ Pattern รอง — destroy$ Subject
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// ✅ Pattern simple — async pipe
products$ = this.productsService.apiV1ProductsGet();
// template: @for (p of products$ | async; track p.productId) { ... }

// ❌ ผิด — Memory leak!
this.service.getData().subscribe(data => this.data = data);
```

---

## API Integration Rules

> **กฎเหล็ก:** ต้องรัน `npm run gen-api` **ก่อน** เขียน Frontend code ใดๆ — เพื่อให้ได้ generated models + services มาใช้ตั้งแต่ต้น

```typescript
// ✅ ถูกต้อง — ใช้ generated service + generated models เสมอ
import { MenusService } from '@app/core/api/services';
import { MenuResponseModel } from '@app/core/api/models';

menus = signal<MenuResponseModel[]>([]);

this.menusService.apiMenuPost({ body: request }).subscribe(...)
this.menusService.apiMenuGet().subscribe(...)
this.menusService.apiMenuIdDelete({ id: 5 }).subscribe(...)

// ❌ ผิด — ห้ามเขียน manual HTTP call
this.http.post('/api/inventory', data).subscribe(...)
this.http.get<Product[]>('/api/products').subscribe(...)

// ❌ ผิด — ห้ามใช้ Record/any/bracket notation เมื่อ generated model มีให้
addresses = signal<Record<string, unknown>[]>([]);    // ❌ ใช้ generated model แทน
const r = response.result as Record<string, unknown>; // ❌ ใช้ dot notation ตรง
addr["houseNumber"]                                    // ❌ ใช้ addr.houseNumber

// Regenerate หลัง backend API เปลี่ยน
// npm run gen-api
```

### Multipart/Form-Data + Nested Objects

เมื่อ endpoint ใช้ `[FromForm]` (multipart/form-data เพราะมี file upload) และ request model มี `List<T>` (nested collections):

- **`fix-api-exports.js` จะ patch `request-builder.ts` อัตโนมัติ** — แปลง array of objects เป็น indexed keys (`Addresses[0].addressType`) แทน JSON Blob ที่ ASP.NET Core อ่านไม่ได้
- **Frontend ต้อง map signal data เข้า body** — เช่น `Addresses: this.addresses().map(a => ({ addressType: a.addressType!, ... }))`
- **Backend request model ต้องมี `List<T>?` properties** — เช่น `public List<CreateEmployeeAddressRequestModel>? Addresses { get; set; }`
- ดูรายละเอียดใน [frontend-coding-standards.md](frontend-coding-standards.md) Section 4.2.1

---

## Styling Rules

```html
<!-- ✅ ถูกต้อง — ใช้ design token จาก tailwind.config.js -->
<div class="bg-surface border border-surface-border rounded-xl p-6">
  <h1 class="text-page-title text-surface-dark">รายการสินค้า</h1>

  <button
    class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg
                 transition-colors disabled:opacity-50"
  >
    เพิ่มสินค้า
  </button>

  <span class="text-danger text-sm">ข้อผิดพลาด</span>
  <span class="text-success text-sm">บันทึกสำเร็จ</span>
</div>

<!-- ❌ ผิด — raw Tailwind colors -->
<div class="bg-orange-500 text-slate-700">
  <!-- ❌ ผิด — inline SVG path -->
  <svg><path d="M5 10 L15 20..." /></svg>

  <!-- ✅ ถูกต้อง — ใช้ app-generic-icon หรือ PrimeIcons -->
  <app-generic-icon name="dashboard" svgClass="w-5 h-5"></app-generic-icon>
  <i class="pi pi-plus text-white"></i>

  <!-- ❌ ผิด — ห้ามสร้าง .css file ยกเว้นจำเป็นจริงๆ -->
</div>
```

**Design Tokens หลัก:**

| Token | สี | ใช้ |
|-------|-----|-----|
| `primary`, `primary-dark`, `primary-subtle` | orange | Buttons, accents, links |
| `surface`, `surface-card`, `surface-dark`, `surface-sub` | slate | Backgrounds, borders, text |
| `success`, `success-bg`, `success-text` | teal | Success states, badges |
| `danger`, `danger-bg`, `danger-dark` | rose | Errors, delete actions |

**Typography:**

- `text-page-title` — หัวหน้าหลัก
- `text-section-title` — หัวหน้าส่วน
- `text-card-title` — หัวหน้าการ์ด

---

## Template Syntax (Modern Angular)

```html
<!-- ✅ Modern control flow -->
@if (isLoading()) {
<div class="flex justify-center py-12">กำลังโหลด...</div>
} @else if (error()) {
<div class="text-danger p-4">{{ error() }}</div>
} @else { @for (product of products(); track product.productId) {
<app-product-card [product]="product" />
} @empty {
<p class="text-surface-sub text-center py-8">ไม่มีข้อมูลสินค้า</p>
} }

<!-- Signal binding -->
<span>{{ isLoading() }}</span>
<div [class.hidden]="!showPanel()">...</div>
```

---

## Module Structure (Non-standalone)

```typescript
// {module}.module.ts
@NgModule({
  declarations: [
    ProductListComponent,
    ProductManageComponent,
    ProductCardComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule, // shared modals, pipes, generic-icon, etc.
    ProductRoutingModule,
  ],
})
export class ProductModule {}

// {module}-routing.module.ts
const routes: Routes = [
  { path: "", component: ProductListComponent },
  { path: "create", component: ProductManageComponent },
  { path: ":id/edit", component: ProductManageComponent },
];
```

---

## Shared Components

### Confirm Modal

```html
<app-confirm-modal
  [isOpen]="showDeleteConfirm()"
  title="ยืนยันการลบ"
  message="คุณต้องการลบรายการนี้ใช่หรือไม่?"
  [itemName]="selectedItem()?.name"
  type="danger"
  confirmText="ลบ"
  cancelText="ยกเลิก"
  (confirmed)="onConfirmDelete()"
  (cancelled)="showDeleteConfirm.set(false)"
/>
```

### Success Modal

```html
<app-success-modal
  [isOpen]="showSuccess()"
  title="บันทึกสำเร็จ"
  message="บันทึกข้อมูลสินค้าเรียบร้อยแล้ว"
  [autoClose]="true"
  (closed)="showSuccess.set(false)"
/>
```

---

## Reactive Forms Pattern

```typescript
form = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(200)]],
  price: [null as number | null, [Validators.required, Validators.min(0)]],
  categoryId: [null as number | null, Validators.required],
  description: [''],
});

get nameControl() { return this.form.get('name')!; }

onSubmit(): void {
  if (this.form.invalid) {
    markFormDirty(this.form);  // จาก @app/shared/utils
    return;
  }

  const request = this.form.value as CreateProductRequest;
  this.isLoading.set(true);

  this.productsService.apiV1ProductsPost({ body: request })
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    )
    .subscribe({
      next: () => {
        this.showSuccess.set(true);
        this.router.navigate(['../']);
      },
      error: (err) => this.error.set(err.error?.message ?? 'เกิดข้อผิดพลาด')
    });
}
```

---

## PrimeNG Integration

ทุก UI component ที่ซับซ้อน (Table, Dropdown, Dialog, Toast ฯลฯ) ต้องใช้ **PrimeNG** เป็นมาตรฐาน — ห้ามเขียน component เองถ้า PrimeNG มีให้แล้ว

### SharedModule — PrimeNG Imports

PrimeNG modules ทั้งหมดต้อง import/export ผ่าน `SharedModule` เพื่อให้ทุก feature module หยิบไปใช้ได้เลย

```typescript
// shared/shared.module.ts
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { TabViewModule } from 'primeng/tabview';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';

const PRIMENG_MODULES = [
  ButtonModule,
  InputTextModule,
  InputNumberModule,
  DropdownModule,
  TableModule,
  CardModule,
  DialogModule,
  ToastModule,
  ConfirmDialogModule,
  MenuModule,
  BadgeModule,
  TagModule,
  ProgressSpinnerModule,
  FileUploadModule,
  ImageModule,
  TabViewModule,
  ChipModule,
  TooltipModule,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...PRIMENG_MODULES,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...PRIMENG_MODULES,
  ],
})
export class SharedModule {}
```

### กฎการใช้ PrimeNG

```html
<!-- ✅ ถูกต้อง — ใช้ PrimeNG components -->
<p-table [value]="products()" [paginator]="true" [rows]="20">
  <ng-template pTemplate="header">
    <tr><th>ชื่อ</th><th>ราคา</th></tr>
  </ng-template>
  <ng-template pTemplate="body" let-product>
    <tr><td>{{ product.name }}</td><td>{{ product.price }}</td></tr>
  </ng-template>
</p-table>

<p-dropdown [options]="categories()" optionLabel="name" optionValue="categoryId"
            formControlName="categoryId" placeholder="เลือกหมวดหมู่" />

<p-button label="บันทึก" (onClick)="onSave()" [loading]="isLoading()" />

<!-- ❌ ผิด — เขียน table/dropdown เอง ถ้า PrimeNG มีให้แล้ว -->
<table class="w-full">...</table>
<select formControlName="categoryId">...</select>
```

> **หมายเหตุ:** Confirm Modal และ Success Modal ที่มีอยู่แล้ว (`app-confirm-modal`, `app-success-modal`) ยังคงใช้ต่อได้ — เป็น custom components ที่ออกแบบมาเฉพาะสำหรับ RBMS-POS UX

### Dialog — ห้าม Inline, ใช้ DialogService เท่านั้น

**ห้ามเขียน Dialog inline** ใน template ของ page component — ต้องสร้างเป็น component แยกเสมอ แล้วเปิดผ่าน PrimeNG `DialogService` (DynamicDialog)

```typescript
// ✅ ถูกต้อง — สร้าง Dialog component แยก + เปิดผ่าน DialogService
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.component.html',
  providers: [DialogService], // ← ประกาศ DialogService ที่ component ที่เปิด Dialog
})
export class EmployeeListComponent {
  constructor(private readonly dialogService: DialogService) {}

  onCreateUser(employee: EmployeeResponseModel): void {
    const ref: DynamicDialogRef = this.dialogService.open(CreateUserDialogComponent, {
      header: 'สร้างผู้ใช้งาน',
      width: '28rem',
      data: { employee },
    });
    ref.onClose.subscribe((result) => {
      if (result) { /* handle result */ }
    });
  }
}

// Dialog component รับ/ส่ง data ผ่าน DynamicDialogConfig / DynamicDialogRef
@Component({ selector: 'app-create-user-dialog', standalone: false, templateUrl: '...' })
export class CreateUserDialogComponent {
  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
  ) {
    this.employee = this.config.data.employee; // รับ data
  }
  onConfirm(): void {
    this.ref.close({ username: '...', password: '...' }); // ส่งผลลัพธ์กลับ
  }
}
```

```html
<!-- ❌ ผิด — เขียน Dialog inline ใน page template -->
<p-dialog header="สร้างผู้ใช้" [(visible)]="showDialog">
  <!-- content -->
</p-dialog>
```

**โครงสร้างไฟล์:**
```
features/{module}/
├── dialogs/
│   ├── create-user-dialog/
│   │   ├── create-user-dialog.component.ts
│   │   └── create-user-dialog.component.html
│   └── credentials-dialog/
│       ├── credentials-dialog.component.ts
│       └── credentials-dialog.component.html
└── pages/
    └── employee-list/
```

---

## Critical Rules Summary

| กฎ                                              | เหตุผล                   |
| ----------------------------------------------- | ------------------------ |
| Non-standalone (`standalone: false`)            | Project convention       |
| ใช้ constructor injection                        | Consistency, testability |
| ใช้ Signal สำหรับ state                          | Reactive, readable       |
| Cleanup subscriptions เสมอ                      | ป้องกัน memory leak      |
| ใช้ generated API clients และ models เท่านั้น   | Type safety, consistency |
| รัน `gen-api` ก่อนเขียน Frontend code ใดๆ       | ป้องกันใช้ untyped data  |
| ห้าม `Record<string, unknown>`, `any`, bracket notation | ใช้ generated models + dot notation |
| ใช้ PrimeNG components เป็นมาตรฐาน             | UI consistency, productivity |
| แสดง success/error ผ่าน Shared Modal เท่านั้น   | UI consistency           |
| ค้นหาด้วย Enter key — ห้ามใช้ debounce          | UX ชัดเจน, ลด API calls |
| ห้ามทิ้ง Dead Code ไว้ใน Project                | Code quality             |
| ห้ามสร้าง .css file โดยไม่จำเป็น               | Tailwind เพียงพอ         |
| ใช้ design tokens ใน Tailwind                   | Design consistency       |
| ห้าม inline SVG                                 | ใช้ `<app-generic-icon>` หรือ `pi pi-*` |
| ห้าม hardcode สี raw                            | ใช้ design token         |
| ห้าม inline Dialog ใน page template             | สร้างแยก component + ใช้ `DialogService` |
