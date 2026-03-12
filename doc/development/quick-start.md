# Quick Start — RBMS-POS

> อ้างอิงจาก config จริงในโปรเจค — อัปเดตล่าสุด 2026-03-10

---

## สิ่งที่ต้องติดตั้งก่อน

| เครื่องมือ  | เวอร์ชัน       | ตรวจสอบ                      |
| ----------- | -------------- | ---------------------------- |
| .NET SDK    | 9.0+           | `dotnet --version`           |
| Node.js     | 18+            | `node --version`             |
| Angular CLI | 19+            | `ng version`                 |
| SQL Server  | Express ขึ้นไป | Services.msc → SQL Server    |
| SSMS        | ล่าสุด         | (optional — ดู/แก้ database) |

---

## ขั้นตอนที่ 1 — ตั้งค่า Database

### 1.1 ตรวจสอบ Connection String

เปิดไฟล์ `Backend-POS/POS.Main/RBMS.POS.WebAPI/appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=RBMS_POS;Trusted_Connection=True;TrustServerCertificate=True"
}
```

> ถ้าใช้ SQL Server Full (ไม่ใช่ Express) เปลี่ยน `SQLEXPRESS` → `MSSQLSERVER` หรือใช้ `.` แทน

### 1.2 รัน Migrations

```bash
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet ef database update --project ../POS.Main.Dal
```

หรือ double-click: `Backend-POS/SETUP_DATABASE.bat`

ผลที่ควรเห็น: `Done.` และ database `RBMS_POS` ปรากฏใน SSMS

### 1.3 สร้าง Test Users

เปิด SSMS → เชื่อมต่อ `localhost` → New Query → รัน:

```
Backend-POS/SQL_Scripts/03_CreateTestUsers.sql
```

| Username | Password    | Role  |
| -------- | ----------- | ----- |
| `admin`  | `Admin@123` | Admin |

---

## ขั้นตอนที่ 2 — รัน Backend

```bash
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet run --launch-profile https
```

รอจนเห็น:

```
Now listening on: https://localhost:5300
Now listening on: http://localhost:5301
```

ทดสอบ Swagger ที่ `https://localhost:5300/swagger`

> **Hot reload (แนะนำระหว่างพัฒนา):** `dotnet watch run --launch-profile https`
>
> **Port จริง** (จาก `launchSettings.json`): HTTPS=5300, HTTP=5301

---

## ขั้นตอนที่ 3 — รัน Frontend

### 3.1 ติดตั้ง dependencies

```bash
cd Frontend-POS/RBMS-POS-Client
npm install
```

### 3.2 ตรวจสอบ environment

เปิด `src/environments/environment.ts` — ต้องชี้ไปที่ Backend:

```typescript
export const environment = {
  production: false,
  apiUrl: "https://localhost:5300",
};
```

> **สำคัญ:** Port ต้องตรงกับ `launchSettings.json` ของ Backend (HTTPS = 5300)

### 3.3 รัน dev server

```bash
ng serve
```

เปิดเบราว์เซอร์ที่ `http://localhost:4300`

---

## ขั้นตอนที่ 4 — ทดสอบระบบ

1. เปิด `http://localhost:4300`
2. Login ด้วย `admin` / `Admin@123`
3. ตรวจสอบแต่ละเมนูใน Sidebar

---

## Workflow ประจำวัน (หลัง Setup ครั้งแรก)

```bash
# Terminal 1 — Backend
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet watch run --launch-profile https

# Terminal 2 — Frontend
cd Frontend-POS/RBMS-POS-Client
ng serve
```

### เมื่อ Backend API เปลี่ยน

```bash
# 1. ตรวจสอบ Swagger: https://localhost:5300/swagger
# 2. Regenerate TypeScript client
cd Frontend-POS/RBMS-POS-Client
npm run gen-api
```

---

## OpenAPI Generation Config

ไฟล์ `Frontend-POS/RBMS-POS-Client/ng-openapi-gen.json`:

```json
{
  "input": "swagger.json",
  "output": "src/app/core/api",
  "ignoreUnusedModels": false,
  "removeStaleFiles": true,
  "enumStyle": "alias",
  "apiModule": false,
  "serviceSuffix": "Service"
}
```

