# อ้างอิงฐานข้อมูลและ API — RBMS-POS

> อัพเดตล่าสุด: 2026-03-21

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

| ตาราง              | วัตถุประสงค์                                           | PK                | PK Type        | Inherit BaseEntity | Delete Mode |
| ------------------ | ------------------------------------------------------ | ----------------- | -------------- | ------------------ | ----------- |
| `TbUsers`                    | บัญชีผู้ใช้ระบบ (Login, สถานะล็อค)                      | `UserId`               | Guid (NEWID()) | ✅                 | Soft |
| `TbEmployees`                | ข้อมูลพนักงาน (ชื่อ, ตำแหน่ง, เงินเดือน, สถานะการจ้าง) | `EmployeeId`           | int (Identity) | ✅                 | Soft |
| `TbmPosition`                | ตำแหน่งงาน (Master Data)                                | `PositionId`           | int (Identity) | ✅                 | Soft |
| `TbmPermission`              | ประเภท operation — read, create, update, delete (Seed)  | `PermissionId`         | int (Identity) | ✅                 | Soft |
| `TbmModule`                  | โมดูลระบบ hierarchy — parent/child (Seed)               | `ModuleId`             | int (Identity) | ✅                 | Soft |
| `TbmAuthorizeMatrix`         | จับคู่ Module + Permission → PermissionPath (Seed)      | `AuthorizeMatrixId`    | int (Identity) | ✅                 | Soft |
| `TbAuthorizeMatrixPosition`  | กำหนดสิทธิ์ตำแหน่ง (Transaction)                        | `AuthMatrixPositionId` | int (Identity) | ✅                 | Soft |
| `TbMenus`                    | รายการเมนู (ชื่อ, ราคา, ต้นทุน, ตัวเลือกเสริม, ช่วงเวลาขาย) | `MenuId`           | int (Identity) | ✅                 | Soft |
| `TbMenuSubCategories`        | หมวดหมู่ย่อยของเมนู (แยกตามประเภทหลัก)                  | `SubCategoryId`        | int (Identity) | ✅                 | Soft |
| `TbOptionGroups`             | กลุ่มตัวเลือกเสริม (เช่น ระดับความเผ็ด, ท็อปปิ้ง)       | `OptionGroupId`        | int (Identity) | ✅                 | **Hard** |
| `TbOptionItems`              | รายการตัวเลือกในกลุ่ม (เช่น เผ็ดน้อย, เผ็ดมาก)          | `OptionItemId`         | int (Identity) | ✅                 | **Hard** |
| `TbMenuOptionGroups`         | ตาราง M:M เชื่อมเมนูกับกลุ่มตัวเลือก                    | `MenuOptionGroupId`    | int (Identity) | ✅                 | **Hard** |
| `TbServiceCharges`           | ตั้งค่า Service Charge (อัตราเปอร์เซ็นต์)              | `ServiceChargeId`      | int (Identity) | ✅                 | Soft |
| `TbShopSettings`             | ตั้งค่าร้านค้า (Singleton — ข้อมูลร้าน, โลโก้, QR Code) | `ShopSettingsId`       | int (Identity) | ✅                 | Soft |
| `TbShopOperatingHours`       | เวลาทำการรายวัน (7 records — จันทร์-อาทิตย์)            | `ShopOperatingHourId`  | int (Identity) | ✅                 | Soft |
| `TbFiles`                    | Metadata ไฟล์ที่อัพโหลด (อ้างอิง S3 Key)               | `FileId`               | int (Identity) | ✅                 | Soft |
| `TbRefreshTokens`            | JWT Refresh Token สำหรับต่ออายุ Access Token           | `RefreshTokenId`       | Guid (NEWID()) | ❌                 | — |
| `TbZones`                    | โซนพื้นที่ร้าน (เช่น ชั้น 1, ระเบียง, VIP)            | `ZoneId`               | int (Identity) | ✅                 | Soft |
| `TbTables`                   | โต๊ะในร้าน (ชื่อ, ตำแหน่ง, สถานะ, QR Token)           | `TableId`              | int (Identity) | ✅                 | Soft |
| `TbTableLinks`               | เชื่อมโต๊ะที่รวมกัน (GroupCode)                        | `TableLinkId`          | int (Identity) | ✅                 | **Hard** |
| `TbReservations`             | การจองโต๊ะ (ลูกค้า, วันเวลา, สถานะ)                   | `ReservationId`        | int (Identity) | ✅                 | Soft |
| `TbCashierSessions`         | เซสชั่นแคชเชียร์ (เปิด/ปิดกะ, สรุปยอด)               | `CashierSessionId`     | int (Identity) | ✅                 | Soft |
| `TbCashDrawerTransactions`   | รายการเงินสดเข้า-ออกลิ้นชัก                           | `CashDrawerTransactionId` | int (Identity) | ✅              | Soft |
| `TbPayments`                 | การชำระเงิน (เงินสด/QR ต่อบิล)                        | `PaymentId`            | int (Identity) | ✅                 | Soft |
| `TbNotifications`            | การแจ้งเตือน real-time สำหรับ staff (ข้อมูลชั่วคราว)    | `NotificationId`       | int (Identity) | ❌                 | **Hard** |
| `TbNotificationReads`        | สถานะอ่าน/เคลียร์ per-user ของ notification            | `NotificationReadId`   | int (Identity) | ❌                 | **Hard** |

> **Hard Delete**: `TbOptionGroups`, `TbOptionItems`, `TbMenuOptionGroups`, `TbTableLinks`, `TbNotifications`, `TbNotificationReads` ใช้ hard delete — ไม่มี global query filter สำหรับ DeleteFlag

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
| `LockoutCount`                | int          | ✅     | จำนวนครั้งที่ถูกล็อคอัตโนมัติ (default: 0) |
| `LockedUntil`                 | datetime     | ❌     | ล็อคบัญชีถึงเวลาที่กำหนด (auto-lock) |
| `LastLoginDate`               | datetime     | ❌     | เข้าสู่ระบบสำเร็จครั้งล่าสุด         |
| `LastPasswordChangedDate`     | datetime     | ❌     | เปลี่ยนรหัสผ่านครั้งล่าสุด           |
| `IsLockedByAdmin`             | bit          | ✅     | ล็อคโดยผู้ดูแลระบบ (default: false)  |
| `AutoUnlockDate`              | datetime     | ❌     | วันที่ปลดล็อคอัตโนมัติ (admin lock)  |
| `PinCodeHash`                 | nvarchar(256)| ❌     | PIN Code ที่ Hash แล้ว (สำหรับใช้ในอนาคต) |
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

#### TbMenus — เมนูอาหาร/เครื่องดื่ม/ของหวาน

