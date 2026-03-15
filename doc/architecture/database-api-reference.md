# อ้างอิงฐานข้อมูลและ API — RBMS-POS

> อัพเดตล่าสุด: 2026-03-14

> **กฎบังคับ**: เอกสารนี้ต้องอัพเดตทุกครั้งที่มีการสร้าง Entity ใหม่, เพิ่ม API เส้นใหม่, หรือเปลี่ยนแปลงความสัมพันธ์ของตาราง
> ดู [กฎการอัพเดต](#กฎการอัพเดตเอกสารนี้) ด้านล่าง

---

## สารบัญ

1. [ตารางฐานข้อมูลทั้งหมด](#ตารางฐานข้อมูลทั้งหมด)
2. [ความสัมพันธ์ของตาราง](#ความสัมพันธ์ของตาราง)
3. [API Endpoints ทั้งหมด](#api-endpoints-ทั้งหมด)
4. [กฎการอัพเดตเอกสารนี้](#กฎการอัพเดตเอกสารนี้)

---

## ตารางฐานข้อมูลทั้งหมด

### สรุปภาพรวม

| ตาราง              | วัตถุประสงค์                                           | PK                | PK Type        | Inherit BaseEntity |
| ------------------ | ------------------------------------------------------ | ----------------- | -------------- | ------------------ |
| `TbUsers`                    | บัญชีผู้ใช้ระบบ (Login, สถานะล็อค)                      | `UserId`               | Guid (NEWID()) | ✅                 |
| `TbEmployees`                | ข้อมูลพนักงาน (ชื่อ, ตำแหน่ง, เงินเดือน, สถานะการจ้าง) | `EmployeeId`           | int (Identity) | ✅                 |
| `TbmPosition`                | ตำแหน่งงาน (Master Data)                                | `PositionId`           | int (Identity) | ✅                 |
| `TbmPermission`              | ประเภท operation — read, create, update, delete (Seed)  | `PermissionId`         | int (Identity) | ✅                 |
| `TbmModule`                  | โมดูลระบบ hierarchy — parent/child (Seed)               | `ModuleId`             | int (Identity) | ✅                 |
| `TbmAuthorizeMatrix`         | จับคู่ Module + Permission → PermissionPath (Seed)      | `AuthorizeMatrixId`    | int (Identity) | ✅                 |
| `TbAuthorizeMatrixPosition`  | กำหนดสิทธิ์ตำแหน่ง (Transaction)                        | `AuthMatrixPositionId` | int (Identity) | ✅                 |
| `TbMenus`                    | รายการเมนูอาหาร/เครื่องดื่ม (ชื่อ, ราคา, หมวดหมู่)     | `MenuId`               | int (Identity) | ✅                 |
| `TbServiceCharges`           | ตั้งค่า Service Charge (อัตราเปอร์เซ็นต์)              | `ServiceChargeId`      | int (Identity) | ✅                 |
| `TbShopSettings`             | ตั้งค่าร้านค้า (Singleton — ข้อมูลร้าน, โลโก้, QR Code) | `ShopSettingsId`       | int (Identity) | ✅                 |
| `TbShopOperatingHours`       | เวลาทำการรายวัน (7 records — จันทร์-อาทิตย์)            | `ShopOperatingHourId`  | int (Identity) | ✅                 |
| `TbFiles`                    | Metadata ไฟล์ที่อัพโหลด (อ้างอิง S3 Key)               | `FileId`               | int (Identity) | ✅                 |
| `TbRefreshTokens`            | JWT Refresh Token สำหรับต่ออายุ Access Token           | `RefreshTokenId`       | Guid (NEWID()) | ❌                 |
| `TbLoginHistory`             | ประวัติการเข้าสู่ระบบ (สำเร็จ/ล้มเหลว, IP)             | `LoginHistoryId`       | Guid (NEWID()) | ❌                 |

---

### รายละเอียดแต่ละตาราง

#### TbUsers — บัญชีผู้ใช้ระบบ

เก็บข้อมูล Login credentials และสถานะการล็อคบัญชี (Role ถูกลบ — ใช้ Position-based RBAC แทน)

| คอลัมน์                       | ชนิด         | จำเป็น | รายละเอียด                           |
| ----------------------------- | ------------ | ------ | ------------------------------------ |
| `UserId`                      | Guid         | ✅ PK  | Default: NEWID()                     |
| `Username`                    | varchar(255) | ✅     | ชื่อผู้ใช้ (Unique)                  |
| `Email`                       | varchar(255) | ✅     | อีเมล (Unique)                       |
| `PasswordHash`                | varchar(255) | ✅     | รหัสผ่านที่ Hash แล้ว                |
| `IsActive`                    | bit          | ✅     | เปิด/ปิดบัญชี (default: true)        |
| `FailedLoginAttempts`         | int          | ✅     | จำนวนครั้งที่ login ผิด (default: 0) |
| `LockedUntil`                 | datetime     | ❌     | ล็อคบัญชีถึงเวลาที่กำหนด             |
| `LastLoginDate`               | datetime     | ❌     | เข้าสู่ระบบสำเร็จครั้งล่าสุด         |
| `LastPasswordChangedDate`     | datetime     | ❌     | เปลี่ยนรหัสผ่านครั้งล่าสุด           |
| + Audit fields จาก BaseEntity |              |        |

**Indexes:** `IX_Users_Username` (Unique), `IX_Users_Email` (Unique), `IX_Users_IsActive`, `IX_Users_DeleteFlag`

---

#### TbEmployees — ข้อมูลพนักงาน

เก็บข้อมูลส่วนตัว, ตำแหน่งงาน, เงินเดือน, และบัญชีธนาคาร ของพนักงานทุกคน

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                  |
| ----------------------------- | ------------- | ------ | ------------------------------------------- |
| `EmployeeId`                  | int           | ✅ PK  | Identity auto-increment                     |
| `Title`                       | nvarchar      | ❌     | คำนำหน้า (นาย, นาง, น.ส.)                   |
| `FirstNameThai`               | nvarchar(255) | ✅     | ชื่อจริง (ภาษาไทย)                          |
| `LastNameThai`                | nvarchar(255) | ✅     | นามสกุล (ภาษาไทย)                           |
| `FirstNameEnglish`            | nvarchar(255) | ✅     | ชื่อจริง (ภาษาอังกฤษ)                       |
| `LastNameEnglish`             | nvarchar(255) | ✅     | นามสกุล (ภาษาอังกฤษ)                        |
| `Nickname`                    | nvarchar      | ❌     | ชื่อเล่น                                    |
| `Gender`                      | varchar(50)   | ✅     | Enum `EGender` (Male, Female, NotSpecified) |
| `DateOfBirth`                 | datetime      | ❌     | วันเกิด                                     |
| `StartDate`                   | datetime      | ✅     | วันที่เริ่มงาน                              |
| `EndDate`                     | datetime      | ❌     | วันที่สิ้นสุดการทำงาน                       |
| `NationalId`                  | nvarchar      | ❌     | เลขบัตรประชาชน                              |
| `BankAccountNumber`           | nvarchar      | ❌     | เลขบัญชีธนาคาร                              |
| `BankName`                    | nvarchar      | ❌     | ชื่อธนาคาร                                  |
| `EmploymentStatus`            | varchar(50)   | ✅     | Enum `EEmploymentStatus`                    |
| `PositionId`                  | int           | ❌     | FK → TbmPosition (ตำแหน่งงาน)               |
| `Phone`                       | nvarchar      | ❌     | เบอร์โทรศัพท์                               |
| `Email`                       | nvarchar      | ❌     | อีเมล                                       |
| `Salary`                      | decimal       | ❌     | เงินเดือน                                   |
| `ImageFileId`                 | int           | ❌     | FK → TbFiles (รูปโปรไฟล์)                   |
| `IsActive`                    | bit           | ✅     | เปิด/ปิด (default: true)                    |
| `UserId`                      | Guid          | ❌     | FK → TbUsers (บัญชีผู้ใช้ที่เชื่อมโยง)      |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_Employees_FirstNameThai`, `IX_Employees_LastNameThai`, `IX_Employees_NationalId`, `IX_Employees_Phone`, `IX_Employees_Email`, `IX_Employees_EmploymentStatus`, `IX_Employees_DeleteFlag`, `IX_Employees_UserId`, `IX_Employees_ImageFileId`, `IX_Employees_PositionId`

---

#### TbMenus — เมนูอาหาร/เครื่องดื่ม

เก็บรายการเมนูทั้งหมดของร้าน รวมชื่อ 2 ภาษา, ราคา, หมวดหมู่, และสถานะ

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                            |
| ----------------------------- | ------------- | ------ | ------------------------------------- |
| `MenuId`                      | int           | ✅ PK  | Identity auto-increment               |
| `NameThai`                    | nvarchar(255) | ✅     | ชื่อเมนู (ภาษาไทย)                    |
| `NameEnglish`                 | nvarchar(255) | ✅     | ชื่อเมนู (ภาษาอังกฤษ)                 |
| `Description`                 | nvarchar      | ❌     | คำอธิบายเมนู                          |
| `ImageFileId`                 | int           | ❌     | FK → TbFiles (รูปเมนู)                |
| `Price`                       | decimal(10,2) | ✅     | ราคา                                  |
| `Category`                    | varchar(50)   | ✅     | Enum `EMenuCategory` (Food, Beverage) |
| `IsActive`                    | bit           | ✅     | เปิด/ปิดเมนู (default: true)          |
| `IsAvailable`                 | bit           | ✅     | พร้อมขายหรือไม่ (default: true)       |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_Menus_NameThai`, `IX_Menus_NameEnglish`, `IX_Menus_Category`, `IX_Menus_IsActive`, `IX_Menus_IsAvailable`, `IX_Menus_DeleteFlag`, `IX_Menus_ImageFileId`

---

#### TbServiceCharges — ค่าบริการ

ตั้งค่าอัตรา Service Charge ที่เรียกเก็บเพิ่มจากลูกค้า

| คอลัมน์                       | ชนิด         | จำเป็น | รายละเอียด                                  |
| ----------------------------- | ------------ | ------ | ------------------------------------------- |
| `ServiceChargeId`             | int          | ✅ PK  | Identity auto-increment                     |
| `Name`                        | nvarchar     | ✅     | ชื่อการตั้งค่า (เช่น "Service Charge 3.5%") |
| `Description`                 | nvarchar     | ❌     | คำอธิบายเพิ่มเติม                           |
| `PercentageRate`              | decimal(5,2) | ✅     | อัตราเปอร์เซ็นต์ (เช่น 3.50)                |
| `IsActive`                    | bit          | ✅     | เปิด/ปิดใช้งาน (default: true)              |
| `StartDate`                   | datetime2    | ❌     | วันที่เริ่มมีผล (null = ไม่กำหนด)           |
| `EndDate`                     | datetime2    | ❌     | วันที่สิ้นสุด (null = ไม่กำหนด)             |
| + Audit fields จาก BaseEntity |              |        |

**Indexes:** `IX_ServiceCharges_IsActive`, `IX_ServiceCharges_DeleteFlag`, `IX_ServiceCharges_Name`, `IX_ServiceCharges_StartDate`, `IX_ServiceCharges_EndDate`

---

#### TbmPosition — ตำแหน่งงาน (Master Data)

เก็บตำแหน่งงานที่สร้างได้เอง ใช้เป็นฐานของระบบ Position-based RBAC

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด              |
| ----------------------------- | ------------- | ------ | ----------------------- |
| `PositionId`                  | int           | ✅ PK  | Identity auto-increment |
| `PositionName`                | nvarchar(100) | ✅     | ชื่อตำแหน่ง (Unique)     |
| `Description`                 | nvarchar(500) | ❌     | คำอธิบาย                |
| `IsActive`                    | bit           | ✅     | เปิด/ปิด (default: true) |
| + Audit fields จาก BaseEntity |               |        |

**Seed Data**: ผู้ดูแลระบบ (1), ผู้จัดการ (2), แคชเชียร์ (3)

**Indexes:** `IX_Position_PositionName` (Unique), `IX_Position_IsActive`, `IX_Position_DeleteFlag`

---

#### TbmPermission — ประเภท Operation (Master Data, Seed)

เก็บ 4 ประเภท operation ที่ใช้กับทุกโมดูล

| คอลัมน์                       | ชนิด         | จำเป็น | รายละเอียด              |
| ----------------------------- | ------------ | ------ | ----------------------- |
| `PermissionId`                | int          | ✅ PK  | Identity auto-increment |
| `PermissionName`              | nvarchar(50) | ✅     | ชื่อแสดงผล (เช่น "แสดง") |
| `PermissionCode`              | nvarchar(20) | ✅     | รหัส (Unique) — read, create, update, delete |
| `SortOrder`                   | int          | ✅     | ลำดับการแสดงผล            |
| + Audit fields จาก BaseEntity |              |        |

**Seed Data**: read (1), create (2), update (3), delete (4)

**Indexes:** `IX_Permission_PermissionCode` (Unique)

---

#### TbmModule — โมดูลระบบ (Master Data, Seed)

โครงสร้าง hierarchy ของโมดูล (Parent → Child) สำหรับจัดกลุ่มสิทธิ์

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                               |
| ----------------------------- | ------------- | ------ | ---------------------------------------- |
| `ModuleId`                    | int           | ✅ PK  | Identity auto-increment                  |
| `ModuleName`                  | nvarchar(100) | ✅     | ชื่อโมดูล (เช่น "จัดการพนักงาน")          |
| `ModuleCode`                  | nvarchar(50)  | ✅     | รหัส (Unique) — เช่น "employee"          |
| `ParentModuleId`              | int           | ❌     | FK → TbmModule (Self-ref, parent module) |
| `SortOrder`                   | int           | ✅     | ลำดับการแสดงผล                            |
| `IsActive`                    | bit           | ✅     | เปิด/ปิด (default: true)                 |
| + Audit fields จาก BaseEntity |               |        |

**Seed Data**: dashboard, admin-settings, human-resource, menu, order, table, payment, kitchen-display + child modules

**Indexes:** `IX_Module_ModuleCode` (Unique), `IX_Module_ParentModuleId`

---

#### TbmAuthorizeMatrix — จับคู่ Module + Permission (Master Data, Seed)

จับคู่ Module กับ Permission เป็น PermissionPath (เช่น `employee.create`)

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                    |
| ----------------------------- | ------------- | ------ | --------------------------------------------- |
| `AuthorizeMatrixId`           | int           | ✅ PK  | Identity auto-increment                       |
| `ModuleId`                    | int           | ✅     | FK → TbmModule                                |
| `PermissionId`                | int           | ✅     | FK → TbmPermission                            |
| `PermissionPath`              | nvarchar(100) | ✅     | Path (Unique) — เช่น "employee.create"        |
| + Audit fields จาก BaseEntity |               |        |

**Unique Constraint:** (`ModuleId`, `PermissionId`)

**Indexes:** `IX_AuthMatrix_PermissionPath` (Unique), `IX_AuthMatrix_ModuleId_PermissionId` (Unique)

---

#### TbAuthorizeMatrixPosition — กำหนดสิทธิ์ตำแหน่ง (Transaction)

ตาราง M:M เชื่อม AuthorizeMatrix กับ Position — row มี = ตำแหน่งนั้นมีสิทธิ์นั้น

| คอลัมน์                       | ชนิด | จำเป็น | รายละเอียด              |
| ----------------------------- | ---- | ------ | ----------------------- |
| `AuthMatrixPositionId`        | int  | ✅ PK  | Identity auto-increment |
| `AuthorizeMatrixId`           | int  | ✅     | FK → TbmAuthorizeMatrix |
| `PositionId`                  | int  | ✅     | FK → TbmPosition        |
| + Audit fields จาก BaseEntity |      |        |

**Unique Constraint:** (`AuthorizeMatrixId`, `PositionId`)

**Indexes:** `IX_AuthMatrixPosition_AuthMatrixId_PositionId` (Unique)

---

#### TbShopSettings — ตั้งค่าร้านค้า (Singleton)

เก็บข้อมูลตั้งค่าร้านค้า (1 record ต่อร้าน) รวมชื่อร้าน, โลโก้, ที่อยู่, ช่องทางติดต่อ, QR Code ชำระเงิน

| คอลัมน์                       | ชนิด           | จำเป็น | รายละเอียด                           |
| ----------------------------- | -------------- | ------ | ------------------------------------ |
| `ShopSettingsId`              | int            | ✅ PK  | Identity auto-increment              |
| `ShopNameThai`                | nvarchar(200)  | ✅     | ชื่อร้าน (ภาษาไทย)                   |
| `ShopNameEnglish`             | nvarchar(200)  | ✅     | ชื่อร้าน (ภาษาอังกฤษ)                |
| `CompanyNameThai`             | nvarchar(200)  | ❌     | ชื่อบริษัท (ภาษาไทย)                 |
| `CompanyNameEnglish`          | nvarchar(200)  | ❌     | ชื่อบริษัท (ภาษาอังกฤษ)              |
| `TaxId`                       | nvarchar(13)   | ✅     | เลขผู้เสียภาษี 13 หลัก               |
| `FoodType`                    | nvarchar(200)  | ✅     | ประเภทอาหาร (free text)              |
| `Description`                 | nvarchar(2000) | ❌     | รายละเอียดร้าน                        |
| `LogoFileId`                  | int            | ❌     | FK → TbFiles (โลโก้ร้าน, .png only) |
| `HasTwoPeriods`               | bit            | ✅     | toggle 2 ช่วงเวลา (default: false)  |
| `Address`                     | nvarchar(2000) | ✅     | ที่อยู่ (สำหรับใบเสร็จ)               |
| `PhoneNumber`                 | nvarchar(50)   | ✅     | เบอร์โทรศัพท์                         |
| `ShopEmail`                   | nvarchar(200)  | ❌     | อีเมลร้านค้า                          |
| `Facebook`                    | nvarchar(200)  | ❌     | Facebook                             |
| `Instagram`                   | nvarchar(200)  | ❌     | Instagram                            |
| `Website`                     | nvarchar(500)  | ❌     | Website URL                          |
| `LineId`                      | nvarchar(100)  | ❌     | Line ID                              |
| `PaymentQrCodeFileId`         | int            | ❌     | FK → TbFiles (QR Code, .png only)   |
| + Audit fields จาก BaseEntity |                |        |

**Seed Data**: 1 record (ShopSettingsId=1, required fields เป็น empty string)

**Indexes:** `IX_ShopSettings_LogoFileId`, `IX_ShopSettings_PaymentQrCodeFileId`, `IX_ShopSettings_DeleteFlag`

---

#### TbShopOperatingHours — เวลาทำการรายวัน

เก็บเวลาเปิด-ปิดแต่ละวัน (7 records — จันทร์ถึงอาทิตย์) แต่ละวันมีได้ 2 ช่วงเวลา

| คอลัมน์                       | ชนิด    | จำเป็น | รายละเอียด                                         |
| ----------------------------- | ------- | ------ | -------------------------------------------------- |
| `ShopOperatingHourId`         | int     | ✅ PK  | Identity auto-increment                            |
| `ShopSettingsId`              | int     | ✅     | FK → TbShopSettings                                |
| `DayOfWeek`                   | int     | ✅     | Enum `EDayOfWeek` (Monday=1 ... Sunday=7)          |
| `IsOpen`                      | bit     | ✅     | วันนี้เปิดหรือไม่ (default: false)                  |
| `OpenTime1`                   | time(7) | ❌     | ช่วงที่ 1 เวลาเปิด                                 |
| `CloseTime1`                  | time(7) | ❌     | ช่วงที่ 1 เวลาปิด                                  |
| `OpenTime2`                   | time(7) | ❌     | ช่วงที่ 2 เวลาเปิด                                 |
| `CloseTime2`                  | time(7) | ❌     | ช่วงที่ 2 เวลาปิด                                  |
| + Audit fields จาก BaseEntity |         |        |

**Seed Data**: 7 records (ShopOperatingHourId=1-7 — จันทร์ถึงอาทิตย์, IsOpen=false ทุกวัน)

**Unique Index:** `IX_ShopOperatingHour_ShopSettingsId_DayOfWeek` (ShopSettingsId, DayOfWeek)

---

#### TbFiles — Metadata ไฟล์

เก็บข้อมูลไฟล์ที่อัพโหลด (ชื่อ, ขนาด, MIME type) โดยไฟล์จริงอยู่บน S3 Storage

| คอลัมน์                       | ชนิด         | จำเป็น | รายละเอียด                           |
| ----------------------------- | ------------ | ------ | ------------------------------------ |
| `FileId`                      | int          | ✅ PK  | Identity auto-increment              |
| `FileName`                    | nvarchar     | ✅     | ชื่อไฟล์ต้นฉบับ (เช่น "product.jpg") |
| `MimeType`                    | varchar      | ✅     | MIME type (เช่น "image/jpeg")        |
| `FileExtension`               | varchar      | ✅     | นามสกุลไฟล์ (เช่น ".jpg")            |
| `FileSize`                    | bigint       | ✅     | ขนาดไฟล์ (bytes)                     |
| `S3Key`                       | varchar(500) | ✅     | S3 object key (Unique)               |
| + Audit fields จาก BaseEntity |              |        |

**Indexes:** `IX_Files_S3Key` (Unique), `IX_Files_DeleteFlag`

---

#### TbRefreshTokens — JWT Refresh Token

เก็บ Refresh Token สำหรับต่ออายุ Access Token โดยไม่ต้อง login ใหม่ (**ไม่ inherit BaseEntity**)

| คอลัมน์          | ชนิด         | จำเป็น | รายละเอียด                         |
| ---------------- | ------------ | ------ | ---------------------------------- |
| `RefreshTokenId` | Guid         | ✅ PK  | Default: NEWID()                   |
| `UserId`         | Guid         | ✅     | FK → TbUsers                       |
| `Token`          | varchar(500) | ✅     | ค่า Token (Unique)                 |
| `ExpiresAt`      | datetime     | ✅     | วันหมดอายุ                         |
| `IsRevoked`      | bit          | ✅     | ถูกเพิกถอนหรือไม่ (default: false) |
| `RevokedAt`      | datetime     | ❌     | เวลาที่เพิกถอน                     |
| `RevokedByIp`    | varchar      | ❌     | IP ที่เพิกถอน                      |
| `CreatedByIp`    | varchar      | ❌     | IP ที่สร้าง Token                  |
| `CreatedAt`      | datetime     | ✅     | เวลาที่สร้าง                       |

**Indexes:** `IX_RefreshTokens_Token` (Unique), `IX_RefreshTokens_UserId`, `IX_RefreshTokens_ExpiresAt`

---

#### TbLoginHistory — ประวัติการเข้าสู่ระบบ

บันทึกทุกครั้งที่มีการพยายาม login ทั้งสำเร็จและล้มเหลว (**ไม่ inherit BaseEntity**)

| คอลัมน์          | ชนิด         | จำเป็น | รายละเอียด                                       |
| ---------------- | ------------ | ------ | ------------------------------------------------ |
| `LoginHistoryId` | Guid         | ✅ PK  | Default: NEWID()                                 |
| `UserId`         | Guid         | ❌     | FK → TbUsers (nullable — login ผิดอาจไม่มี user) |
| `Username`       | varchar(255) | ✅     | Username ที่พยายาม login                         |
| `Success`        | bit          | ✅     | สำเร็จหรือไม่                                    |
| `FailureReason`  | nvarchar     | ❌     | สาเหตุที่ล้มเหลว                                 |
| `IpAddress`      | varchar      | ❌     | IP ที่ login                                     |
| `UserAgent`      | nvarchar     | ❌     | Browser/Client info                              |
| `LoginDate`      | datetime     | ✅     | เวลาที่ login                                    |

**Indexes:** `IX_LoginHistory_UserId`, `IX_LoginHistory_Username`, `IX_LoginHistory_LoginDate`, `IX_LoginHistory_IpAddress`

---

### Audit Fields (BaseEntity)

ทุกตารางที่ inherit `BaseEntity` จะมี field เหล่านี้อัตโนมัติ (DbContext auto-stamp):

| คอลัมน์      | ชนิด      | รายละเอียด                             |
| ------------ | --------- | -------------------------------------- |
| `CreatedAt`  | datetime  | เวลาที่สร้าง (auto)                    |
| `CreatedBy`  | int?      | FK → TbEmployees.EmployeeId (ผู้สร้าง) |
| `UpdatedAt`  | datetime? | เวลาที่แก้ไขล่าสุด (auto)              |
| `UpdatedBy`  | int?      | FK → TbEmployees.EmployeeId (ผู้แก้ไข) |
| `DeleteFlag` | bit       | Soft delete flag (default: false)      |
| `DeletedAt`  | datetime? | เวลาที่ลบ                              |
| `DeletedBy`  | int?      | FK → TbEmployees.EmployeeId (ผู้ลบ)    |

> **Global Query Filter**: ทุก query จะซ่อน record ที่ `DeleteFlag = true` อัตโนมัติ

---

## ความสัมพันธ์ของตาราง

### แผนภาพความสัมพันธ์

```
TbUsers (1) ─────────────────── (0..1) TbEmployees
   │                                      │
   ├── (1) ──── (M) TbRefreshTokens       ├── (M) ──── (1) TbFiles (ImageFile)
   └── (1) ──── (M) TbLoginHistory        ├── (M) ──── (1) TbmPosition
                                           │
TbMenus (M) ──────────────────── (1) TbFiles (ImageFile)

TbShopSettings (1) ──── (M) TbShopOperatingHours
   ├── (M) ──── (1) TbFiles (LogoFile)
   └── (M) ──── (1) TbFiles (PaymentQrCodeFile)

TbmPosition (1) ──── (M) TbAuthorizeMatrixPosition ──── (M) TbmAuthorizeMatrix (1)
                                                              │
                              TbmModule (1) ─────────────────┤
                              (self-ref: ParentModuleId)      │
                              TbmPermission (1) ─────────────┘

BaseEntity (CreatedBy/UpdatedBy) ── (0..1) TbEmployees (ทุกตารางที่ inherit)
```

### รายละเอียดความสัมพันธ์

| ความสัมพันธ์                                  | ชนิด           | FK                                        | Delete Behavior | คำอธิบาย                                                |
| --------------------------------------------- | -------------- | ----------------------------------------- | --------------- | ------------------------------------------------------- |
| TbUsers ↔ TbEmployees                         | 1:1 (Optional) | `TbEmployees.UserId`                      | Restrict        | พนักงาน 1 คนเชื่อมกับบัญชีผู้ใช้ได้ 1 บัญชี (ไม่บังคับ) |
| TbUsers → TbRefreshTokens                     | 1:M            | `TbRefreshTokens.UserId`                  | Restrict        | ผู้ใช้ 1 คนมีได้หลาย Refresh Token                      |
| TbUsers → TbLoginHistory                      | 1:M            | `TbLoginHistory.UserId`                   | Restrict        | ผู้ใช้ 1 คนมีประวัติ login ได้หลายรายการ                |
| TbEmployees → TbFiles                         | M:1 (Optional) | `TbEmployees.ImageFileId`                 | Restrict        | พนักงานมีรูปโปรไฟล์ได้ 1 รูป                            |
| TbEmployees → TbmPosition                     | M:1 (Optional) | `TbEmployees.PositionId`                  | Restrict        | พนักงานมีตำแหน่งได้ 1 ตำแหน่ง                           |
| TbmModule → TbmModule (Self-ref)              | M:1 (Optional) | `TbmModule.ParentModuleId`                | Restrict        | โมดูล hierarchy (parent → child)                        |
| TbmAuthorizeMatrix → TbmModule                | M:1            | `TbmAuthorizeMatrix.ModuleId`             | Restrict        | Matrix จับคู่กับ 1 module                               |
| TbmAuthorizeMatrix → TbmPermission            | M:1            | `TbmAuthorizeMatrix.PermissionId`         | Restrict        | Matrix จับคู่กับ 1 permission type                      |
| TbAuthorizeMatrixPosition → TbmAuthorizeMatrix | M:1            | `TbAuthorizeMatrixPosition.AuthorizeMatrixId` | Cascade     | กำหนดสิทธิ์ตำแหน่ง → matrix entry                       |
| TbAuthorizeMatrixPosition → TbmPosition       | M:1            | `TbAuthorizeMatrixPosition.PositionId`    | Cascade         | กำหนดสิทธิ์ตำแหน่ง → ตำแหน่ง                            |
| TbMenus → TbFiles                             | M:1 (Optional) | `TbMenus.ImageFileId`                     | Restrict        | เมนูมีรูปภาพได้ 1 รูป                                   |
| TbShopSettings → TbFiles (Logo)               | M:1 (Optional) | `TbShopSettings.LogoFileId`               | Restrict        | ร้านมีโลโก้ได้ 1 รูป (.png only)                        |
| TbShopSettings → TbFiles (QR Code)            | M:1 (Optional) | `TbShopSettings.PaymentQrCodeFileId`      | Restrict        | ร้านมี QR Code ชำระเงินได้ 1 รูป (.png only)            |
| TbShopSettings → TbShopOperatingHours         | 1:M            | `TbShopOperatingHours.ShopSettingsId`     | Cascade         | ร้าน 1 แห่งมีเวลาทำการ 7 วัน                            |
| BaseEntity → TbEmployees (CreatedBy)          | M:1 (Optional) | `CreatedBy`                               | Restrict        | ทุก Entity ติดตามผู้สร้าง                               |
| BaseEntity → TbEmployees (UpdatedBy)          | M:1 (Optional) | `UpdatedBy`                               | Restrict        | ทุก Entity ติดตามผู้แก้ไข                               |

> **หมายเหตุ**: ทุกความสัมพันธ์ใช้ `DeleteBehavior.Restrict` ยกเว้น TbAuthorizeMatrixPosition ที่ใช้ `Cascade` — เมื่อลบตำแหน่งหรือ matrix entry จะลบ mapping ด้วย

---

## API Endpoints ทั้งหมด

### สรุปจำนวน

| Controller     | Route Prefix               | จำนวน Endpoints | Auth    | Permission                 |
| -------------- | -------------------------- | --------------- | ------- | -------------------------- |
| Auth           | `api/admin/auth`           | 7               | บางเส้น | —                          |
| Positions      | `api/admin/positions`      | 10              | ทุกเส้น | `position.*`               |
| Menus          | `api/menu`                 | 8               | ทุกเส้น | `menu-item.*`              |
| HumanResource  | `api/humanresource`        | 10              | ทุกเส้น | `employee.*`               |
| ServiceCharges | `api/admin/servicecharges` | 6               | ทุกเส้น | `service-charge.*`         |
| ShopSettings   | `api/admin/shop-settings`  | 4               | ทุกเส้น | `shop-settings.*` / บางเส้นไม่ต้อง |
| File           | `api/admin/file`           | 1               | ทุกเส้น | —                          |
| **รวม**        |                            | **42**          |         |                            |

---

### Positions — จัดการตำแหน่งและสิทธิ์

Route prefix: `api/admin/positions`

| Method | Endpoint                    | วัตถุประสงค์                            | Permission       | Request                          | Response                                        |
| ------ | --------------------------- | --------------------------------------- | ---------------- | -------------------------------- | ----------------------------------------------- |
| GET    | `/`                         | ดึงตำแหน่งทั้งหมด (แบ่งหน้า)            | `position.read`  | `PaginationModel`                | `PaginationResult<PositionResponseModel>`       |
| GET    | `/{positionId}`             | ดึงตำแหน่งตาม ID                        | `position.read`  | URL param                        | `BaseResponseModel<PositionResponseModel>`      |
| POST   | `/`                         | สร้างตำแหน่งใหม่                         | `position.create`| JSON: `CreatePositionRequestModel`| `BaseResponseModel<PositionResponseModel>`     |
| PUT    | `/{positionId}`             | แก้ไขตำแหน่ง                             | `position.update`| JSON: `UpdatePositionRequestModel`| `BaseResponseModel<PositionResponseModel>`     |
| DELETE | `/{positionId}`             | ลบตำแหน่ง (Soft delete)                  | `position.delete`| URL param                        | `BaseResponseModel<object>`                     |
| GET    | `/{positionId}/permissions` | ดึง Permission Matrix ของตำแหน่ง        | `position.read`  | URL param                        | `BaseResponseModel<PermissionMatrixResponseModel>` |
| PUT    | `/{positionId}/permissions` | อัปเดตสิทธิ์ของตำแหน่ง                   | `position.update`| JSON: `UpdatePermissionsRequestModel`| `BaseResponseModel<object>`                 |
| GET    | `/dropdown`                 | ดึงตำแหน่งสำหรับ Dropdown (Active only)  | —                | —                                | `ListResponseModel<PositionDropdownModel>`      |
| GET    | `/modules/tree`             | ดึง Module Tree สำหรับ Permission UI     | `position.read`  | —                                | `BaseResponseModel<ModuleTreeResponseModel>`    |
| GET    | `/me/permissions`           | ดึงสิทธิ์ของ user ปัจจุบัน               | —                | —                                | `ListResponseModel<string>`                     |

> **หมายเหตุ**: `/dropdown` และ `/me/permissions` ไม่ต้องตรวจ permission — ใช้ได้ทุกคนที่ login แล้ว

---

### Auth — การยืนยันตัวตน

Route prefix: `api/admin/auth`

| Method | Endpoint         | วัตถุประสงค์                            | Auth | Request                    | Response                                |
| ------ | ---------------- | --------------------------------------- | ---- | -------------------------- | --------------------------------------- |
| POST   | `/login`         | เข้าสู่ระบบด้วย Username + Password     | ❌   | `LoginRequestModel`        | `BaseResponseModel<LoginResponseModel>` |
| POST   | `/logout`        | ออกจากระบบ + เพิกถอน Refresh Token      | ✅   | `RefreshTokenRequestModel` | `BaseResponseModel<object>`             |
| POST   | `/refresh-token` | ต่ออายุ Access Token ด้วย Refresh Token | ❌   | `RefreshTokenRequestModel` | `BaseResponseModel<TokenResponseModel>` |
| POST   | `/forgot-password` | ส่ง OTP สำหรับรีเซ็ตรหัสผ่าน          | ❌   | `ForgotPasswordRequestModel` | `BaseResponseModel<ForgotPasswordResponseModel>` |
| POST   | `/verify-otp`    | ตรวจสอบ OTP                             | ❌   | `VerifyOtpRequestModel`    | `BaseResponseModel<VerifyOtpResponseModel>` |
| POST   | `/reset-password`| รีเซ็ตรหัสผ่านด้วย Reset Token         | ❌   | `ResetPasswordRequestModel`| `BaseResponseModel<object>`             |
| POST   | `/verify-password`| ยืนยันรหัสผ่านสำหรับ session extension | ✅   | `VerifyPasswordRequestModel`| `BaseResponseModel<bool>`              |

**LoginResponseModel** — Response ของ `/login` endpoint:

| ฟิลด์          | ชนิด              | รายละเอียด                                |
| --------------- | --------------- | ----------------------------------------- |
| `AccessToken`   | string          | JWT Access Token                          |
| `RefreshToken`  | string          | Refresh Token สำหรับต่ออายุ token          |
| `User`          | `UserModel`     | ข้อมูลผู้ใช้ที่เข้าสู่ระบบ                 |

**UserModel** — ข้อมูลผู้ใช้ในการตอบสนอง (ใช้ใน LoginResponseModel + `/me/permissions` endpoint):

| ฟิลด์                | ชนิด            | จำเป็น | รายละเอียด                                           |
| -------------------- | --------------- | ------ | ---------------------------------------------------- |
| `UserId`             | Guid            | ✅     | ID ของบัญชีผู้ใช้                                    |
| `Username`           | string          | ✅     | ชื่อผู้ใช้ที                                          |
| `Email`              | string          | ✅     | อีเมลบัญชี                                           |
| `EmployeeId`         | int?            | ❌     | FK → TbEmployees.EmployeeId (nullable)              |
| `Nickname`           | string?         | ❌     | ชื่อเล่นพนักงาน จาก TbEmployee.Nickname              |
| `ProfileImageFileId` | int?            | ❌     | FK → TbFiles.FileId (รูปโปรไฟล์ จาก TbEmployee.ImageFileId) |
| `PositionId`         | int?            | ❌     | FK → TbmPosition.PositionId                          |
| `PositionName`       | string?         | ❌     | ชื่อตำแหน่ง (อ่านจาก TbmPosition.PositionName)        |
| `Permissions`        | List<string>    | ✅     | รายการสิทธิ์ทั้งหมด (เช่น "employee.read", "employee.create") |

---

### Menus — จัดการเมนูอาหาร

Route prefix: `api/menu`

| Method | Endpoint               | วัตถุประสงค์                       | Request                                       | Response                               |
| ------ | ---------------------- | ---------------------------------- | --------------------------------------------- | -------------------------------------- |
| GET    | `/`                    | ดึงเมนูทั้งหมด                     | —                                             | `ListResponseModel<MenuResponseModel>` |
| GET    | `/{menuId}`            | ดึงเมนูตาม ID                      | URL param                                     | `BaseResponseModel<MenuResponseModel>` |
| GET    | `/category/{category}` | ดึงเมนูตามหมวดหมู่ (Food/Beverage) | URL param: `EMenuCategory`                    | `ListResponseModel<MenuResponseModel>` |
| GET    | `/available`           | ดึงเฉพาะเมนูที่พร้อมขาย            | —                                             | `ListResponseModel<MenuResponseModel>` |
| GET    | `/search`              | ค้นหาเมนูจากชื่อ                   | Query: `searchTerm`                           | `ListResponseModel<MenuResponseModel>` |
| POST   | `/`                    | สร้างเมนูใหม่ (พร้อมรูปภาพ)        | Form: `CreateMenuRequestModel` + `IFormFile?` | `BaseResponseModel<MenuResponseModel>` |
| PUT    | `/{menuId}`            | แก้ไขเมนู (พร้อมรูปภาพ)            | Form: `UpdateMenuRequestModel` + `IFormFile?` | `BaseResponseModel<MenuResponseModel>` |
| DELETE | `/{menuId}`            | ลบเมนู (Soft delete)               | URL param                                     | `BaseResponseModel<object>`            |

> Upload รูปภาพ: ขนาดสูงสุด 10MB — Controller อัพโหลดไฟล์ผ่าน `IFileService` ก่อน แล้วส่ง `FileId` ให้ `IMenuService`

---

### HumanResource — จัดการพนักงาน

Route prefix: `api/humanresource`

| Method | Endpoint           | วัตถุประสงค์                           | Request                                           | Response                                   |
| ------ | ------------------ | -------------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| GET    | `/`                | ดึงพนักงานที่ยังทำงานอยู่ทั้งหมด       | —                                                 | `ListResponseModel<EmployeeResponseModel>` |
| GET    | `/{employeeId}`    | ดึงข้อมูลพนักงานตาม ID                 | URL param                                         | `BaseResponseModel<EmployeeResponseModel>` |
| GET    | `/status/{status}` | ดึงพนักงานตามสถานะการจ้าง              | URL param: `EEmploymentStatus`                    | `ListResponseModel<EmployeeResponseModel>` |
| GET    | `/user/{userId}`   | ดึงพนักงานจาก User ID ที่เชื่อมโยง     | URL param: `Guid`                                 | `BaseResponseModel<EmployeeResponseModel>` |
| GET    | `/search`          | ค้นหาพนักงาน (ชื่อ, เลขบัตร, เบอร์โทร) | Query: `searchTerm`                               | `ListResponseModel<EmployeeResponseModel>` |
| POST   | `/`                | เพิ่มพนักงานใหม่ (พร้อมรูป)            | Form: `CreateEmployeeRequestModel` + `IFormFile?` | `BaseResponseModel<EmployeeResponseModel>` |
| PUT    | `/{employeeId}`    | แก้ไขข้อมูลพนักงาน (พร้อมรูป)          | Form: `UpdateEmployeeRequestModel` + `IFormFile?` | `BaseResponseModel<EmployeeResponseModel>` |
| DELETE | `/{employeeId}`    | ลบพนักงาน (Soft delete)                | URL param                                         | `BaseResponseModel<object>`                |
| GET    | `/me`                       | ดึงข้อมูลโปรไฟล์ตัวเอง (ไม่ต้อง permission) | —                                                 | `BaseResponseModel<MyProfileResponseModel>`         |
| POST   | `/{employeeId}/create-user` | สร้างบัญชีผู้ใช้สำหรับพนักงาน | URL param                                         | `BaseResponseModel<CreateUserAccountResponseModel>` |

---

### ServiceCharges — ตั้งค่า Service Charge

Route prefix: `api/admin/servicecharges`

| Method | Endpoint             | วัตถุประสงค์                                  | Request                                 | Response                                        |
| ------ | -------------------- | --------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| GET    | `/`                  | ดึง Service Charge ทั้งหมด                    | —                                       | `ListResponseModel<ServiceChargeResponseModel>` |
| GET    | `/{serviceChargeId}` | ดึง Service Charge ตาม ID                     | URL param                               | `BaseResponseModel<ServiceChargeResponseModel>` |
| GET    | `/dropdown`          | ดึง SC ที่ Active + อยู่ในช่วงวันที่ สำหรับ Dropdown | —                                       | `ListResponseModel<ServiceChargeDropdownModel>` |
| POST   | `/`                  | สร้าง Service Charge ใหม่                     | JSON: `CreateServiceChargeRequestModel` | `BaseResponseModel<ServiceChargeResponseModel>` |
| PUT    | `/{serviceChargeId}` | แก้ไข Service Charge                          | JSON: `UpdateServiceChargeRequestModel` | `BaseResponseModel<ServiceChargeResponseModel>` |
| DELETE | `/{serviceChargeId}` | ลบ Service Charge (Hard delete — ลบถาวร)     | URL param                               | `BaseResponseModel<object>`                     |

---

### ShopSettings — ตั้งค่าร้านค้า

Route prefix: `api/admin/shop-settings`

| Method | Endpoint    | วัตถุประสงค์                                      | Permission              | Request                                                          | Response                                            |
| ------ | ----------- | ------------------------------------------------- | ----------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| GET    | `/branding` | ดึงข้อมูล Branding ร้าน (ชื่อร้าน + โลโก้)        | — (ทุกคนที่ login)       | —                                                                | `BaseResponseModel<ShopBrandingResponseModel>`      |
| GET    | `/welcome`  | ดึงข้อมูลร้านสำหรับหน้า Welcome (ไม่ต้อง permission) | —                       | —                                                                | `BaseResponseModel<WelcomeShopInfoResponseModel>`   |
| GET    | `/`         | ดึงข้อมูลตั้งค่าร้านค้า (Singleton)                | `shop-settings.read`    | —                                                                | `BaseResponseModel<ShopSettingsResponseModel>`      |
| PUT    | `/`         | อัปเดตข้อมูลร้านค้า (พร้อมโลโก้ + QR Code)        | `shop-settings.update`  | Form: `UpdateShopSettingsRequestModel` + `IFormFile?` x2 (logo, qrCode) | `BaseResponseModel<ShopSettingsResponseModel>` |

> **หมายเหตุ**: `/branding` ไม่ต้องตรวจ permission — ใช้ได้ทุกคนที่ login แล้ว (`[Authorize]` เท่านั้น) — Response: `ShopBrandingResponseModel` มี `ShopNameEnglish` (string), `LogoFileId` (int?)
> Singleton record — ไม่มี POST (Create) / DELETE — seed ไว้ 1 record ตั้งแต่ migration
> Upload ไฟล์: รับเฉพาะ `.png` เท่านั้น — validate ทั้ง Frontend (MIME check) และ Backend (ContentType check)
> Operating Hours ส่งเป็น array ใน FormData format: `OperatingHours[0].DayOfWeek`, `OperatingHours[0].IsOpen`, ...

---

### File — จัดการไฟล์

Route prefix: `api/admin/file`

| Method | Endpoint    | วัตถุประสงค์        | Request   | Response           |
| ------ | ----------- | ------------------- | --------- | ------------------ |
| GET    | `/{fileId}` | ดาวน์โหลดไฟล์ตาม ID | URL param | Binary file stream |

> **หมายเหตุ**: การอัพโหลดไฟล์ทำผ่าน Menus, HumanResource, และ ShopSettings Controller (ไม่มี endpoint อัพโหลดแยก)

---

## กฎการอัพเดตเอกสารนี้

> **บังคับ**: เมื่อพัฒนาฟีเจอร์ที่กระทบฐานข้อมูลหรือ API ต้องอัพเดตเอกสารนี้ทันทีหลังเขียนโค้ดเสร็จ

### เมื่อต้องอัพเดต

| เหตุการณ์                         | ส่วนที่ต้องอัพเดต                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| สร้าง Entity ใหม่                 | เพิ่มในตาราง [สรุปภาพรวม](#สรุปภาพรวม) + สร้างหัวข้อรายละเอียดตารางใหม่                              |
| เพิ่ม/แก้ไข Column ใน Entity      | อัพเดตตารางรายละเอียดของ Entity นั้น                                                                 |
| เพิ่มความสัมพันธ์ใหม่ (FK)        | อัพเดต [แผนภาพความสัมพันธ์](#แผนภาพความสัมพันธ์) + [รายละเอียดความสัมพันธ์](#รายละเอียดความสัมพันธ์) |
| สร้าง Controller / Endpoint ใหม่  | เพิ่มในตาราง [สรุปจำนวน](#สรุปจำนวน) + สร้างหัวข้อ endpoint ใหม่                                     |
| เพิ่ม Endpoint ใน Controller เดิม | อัพเดตตาราง endpoint ของ Controller นั้น                                                             |
| ลบ Endpoint                       | ลบออกจากตาราง + อัพเดตจำนวน                                                                          |

### ขั้นตอนการอัพเดต

1. เขียนโค้ด Entity / Controller / Endpoint เสร็จ
2. เปิดไฟล์ `doc/architecture/database-api-reference.md`
3. อัพเดตทุกส่วนที่เกี่ยวข้อง (ตามตารางด้านบน)
4. อัพเดตวันที่ "อัพเดตล่าสุด" ที่หัวเอกสาร

### รูปแบบการเขียน

- ใช้ภาษาไทยเป็นหลัก (คำเทคนิคใช้อังกฤษได้)
- ตารางรายละเอียดคอลัมน์ใช้รูปแบบ: `คอลัมน์ | ชนิด | จำเป็น | รายละเอียด`
- ตาราง Endpoint ใช้รูปแบบ: `Method | Endpoint | วัตถุประสงค์ | Request | Response`
- ระบุ FK ให้ชัดเจนว่าชี้ไปตารางไหน
- ระบุ Delete Behavior ของทุกความสัมพันธ์
