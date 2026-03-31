# สถิติโปรเจค RBMS-POS — จำนวนโมดูล, ฟีเจอร์, API, ตาราง และความสัมพันธ์

> วิเคราะห์จากโค้ดจริง (นับจาก Controllers, DbContext, Components)

---

## 1. จำนวนโมดูลทั้งหมด

### Backend — 8 Business Modules
| # | Module | Namespace | คำอธิบาย |
|---|--------|-----------|---------|
| 1 | Admin | POS.Main.Business.Admin | Auth, Users, ShopSettings, ServiceCharge, File, JWT, S3, Dashboard |
| 2 | Authorization | POS.Main.Business.Authorization | Position, Permission Matrix |
| 3 | Menu | POS.Main.Business.Menu | Menu, SubCategory, OptionGroup |
| 4 | HumanResource | POS.Main.Business.HumanResource | Employee + ที่อยู่/การศึกษา/ประวัติงาน |
| 5 | Table | POS.Main.Business.Table | Table, Zone, Reservation, FloorObject |
| 6 | Order | POS.Main.Business.Order | Order, Kitchen, OrderNotification |
| 7 | Payment | POS.Main.Business.Payment | Payment, CashierSession, SlipOCR, Customer, SelfOrder |
| 8 | Notification | POS.Main.Business.Notification | Real-time Notification |

### Frontend Client — 11 Feature Modules
| # | Module | หน้า | Dialogs | คำอธิบาย |
|---|--------|------|---------|---------|
| 1 | Auth | 2 | 2 | Login, Reset Password |
| 2 | Profile | 1 | 1 | โปรไฟล์ส่วนตัว + PIN |
| 3 | Dashboard | 2 | 0 | ภาพรวม + รายงานยอดขาย |
| 4 | Order | 4 | 8 | ภาพรวมร้าน, รายการออเดอร์, รายละเอียด, สั่งอาหาร |
| 5 | Menu | 6 | 2 | เมนูอาหาร/เครื่องดื่ม/ของหวาน, หมวดหมู่, ตัวเลือกเสริม |
| 6 | Table | 3 | 5 | ผังร้าน, โซน/โต๊ะ, จองโต๊ะ |
| 7 | Payment | 5 | 5 | รอบขาย, ชำระบิล, ประวัติ |
| 8 | Kitchen Display | 1 | 0 | ครัวอาหาร/เครื่องดื่ม/ของหวาน (3 routes, 1 component) |
| 9 | Human Resource | 2 | 2 | รายชื่อพนักงาน, เพิ่ม/แก้ไข |
| 10 | Admin Setting | 6 | 1 | ผู้ใช้, ตำแหน่ง, ตั้งค่าร้าน, ค่าบริการ |
| 11 | Welcome | 1 | 0 | หน้าแรก (redirect) |
| | **รวม** | **33** | **26** | |

### Frontend Mobile Web — 5 Feature Modules
| # | Module | หน้า | คำอธิบาย |
|---|--------|------|---------|
| 1 | Auth | 1 | สแกน QR + ตั้งชื่อเล่น |
| 2 | Menu | 2 | เรียกดูเมนู + รายละเอียด |
| 3 | Cart | 1 | ตะกร้าสินค้า |
| 4 | Orders | 1 | ติดตามสถานะ |
| 5 | Bill | 4 | รอบิล, สรุปบิล, อัพโหลด Slip, ชำระสำเร็จ |
| | **รวม** | **9** | + หน้าร้านปิด + หน้า Token หมดอายุ |

---

## 2. จำนวนฟีเจอร์ทั้งหมด — 160 ฟีเจอร์

| โมดูล | จำนวนฟีเจอร์ |
|--------|-------------|
| Auth | 11 |
| Profile | 9 |
| Dashboard | 10 |
| Order | 18 |
| Menu | 13 |
| Table | 13 |
| Payment | 12 |
| Kitchen Display | 9 |
| Human Resource | 10 |
| Admin Setting | 11 |
| Mobile Web | 21 |
| Notification | 10 |
| Base Web (Layout/Guard) | 13 |
| **รวม** | **160** |

---

## 3. จำนวน API Endpoints — 215 เส้น

