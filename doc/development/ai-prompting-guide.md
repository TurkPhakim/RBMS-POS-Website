# AI Prompting Guide — RBMS-POS

Last Updated: 2026-03-10

คู่มือการใช้งาน AI (Claude) อย่างมีประสิทธิภาพสำหรับการพัฒนา RBMS-POS

---

## Available Agents

| Agent | ไฟล์ | หน้าที่ |
|-------|------|---------|
| **System Analyst** | [system-analyst.md](../agents/system-analyst.md) | ออกแบบระบบ, Entity, API, Business Rules |
| **Backend Expert** | [backend-expert.md](../agents/backend-expert.md) | เขียน/review .NET backend code |
| **Frontend Expert** | [frontend-expert.md](../agents/frontend-expert.md) | เขียน/review Angular frontend code |


### วิธีเรียกใช้ Agent

เมื่อเรียกใช้ agent ให้แนบ **agent file เป็น context** แล้ว prompt ตามนั้น:

```
[แนบไฟล์ doc/agents/backend-expert.md]

ช่วยเขียน ProductService สำหรับจัดการสินค้าคงคลัง โดยมี features:
1. ดึงรายการสินค้า (พร้อม filter, pagination)
2. สร้างสินค้าใหม่
3. อัพเดทราคาสินค้า
4. ปิด/เปิดการขาย
5. Soft delete
```

---

## หลักการเขียน Prompt ที่ดี

### 1. ระบุ Context ชัดเจน

```
❌ ช่วยเขียน service

✅ ช่วยเขียน InventoryService สำหรับจัดการสินค้าคงคลัง (RBMS-POS)
   โดยใช้ ASP.NET Core 9, EF Core, IUnitOfWork pattern
   ตาม architecture ใน backend-guide.md
```

### 2. ระบุ Requirements ครบ

```
❌ เขียน API สำหรับสินค้า

✅ เขียน Products API โดยมี requirements:

   Endpoint: POST /api/inventory
   Request:
   - name: string (required, max 200 chars)
   - price: decimal (required, min 0)
   - categoryId: int (required)
   - description: string (optional)

   Business Rules:
   1. ชื่อสินค้าต้องไม่ซ้ำในระบบ
   2. ราคาต้องมากกว่า 0
   3. CategoryId ต้องมีอยู่จริง

   Response: ProductResponse DTO
```

### 3. ระบุ Output ที่ต้องการ

```
❌ ช่วยทำหน้าสินค้า

✅ ช่วยเขียน Angular component สำหรับหน้า Product List:

   Files:
   - product-list.component.ts
   - product-list.component.html

   Features:
   - แสดงรายการสินค้าในรูปแบบ grid/table
   - Search ด้วยชื่อสินค้า
   - Filter ตาม category
   - ปุ่ม Edit, Delete
   - Confirm dialog ก่อนลบ
   - Loading/Error state

   Stack: Angular 19.1, Tailwind design tokens, Angular Signals,
          ใช้ generated API service จาก ng-openapi-gen
```

### 4. ให้ Context ของ SA ก่อนเรียก Dev

```
[แนบ output จาก SA ที่ออกแบบ Entity + API ไว้แล้ว]
[แนบไฟล์ doc/agents/backend-expert.md]

ช่วย implement ตาม design ที่ SA ออกแบบไว้ข้างต้น
```

---

## SA + Dev Workflow: พัฒนา Feature แบบ End-to-End

### Phase 1: System Analyst — ออกแบบก่อน

**Prompt:**
```
[แนบ doc/agents/system-analyst.md]

ช่วยออกแบบ Discount Module สำหรับ RBMS-POS:

Requirements:
- Manager สร้าง/จัดการส่วนลด
- Cashier ใช้ส่วนลดตอนชำระเงิน
- ประเภท: % discount และ fixed amount
- มี promo code และ expiry date
- จำกัดจำนวนการใช้
- ส่วนลดต้องไม่เกินยอดสั่งซื้อ

ต้องการ:
1. Entity design (TbDiscount)
2. Business rules ครบ
3. API endpoints
4. DTOs (Request/Response)
```

**Output (ตัวอย่าง):**
```yaml
Entity: TbDiscount
Fields: DiscountId, Code, Name, Type (Percentage/Fixed),
        Value, MinOrderAmount, MaxDiscountAmount,
        ValidFrom, ValidTo, UsageLimit, UsageCount, IsActive

API Endpoints:
- GET    /api/discount
- POST   /api/discount
- PATCH  /api/discount/{id}/toggle
- POST   /api/discount/validate
- POST   /api/discount/apply

Business Rules:
1. ต้อง IsActive = true
2. ต้องอยู่ในช่วง ValidFrom–ValidTo
3. ยอดสั่งซื้อต้อง >= MinOrderAmount
4. UsageCount < UsageLimit (ถ้ากำหนด)
5. ส่วนลด % ห้ามเกิน MaxDiscountAmount
6. ส่วนลดห้ามเกินยอดรวม
```

