# TASK: ระบบจัดการเมนูอาหาร (Frontend)

**สถานะ**: COMPLETED
**วันที่เริ่ม**: 2026-03-17
**วันที่เสร็จ**: 2026-03-18

> สร้าง Frontend Menu module ใหม่ทั้งหมด — ลบ module เก่า, สร้าง 6 pages + 1 dialog + dropdowns + sidebar
> เอกสารอ้างอิง: [REQ-menu-system.md](../requirements/REQ-menu-system.md) — Section 7
> Backend Task: [TASK-menu-system.md](./TASK-menu-system.md) (COMPLETED)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- standalone: false ทุกตัว, declare ใน NgModule
- ใช้ constructor injection เสมอ (ไม่ใช้ inject())
- ใช้ Angular Signals (signal<T>()) สำหรับ state — ห้าม OnPush
- ใช้ generated models/services จาก @core/api/ — ห้ามสร้าง Model/Type เอง
- ใช้ `@if/@for/@switch` แทน *ngIf/*ngFor
- Search: Enter key trigger เท่านั้น
- Form Validation: `markFormDirty()` (ห้าม markAllAsTouched)
- ปุ่ม Breadcrumb: KEY_BTN_BACK + KEY_BTN_SAVE const, clearButtons() ใน ngOnDestroy
- Dialog: แยก component, ใช้ DynamicDialog, card-dialog styleClass
- Tailwind CSS tokens เท่านั้น — ห้าม raw colors
- CDK DragDrop สำหรับ drag & drop ตาราง

---

## แผนการทำงาน

### Phase -1 — Backend: เพิ่ม 2 API endpoints + gen-api ใหม่

กระทบ: Backend API | ความซับซ้อน: ต่ำ

#### -1.1 เพิ่ม endpoint GET /api/menu/options (OptionGroup list all)

**ปัญหาปัจจุบัน:** ต้องส่ง categoryType เสมอ → filter "ทั้งหมด" ทำไม่ได้
**เป้าหมาย:** endpoint ใหม่ที่ categoryType เป็น optional query param
**ไฟล์:** IOptionGroupService.cs, OptionGroupService.cs, MenuOptionsController.cs

#### -1.2 เพิ่ม period filter ใน GET /api/menu/items

**ปัญหาปัจจุบัน:** ไม่มี period query param
**เป้าหมาย:** เพิ่ม `string? period` param (period1/period2/both)
**ไฟล์:** IMenuService.cs, MenuService.cs, MenuItemsController.cs

#### -1.3 Build + Restart + gen-api

---

### Phase 0 — เตรียมพร้อม: CDK + ลบ module เก่า + อัพเดต dropdown

กระทบ: Frontend dependencies + cleanup | ความซับซ้อน: ต่ำ

#### 0.1 ติดตั้ง @angular/cdk

**เป้าหมาย:** `npm install @angular/cdk` สำหรับ DragDropModule

#### 0.2 ลบ menu module เก่า

**ปัญหาปัจจุบัน:** module เก่ายังอยู่ ใช้ API เก่า
**เป้าหมาย:** ลบ 6 ไฟล์ใน features/menu/

#### 0.3 อัพเดต MenuCategoryDropdown + SharedModule

**เป้าหมาย:** เพิ่ม Dessert=3 ใน dropdown + เพิ่ม DragDropModule ใน SharedModule

---

### Phase 1 — Routing + Module + Sidebar + Icons + Skeletons

กระทบ: Module structure + navigation | ความซับซ้อน: ปานกลาง

#### 1.1 สร้าง SVG Icons ใหม่ 4 ไฟล์

**เป้าหมาย:** dessert.svg, option-extra.svg, star.svg, pin.svg

#### 1.2 สร้าง MenuRoutingModule + MenuModule

**เป้าหมาย:** Routes ครบทุก path ตาม REQ 7.2 + Module declare ทุก component

#### 1.3 อัพเดต Sidebar

**เป้าหมาย:** 5 children ใต้ "เมนู" (หมวดหมู่, อาหาร, เครื่องดื่ม, ของหวาน, ตัวเลือกเสริม)

#### 1.4 สร้าง Component Skeletons

**เป้าหมาย:** 6 pages + 1 dialog skeleton → navigate ได้ทุก route

---

### Phase 2 — SubCategory (List + Manage)

กระทบ: หมวดหมู่เมนู | ความซับซ้อน: สูง (tabs + drag & drop)

#### 2.1 SubCategoryListComponent

**เป้าหมาย:** 3 tabs + ตาราง + drag & drop sort order + breadcrumb button เปลี่ยนตาม tab

#### 2.2 SubCategoryManageComponent

**เป้าหมาย:** Form + เมนูในหมวดหมู่ (edit mode)

---

### Phase 3 — SubCategory Dropdown + OptionGroup (List + Manage)

กระทบ: Shared dropdown + ตัวเลือกเสริม | ความซับซ้อน: สูง (inline edit + delta pattern)

#### 3.1 SubCategoryDropdownComponent

**เป้าหมาย:** Dropdown ตาม categoryType + reload เมื่อเปลี่ยน

#### 3.2 OptionGroupListComponent

**เป้าหมาย:** ตาราง + filters (categoryType, status, search) + server-side pagination + hard delete

#### 3.3 OptionGroupManageComponent

**เป้าหมาย:** Form + inline edit table + CDK DragDrop + เมนูที่ใช้กลุ่ม (edit mode)

---

### Phase 4 — Menu List (shared 3 types)

กระทบ: เมนู List | ความซับซ้อน: ปานกลาง (server-side pagination + reuse)

#### 4.1 MenuListComponent

**เป้าหมาย:** ตาราง shared 3 types + server-side pagination + filters (search, subcategory, period, status)

---

### Phase 5 — SelectOptionGroup Dialog + Menu Manage

กระทบ: เมนู Manage | ความซับซ้อน: สูงมาก (7 cards + multipart + tags bitmask + period logic)

#### 5.1 SelectOptionGroupDialogComponent

**เป้าหมาย:** Dialog เลือก OptionGroup + filter + exclude ที่เลือกแล้ว

#### 5.2 MenuManageComponent

**เป้าหมาย:** 7 cards (ข้อมูล, รูป, ช่วงเวลา, Tags, เพิ่มเติม, ตัวเลือกเสริม, สถานะ) + multipart submit

---

### Phase 6 — อัพเดตเอกสาร

กระทบ: Documentation | ความซับซ้อน: ต่ำ

---

## ลำดับที่แนะนำในการทำ

```
Phase -1 → Backend: เพิ่ม 2 API endpoints + gen-api ใหม่
Phase 0  → ติดตั้ง CDK + ลบ module เก่า + อัพเดต dropdown/shared
Phase 1  → Routing + Module + Sidebar + Icons + Skeletons
Phase 2  → SubCategory (List + Manage)
Phase 3  → SubCategory Dropdown + OptionGroup (List + Manage)
Phase 4  → Menu List (shared 3 types, server-side pagination + period filter)
Phase 5  → SelectOptionGroup Dialog + Menu Manage (7 cards)
Phase 6  → อัพเดตเอกสาร
```

---

## หมายเหตุ

- CDK DragDrop ต้องทดสอบกับ PrimeNG p-table ว่า directive ทำงานร่วมกันได้ — ถ้าไม่ได้อาจต้องใช้ plain `<table>` สำหรับตารางที่ต้อง drag
- MenuManageComponent เป็น component ที่ซับซ้อนที่สุด (7 cards) — ควรเขียนทีละ card แล้วทดสอบ
- Shop Settings API ต้องเรียกตอน init ของ MenuManage + MenuList เพื่อเช็ค hasTwoPeriods