### แยกตาม HTTP Method
| Method | จำนวน | สัดส่วน |
|--------|-------|--------|
| GET (อ่านข้อมูล) | 88 | 41% |
| POST (สร้าง/Action) | 56 | 26% |
| PUT (แก้ไข) | 47 | 22% |
| DELETE (ลบ) | 22 | 10% |
| PATCH (แก้ไขบางส่วน) | 2 | 1% |
| **รวม** | **215** | **100%** |

### แยกตาม Controller (24 Controllers)
| # | Controller | Route | จำนวน |
|---|-----------|-------|-------|
| 1 | AuthController | /api/admin/auth | 11 |
| 2 | UsersController | /api/admin/users | 4 |
| 3 | PositionsController | /api/admin/positions | 11 |
| 4 | ShopSettingsController | /api/admin/shop-settings | 5 |
| 5 | ServiceChargesController | /api/admin/servicecharges | 6 |
| 6 | FileController | /api/admin/file | 1 |
| 7 | HumanResourceController | /api/humanresource | 20 |
| 8 | MenuCategoriesController | /api/menu/categories | 6 |
| 9 | MenuItemsController | /api/menu/items | 5 |
| 10 | MenuOptionsController | /api/menu/options | 6 |
| 11 | ZonesController | /api/table/zones | 7 |
| 12 | TablesController | /api/table/tables | 15 |
| 13 | ReservationsController | /api/table/reservations | 9 |
| 14 | FloorObjectsController | /api/table/floor-objects | 6 |
| 15 | OrdersController | /api/order/orders | 18 |
| 16 | KitchenController | /api/kitchen | 3 |
| 17 | PaymentsController | /api/payment/payments | 8 |
| 18 | CashierSessionsController | /api/cashier/sessions | 9 |
| 19 | DashboardController | /api/dashboard | 4 |
| 20 | NotificationsController | /api/notifications | 5 |
| 21 | SelfOrderController | /api/customer | 14 |
| 22 | CustomerController | /api/customer | 3 |
| 23 | QrRedirectController | /q/{code} | 1 |
| 24 | BaseController | (base class) | 0 |
| | **รวม** | | **215** |

### แยกตามกลุ่มฟังก์ชัน
| กลุ่ม | จำนวน |
|-------|-------|
| Authentication & File | 12 |
| User & Permission | 15 |
| Menu Management | 17 |
| Table & Reservation | 37 |
| Order Management | 18 |
| Kitchen | 3 |
| Payment & Cashier | 23 |
| Customer Self-Order | 17 |
| Shop Settings & Dashboard | 9 |
| Human Resource | 20 |
| Notification | 5 |
| QR Redirect | 1 |
| **รวม** | **215** |

---

## 4. จำนวน Database Tables — 37 ตาราง

### แยกตามกลุ่ม
| กลุ่ม | ตาราง | จำนวน |
|-------|-------|-------|
| **Authentication** | TbUsers, TbRefreshTokens, TbPasswordResetTokens, TbPasswordHistory | 4 |
| **Authorization (RBAC)** | TbmPositions, TbmPermissions, TbmModules, TbmAuthorizeMatrices, TbAuthorizeMatrixPositions | 5 |
| **Admin Settings** | TbShopSettings, TbShopOperatingHours, TbServiceCharges | 3 |
| **Human Resource** | TbEmployees, TbEmployeeAddresses, TbEmployeeEducations, TbEmployeeWorkHistories | 4 |
| **Menu** | TbMenus, TbMenuSubCategories, TbOptionGroups, TbOptionItems, TbMenuOptionGroups | 5 |
| **Table & Reservation** | TbZones, TbTables, TbTableLinks, TbReservations, TbFloorObjects | 5 |
| **Order** | TbOrders, TbOrderItems, TbOrderItemOptions, TbOrderBills | 4 |
| **Payment & Cashier** | TbPayments, TbCashierSessions, TbCashDrawerTransactions | 3 |
| **Notification** | TbNotifications, TbNotificationReads | 2 |
| **File** | TbFiles | 1 |
| **Customer** | TbCustomerSessions | 1 |
| **รวม** | | **37** |

---

## 5. ความสัมพันธ์ระหว่างโมดูล

### แผนภาพความสัมพันธ์ (Module Dependency)

