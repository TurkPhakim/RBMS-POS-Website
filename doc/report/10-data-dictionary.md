# พจนานุกรมข้อมูล (Data Dictionary)

> เอกสารฉบับนี้รวบรวมโครงสร้างของตารางในฐานข้อมูลทั้งหมดของระบบ RBMS-POS รวมทั้งสิ้น **37 ตาราง** จัดกลุ่มตาม 8 Business Modules — เป็นส่วนต่อจากบทที่ 3 หัวข้อ 3.6 การออกแบบฐานข้อมูล

---

## Audit Fields (สำหรับทุกตารางที่สืบทอดจาก BaseEntity)

ตารางที่ระบุว่า "สืบทอดจาก BaseEntity" จะมีฟิลด์เพิ่มเติมต่อไปนี้โดยอัตโนมัติ (จัดการโดย ORM Framework)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| CreatedAt | DATETIME | วันเวลาที่สร้างเรคคอร์ด | 2026-05-30 10:15:00 |
| CreatedBy | INT | รหัสพนักงานผู้สร้างเรคคอร์ด (FK: TbEmployees) | 1 |
| UpdatedAt | DATETIME | วันเวลาที่แก้ไขเรคคอร์ดล่าสุด | 2026-05-30 14:30:00 |
| UpdatedBy | INT | รหัสพนักงานผู้แก้ไขเรคคอร์ดล่าสุด (FK: TbEmployees) | 2 |
| DeleteFlag | BIT | สถานะการลบแบบ Soft Delete (0=ใช้งาน, 1=ลบแล้ว) | 0 |
| DeletedAt | DATETIME | วันเวลาที่ลบเรคคอร์ด | NULL |
| DeletedBy | INT | รหัสพนักงานผู้ลบเรคคอร์ด (FK: TbEmployees) | NULL |

ตารางที่ "ไม่สืบทอด BaseEntity" จะระบุไว้ในคำอธิบายแต่ละตาราง (ไม่มี Audit Fields ข้างต้น)

---

# หมวดที่ 1 โมดูลการจัดการสิทธิ์ (Authorization)

ระบบจัดการสิทธิ์การเข้าถึงตามตำแหน่งงาน (Position-based RBAC) ประกอบด้วย 5 ตาราง สำหรับเก็บข้อมูลตำแหน่ง สิทธิ์ โมดูล และการจับคู่สิทธิ์-ตำแหน่ง

## ตารางที่ 3.1 ตาราง TbmPosition

