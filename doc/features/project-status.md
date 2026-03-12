# RBMS-POS — สถานะโปรเจคและ Workflow

> **อ้างอิงจากโค้ดที่มีอยู่จริง** — อัปเดตล่าสุด 2026-03-11

---

## ภาพรวมสถานะ

| ส่วน                                | สถานะ                                      |
| ----------------------------------- | ------------------------------------------ |
| Authentication (Login/Logout/Token) | ✅ เสร็จ                                   |
| Menu Management                     | ✅ เสร็จ                                   |
| Employee Management                 | ✅ เสร็จ                                   |
| Service Charge                      | ✅ เสร็จ                                   |
| File Management (S3 Storage)        | ✅ เสร็จ (Backend) — FE รอ gen-api         |
| Order / Table / Payment / Kitchen   | ⚠️ มีหน้า Frontend แต่ยังไม่มี Backend API |
| Profile                             | ⚠️ มีหน้า Frontend เท่านั้น                |

---

## Workflow ที่ทำงานได้จริงตอนนี้

### 1. Authentication Flow

```
User เปิด http://localhost:4300
        │
        ▼
[Auth Guard] ตรวจ token ใน localStorage
        │
   ไม่มี token ──────────────────────────────────────────────┐
        │                                                     │
        ▼                                                     ▼
/auth/login (LoginComponent)                        /  (WelcomeComponent)
        │                                           Header + Sidebar พร้อมใช้
        │ กรอก username/password
        ▼
POST /api/admin/auth/login
        │
   ✅ สำเร็จ → บันทึก accessToken + refreshToken ใน localStorage
        │       บันทึก user info (role, name)
        │       Redirect ไป /
        │
   ❌ ล้มเหลว → แสดง error message
               (Invalid creds / Account locked / Disabled)
```

**Account Lockout:** ผิด 5 ครั้ง → ล็อค 15 นาที
**Token Refresh:** Interceptor จัดการอัตโนมัติเมื่อได้รับ 401

---

### 2. Menu Management Flow

```
Sidebar → /menu
        │
        ▼
MenuListComponent
        │── GET /api/menu           → แสดงรายการทั้งหมด
        │── GET /api/menu/search    → ค้นหาตามชื่อ
        │── GET /api/menu/category/{cat} → filter ตามหมวด
        │── GET /api/menu/available → เฉพาะที่ available
        │
        ├── [เพิ่ม] → /menu/manage → MenuManageComponent
        │              POST /api/menu
        │
        └── [แก้ไข] → /menu/manage/{id} → MenuManageComponent
                       PUT /api/menu/{id}

[ลบ] → DELETE /api/menu/{id}  (soft delete)
```

**หมวดหมู่ที่รองรับ:** ตาม Enum `MenuCategory`
**Validation:** ชื่อซ้ำไม่ได้ (IsNameExistsAsync)

---

### 3. Employee Management Flow

```
Sidebar → /hr
        │
        ▼
EmployeeListComponent
        │── GET /api/humanresource              → รายการทั้งหมด
        │── GET /api/humanresource/search       → ค้นหา
        │── GET /api/humanresource/status/{s}   → filter ตามสถานะ
        │── GET /api/humanresource/user/{userId} → ดูตาม userId
        │
        ├── [เพิ่ม] → /hr/manage → EmployeeManageComponent
        │              POST /api/humanresource
        │
        └── [แก้ไข] → /hr/manage/{id} → EmployeeManageComponent
                       PUT /api/humanresource/{id}

[ลบ] → DELETE /api/humanresource/{id}  (soft delete)
```

---

### 4. Service Charge Flow

```
Sidebar → /admin-setting
        │
        ▼
ServiceChargeListComponent
        │── GET /api/admin/servicecharges           → รายการทั้งหมด
        │── GET /api/admin/servicecharges/dropdown  → สำหรับ dropdown อื่น
        │
        ├── [เพิ่ม/แก้ไข] → ServiceChargeManageComponent
        │                    POST / PUT /api/admin/servicecharges/{id}
        │
        └── [ลบ] → DELETE /api/admin/servicecharges/{id}
```

---

## สิ่งที่ยังขาด (มีหน้า Frontend แต่ไม่มี Backend API)

| Module              | หน้าที่มี               | สิ่งที่ขาด                          |
| ------------------- | ----------------------- | ----------------------------------- |
| **Order**           | OrderListComponent      | ไม่มี Order Entity, ไม่มี API       |
| **Table**           | TableComponent          | ไม่มี Table Entity, ไม่มี API       |
| **Payment**         | PaymentComponent        | ไม่มี Payment Entity, ไม่มี API     |
| **Kitchen Display** | KitchenDisplayComponent | ไม่มี API, SignalR hub ยังเป็น stub |
| **Profile**         | ProfileComponent        | ไม่มี Profile API                   |

---

## โครงสร้าง Database ที่มีอยู่จริง

```
RBMS_POS Database
├── TbUsers             ← ผู้ใช้ระบบ (login credentials, role, lockout)
├── TbRefreshTokens     ← JWT refresh tokens
├── TbLoginHistories    ← บันทึกการ login ทุกครั้ง
├── TbServiceCharges    ← ค่าบริการ
├── TbFiles             ← metadata ไฟล์ (FileName, MimeType, S3Key) เชื่อมกับ S3 storage
├── TbMenus             ← เมนูอาหาร (ชื่อ, ราคา, หมวด, ImageFileId → TbFiles)
└── TbEmployees         ← พนักงาน (ชื่อ, ตำแหน่ง, สถานะ, ImageFileId → TbFiles)
```