### Phase 2: Backend Expert — Implement

**Prompt:**
```
[แนบ output จาก SA ด้านบน]
[แนบ doc/agents/backend-expert.md]

ช่วย implement Discount Module ตาม design ข้างต้น
ต้องการ:
1. Entity + Configuration
2. Repository interface + implementation
3. DTOs (Request/Response)
4. Manual Mapper (static class)
5. DiscountService (IDiscountService + implementation)
6. Controller ที่ thin พร้อม XML comments
```

### Phase 3: Frontend Expert — Build UI

**Prompt:**
```
[แนบ API design จาก SA]
[แนบ doc/agents/frontend-expert.md]

Backend Discount API พร้อมแล้ว (endpoint ตามที่ SA ออกแบบ)
ช่วยสร้าง Angular UI สำหรับ Discount Management:

1. discount-list page — table แสดงส่วนลดทั้งหมด + toggle active
2. discount-manage page — form สร้าง/แก้ไขส่วนลด
3. discount-apply component — input promo code ตอนชำระเงิน

ใช้: Angular 19.1, Tailwind tokens, Signals, generated API
```


---

## Prompt Templates

### Template: สร้าง Backend Feature

```
[แนบ doc/agents/backend-expert.md]

ช่วยเขียน {FeatureName} ใน {Module} module

Entity: {EntityName}
Fields: {list fields}

Endpoints:
{list endpoints}

Business Rules:
{list rules}

ต้องการ: Entity, Repository, DTOs, Manual Mapper, Service, Controller
```

### Template: สร้าง Frontend Component

```
[แนบ doc/agents/frontend-expert.md]

ช่วยเขียน {ComponentName} component สำหรับ {description}

API: ใช้ generated {ServiceName} จาก ng-openapi-gen
Features:
{list features}

State: ใช้ Angular Signals
Styling: Tailwind design tokens (primary, surface, success, danger)
```

### Template: Bug Fix

```
[แนบไฟล์ที่มี bug]

Bug: {อธิบาย bug}
Expected: {สิ่งที่ควรเกิดขึ้น}
Actual: {สิ่งที่เกิดขึ้นจริง}
Error message: {error ถ้ามี}

ช่วย debug และแก้ไข โดยอธิบายสาเหตุด้วย
```

### Template: Code Review

```
[แนบ doc/agents/code-reviewer.md]
[แนบไฟล์ที่ต้อง review]

ช่วย review code นี้ตาม RBMS-POS guidelines:
- Architecture compliance
- Security issues
- Performance concerns
- Naming conventions
```

### Template: Refactor

```
[แนบไฟล์ที่ต้อง refactor]

ช่วย refactor code นี้ให้ดีขึ้น

ปัญหาที่พบ:
- {issue 1}
- {issue 2}

ต้องการปรับปรุง:
- {improvement 1}
- {improvement 2}

Constraints:
- ต้องไม่เปลี่ยน public interface/API contract
- ต้องทำงานเหมือนเดิม (behavior unchanged)
- ยังคง pattern ของ RBMS-POS (CLAUDE.md)
```

---

## Tips & Best Practices

### DO
- ✅ แนบ agent file เป็น context เสมอ
- ✅ แบ่งงานเป็นชิ้นเล็กๆ (SA → Backend → Frontend → Test)
- ✅ ให้ output จาก phase ก่อนเป็น input phase ถัดไป
- ✅ ระบุ constraint ที่สำคัญ (ชื่อ field, business rule)
- ✅ ถาม follow-up เมื่อต้องการ clarification

### DON'T
- ❌ อย่า prompt กว้างเกินไป ("ช่วยสร้าง inventory system")
- ❌ อย่าข้ามขั้น SA (เขียนโค้ดก่อนออกแบบ)
- ❌ อย่า copy code โดยไม่ปรับให้ตรงกับ RBMS-POS structure
- ❌ อย่า override กฎใน agent files โดยไม่มีเหตุผล

### Breaking Tasks Down

```
Feature ใหญ่ → แบ่งเป็น:
1. SA design (entities + API + rules)
2. Backend: Entity + Migration
3. Backend: Repository + UnitOfWork
4. Backend: DTOs + Service
5. Backend: Controller + test in Swagger
6. Frontend: gen-api + module structure
7. Frontend: List page
8. Frontend: Manage page (Create/Edit)
9. Tests
```

