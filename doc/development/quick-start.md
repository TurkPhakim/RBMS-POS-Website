# Quick Start — RBMS-POS

> อ้างอิงจาก config จริงในโปรเจค — อัปเดตล่าสุด 2026-03-22

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

## ทางเลือก: ใช้ Docker สำหรับ Dependencies

> ถ้าไม่ต้องการติดตั้ง SQL Server และ MinIO บนเครื่อง สามารถใช้ Docker แทนได้

### สิ่งที่ต้องติดตั้งเพิ่ม

| เครื่องมือ | เวอร์ชัน | ตรวจสอบ |
|------------|----------|---------|
| Docker Desktop | ล่าสุด | `docker --version` |

### ขั้นตอน

1. **Copy `.env` จาก template**

   ```bash
   cp .env.example .env
   ```

   แก้ไข `SA_PASSWORD` ใน `.env` ตามต้องการ (ต้องมีตัวพิมพ์ใหญ่-เล็ก + ตัวเลข + อักขระพิเศษ อย่างน้อย 8 ตัว)

2. **เริ่ม services**

   ```bash
   docker compose up -d
   ```

   รอจนทุก container healthy:

   ```bash
   docker compose ps
   ```

   ควรเห็น `sqlserver` = healthy, `minio` = healthy, `minio-init` = exited (0)

3. **อัพเดต Connection String**

   เปิดไฟล์ `Backend-POS/POS.Main/RBMS.POS.WebAPI/appsettings.Development.json`

   เปลี่ยน `ConnectionStrings.DefaultConnection` เป็น:

   ```
   Server=localhost,1433;Database=RBMS_POS;User Id=sa;Password=<SA_PASSWORD ที่ตั้งใน .env>;MultipleActiveResultSets=true;TrustServerCertificate=True
   ```

4. **รัน Migrations** ตามปกติ (ดูขั้นตอนที่ 1.2)

