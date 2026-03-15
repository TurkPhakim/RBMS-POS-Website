# สถาปัตยกรรม HTTPS Security (FR-SECURITY-003)

> อัพเดตล่าสุด: 2026-03-15

เอกสารนี้อธิบายสถาปัตยกรรมการบังคับใช้ HTTPS ของระบบ RBMS-POS ตามมาตรฐาน FR-SECURITY-003

---

## ภาพรวม

ระบบ RBMS-POS บังคับใช้ HTTPS ทั้ง Backend และ Frontend เพื่อให้ traffic ทั้งหมด (รวมถึงการยืนยันตัวตน) ถูกเข้ารหัส

```
Browser (HTTPS) ──→ Angular Frontend (:4300)
                         │
                         │ HTTPS API calls
                         ▼
                    ASP.NET Core Backend (:5300)
                         │
                         ├─ HSTS Header (Production)
                         ├─ HTTP → HTTPS Redirect
                         ├─ Security Headers Middleware
                         ├─ TLS 1.2 / 1.3 (Kestrel)
                         │
                         ▼
                    SQL Server / S3 Storage
```

---

## รายละเอียดแต่ละชั้นความปลอดภัย

### 1. HTTP → HTTPS Redirect

**ไฟล์**: `Backend-POS/POS.Main/RBMS.POS.WebAPI/Program.cs`

ASP.NET Core Middleware `UseHttpsRedirection()` จะ redirect request จาก HTTP (port 5301) ไปยัง HTTPS (port 5300) อัตโนมัติ

```csharp
app.UseHttpsRedirection();
```

**ผลลัพธ์**: ทุก HTTP request จะถูก redirect เป็น HTTPS ด้วย status code 307 (Temporary Redirect)

---

### 2. TLS 1.2 / 1.3 (Kestrel Configuration)

**ไฟล์**: `Backend-POS/POS.Main/RBMS.POS.WebAPI/Program.cs`

Kestrel web server ถูกตั้งค่าให้รองรับเฉพาะ TLS 1.2 และ TLS 1.3 — protocol เวอร์ชันต่ำกว่าจะถูกปฏิเสธ

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureHttpsDefaults(httpsOptions =>
    {
        httpsOptions.SslProtocols = System.Security.Authentication.SslProtocols.Tls12
                                  | System.Security.Authentication.SslProtocols.Tls13;
    });
});
```

**เหตุผล**: TLS 1.0 และ 1.1 มีช่องโหว่ด้านความปลอดภัยที่รู้จักกันแล้ว (BEAST, POODLE) จึงต้องปิดการใช้งาน

---

### 3. SSL Certificate Validation

ระบบ **ไม่ได้ disable SSL certificate validation** ที่ใดเลย:

- **Backend**: ไม่มี `ServerCertificateCustomValidationCallback` ที่ bypass validation
- **Frontend**: Angular `HttpClient` ตรวจสอบ SSL certificate โดยค่าเริ่มต้นของ browser

---

### 4. Login ส่งข้อมูลผ่าน HTTPS

**ไฟล์ Frontend**:
- `Frontend-POS/RBMS-POS-Client/src/environments/environment.ts` — Development: `https://localhost:5300`
- `Frontend-POS/RBMS-POS-Client/src/environments/environment.prod.ts` — Production: `https://api.rbms-pos.com`

API URL ทั้ง development และ production ใช้ `https://` เสมอ ข้อมูล Login (username/password) จะถูกเข้ารหัสผ่าน TLS ก่อนส่ง

---

### 5. Token Storage

ระบบใช้ **JWT (JSON Web Token)** เก็บใน `localStorage` — ไม่ได้ใช้ cookies สำหรับ authentication:

| รายการ | ที่เก็บ | หมายเหตุ |
|--------|---------|----------|
| Access Token | `localStorage('access_token')` | ส่งผ่าน `Authorization: Bearer` header |
| Refresh Token | `localStorage('refresh_token')` | ใช้ขอ access token ใหม่ |

**ไฟล์**: `Frontend-POS/RBMS-POS-Client/src/app/core/interceptors/auth.interceptor.ts`

> หมายเหตุ: เนื่องจากไม่ได้ใช้ cookies จึงไม่จำเป็นต้องตั้ง `Secure` / `HttpOnly` / `SameSite` flags — แต่ถ้ามีการเปลี่ยนไปใช้ cookies ในอนาคตต้องตั้งค่าเหล่านี้ด้วย