เก็บรายการเมนูทั้งหมดของร้าน — ชื่อ 2 ภาษา, ราคา, ต้นทุน, หมวดหมู่ย่อย, ตัวเลือกเสริม, ช่วงเวลาขาย, tag, สารก่อภูมิแพ้, แคลอรี

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                   |
| ----------------------------- | ------------- | ------ | -------------------------------------------- |
| `MenuId`                      | int           | ✅ PK  | Identity auto-increment                      |
| `NameThai`                    | nvarchar(255) | ✅     | ชื่อเมนู (ภาษาไทย)                           |
| `NameEnglish`                 | nvarchar(255) | ✅     | ชื่อเมนู (ภาษาอังกฤษ)                        |
| `Description`                 | nvarchar      | ❌     | คำอธิบายเมนู                                 |
| `ImageFileId`                 | int           | ❌     | FK → TbFiles (รูปเมนู)                       |
| `SubCategoryId`               | int           | ✅     | FK → TbMenuSubCategories (หมวดหมู่ย่อย)      |
| `Price`                       | decimal(10,2) | ✅     | ราคาขาย                                      |
| `CostPrice`                   | decimal(10,2) | ❌     | ราคาต้นทุน                                   |
| `IsAvailable`                 | bit           | ✅     | พร้อมขายหรือไม่ (default: true)              |
| `IsAvailablePeriod1`          | bit           | ✅     | ขายในช่วงเวลาที่ 1 (default: true)           |
| `IsAvailablePeriod2`          | bit           | ✅     | ขายในช่วงเวลาที่ 2 (default: true)           |
| `Tags`                        | int           | ✅     | Flags `EMenuTag` — None=0, Recommended=1, Seasonal=2, SlowPreparation=4 (default: 0) |
| `Allergens`                   | nvarchar(500) | ❌     | สารก่อภูมิแพ้ (free text)                    |
| `CaloriesPerServing`          | decimal(8,2)  | ❌     | แคลอรีต่อหน่วย                               |
| `IsPinned`                    | bit           | ✅     | ปักหมุดเมนู (default: false)                 |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_Menus_NameThai`, `IX_Menus_NameEnglish`, `IX_Menus_SubCategoryId`, `IX_Menus_IsAvailable`, `IX_Menus_IsPinned`, `IX_Menus_Tags`, `IX_Menus_DeleteFlag`, `IX_Menus_ImageFileId`

---

#### TbMenuSubCategories — หมวดหมู่ย่อย

เก็บหมวดหมู่ย่อยของเมนู แยกตามประเภทหลัก (อาหาร/เครื่องดื่ม/ของหวาน) — Soft delete

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                                   |
| ----------------------------- | ------------- | ------ | ------------------------------------------------------------ |
| `SubCategoryId`               | int           | ✅ PK  | Identity auto-increment                                      |
| `CategoryType`                | int           | ✅     | ประเภทหลัก — Enum `EMenuCategory` (Food=1, Beverage=2, Dessert=3) |
| `Name`                        | nvarchar(100) | ✅     | ชื่อหมวดหมู่ย่อย (เช่น "อาหารจานเดียว", "กาแฟ")              |
| `SortOrder`                   | int           | ✅     | ลำดับการแสดงผล (default: 0)                                   |
| `IsActive`                    | bit           | ✅     | เปิด/ปิด (default: true)                                     |
| + Audit fields จาก BaseEntity |               |        |

**Seed Data:** 3 records — "ทั่วไป" สำหรับแต่ละประเภท (Food=1, Beverage=2, Dessert=3)

**Indexes:** `IX_MenuSubCategory_CategoryType`, `IX_MenuSubCategory_IsActive`, `IX_MenuSubCategory_DeleteFlag`

---

#### TbOptionGroups — กลุ่มตัวเลือกเสริม

เก็บกลุ่มตัวเลือกเสริม (เช่น ระดับความเผ็ด, ท็อปปิ้ง) — **Hard delete** (ลบได้เมื่อไม่มีเมนูผูก)

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                                   |
| ----------------------------- | ------------- | ------ | ------------------------------------------------------------ |
| `OptionGroupId`               | int           | ✅ PK  | Identity auto-increment                                      |
| `Name`                        | nvarchar(100) | ✅     | ชื่อกลุ่มตัวเลือก (เช่น "ระดับความเผ็ด")                     |
| `CategoryType`                | int           | ✅     | ประเภทหลัก — Enum `EMenuCategory` (Food=1, Beverage=2, Dessert=3) |
| `IsRequired`                  | bit           | ✅     | บังคับเลือกหรือไม่ (default: false)                           |
| `MinSelect`                   | int           | ✅     | จำนวนขั้นต่ำที่ต้องเลือก (default: 0)                         |
| `MaxSelect`                   | int           | ❌     | จำนวนสูงสุดที่เลือกได้ (null = ไม่จำกัด)                      |
| `SortOrder`                   | int           | ✅     | ลำดับการแสดงผล (default: 0)                                   |
| `IsActive`                    | bit           | ✅     | เปิด/ปิด (default: true)                                     |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_OptionGroup_CategoryType`, `IX_OptionGroup_IsActive`

---

#### TbOptionItems — รายการตัวเลือก

เก็บรายการตัวเลือกในแต่ละกลุ่ม (เช่น เผ็ดน้อย, เผ็ดกลาง, เผ็ดมาก) — **Hard delete** (cascade จาก OptionGroup)

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                           |
| ----------------------------- | ------------- | ------ | ------------------------------------ |
| `OptionItemId`                | int           | ✅ PK  | Identity auto-increment              |
| `OptionGroupId`               | int           | ✅     | FK → TbOptionGroups (cascade delete) |
| `Name`                        | nvarchar(100) | ✅     | ชื่อตัวเลือก (เช่น "เผ็ดมาก")        |
| `AdditionalPrice`             | decimal(10,2) | ✅     | ราคาเพิ่มเติม (default: 0)           |
| `CostPrice`                   | decimal(10,2) | ❌     | ราคาต้นทุน                           |
| `SortOrder`                   | int           | ✅     | ลำดับการแสดงผล (default: 0)          |
| `IsActive`                    | bit           | ✅     | เปิด/ปิด (default: true)             |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_OptionItem_OptionGroupId`

---

#### TbMenuOptionGroups — เชื่อมเมนูกับกลุ่มตัวเลือก (M:M)

ตาราง Join เชื่อม TbMenus กับ TbOptionGroups — **Hard delete**

| คอลัมน์                       | ชนิด | จำเป็น | รายละเอียด                                    |
| ----------------------------- | ---- | ------ | --------------------------------------------- |
| `MenuOptionGroupId`           | int  | ✅ PK  | Identity auto-increment                       |
| `MenuId`                      | int  | ✅     | FK → TbMenus (cascade delete)                |
| `OptionGroupId`               | int  | ✅     | FK → TbOptionGroups (restrict delete)         |
| `SortOrder`                   | int  | ✅     | ลำดับการแสดงผล (default: 0)                   |
| + Audit fields จาก BaseEntity |      |        |

**Unique Constraint:** (`MenuId`, `OptionGroupId`)

**Indexes:** `IX_MenuOptionGroup_MenuId_OptionGroupId` (Unique)

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

#### TbZones — โซนพื้นที่ร้าน

เก็บโซนพื้นที่ภายในร้าน (เช่น ชั้น 1, ระเบียง, VIP) สำหรับจัดกลุ่มโต๊ะ

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                            |
| ----------------------------- | ------------- | ------ | ------------------------------------- |
| `ZoneId`                      | int           | ✅ PK  | Identity auto-increment               |
| `ZoneName`                    | nvarchar(100) | ✅     | ชื่อโซน (Unique)                      |
| `Color`                       | nvarchar(20)  | ✅     | สีของโซน (hex code เช่น "#FF5733")   |
| `SortOrder`                   | int           | ✅     | ลำดับการแสดงผล (default: 0)           |
| `IsActive`                    | bit           | ✅     | เปิด/ปิด (default: true)              |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_Zones_ZoneName` (Unique), `IX_Zones_IsActive`, `IX_Zones_SortOrder`, `IX_Zones_DeleteFlag`

---

#### TbTables — โต๊ะในร้าน