5. **เชื่อมต่อ SSMS** — ดูวิธีละเอียดที่หัวข้อ [เชื่อมต่อ SSMS กับ Docker SQL Server](#เชื่อมต่อ-ssms-กับ-docker-sql-server)

6. **MinIO Console** — เปิดที่ `http://localhost:9001` (login: `minioadmin` / `minioadmin`)

### คำสั่ง Docker ที่ใช้บ่อย

| คำสั่ง | ผลลัพธ์ |
|--------|---------|
| `docker compose up -d` | เริ่ม services (background) |
| `docker compose down` | หยุด services (data ยังอยู่) |
| `docker compose down -v` | หยุด + ลบ data ทั้งหมด |
| `docker compose logs sqlserver` | ดู log ของ SQL Server |
| `docker compose logs minio` | ดู log ของ MinIO |
| `docker compose ps` | ดูสถานะ containers |

> หลังจาก setup Docker แล้ว ให้ข้ามไปขั้นตอนที่ 1.2 (รัน Migrations) ได้เลย

### เชื่อมต่อ SSMS กับ Docker SQL Server

เปิด SQL Server Management Studio (SSMS) แล้วกรอกข้อมูลตามนี้:

| ช่อง | ค่า |
|------|-----|
| Server type | `Database Engine` |
| Server name | `localhost,1433` (พิมพ์เอง — ใช้คอมม่า `,` ไม่ใช่ colon `:`) |
| Authentication | `SQL Server Authentication` |
| Login | `sa` |
| Password | ค่า `SA_PASSWORD` จากไฟล์ `.env` (ค่าเริ่มต้น: `YourStr0ng!Pass`) |

**แก้ปัญหา SSL Certificate Error:**

ถ้าเจอ error `"The certificate chain was issued by an authority that is not trusted"`:

1. กด **OK** ปิด error
2. คลิกแท็บ **Connection Properties** (ด้านบนหน้าต่าง Connect to Server)
3. เปลี่ยน **Encryption** จาก `Mandatory` → `Optional`
4. ติ๊กถูก **Trust server certificate**
5. กลับไปแท็บ **Login** แล้วกด **Connect**

> สาเหตุ: Docker SQL Server ใช้ self-signed certificate — SSMS เวอร์ชันใหม่บังคับ encryption เป็น Mandatory โดย default จึงปฏิเสธ certificate ที่ไม่ได้มาจาก CA จริง

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
| `admin`  | `P@ssw0rd`  | Admin |

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

## ขั้นตอนที่ 3 — รัน Frontend (Client + Web-Mobile)

> ระบบมี Frontend 2 ตัว — ต้องรันทั้งคู่

| โปรเจค | โฟลเดอร์ | Port | คำอธิบาย |
|--------|----------|------|----------|
| **Client** (Admin/Staff) | `Frontend-POS/RBMS-POS-Client` | `4300` | เว็บหลักสำหรับ Admin/พนักงาน |
| **Web-Mobile** (ลูกค้า) | `Frontend-POS/RBMS-POS-Mobile-Web` | `4400` | เว็บสำหรับลูกค้าสั่งอาหาร |

### 3.1 ติดตั้ง dependencies (ทั้ง 2 โปรเจค)

```bash
cd Frontend-POS/RBMS-POS-Client
npm install

cd ../RBMS-POS-Mobile-Web
npm install
```

### 3.2 ตรวจสอบ environment

เปิด `src/environments/environment.ts` ของแต่ละโปรเจค — ต้องชี้ไปที่ Backend:

```typescript
export const environment = {
  production: false,
  apiUrl: "https://localhost:5300",
};
```

> **สำคัญ:** Port ต้องตรงกับ `launchSettings.json` ของ Backend (HTTPS = 5300)

### 3.3 รัน dev server (ทั้ง 2 โปรเจค)

**Terminal 2 — Client:**

```bash
cd Frontend-POS/RBMS-POS-Client
ng serve
```

**Terminal 3 — Web-Mobile:**

```bash
cd Frontend-POS/RBMS-POS-Mobile-Web
ng serve
```

| โปรเจค | URL |
|--------|-----|
| Client | `http://localhost:4300` |
| Web-Mobile | `http://localhost:4400` |

---

## ขั้นตอนที่ 4 — ทดสอบระบบ

1. เปิด `http://localhost:4300`
2. Login ด้วย `admin` / `P@ssw0rd`
3. ตรวจสอบแต่ละเมนูใน Sidebar

---

## Workflow ประจำวัน (หลัง Setup ครั้งแรก)

> ทำตามลำดับทุกครั้งที่ต้องการรันระบบ

### Step 1 — เริ่ม Docker (SQL Server + MinIO)

```bash
# ตรวจสอบว่า Docker Desktop รันอยู่ก่อน
docker info

# ปิดแล้วเปิดใหม่เสมอ (เพื่อล้าง state เก่า)
docker compose down && docker compose up -d
```

ตรวจสอบสถานะ:

```bash
docker compose ps
```

ควรเห็น: `sqlserver` = healthy, `minio` = healthy, `minio-init` = exited (0)

---

### Step 2 — ตรวจสอบ Port ก่อนรัน

```bash
netstat -ano | grep -E ':(5300|4300|4400)' | grep LISTENING
```

ถ้า port ยังถูกใช้อยู่ (มีผลลัพธ์ออกมา) ให้ kill process ก่อน:

```bash
# ดู PID จากผลลัพธ์ netstat แล้วใช้คำสั่งนี้ (แทน <PID> ด้วยเลขจริง)
taskkill /PID <PID> /F
```

> **ห้าม restart ถ้า port ยัง LISTENING อยู่** — จะเกิด "address already in use"

---

### Step 3 — รัน Backend

**Terminal 1:**

```bash
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet run
```

รอจนเห็น:

```
Now listening on: https://localhost:5300
Now listening on: http://localhost:5301
```

ทดสอบ Swagger ที่ `https://localhost:5300/swagger`

> **Hot reload (แนะนำระหว่างพัฒนา):** `dotnet watch run`

---

### Step 4 — รัน Frontend Client

**Terminal 2:**

```bash
cd Frontend-POS/RBMS-POS-Client
npx ng serve
```

รอจนเห็น:

```
Application bundle generation complete.
Local: http://localhost:4300/
```

---

### Step 5 — รัน Frontend Web-Mobile

**Terminal 3:**

```bash
cd Frontend-POS/RBMS-POS-Mobile-Web
npx ng serve
```

รอจนเห็น:

```
Application bundle generation complete.
Local: http://localhost:4400/
```

---

### Step 6 — เปิดแอป

| โปรเจค | URL | Login |
|--------|-----|-------|
| Client (Admin/Staff) | `http://localhost:4300` | `admin` / `P@ssw0rd` |
| Web-Mobile (ลูกค้า) | `http://localhost:4400` | — (QR Code / Session) |

---

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

> **Workflow**: Copy `swagger.json` จาก Swagger UI (`https://localhost:{port}/swagger/v2/swagger.json`) มาวางที่ `Frontend-POS/RBMS-POS-Client/swagger.json` ก่อนรัน `npm run gen-api`

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
    public Dictionary<string, string[]>? Errors { get; }

    public ValidationException(string message) : base(message) { }
    public ValidationException(string message, Dictionary<string, string[]> errors)
        : base(message) { Errors = errors; }
}