### ระบุ Constraints และ Edge Cases

```
❌ ช่วยเขียน function คำนวณส่วนลด

✅ ช่วยเขียน function คำนวณส่วนลด

   Input:
   - subTotal: decimal
   - discountType: "Percentage" | "Fixed"
   - discountValue: decimal
   - maxDiscountAmount: decimal? (cap)

   Edge Cases ที่ต้อง handle:
   - discountValue <= 0 → return 0
   - Percentage > 100 → cap at 100%
   - Fixed > subTotal → cap at subTotal
   - maxDiscountAmount → cap ผลลัพธ์
   - ผลลัพธ์ปัดเป็น 2 ทศนิยม
```

### ขอให้ AI อธิบายด้วย

```
ช่วยเขียน ProductService.GetProductsAsync() พร้อม pagination

และอธิบายด้วยว่า:
1. ทำไมใช้ AsNoTracking()
2. Skip/Take ทำงานยังไงใน EF Core
3. ถ้าจะเพิ่ม full-text search ต้องทำอะไรเพิ่ม
```

### ให้ Examples ของ Pattern ที่ใช้อยู่แล้ว

```
ช่วยเขียน endpoint ใหม่ให้ response ตาม pattern นี้:

ตัวอย่าง success response:
{
  "isSuccess": true,
  "message": "ดำเนินการสำเร็จ",
  "result": { ... },
  "statusCode": 200
}

ตัวอย่าง error response (จาก GlobalExceptionFilter):
{
  "isSuccess": false,
  "message": "ไม่พบสินค้า",
  "statusCode": 404
}
```

### Follow Up Questions

```
จาก ProductService ที่เขียนให้มา:
1. ถ้าต้องการเพิ่ม export Excel ต้องแก้ตรงไหน?
2. ถ้าต้องการ cache ผลลัพธ์ 5 นาทีควรทำยังไง?
3. ช่วยเขียน unit tests สำหรับ GetProductByIdAsync
```

---

## Agent Output เป็น Context

เมื่อ agent ตอบกลับ ให้ใช้ output เป็น context สำหรับ phase ถัดไป:

```
Phase 1 SA output → Phase 2 Backend input (copy entity design + business rules)
Phase 2 Backend output → Phase 3 Frontend input (copy API endpoints + DTO structure)

```

---

## SA Edge Case Analysis

ก่อนเขียน code ให้ SA ช่วยคิด edge cases:

```
[แนบ doc/agents/system-analyst.md]

ช่วยวิเคราะห์ edge cases และ error scenarios สำหรับ {FeatureName}

Scenarios ที่อยากให้คิด:
- {scenario 1 — concurrent access, race condition, etc.}
- {scenario 2 — cascade delete, orphan data}
- {scenario 3 — boundary values, large data}
```

---

## Quick Reference: Full Feature Prompt Chain

```
# Phase 1: Analysis & Design
[แนบ doc/agents/system-analyst.md]
ออกแบบระบบ {FeatureName}
- Requirements: {list requirements}
- ต้องการ: Entity, API, Business Rules, DTOs

# Phase 2: Backend Implementation
[แนบ output จาก Phase 1]
[แนบ doc/agents/backend-expert.md]
สร้าง {FeatureName} Module ตาม design ข้างต้น
ต้องการ: Entity, Repository, DTOs, Manual Mapper, Service, Controller

# Phase 3: Frontend Implementation
[แนบ API design จาก Phase 1]
[แนบ doc/agents/frontend-expert.md]
สร้าง {FeatureName} UI
- API: {paste endpoints}
- Features: {list UI needs}


```

---

## Summary

| สิ่งที่ควรทำ | สิ่งที่ไม่ควรทำ |
|-------------|----------------|
| ระบุ context ชัดเจน (module, layer, tech) | Prompt กว้างเกินไป |
| แบ่งเป็น tasks เล็กๆ (SA → BE → FE → Test) | ขอทั้ง feature ทีเดียว |
| ระบุ requirements + business rules ครบ | สมมติว่า AI รู้ทุกอย่าง |
| ระบุ edge cases และ constraints | สนใจแค่ happy path |
| แนบ agent file + output จาก phase ก่อน | ข้ามขั้น SA |
| ถาม follow-up เพื่อ clarify | รับ code แล้วไม่ review |
| ให้ตัวอย่าง pattern ที่ใช้อยู่แล้ว | ให้ AI เดา convention เอง |
