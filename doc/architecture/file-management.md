# สถาปัตยกรรมการจัดการไฟล์ — RBMS-POS

> อัพเดตล่าสุด: 2026-03-16

---

## ภาพรวม

ระบบจัดการไฟล์กลาง (รูปภาพ + เอกสาร) สำหรับทั้งโปรเจค

**หลักการ:**
- **Metadata** เก็บใน Database (ชื่อไฟล์, ขนาด, MIME type, S3 Key)
- **ไฟล์จริง** เก็บใน S3-compatible storage (MinIO / AWS S3)
- **Soft Delete** เป็น default (ตาม BaseEntity) — ไฟล์ใน S3 ยังอยู่
- Entity อื่นเชื่อมไป TbFile ผ่าน FK (`ImageFileId`, `DocumentFileId` ฯลฯ)

**สถานะ:** ✅ Implement เสร็จแล้ว — TbFile + S3StorageService + FileService + FileController ใช้งานได้จริง

---

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│ Controller Layer                                           │
│  FileController         — GET /file/{id} (download)       │
│  MenusController        — POST [FromForm] (upload + data) │
│  HumanResourceController— POST [FromForm] (upload + data) │
├───────────────────────────────────────────────────────────┤
│ Service Layer                                              │
│  FileService            — Upload / Download / Delete       │
│  MenuService            — เรียก FileService สำหรับรูป     │
│  EmployeeService        — เรียก FileService สำหรับรูป     │
├───────────────────────────────────────────────────────────┤
│ Repository Layer                                           │
│  FileRepository         — DB operations (metadata only)    │
├───────────────────────────────────────────────────────────┤
│ Infrastructure                                             │
│  S3StorageService       — Raw S3 (upload/download/delete)  │
└───────────────────────────────────────────────────────────┘
```

**กฎ:**
- **Repository ทำแค่ DB** — ไม่ inject S3Service เข้า Repository
- **FileService** orchestrate ทั้ง S3 + Repository ผ่าน UnitOfWork
- **S3StorageService** เป็น infrastructure service — inject ตรงเข้า FileService

---

## TbFile Entity

### ออกแบบตาราง

```csharp
// POS.Main.Dal/Entities/Common/TbFile.cs
namespace POS.Main.Dal.Entities;

public class TbFile : BaseEntity
{
    public int FileId { get; set; }
    public string FileName { get; set; } = string.Empty;     // ชื่อไฟล์ต้นฉบับ
    public string MimeType { get; set; } = string.Empty;     // image/jpeg, application/pdf
    public string FileExtension { get; set; } = string.Empty; // jpg, pdf (ไม่มีจุด)
    public long FileSize { get; set; }                        // bytes
    public string S3Key { get; set; } = string.Empty;         // 2026/03/{guid}_filename.jpg
}
```

### Entity Configuration

```csharp
// POS.Main.Dal/EntityConfigurations/TbFileConfiguration.cs
public class TbFileConfiguration : IEntityTypeConfiguration<TbFile>
{
    public void Configure(EntityTypeBuilder<TbFile> builder)
    {
        builder.ToTable("TbFiles");
        builder.HasKey(x => x.FileId);

        builder.Property(x => x.FileName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.MimeType).IsRequired().HasMaxLength(100);
        builder.Property(x => x.FileExtension).IsRequired().HasMaxLength(20);
        builder.Property(x => x.FileSize).IsRequired();
        builder.Property(x => x.S3Key).IsRequired().HasMaxLength(500);

        builder.HasIndex(x => x.S3Key).IsUnique();
        builder.HasIndex(x => x.DeleteFlag);
    }
}
```

### ER Diagram — ความสัมพันธ์กับ Entity อื่น

```
TbFile (ตารางกลาง)
  ├── 1:N ←── TbMenu.ImageFileId (FK, optional)
  ├── 1:N ←── TbEmployee.ImageFileId (FK, optional)
  ├── 1:N ←── TbShopSettings.LogoFileId (FK, optional)
  ├── 1:N ←── TbShopSettings.PaymentQrCodeFileId (FK, optional)
  └── (อนาคต) 1:N ←── TbOrder.ReceiptFileId, TbProduct.ImageFileId ฯลฯ