```
┌─────────────────────────────────────────────────────────────────┐
│                        RBMS-POS System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ล็อกอิน     ┌──────────────┐                   │
│  │   Auth   │──────────────→│  Authorization│                   │
│  │ (Login)  │               │  (RBAC)      │                   │
│  └────┬─────┘               └──────┬───────┘                   │
│       │ JWT Token                  │ Permission                │
│       │                            │ Matrix                    │
│       ▼                            ▼                           │
│  ┌─────────────────────────────────────────────┐               │
│  │              ทุกโมดูลต้องผ่าน Auth + RBAC    │               │
│  └─────────────────────────────────────────────┘               │
│       │                                                        │
│       ├──────────────────────┬───────────────────┐             │
│       ▼                      ▼                   ▼             │
│  ┌──────────┐         ┌──────────┐        ┌──────────┐        │
│  │  Menu    │         │  Table   │        │  HR      │        │
│  │ (เมนู)   │         │ (โต๊ะ)    │        │ (พนักงาน) │        │
│  └────┬─────┘         └────┬─────┘        └────┬─────┘        │
│       │ เมนู+ตัวเลือก       │ โต๊ะ+โซน           │ พนักงาน      │
│       │                    │                   │              │
│       ▼                    ▼                   │              │
│  ┌──────────────────────────────┐              │              │
│  │         Order (ออเดอร์)       │◄─────────────┘              │
│  │  ใช้: เมนู + โต๊ะ + พนักงาน   │   สร้างโดยพนักงาน            │
│  └──────┬───────────┬───────────┘                              │
│         │           │                                          │
│    ส่งครัว│           │ ขอบิล                                    │
│         ▼           ▼                                          │
│  ┌──────────┐  ┌──────────┐                                    │
│  │ Kitchen  │  │ Payment  │                                    │
│  │ (ครัว)   │  │ (ชำระเงิน)│                                    │
│  └──────────┘  └────┬─────┘                                    │
│                     │                                          │
│         ┌───────────┼───────────┐                              │
│         ▼           ▼           ▼                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ Cashier  │ │ Slip OCR │ │ Receipt  │                       │
│  │ Session  │ │ (ตรวจสลิป)│ │ (ใบเสร็จ) │                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│                                                                │
│  ┌─────────────────────────────────────────────┐               │
│  │           Notification (แจ้งเตือน)            │               │
│  │  รับ events จาก: Order, Kitchen, Payment     │               │
│  │  ส่งไป: Kitchen, Floor, Cashier, Manager     │               │
│  └─────────────────────────────────────────────┘               │
│                                                                │
│  ┌─────────────────────────────────────────────┐               │
│  │           Mobile Web (ลูกค้า)                 │               │
│  │  ใช้: Menu (ดูเมนู), Order (สั่ง/ติดตาม),     │               │
│  │       Payment (ชำระ), Table (QR Token)       │               │
│  └─────────────────────────────────────────────┘               │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │Dashboard │  │  Admin   │  │  File    │                     │
│  │ (รายงาน) │  │ (ตั้งค่า)  │  │ (S3)    │                     │
│  │ อ่านจาก:  │  │ ตั้งค่าร้าน │  │ ใช้โดย:  │                     │
│  │ Order +  │  │ ค่าบริการ  │  │ Menu +  │                     │
│  │ Payment  │  │ ตำแหน่ง   │  │ HR +    │                     │
│  └──────────┘  └──────────┘  │ Shop +  │                     │
│                              │ Payment │                     │
│                              └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### รายละเอียดความสัมพันธ์ระหว่างโมดูล

| โมดูลต้นทาง | โมดูลปลายทาง | ความสัมพันธ์ |
|-------------|-------------|-------------|
| **Auth** → **Authorization** | พนักงานล็อกอิน → ดึง Permission ตามตำแหน่ง |
| **Auth** → **ทุกโมดูล** | JWT Token ใช้ยืนยันตัวตนทุก API request |
| **Authorization** → **ทุกโมดูล** | Permission Matrix ควบคุมสิทธิ์ทุก endpoint + UI |
| **Menu** → **Order** | เมนู + ตัวเลือกเสริม ถูกเลือกเข้า Order Item |
| **Table** → **Order** | โต๊ะเปิดใช้งาน → สร้าง Order อัตโนมัติ |
| **Table** → **Mobile Web** | QR Token ของโต๊ะ → ลูกค้าสแกนเข้าใช้ |
| **HR** → **Auth** | พนักงานมีบัญชีผู้ใช้ (TbEmployee → TbUser) |
| **HR** → **Order** | พนักงานเป็นผู้สร้าง/แก้ไข Order (Audit: CreatedBy) |
| **Order** → **Kitchen** | ส่งครัว → ครัวรับรายการ Real-time |
| **Order** → **Payment** | ร้องขอบิล → สร้าง OrderBill → ชำระเงิน |
| **Kitchen** → **Notification** | ทำเสร็จ → แจ้งเตือนพนักงานเสิร์ฟ |
| **Payment** → **Notification** | Slip อัพโหลด → แจ้งเตือนแคชเชียร์ |
| **Payment** → **Cashier Session** | ทุกการชำระเงินบันทึกใน Session ปัจจุบัน |
| **Payment** → **File (S3)** | Slip image เก็บใน S3/MinIO |
| **Dashboard** → **Order + Payment** | อ่านข้อมูลจาก Order + Payment เพื่อสร้างรายงาน |
| **Admin** → **Authorization** | ตั้งค่าตำแหน่ง + Permission Matrix |
| **Admin** → **File (S3)** | โลโก้ร้าน + QR Code ชำระเงิน เก็บใน S3 |
| **File (S3)** → **Menu, HR, Shop, Payment** | ใช้ร่วมกันสำหรับรูปเมนู, รูปพนักงาน, โลโก้, สลิป |
| **Mobile Web** → **Menu** | ลูกค้าเรียกดูเมนูจาก API เดียวกัน |
| **Mobile Web** → **Order** | ลูกค้าสั่งอาหาร → สร้าง Order Item |
| **Mobile Web** → **Payment** | ลูกค้าขอบิล + อัพโหลด Slip + ดาวน์โหลดใบเสร็จ |
| **Notification** → **Order, Kitchen, Payment** | รับ events จากทุกโมดูลหลัก → broadcast ตาม Role |

### ความสัมพันธ์ระดับ Database (Entity Relationships)

```
TbmPosition ─1:M─→ TbEmployee ─1:1─→ TbUser
     │                  │
     │                  ├─1:M─→ TbEmployeeAddress
     │                  ├─1:M─→ TbEmployeeEducation
     │                  └─1:M─→ TbEmployeeWorkHistory
     │
     └─M:M─→ TbmAuthorizeMatrix ─M:1─→ TbmModule
              (ผ่าน TbAuthorize    └─M:1─→ TbmPermission
               MatrixPosition)