เก็บข้อมูลโต๊ะทั้งหมด — ชื่อ, โซน, ความจุ, ตำแหน่งบนผังร้าน, สถานะ, ข้อมูล session (จำนวนคน, QR Token)

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                                   |
| ----------------------------- | ------------- | ------ | ------------------------------------------------------------ |
| `TableId`                     | int           | ✅ PK  | Identity auto-increment                                      |
| `TableName`                   | nvarchar(50)  | ✅     | ชื่อโต๊ะ (Unique, เช่น "A1", "VIP-01")                       |
| `ZoneId`                      | int           | ✅     | FK → TbZones (โซนที่โต๊ะอยู่)                                |
| `Capacity`                    | int           | ✅     | ความจุ (จำนวนที่นั่ง)                                        |
| `PositionX`                   | float         | ✅     | ตำแหน่ง X บนผังร้าน (default: 0)                             |
| `PositionY`                   | float         | ✅     | ตำแหน่ง Y บนผังร้าน (default: 0)                             |
| `Shape`                       | varchar(20)   | ✅     | Enum `ETableShape` — Square=0, Round=1 (default: Square)    |
| `Size`                        | varchar(20)   | ✅     | Enum `ETableSize` — Small=0, Medium=1, Large=2 (default: Medium) |
| `Status`                      | varchar(20)   | ✅     | Enum `ETableStatus` — Available=0, Occupied=1, Billing=2, Reserved=3, Cleaning=4, Unavailable=5 (default: Available) |
| `CurrentGuests`               | int           | ❌     | จำนวนลูกค้าปัจจุบัน (set เมื่อเปิดโต๊ะ)                     |
| `GuestType`                   | varchar(20)   | ❌     | Enum `EGuestType` — WalkIn=0, Reserved=1                     |
| `OpenedAt`                    | datetime      | ❌     | เวลาที่เปิดโต๊ะ                                              |
| `Note`                        | nvarchar(500) | ❌     | หมายเหตุ                                                     |
| `QrToken`                     | nvarchar(2000)| ❌     | JWT QR Token (สำหรับ self-order)                             |
| `QrTokenExpiresAt`            | datetime      | ❌     | วันหมดอายุ QR Token                                          |
| `QrTokenNonce`                | nvarchar(50)  | ❌     | Nonce สำหรับ revoke QR Token                                 |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_Tables_TableName` (Unique), `IX_Tables_ZoneId`, `IX_Tables_Status`, `IX_Tables_DeleteFlag`

---

#### TbTableLinks — เชื่อมโต๊ะที่รวมกัน

ตาราง Join สำหรับเชื่อมโต๊ะหลายตัวเข้าด้วยกัน (เช่น รวม A1+A2 เป็นกลุ่มเดียว) — **Hard delete**

| คอลัมน์                       | ชนิด         | จำเป็น | รายละเอียด                            |
| ----------------------------- | ------------ | ------ | ------------------------------------- |
| `TableLinkId`                 | int          | ✅ PK  | Identity auto-increment               |
| `GroupCode`                   | nvarchar(50) | ✅     | รหัสกลุ่ม (โต๊ะที่ GroupCode เดียวกันเชื่อมกัน) |
| `TableId`                     | int          | ✅     | FK → TbTables (Unique — โต๊ะ 1 ตัวอยู่ได้ 1 กลุ่ม) |
| + Audit fields จาก BaseEntity |              |        |

**Unique Constraint:** `TableId` (โต๊ะ 1 ตัวเชื่อมได้เพียง 1 กลุ่ม)

**Indexes:** `IX_TableLinks_TableId` (Unique), `IX_TableLinks_GroupCode`

---

#### TbReservations — การจองโต๊ะ

เก็บข้อมูลการจองโต๊ะ — ชื่อลูกค้า, เบอร์โทร, วันเวลา, จำนวนคน, สถานะ

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                                   |
| ----------------------------- | ------------- | ------ | ------------------------------------------------------------ |
| `ReservationId`               | int           | ✅ PK  | Identity auto-increment                                      |
| `CustomerName`                | nvarchar(200) | ✅     | ชื่อลูกค้า                                                   |
| `CustomerPhone`               | nvarchar(20)  | ✅     | เบอร์โทรลูกค้า                                               |
| `ReservationDate`             | date          | ✅     | วันที่จอง                                                    |
| `ReservationTime`             | time          | ✅     | เวลาจอง                                                     |
| `GuestCount`                  | int           | ✅     | จำนวนคน                                                     |
| `TableId`                     | int           | ❌     | FK → TbTables (โต๊ะที่กำหนด — assign เมื่อ confirm)          |
| `Note`                        | nvarchar(500) | ❌     | หมายเหตุ                                                     |
| `Status`                      | varchar(20)   | ✅     | Enum `EReservationStatus` — Pending=0, Confirmed=1, CheckedIn=2, Cancelled=3, NoShow=4 (default: Pending) |
| `ReminderSent`                | bit           | ✅     | ส่งแจ้งเตือนแล้วหรือยัง (default: false)                     |
| + Audit fields จาก BaseEntity |               |        |

**Indexes:** `IX_Reservations_Date_Status` (ReservationDate, Status), `IX_Reservations_TableId`, `IX_Reservations_DeleteFlag`

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

#### TbCashierSessions — เซสชั่นแคชเชียร์

เก็บข้อมูลกะการทำงาน — เงินสดเริ่มต้น, ยอดขายสด/QR, จำนวนบิล, ส่วนต่างตอนปิดกะ

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                      |
| ----------------------------- | ------------- | ------ | ----------------------------------------------- |
| `CashierSessionId`            | int           | ✅ PK  | Identity auto-increment                          |
| `UserId`                      | Guid          | ✅     | FK → TbUsers (แคชเชียร์เจ้าของเซสชั่น)           |
| `Status`                      | int           | ✅     | Enum `ECashierSessionStatus` (Open, Closed)      |
| `OpenedAt`                    | datetime      | ✅     | วันเวลาเปิดเซสชั่น                               |
| `ClosedAt`                    | datetime      | ❌     | วันเวลาปิดเซสชั่น                                |
| `OpeningCash`                 | decimal       | ✅     | เงินสดเริ่มต้นเมื่อเปิดกะ                        |
| `ExpectedCash`                | decimal       | ✅     | เงินสดที่คาดหวัง (คำนวณจากยอดขาย+เข้า-ออก)       |
| `ActualCash`                  | decimal       | ❌     | เงินสดจริงที่นับตอนปิดกะ                          |
| `Variance`                    | decimal       | ❌     | ส่วนต่าง (ActualCash - ExpectedCash)              |
| `TotalCashSales`              | decimal       | ✅     | ยอดขายสดรวม (default: 0)                          |
| `TotalQrSales`                | decimal       | ✅     | ยอดขาย QR รวม (default: 0)                        |
| `BillCount`                   | int           | ✅     | จำนวนบิลทั้งหมด (default: 0)                      |
| `Note`                        | nvarchar      | ❌     | หมายเหตุ                                          |
| + Audit fields จาก BaseEntity |               |        |

---

#### TbCashDrawerTransactions — รายการเงินสดเข้า-ออก

เก็บรายการเงินสดเข้า (Cash In) และออก (Cash Out) ระหว่างกะ

| คอลัมน์                          | ชนิด          | จำเป็น | รายละเอียด                                        |
| -------------------------------- | ------------- | ------ | ------------------------------------------------- |
| `CashDrawerTransactionId`        | int           | ✅ PK  | Identity auto-increment                            |
| `CashierSessionId`               | int           | ✅     | FK → TbCashierSessions (เซสชั่นที่ทำรายการ)        |
| `TransactionType`                | int           | ✅     | Enum `ECashDrawerTransactionType` (In=0, Out=1)    |
| `Amount`                         | decimal       | ✅     | จำนวนเงิน                                          |
| `Reason`                         | nvarchar      | ✅     | เหตุผล (เช่น "ทอนเงินลูกค้า", "เติมเงินสด")       |
| + Audit fields จาก BaseEntity    |               |        |

---

#### TbPayments — การชำระเงิน

เก็บรายการชำระเงินแต่ละครั้ง — ผูกกับ OrderBill + CashierSession

| คอลัมน์                       | ชนิด          | จำเป็น | รายละเอียด                                            |
| ----------------------------- | ------------- | ------ | ----------------------------------------------------- |
| `PaymentId`                   | int           | ✅ PK  | Identity auto-increment                                |
| `OrderBillId`                 | int           | ✅     | FK → TbOrderBills (บิลที่ชำระ)                         |
| `CashierSessionId`            | int           | ✅     | FK → TbCashierSessions (กะที่ชำระ)                     |
| `PaymentMethod`               | int           | ✅     | Enum `EPaymentMethod` (Cash=0, QrCode=1)               |
| `AmountDue`                   | decimal       | ✅     | จำนวนเงินที่ต้องชำระ                                   |
| `AmountReceived`              | decimal       | ✅     | จำนวนเงินที่ได้รับ                                     |
| `ChangeAmount`                | decimal       | ✅     | จำนวนเงินทอน                                           |
| `SlipImageFileId`             | int           | ❌     | FK → TbFiles (รูปสลิปโอนเงิน)                          |
| `SlipOcrAmount`               | decimal       | ❌     | ยอดเงินจาก OCR อ่านสลิป                                |
| `SlipVerificationStatus`      | int           | ✅     | Enum `ESlipVerificationStatus` (None, AutoMatched, ManualReview, Mismatch) |
| `PaymentReference`            | nvarchar(200) | ❌     | เลขอ้างอิงการชำระเงิน                                  |
| `PaidAt`                      | datetime      | ✅     | วันเวลาชำระเงิน                                       |
| `Note`                        | nvarchar      | ❌     | หมายเหตุ                                               |
| + Audit fields จาก BaseEntity |               |        |

#### TbNotifications — การแจ้งเตือน staff

เก็บ notification real-time สำหรับ staff — **ไม่ inherit BaseEntity** (ข้อมูลชั่วคราว, hard delete หลัง 7 วัน)

| คอลัมน์            | ชนิด           | จำเป็น | รายละเอียด                                        |
| ------------------ | -------------- | ------ | ------------------------------------------------- |
| `NotificationId`   | int            | ✅ PK  | Identity auto-increment                            |
| `EventType`        | nvarchar(50)   | ✅     | ประเภท event (NEW_ORDER, ORDER_READY, etc.)        |
| `Title`            | nvarchar(200)  | ✅     | หัวข้อแจ้งเตือน                                    |
| `Message`          | nvarchar(1000) | ✅     | รายละเอียดแจ้งเตือน                                |
| `TableId`          | int            | ❌     | FK → TbTables (โต๊ะที่เกี่ยวข้อง)                   |
| `OrderId`          | int            | ❌     | FK → TbOrders (ออเดอร์ที่เกี่ยวข้อง)                |
| `ReservationId`    | int            | ❌     | FK → TbReservations (การจองที่เกี่ยวข้อง)            |
| `TargetGroup`      | nvarchar(50)   | ✅     | กลุ่มเป้าหมาย (Kitchen, Floor, Cashier, Manager)   |
| `Payload`          | nvarchar(max)  | ❌     | JSON ข้อมูลเพิ่มเติม                               |
| `CreatedAt`        | datetime       | ✅     | วันเวลาสร้าง (default GETUTCDATE())                |

#### TbNotificationReads — สถานะอ่าน/เคลียร์ per-user

Track สถานะอ่าน + clear ต่อ user — **ไม่ inherit BaseEntity** (hard delete พร้อม notification)

| คอลัมน์              | ชนิด      | จำเป็น | รายละเอียด                          |
| -------------------- | --------- | ------ | ----------------------------------- |
| `NotificationReadId` | int       | ✅ PK  | Identity auto-increment              |
| `NotificationId`     | int       | ✅     | FK → TbNotifications                 |
| `UserId`             | Guid      | ✅     | FK → TbUsers                         |
| `ReadAt`             | datetime  | ❌     | null = ยังไม่อ่าน                    |
| `ClearedAt`          | datetime  | ❌     | null = ยังไม่ clear                  |

**Unique constraint**: `(NotificationId, UserId)`

---

## ความสัมพันธ์ของตาราง

### แผนภาพความสัมพันธ์

```
TbUsers (1) ─────────────────── (0..1) TbEmployees
   │                                      │
   └── (1) ──── (M) TbRefreshTokens       ├── (M) ──── (1) TbFiles (ImageFile)
                                           └── (M) ──── (1) TbmPosition