```

**หลักการเชื่อมความสัมพันธ์:**
- Entity ที่ต้องการไฟล์ เพิ่ม FK column → `{Purpose}FileId` (เช่น `ImageFileId`)
- Navigation property → `{Purpose}File` (เช่น `ImageFile`)
- **1 TbFile : N Entity references** — ไฟล์เดียวสามารถถูกอ้างอิงจากหลาย Entity ได้ (แต่ปกติ 1:1)
- OnDelete = `Restrict` — ห้ามลบ TbFile ถ้ายังมี Entity อ้างอิงอยู่

### การเปลี่ยนแปลง Entity ที่มีอยู่

#### TbMenu — เปลี่ยน ImageUrl → ImageFileId

```csharp
// ก่อน
public string? ImageUrl { get; set; }              // Base64 string

// หลัง
public int? ImageFileId { get; set; }              // FK → TbFile
public virtual TbFile? ImageFile { get; set; }     // Navigation property
```

#### TbEmployee — เปลี่ยน ImageUrl → ImageFileId

```csharp
// ก่อน
public string? ImageUrl { get; set; }              // Base64 string

// หลัง
public int? ImageFileId { get; set; }              // FK → TbFile
public virtual TbFile? ImageFile { get; set; }     // Navigation property
```

#### Fluent API Configuration (ทั้ง 2 Entity)

```csharp
// TbMenuConfiguration.cs — เพิ่ม
builder.HasOne(x => x.ImageFile)
    .WithMany()
    .HasForeignKey(x => x.ImageFileId)
    .OnDelete(DeleteBehavior.Restrict)
    .IsRequired(false);

builder.HasIndex(x => x.ImageFileId);
```

---

## S3 Key Pattern

```
{YYYY}/{MM}/{GUID}_{originalFileName}
  │      │      │           │
  │      │      │           └── ชื่อไฟล์ต้นฉบับ (อ่านง่าย)
  │      │      └────────────── GUID ป้องกันชื่อซ้ำ
  │      └───────────────────── เดือน (แยกโฟลเดอร์)
  └──────────────────────────── ปี (แยกโฟลเดอร์)