> **Workflow**: Copy `swagger.json` จาก Swagger UI (`https://localhost:{port}/swagger/v1/swagger.json`) มาวางที่ `Frontend-POS/RBMS-POS-Client/swagger.json` ก่อนรัน `npm run gen-api`

---

## Core Infrastructure Reference

ไฟล์พื้นฐานที่ต้องมีในโปรเจค ถ้ายังไม่มีให้สร้างตามนี้:

### Response Model

```csharp
// POS.Main.Core/Models/BaseResponseModel.cs
public class BaseResponseModel<T>
{
    public string Status { get; set; } = "success";
    public string Message { get; set; } = string.Empty;
    public T? Result { get; set; }
    public Dictionary<string, string[]>? Errors { get; set; }
}

public class PaginationResult<T>
{
    public string Status { get; set; } = "success";
    public List<T> Results { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int ItemPerPage { get; set; }
}
```

### Custom Exceptions

```csharp
// POS.Main.Core/Exceptions/ValidationException.cs
public class ValidationException : Exception
{
    public string ErrorCode { get; }
    public Dictionary<string, string[]>? Errors { get; }

    public ValidationException(string message, string errorCode = "ERR-VAL-001")
        : base(message) { ErrorCode = errorCode; }

    public ValidationException(string message, Dictionary<string, string[]> errors)
        : base(message) { ErrorCode = "ERR-VAL-001"; Errors = errors; }
}

// POS.Main.Core/Exceptions/EntityNotFoundException.cs
public class EntityNotFoundException : Exception
{
    public string ErrorCode { get; }
    public EntityNotFoundException(string entityName, object id)
        : base($"{entityName} (id={id}) ไม่พบ") { ErrorCode = "ERR-NOT-FOUND"; }
}

// POS.Main.Core/Exceptions/BusinessException.cs
public class BusinessException : Exception
{
    public string ErrorCode { get; }
    public BusinessException(string message, string errorCode = "ERR-BIZ-001")
        : base(message) { ErrorCode = errorCode; }
}
```

### GlobalExceptionFilter

```csharp
// RBMS.POS.WebAPI/Filters/GlobalExceptionFilter.cs
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public void OnException(ExceptionContext context)
    {
        var (statusCode, message, errors) = context.Exception switch
        {
            ValidationException ex   => (400, ex.Message, ex.Errors),
            EntityNotFoundException ex => (404, ex.Message, (Dictionary<string, string[]>?)null),
            BusinessException ex     => (422, ex.Message, null),
            UnauthorizedAccessException => (401, "Unauthorized", null),
            _                        => (500, _env.IsDevelopment()
                                            ? context.Exception.Message
                                            : "เกิดข้อผิดพลาดภายในระบบ", null)
        };

        _logger.LogError(context.Exception, "Error {StatusCode}: {Message}", statusCode, message);

        context.Result = new ObjectResult(new BaseResponseModel<object>
        {
            Status = "fail",
            Message = message,
            Errors = errors
        }) { StatusCode = statusCode };

        context.ExceptionHandled = true;
    }
}
```

Register ใน Program.cs:

```csharp
builder.Services.AddControllers(options =>
    options.Filters.Add<GlobalExceptionFilter>());
```

### BaseController

```csharp
// RBMS.POS.WebAPI/Controllers/BaseController.cs
[ApiController]
public abstract class BaseController : ControllerBase
{
    protected IActionResult Success<T>(T result, string message = "สำเร็จ")
        => Ok(new BaseResponseModel<T> { Status = "success", Message = message, Result = result });

    protected IActionResult ToActionResult<T>(PaginationResult<T> result)
        => Ok(result);

    protected int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }
}
```

---

## Related Docs

- [backend-guide.md](backend-guide.md) — คู่มือพัฒนา Backend + Database Conventions
- [module-development-workflow.md](module-development-workflow.md) — สร้าง feature ใหม่ตั้งแต่ต้น
- [project-status.md](../features/project-status.md) — สถานะ features ปัจจุบัน
