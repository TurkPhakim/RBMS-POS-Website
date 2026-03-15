# CLAUDE.md

> อัพเดตล่าสุด: 2026-03-11

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Behavior Rules

### ภาษาในการตอบและเอกสาร

- **ตอบเป็นภาษาไทยเสมอ** — ทุก response ต้องใช้ภาษาไทยเป็นหลัก ห้ามตอบเป็นภาษาอังกฤษโดยไม่จำเป็น
- **เอกสาร `.md` ที่สร้างใหม่ต้องเขียนเป็นภาษาไทยเท่านั้น** — heading, คำอธิบาย, comment ทุกอย่างต้องเป็นไทย
- คำศัพท์เทคนิคที่ไม่มีคำแปลที่ดี (Entity, Service, Signal, Controller, Repository, OnPush, ฯลฯ) ใช้ภาษาอังกฤษได้
- Code, file path, command ใช้ภาษาอังกฤษได้ตามปกติ

### Task Planning — เอกสารต้องมาก่อนเสมอ

> **กฎเหล็ก**: ห้ามเริ่มเขียนโค้ดก่อนสร้าง Task file — เอกสารต้องมาก่อนการพัฒนาเสมอ

ก่อนลงมือทำ Task ใดๆ ที่มีความซับซ้อน (แก้หลายไฟล์, ออกแบบระบบ, งานที่ต้องตัดสินใจ):
1. **สร้าง Plan ให้ผู้ใช้อ่านก่อนเสมอ** — อธิบายสิ่งที่จะทำ, ไฟล์ที่จะแก้, ผลลัพธ์ที่คาดหวัง
2. **รอการยืนยันจากผู้ใช้** ก่อนลงมือทำจริง
3. **สร้าง `doc/tasks/TASK-{ชื่อ}.md` ทันทีหลังยืนยัน ก่อนเริ่มเขียนโค้ด** — ตามรูปแบบใน [doc/tasks/README.md](doc/tasks/README.md)
4. **Task file ต้องมีรายละเอียดเพียงพอ** — แบ่ง Phase → Sub-task, ทุก sub-task ต้องระบุ "ปัญหาปัจจุบัน" + "เป้าหมาย" + "class เก่า → ใหม่" (ถ้ามี)
5. **อัพเดต Task file** ทุกครั้งที่ Phase/Sub-task เสร็จ
6. **ลำดับบังคับ**: Plan → ยืนยัน → **สร้าง Task file** → เริ่มเขียนโค้ด (ห้ามสลับลำดับ)
7. **อ้างอิง**: ดูตัวอย่างจริงที่ [TASK-ui-redesign.md](doc/tasks/TASK-ui-redesign.md)

### Frontend Styling — กฎ Tailwind CSS