ตัวอย่าง: 2026/03/a1b2c3d4e5f6a7b8_pad-thai.jpg
```

---

## ไฟล์ที่เกี่ยวข้อง

### ไฟล์หลัก

| # | ไฟล์ | หน้าที่ |
|---|------|--------|
| 1 | `POS.Main.Dal/Entities/Common/TbFile.cs` | Entity เก็บ metadata |
| 2 | `POS.Main.Dal/EntityConfigurations/TbFileConfiguration.cs` | Fluent API config |
| 3 | `POS.Main.Repositories/Interfaces/IFileRepository.cs` | Repository interface |
| 4 | `POS.Main.Repositories/Implementations/FileRepository.cs` | Repository implementation |
| 5 | `POS.Main.Business.Admin/Interfaces/IS3StorageService.cs` | S3 operations interface |
| 6 | `POS.Main.Business.Admin/Services/S3StorageService.cs` | S3 implementation (MinIO/AWS) |
| 7 | `POS.Main.Business.Admin/Interfaces/IFileService.cs` | File business logic interface |
| 8 | `POS.Main.Business.Admin/Services/FileService.cs` | Orchestrate S3 + Repository |
| 9 | `POS.Main.Business.Admin/Models/Files/FileResponseModel.cs` | Response DTO |
| 10 | `POS.Main.Business.Admin/Models/Files/FileMapper.cs` | Manual mapper |
| 11 | `RBMS.POS.WebAPI/Controllers/FileController.cs` | Download endpoint |

### Entity ที่ใช้ TbFile (FK)

| Entity | FK Column | หน้าที่ |
|--------|-----------|--------|
| `TbMenu` | `ImageFileId` | รูปเมนูอาหาร |
| `TbEmployee` | `ImageFileId` | รูปพนักงาน |
| `TbShopSettings` | `LogoFileId` | โลโก้ร้าน |
| `TbShopSettings` | `PaymentQrCodeFileId` | QR Code ชำระเงิน |

### NuGet Package

```bash
dotnet add package AWSSDK.S3
```

---

## Service Layer

### IS3StorageService — Infrastructure

```csharp
// POS.Main.Business.Admin/Interfaces/IS3StorageService.cs
public interface IS3StorageService
{
    Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken ct = default);
    Task<Stream> DownloadAsync(string s3Key, CancellationToken ct = default);
    Task DeleteAsync(string s3Key, CancellationToken ct = default);
}
```

### IFileService — Business Logic

```csharp
// POS.Main.Business.Admin/Interfaces/IFileService.cs
public interface IFileService
{
    Task<FileResponseModel> UploadAsync(IFormFile file, CancellationToken ct = default);
    Task<FileDownloadResult> DownloadAsync(int fileId, CancellationToken ct = default);
    Task DeleteAsync(int fileId, CancellationToken ct = default);
}
```

### FileService — Implementation

```csharp
// POS.Main.Business.Admin/Services/FileService.cs
public class FileService : IFileService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IS3StorageService _s3;
    private readonly ILogger<FileService> _logger;

    public FileService(IUnitOfWork unitOfWork, IS3StorageService s3, ILogger<FileService> logger)
    {
        _unitOfWork = unitOfWork;
        _s3 = s3;
        _logger = logger;
    }

    public async Task<FileResponseModel> UploadAsync(IFormFile file, CancellationToken ct = default)
    {
        // 1. Validate
        ValidateFile(file);

        // 2. Upload ไป S3
        using var stream = file.OpenReadStream();
        var s3Key = await _s3.UploadAsync(stream, file.FileName, file.ContentType, ct);

        // 3. บันทึก metadata ใน DB
        var extension = Path.GetExtension(file.FileName).TrimStart('.').ToLowerInvariant();
        var entity = new TbFile
        {
            FileName = file.FileName,
            MimeType = file.ContentType,
            FileExtension = extension,
            FileSize = file.Length,
            S3Key = s3Key
        };

        await _unitOfWork.Files.AddAsync(entity, ct);
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("File uploaded: {FileId} {FileName}", entity.FileId, entity.FileName);
        return FileMapper.ToResponse(entity);
    }

    public async Task DeleteAsync(int fileId, CancellationToken ct = default)
    {
        var file = await _unitOfWork.Files.GetByIdAsync(fileId, ct)
            ?? throw new EntityNotFoundException("File", fileId);

        // Soft delete (BaseEntity.DeleteFlag) — ไฟล์ S3 ยังอยู่
        file.DeleteFlag = true;
        await _unitOfWork.CommitAsync(ct);

        _logger.LogInformation("File deleted (soft): {FileId}", fileId);
    }

    private static void ValidateFile(IFormFile file)
    {
        const long maxSize = 10 * 1024 * 1024; // 10 MB
        string[] allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

        if (file.Length == 0)
            throw new ValidationException("ไฟล์ว่างเปล่า");

        if (file.Length > maxSize)
            throw new ValidationException($"ไฟล์ต้องไม่เกิน {maxSize / 1024 / 1024} MB");

        if (!allowedTypes.Contains(file.ContentType))
            throw new ValidationException("ประเภทไฟล์ไม่รองรับ รองรับเฉพาะ: JPEG, PNG, WebP, PDF");
    }
}
```

---

## Controller Pattern

### FileController — Download

```csharp
[ApiController]
[Route("api/admin/file")]
[Authorize]
public class FileController : BaseController
{
    private readonly IFileService _fileService;

    public FileController(IFileService fileService)
        => _fileService = fileService;

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(int id, CancellationToken ct = default)
    {
        var result = await _fileService.DownloadAsync(id, ct);
        return File(result.Content, result.ContentType, result.FileName);
    }
}
```

### Feature Controller — Upload (ตัวอย่าง Menu)

```csharp
// MenusController.cs — เปลี่ยนจาก [FromBody] เป็น [FromForm]
[HttpPost]
[RequestSizeLimit(10_485_760)] // 10 MB
public async Task<IActionResult> CreateMenu(
    [FromForm] CreateMenuRequestModel request,
    [FromForm] IFormFile? imageFile,           // ← รับไฟล์แยก
    CancellationToken ct = default)
{
    var result = await _menuService.CreateMenuAsync(request, imageFile, ct);
    return Success(result);
}
```

---

## Flow Diagrams

### Upload Flow

```
Client (Angular)
  │  POST /api/menu [FromForm]
  │  Content-Type: multipart/form-data
  ▼