> สถาปัตยกรรม File Management: [file-management.md](../architecture/file-management.md)

**Migrations ที่ apply แล้ว (เรียงตามเวลา):**

1. `InitialAuthMigration` — สร้าง Users, RefreshTokens, LoginHistory
2. `RemovePasswordResetTokens` — ตัด password reset ออก
3. `AddServiceChargeTable` — เพิ่ม ServiceCharges
4. `AddMenuTable` — เพิ่ม Menus
5. `UpdateMenuImageUrlToMax` — ขยาย ImageUrl field
6. `AddEmployeeTable` — เพิ่ม Employees
7. `StandardizeEntitySchema` — เพิ่ม Audit FK + Navigation properties
8. `StandardizeNamingConvention` — เปลี่ยนชื่อ columns ตามมาตรฐาน
9. `AddFileManagementSystem` — สร้าง TbFiles, เปลี่ยน ImageUrl → ImageFileId FK (Menu + Employee)

---

## Endpoints ทั้งหมดที่ใช้งานได้

| Method | Endpoint                              | หน้าที่             |
| ------ | ------------------------------------- | ------------------- |
| POST   | `/api/admin/auth/login`                  | Login               |
| POST   | `/api/admin/auth/logout`                 | Logout              |
| POST   | `/api/admin/auth/refresh-token`          | Refresh JWT         |
| GET    | `/api/menu`                       | รายการ menu ทั้งหมด |
| GET    | `/api/menu/{id}`                  | Menu รายชิ้น        |
| GET    | `/api/menu/category/{cat}`        | Filter ตามหมวด      |
| GET    | `/api/menu/available`             | เฉพาะที่เปิดขาย     |
| GET    | `/api/menu/search`                | ค้นหาชื่อ menu      |
| POST   | `/api/menu`                       | เพิ่ม menu          |
| PUT    | `/api/menu/{id}`                  | แก้ไข menu          |
| DELETE | `/api/menu/{id}`                  | ลบ menu (soft)      |
| GET    | `/api/humanresource`               | รายการพนักงาน       |
| GET    | `/api/humanresource/{id}`          | พนักงานรายคน        |
| GET    | `/api/humanresource/status/{s}`    | Filter ตามสถานะ     |
| GET    | `/api/humanresource/user/{userId}` | ค้นหาตาม userId     |
| GET    | `/api/humanresource/search`        | ค้นหาชื่อ           |
| POST   | `/api/humanresource`               | เพิ่มพนักงาน        |
| PUT    | `/api/humanresource/{id}`          | แก้ไขพนักงาน        |
| DELETE | `/api/humanresource/{id}`          | ลบพนักงาน (soft)    |
| GET    | `/api/admin/servicecharges`              | รายการค่าบริการ     |
| GET    | `/api/admin/servicecharges/{id}`         | ค่าบริการรายชิ้น    |
| GET    | `/api/admin/servicecharges/dropdown`     | สำหรับ dropdown     |
| POST   | `/api/admin/servicecharges`              | เพิ่มค่าบริการ      |
| PUT    | `/api/admin/servicecharges/{id}`         | แก้ไขค่าบริการ      |
| DELETE | `/api/admin/servicecharges/{id}`         | ลบค่าบริการ         |
| GET    | `/api/admin/file/{id}`                   | Download ไฟล์       |

---

## สิ่งที่ควรทำต่อ (เรียงตาม priority)

### Priority 1 — แก้สิ่งที่ทำค้างไว้

- [ ] ทดสอบ workflow Login → Welcome → ใช้งาน menu จริงๆ ครบ loop
- [ ] ตรวจสอบว่า Frontend เรียก API ได้จริง (gen-api ล่าสุดหรือยัง)

### Priority 2 — File Management ✅ (Backend เสร็จ)

- [x] **TbFile Entity** + S3 Storage — แก้ปัญหารูปโหลดช้า (Base64 → S3)
- [x] เชื่อม TbMenu.ImageFileId + TbEmployee.ImageFileId → TbFile
- [x] FileController (download) + FileService (upload/delete)
- [ ] Frontend: `npm run gen-api` → อัพเดต Form components ใช้ `multipart/form-data`
- ดูรายละเอียด: [TASK-file-management.md](../tasks/TASK-file-management.md)

### Priority 3 — ต่อ Core Business Logic

- [ ] **Order** — Entity + API + Frontend (สำคัญที่สุดสำหรับ POS)
- [ ] **Table** — จัดการโต๊ะ (ถ้าเป็นร้านอาหาร)
- [ ] **Payment** — ชำระเงิน + เชื่อมกับ Order

### Priority 4 — Real-time Features

- [ ] **Kitchen Display** — SignalR เชื่อม Order → ครัว
- [ ] Notification เมื่อ order status เปลี่ยน

### Priority 5 — ฟีเจอร์เสริม

- [ ] **Profile** — แก้ข้อมูลส่วนตัว, เปลี่ยน password
- [ ] **Reports** — ยอดขาย, stock
- [ ] Password Reset via email

---

## Related Docs

- [Database & API Reference](../architecture/database-api-reference.md) — อ้างอิงตาราง, API Endpoints, ความสัมพันธ์ทั้งหมด
- [Backend Guide](../development/backend-guide.md) — คู่มือพัฒนา Backend + 10-Step Workflow + Database Conventions
- [Module Development Workflow](../development/module-development-workflow.md) — End-to-End 16 ขั้นตอน
- [System Overview](../architecture/system-overview.md) — N-Tier Architecture, Data flow