TbMenuSubCategories (1) ──── (M) TbMenus
   (CategoryType = EMenuCategory)          │
                                           ├── (M) ──── (1) TbFiles (ImageFile)
                                           │
                                           └── (1) ──── (M) TbMenuOptionGroups ──── (M) ──── (1) TbOptionGroups
                                                                                                 │
                                                                                    (1) ──── (M) TbOptionItems

TbZones (1) ──── (M) TbTables
                       │
                       ├── (1) ──── (M) TbTableLinks (GroupCode เชื่อมโต๊ะหลายตัว)
                       └── (1) ──── (M) TbReservations (การจอง — TableId optional)

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
| TbEmployees → TbFiles                         | M:1 (Optional) | `TbEmployees.ImageFileId`                 | Restrict        | พนักงานมีรูปโปรไฟล์ได้ 1 รูป                            |
| TbEmployees → TbmPosition                     | M:1 (Optional) | `TbEmployees.PositionId`                  | Restrict        | พนักงานมีตำแหน่งได้ 1 ตำแหน่ง                           |
| TbmModule → TbmModule (Self-ref)              | M:1 (Optional) | `TbmModule.ParentModuleId`                | Restrict        | โมดูล hierarchy (parent → child)                        |
| TbmAuthorizeMatrix → TbmModule                | M:1            | `TbmAuthorizeMatrix.ModuleId`             | Restrict        | Matrix จับคู่กับ 1 module                               |
| TbmAuthorizeMatrix → TbmPermission            | M:1            | `TbmAuthorizeMatrix.PermissionId`         | Restrict        | Matrix จับคู่กับ 1 permission type                      |
| TbAuthorizeMatrixPosition → TbmAuthorizeMatrix | M:1            | `TbAuthorizeMatrixPosition.AuthorizeMatrixId` | Cascade     | กำหนดสิทธิ์ตำแหน่ง → matrix entry                       |
| TbAuthorizeMatrixPosition → TbmPosition       | M:1            | `TbAuthorizeMatrixPosition.PositionId`    | Cascade         | กำหนดสิทธิ์ตำแหน่ง → ตำแหน่ง                            |
| TbMenus → TbFiles                             | M:1 (Optional) | `TbMenus.ImageFileId`                     | Restrict        | เมนูมีรูปภาพได้ 1 รูป                                   |
| TbMenus → TbMenuSubCategories                 | M:1            | `TbMenus.SubCategoryId`                   | Restrict        | เมนูอยู่ในหมวดหมู่ย่อย 1 หมวด                           |
| TbMenuSubCategories → TbMenus                 | 1:M            | `TbMenus.SubCategoryId`                   | Restrict        | หมวดหมู่ย่อย 1 หมวดมีได้หลายเมนู                        |
| TbMenuOptionGroups → TbMenus                  | M:1            | `TbMenuOptionGroups.MenuId`               | **Cascade**     | เมนูถูกลบ → ลบ link ด้วย                               |
| TbMenuOptionGroups → TbOptionGroups           | M:1            | `TbMenuOptionGroups.OptionGroupId`        | Restrict        | ป้องกันลบ OptionGroup ที่ยังมีเมนูผูก                    |
| TbOptionItems → TbOptionGroups                | M:1            | `TbOptionItems.OptionGroupId`             | **Cascade**     | ลบ OptionGroup → ลบ Items ทั้งหมดด้วย                   |
| TbShopSettings → TbFiles (Logo)               | M:1 (Optional) | `TbShopSettings.LogoFileId`               | Restrict        | ร้านมีโลโก้ได้ 1 รูป (.png only)                        |
| TbShopSettings → TbFiles (QR Code)            | M:1 (Optional) | `TbShopSettings.PaymentQrCodeFileId`      | Restrict        | ร้านมี QR Code ชำระเงินได้ 1 รูป (.png only)            |
| TbShopSettings → TbShopOperatingHours         | 1:M            | `TbShopOperatingHours.ShopSettingsId`     | Cascade         | ร้าน 1 แห่งมีเวลาทำการ 7 วัน                            |
| TbZones → TbTables                            | 1:M            | `TbTables.ZoneId`                         | Restrict        | โซน 1 โซนมีได้หลายโต๊ะ (ห้ามลบโซนที่มีโต๊ะ)            |
| TbTables → TbTableLinks                       | 1:M            | `TbTableLinks.TableId`                    | Restrict        | โต๊ะ 1 ตัวอยู่ได้ 1 กลุ่มเชื่อม (Unique TableId)        |
| TbTables → TbReservations                     | 1:M (Optional) | `TbReservations.TableId`                  | Restrict        | โต๊ะ 1 ตัวมีได้หลายการจอง (TableId nullable)             |
| TbCashierSessions → TbUsers                   | M:1            | `TbCashierSessions.UserId`                | Restrict        | เซสชั่น 1 อันผูกกับ User 1 คน                           |
| TbCashierSessions → TbCashDrawerTransactions  | 1:M            | `TbCashDrawerTransactions.CashierSessionId` | Restrict      | เซสชั่น 1 อันมีรายการเงินสดเข้า-ออกได้หลายรายการ        |
| TbCashierSessions → TbPayments                | 1:M            | `TbPayments.CashierSessionId`             | Restrict        | เซสชั่น 1 อันมีการชำระเงินได้หลายรายการ                  |
| TbPayments → TbOrderBills                     | M:1            | `TbPayments.OrderBillId`                  | Restrict        | การชำระเงิน 1 รายการผูกกับ OrderBill 1 ใบ                |
| TbPayments → TbFiles (Slip)                   | M:1 (Optional) | `TbPayments.SlipImageFileId`              | Restrict        | สลิปโอนเงิน (ถ้าชำระผ่าน QR)                            |
| BaseEntity → TbEmployees (CreatedBy)          | M:1 (Optional) | `CreatedBy`                               | Restrict        | ทุก Entity ติดตามผู้สร้าง                               |
| BaseEntity → TbEmployees (UpdatedBy)          | M:1 (Optional) | `UpdatedBy`                               | Restrict        | ทุก Entity ติดตามผู้แก้ไข                               |
| TbNotifications → TbTables                    | M:1 (Optional) | `TbNotifications.TableId`                 | Restrict        | แจ้งเตือนผูกกับโต๊ะ (ถ้ามี)                             |
| TbNotifications → TbOrders                    | M:1 (Optional) | `TbNotifications.OrderId`                 | Restrict        | แจ้งเตือนผูกกับออเดอร์ (ถ้ามี)                           |
| TbNotifications → TbReservations              | M:1 (Optional) | `TbNotifications.ReservationId`           | Restrict        | แจ้งเตือนผูกกับการจอง (ถ้ามี)                            |
| TbNotifications → TbNotificationReads         | 1:M            | `TbNotificationReads.NotificationId`      | Cascade         | ลบ notification → ลบ reads ด้วย                         |
| TbNotificationReads → TbUsers                 | M:1            | `TbNotificationReads.UserId`              | Restrict        | track per-user read/clear status                        |