// POS.Main.Core/Exceptions/EntityNotFoundException.cs
public class EntityNotFoundException : Exception
{
    public EntityNotFoundException(string entityName, object id)
        : base($"{entityName} (id={id}) ไม่พบ") { }
}

// POS.Main.Core/Exceptions/BusinessException.cs
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message) { }
}

// Auth-specific Exceptions:
// AuthenticationException (base) → 401
// InvalidCredentialsException → 401
// InvalidRefreshTokenException → 401
// AccountDisabledException → 403
// AccountLockedException → 423 (มี LockedUntil property)
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
            ValidationException ex          => (400, ex.Message, ex.Errors),
            InvalidCredentialsException ex  => (401, ex.Message, (Dictionary<string, string[]>?)null),
            InvalidRefreshTokenException ex => (401, ex.Message, null),
            AuthenticationException ex      => (401, ex.Message, null),
            AccountDisabledException ex     => (403, ex.Message, null),
            EntityNotFoundException ex      => (404, ex.Message, null),
            BusinessException ex            => (422, ex.Message, null),
            AccountLockedException ex       => (423, ex.Message, null),
            UnauthorizedAccessException     => (401, "Unauthorized", null),
            _                               => (500, _env.IsDevelopment()
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
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    // Single item response
    protected IActionResult Success<T>(T data, string? message = null)
        => Ok(new BaseResponseModel<T> { Status = constResultType.Success, Result = data, Message = message });

    // No-data success response
    protected IActionResult Success(string? message = null)
        => Ok(new BaseResponseModel<object> { Status = constResultType.Success, Message = message });

    // List response (ไม่แบ่งหน้า)
    protected IActionResult ListSuccess<T>(IEnumerable<T> data, string? message = null)
        => Ok(new ListResponseModel<T> { Status = constResultType.Success, Results = data.ToList(), Message = message });

    // Paginated response
    protected IActionResult PagedSuccess<T>(PaginationResult<T> result)
    { result.Status = constResultType.Success; return Ok(result); }

    // IP address จาก request (รองรับ proxy)
    protected string GetIpAddress() { ... }

    // UserId (Guid) จาก JWT claim
    protected Guid GetUserId() { ... }
}
```

---

## Related Docs

- [backend-guide.md](backend-guide.md) — คู่มือพัฒนา Backend + Database Conventions
- [module-development-workflow.md](module-development-workflow.md) — สร้าง feature ใหม่ตั้งแต่ต้น
- [project-status.md](../features/project-status.md) — สถานะ features ปัจจุบัน
