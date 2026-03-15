# TASK: Shop Settings (ตั้งค่าร้านค้า)

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-13
**วันที่เสร็จ**: 2026-03-13

> สร้าง Module ตั้งค่าร้านค้า — singleton record สำหรับเก็บข้อมูลร้าน, โลโก้, เวลาทำการ, ที่อยู่/ช่องทางติดต่อ, QR Code ชำระเงิน
> เอกสารอ้างอิง: [database-api-reference.md](../architecture/database-api-reference.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- **Singleton pattern** — 1 ร้าน = 1 record (seed ไว้ตั้งแต่ migration) ไม่มี Create/Delete
- **ไฟล์ .png เท่านั้น** — validate ทั้ง Frontend (`accept=".png"` + MIME check) และ Backend (ContentType check)
- **Operating Hours update by DayOfWeek match** — ไม่ delete+recreate (7 records คงที่ seed ไว้)
- **Time fields** — Entity ใช้ `TimeSpan` (SQL `time(7)`), DTO ใช้ `string "HH:mm"`
- **LogoFileId / PaymentQrCodeFileId** — nullable ใน DB (seed ไม่มีไฟล์), แต่ required ในหน้า UI

---

## แผนการทำงาน (แบ่งเป็น Phase)

### Phase 1 — Backend Entity + Migration + Seed ✅

กระทบ: Database schema | ความซับซ้อน: ปานกลาง

#### 1.1 สร้าง Enum `EDayOfWeek` (`POS.Main.Core/Enums/EDayOfWeek.cs`)

**เป้าหมาย:** สร้าง enum Monday=1 ... Sunday=7 (ไม่ใช้ System.DayOfWeek เพราะเริ่ม Sunday=0)

#### 1.2 สร้าง Entity `TbShopSettings` (`POS.Main.Dal/Entities/Admin/TbShopSettings.cs`)

**เป้าหมาย:** Entity inherit BaseEntity, FK → TbFile x2 (Logo + QR Code)

#### 1.3 สร้าง Entity `TbShopOperatingHour` (`POS.Main.Dal/Entities/Admin/TbShopOperatingHour.cs`)

**เป้าหมาย:** Child entity inherit BaseEntity, FK → TbShopSettings, time fields เป็น TimeSpan?

#### 1.4-1.5 สร้าง EntityConfiguration + Seed Data

**เป้าหมาย:** Fluent API config + HasData seed 1 record (ShopSettings) + 7 records (OperatingHour จันทร์-อาทิตย์)

#### 1.6 อัปเดต DbContext (`POSMainContext.cs`)

**เป้าหมาย:** เพิ่ม DbSet + ApplyConfiguration

#### 1.7 เพิ่ม Module + Permission Seed

**เป้าหมาย:** ModuleId=18 "ตั้งค่าร้านค้า" (parent=2), AuthorizeMatrix read(32)+update(33)

#### 1.8 สร้าง Migration

**เป้าหมาย:** `dotnet ef migrations add AddShopSettingsTables` → apply สำเร็จ

---

### Phase 2 — Backend Repository, Service, Controller ✅

กระทบ: Backend API layer | ความซับซ้อน: ปานกลาง

#### 2.1 สร้าง Repository

**เป้าหมาย:** `IShopSettingsRepository` + `ShopSettingsRepository` — `GetWithOperatingHoursAsync()` Include OperatingHours, LogoFile, QrCodeFile, CreatedByEmployee, UpdatedByEmployee

#### 2.2 อัปเดต UnitOfWork

**เป้าหมาย:** เพิ่ม `IShopSettingsRepository ShopSettings` property

#### 2.3 สร้าง Models (DTO)

**เป้าหมาย:** ShopSettingsResponseModel, OperatingHourModel, UpdateShopSettingsRequestModel, ShopSettingsMapper

#### 2.4 สร้าง Service

**เป้าหมาย:** `IShopSettingsService` + `ShopSettingsService` — Get + Update (upsert operating hours by DayOfWeek match)

#### 2.5 เพิ่ม Permissions

**เป้าหมาย:** `Permissions.ShopSettings { Read, Update }`

#### 2.6 สร้าง Controller

**เป้าหมาย:** `ShopSettingsController` — GET + PUT `[FromForm]` + `IFormFile?` x2

#### 2.7-2.8 Register DI + Build

**เป้าหมาย:** `AddScoped<IShopSettingsService, ShopSettingsService>()` → build สำเร็จ

---

### Phase 3 — Frontend Component + Routing ✅

กระทบ: Admin module UI | ความซับซ้อน: สูง

#### 3.1 gen-api

**เป้าหมาย:** `npm run gen-api` → สร้าง TypeScript service + models

#### 3.2-3.3 สร้าง ShopSettingsComponent (TS + HTML)

**เป้าหมาย:**
- Reactive Form + FormArray (7 วัน operating hours)
- Signals: isLoading, isSaving, logoPreview, qrCodePreview, selectedLogoFile, selectedQrCodeFile, settings
- Breadcrumb buttons: "ย้อนกลับ" + "บันทึก"
- File upload (.png only) + preview
- 5 cards: ข้อมูลร้านค้า, โลโก้, เวลาทำการ, ที่อยู่/ช่องทางติดต่อ, QR Code
- Footer: audit info (ผู้สร้าง/วันที่สร้าง, ผู้อัปเดต/วันที่อัปเดต)
- Operating hours: toggle เปิด/ปิดรายวัน, toggle 2 ช่วงเวลา, time inputs
- Flatten OperatingHours array for `[FromForm]` binding

#### 3.4 อัปเดต Routing (`admin-routing.module.ts`)

**เป้าหมาย:** เพิ่ม route `shop-settings` (หน้าเดียว ไม่มี children)

#### 3.5 อัปเดต Module (`admin.module.ts`)

**เป้าหมาย:** declare `ShopSettingsComponent`

#### 3.6 อัปเดต Sidebar (`side-bar.component.ts`)

**เป้าหมาย:** เพิ่ม menu "ตั้งค่าร้านค้า" ใน Admin Setting children, icon: `web-setting`, permission: `shop-settings.read`

---

### Phase 4 — เอกสาร ✅

#### 4.1 สร้าง TASK file (ไฟล์นี้)

#### 4.2 อัปเดต database-api-reference.md

**เป้าหมาย:** เพิ่ม TbShopSettings, TbShopOperatingHour, ShopSettings API endpoints

---

## ไฟล์ที่สร้าง/แก้ไข

### ไฟล์ใหม่ (16 ไฟล์)

**Backend (14):**
1. `POS.Main.Core/Enums/EDayOfWeek.cs`
2. `POS.Main.Dal/Entities/Admin/TbShopSettings.cs`
3. `POS.Main.Dal/Entities/Admin/TbShopOperatingHour.cs`
4. `POS.Main.Dal/EntityConfigurations/TbShopSettingsConfiguration.cs`
5. `POS.Main.Dal/EntityConfigurations/TbShopOperatingHourConfiguration.cs`
6. `POS.Main.Repositories/Interfaces/IShopSettingsRepository.cs`
7. `POS.Main.Repositories/Implementations/ShopSettingsRepository.cs`
8. `POS.Main.Business.Admin/Models/ShopSettings/ShopSettingsResponseModel.cs`
9. `POS.Main.Business.Admin/Models/ShopSettings/UpdateShopSettingsRequestModel.cs`
10. `POS.Main.Business.Admin/Models/ShopSettings/OperatingHourModel.cs`
11. `POS.Main.Business.Admin/Models/ShopSettings/ShopSettingsMapper.cs`
12. `POS.Main.Business.Admin/Interfaces/IShopSettingsService.cs`
13. `POS.Main.Business.Admin/Services/ShopSettingsService.cs`
14. `RBMS.POS.WebAPI/Controllers/ShopSettingsController.cs`

**Frontend (2):**
15. `features/admin/pages/shop-settings/shop-settings.component.ts`
16. `features/admin/pages/shop-settings/shop-settings.component.html`

### ไฟล์ที่แก้ไข (11 ไฟล์)

**Backend (7):** POSMainContext, TbmModuleConfiguration, TbmAuthorizeMatrixConfiguration, IUnitOfWork, UnitOfWork, Permissions, Program.cs

**Frontend (4):** admin-routing.module.ts, admin.module.ts, side-bar.component.ts, field-error.component.ts (เพิ่ม pattern error)

---

## หมายเหตุ

- **field-error.component.ts** — เพิ่ม `pattern` error handling สำหรับ taxId validation (เลข 13 หลัก)
- **FormData array flattening** — ng-openapi-gen RequestBuilder ไม่ support nested object array ใน multipart/form-data ที่ ASP.NET Core ต้องการ จึง flatten เป็น `OperatingHours[0].DayOfWeek` format ใน component