> **หมายเหตุ**: ส่วนใหญ่ใช้ `DeleteBehavior.Restrict` — ยกเว้น TbAuthorizeMatrixPosition, TbMenuOptionGroups, TbOptionItems, TbShopOperatingHours, TbNotificationReads ที่ใช้ `Cascade`

---

## API Endpoints ทั้งหมด

### สรุปจำนวน

| Controller     | Route Prefix               | จำนวน Endpoints | Auth    | Permission                 |
| -------------- | -------------------------- | --------------- | ------- | -------------------------- |
| Auth           | `api/admin/auth`           | 11              | บางเส้น | —                          |
| Positions      | `api/admin/positions`      | 10              | ทุกเส้น | `position.*`               |
| MenuCategories | `api/menu/categories`      | 6               | ทุกเส้น | `menu-category.*`          |
| MenuItems      | `api/menu/items`           | 5               | ทุกเส้น | `menu-food.*` / `menu-beverage.*` / `menu-dessert.*` (dynamic ตาม categoryType) |
| MenuOptions    | `api/menu/options`         | 6               | ทุกเส้น | `menu-option.*`            |
| HumanResource  | `api/humanresource`        | 12              | ทุกเส้น | `employee.*` / Profile ไม่ต้อง |
| ServiceCharges | `api/admin/servicecharges` | 6               | ทุกเส้น | `service-charge.*`         |
| ShopSettings   | `api/admin/shop-settings`  | 4               | ทุกเส้น | `shop-settings.*` / บางเส้นไม่ต้อง |
| Users          | `api/admin/users`          | 4               | ทุกเส้น | `user-management.*`        |
| File           | `api/admin/file`           | 1               | ทุกเส้น | —                          |
| Zones          | `api/table/zones`          | 7               | ทุกเส้น | `table.*`                  |
| Tables         | `api/table/tables`         | 15              | ทุกเส้น | `table.*`                  |
| Reservations   | `api/table/reservations`   | 9               | ทุกเส้น | `reservation.*`            |
| Kitchen        | `api/kitchen`              | 3               | ทุกเส้น | `kitchen-food.*` / `kitchen-beverage.*` / `kitchen-dessert.*` (dynamic) |
| CashierSessions| `api/cashier/sessions`     | 7               | ทุกเส้น | `cashier-session.*`        |
| Payments       | `api/payment/payments`     | 7               | ทุกเส้น | `payment-manage.*`         |
| Customer       | `api/customer`             | 3               | ไม่ต้อง | — (AllowAnonymous)         |
| Notifications  | `api/Notifications`        | 5               | ทุกเส้น | — (Authorize only)         |
| **รวม**        |                            | **120**         |         |                            |

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
| POST   | `/pin/setup`     | ตั้งค่า PIN Code ครั้งแรก (6 หลัก)     | ✅   | `SetupPinRequestModel`     | `BaseResponseModel<object>`             |
| POST   | `/pin/change`    | เปลี่ยน PIN Code (ยืนยัน PIN เดิม)     | ✅   | `ChangePinRequestModel`    | `BaseResponseModel<object>`             |
| POST   | `/pin/verify`    | ตรวจสอบ PIN Code ปัจจุบัน              | ✅   | `VerifyPinRequestModel`    | `BaseResponseModel<bool>`               |
| POST   | `/pin/reset`     | รีเซ็ต PIN (ยืนยันด้วยรหัสผ่าน)       | ✅   | `ResetPinRequestModel`     | `BaseResponseModel<object>`             |

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

### MenuCategories — จัดการหมวดหมู่ย่อยเมนู

Route prefix: `api/menu/categories`

| Method | Endpoint                  | วัตถุประสงค์                           | Permission             | Request                                       | Response                                             |
| ------ | ------------------------- | -------------------------------------- | ---------------------- | --------------------------------------------- | ---------------------------------------------------- |
| GET    | `/type/{categoryType}`    | ดึงหมวดหมู่ย่อยตามประเภทหลัก (แบ่งหน้า) | `menu-category.read`   | URL param + `PaginationModel`                 | `PaginationResult<MenuSubCategoryResponseModel>`     |
| GET    | `/{subCategoryId}`        | ดึงหมวดหมู่ย่อยตาม ID                  | `menu-category.read`   | URL param                                     | `BaseResponseModel<MenuSubCategoryResponseModel>`    |
| POST   | `/`                       | สร้างหมวดหมู่ย่อยใหม่                   | `menu-category.create` | JSON: `CreateMenuSubCategoryRequestModel`     | `BaseResponseModel<MenuSubCategoryResponseModel>`    |
| PUT    | `/{subCategoryId}`        | แก้ไขหมวดหมู่ย่อย                       | `menu-category.update` | JSON: `UpdateMenuSubCategoryRequestModel`     | `BaseResponseModel<MenuSubCategoryResponseModel>`    |
| DELETE | `/{subCategoryId}`        | ลบหมวดหมู่ย่อย (Soft delete)            | `menu-category.delete` | URL param                                     | `BaseResponseModel<object>`                          |
| PUT    | `/sort-order`             | อัพเดตลำดับการแสดงผล                    | `menu-category.update` | JSON: `UpdateSortOrderRequestModel`           | `BaseResponseModel<object>`                          |

> **หมายเหตุ**: ลบหมวดหมู่ได้เฉพาะเมื่อไม่มีเมนูอยู่ในหมวดนั้น — throw 422 ถ้ายังมีเมนู

---

### MenuItems — จัดการรายการเมนู

Route prefix: `api/menu/items`

| Method | Endpoint       | วัตถุประสงค์                           | Permission          | Request                                       | Response                                      |
| ------ | -------------- | -------------------------------------- | ------------------- | --------------------------------------------- | --------------------------------------------- |
| GET    | `/`            | ดึงเมนูทั้งหมด (แบ่งหน้า + filter)     | `menu-{food/beverage/dessert}.read` (dynamic) | Query: categoryType?, subCategoryId?, search?, isAvailable?, period? + `PaginationModel` | `PaginationResult<MenuResponseModel>` |
| GET    | `/{menuId}`    | ดึงเมนูตาม ID (รวม option groups)      | `menu-{food/beverage/dessert}.read` (dynamic) | URL param                                     | `BaseResponseModel<MenuResponseModel>`        |
| POST   | `/`            | สร้างเมนูใหม่ (พร้อมรูปภาพ)            | `menu-{food/beverage/dessert}.create` (dynamic) | Form: `CreateMenuRequestModel` + `IFormFile?` | `BaseResponseModel<MenuResponseModel>`        |
| PUT    | `/{menuId}`    | แก้ไขเมนู (พร้อมรูปภาพ)                | `menu-{food/beverage/dessert}.update` (dynamic) | Form: `UpdateMenuRequestModel` + `IFormFile?` | `BaseResponseModel<MenuResponseModel>`        |
| DELETE | `/{menuId}`    | ลบเมนู (Soft delete)                   | `menu-{food/beverage/dessert}.delete` (dynamic) | URL param                                     | `BaseResponseModel<object>`                   |

> Upload รูปภาพ: ขนาดสูงสุด 10MB — Controller อัพโหลดไฟล์ผ่าน `IFileService` ก่อน แล้วส่ง `FileId` ให้ `IMenuService`
> Create/Update สามารถส่ง `OptionGroupIds[]` เพื่อผูกกลุ่มตัวเลือกเสริมกับเมนูได้

---

### MenuOptions — จัดการกลุ่มตัวเลือกเสริม

Route prefix: `api/menu/options`

| Method | Endpoint                  | วัตถุประสงค์                           | Permission            | Request                                       | Response                                         |
| ------ | ------------------------- | -------------------------------------- | --------------------- | --------------------------------------------- | ------------------------------------------------ |
| GET    | `/`                       | ดึงกลุ่มตัวเลือกทั้งหมด (แบ่งหน้า, filter optional) | `menu-option.read`    | Query: `categoryType?`, `isActive?`, `PaginationModel` | `PaginationResult<OptionGroupResponseModel>`     |
| GET    | `/type/{categoryType}`    | ดึงกลุ่มตัวเลือกตามประเภทหลัก (แบ่งหน้า) | `menu-option.read`    | URL param + `PaginationModel`                 | `PaginationResult<OptionGroupResponseModel>`     |
| GET    | `/{optionGroupId}`        | ดึงกลุ่มตัวเลือกตาม ID (รวม items + linked menus) | `menu-option.read`    | URL param                           | `BaseResponseModel<OptionGroupResponseModel>`    |
| POST   | `/`                       | สร้างกลุ่มตัวเลือกใหม่ (พร้อม items)   | `menu-option.create`  | JSON: `CreateOptionGroupRequestModel`         | `BaseResponseModel<OptionGroupResponseModel>`    |
| PUT    | `/{optionGroupId}`        | แก้ไขกลุ่มตัวเลือก (Delta Pattern)     | `menu-option.update`  | JSON: `UpdateOptionGroupRequestModel`         | `BaseResponseModel<OptionGroupResponseModel>`    |
| DELETE | `/{optionGroupId}`        | ลบกลุ่มตัวเลือก (**Hard delete**)      | `menu-option.delete`  | URL param                                     | `BaseResponseModel<object>`                      |

