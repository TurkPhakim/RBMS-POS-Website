# TASK: File Management System (Backend)

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-10
**วันที่เสร็จ**: 2026-03-10

> เปลี่ยนระบบจัดเก็บรูปภาพจาก Base64 (NVARCHAR(MAX)) เป็น S3-compatible storage (MinIO) + metadata ใน DB (TbFile)
> เอกสารอ้างอิง: [file-management.md](../architecture/file-management.md)

---

## กฎที่ยึดถือตลอดการทำ Task

- **Controller orchestrates file upload** — Controller inject ทั้ง IFileService + module service, upload file → get FileId → pass ไป Service
- **ไม่ cross-reference ระหว่าง Business projects** — เฉพาะ Business.Admin ที่มี IFormFile dependency (FrameworkReference)
- **Service รับแค่ `int? imageFileId`** — ไม่ต้องรู้จัก IFormFile
- **Soft delete เท่านั้น** — ไฟล์ใน S3 ไม่ลบ, แค่ set DeleteFlag = true ใน DB
- **ลบข้อมูล Base64 เดิมได้** — ผู้ใช้อนุมัติแล้ว ไม่ต้อง data migration

---

## แผนการทำงาน

### Phase 1 — Foundation (สร้าง Infrastructure ทั้งหมด ไม่แตะโค้ดเก่า) ✅

กระทบ: ทุก layer | ความซับซ้อน: สูง

#### 1.1 Entity + Configuration

**ปัญหาปัจจุบัน:** ไม่มี entity สำหรับเก็บ metadata ไฟล์

**เป้าหมาย:** สร้าง TbFile entity + Fluent API config

**ไฟล์ที่สร้าง:**
- `POS.Main.Dal/Entities/Common/TbFile.cs` — FileId, FileName, MimeType, FileExtension, FileSize, S3Key
- `POS.Main.Dal/EntityConfigurations/TbFileConfiguration.cs` — Unique index บน S3Key, index บน DeleteFlag

#### 1.2 Repository + UnitOfWork

**ปัญหาปัจจุบัน:** ไม่มี repository สำหรับ TbFile

**เป้าหมาย:** สร้าง IFileRepository + FileRepository, เพิ่มใน UnitOfWork

**ไฟล์ที่สร้าง/แก้:**
- `POS.Main.Repositories/Interfaces/IFileRepository.cs`
- `POS.Main.Repositories/Implementations/FileRepository.cs`
- `POS.Main.Repositories/UnitOfWork/IUnitOfWork.cs` — เพิ่ม `IFileRepository Files`
- `POS.Main.Repositories/UnitOfWork/UnitOfWork.cs` — Lazy init

#### 1.3 S3 Storage Service

**ปัญหาปัจจุบัน:** ไม่มี infrastructure สำหรับ upload/download ไฟล์

**เป้าหมาย:** สร้าง IS3StorageService + S3StorageService ใช้ AWSSDK.S3

**ไฟล์ที่สร้าง:**
- `Business.Admin/Interfaces/IS3StorageService.cs`
- `Business.Admin/Services/S3StorageService.cs` — S3 key pattern: `{yyyy}/{MM}/{Guid}_{fileName}`
- `Business.Admin/Models/Files/FileDownloadResult.cs`

#### 1.4 File Service (Business Logic)

**ปัญหาปัจจุบัน:** ไม่มี business logic สำหรับจัดการไฟล์

**เป้าหมาย:** สร้าง IFileService + FileService (validate → upload S3 → save DB)

**ไฟล์ที่สร้าง:**
- `Business.Admin/Interfaces/IFileService.cs`
- `Business.Admin/Services/FileService.cs` — validate 10MB max, allowed types (JPEG, PNG, WebP, PDF)
- `Business.Admin/Models/Files/FileResponseModel.cs`
- `Business.Admin/Models/Files/FileMapper.cs`

#### 1.5 Controller + Registration

**ไฟล์ที่สร้าง/แก้:**
- `RBMS.POS.WebAPI/Controllers/FileController.cs` — GET /api/admin/file/{id} → download
- `POS.Main.Business.Admin.csproj` — เพิ่ม AWSSDK.S3 v4.0.18.8 + FrameworkReference
- `appsettings.json` — เพิ่ม S3 config section
- `Program.cs` — Register IAmazonS3, IS3StorageService, IFileService
- `POSMainContext.cs` — เพิ่ม DbSet<TbFile> + ApplyConfiguration

---

