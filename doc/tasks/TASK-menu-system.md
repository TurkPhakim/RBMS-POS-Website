# TASK: ระบบจัดการเมนูอาหารใหม่ (Backend)

**สถานะ**: COMPLETED
**วันที่เริ่ม**: 2026-03-17
**วันที่เสร็จ**: 2026-03-17

> Revise Menu module ทั้งหมด — ลบโค้ดเก่า สร้าง Entity/Migration ใหม่ สร้าง Backend module ทีละ sub-module
> เอกสารอ้างอิง: [REQ-menu-system.md](../requirements/REQ-menu-system.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- TbOptionGroup, TbOptionItem, TbMenuOptionGroup ใช้ **hard delete** (ไม่ใช่ soft delete)
- TbMenuSubCategory, TbMenu ใช้ **soft delete** ปกติ (BaseEntity + DeleteFlag)
- Option Group Update ใช้ **Delta Pattern** (compare items: new→insert, exist→update, missing→delete)
- ทุก Entity ต้อง inherit `BaseEntity` — ห้าม define audit fields ซ้ำ
- ทุก Controller ต้อง inherit `BaseController` — ใช้ `Success()` / `ToActionResult()`
- ทุก endpoint ต้องมี `[PermissionAuthorize]`
- ห้ามใช้ AutoMapper — ใช้ manual mapper เสมอ

---

## Dependencies / สิ่งที่ต้องเตรียม

- Docker + SQL Server ต้องรันอยู่ (สำหรับ apply migration)
- ไม่มี dependency ค้าง — พร้อมเริ่มได้เลย

---

## แผนการทำงาน

### Phase 1 — Database: Entity + Enum + Configuration + Migration ✅

กระทบ: Data layer ทั้งหมด | ความซับซ้อน: สูง

#### 1.1 แก้ไข EMenuCategory enum (`POS.Main.Core/Enums/EMenuCategory.cs`)

**ปัญหาปัจจุบัน:** มีแค่ 2 ค่า (Food=1, Beverage=2)
**เป้าหมาย:** เพิ่ม Dessert=3

#### 1.2 สร้าง EMenuTag enum (`POS.Main.Core/Enums/EMenuTag.cs`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** `[Flags]` enum: None=0, Recommended=1, Seasonal=2, SlowPreparation=4

#### 1.3 สร้าง Entity ใหม่ 4 ตัว (`POS.Main.Dal/Entities/Menu/`)

**ปัญหาปัจจุบัน:** มีแค่ TbMenu entity เดียว
**เป้าหมาย:** สร้าง TbMenuSubCategory, TbOptionGroup, TbOptionItem, TbMenuOptionGroup

#### 1.4 แก้ไข TbMenu entity (`POS.Main.Dal/Entities/Menu/TbMenu.cs`)

**ปัญหาปัจจุบัน:** ใช้ Category enum, มี IsActive แยก
**เป้าหมาย:** ลบ Category/IsActive, เพิ่ม SubCategoryId(FK), CostPrice, IsAvailablePeriod1/2, Tags, Allergens, CaloriesPerServing, IsPinned

#### 1.5 สร้าง/แก้ EntityConfiguration (`POS.Main.Dal/EntityConfigurations/`)

**ปัญหาปัจจุบัน:** มีแค่ TbMenuConfiguration
**เป้าหมาย:** แก้ TbMenuConfiguration + สร้าง 4 configurations ใหม่

#### 1.6 อัพเดต POSMainContext (`POS.Main.Dal/POSMainContext.cs`)

**ปัญหาปัจจุบัน:** มีแค่ DbSet<TbMenu>
**เป้าหมาย:** เพิ่ม DbSets ใหม่ 4 ตัว + ApplyConfiguration + ยกเว้น global query filter สำหรับ hard delete entities

#### 1.7 อัพเดต Permissions.cs (`POS.Main.Core/Constants/Permissions.cs`)

**ปัญหาปัจจุบัน:** มีแค่ Menu class (menu-item.*)
**เป้าหมาย:** เพิ่ม MenuCategory (menu-category.*) + MenuOption (menu-option.*)

#### 1.8 สร้าง Migration

**ปัญหาปัจจุบัน:** Schema เก่า
**เป้าหมาย:** Migration ที่ alter TbMenu, สร้างตารางใหม่ 4 ตาราง, migrate data เก่า, seed permissions
- Module 20: menu-category (child of 4)
- Module 21: menu-option (child of 4)
- AuthorizeMatrix 36-43
- Admin position access

---

### Phase 2 — Cleanup: ลบโค้ด Menu เก่า ✅

กระทบ: Backend + Frontend | ความซับซ้อน: ต่ำ

#### 2.1 ลบ Backend files

**ปัญหาปัจจุบัน:** Service/Repository/Controller/Models เก่าไม่ตรงกับ schema ใหม่
**เป้าหมาย:** ลบทั้งหมด 9 ไฟล์ + แก้ UnitOfWork + Program.cs

#### 2.2 ลบ Frontend module เก่า

**ปัญหาปัจจุบัน:** Frontend module เก่า reference API เก่า
**เป้าหมาย:** ลบ features/menu/ + shared/dropdowns/menu-category-dropdown/ + แก้ routing

---

### Phase 3 — Backend: SubCategory Module ✅

กระทบ: Menu Categories API | ความซับซ้อน: ปานกลาง

#### 3.1 Repository (`POS.Main.Repositories/`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** IMenuSubCategoryRepository + MenuSubCategoryRepository (GetByCategoryType, GetByIdWithMenus, UpdateSortOrder)

#### 3.2 Models & Mapper (`POS.Main.Business.Menu/Models/SubCategory/`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** Create/Update Request, Response, SortOrder Request, Mapper

#### 3.3 Service (`POS.Main.Business.Menu/`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** IMenuSubCategoryService + MenuSubCategoryService (CRUD + GetByCategoryType + UpdateSortOrder)

#### 3.4 Controller (`RBMS.POS.WebAPI/Controllers/MenuCategoriesController.cs`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** 7 endpoints ตาม REQ Section 6.1

#### 3.5 Register (UnitOfWork + Program.cs)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** ลงทะเบียน Repository + Service

---

### Phase 4 — Backend: Menu Items Module ✅

กระทบ: Menu Items API | ความซับซ้อน: สูง

#### 4.1 Repository (`POS.Main.Repositories/`)

**ปัญหาปัจจุบัน:** Repository เก่าถูกลบใน Phase 2
**เป้าหมาย:** IMenuRepository + MenuRepository ใหม่ (GetMenusQuery with filters, GetByIdWithDetails)

#### 4.2 Models & Mapper (`POS.Main.Business.Menu/Models/MenuItem/`)

**ปัญหาปัจจุบัน:** Models เก่าถูกลบใน Phase 2
**เป้าหมาย:** Create/Update Request (พร้อม OptionGroupIds), Response, Mapper

#### 4.3 Service (`POS.Main.Business.Menu/`)

**ปัญหาปัจจุบัน:** Service เก่าถูกลบใน Phase 2
**เป้าหมาย:** IMenuItemService + MenuItemService (CRUD + pagination + filters + file upload + OptionGroup linking)

#### 4.4 Controller (`RBMS.POS.WebAPI/Controllers/MenuItemsController.cs`)

**ปัญหาปัจจุบัน:** Controller เก่าถูกลบใน Phase 2
**เป้าหมาย:** 5 endpoints ตาม REQ Section 6.2 ([FromForm] + IFormFile)

#### 4.5 Register (UnitOfWork + Program.cs)

**ปัญหาปัจจุบัน:** Registration เก่าถูกลบใน Phase 2
**เป้าหมาย:** ลงทะเบียน Repository + Service

---

### Phase 5 — Backend: Option Groups Module ✅

กระทบ: Option Groups API | ความซับซ้อน: สูง (Delta Pattern)

#### 5.1 Repository (`POS.Main.Repositories/`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** IOptionGroupRepository + OptionGroupRepository (GetOptionGroupsQuery, GetByIdWithDetails, HasLinkedMenus)

#### 5.2 Models & Mapper (`POS.Main.Business.Menu/Models/OptionGroup/`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** Create/Update Request (พร้อม nested OptionItems array), Response, Mapper

#### 5.3 Service (`POS.Main.Business.Menu/`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** IOptionGroupService + OptionGroupService (CRUD + Delta Pattern update + hard delete)

#### 5.4 Controller (`RBMS.POS.WebAPI/Controllers/MenuOptionsController.cs`)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** 5 endpoints ตาม REQ Section 6.3 (DELETE = hard delete)

#### 5.5 Register (UnitOfWork + Program.cs)

**ปัญหาปัจจุบัน:** ไม่มี
**เป้าหมาย:** ลงทะเบียน Repository + Service

---

### Phase 6 — อัพเดตเอกสาร ✅

กระทบ: Documentation | ความซับซ้อน: ต่ำ

#### 6.1 อัพเดต database-api-reference.md

**ปัญหาปัจจุบัน:** ยังเป็นข้อมูล Menu เก่า
**เป้าหมาย:** อัพเดตให้ตรงกับ Entity/API ใหม่ทั้งหมด

---

### Phase 7 — gen-api + ตรวจสอบ

กระทบ: Frontend Generated API | ความซับซ้อน: ต่ำ

#### 7.1 Restart Backend + gen-api

**ปัญหาปัจจุบัน:** Generated API ยังเป็นของเก่า
**เป้าหมาย:** Restart Backend → บอกผู้ใช้รัน gen-api → ตรวจสอบ generated files

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1  Database layer       ← ต้องทำก่อนเพราะทุกอย่างขึ้นกับ schema
2. Phase 2  Cleanup              ← ลบโค้ดเก่าก่อนสร้างใหม่ ป้องกัน conflict
3. Phase 3  SubCategory module   ← Menu Items ขึ้นกับ SubCategory (FK)
4. Phase 4  Menu Items module    ← Option Groups ต้อง link กับ Menu
5. Phase 5  Option Groups module ← สร้างหลังสุดเพราะต้อง link กับ Menu
6. Phase 6  เอกสาร               ← อัพเดตหลังโค้ดเสร็จ
7. Phase 7  gen-api              ← สุดท้ายเพราะต้อง Backend เสร็จก่อน
```

---

## หมายเหตุ

- Frontend ยังไม่ทำใน Task นี้ — จะแยกเป็น Task ใหม่หลัง gen-api เสร็จ
- ข้อมูลเมนูเดิมในระบบจะถูก migrate ไปหมวดหมู่ "ทั่วไป" อัตโนมัติ
- Permission ใหม่ที่ seed จะปรากฏในหน้าจัดการตำแหน่งอัตโนมัติ (ไม่ต้องแก้ UI)