> **Delta Pattern (Update):** ส่ง items ทั้งหมด — มี `optionItemId` = update, ไม่มี = insert, item ที่ไม่อยู่ในรายการ = hard delete
> **Delete:** ลบได้เฉพาะเมื่อไม่มีเมนูผูกอยู่ — throw 422 ถ้ายังมีเมนูผูก, ลบแบบ hard delete (ลบ group + items ถาวร)

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
| GET    | `/me/profile`               | ดึงข้อมูลโปรไฟล์ตัวเองแบบเต็ม (รวม sub-entities) | —                                          | `BaseResponseModel<EmployeeResponseModel>`          |
| PUT    | `/me/profile`               | อัพเดตโปรไฟล์ตัวเอง (เฉพาะ fields ที่อนุญาต) | Form: `UpdateProfileRequestModel` + `IFormFile?` | `BaseResponseModel<EmployeeResponseModel>`          |
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

### Users — จัดการผู้ใช้งาน

Route prefix: `api/admin/users`

| Method | Endpoint                          | วัตถุประสงค์                              | Permission              | Request                              | Response                                       |
| ------ | --------------------------------- | ----------------------------------------- | ----------------------- | ------------------------------------ | ---------------------------------------------- |
| GET    | `/`                               | ดึงผู้ใช้งานทั้งหมด (แบ่งหน้า + filter)   | `user-management.read`  | `PaginationModel` + query: isActive?, isLocked?, positionId? | `PaginationResult<UserListResponseModel>` |
| GET    | `/{userId}`                       | ดึงข้อมูลผู้ใช้งานตาม ID                  | `user-management.read`  | URL param                            | `BaseResponseModel<UserDetailResponseModel>`   |
| PUT    | `/{userId}`                       | แก้ไขการตั้งค่าบัญชีผู้ใช้                 | `user-management.update`| JSON: `UpdateUserSettingsRequestModel`| `BaseResponseModel<UserDetailResponseModel>`  |
| POST   | `/{userId}/reset-login-attempts`  | รีเซ็ตจำนวนครั้ง login ผิดพลาด            | `user-management.update`| URL param                            | `BaseResponseModel<object>`                    |

**UserListResponseModel** — ข้อมูลในตาราง List:

| ฟิลด์               | ชนิด     | รายละเอียด                                      |
| -------------------- | -------- | ----------------------------------------------- |
| `UserId`             | Guid     | ID ผู้ใช้                                       |
| `Username`           | string   | ชื่อผู้ใช้                                       |
| `Email`              | string   | อีเมล                                           |
| `IsActive`           | bool     | สถานะเปิด/ปิดบัญชี                               |
| `IsLockedByAdmin`    | bool     | ถูกล็อคโดย Admin หรือไม่                         |
| `FailedLoginAttempts`| int      | จำนวนครั้ง login ผิด                             |
| `LockedUntil`        | DateTime?| ล็อคอัตโนมัติถึง                                 |
| `LastLoginDate`      | DateTime?| เข้าสู่ระบบล่าสุด                                |
| `EmployeeId`         | int?     | FK → TbEmployees                                |
| `FullNameThai`       | string   | ชื่อ-นามสกุล (ไทย, computed)                     |
| `FullNameEnglish`    | string   | ชื่อ-นามสกุล (อังกฤษ, computed)                  |
| `PositionName`       | string?  | ชื่อตำแหน่ง (จาก Employee → Position)            |
| `ImageFileId`        | int?     | FK → TbFiles (รูปโปรไฟล์จาก Employee)            |
| `Phone`              | string?  | เบอร์โทร (จาก Employee)                          |

**UpdateUserSettingsRequestModel** — Request สำหรับแก้ไขการตั้งค่า:

| ฟิลด์             | ชนิด     | จำเป็น | รายละเอียด                        |
| ------------------ | -------- | ------ | --------------------------------- |
| `IsActive`         | bool     | ✅     | เปิด/ปิดบัญชี                     |
| `IsLockedByAdmin`  | bool     | ✅     | ล็อค/ปลดล็อคโดย Admin              |
| `AutoUnlockDate`   | DateTime?| ❌     | วันที่ปลดล็อคอัตโนมัติ (ไม่บังคับ) |

> **หมายเหตุ**: ไม่มี POST (สร้างผู้ใช้) — การสร้างบัญชีทำผ่าน HumanResource Controller (`/{employeeId}/create-user`)
> Reset Login Attempts จะ reset: `FailedLoginAttempts=0`, `LockoutCount=0`, `LockedUntil=null`

---

### File — จัดการไฟล์

Route prefix: `api/admin/file`

| Method | Endpoint    | วัตถุประสงค์        | Request   | Response           |
| ------ | ----------- | ------------------- | --------- | ------------------ |
| GET    | `/{fileId}` | ดาวน์โหลดไฟล์ตาม ID | URL param | Binary file stream |

> **หมายเหตุ**: การอัพโหลดไฟล์ทำผ่าน Menus, HumanResource, และ ShopSettings Controller (ไม่มี endpoint อัพโหลดแยก)

---

### Zones — จัดการโซนพื้นที่

Route prefix: `api/table/zones`

| Method | Endpoint       | วัตถุประสงค์                            | Permission       | Request                                  | Response                                    |
| ------ | -------------- | --------------------------------------- | ---------------- | ---------------------------------------- | ------------------------------------------- |
| GET    | `/`            | ดึงโซนทั้งหมด (แบ่งหน้า)                | `table.read`     | `PaginationModel`                        | `PaginationResult<ZoneResponseModel>`       |
| GET    | `/{zoneId}`    | ดึงโซนตาม ID                            | `table.read`     | URL param                                | `BaseResponseModel<ZoneResponseModel>`      |
| GET    | `/active`      | ดึงโซนที่ Active (สำหรับ Dropdown)       | `table.read`     | —                                        | `ListResponseModel<ZoneResponseModel>`      |
| POST   | `/`            | สร้างโซนใหม่                             | `table.create`   | JSON: `CreateZoneRequestModel`           | `BaseResponseModel<ZoneResponseModel>`      |
| PUT    | `/{zoneId}`    | แก้ไขโซน                                 | `table.update`   | JSON: `UpdateZoneRequestModel`           | `BaseResponseModel<ZoneResponseModel>`      |
| DELETE | `/{zoneId}`    | ลบโซน (Soft delete)                      | `table.delete`   | URL param                                | `BaseResponseModel<string>`                 |
| PUT    | `/sort-order`  | อัพเดตลำดับการแสดงผลโซน                  | `table.update`   | JSON: `UpdateZoneSortOrderRequestModel`  | `BaseResponseModel<string>`                 |

> **หมายเหตุ**: ลบโซนได้เฉพาะเมื่อไม่มีโต๊ะอยู่ในโซนนั้น — throw 422 ถ้ายังมีโต๊ะ

---

### Tables — จัดการโต๊ะ + Operations

Route prefix: `api/table/tables`

