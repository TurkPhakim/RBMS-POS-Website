# TASK: ระบบสร้างผู้ใช้งาน (Create User Account)

**สถานะ**: COMPLETED
**วันที่เริ่ม**: 2026-03-12
**วันที่เสร็จ**: 2026-03-12

> เพิ่มความสามารถให้ผู้ดูแลสร้างบัญชีผู้ใช้ (TbUser) จากข้อมูลพนักงาน พร้อมส่ง credentials ทางอีเมล
> เอกสารอ้างอิง: [database-api-reference.md](../architecture/database-api-reference.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- IEmailService interface อยู่ใน `POS.Main.Core` (ไม่ใช่ Business.Admin) เพื่อหลีกเลี่ยง cross-Business reference
- Email failure ไม่ throw exception — return `emailSent: false` แล้วแสดง credentials ให้ admin เห็น
- Password plain text ส่งกลับ client เพียงครั้งเดียว ไม่ persist ที่ใดนอกจาก BCrypt hash
- ใช้ `Random.Shared` สำหรับ password generation (thread-safe)
- ตัดอักษรที่สับสน (O/0, l/1, I) ออกจาก character pool

---

## Dependencies / สิ่งที่ต้องเตรียม

- MailKit NuGet package (ยังไม่ได้ install)
- SMTP credentials สำหรับทดสอบจริง (config ใน appsettings.json)

---

## แผนการทำงาน

### Phase 1 — Backend: EmailService + SMTP Configuration

กระทบ: POS.Main.Core, POS.Main.Business.Admin, RBMS.POS.WebAPI | ความซับซ้อน: ปานกลาง

#### 1.1 เพิ่ม MailKit Package (`POS.Main.Business.Admin.csproj`)

**ปัญหาปัจจุบัน:**
- ไม่มี library สำหรับส่งอีเมล

**เป้าหมาย:**
- เพิ่ม MailKit NuGet package

#### 1.2 SMTP Configuration (`appsettings.json`)

**ปัญหาปัจจุบัน:**
- ไม่มี SMTP config

**เป้าหมาย:**
- เพิ่ม `Smtp` section (Host, Port, UseSsl, Username, Password, FromEmail, FromName)

#### 1.3 SmtpSettings Model (`POS.Main.Core/Models/SmtpSettings.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี strongly-typed config model

**เป้าหมาย:**
- สร้าง `SmtpSettings` class สำหรับ `IOptions<SmtpSettings>` binding

#### 1.4 IEmailService Interface (`POS.Main.Core/Interfaces/IEmailService.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี email service abstraction

**เป้าหมาย:**
- สร้าง `IEmailService` ใน Core (return bool, ไม่ throw)

#### 1.5 EmailService Implementation (`POS.Main.Business.Admin/Services/EmailService.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี email sending implementation

**เป้าหมาย:**
- สร้าง `EmailService` ใช้ MailKit, log warning ถ้าส่งไม่ได้

#### 1.6 DI Registration (`Program.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี SmtpSettings binding และ EmailService registration

**เป้าหมาย:**
- เพิ่ม `Configure<SmtpSettings>` + `AddScoped<IEmailService, EmailService>`

---

### Phase 2 — Backend: Create Account Endpoint

กระทบ: POS.Main.Business.HumanResource, RBMS.POS.WebAPI | ความซับซ้อน: ปานกลาง

#### 2.1 Response Model (`Models/UserAccount/CreateUserAccountResponseModel.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี DTO สำหรับ response

**เป้าหมาย:**
- สร้าง model: UserId, Username, Password, EmployeeName, EmailSent

#### 2.2 IEmployeeService + EmployeeService (`Interfaces/`, `Services/`)

**ปัญหาปัจจุบัน:**
- ไม่มี method สร้าง user account

**เป้าหมาย:**
- เพิ่ม `CreateUserAccountAsync(int employeeId, CancellationToken)` พร้อม:
  - Validation (exists, no user, has email, email not duplicate)
  - Random password generation (8 chars)
  - TbUser creation + Employee.UserId update → CommitAsync
  - Email sending (non-throwing)
  - Return credentials + emailSent

#### 2.3 HumanResourceController (`Controllers/HumanResourceController.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี endpoint สร้าง user

**เป้าหมาย:**
- เพิ่ม `POST api/humanresource/{employeeId}/create-user`
- Permission: `Permissions.Employee.Create`

---

### Phase 3 — Frontend: Dialog + API Integration

กระทบ: employee-list component | ความซับซ้อน: ปานกลาง

#### 3.1 Regenerate API Client

**ปัญหาปัจจุบัน:**
- Frontend ยังไม่มี method/model สำหรับ create-user endpoint

**เป้าหมาย:**
- รัน `npm run gen-api` เพื่อ generate method + response model ใหม่

#### 3.2 Create User Dialog (`dialogs/create-user-dialog/`)

**ปัญหาปัจจุบัน:**
- ไม่มี dialog สำหรับยืนยันสร้าง user

**เป้าหมาย:**
- สร้าง `CreateUserDialogComponent` แยก — ใช้ PrimeNG `DialogService` (DynamicDialog) เปิดแบบ programmatic
- รับ data ผ่าน `DynamicDialogConfig`, return credentials ผ่าน `DynamicDialogRef.close()`
- แสดงข้อมูลพนักงาน: รูป, ชื่อ, ชื่อเล่น, ตำแหน่ง, เพศ, อีเมล, เบอร์

#### 3.3 Credentials Dialog (`dialogs/credentials-dialog/`)

**ปัญหาปัจจุบัน:**
- ไม่มี dialog แสดง credentials

**เป้าหมาย:**
- สร้าง `CredentialsDialogComponent` แยก — ใช้ DynamicDialog
- แสดง Username, Password (font-mono), email sent status, คำเตือน

#### 3.4 employee-list.component.ts + .html

**ปัญหาปัจจุบัน:**
- ไม่มีปุ่มสร้างผู้ใช้

**เป้าหมาย:**
- เพิ่มปุ่ม "สร้างผู้ใช้" (pi-user-plus, สีเขียว) — แสดงเฉพาะเมื่อ !item.userId
- เปิด Dialog ผ่าน `DialogService.open()`, subscribe `ref.onClose` สำหรับ credentials

---

### Phase 4 — อัพเดตเอกสาร

กระทบ: doc/ | ความซับซ้อน: ต่ำ

#### 4.1 database-api-reference.md

**ปัญหาปัจจุบัน:**
- ไม่มี endpoint create-user ในเอกสาร

**เป้าหมาย:**
- เพิ่ม `POST /api/humanresource/{employeeId}/create-user` ในตาราง API

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1.1-1.6  EmailService + SMTP     ← infrastructure ต้องมาก่อน
2. Phase 2.1-2.3  Create Account endpoint  ← ต้องมี EmailService ก่อน
3. Phase 3.1      Regenerate API client    ← ต้องมี endpoint ก่อน
4. Phase 3.2-3.3  Frontend Dialog          ← ต้องมี generated service ก่อน
5. Phase 4.1      อัพเดตเอกสาร             ← ทำหลังสุด
```