---

### 6. HSTS (HTTP Strict Transport Security)

**ไฟล์**: `Backend-POS/POS.Main/RBMS.POS.WebAPI/Program.cs`

HSTS บังคับให้ browser เข้าใช้ HTTPS เท่านั้น โดย browser จะจำไว้ตลอดระยะเวลาที่กำหนด (`max-age`)

**Service Registration:**
```csharp
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);      // จำ 1 ปี
    options.IncludeSubDomains = true;              // ครอบคลุม subdomain ทั้งหมด
    options.Preload = true;                        // อนุญาตเข้า HSTS Preload List
});
```

**Middleware (Production only):**
```csharp
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
```

**เหตุผลที่ไม่ใช้ใน Development**: Development ใช้ self-signed certificate ซึ่ง HSTS จะทำให้ browser ปฏิเสธ certificate ที่ไม่ได้ signed โดย CA ที่เชื่อถือได้

---

### 7. Security Headers Middleware

**ไฟล์**: `Backend-POS/POS.Main/RBMS.POS.WebAPI/Program.cs`

เพิ่ม HTTP Security Headers ทุก response เพื่อป้องกันการโจมตีหลายรูปแบบ:

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});
```

| Header | ค่า | ป้องกัน |
|--------|-----|---------|
| `X-Content-Type-Options` | `nosniff` | MIME type sniffing — ป้องกัน browser ตีความ content type ผิด |
| `X-Frame-Options` | `DENY` | Clickjacking — ป้องกันการ embed หน้าเว็บใน iframe |
| `X-XSS-Protection` | `1; mode=block` | XSS — สั่ง browser block หน้าเว็บเมื่อตรวจพบ XSS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Information leakage — จำกัดข้อมูล referrer ที่ส่งไป cross-origin |

---

## ลำดับ Middleware Pipeline

```
Request เข้ามา
    │
    ▼
UseResponseCompression()          ← บีบอัด response (Gzip/Brotli)
    │
    ▼
UseHsts()                         ← เพิ่ม HSTS header (Production only)
    │
    ▼
UseHttpsRedirection()             ← redirect HTTP → HTTPS
    │
    ▼
Security Headers Middleware       ← เพิ่ม X-Content-Type-Options, X-Frame-Options ฯลฯ
    │
    ▼
UseRouting()                      ← จับคู่ route
    │
    ▼
UseCors("dev")                    ← CORS policy
    │
    ▼
UseAuthentication()               ← ตรวจ JWT token
    │
    ▼
UseAuthorization()                ← ตรวจ permissions
    │
    ▼
Controller / Endpoint             ← จัดการ request
```

---

## สรุปผลตรวจสอบ FR-SECURITY-003

| เกณฑ์ | สถานะ | หมายเหตุ |
|------|-------|---------|
| HTTP → HTTPS redirect | ผ่าน | `UseHttpsRedirection()` |
| TLS 1.2 ขึ้นไป | ผ่าน | Kestrel config: TLS 1.2 + TLS 1.3 |
| SSL certificate validation | ผ่าน | ไม่มีการ disable validation |
| Login ส่งผ่าน HTTPS | ผ่าน | API URL ใช้ `https://` ทั้ง dev/prod |
| Secure flag บน cookie | ไม่เกี่ยวข้อง | ระบบใช้ JWT ใน localStorage ไม่ใช่ cookies |
| HSTS headers | ผ่าน | `AddHsts()` + `UseHsts()` (Production) |

---

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | บทบาท |
|------|-------|
| `Backend-POS/POS.Main/RBMS.POS.WebAPI/Program.cs` | Kestrel TLS, HSTS, HTTPS Redirect, Security Headers |
| `Frontend-POS/RBMS-POS-Client/src/environments/environment.ts` | API URL (Development) |
| `Frontend-POS/RBMS-POS-Client/src/environments/environment.prod.ts` | API URL (Production) |
| `Frontend-POS/RBMS-POS-Client/src/app/core/interceptors/auth.interceptor.ts` | JWT Token attachment |
| `Frontend-POS/RBMS-POS-Client/src/app/core/api/api-config.provider.ts` | API base URL configuration |