| Method | Endpoint                      | วัตถุประสงค์                            | Permission       | Request                                      | Response                                    |
| ------ | ----------------------------- | --------------------------------------- | ---------------- | -------------------------------------------- | ------------------------------------------- |
| GET    | `/`                           | ดึงโต๊ะทั้งหมด (แบ่งหน้า + filter)      | `table.read`     | Query: zoneId?, status? + `PaginationModel`  | `PaginationResult<TableResponseModel>`      |
| GET    | `/{tableId}`                  | ดึงโต๊ะตาม ID (รวมข้อมูล link)          | `table.read`     | URL param                                    | `BaseResponseModel<TableResponseModel>`     |
| POST   | `/`                           | สร้างโต๊ะใหม่                            | `table.create`   | JSON: `CreateTableRequestModel`              | `BaseResponseModel<TableResponseModel>`     |
| PUT    | `/{tableId}`                  | แก้ไขโต๊ะ                                | `table.update`   | JSON: `UpdateTableRequestModel`              | `BaseResponseModel<TableResponseModel>`     |
| DELETE | `/{tableId}`                  | ลบโต๊ะ (Soft delete)                     | `table.delete`   | URL param                                    | `BaseResponseModel<string>`                 |
| PUT    | `/positions`                  | อัพเดตตำแหน่ง X,Y หลายโต๊ะพร้อมกัน      | `table.update`   | JSON: `UpdateTablePositionsRequestModel`     | `BaseResponseModel<string>`                 |
| POST   | `/{tableId}/open`             | เปิดโต๊ะ (Available→Occupied + QR)       | `table.update`   | JSON: `OpenTableRequestModel`                | `BaseResponseModel<TableResponseModel>`     |
| POST   | `/{tableId}/close`            | ปิดโต๊ะ (Occupied→Cleaning)              | `table.update`   | —                                            | `BaseResponseModel<TableResponseModel>`     |
| POST   | `/{tableId}/clean`            | ทำความสะอาดเสร็จ (Cleaning→Available)    | `table.update`   | —                                            | `BaseResponseModel<TableResponseModel>`     |
| POST   | `/{tableId}/move`             | ย้ายโต๊ะ (ย้าย session ไปโต๊ะปลายทาง)    | `table.update`   | JSON: `MoveTableRequestModel`                | `BaseResponseModel<TableResponseModel>`     |
| POST   | `/link`                       | เชื่อมโต๊ะ (สร้าง group)                 | `table.update`   | JSON: `LinkTablesRequestModel`               | `BaseResponseModel<string>`                 |
| DELETE | `/link/{groupCode}`           | ยกเลิกเชื่อมโต๊ะ (ลบ group)              | `table.update`   | URL param                                    | `BaseResponseModel<string>`                 |
| POST   | `/{tableId}/set-unavailable`  | ปิดโต๊ะชั่วคราว (Available→Unavailable)  | `table.update`   | —                                            | `BaseResponseModel<TableResponseModel>`     |
| POST   | `/{tableId}/set-available`    | เปิดโต๊ะกลับ (Unavailable→Available)     | `table.update`   | —                                            | `BaseResponseModel<TableResponseModel>`     |
| GET    | `/{tableId}/qr-token`         | ดึง QR Token ของโต๊ะ                     | `table.read`     | URL param                                    | `BaseResponseModel<string>`                 |

> **Status Transition:**
> - `Open`: Available/Reserved → Occupied (set CurrentGuests, GuestType, OpenedAt, generate QR Token)
> - `Close`: Occupied/Billing → Cleaning (clear session data, revoke QR, delete links)
> - `Clean`: Cleaning → Available (clear all session data)
> - `Move`: Occupied → ย้าย session ไปโต๊ะปลายทาง (Available → Occupied), ต้นทาง reset → Cleaning
> - QR Token: JWT (HS256) — Claims: tableId, nonce, exp (12hr)

---

### Reservations — จัดการการจอง

Route prefix: `api/table/reservations`

| Method | Endpoint                        | วัตถุประสงค์                               | Permission            | Request                                       | Response                                       |
| ------ | ------------------------------- | ------------------------------------------ | --------------------- | --------------------------------------------- | ---------------------------------------------- |
| GET    | `/`                             | ดึงการจองทั้งหมด (แบ่งหน้า + filter)        | `reservation.read`    | Query: dateFrom?, dateTo?, status? + `PaginationModel` | `PaginationResult<ReservationResponseModel>` |
| GET    | `/today`                        | ดึงการจองวันนี้ (ไม่แบ่งหน้า)               | `reservation.read`    | —                                             | `ListResponseModel<ReservationResponseModel>`  |
| GET    | `/{reservationId}`              | ดึงการจองตาม ID                             | `reservation.read`    | URL param                                     | `BaseResponseModel<ReservationResponseModel>`  |
| POST   | `/`                             | สร้างการจองใหม่                              | `reservation.create`  | JSON: `CreateReservationRequestModel`         | `BaseResponseModel<ReservationResponseModel>`  |
| PUT    | `/{reservationId}`              | แก้ไขการจอง                                  | `reservation.update`  | JSON: `UpdateReservationRequestModel`         | `BaseResponseModel<ReservationResponseModel>`  |
| POST   | `/{reservationId}/confirm`      | ยืนยันการจอง (Pending→Confirmed + assign โต๊ะ) | `reservation.update`  | JSON: `ConfirmReservationRequestModel`        | `BaseResponseModel<ReservationResponseModel>`  |
| POST   | `/{reservationId}/check-in`     | Check-in ลูกค้า (Confirmed→CheckedIn + เปิดโต๊ะ) | `reservation.update`  | —                                             | `BaseResponseModel<ReservationResponseModel>`  |
| POST   | `/{reservationId}/cancel`       | ยกเลิกการจอง (→Cancelled + ปล่อยโต๊ะ)       | `reservation.update`  | —                                             | `BaseResponseModel<ReservationResponseModel>`  |
| POST   | `/{reservationId}/no-show`      | ลูกค้าไม่มา (→NoShow + ปล่อยโต๊ะ)           | `reservation.update`  | —                                             | `BaseResponseModel<ReservationResponseModel>`  |

> **Validation:**
> - ห้ามจองวันย้อนหลัง
> - Confirm: ต้อง assign TableId + ตรวจ ±2 ชั่วโมง ไม่ชนกับการจองอื่น
> - Check-in: เปลี่ยน Confirmed → CheckedIn + เปิดโต๊ะอัตโนมัติ (GuestType=Reserved)
> - Cancel/NoShow: ปล่อยโต๊ะที่ถูก assign (ถ้า status เป็น Reserved → เปลี่ยนเป็น Available)
> - ห้ามแก้ไขการจองที่สถานะเป็น CheckedIn, Cancelled, หรือ NoShow แล้ว

---

### Kitchen — หน้าจอครัว (KDS)

Route prefix: `api/kitchen`

| Method | Endpoint          | วัตถุประสงค์                                 | Permission             | Request                    | Response                                    |
| ------ | ----------------- | -------------------------------------------- | ---------------------- | -------------------------- | ------------------------------------------- |
| GET    | `/orders`         | ดึงรายการครัวตาม category + status           | `kitchen-{category}.read` (dynamic)   | Query: `categoryType`, `includeReady` | `ListResponseModel<KitchenOrderModel>` |
| PUT    | `/items/prepare`  | เริ่มทำ (Sent → Preparing) แบบ batch        | `kitchen-{category}.update` (dynamic) | JSON: `BatchItemRequestModel` | `BaseResponseModel<object>`             |
| PUT    | `/items/ready`    | พร้อมเสิร์ฟ (Preparing → Ready) แบบ batch   | `kitchen-{category}.update` (dynamic) | JSON: `BatchItemRequestModel` | `BaseResponseModel<object>`             |

> **Business Rules:**
> - GET `/orders`: query items ตาม `categoryType` (1=Food, 2=Beverage, 3=Dessert) + status (Sent, Preparing, Ready ตาม `includeReady`) เฉพาะ Open orders → group by OrderId
> - PUT `/items/prepare`: ตรวจสถานะเดิมต้องเป็น Sent เท่านั้น + set CookingStartedAt + broadcast SignalR "ItemStatusChanged"
> - PUT `/items/ready`: ตรวจสถานะเดิมต้องเป็น Preparing เท่านั้น + set ReadyAt + broadcast SignalR "ItemStatusChanged"

---

### CashierSessions — เซสชั่นแคชเชียร์

Route prefix: `api/cashier/sessions`

| Method | Endpoint                           | วัตถุประสงค์                            | Permission                 | Request                                       | Response                                              |
| ------ | ---------------------------------- | --------------------------------------- | -------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| GET    | `/current`                         | ดึงเซสชั่นปัจจุบันของผู้ใช้              | `cashier-session.read`     | —                                             | `BaseResponseModel<CashierSessionResponseModel>`      |
| GET    | `/history`                         | ดูประวัติเซสชั่น (แบ่งหน้า)              | `cashier-session.read`     | `PaginationModel`                             | `PaginationResult<CashierSessionResponseModel>`       |
| GET    | `/{cashierSessionId}`              | ดูรายละเอียดเซสชั่น                      | `cashier-session.read`     | URL param                                     | `BaseResponseModel<CashierSessionResponseModel>`      |
| POST   | `/open`                            | เปิดเซสชั่นใหม่                          | `cashier-session.create`   | JSON: `OpenCashierSessionRequestModel`        | `BaseResponseModel<CashierSessionResponseModel>`      |
| POST   | `/{cashierSessionId}/cash-in`      | เงินสดเข้า                               | `cashier-session.create`   | JSON: `CashDrawerTransactionRequestModel`     | `BaseResponseModel<CashDrawerTransactionResponseModel>`|
| POST   | `/{cashierSessionId}/cash-out`     | เงินสดออก                                | `cashier-session.create`   | JSON: `CashDrawerTransactionRequestModel`     | `BaseResponseModel<CashDrawerTransactionResponseModel>`|
| POST   | `/{cashierSessionId}/close`        | ปิดเซสชั่น (สรุปยอด)                    | `cashier-session.update`   | JSON: `CloseCashierSessionRequestModel`       | `BaseResponseModel<CashierSessionResponseModel>`      |