Controller (MenusController)
  │  รับ request + IFormFile
  ▼
Service (MenuService)
  │  เรียก FileService.UploadAsync(imageFile)
  ▼
FileService
  │  1. Validate (size, type)
  │  2. S3StorageService.UploadAsync() → ได้ S3 Key
  │  3. สร้าง TbFile entity + save ใน DB
  │  4. Return FileResponseModel (FileId)
  ▼
MenuService (ต่อ)
  │  5. สร้าง TbMenu { ImageFileId = file.FileId }
  │  6. CommitAsync()
  ▼
Response: { status: "success", result: { menuId: 1, imageFileId: 5 } }
```

### Download Flow

```
Client (Angular)
  │  GET /api/admin/file/5
  ▼
FileController
  │  FileService.DownloadAsync(5)
  ▼
FileService
  │  1. Query DB → ได้ TbFile { S3Key: "2026/03/abc_pad-thai.jpg" }
  │  2. S3StorageService.DownloadAsync(s3Key) → Stream
  │  3. Return { Content, ContentType, FileName }
  ▼
Controller
  │  return File(stream, "image/jpeg", "pad-thai.jpg")
  ▼
Client: แสดงรูปผ่าน <img src="/api/admin/file/5">
```

---

## ResponseModel

### FileResponseModel

```csharp
public class FileResponseModel
{
    public int FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### MenuResponseModel — เปลี่ยน ImageUrl → ImageFileId

```csharp
// ก่อน
public string? ImageUrl { get; set; }

// หลัง
public int? ImageFileId { get; set; }
public string? ImageFileName { get; set; }  // จาก TbFile.FileName (แสดงใน UI)
```

### Frontend — แสดงรูป

```html
<!-- ก่อน: Base64 embedded -->
<img [src]="menu.imageUrl">

<!-- หลัง: Download จาก API -->
@if (menu.imageFileId) {
  <img [src]="'/api/admin/file/' + menu.imageFileId">
}
```

---

## S3 Configuration

### appsettings.json

```json
{
  "S3": {
    "ServiceUrl": "http://localhost:9000",
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin",
    "BucketName": "rbms-pos-files",
    "ForcePathStyle": true
  }
}
```

### DI Registration (Program.cs)

```csharp
// S3 Client
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var s3Config = new AmazonS3Config
    {
        ServiceURL = config["S3:ServiceUrl"],
        ForcePathStyle = config.GetValue<bool>("S3:ForcePathStyle")
    };
    return new AmazonS3Client(
        config["S3:AccessKey"],
        config["S3:SecretKey"],
        s3Config);
});

// Services
builder.Services.AddScoped<IS3StorageService, S3StorageService>();
builder.Services.AddScoped<IFileService, FileService>();
```

---

## Storage Provider

| ตัวเลือก | ข้อดี | ข้อเสีย | เหมาะกับ |
|----------|------|---------|---------|
| **MinIO** (self-hosted) | ฟรี, S3-compatible, Docker ได้ | ต้อง maintain | Dev + Production เล็ก-กลาง |
| **AWS S3** | Scale ได้, CDN ready | มีค่าใช้จ่าย | Production ใหญ่ |
| **Local disk** | ง่ายที่สุด | ไม่ scale, ไม่มี CDN | Prototype |

**แนะนำ:** เขียน code ใช้ `IS3StorageService` interface → สลับ MinIO (dev) / S3 (prod) ด้วย config

---

## Migration History

Migration ที่เกี่ยวข้องกับระบบไฟล์ (apply แล้วทั้งหมด):

1. **AddFileManagement** — สร้าง `TbFiles` table, ลบ `ImageUrl` จาก TbMenus + TbEmployees, เพิ่ม `ImageFileId` FK
2. **AddShopSettingsTables** — เพิ่ม `LogoFileId` + `PaymentQrCodeFileId` FK ใน TbShopSettings

---

## Related Docs

- [backend-guide.md](../development/backend-guide.md) — 10-Step Workflow สำหรับสร้าง Module ใหม่
- [system-overview.md](system-overview.md) — ภาพรวมสถาปัตยกรรม
- [project-structure.md](project-structure.md) — โครงสร้างไฟล์ทั้งหมด