- **ห้ามเขียนไฟล์ `.css`** เว้นแต่จำเป็นจริงๆ และไม่มีทางทำด้วย Tailwind utility ได้เลย
- ถ้าจำเป็นต้องเขียน `.css` ต้องบอกผู้ใช้ก่อนว่าทำไมถึงหลีกเลี่ยงไม่ได้
- **ทุก style เขียนเป็น Tailwind class ใน HTML template** (`class="..."`) เท่านั้น
- ใช้ CSS token จาก `tailwind.config.js` เสมอ — ห้ามใช้สี raw เช่น `bg-orange-500`, `text-slate-700`
- **Typography tokens**: ใช้ `text-page-title`, `text-section-title`, `text-card-title` สำหรับหัวข้อ
- **Icon: ใช้ `<app-generic-icon name="xxx">` สำหรับ custom icon** — ห้ามใช้ `<img>` สำหรับ icon (ใช้ `<img>` ได้เฉพาะ logo/รูปภาพจริง)
- **Icon: ใช้ `<i class="pi pi-xxx">` สำหรับ icon ทั่วไป** (plus, search, chevron, close)
- **ห้าม inline SVG path** ใน HTML — ใช้ไฟล์ SVG แยกใน `public/icons/`
- **ห้ามใช้ CSS filter เปลี่ยนสี icon** — ใช้ Tailwind `text-*` class แทน (เช่น `text-danger`, `text-white`)
- **SVG ต้องใช้ `currentColor`** — ห้าม hardcode สีใน SVG (เช่น `fill="#000000"`)
- **ห้ามใช้ Emoji เด็ดขาด** — ทั้งใน UI, comments ในโค้ด ใช้ `<app-generic-icon>` หรือ `pi pi-*` แทน (ยกเว้น ✅ ❌ ในเอกสาร `.md` สำหรับ DO/DON'T)
- **ดูคู่มือ icon ฉบับเต็ม**: [doc/architecture/icon-system.md](doc/architecture/icon-system.md)
- **ห้ามใส่ shadow / glow โดยไม่ได้สั่ง** — ไม่ว่าจะเป็น `shadow-*`, `ring-*`, `glow`, `box-shadow` ห้ามเพิ่มเองถ้าผู้ใช้ไม่ได้ขอ

### หน้า Test สำหรับปรับแต่งสไตล์

- เมื่อผู้ใช้สั่งให้สร้างหน้า Test สำหรับปรับแต่งดีไซน์/สไตล์ของ Dialog หรือ Component → **สร้างเป็น route ระดับ root** (ไม่ใช่ภายใน feature module) เพื่อเข้าถึงง่ายโดยไม่ต้องผ่าน guard/layout
- เมื่อปรับแต่งเสร็จแล้ว → **ลบหน้า Test ออกทั้งหมด** พร้อมเคลียร์ import, declaration, route ไม่ให้เหลือ dead code

### ห้าม Over-Engineer เด็ดขาด

- **ทำเฉพาะที่ถาม** — ห้ามเพิ่มฟีเจอร์ ห้าม refactor โค้ดข้างเคียง ห้าม "ปรับปรุงโอกาส" ที่ไม่ได้ขอ
- **ห้ามสร้าง abstraction ก่อนถึงเวลา** — 3 บรรทัดซ้ำกันยังดีกว่า helper function ที่ใช้ครั้งเดียว
- **ห้าม error handling เกินจำเป็น** — handle เฉพาะ error ที่เกิดขึ้นได้จริงตาม logic ปัจจุบัน
- **ห้ามเพิ่ม comment / docstring** ในโค้ดที่ไม่ได้แตะ
- **ห้ามสร้าง config / feature flag** สำหรับสิ่งที่ยังไม่มีความต้องการจริง
- **ห้าม backward-compatibility shim** — ถ้าของเก่าไม่ถูกใช้แล้วให้ลบออกเลย
- **ขนาดของ solution ต้องพอดีกับปัญหา** — ถ้าทำใน 10 บรรทัดได้ ห้ามเขียน 100 บรรทัด

### เมื่อผู้ใช้บอก Requirement คร่าวๆ

เมื่อผู้ใช้อธิบายฟีเจอร์หรือระบบใหม่แบบคร่าวๆ ให้ทำดังนี้:

1. **ต่อเติมให้สมบูรณ์** — เติมส่วนที่ขาดหาย เช่น edge case, validation, error state ที่ผู้ใช้อาจมองข้าม
2. **คำนึงถึงการใช้งานจริง** — คิดจากมุมผู้ใช้ปลายทางว่าจะใช้งานยังไง อะไรที่อาจสร้างปัญหาในชีวิตจริง
3. **ชี้ประเด็นที่ต้องตัดสินใจ** — ถ้ามีทางเลือกที่กระทบ UX หรือ architecture ให้บอกก่อนลงมือ
4. **อย่าสมมติเอง** — ถ้าข้อมูลสำคัญขาดหาย (เช่น business rule, permission) ให้ถามก่อน ไม่ใช่เดา
5. **ยึด scope ที่ตกลงกัน** — หลังตกลง requirement แล้ว ห้ามขยาย scope เพิ่มเองโดยไม่บอก

---

## Pre-flight: ก่อนเขียน Module ใหม่

> **บังคับ**: ก่อนเริ่มเขียน Backend/Frontend module ใหม่ ต้อง Read เอกสารที่เกี่ยวข้องก่อนเสมอ
> เพื่อให้ได้กฎและ pattern ครบถ้วน ไม่ใช่แค่กฎใน CLAUDE.md

| งานที่จะทำ | ต้อง Read ก่อน |
|------------|---------------|
| **Backend module ใหม่** | [backend-guide.md](doc/development/backend-guide.md) + [backend-coding-standards.md](doc/development/backend-coding-standards.md) |
| **Frontend module ใหม่** | [frontend-guidelines.md](doc/development/frontend-guidelines.md) + [frontend-coding-standards.md](doc/development/frontend-coding-standards.md) (รวมกฎ PrimeNG) |
| **ออกแบบ UX/UI** | [frontend-expert.md](doc/agents/frontend-expert.md) (UX/UI section) + [design-system.md](doc/architecture/design-system.md) + [icon-system.md](doc/architecture/icon-system.md) |
| **Code Review** | [code-reviewer.md](doc/agents/code-reviewer.md) |
| **สร้าง Entity / Migration** | [backend-guide.md](doc/development/backend-guide.md) (Entity + Migration section) + [backend-coding-standards.md](doc/development/backend-coding-standards.md) |
| **สร้าง Entity / API ใหม่** | **ต้องอัพเดต** [database-api-reference.md](doc/architecture/database-api-reference.md) ทุกครั้งหลังเขียนโค้ดเสร็จ |
| **จัดการไฟล์ (Upload/Download)** | [file-management.md](doc/architecture/file-management.md) (TbFile + S3 architecture) |

---

## มาตรฐานการจัดการเอกสาร

**เอกสารทุกชิ้นต้องอยู่ในโฟลเดอร์ `doc/` เท่านั้น**

```
doc/
├── agents/               ← AI Agent specs (SA, Backend, Frontend, Code Reviewer)
├── architecture/         ← สถาปัตยกรรมระบบ, Design system
├── development/          ← คู่มือพัฒนา, มาตรฐานโค้ด, Workflow
├── features/             ← บันทึกฟีเจอร์, สถานะโปรเจค
├── tasks/                ← ติดตาม Task งาน (TASK-{ชื่อ}.md)
└── requirements/         ← Business requirements, Functional specs
```

- เมื่อพัฒนาฟีเจอร์ใหม่และต้องเขียน `.md` → บันทึกใน `doc/features/`
- เมื่อเขียนคู่มือ setup หรือ how-to → บันทึกใน `doc/development/`
- เมื่อออกแบบสถาปัตยกรรม → บันทึกใน `doc/architecture/`
- เมื่อสร้าง/อัพเดต AI Agent spec → บันทึกใน `doc/agents/`
- เมื่อสร้าง Task ติดตามงาน → บันทึกใน `doc/tasks/` ตามรูปแบบใน [doc/tasks/README.md](doc/tasks/README.md)
- **ห้ามวางไฟล์ `.md` ไว้ที่ root** (ยกเว้น README.md และ CLAUDE.md)
- **ทุกเอกสารใหม่ต้องอัปเดตตารางใน [README.md](README.md) ด้วย**

---

## Project Overview

**RBMS-POS** — ระบบ Point of Sale สำหรับจัดการการขาย สินค้าคงคลัง และพนักงาน

### Technology Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Backend** | ASP.NET Core 9.0, Entity Framework Core, SignalR |
| **Frontend** | Angular 19.1, Tailwind CSS 3.4, PrimeNG, Angular Signals, ng-openapi-gen, SignalR Client |
| **Database** | SQL Server |
| **API Docs** | Swagger/OpenAPI (Swashbuckle 9.0.6) |

### Repository Structure

```
RBMS-POS/
├── Backend-POS/POS.Main/
│   ├── RBMS.POS.WebAPI/              # Controllers, Middleware, Program.cs
│   ├── POS.Main.Business.Admin/      # Auth, AdminSettings (ServiceCharge)
│   ├── POS.Main.Business.Menu/       # Menu management
│   ├── POS.Main.Business.HumanResource/ # Employee management
│   ├── POS.Main.Repositories/        # Repository interfaces + UnitOfWork
│   ├── POS.Main.Dal/                 # Entities, DbContext, Migrations
│   └── POS.Main.Core/                # Enums, Constants, Exceptions, Helpers
│
├── Frontend-POS/RBMS-POS-Client/src/app/
│   ├── core/                     # API clients (generated), guards, interceptors
│   ├── shared/                   # Shared components, dialogs, pipes
│   ├── layouts/                  # main-layout, auth-layout
│   └── features/                 # Feature modules (lazy-loaded)
│
└── doc/                          # เอกสารทั้งหมด
    ├── agents/                   # AI Agent specs (system-analyst, backend-expert, ...)
    ├── architecture/             # System design, database guidelines
    ├── development/              # Dev guides, workflows, guidelines
    ├── features/                 # Feature summaries
    └── requirements/             # Business requirements
```

---

## Architecture

**Dependency direction (strict — no circular refs):**

```
RBMS.POS.WebAPI → POS.Main.Business.* → POS.Main.Repositories → POS.Main.Dal → POS.Main.Core
```

**Critical Architecture Rules:**
- ห้าม expose Entity โดยตรง — ใช้ Models (DTO) เสมอ
- **ทุก Entity ต้อง inherit `BaseEntity`** — ห้าม define audit fields ซ้ำ (CreatedAt/By, UpdatedAt/By, DeleteFlag/At/By)
- **DbContext override SaveChanges** — auto-stamp tracking fields อัตโนมัติ (ไม่ต้อง set ด้วยมือ)
- **Global Query Filter** — ซ่อน record ที่ DeleteFlag=true อัตโนมัติทุก query
- Business logic อยู่ใน Service เท่านั้น — Controller ต้องบาง
- **Controller inherit `BaseController`** — ใช้ `Success()` / `ToActionResult()` helper methods
- ห้าม try-catch ใน Controller — **`GlobalExceptionFilter`** จัดการ exceptions ทั้งหมด
- **Service throw specific exceptions** — ไม่ต้องมี try-catch block (ยกเว้น transaction operations ที่ใช้ `BeginTransactionAsync`) — `GlobalExceptionFilter` จัดการ unhandled exceptions
- **Repository เป็นผู้ execute query** — Service เรียก Repository methods ไม่ใช่ LINQ โดยตรง
- ทุก database operation ผ่าน Repository/UnitOfWork — ห้าม DbContext โดยตรง
- Commit ครั้งเดียวต่อ transaction
- **Response format**: ใช้ `BaseResponseModel<T>` (single), `PaginationResult<T>` (paginated list), `ListResponseModel<T>` (list ไม่แบ่งหน้า)
- **Response Status**: ใช้ `constResultType.Success` / `constResultType.Fail` เสมอ — ห้าม hardcode string `"success"` / `"fail"`
- Async/await ทุก I/O + forward CancellationToken เสมอ
- **ห้ามใช้ AutoMapper เด็ดขาด** — ใช้ manual mapping (object initializer) เสมอ
- **AsNoTracking** สำหรับ read-only queries เสมอ
- **Structured logging** — ใช้ named parameters (`_logger.LogInformation("Get {Id}", id)`) ห้าม string interpolation
- **ห้ามทิ้ง Dead Code** — ถ้าไม่ใช้แล้วให้ลบออกทันที
- **Route parameter ต้องเจาะจง** — ห้ามใช้ `{id}` เฉยๆ ต้องระบุชื่อให้ชัดเจน เช่น `{menuId}`, `{employeeId}`, `{fileId}` (parameter name ใน method ต้องตรงกับ route template)
- **Relationship config ใช้ Fluent API เท่านั้น** — ห้ามใช้ `[InverseProperty]` attribute, เมื่อ Entity มี FK หลายตัวชี้ไป parent เดียวกัน ต้อง config ใน EntityConfiguration อย่างชัดเจน
- **API operationId ใช้ `CustomOperationIdFilter`** — ห้ามตั้ง operationId ด้วยมือ (ห้าม `[SwaggerOperation]` หรือ `Name` property) — `CustomOperationIdFilter` (`RBMS.POS.WebAPI/Filters/`) จะ auto-generate จาก `{ControllerName}_{ActionName}_{HttpMethod}` → ng-openapi-gen แปลงเป็น camelCase method ใน Frontend อัตโนมัติ (เช่น `humanResourceGetEmployeesGet`, `positionsCreatePositionPost`)

**Real-time Architecture (SignalR + Angular Signals):**
- ใช้ **SignalR Hub** (Backend) broadcast events เมื่อข้อมูลเปลี่ยน (Order, Table, Kitchen)
- ใช้ **SignalR Client** (Frontend) รับ events แล้ว update Angular Signals → UI อัพเดตอัตโนมัติ
- Group ตาม Role (Kitchen เห็นแค่ออเดอร์ครัว, Cashier เห็นทุกออเดอร์)
- ไม่ใช้ Polling หรือ setInterval สำหรับ real-time data

---

## Naming Conventions

### Backend (C#)

| Element | Pattern | ตัวอย่าง |
|---------|---------|---------|
| Entity class | `Tb{Name}` | `TbProduct`, `TbSale`, `TbEmployee` |
| Entity class (Master Data) | `Tbm{Name}` | `TbmPaymentMethod`, `TbmEmployeeRole` |
| Base Entity | `BaseEntity` | ทุก Entity ต้อง inherit |
| Repository interface | `I{Name}Repository` | `IProductRepository` |
| Repository impl | `{Name}Repository` | `ProductRepository` |
| Service interface | `I{Name}Service` | `IProductService` |
| Service impl | `{Name}Service` | `ProductService` |
| Request Model | `{Action}{Entity}RequestModel` | `CreateProductRequestModel` |
| Response Model | `{Entity}ResponseModel` | `ProductResponseModel` |
| Response wrapper | `BaseResponseModel<T>` | `BaseResponseModel<ProductResponseModel>` |
| Paginated response | `PaginationResult<T>` | `PaginationResult<ProductResponseModel>` |
| Pagination params | `PaginationModel` | รับ page, itemPerPage, search |
| List response | `ListResponseModel<T>` | สำหรับ dropdown / list ไม่แบ่งหน้า |
| Controller base | `BaseController` | ทุก Controller ต้อง inherit |
| Exception filter | `GlobalExceptionFilter` | จัดการ exceptions → HTTP status |
| Manual Mapper | `{Name}Mapper` (static) | `ProductMapper.ToResponse()` |
| Async method | `{Action}Async` | `GetProductByIdAsync` |
| Enum | `E{Name}` | `EProductStatus`, `EPaymentMethod` |
| Private field | `_camelCase` | `_unitOfWork`, `_logger` |

### Frontend (TypeScript/Angular)

| Element | Pattern | ตัวอย่าง |
|---------|---------|---------|
| Component file | `{name}.component.ts` | `product-list.component.ts` |
| API Service (generated) | `{Name}Service` | `ProductsService` |
| Signal | camelCase | `products`, `isLoading`, `error` |
| Feature module | `{Name}Module` | `InventoryModule` |
| Route path | kebab-case | `product-list`, `employee-manage` |
| Route path (เพิ่ม) | `create` | ห้ามใช้ `add` |
| Route path (แก้ไข) | `update/:entityId` | ห้ามใช้ `edit` |

---

## Key Patterns

### Backend — Error Handling + Response

```csharp
// ✅ Service throws specific exceptions → GlobalExceptionFilter จัดการ
throw new ValidationException("กรุณาระบุชื่อสินค้า");     // → 400
throw new EntityNotFoundException("Product", id);          // → 404
throw new BusinessException("สินค้าถูกลบไปแล้ว");          // → 422

// ✅ Controller — thin, no try-catch, inherit BaseController
public class ProductsController : BaseController
{
    // Single item
    public async Task<IActionResult> GetProduct(int id, CancellationToken ct = default)
        => Success(await _productService.GetProductByIdAsync(id, ct));

    // Paginated list
    public async Task<IActionResult> GetProducts([FromQuery] PaginationModel param, CancellationToken ct = default)
        => ToActionResult(await _productService.GetProductsAsync(param, ct));
}
```

```json
// ✅ BaseResponseModel<T> — JSON Response Format
{ "status": "success", "result": { ... }, "message": "", "code": null, "errors": null }

// ✅ PaginationResult<T> — Paginated Response
{ "status": "success", "results": [...], "page": 1, "total": 150, "itemPerPage": 20 }
```

### Frontend — API + Cleanup

```typescript
// ✅ ใช้ generated service เสมอ (ห้าม manual HttpClient)
this.productsService.apiV1ProductsGet()
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({ next: (res) => this.products.set(res.result ?? []) });

// ✅ Angular Signals
products = signal<ProductResponse[]>([]);
isLoading = signal(false);
```

### Frontend — Component rules

- `standalone: false` เสมอ (NgModule-based)
- **ใช้ constructor injection** เสมอ — ไม่ใช้ `inject()` standalone
- **ห้ามใช้ `ChangeDetectionStrategy.OnPush`** — ใช้ Angular Signals (`signal<T>()`) สำหรับ state
- **ห้ามสร้าง Model Interface/Type เอง** — ใช้ generated models จาก `@core/api/models/` เท่านั้น
- **ใช้ `@if/@for/@switch`** แทน `*ngIf/*ngFor` (Modern Angular control flow)
- **`track` ใน `@for` เสมอ** — `@for (item of items; track item.id)`
- **ห้ามใช้ `any` type** — ใช้ generated models หรือ specific type
- Cleanup subscriptions ด้วย `takeUntilDestroyed(destroyRef)` หรือ `destroy$`
- **Search: Enter key trigger เท่านั้น** — `(keyup.enter)` ห้าม debounceTime + distinctUntilChanged
- **Form Validation — แสดง error เฉพาะตอนกดบันทึก** — `<app-field-error>` ใช้ `control.dirty` เท่านั้น (ไม่ใช้ `touched`) → ห้ามใช้ `markAllAsTouched()` เด็ดขาด → ใช้ `markFormDirty(this.form)` จาก `@app/shared/utils` แทน เพื่อให้ error แสดงเฉพาะเมื่อกดปุ่มบันทึก ไม่ใช่ตอน blur ออกจากช่อง — **ห้ามใช้ manual `[class.ng-invalid]`/`[class.ng-dirty]` binding** บน input/textarea ใน template — Angular จัดการ class เหล่านี้ให้อัตโนมัติผ่าน Reactive Forms + CSS ใน `styles.css`
- **Success/Error/Confirm feedback** — ใช้ `ModalService` (`core/services/modal.service.ts`): `info()` (confirm), `cancel()` (error), `commonSuccess()` (success auto-close) — ห้ามใช้ @Input/@Output modal แบบเก่า
- ใช้ design tokens เท่านั้น (เช่น `bg-primary`, `text-primary-text`, `bg-surface`, `text-surface-dark`, `bg-success`, `bg-danger`, `bg-warning` ตาม `tailwind.config.js`)
- **ใช้ PrimeNG components เป็นมาตรฐาน** — Table, Dialog, Dropdown, Button, Toast, InputText ฯลฯ import ผ่าน SharedModule
- **Icon: ใช้ `<app-generic-icon>`** สำหรับ custom icon, `pi pi-*` สำหรับ icon ทั่วไป — ห้ามใช้ `<img>` สำหรับ icon (ดู [icon-system.md](doc/architecture/icon-system.md))
- **ห้ามใช้ Emoji** — ใช้ `<app-generic-icon>` หรือ `pi pi-*` แทน
- **ห้ามทิ้ง Dead Code** — ทุก component ต้องมีการใช้งานจริง
- **Dialog ต้องสร้างแยก component เสมอ** — ห้ามเขียน Dialog inline ใน template ของ page component
  - ใช้ **PrimeNG `DialogService`** (`primeng/dynamicdialog`) เปิด Dialog แบบ programmatic
  - Dialog component รับ data ผ่าน `DynamicDialogConfig` และ return ผลลัพธ์ผ่าน `DynamicDialogRef.close()`
  - เพิ่ม `providers: [DialogService]` ใน component ที่เปิด Dialog
  - วาง Dialog component ไว้ใน `features/{module}/dialogs/{name}/` และ declare ใน feature module
  - **Dialog ต้องใช้ `<app-card-template>` เป็น Layout มาตรฐาน:**
    - ใช้ `headerLabel` สำหรับชื่อ Dialog (อ่านจาก `config.header!`)
    - เนื้อหาใส่ใน default `ng-content`
    - ปุ่มใส่ใน `<p-footer>` (อยู่ตรงกลางอัตโนมัติ)
    - เปิด dialog ด้วย `showHeader: false` + `styleClass: 'card-dialog'`
    - **Dialog width ต้องใช้หน่วย `vw` เสมอ** — ห้ามใช้ `px` (เช่น `width: '60vw'`, `width: '35vw'`)
- **หน้า Manage (เพิ่ม/แก้ไข) — ปุ่ม "ย้อนกลับ" + "บันทึก" ต้องอยู่ที่ Breadcrumb เท่านั้น** ห้ามวางด้านล่างฟอร์ม
  - ใช้ `BreadcrumbService.addOrUpdateButton()` ลงทะเบียนปุ่มใน `ngOnInit()`
  - ปุ่ม Back ใช้คำว่า **"ย้อนกลับ"** (ไม่ใช่ "กลับ" หรือ "ยกเลิก"), severity `secondary`, variant `outlined`
  - **ปุ่ม Breadcrumb ห้ามใส่ icon** — ใช้แค่ label เท่านั้น
  - **ปุ่ม Save ใช้ label `"บันทึก"` เสมอ** — ห้ามแยก label ตาม create/edit mode (ห้ามใช้ "บันทึกการแก้ไข", "สร้าง", "เพิ่ม" ฯลฯ)
  - **ต้องมี `ngOnDestroy`** เรียก `breadcrumbService.clearButtons()` เสมอ
  - ใช้ `setButtonLoading()` / `setButtonDisabled()` sync state ตอน saving
  - **ประกาศ button key เป็น `const` ด้านบนไฟล์** เช่น `const KEY_BTN_SAVE = 'save-employee';` ห้าม hardcode string
- **Route path ใช้ `create` / `update`** — ห้ามใช้ `add` / `edit` สำหรับ URL path (เช่น `/employees/create`, `/employees/update/:employeeId`)
- **Card pattern ห้ามใช้ `overflow-hidden`** — ใช้ `rounded-t-xl` บน gradient header แทน เพื่อป้องกัน popup (datepicker, dropdown) ถูก clip
- **Dropdown ต้อง extends `DropdownBaseComponent`** — ทุก dropdown อยู่ใน `shared/dropdowns/`, extends base class (ControlValueAccessor), ใช้ `formControlName` binding เสมอ (ห้าม `[value]/(valueChange)`), static options ตั้งใน constructor, API data ใช้ `fetchFn` หรือ load-once ใน `ngOnInit`, `host: { class: 'block' }` เสมอ
- **ตาราง List ต้องมี Pagination เสมอ** — ทุก `p-table` ในหน้า list ต้องมี attributes ครบชุด: `[paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]" [showCurrentPageReport]="true" currentPageReportTemplate="{first} - {last} of {totalRecords}" paginatorDropdownAppendTo="body"` — style ของ paginator กำหนดใน `styles.css` (global) ชิดขวา, compact — คอลัมน์สุดท้ายใช้ชื่อ "ตัวเลือก" (ไม่ใช่ "จัดการ")
- **DatePicker คู่ (วันเริ่มต้น–วันสิ้นสุด) ต้องใช้ `[minDate]` เสมอ** — เมื่อมี startDate + endDate คู่กัน ต้อง: (1) สร้าง `minEndDate = signal<Date | null>(null)` (2) เรียก `linkDateRange(this.form, 'startDate', 'endDate', this.minEndDate, this.destroyRef)` จาก `@app/shared/utils` (3) bind `[minDate]="minEndDate()"` บน endDate datepicker — เพื่อป้องกันผู้ใช้เลือกวันสิ้นสุดก่อนวันเริ่มต้น

---

## ค้นหาไฟล์อย่างรวดเร็ว

### Backend

| หาอะไร | Command |
|--------|---------|
| Entity | `Glob "Backend-POS/**/Entities/*.cs"` |
| Entity Configuration | `Glob "Backend-POS/**/EntityConfigurations/*Configuration.cs"` |
| Repository interface | `Glob "Backend-POS/**/Interfaces/I*Repository.cs"` |
| Repository impl | `Glob "Backend-POS/**/Implementations/*Repository.cs"` |
| Service | `Grep "class {Name}Service" path=Backend-POS/` |
| Controller | `Glob "Backend-POS/**/Controllers/*Controller.cs"` |
| Models (DTO) | `Glob "Backend-POS/**/Models/**/*Model.cs"` |
| Mapper | `Glob "Backend-POS/**/*Mapper.cs"` |
| Enum | `Glob "Backend-POS/**/Enums/*.cs"` |
| DbContext | `Glob "Backend-POS/**/*Context.cs"` |

### Frontend

| หาอะไร | Command |
|--------|---------|
| Generated API service | `Glob "Frontend-POS/**/core/api/services/*.ts"` |
| Generated model | `Glob "Frontend-POS/**/core/api/models/*.ts"` |
| Feature module | `Glob "Frontend-POS/**/features/{name}/{name}.module.ts"` |
| Feature page | `Glob "Frontend-POS/**/features/**/pages/**/*.component.ts"` |
| Shared component | `Glob "Frontend-POS/**/shared/components/**/*.component.ts"` |
| Shared modal | `Glob "Frontend-POS/**/shared/modals/**/*.component.ts"` |
| Guard | `Glob "Frontend-POS/**/core/guards/*.ts"` |
| Interceptor | `Glob "Frontend-POS/**/core/interceptors/*.ts"` |
| Core service (custom) | `Glob "Frontend-POS/**/core/services/*.ts"` |
| Pipe | `Glob "Frontend-POS/**/shared/pipes/*.ts"` |

### ตำแหน่งไฟล์หลัก

> `{Root}` = `Backend-POS/POS.Main`

**Backend:**
```
BaseEntity          → {Root}/POS.Main.Dal/Entities/BaseEntity.cs
Entity              → {Root}/POS.Main.Dal/Entities/{Domain}/Tb{Name}.cs
                      (ทุก Entity ใช้ flat namespace `POS.Main.Dal.Entities` แม้อยู่ใน sub-folder)
Entity Config       → {Root}/POS.Main.Dal/EntityConfigurations/Tb{Name}Configuration.cs
DbContext           → {Root}/POS.Main.Dal/POSMainContext.cs
Repository (I)      → {Root}/POS.Main.Repositories/Interfaces/I{Name}Repository.cs
Repository          → {Root}/POS.Main.Repositories/Implementations/{Name}Repository.cs
UnitOfWork          → {Root}/POS.Main.Repositories/UnitOfWork/UnitOfWork.cs
Service (I)         → {Root}/POS.Main.Business.{Module}/Interfaces/I{Name}Service.cs
Service             → {Root}/POS.Main.Business.{Module}/Services/{Name}Service.cs
Models (DTO)        → {Root}/POS.Main.Business.{Module}/Models/{SubFolder}/*Model.cs
Mapper              → {Root}/POS.Main.Business.{Module}/Models/{SubFolder}/{Name}Mapper.cs
Response Models     → {Root}/POS.Main.Core/Models/BaseResponseModel.cs (+ Pagination)
BaseController      → {Root}/RBMS.POS.WebAPI/Controllers/BaseController.cs
Controller          → {Root}/RBMS.POS.WebAPI/Controllers/{Name}Controller.cs
ExceptionFilter     → {Root}/RBMS.POS.WebAPI/Filters/GlobalExceptionFilter.cs
OperationIdFilter   → {Root}/RBMS.POS.WebAPI/Filters/CustomOperationIdFilter.cs
Program.cs          → {Root}/RBMS.POS.WebAPI/Program.cs
Enum                → {Root}/POS.Main.Core/Enums/{Name}.cs
Exception           → {Root}/POS.Main.Core/Exceptions/{Name}Exception.cs
```

**Business Modules ปัจจุบัน:**
```
POS.Main.Business.Admin          → Auth, ServiceCharge
POS.Main.Business.Menu           → Menu
POS.Main.Business.HumanResource  → Employee
```

**Frontend:**
```
Generated API       → src/app/core/api/services/*.service.ts
Generated Models    → src/app/core/api/models/*.ts
API Config          → src/app/core/api/api-config.provider.ts
Core Services       → src/app/core/services/{name}.service.ts
Guards              → src/app/core/guards/{name}.guard.ts
Interceptors        → src/app/core/interceptors/{name}.interceptor.ts
Feature Module      → src/app/features/{module}/{module}.module.ts
Feature Routing     → src/app/features/{module}/{module}-routing.module.ts
Feature Pages       → src/app/features/{module}/pages/{name}/{name}.component.ts
Shared Components   → src/app/shared/components/{name}/{name}.component.ts
Shared Dropdowns    → src/app/shared/dropdowns/{name}/{name}.component.ts
Shared Modals       → src/app/shared/modals/{name}/{name}.component.ts
Shared Pipes        → src/app/shared/pipes/{name}.pipe.ts
Shared Utils        → src/app/shared/utils/{name}.ts (barrel: index.ts)
Shared Pages        → src/app/shared/pages/{name}/{name}.component.ts
Layout              → src/app/layouts/main-layout/main-layout.component.ts
Shared Module       → src/app/shared/shared.module.ts
App Module          → src/app/app.module.ts
```

---

## Common Development Commands

### Backend

```bash
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet run                    # Run API (Swagger: https://localhost:{port}/swagger)
dotnet watch run              # Hot reload

# Migrations (run from Backend-POS/)
dotnet ef migrations add Add{Feature}Tables --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI
dotnet ef database update     --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI
dotnet ef migrations remove   --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI
```

### Frontend

```bash
cd Frontend-POS/RBMS-POS-Client
ng serve                      # Dev server: http://localhost:4300
npm run gen-api               # Generate TypeScript client from Swagger
ng test                       # Run unit tests
ng build                      # Production build
```

---

## Important Notes

- **Non-standalone components** — `standalone: false` ทุกตัว, declare ใน NgModule
- **Lazy loading** — feature module ทุกตัวต้อง lazy load ผ่าน `loadChildren`
- **Generated API clients** — Regenerate ด้วย `npm run gen-api` ทุกครั้งที่ backend API เปลี่ยน
- **Soft delete** — ใช้ `DeleteFlag` เสมอ ห้าม hard delete
- **Audit fields** — ทุก Entity inherit `BaseEntity` ซึ่งรวม `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `DeleteFlag`, `DeletedAt`, `DeletedBy`
- **Migrations** — ระบุ `--project` และ `--startup-project` เสมอ ห้ามรันจาก directory ผิด
- **อัพเดต Database/API Reference** — เมื่อสร้าง Entity, Controller, หรือ Endpoint ใหม่ ต้องอัพเดต [database-api-reference.md](doc/architecture/database-api-reference.md) ทุกครั้ง

---

## Detailed Documentation

| เรื่อง | ไฟล์ |
|--------|------|
| **สถาปัตยกรรม** | |
| ภาพรวมระบบ (Tech Stack, Data flow) | [doc/architecture/system-overview.md](doc/architecture/system-overview.md) |
| โครงสร้างไฟล์ทั้งหมด | [doc/architecture/project-structure.md](doc/architecture/project-structure.md) |
| Design system (tokens, typography) | [doc/architecture/design-system.md](doc/architecture/design-system.md) |
| Icon system (GenericIcon + PrimeIcons) | [doc/architecture/icon-system.md](doc/architecture/icon-system.md) |
| File Management (TbFile + S3) | [doc/architecture/file-management.md](doc/architecture/file-management.md) |
| อ้างอิงฐานข้อมูลและ API (ตาราง, Endpoint, ความสัมพันธ์) | [doc/architecture/database-api-reference.md](doc/architecture/database-api-reference.md) |
| **คู่มือพัฒนา** | |
| Quick Start (รันโปรเจคครั้งแรก) | [doc/development/quick-start.md](doc/development/quick-start.md) |
| End-to-End Workflow (16 steps) | [doc/development/module-development-workflow.md](doc/development/module-development-workflow.md) |
| Backend guide (Architecture + 10-step + Errors) | [doc/development/backend-guide.md](doc/development/backend-guide.md) |
| Backend coding standards (DO/DON'T ละเอียด) | [doc/development/backend-coding-standards.md](doc/development/backend-coding-standards.md) |
| Frontend patterns + DO/DON'T | [doc/development/frontend-guidelines.md](doc/development/frontend-guidelines.md) |
| Frontend coding standards (DO/DON'T ละเอียด) | [doc/development/frontend-coding-standards.md](doc/development/frontend-coding-standards.md) |
| AI Agents + Prompting guide | [doc/development/ai-prompting-guide.md](doc/development/ai-prompting-guide.md) |
| **AI Agent Specs** | |
| SA Agent spec | [doc/agents/system-analyst.md](doc/agents/system-analyst.md) |
| Backend Expert Agent spec | [doc/agents/backend-expert.md](doc/agents/backend-expert.md) |
| Frontend Expert Agent spec | [doc/agents/frontend-expert.md](doc/agents/frontend-expert.md) |
| Code Reviewer Agent spec | [doc/agents/code-reviewer.md](doc/agents/code-reviewer.md) |
| **ฟีเจอร์ & Tasks** | |
| สถานะโปรเจคปัจจุบัน | [doc/features/project-status.md](doc/features/project-status.md) |
| Task tracking system | [doc/tasks/README.md](doc/tasks/README.md) |
| Task: UI Redesign | [doc/tasks/TASK-ui-redesign.md](doc/tasks/TASK-ui-redesign.md) |
| Task: Icon System | [doc/tasks/TASK-icon-system.md](doc/tasks/TASK-icon-system.md) |
| Task: API Naming Pattern | [doc/tasks/TASK-api-naming.md](doc/tasks/TASK-api-naming.md) |