TbMenuSubCategory ─1:M─→ TbMenu ─M:M─→ TbOptionGroup ─1:M─→ TbOptionItem
                           │     (ผ่าน TbMenuOptionGroup)
                           │
                           └─1:M─→ TbOrderItem ─1:M─→ TbOrderItemOption
                                        │
TbZone ─1:M─→ TbTable ─1:M─→ TbOrder ─1:M─┤
                 │                │         └─→ TbOrderBill ─1:M─→ TbPayment
                 │                │                  │
                 ├─1:M─→ TbTableLink                 └─M:1─→ TbServiceCharge
                 └─1:M─→ TbReservation

TbCashierSession ─1:M─→ TbCashDrawerTransaction
       └─1:M─→ TbPayment

TbFile ←─M:1── TbMenu (ImageFileId)
       ←─M:1── TbEmployee (ImageFileId)
       ←─M:1── TbShopSettings (LogoFileId, PaymentQrCodeFileId)
       ←─M:1── TbPayment (SlipImageFileId)

TbNotification ─M:1─→ TbOrder
               ─M:1─→ TbTable
               ─M:1─→ TbReservation
               └─1:M─→ TbNotificationRead

TbShopSettings ─1:M─→ TbShopOperatingHour
```

---

## 6. สรุปตัวเลขรวม

| หมวด | จำนวน |
|------|-------|
| **Backend Business Modules** | 8 |
| **Frontend Client Modules** | 11 |
| **Frontend Mobile Modules** | 5 |
| **หน้า (Client Web)** | 33 |
| **หน้า (Mobile Web)** | 9 + 2 (ร้านปิด/หมดเวลา) |
| **Dialogs (Client Web)** | 26 |
| **Shared Dropdowns** | 22+ |
| **ฟีเจอร์ที่ทดสอบ** | 160 |
| **API Controllers** | 24 |
| **API Endpoints** | 215 |
| **Database Tables** | 37 |
| **Entity Relationships (FK)** | 27+ |
| **M:M Relationships** | 2 |
| **SignalR Hubs** | 2 (Order + Notification) |
| **Notification Types** | 9 |
| **Permission Modules** | 16+ |