### Phase 2 — Menu Module Migration ✅

กระทบ: Menu module ทั้ง chain | ความซับซ้อน: ปานกลาง

#### 2.1 Entity + Config

**ปัญหาปัจจุบัน:** `TbMenu.ImageUrl` เก็บ Base64 string (NVARCHAR(MAX))

**เป้าหมาย:** เปลี่ยนเป็น `ImageFileId` (int?) + FK → TbFile

**Class เก่า → ใหม่:**
```
TbMenu.ImageUrl (string?) → TbMenu.ImageFileId (int?) + TbMenu.ImageFile (virtual TbFile?)
TbMenuConfiguration: ImageUrl NVARCHAR(MAX) → HasOne(ImageFile).WithMany().HasForeignKey(ImageFileId)
```

#### 2.2 DTOs + Mapper

**ปัญหาปัจจุบัน:** Request/Response models มี ImageUrl field

**เป้าหมาย:** ลบ ImageUrl, เพิ่ม ImageFileId + ImageFileName ใน Response

**ไฟล์ที่แก้:**
- `CreateMenuRequestModel.cs` — ลบ ImageUrl
- `UpdateMenuRequestModel.cs` — ลบ ImageUrl
- `MenuResponseModel.cs` — ลบ ImageUrl, เพิ่ม ImageFileId + ImageFileName
- `MenuMapper.cs` — อัพเดต mapping ทั้ง ToEntity, UpdateEntity, ToResponse

#### 2.3 Service + Controller

**ปัญหาปัจจุบัน:** Service ไม่รับ imageFileId, Controller ใช้ [FromBody]

**เป้าหมาย:** Service รับ `int? imageFileId`, Controller ใช้ [FromForm] + IFormFile + inject IFileService

**ไฟล์ที่แก้:**
- `IMenuService.cs` — เพิ่ม `int? imageFileId` param ใน Create/Update
- `MenuService.cs` — Handle imageFileId, soft-delete old image เมื่อเปลี่ยนรูป
- `MenusController.cs` — [FromForm], IFormFile?, upload logic, inject IFileService

---

### Phase 3 — Employee Module Migration ✅

กระทบ: Employee module ทั้ง chain | ความซับซ้อน: ปานกลาง

เหมือน Phase 2 แต่สำหรับ Employee:

**ไฟล์ที่แก้ (9 ไฟล์):**
- `TbEmployee.cs` — ImageUrl → ImageFileId + ImageFile
- `TbEmployeeConfiguration.cs` — FK relationship
- `CreateEmployeeRequestModel.cs` — ลบ ImageUrl
- `UpdateEmployeeRequestModel.cs` — ลบ ImageUrl
- `EmployeeResponseModel.cs` — เพิ่ม ImageFileId + ImageFileName
- `EmployeeMapper.cs` — อัพเดต mapping
- `IEmployeeService.cs` — เพิ่ม imageFileId params
- `EmployeeService.cs` — Handle imageFileId + old image soft-delete
- `HumanResourceController.cs` — [FromForm], IFormFile?, inject IFileService
- `EmployeeRepository.cs` — เพิ่ม Include(ImageFile) ใน queries

---

### Phase 4 — Migration + Database Update ✅

**Migration:** `AddFileManagementSystem` (20260310151358)

**สิ่งที่ Migration ทำ:**
- สร้าง TbFiles table (FileId PK, FileName, MimeType, FileExtension, FileSize, S3Key + audit fields)
- ลบ ImageUrl column จาก TbMenus + TbEmployees
- เพิ่ม ImageFileId (int?) FK ใน TbMenus + TbEmployees
- Unique index บน S3Key
- FK relationships + indexes ทั้งหมด

---

## หมายเหตุ

### การใช้งานฝั่ง Frontend (ยังไม่ทำ)

หลัง `npm run gen-api` จะได้ generated client ใหม่ที่รองรับ multipart/form-data:

1. **Upload**: ส่ง `FormData` object แทน JSON
2. **แสดงรูป**: `<img [src]="'/api/admin/file/' + item.imageFileId">`
3. ไม่ต้องสร้าง service ใหม่ — ng-openapi-gen generate ให้อัตโนมัติ

### Production Deployment

- Dev: MinIO (Docker) — config อยู่ใน `appsettings.json` (S3.ServiceUrl, AccessKey, SecretKey)
- Production: เปลี่ยน config ไป AWS S3 หรือ MinIO บน Server ได้โดยไม่ต้องแก้โค้ด