> **Business Rules:**
> - เปิดเซสชั่นได้ทีละ 1 ต่อ user (ห้ามเปิดซ้ำถ้ายังมีเซสชั่น Open อยู่)
> - Cash In/Out อัพเดต ExpectedCash อัตโนมัติ
> - ปิดเซสชั่น: คำนวณ Variance = ActualCash - ExpectedCash, เปลี่ยนสถานะ → Closed

---

### Payments — ชำระเงิน

Route prefix: `api/payment/payments`

| Method | Endpoint                | วัตถุประสงค์                               | Permission              | Request                                       | Response                                        |
| ------ | ----------------------- | ------------------------------------------ | ----------------------- | --------------------------------------------- | ----------------------------------------------- |
| POST   | `/cash`                 | ชำระเงินสด                                 | `payment-manage.create` | JSON: `CashPaymentRequestModel`               | `BaseResponseModel<PaymentResponseModel>`       |
| POST   | `/qr/upload-slip`       | อัปโหลดสลิป + OCR อ่านยอดเงิน (multipart)   | `payment-manage.create` | Form: OrderBillId, slipFile, PaymentReference? | `BaseResponseModel<SlipUploadResultModel>`      |
| POST   | `/qr/confirm`           | ยืนยันชำระเงิน QR                          | `payment-manage.create` | JSON: `ConfirmQrPaymentRequestModel`          | `BaseResponseModel<PaymentResponseModel>`       |
| GET    | `/order/{orderId}`      | ดูรายการชำระเงินของ Order                   | `payment-manage.read`   | URL param                                     | `ListResponseModel<PaymentResponseModel>`       |
| GET    | `/{paymentId}`          | ดูรายละเอียดการชำระเงิน                     | `payment-manage.read`   | URL param                                     | `BaseResponseModel<PaymentResponseModel>`       |
| GET    | `/{paymentId}/receipt`  | ข้อมูลใบเสร็จ (สำหรับ PDF)                  | `payment-manage.read`   | URL param                                     | `BaseResponseModel<ReceiptDataModel>`           |
| GET    | `/history`              | ประวัติการชำระเงิน (แบ่งหน้า)               | `payment-manage.read`   | `PaginationModel`                             | `PaginationResult<PaymentResponseModel>`        |

> **Business Rules:**
> - ชำระเงินสด: ตรวจ OrderBill status=Pending, ตรวจ CashierSession ต้อง Open → สร้าง Payment + อัพเดต Bill→Paid + อัพเดต CashierSession ยอดขาย
> - Upload Slip: อัปโหลดไฟล์ → OCR (Tesseract) อ่านยอดเงิน → เทียบกับ GrandTotal → return verification status (AutoMatched/Mismatch/ManualReview)
> - Confirm QR: ยืนยันการชำระเงิน QR → สร้าง Payment + อัพเดต Bill→Paid
> - ทุกการชำระเงินสำเร็จ: broadcast SignalR "PaymentCompleted"

---

### Customer — หน้าลูกค้า QR

Route prefix: `api/customer` — **AllowAnonymous** (ไม่ต้องมี JWT Token)

| Method | Endpoint                                | วัตถุประสงค์                               | Permission | Request                                       | Response                                             |
| ------ | --------------------------------------- | ------------------------------------------ | ---------- | --------------------------------------------- | ---------------------------------------------------- |
| GET    | `/{qrToken}/bill`                       | ลูกค้าดูบิล + รายการอาหารตาม QR Token      | ❌ ไม่ต้อง  | URL param: qrToken                            | `BaseResponseModel<CustomerBillResponseModel>`       |
| POST   | `/{qrToken}/upload-slip`                | ลูกค้าอัปโหลดสลิป QR (multipart, max 10MB)  | ❌ ไม่ต้อง  | Form: OrderBillId, slipFile, PaymentReference? | `BaseResponseModel<SlipUploadResultModel>`           |
| GET    | `/{qrToken}/bill/{orderBillId}/status`  | ลูกค้าตรวจสอบสถานะการชำระเงิน               | ❌ ไม่ต้อง  | URL params: qrToken, orderBillId              | `BaseResponseModel<string>`                          |

> **Business Rules:**
> - QR Token = JWT (HS256) จากการเปิดโต๊ะ — Claims: tableId, nonce, exp (12 ชั่วโมง)
> - ทุก endpoint ตรวจ QR Token: หา table ตาม token, ตรวจ expiry
> - Get Bill: ดึง active order ของโต๊ะ → แสดง items (order-level) + bills (summaries)
> - Upload Slip: ตรวจ bill status=Pending → อัปโหลดไฟล์ → OCR → broadcast SignalR "SlipUploaded"
> - Payment Status: return สถานะ bill เป็น string (Pending/Paid/Cancelled)

### Notifications — การแจ้งเตือน

Route prefix: `api/Notifications` — **Authorize** (ทุกคนที่ login ได้ ไม่ต้อง PermissionAuthorize)

| Method | Endpoint                           | วัตถุประสงค์                               | Permission | Request                          | Response                                              |
| ------ | ---------------------------------- | ------------------------------------------ | ---------- | -------------------------------- | ----------------------------------------------------- |
| GET    | `/`                                | ดึง notifications (cursor pagination)      | Authorize  | Query: eventType?, tableId?, limit, before? | `ListResponseModel<NotificationResponseModel>` |
| GET    | `/unread-count`                    | จำนวน notification ที่ยังไม่อ่าน           | Authorize  | -                                | `BaseResponseModel<int>`                              |
| PATCH  | `/{notificationId}/read`           | Mark อ่านแล้ว                              | Authorize  | URL param                        | `BaseResponseModel<string>`                           |
| PATCH  | `/read-all`                        | Mark ทั้งหมดอ่านแล้ว                       | Authorize  | -                                | `BaseResponseModel<string>`                           |
| DELETE | `/clear-all`                       | เคลียร์ notifications (set ClearedAt)      | Authorize  | -                                | `BaseResponseModel<string>`                           |

> **Business Rules:**
> - Query filter ตาม TargetGroup ที่ user มี permission เข้าถึง (Kitchen/Floor/Cashier/Manager)
> - ซ่อน noti ที่ ClearedAt >= CreatedAt
> - Cursor pagination: WHERE NotificationId < before ORDER BY NotificationId DESC
> - Clear ไม่ได้ลบจริง — set ClearedAt timestamp ให้ user นั้น

### NotificationHub — SignalR real-time

| Hub Path               | วัตถุประสงค์                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `/hubs/notification`   | Broadcast notifications real-time ให้ staff ตาม group membership     |

| Client Method         | Payload                     | รายละเอียด                                    |
| --------------------- | --------------------------- | --------------------------------------------- |
| `ReceiveNotification` | `NotificationResponseModel` | Server → Client เมื่อมี notification ใหม่      |

| Event Type              | TargetGroup | Trigger จาก           | รายละเอียด                          |
| ----------------------- | ----------- | --------------------- | ----------------------------------- |
| `NEW_ORDER`             | Kitchen     | OrderService          | ส่งออเดอร์เข้าครัว                    |
| `ORDER_READY`           | Floor       | KitchenService        | อาหารพร้อมเสิร์ฟ                     |
| `CALL_WAITER`           | Floor       | Customer Mobile (P5)  | ลูกค้าเรียกพนักงาน                   |
| `REQUEST_BILL`          | Cashier     | OrderService          | ลูกค้าขอเช็คบิล                      |
| `RESERVATION_REMINDER`  | Floor       | BackgroundService     | แจ้งเตือนการจอง 30 นาทีล่วงหน้า     |
| `ORDER_CANCELLED`       | Kitchen     | OrderService          | ยกเลิกออเดอร์                        |
| `PAYMENT_COMPLETED`     | Floor       | PaymentService        | ชำระเงินเสร็จสิ้น                    |

> **Group Assignment Logic (OnConnectedAsync):**
> - kitchen-food/beverage/dessert.read → "Kitchen" group
> - order-manage.read → "Floor" group
> - payment-manage.read → "Cashier" group
> - มี permission ครบ → ทุก group (Manager)

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