เก็บข้อมูลตำแหน่งงานภายในร้าน ใช้เป็นรากฐานของระบบการจัดการสิทธิ์ตามตำแหน่ง (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| PositionId | INT - PK | รหัสประจำตัวตำแหน่งงาน | 1 |
| PositionName | NVARCHAR(100) | ชื่อตำแหน่งงาน (Unique) | พนักงานเสิร์ฟ |
| Description | NVARCHAR(500) | คำอธิบายของตำแหน่ง | รับออเดอร์และเสิร์ฟอาหารให้ลูกค้า |
| IsActive | BIT | สถานะการใช้งาน (0=ปิด, 1=เปิด) | 1 |

---

## ตารางที่ 3.2 ตาราง TbmPermission

เก็บประเภท Operation ที่ใช้กับทุกโมดูลในระบบ (Master Data — Seed 4 รายการ, สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| PermissionId | INT - PK | รหัสประจำตัว Operation | 2 |
| PermissionName | NVARCHAR(50) | ชื่อสำหรับแสดงผล | เพิ่ม |
| PermissionCode | NVARCHAR(20) | รหัส Operation (read / create / update / delete) | create |
| SortOrder | INT | ลำดับการแสดงผล | 2 |

---

## ตารางที่ 3.3 ตาราง TbmModule

เก็บโครงสร้างโมดูลของระบบในรูปแบบลำดับชั้น (Parent-Child) สำหรับจัดกลุ่มสิทธิ์การใช้งาน (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| ModuleId | INT - PK | รหัสประจำตัวโมดูล | 5 |
| ModuleName | NVARCHAR(100) | ชื่อโมดูลที่แสดงผล | จัดการพนักงาน |
| ModuleCode | NVARCHAR(50) | รหัสโมดูล (Unique) | employee |
| ParentModuleId | INT | รหัสโมดูลแม่ (FK: TbmModule, NULL=โมดูลระดับบนสุด) | 3 |
| SortOrder | INT | ลำดับการแสดงผล | 1 |
| IsActive | BIT | สถานะการใช้งาน (0=ปิด, 1=เปิด) | 1 |

---

## ตารางที่ 3.4 ตาราง TbmAuthorizeMatrix

จับคู่ Module กับ Permission สร้างเป็น PermissionPath (Master Data — Seed, สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| AuthorizeMatrixId | INT - PK | รหัสประจำตัวการจับคู่ | 17 |
| ModuleId | INT | รหัสโมดูล (FK: TbmModule) | 5 |
| PermissionId | INT | รหัสประเภท Operation (FK: TbmPermission) | 2 |
| PermissionPath | NVARCHAR(100) | เส้นทางสิทธิ์รวม (Unique) | employee.create |

---

## ตารางที่ 3.5 ตาราง TbAuthorizeMatrixPosition

กำหนดสิทธิ์ของตำแหน่งงาน เป็นความสัมพันธ์แบบหลายต่อหลายระหว่าง Position กับ AuthorizeMatrix หากมีเรคคอร์ดอยู่หมายความว่าตำแหน่งนั้นได้รับสิทธิ์นั้น (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| AuthMatrixPositionId | INT - PK | รหัสประจำตัวการกำหนดสิทธิ์ | 1 |
| AuthorizeMatrixId | INT | รหัสการจับคู่ Module-Permission (FK: TbmAuthorizeMatrix) | 17 |
| PositionId | INT | รหัสตำแหน่งงาน (FK: TbmPosition) | 2 |

---

# หมวดที่ 2 โมดูลผู้ดูแลระบบ (Admin)

โมดูลรองรับการจัดการระบบโดยรวม รวมถึงบัญชีผู้ใช้ การตั้งค่าร้าน ไฟล์ ค่าบริการ และระบบรักษาความปลอดภัย ประกอบด้วย 8 ตาราง

## ตารางที่ 3.6 ตาราง TbUsers

เก็บข้อมูลบัญชีผู้ใช้ระบบ ประกอบด้วยข้อมูลการเข้าสู่ระบบ สถานะการล็อคบัญชี และข้อมูลความปลอดภัย (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| UserId | UNIQUEIDENTIFIER - PK | รหัสประจำตัวผู้ใช้ | 550e8400-e29b-41d4-a716-446655440000 |
| Username | VARCHAR(255) | ชื่อผู้ใช้สำหรับเข้าสู่ระบบ (Unique) | staff001 |
| Email | VARCHAR(255) | อีเมลสำหรับเข้าสู่ระบบและรับการแจ้งเตือน (Unique) | staff001@restaurant.com |
| PasswordHash | VARCHAR(255) | รหัสผ่านที่ผ่านการเข้ารหัสด้วย BCrypt | $2a$11$R9h7cIPz0gi.URNNGU3He... |
| IsActive | BIT | สถานะการเปิดใช้งานบัญชี (0=ปิด, 1=เปิด) | 1 |
| FailedLoginAttempts | INT | จำนวนครั้งที่เข้าสู่ระบบไม่สำเร็จติดต่อกัน | 0 |
| LockoutCount | INT | จำนวนครั้งที่บัญชีถูกล็อคอัตโนมัติ | 0 |
| LockedUntil | DATETIME | วันเวลาที่บัญชีถูกล็อคจนถึง (ล็อคอัตโนมัติ) | NULL |
| LastLoginDate | DATETIME | วันเวลาที่เข้าสู่ระบบสำเร็จครั้งล่าสุด | 2026-05-30 09:15:23 |
| LastPasswordChangedDate | DATETIME | วันเวลาที่เปลี่ยนรหัสผ่านครั้งล่าสุด | 2026-04-01 10:00:00 |
| IsLockedByAdmin | BIT | สถานะการถูกล็อคโดยผู้ดูแลระบบ (0=ปกติ, 1=ถูกล็อค) | 0 |
| AutoUnlockDate | DATETIME | วันที่ระบบจะปลดล็อคบัญชีอัตโนมัติ | NULL |
| PinCodeHash | NVARCHAR(256) | รหัส PIN ที่ผ่านการเข้ารหัส (สำหรับใช้งานในอนาคต) | NULL |

---

## ตารางที่ 3.7 ตาราง TbShopSettings

เก็บข้อมูลการตั้งค่าร้าน (มีเพียง 1 เรคคอร์ดต่อร้าน) ครอบคลุมข้อมูลร้าน โลโก้ ช่องทางติดต่อ ข้อมูลบัญชีธนาคาร PromptPay WiFi และข้อความหัว-ท้ายใบเสร็จ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| ShopSettingsId | INT - PK | รหัสประจำตัวการตั้งค่า | 1 |
| ShopNameThai | NVARCHAR(200) | ชื่อร้าน (ภาษาไทย) | ร้านส้มตำคุณนาง |
| ShopNameEnglish | NVARCHAR(200) | ชื่อร้าน (ภาษาอังกฤษ) | Khun Nang Som Tam |
| CompanyNameThai | NVARCHAR(200) | ชื่อบริษัท (ภาษาไทย) | บริษัท คุณนาง จำกัด |
| CompanyNameEnglish | NVARCHAR(200) | ชื่อบริษัท (ภาษาอังกฤษ) | Khun Nang Co., Ltd. |
| TaxId | NVARCHAR(13) | เลขประจำตัวผู้เสียภาษี 13 หลัก | 1234567890123 |
| FoodType | NVARCHAR(200) | ประเภทอาหารของร้าน | อาหารไทย อีสาน |
| Description | NVARCHAR(2000) | รายละเอียดของร้าน | ร้านส้มตำสูตรต้นตำรับ เปิดมา 20 ปี |
| LogoFileId | INT | รหัสไฟล์โลโก้ร้าน (FK: TbFiles) | 1 |
| HasTwoPeriods | BIT | มีช่วงเวลาทำการ 2 ช่วงต่อวันหรือไม่ (0=ไม่มี, 1=มี) | 1 |
| Address | NVARCHAR(2000) | ที่อยู่ของร้าน (สำหรับใบเสร็จ) | 123 ถนนสุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110 |
| PhoneNumber | NVARCHAR(50) | เบอร์โทรศัพท์ของร้าน | 0223456789 |
| Facebook | NVARCHAR(200) | URL ของ Facebook | facebook.com/khunnang |
| Instagram | NVARCHAR(200) | URL ของ Instagram | instagram.com/khunnang |
| ShopEmail | NVARCHAR(200) | อีเมลของร้าน | info@khunnang.com |
| Website | NVARCHAR(500) | URL เว็บไซต์ของร้าน | www.khunnang.com |
| LineId | NVARCHAR(100) | LINE ID ของร้าน | @khunnang |
| PaymentQrCodeFileId | INT | รหัสไฟล์ QR Code สำหรับรับชำระเงิน (FK: TbFiles) | 2 |
| BankName | NVARCHAR(100) | ชื่อธนาคารของร้าน | ธนาคารกสิกรไทย |
| AccountNumber | NVARCHAR(20) | เลขที่บัญชีธนาคาร | 123-4-56789-0 |
| AccountName | NVARCHAR(200) | ชื่อบัญชีธนาคาร | บริษัท คุณนาง จำกัด |
| PromptPayNumber | NVARCHAR(20) | หมายเลข PromptPay | 0891234567 |
| WifiSsid | NVARCHAR(100) | ชื่อสัญญาณ WiFi ของร้าน | KhunNang_WiFi |
| WifiPassword | NVARCHAR(100) | รหัสผ่าน WiFi ของร้าน | welcome2026 |
| ReceiptHeaderText | NVARCHAR(500) | ข้อความหัวใบเสร็จ | ยินดีต้อนรับสู่ร้านคุณนาง |
| ReceiptFooterText | NVARCHAR(500) | ข้อความท้ายใบเสร็จ | ขอบคุณที่ใช้บริการ |

---

## ตารางที่ 3.8 ตาราง TbShopOperatingHours

เก็บเวลาทำการของร้านรายวัน รวม 7 เรคคอร์ด (จันทร์ถึงอาทิตย์) แต่ละวันรองรับการเปิด-ปิดได้สูงสุด 2 ช่วงเวลา (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| ShopOperatingHourId | INT - PK | รหัสประจำตัวเวลาทำการ | 1 |
| ShopSettingsId | INT | รหัสการตั้งค่าร้าน (FK: TbShopSettings) | 1 |
| DayOfWeek | INT | วันในสัปดาห์ — Enum EDayOfWeek (1=จันทร์, 2=อังคาร, ... , 7=อาทิตย์) | 1 |
| IsOpen | BIT | เปิดทำการในวันนี้หรือไม่ (0=ปิด, 1=เปิด) | 1 |
| OpenTime1 | TIME(7) NULL | เวลาเปิดช่วงที่ 1 | 10:00:00 |
| CloseTime1 | TIME(7) NULL | เวลาปิดช่วงที่ 1 | 14:00:00 |
| OpenTime2 | TIME(7) NULL | เวลาเปิดช่วงที่ 2 (ใช้เมื่อ HasTwoPeriods=1) | 17:00:00 |
| CloseTime2 | TIME(7) NULL | เวลาปิดช่วงที่ 2 (ใช้เมื่อ HasTwoPeriods=1) | 22:00:00 |

---

## ตารางที่ 3.9 ตาราง TbServiceCharges

เก็บการตั้งค่าค่าบริการ (Service Charge) ที่เรียกเก็บเพิ่มจากลูกค้าในรูปแบบเปอร์เซ็นต์ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| ServiceChargeId | INT - PK | รหัสประจำตัวการตั้งค่า | 1 |
| Name | NVARCHAR(100) | ชื่อการตั้งค่า | Service Charge 10% |
| Description | NVARCHAR(255) | รายละเอียดเพิ่มเติม | ค่าบริการมาตรฐาน |
| PercentageRate | DECIMAL(5,2) | อัตราเปอร์เซ็นต์ที่เรียกเก็บ | 10.00 |
| IsActive | BIT | สถานะการเปิดใช้งาน (0=ปิด, 1=เปิด) | 1 |
| StartDate | DATETIME2 | วันที่เริ่มมีผล (NULL=ไม่กำหนด) | 2026-01-01 00:00:00 |
| EndDate | DATETIME2 | วันที่สิ้นสุด (NULL=ไม่กำหนด) | NULL |

---

## ตารางที่ 3.10 ตาราง TbFiles

เก็บ Metadata ของไฟล์ที่อัพโหลดเข้าสู่ระบบ (เช่น รูปเมนู โลโก้ สลิป) โดยไฟล์จริงจะถูกเก็บใน Object Storage (MinIO) (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| FileId | INT - PK | รหัสประจำตัวไฟล์ | 22 |
| FileName | NVARCHAR(255) | ชื่อไฟล์ต้นฉบับที่อัพโหลด | menu-padkrapao.jpg |
| MimeType | VARCHAR(100) | ประเภท MIME ของไฟล์ | image/jpeg |
| FileExtension | VARCHAR(10) | นามสกุลของไฟล์ | .jpg |
| FileSize | BIGINT | ขนาดของไฟล์ (bytes) | 245678 |
| S3Key | VARCHAR(500) | คีย์อ้างอิงใน Object Storage (Unique) | menus/2026/05/30/abc123.jpg |

---

## ตารางที่ 3.11 ตาราง TbRefreshTokens

เก็บ Refresh Token ของระบบยืนยันตัวตน เพื่อต่ออายุ Access Token โดยที่ผู้ใช้ไม่ต้องเข้าสู่ระบบใหม่ (**ไม่สืบทอด BaseEntity** — ไม่มี Audit Fields)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| RefreshTokenId | UNIQUEIDENTIFIER - PK | รหัสประจำตัว Token | 7c9e6679-7425-40de-944b-e07fc1f90ae7 |
| UserId | UNIQUEIDENTIFIER | รหัสผู้ใช้เจ้าของ Token (FK: TbUsers) | 550e8400-e29b-41d4-a716-446655440000 |
| Token | VARCHAR(500) | ค่า Token (Unique) | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| ExpiresAt | DATETIME | วันเวลาหมดอายุของ Token | 2026-06-30 10:00:00 |
| IsRevoked | BIT | สถานะการเพิกถอน Token (0=ยังใช้ได้, 1=ถูกเพิกถอน) | 0 |
| RevokedAt | DATETIME | วันเวลาที่ Token ถูกเพิกถอน | NULL |
| RevokedByIp | VARCHAR(45) | IP Address ที่ทำการเพิกถอน | NULL |
| CreatedByIp | VARCHAR(45) | IP Address ที่สร้าง Token | 192.168.1.100 |
| CreatedAt | DATETIME | วันเวลาที่สร้าง Token | 2026-05-30 10:00:00 |

---

## ตารางที่ 3.12 ตาราง TbPasswordResetTokens

เก็บรหัส OTP และ Token ในกระบวนการรีเซ็ตรหัสผ่าน (Forgot Password) แบ่งเป็น 2 เฟส คือเฟส OTP และเฟส Reset Token (**ไม่สืบทอด BaseEntity** — ไม่มี Audit Fields)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| PasswordResetTokenId | UNIQUEIDENTIFIER - PK | รหัสประจำตัว | 7c9e6679-7425-40de-944b-e07fc1f90ae7 |
| UserId | UNIQUEIDENTIFIER | รหัสผู้ใช้ที่ขอรีเซ็ต (FK: TbUsers) | 550e8400-e29b-41d4-a716-446655440000 |
| OtpCode | NVARCHAR(6) | รหัส OTP 6 หลัก | 123456 |
| OtpExpiresAt | DATETIME | วันเวลาที่ OTP หมดอายุ (15 นาที) | 2026-05-30 14:15:00 |
| OtpVerified | BIT | สถานะการยืนยัน OTP (0=ยังไม่ยืนยัน, 1=ยืนยันแล้ว) | 1 |
| OtpAttempts | INT | จำนวนครั้งที่ใส่ OTP ผิด (สูงสุด 5) | 0 |
| ResetToken | NVARCHAR(500) | Token สำหรับรีเซ็ตรหัสผ่าน (ออกหลังยืนยัน OTP) | reset_abc123xyz789 |
| ResetTokenExpiresAt | DATETIME | วันเวลาที่ Reset Token หมดอายุ (30 นาที) | 2026-05-30 14:45:00 |
| IsUsed | BIT | สถานะการใช้งาน (0=ยังไม่ใช้, 1=ใช้แล้ว) | 0 |
| CreatedAt | DATETIME | วันเวลาที่สร้าง Token | 2026-05-30 14:00:00 |

---

## ตารางที่ 3.13 ตาราง TbPasswordHistories

เก็บประวัติรหัสผ่านของผู้ใช้ เพื่อป้องกันการนำรหัสผ่านเดิม 5 ครั้งล่าสุดกลับมาใช้ซ้ำ (Append-only) (**ไม่สืบทอด BaseEntity** — ไม่มี Audit Fields)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| PasswordHistoryId | INT - PK | รหัสประจำตัวประวัติ | 1 |
| UserId | UNIQUEIDENTIFIER | รหัสผู้ใช้เจ้าของรหัสผ่าน (FK: TbUsers) | 550e8400-e29b-41d4-a716-446655440000 |
| PasswordHash | VARCHAR(255) | รหัสผ่านเดิมที่ผ่านการเข้ารหัส | $2a$11$R9h7cIPz0gi.URNNGU3He... |
| CreatedAt | DATETIME | วันเวลาที่เปลี่ยนรหัสผ่าน | 2026-04-01 10:00:00 |

---

# หมวดที่ 3 โมดูลทรัพยากรบุคคล (Human Resource)

โมดูลสำหรับจัดการข้อมูลพนักงานในร้าน ครอบคลุมข้อมูลส่วนตัว เงินเดือน บัญชีธนาคาร และเชื่อมโยงกับตำแหน่งงานและบัญชีผู้ใช้ ประกอบด้วย 4 ตาราง (พนักงาน ที่อยู่ ประวัติการศึกษา และประวัติการทำงาน)

## ตารางที่ 3.14 ตาราง TbEmployees

เก็บข้อมูลพนักงานทุกคนภายในร้าน ครอบคลุมข้อมูลส่วนตัว ตำแหน่งงาน ข้อมูลธนาคาร สัญชาติ ศาสนา และประเภทการจ้างงาน (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| EmployeeId | INT - PK | รหัสประจำตัวพนักงาน | 1 |
| Title | INT NULL | คำนำหน้าชื่อ — Enum ETitle (1=นาย, 2=นาง, 3=นางสาว) | 1 |
| FirstNameThai | NVARCHAR(255) | ชื่อจริง (ภาษาไทย) | สมชาย |
| LastNameThai | NVARCHAR(255) | นามสกุล (ภาษาไทย) | ใจดี |
| FirstNameEnglish | NVARCHAR(255) | ชื่อจริง (ภาษาอังกฤษ) | Somchai |
| LastNameEnglish | NVARCHAR(255) | นามสกุล (ภาษาอังกฤษ) | Jaidee |
| Nickname | NVARCHAR(50) | ชื่อเล่น (แสดงในระบบ Order) | ชาย |
| Gender | INT | เพศ — Enum EGender (1=ชาย, 2=หญิง, 3=ไม่ระบุ) | 1 |
| DateOfBirth | DATETIME | วันเดือนปีเกิด | 1995-06-15 |
| StartDate | DATETIME | วันที่เริ่มงาน | 2026-01-15 |
| EndDate | DATETIME | วันที่สิ้นสุดการทำงาน | NULL |
| NationalId | NVARCHAR(13) | เลขประจำตัวประชาชน 13 หลัก | 1234567890123 |
| BankAccountNumber | NVARCHAR(20) | เลขบัญชีธนาคารสำหรับรับเงินเดือน | 1234567890 |
| BankName | NVARCHAR(100) | ชื่อธนาคาร | ธนาคารกสิกรไทย |
| Nationality | INT NULL | สัญชาติ — Enum ENationality | 1 |
| Religion | INT NULL | ศาสนา — Enum EReligion | 1 |
| LineId | NVARCHAR(100) | LINE ID ส่วนตัว | somchai_jaidee |
| PositionId | INT | รหัสตำแหน่งงาน (FK: TbmPosition) | 2 |
| Phone | NVARCHAR(20) | เบอร์โทรศัพท์ | 0812345678 |
| Email | NVARCHAR(255) | อีเมลส่วนตัว | somchai@example.com |
| IsFullTime | BIT | ประเภทการจ้างงาน (1=พนักงานประจำ, 0=พาร์ทไทม์) | 1 |
| Salary | DECIMAL(10,2) | เงินเดือน (บาทต่อเดือน) สำหรับพนักงานประจำ | 18000.00 |
| HourlyRate | DECIMAL(10,2) | ค่าจ้างต่อชั่วโมง (บาท) สำหรับพนักงานพาร์ทไทม์ | NULL |
| ImageFileId | INT | รหัสไฟล์รูปโปรไฟล์ (FK: TbFiles) | 15 |
| IsActive | BIT | สถานะการใช้งาน (0=ปิด, 1=เปิด) | 1 |
| UserId | UNIQUEIDENTIFIER | รหัสบัญชีผู้ใช้ที่เชื่อมโยง (FK: TbUsers) | 550e8400-e29b-41d4-a716-446655440000 |

---

## ตารางที่ 3.15 ตาราง TbEmployeeAddresses

เก็บข้อมูลที่อยู่ของพนักงาน รองรับการเก็บที่อยู่ตามทะเบียนบ้านและที่อยู่ปัจจุบัน โดยพนักงาน 1 คนสามารถมีที่อยู่ได้หลายรายการ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| AddressId | INT - PK | รหัสประจำตัวที่อยู่ | 1 |
| EmployeeId | INT | รหัสพนักงาน (FK: TbEmployees) | 1 |
| AddressType | INT | ประเภทที่อยู่ — Enum EAddressType (1=ทะเบียนบ้าน, 2=ปัจจุบัน) | 1 |
| HouseNumber | NVARCHAR(50) | บ้านเลขที่ | 123/45 |
| Building | NVARCHAR(255) | อาคารหรือหมู่บ้าน | หมู่บ้านสุขสบาย |
| Moo | NVARCHAR(50) | หมู่ที่ | 5 |
| Soi | NVARCHAR(255) | ซอย | สุขุมวิท 21 |
| Yaek | NVARCHAR(255) | แยก | NULL |
| Road | NVARCHAR(255) | ถนน | สุขุมวิท |
| SubDistrict | NVARCHAR(255) | ตำบลหรือแขวง | คลองเตยเหนือ |
| District | NVARCHAR(255) | อำเภอหรือเขต | วัฒนา |
| Province | NVARCHAR(255) | จังหวัด | กรุงเทพมหานคร |
| PostalCode | NVARCHAR(10) | รหัสไปรษณีย์ | 10110 |

---

## ตารางที่ 3.16 ตาราง TbEmployeeEducations

เก็บประวัติการศึกษาของพนักงาน รองรับการบันทึกการศึกษาหลายระดับ ตั้งแต่มัธยมศึกษาจนถึงปริญญาเอก โดยพนักงาน 1 คนสามารถมีประวัติได้หลายรายการ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| EducationId | INT - PK | รหัสประจำตัวประวัติการศึกษา | 1 |
| EmployeeId | INT | รหัสพนักงาน (FK: TbEmployees) | 1 |
| EducationLevel | NVARCHAR(100) | ระดับการศึกษา | ปริญญาตรี |
| Major | NVARCHAR(255) | สาขาวิชาที่ศึกษา | บริหารธุรกิจ |
| Institution | NVARCHAR(255) | ชื่อสถาบันการศึกษา | มหาวิทยาลัยเกษตรศาสตร์ |
| GPA | DECIMAL(3,2) | เกรดเฉลี่ยสะสม | 3.45 |
| GraduationYear | INT | ปีที่สำเร็จการศึกษา (พ.ศ.) | 2566 |

---

## ตารางที่ 3.17 ตาราง TbEmployeeWorkHistories

เก็บประวัติการทำงานก่อนเข้าทำงานในร้าน เพื่อใช้ในการประเมินประสบการณ์ของพนักงาน โดยพนักงาน 1 คนสามารถมีประวัติได้หลายรายการ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| WorkHistoryId | INT - PK | รหัสประจำตัวประวัติการทำงาน | 1 |
| EmployeeId | INT | รหัสพนักงาน (FK: TbEmployees) | 1 |
| Workplace | NVARCHAR(255) | สถานที่ทำงานเดิม | ร้านอาหารบ้านสวน |
| WorkPhone | NVARCHAR(20) | เบอร์โทรของที่ทำงานเดิม | 022345678 |
| Position | NVARCHAR(100) | ตำแหน่งที่เคยทำ | พนักงานเสริฟ |
| StartDate | DATETIME | วันเริ่มงาน | 2023-03-01 |
| EndDate | DATETIME | วันสิ้นสุดการทำงาน | 2025-12-31 |

---

# หมวดที่ 4 โมดูลเมนู (Menu)

โมดูลสำหรับจัดการรายการเมนูอาหาร เครื่องดื่ม และของหวาน รวมถึงหมวดหมู่ย่อยและกลุ่มตัวเลือกเสริม ประกอบด้วย 5 ตาราง

## ตารางที่ 3.18 ตาราง TbMenuSubCategories

เก็บหมวดหมู่ย่อยของเมนู โดยแยกตามประเภทหลัก (อาหาร เครื่องดื่ม ของหวาน) เพื่อจัดกลุ่มในการแสดงผล (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| SubCategoryId | INT - PK | รหัสประจำตัวหมวดหมู่ย่อย | 1 |
| CategoryType | INT | ประเภทหลัก — Enum EMenuCategory (1=อาหาร, 2=เครื่องดื่ม, 3=ของหวาน) | 1 |
| Name | NVARCHAR(100) | ชื่อหมวดหมู่ย่อย | อาหารจานเดียว |
| SortOrder | INT | ลำดับการแสดงผล | 1 |
| IsActive | BIT | สถานะการใช้งาน (0=ปิด, 1=เปิด) | 1 |

---

## ตารางที่ 3.19 ตาราง TbMenus

เก็บข้อมูลรายการเมนูทั้งหมดของร้าน ประกอบด้วยชื่อ 2 ภาษา ราคา ต้นทุน หมวดหมู่ ช่วงเวลาขาย และข้อมูลโภชนาการ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| MenuId | INT - PK | รหัสประจำตัวเมนู | 1 |
| NameThai | NVARCHAR(255) | ชื่อเมนู (ภาษาไทย) | ผัดกระเพราหมูสับไข่ดาว |
| NameEnglish | NVARCHAR(255) | ชื่อเมนู (ภาษาอังกฤษ) | Stir-fried Basil Pork with Fried Egg |
| Description | NVARCHAR(MAX) | รายละเอียดของเมนู | ผัดกระเพราหมูสับสูตรเด็ด เผ็ดร้อนถึงใจ |
| ImageFileId | INT | รหัสไฟล์รูปประกอบเมนู (FK: TbFiles) | 22 |
| SubCategoryId | INT | รหัสหมวดหมู่ย่อย (FK: TbMenuSubCategories) | 2 |
| Price | DECIMAL(10,2) | ราคาขาย (บาท) | 65.00 |
| CostPrice | DECIMAL(10,2) | ราคาต้นทุน (บาท) | 25.00 |
| IsAvailable | BIT | สถานะพร้อมขาย (0=หมด, 1=พร้อมขาย) | 1 |
| IsAvailablePeriod1 | BIT | ขายในช่วงเวลาที่ 1 ของวัน | 1 |
| IsAvailablePeriod2 | BIT | ขายในช่วงเวลาที่ 2 ของวัน | 1 |
| Tags | INT | Flag ของแท็ก — Enum EMenuTag (0=ไม่มี, 1=แนะนำ, 2=ตามฤดูกาล, 4=ใช้เวลานาน) | 1 |
| Allergens | NVARCHAR(500) | สารก่อภูมิแพ้ | ไข่, ถั่วเหลือง |
| CaloriesPerServing | DECIMAL(8,2) | แคลอรีต่อหน่วยเสิร์ฟ | 450.50 |
| IsPinned | BIT | สถานะการปักหมุดเมนูแนะนำ (0=ไม่ปัก, 1=ปัก) | 0 |

---

## ตารางที่ 3.20 ตาราง TbOptionGroups

เก็บกลุ่มตัวเลือกเสริมที่สามารถผูกกับเมนูได้ เช่น ระดับความเผ็ด ขนาดถ้วย ท็อปปิ้ง (สืบทอดจาก BaseEntity, ใช้ Hard Delete)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| OptionGroupId | INT - PK | รหัสประจำตัวกลุ่มตัวเลือก | 1 |
| Name | NVARCHAR(100) | ชื่อกลุ่มตัวเลือก | ระดับความเผ็ด |
| CategoryType | INT | ประเภทเมนูที่ใช้กลุ่มนี้ได้ (1=อาหาร, 2=เครื่องดื่ม, 3=ของหวาน) | 1 |
| IsRequired | BIT | ต้องเลือกหรือไม่ (0=ไม่บังคับ, 1=บังคับ) | 1 |
| MinSelect | INT | จำนวนตัวเลือกขั้นต่ำที่ต้องเลือก | 1 |
| MaxSelect | INT | จำนวนตัวเลือกสูงสุดที่เลือกได้ (NULL=ไม่จำกัด) | 1 |
| SortOrder | INT | ลำดับการแสดงผล | 1 |
| IsActive | BIT | สถานะการใช้งาน (0=ปิด, 1=เปิด) | 1 |

---

## ตารางที่ 3.21 ตาราง TbOptionItems

เก็บรายการตัวเลือกย่อยภายใต้กลุ่มตัวเลือก เช่น เผ็ดน้อย เผ็ดกลาง เผ็ดมาก (สืบทอดจาก BaseEntity, ใช้ Hard Delete)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| OptionItemId | INT - PK | รหัสประจำตัวรายการตัวเลือก | 1 |
| OptionGroupId | INT | รหัสกลุ่มตัวเลือกที่สังกัด (FK: TbOptionGroups) | 1 |
| Name | NVARCHAR(100) | ชื่อตัวเลือก | เผ็ดมาก |
| AdditionalPrice | DECIMAL(10,2) | ราคาส่วนเพิ่มจากเมนูหลัก (บาท) | 0.00 |
| CostPrice | DECIMAL(10,2) | ต้นทุนของตัวเลือก (บาท) | 0.00 |
| SortOrder | INT | ลำดับการแสดงผล | 3 |
| IsActive | BIT | สถานะการใช้งาน (0=ปิด, 1=เปิด) | 1 |

---

## ตารางที่ 3.22 ตาราง TbMenuOptionGroups

ตารางเชื่อมแบบหลายต่อหลาย (Many-to-Many) ระหว่างเมนูกับกลุ่มตัวเลือก สำหรับกำหนดว่าเมนูใดมีตัวเลือกใดบ้าง (สืบทอดจาก BaseEntity, ใช้ Hard Delete)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| MenuOptionGroupId | INT - PK | รหัสประจำตัวการเชื่อม | 1 |
| MenuId | INT | รหัสเมนู (FK: TbMenus) | 1 |
| OptionGroupId | INT | รหัสกลุ่มตัวเลือก (FK: TbOptionGroups) | 1 |
| SortOrder | INT | ลำดับการแสดงตัวเลือกของเมนูนี้ | 1 |

---

# หมวดที่ 5 โมดูลโต๊ะและผังร้าน (Table)

โมดูลสำหรับจัดการโต๊ะ ผังพื้นที่ภายในร้าน วัตถุประดับ การเชื่อมโต๊ะ และการจองโต๊ะ ประกอบด้วย 5 ตาราง

## ตารางที่ 3.23 ตาราง TbZones

เก็บข้อมูลโซนพื้นที่ภายในร้าน (เช่น ชั้น 1 ระเบียง ห้อง VIP) สำหรับจัดกลุ่มโต๊ะ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| ZoneId | INT - PK | รหัสประจำตัวโซน | 1 |
| ZoneName | NVARCHAR(100) | ชื่อโซน (Unique) | ชั้น 1 |
| Color | NVARCHAR(20) | สีของโซนในผังร้าน (รหัส Hex) | #FF5733 |
| SortOrder | INT | ลำดับการแสดงผล | 1 |
| IsActive | BIT | สถานะการใช้งาน (0=ปิด, 1=เปิด) | 1 |

---

## ตารางที่ 3.24 ตาราง TbTables

เก็บข้อมูลโต๊ะภายในร้าน ครอบคลุมชื่อโต๊ะ ความจุ ตำแหน่งบนผังร้าน สถานะ และ QR Token สำหรับลูกค้าสแกนสั่งอาหาร (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| TableId | INT - PK | รหัสประจำตัวโต๊ะ | 1 |
| TableName | NVARCHAR(50) | ชื่อโต๊ะ (Unique) | A1 |
| ZoneId | INT | รหัสโซนที่โต๊ะอยู่ (FK: TbZones) | 1 |
| Capacity | INT | จำนวนที่นั่งสูงสุดของโต๊ะ | 4 |
| PositionX | FLOAT | ตำแหน่งแกน X บนผังร้าน (พิกเซล) | 120.5 |
| PositionY | FLOAT | ตำแหน่งแกน Y บนผังร้าน (พิกเซล) | 200.3 |
| Size | INT | ขนาดของโต๊ะ — Enum ETableSize (0=เล็ก, 1=กลาง, 2=ใหญ่) | 1 |
| Status | INT | สถานะของโต๊ะ — Enum ETableStatus (0=ว่าง, 1=ใช้งานอยู่, 2=กำลังออกบิล, 3=จองแล้ว, 4=กำลังทำความสะอาด, 5=ปิดใช้งาน) | 0 |
| CurrentGuests | INT NULL | จำนวนลูกค้าที่นั่งโต๊ะนี้อยู่ปัจจุบัน | NULL |
| GuestType | INT NULL | ประเภทลูกค้า — Enum EGuestType (0=ลูกค้าทั่วไป, 1=ลูกค้าจอง) | NULL |
| OpenedAt | DATETIME NULL | วันเวลาที่เริ่มเปิดใช้โต๊ะรอบปัจจุบัน | NULL |
| Note | NVARCHAR(500) | หมายเหตุของโต๊ะ | ติดหน้าต่าง |
| QrToken | NVARCHAR(2000) | JWT Token สำหรับลูกค้าสแกน QR เพื่อสั่งอาหาร | eyJhbGciOiJIUzI1NiIsInR5cCI6... |
| QrTokenExpiresAt | DATETIME NULL | วันเวลาที่ Token หมดอายุ | 2026-05-30 22:00:00 |
| QrTokenNonce | NVARCHAR(50) | ค่า Nonce สำหรับเพิกถอน Token | abc123xyz |
| QrShortCode | NVARCHAR(20) | รหัสสั้นสำหรับ URL ของ QR Code | TBA1XY |
| ActiveOrderId | INT NULL | รหัสออเดอร์ที่เปิดอยู่บนโต๊ะนี้ (FK: TbOrders, NULL=ไม่มีออเดอร์) | NULL |

---

## ตารางที่ 3.25 ตาราง TbTableLinks

การเชื่อมโต๊ะหลายตัวเข้าด้วยกัน (เช่น รวมโต๊ะ A1 และ A2 ให้กลายเป็นโต๊ะเดียวกัน) เมื่อเชื่อมโต๊ะแล้วออเดอร์จะถูกรวมไปยังโต๊ะหลัก (สืบทอดจาก BaseEntity, ใช้ Hard Delete)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| TableLinkId | INT - PK | รหัสประจำตัวการเชื่อม | 1 |
| GroupCode | NVARCHAR(50) | รหัสกลุ่ม (โต๊ะที่มีรหัสเดียวกันคือเชื่อมกัน) | GRP-20260530-01 |
| IsPrimary | BIT | สถานะการเป็นโต๊ะหลัก (0=โต๊ะรอง, 1=โต๊ะหลัก) | 1 |
| TableId | INT | รหัสโต๊ะ (FK: TbTables, Unique — โต๊ะ 1 ตัวอยู่ได้ 1 กลุ่ม) | 1 |

---

## ตารางที่ 3.26 ตาราง TbFloorObjects

เก็บข้อมูลวัตถุประดับในผังร้าน (เช่น ห้องน้ำ บันได เคาน์เตอร์ ครัว ทางออก) เพื่อให้ผังร้านสมจริงและช่วยให้พนักงานเข้าใจตำแหน่งโต๊ะได้ชัดเจน (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| FloorObjectId | INT - PK | รหัสประจำตัววัตถุ | 1 |
| ZoneId | INT NULL | รหัสโซนที่วัตถุอยู่ (FK: TbZones, NULL=ไม่ระบุ) | 1 |
| ObjectType | INT | ประเภทวัตถุ — Enum EFloorObjectType (0=ห้องน้ำ, 1=บันได, 2=เคาน์เตอร์, 3=ครัว, 4=ทางออก, 5=จุดแคชเชียร์, 6=ต้นไม้, 7=ของตกแต่ง) | 2 |
| Label | NVARCHAR(100) | ชื่อแสดงผลของวัตถุ | เคาน์เตอร์รับออเดอร์ |
| PositionX | FLOAT | ตำแหน่งแกน X บนผังร้าน (พิกเซล) | 50.0 |
| PositionY | FLOAT | ตำแหน่งแกน Y บนผังร้าน (พิกเซล) | 100.0 |

---

## ตารางที่ 3.27 ตาราง TbReservations

เก็บข้อมูลการจองโต๊ะของลูกค้า ประกอบด้วยชื่อ-เบอร์ติดต่อ วันเวลา จำนวนคน และสถานะการจอง (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| ReservationId | INT - PK | รหัสประจำตัวการจอง | 1 |
| CustomerName | NVARCHAR(200) | ชื่อลูกค้าผู้จอง | นายสมศักดิ์ มั่งมี |
| CustomerPhone | NVARCHAR(20) | เบอร์โทรศัพท์ของลูกค้า | 0891234567 |
| ReservationDate | DATE | วันที่จอง (จัดเก็บแบบ DateOnly) | 2026-06-15 |
| ReservationTime | TIME(7) | เวลาที่จอง (จัดเก็บแบบ TimeOnly) | 19:00:00 |
| GuestCount | INT | จำนวนลูกค้าที่จะมา | 4 |
| TableId | INT NULL | รหัสโต๊ะที่กำหนดให้ (FK: TbTables, NULL=ยังไม่กำหนด) | 5 |
| Note | NVARCHAR(500) | หมายเหตุ | งานวันเกิด ขอเค้กด้วย |
| Status | INT | สถานะการจอง — Enum EReservationStatus (0=รอยืนยัน, 1=ยืนยันแล้ว, 2=เช็คอินแล้ว, 3=ยกเลิก, 4=ไม่มา) | 1 |
| ReminderSent | BIT | ส่งการแจ้งเตือนแล้วหรือไม่ (0=ยัง, 1=แล้ว) | 0 |

---

# หมวดที่ 6 โมดูลออเดอร์ (Order)

โมดูลหัวใจของระบบ POS รับผิดชอบการรับออเดอร์ การส่งครัว การจัดการบิล และรองรับการสั่งอาหารด้วยตนเองของลูกค้า (Self-Order) ประกอบด้วย 5 ตาราง

## ตารางที่ 3.28 ตาราง TbOrders

เก็บข้อมูลออเดอร์หลักของโต๊ะ โดย 1 ออเดอร์เทียบเท่ากับ 1 รอบของลูกค้า (ตั้งแต่เปิดโต๊ะจนถึงปิดบิล) (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| OrderId | INT - PK | รหัสประจำตัวออเดอร์ | 1 |
| TableId | INT | รหัสโต๊ะของออเดอร์นี้ (FK: TbTables) | 1 |
| OrderNumber | NVARCHAR(50) | เลขที่ออเดอร์ (เลขลำดับต่อวัน) | 20260530-001 |
| Status | INT | สถานะออเดอร์ — Enum EOrderStatus (0=Open ยังเปิดอยู่, 1=Billing กำลังออกบิล, 2=Completed เสร็จสิ้น) | 0 |
| GuestCount | INT | จำนวนลูกค้าในออเดอร์นี้ | 4 |
| SubTotal | DECIMAL(18,2) | ยอดรวมก่อนค่าบริการและภาษี (บาท) | 650.00 |
| Note | NVARCHAR(500) | หมายเหตุของออเดอร์ | ไม่เผ็ด |

---

## ตารางที่ 3.29 ตาราง TbOrderItems

เก็บรายการอาหารแต่ละชิ้นในออเดอร์ พร้อมเก็บภาพนิ่งของราคาขณะสั่ง (Snapshot) และติดตามสถานะการทำในครัว (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| OrderItemId | INT - PK | รหัสประจำตัวรายการ | 1 |
| OrderId | INT | รหัสออเดอร์ที่สังกัด (FK: TbOrders) | 1 |
| MenuId | INT | รหัสเมนูที่สั่ง (FK: TbMenus) | 1 |
| MenuNameThai | NVARCHAR(255) | ชื่อเมนูภาษาไทย (Snapshot ขณะสั่ง) | ผัดกระเพราหมูสับไข่ดาว |
| MenuNameEnglish | NVARCHAR(255) | ชื่อเมนูภาษาอังกฤษ (Snapshot ขณะสั่ง) | Stir-fried Basil Pork with Fried Egg |
| CategoryType | INT | ประเภทเมนู (1=อาหาร, 2=เครื่องดื่ม, 3=ของหวาน) | 1 |
| Quantity | INT | จำนวนที่สั่ง | 2 |
| UnitPrice | DECIMAL(18,2) | ราคาต่อหน่วยขณะสั่ง (Snapshot) | 65.00 |
| OptionsTotalPrice | DECIMAL(18,2) | ราคารวมของตัวเลือกเสริมต่อหน่วย | 0.00 |
| TotalPrice | DECIMAL(18,2) | ราคารวม (UnitPrice + OptionsTotalPrice) × Quantity | 130.00 |
| Status | INT | สถานะของรายการ — Enum EOrderItemStatus (0=Pending, 1=Sent, 2=Preparing, 3=Ready, 4=Served, 5=Voided, 6=Cancelled) | 3 |
| Note | NVARCHAR(500) | หมายเหตุของรายการ | ไม่ใส่ผัก |
| OrderedBy | NVARCHAR(100) | ชื่อผู้สั่ง (ชื่อเล่นพนักงานหรือชื่อเล่นลูกค้า) | ชาย |
| SentToKitchenAt | DATETIME | วันเวลาที่ส่งรายการให้ครัว | 2026-05-30 12:31:00 |
| CookingStartedAt | DATETIME | วันเวลาที่ครัวเริ่มทำ | 2026-05-30 12:32:15 |
| ReadyAt | DATETIME | วันเวลาที่อาหารพร้อมเสิร์ฟ | 2026-05-30 12:42:30 |
| ServedAt | DATETIME | วันเวลาที่เสิร์ฟแล้ว | NULL |
| CancelledBy | INT | รหัสพนักงานที่ยกเลิก (FK: TbEmployees) | NULL |
| CancelReason | NVARCHAR(255) | เหตุผลการยกเลิก | NULL |
| CostPrice | DECIMAL(18,2) | ราคาต้นทุนต่อหน่วย (Snapshot สำหรับคำนวณกำไร) | 25.00 |
| OrderBillId | INT | รหัสบิลที่รายการอยู่ (FK: TbOrderBills, NULL=ยังไม่แยกบิล) | NULL |
| SourceTableId | INT | รหัสโต๊ะต้นทาง (FK: TbTables, ใช้กับการเชื่อมโต๊ะ) | 1 |

---

## ตารางที่ 3.30 ตาราง TbOrderItemOptions

เก็บตัวเลือกเสริมที่ลูกค้าเลือกในแต่ละรายการ โดยเก็บภาพนิ่ง (Snapshot) ของชื่อและราคาขณะสั่ง (**ไม่สืบทอด BaseEntity** — ไม่มี Audit Fields)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| OrderItemOptionId | INT - PK | รหัสประจำตัวตัวเลือก | 1 |
| OrderItemId | INT | รหัสรายการอาหารที่สังกัด (FK: TbOrderItems) | 1 |
| OptionGroupId | INT | รหัสกลุ่มตัวเลือก (FK: TbOptionGroups) | 1 |
| OptionItemId | INT | รหัสตัวเลือก (FK: TbOptionItems) | 3 |
| OptionGroupName | NVARCHAR(100) | ชื่อกลุ่มตัวเลือก (Snapshot) | ระดับความเผ็ด |
| OptionItemName | NVARCHAR(100) | ชื่อตัวเลือก (Snapshot) | เผ็ดมาก |
| AdditionalPrice | DECIMAL(18,2) | ราคาส่วนเพิ่ม (Snapshot) | 0.00 |
| CostPrice | DECIMAL(18,2) | ต้นทุนตัวเลือก (Snapshot) | 0.00 |

---

## ตารางที่ 3.31 ตาราง TbOrderBills

เก็บข้อมูลบิลของออเดอร์ รองรับการแยกบิล (Split Bill) การคำนวณค่าบริการและภาษี รวมถึงระบบ OCR สลิปและการจองบิลแบบ Multi-Device (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| OrderBillId | INT - PK | รหัสประจำตัวบิล | 1 |
| OrderId | INT | รหัสออเดอร์ของบิล (FK: TbOrders) | 1 |
| BillNumber | NVARCHAR(50) | เลขที่บิล (รวมส่วนต่อท้ายหากแยกบิล) | 20260530-001-B1 |
| BillType | INT | ประเภทบิล — Enum EBillType (0=Full บิลเดียว, 1=ByItem แยกตามรายการ, 2=ByAmount แยกตามจำนวนเงิน) | 0 |
| SubTotal | DECIMAL(18,2) | ยอดรวมก่อนหักส่วนลด (บาท) | 650.00 |
| TotalDiscountAmount | DECIMAL(18,2) | ส่วนลดรวม (บาท) | 0.00 |
| NetAmount | DECIMAL(18,2) | ยอดสุทธิหลังหักส่วนลด | 650.00 |
| ServiceChargeId | INT NULL | รหัสการตั้งค่าค่าบริการ (FK: TbServiceCharges) | 1 |
| ServiceChargeRate | DECIMAL(18,2) | อัตราค่าบริการ % (Snapshot) | 10.00 |
| ServiceChargeAmount | DECIMAL(18,2) | จำนวนเงินค่าบริการ (บาท) | 65.00 |
| VatRate | DECIMAL(18,2) | อัตรา VAT % (Snapshot) | 7.00 |
| VatAmount | DECIMAL(18,2) | จำนวนเงิน VAT (บาท) | 45.50 |
| GrandTotal | DECIMAL(18,2) | ยอดสุทธิรวมทุกอย่าง (NetAmount + ServiceCharge + VAT) | 760.50 |
| SplitCount | INT | จำนวนบิลทั้งหมดของออเดอร์ (1 ถ้าไม่แยก) | 1 |
| SplitIndex | INT | ลำดับของบิลในกรณีแยก (1 ถึง SplitCount) | 1 |
| Status | INT | สถานะบิล — Enum EBillStatus (0=Pending รอชำระ, 1=Paid ชำระแล้ว) | 1 |
| PaidAt | DATETIME NULL | วันเวลาที่ชำระสำเร็จ | 2026-05-30 13:15:00 |
| ClaimedBySessionId | INT NULL | รหัสเซสชั่นลูกค้าที่จองบิล (FK: TbCustomerSessions) | NULL |
| ClaimedAt | DATETIME NULL | วันเวลาที่ลูกค้าจองบิล | NULL |
| ClaimPaymentMethod | NVARCHAR(50) | วิธีชำระที่ลูกค้าเลือก (Cash / Transfer) | NULL |
| CustomerSlipFileId | INT NULL | รหัสไฟล์สลิปจากลูกค้า (FK: TbFiles) | NULL |
| CustomerSlipOcrAmount | DECIMAL(18,2) | ยอดเงินที่ระบบ OCR อ่านได้จากสลิป | NULL |
| CustomerSlipVerificationStatus | NVARCHAR(20) | สถานะการตรวจสอบสลิป (Pending / Verified / Rejected) | NULL |
| CustomerSlipOcrTransferDate | DATETIME | วันที่โอนเงินตามที่ OCR อ่านได้ | NULL |
| CustomerSlipOcrAccountNumber | NVARCHAR(50) | เลขบัญชีปลายทางที่ OCR อ่านได้ | NULL |
| CustomerSlipIsAccountMatched | BIT | เลขบัญชีตรงกับของร้านหรือไม่ (0=ไม่ตรง, 1=ตรง) | NULL |
| CustomerSlipIsDateToday | BIT | วันที่โอนเป็นวันนี้หรือไม่ (0=ไม่ใช่, 1=ใช่) | NULL |

---

## ตารางที่ 3.32 ตาราง TbCustomerSessions

เก็บข้อมูลเซสชั่นของลูกค้าที่สแกน QR Code เข้าสู่ระบบสั่งอาหารด้วยตนเอง (Self-Order) แต่ละเครื่อง (Device) จะมี Session แยกกัน (**ไม่สืบทอด BaseEntity** — ไม่มี Audit Fields)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| CustomerSessionId | INT - PK | รหัสประจำตัวเซสชั่น | 1 |
| TableId | INT | รหัสโต๊ะที่ลูกค้านั่ง (FK: TbTables) | 1 |
| SessionToken | NVARCHAR(500) | Token สำหรับยืนยันตัวตนลูกค้า | eyJhbGciOiJIUzI1NiIs... |
| Nickname | NVARCHAR(50) | ชื่อเล่นที่ลูกค้าตั้ง | นาย A |
| DeviceFingerprint | NVARCHAR(500) | ลายนิ้วมือของอุปกรณ์ (สำหรับแยก Session) | abc123def456 |
| QrTokenNonce | NVARCHAR(50) | ค่า Nonce ของ QR Token ขณะสร้างเซสชั่น | xyz789 |
| IsActive | BIT | สถานะการใช้งาน (0=หมดอายุ, 1=ใช้งานอยู่) | 1 |
| CreatedAt | DATETIME | วันเวลาที่สร้างเซสชั่น | 2026-05-30 12:30:00 |
| ExpiresAt | DATETIME | วันเวลาที่เซสชั่นหมดอายุ (12 ชั่วโมง) | 2026-05-31 00:30:00 |

---

# หมวดที่ 7 โมดูลการชำระเงิน (Payment)

โมดูลรองรับการชำระเงิน รวมถึงการบริหารกะแคชเชียร์และการเข้า-ออกเงินสดในลิ้นชัก ประกอบด้วย 3 ตาราง

## ตารางที่ 3.33 ตาราง TbCashierSessions

เก็บข้อมูลเซสชั่นการทำงาน (กะ) ของพนักงานแคชเชียร์ ประกอบด้วยเงินสดเริ่มต้น ยอดขายรวม และส่วนต่างเมื่อปิดกะ (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| CashierSessionId | INT - PK | รหัสประจำตัวเซสชั่น | 1 |
| UserId | UNIQUEIDENTIFIER | รหัสผู้ใช้แคชเชียร์ (FK: TbUsers) | 550e8400-e29b-41d4-a716-446655440000 |
| Status | INT | สถานะเซสชั่น — Enum ECashierSessionStatus (0=Open เปิดอยู่, 1=Closed ปิดแล้ว) | 0 |
| OpenedAt | DATETIME | วันเวลาเปิดกะ | 2026-05-30 08:00:00 |
| ClosedAt | DATETIME NULL | วันเวลาปิดกะ | NULL |
| OpeningCash | DECIMAL(10,2) | เงินสดเริ่มต้นในลิ้นชัก (บาท) | 1000.00 |
| ExpectedCash | DECIMAL(10,2) | เงินสดที่คาดว่าจะมีในลิ้นชัก (คำนวณจากยอดขายและการเข้า-ออก) | 8650.00 |
| ActualCash | DECIMAL(10,2) NULL | เงินสดจริงที่นับได้ตอนปิดกะ | NULL |
| Variance | DECIMAL(10,2) NULL | ส่วนต่าง (เงินสดจริง - เงินสดที่คาด) | NULL |
| TotalCashSales | DECIMAL(10,2) | ยอดขายเงินสดรวมในกะนี้ | 5450.00 |
| TotalQrSales | DECIMAL(10,2) | ยอดขายผ่าน QR รวมในกะนี้ | 3200.00 |
| BillCount | INT | จำนวนบิลในกะนี้ | 28 |
| ShiftPeriod | INT NULL | ช่วงเวลาของกะ (สำหรับแยกประเภทกะเช้า/บ่าย/เย็น) | 1 |

---

## ตารางที่ 3.34 ตาราง TbCashDrawerTransactions

เก็บรายการเงินสดเข้า-ออกลิ้นชักระหว่างกะ (เช่น เติมเงินทอน นำเงินไปฝากธนาคาร) (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| CashDrawerTransactionId | INT - PK | รหัสประจำตัวรายการ | 1 |
| CashierSessionId | INT | รหัสเซสชั่นที่ทำรายการ (FK: TbCashierSessions) | 1 |
| TransactionType | INT | ประเภทรายการ — Enum ECashDrawerTransactionType (0=CashIn เงินเข้า, 1=CashOut เงินออก) | 1 |
| Amount | DECIMAL(10,2) | จำนวนเงิน (บาท) | 500.00 |
| Reason | NVARCHAR(255) | เหตุผลของรายการ | นำเงินไปฝากธนาคาร |

---

## ตารางที่ 3.35 ตาราง TbPayments

เก็บรายการชำระเงินแต่ละครั้ง โดยผูกกับบิลและเซสชั่นแคชเชียร์ รองรับการชำระด้วยเงินสดและการสแกน QR Code พร้อมระบบ OCR สลิป (สืบทอดจาก BaseEntity)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| PaymentId | INT - PK | รหัสประจำตัวการชำระเงิน | 1 |
| OrderBillId | INT | รหัสบิลที่ชำระ (FK: TbOrderBills) | 1 |
| CashierSessionId | INT | รหัสเซสชั่นแคชเชียร์ที่รับเงิน (FK: TbCashierSessions) | 1 |
| PaymentMethod | INT | วิธีการชำระเงิน — Enum EPaymentMethod (0=Cash เงินสด, 1=QrPayment สแกน QR) | 0 |
| AmountDue | DECIMAL(10,2) | จำนวนเงินที่ต้องชำระ (บาท) | 760.50 |
| AmountReceived | DECIMAL(10,2) | จำนวนเงินที่ได้รับจริง (บาท) | 1000.00 |
| ChangeAmount | DECIMAL(10,2) | จำนวนเงินทอน (บาท) | 239.50 |
| SlipImageFileId | INT NULL | รหัสไฟล์รูปสลิปการโอนเงิน (FK: TbFiles, ใช้กับ QR Payment) | NULL |
| SlipOcrAmount | DECIMAL(10,2) NULL | ยอดเงินที่ระบบ OCR อ่านได้จากสลิป | NULL |
| SlipVerificationStatus | INT | สถานะการตรวจสอบสลิป — Enum ESlipVerificationStatus (0=None, 1=Matched ตรงอัตโนมัติ, 2=Mismatched ไม่ตรง, 3=Manual ตรวจสอบโดยมนุษย์) | 0 |
| PaymentReference | NVARCHAR(200) | เลขอ้างอิงการชำระเงิน | REF-20260530-001 |
| PaidAt | DATETIME | วันเวลาที่ชำระเงิน | 2026-05-30 13:15:00 |
| Note | NVARCHAR(500) | หมายเหตุของการชำระเงิน | NULL |

---

# หมวดที่ 8 โมดูลการแจ้งเตือน (Notification)

โมดูลสำหรับส่งการแจ้งเตือนแบบเวลาจริงไปยังพนักงานในกลุ่มต่าง ๆ (ครัว หน้าร้าน แคชเชียร์ ผู้จัดการ) ประกอบด้วย 2 ตาราง

## ตารางที่ 3.36 ตาราง TbNotifications

เก็บการแจ้งเตือนแบบเวลาจริงสำหรับพนักงาน (เช่น มีออเดอร์ใหม่ อาหารพร้อมเสิร์ฟ) มีอายุการเก็บรักษา 7 วันแล้วลบอัตโนมัติ (**ไม่สืบทอด BaseEntity** — ไม่มี Audit Fields)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| NotificationId | INT - PK | รหัสประจำตัวการแจ้งเตือน | 1 |
| EventType | NVARCHAR(50) | ประเภทเหตุการณ์ | NEW_ORDER |
| Title | NVARCHAR(200) | หัวข้อการแจ้งเตือน | มีออเดอร์ใหม่จากโต๊ะ A1 |
| Message | NVARCHAR(1000) | รายละเอียดการแจ้งเตือน | โต๊ะ A1 สั่งผัดกระเพรา 2 จาน |
| TableId | INT NULL | รหัสโต๊ะที่เกี่ยวข้อง (FK: TbTables) | 1 |
| OrderId | INT NULL | รหัสออเดอร์ที่เกี่ยวข้อง (FK: TbOrders) | 1 |
| ReservationId | INT NULL | รหัสการจองที่เกี่ยวข้อง (FK: TbReservations) | NULL |
| TargetGroup | NVARCHAR(50) | กลุ่มผู้รับการแจ้งเตือน (Kitchen / Floor / Cashier / Manager) | Kitchen |
| Payload | NVARCHAR(MAX) | ข้อมูลเพิ่มเติมในรูปแบบ JSON | {"itemCount":2,"totalPrice":130} |
| CreatedAt | DATETIME | วันเวลาที่สร้างการแจ้งเตือน | 2026-05-30 12:31:00 |

---

## ตารางที่ 3.37 ตาราง TbNotificationReads

ติดตามสถานะการอ่านและการเคลียร์การแจ้งเตือนของผู้ใช้แต่ละราย (**ไม่สืบทอด BaseEntity** — ไม่มี Audit Fields)

| Field Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| NotificationReadId | INT - PK | รหัสประจำตัว | 1 |
| NotificationId | INT | รหัสการแจ้งเตือน (FK: TbNotifications) | 1 |
| UserId | UNIQUEIDENTIFIER | รหัสผู้ใช้ที่อ่าน (FK: TbUsers) | 550e8400-e29b-41d4-a716-446655440000 |
| ReadAt | DATETIME NULL | วันเวลาที่อ่าน (NULL=ยังไม่อ่าน) | 2026-05-30 12:32:00 |
| ClearedAt | DATETIME NULL | วันเวลาที่เคลียร์ออกจากรายการ (NULL=ยังไม่เคลียร์) | NULL |
