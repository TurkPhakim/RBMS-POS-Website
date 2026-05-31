# RBMS-POS — สถานะโปรเจคและ Workflow ของระบบ

> อัพเดตล่าสุด: 2026-05-29 (อ้างอิงจาก code จริงทั้ง Backend, Admin Client, Mobile Web)

---

## สรุปภาพรวม

ระบบ RBMS-POS เป็น Point of Sale แบบครบวงจรสำหรับร้านอาหารและเครื่องดื่ม ประกอบด้วย 3 ส่วนหลัก:

| ส่วน | เทคโนโลยี | Port (Dev) | กลุ่มผู้ใช้ |
| --- | --- | --- | --- |
| **Backend API** | ASP.NET Core 9.0 + EF Core + SignalR | 5300 | — |
| **Admin Client** | Angular 19.1 + PrimeNG + Tailwind | 4300 | ผู้ดูแลระบบ, พนักงาน, แคชเชียร์, ครัว |
| **Mobile Web (Self-Order)** | Angular 19.1 + Tailwind | 4400 | ลูกค้า (สแกน QR ที่โต๊ะ) |

ตัวเลขสรุประบบทั้งหมด (ณ ปัจจุบัน):

| รายการ | จำนวน |
| --- | ---: |
| Backend Business Modules | 8 |
| Controllers | 23 |
| API Endpoints (HTTP) | ~215 |
| Entities (ตารางในฐานข้อมูล) | 37 |
| Database Migrations | 53 |
| SignalR Hubs | 2 (Order, Notification) |
| Frontend Admin Feature Modules | 10 |
| Frontend Mobile Feature Modules | 5 |
| Frontend Admin Routes | 40+ |
| Frontend Mobile Routes | 11 |

---

## สถานะระบบรายโมดูล

| โมดูล | Backend | Frontend Admin/Staff | Mobile Web | สถานะรวม |
| --- | :---: | :---: | :---: | :---: |
| Authentication (Login, JWT, Refresh, Forgot/Reset Password) | ✅ | ✅ | ✅ (QR Auth) | ✅ |
| PIN Code (Setup, Change, Verify, Reset) | ✅ | ✅ | — | ✅ |
| Authorization (Position-based RBAC + Permission Matrix) | ✅ | ✅ | — | ✅ |
| User Management (รายการผู้ใช้, ปลดล็อค, แก้ไข) | ✅ | ✅ | — | ✅ |
| Human Resource (พนักงาน + ที่อยู่/การศึกษา/ประวัติงาน) | ✅ | ✅ | — | ✅ |
| Profile (แก้ไขข้อมูลตัวเอง + เปลี่ยนรหัสผ่าน + PIN) | ✅ | ✅ | — | ✅ |
| Shop Settings (ข้อมูลร้าน, Logo, QR, ธนาคาร, WiFi, PromptPay, เวลาทำการ) | ✅ | ✅ | — | ✅ |
| Service Charge (ค่าบริการ) | ✅ | ✅ | — | ✅ |
| Menu (Category + Items + Option Groups) | ✅ | ✅ | ✅ (ดูเมนู) | ✅ |
| Table (Zone + Table + Floor Object + Floor Plan + Link Tables) | ✅ | ✅ | — | ✅ |
| Reservation (จองโต๊ะ + Calendar) | ✅ | ✅ | — | ✅ |
| Order (สั่งอาหาร + Sent-to-Kitchen + Serve + Split Bill + Void) | ✅ | ✅ | ✅ (Self-Order) | ✅ |
| Kitchen Display (KDS แยก Food / Beverage / Dessert + SignalR) | ✅ | ✅ | — | ✅ |
| Payment (Cash + QR + Upload Slip + OCR + Receipt + Consolidated Receipt) | ✅ | ✅ | ✅ (อัพโหลดสลิป) | ✅ |
| Cashier Session (เปิด-ปิดกะ + เงินสดเข้า-ออกลิ้นชัก) | ✅ | ✅ | — | ✅ |
| Notification (SignalR Real-time + Drawer + Toast) | ✅ | ✅ | — | ✅ |
| Dashboard (Overview, Top-Selling, Peak Hours, Sales Report) | ✅ | ✅ | — | ✅ |
| Self-Order (QR + Menu + Cart + Order Tracking + Bill + Call Waiter) | ✅ | — | ✅ | ✅ |
| File Management (S3/MinIO) | ✅ | ✅ (ผ่าน Menu/HR/ShopSettings) | ✅ (อัพโหลดสลิป) | ✅ |

> **หมายเหตุ**: ทุกระบบ End-to-End ครบทั้ง Backend + Frontend แล้ว และอยู่ในสถานะใช้งานได้จริง (พร้อมสำหรับ deploy)

---

## สถาปัตยกรรมโดยรวม

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Client Layer (Browsers)                           │
├──────────────────────────┬───────────────────────────────────────────────┤
│  Admin/Staff Client      │  Mobile Web (Self-Order)                      │
│  Angular 19 + PrimeNG    │  Angular 19 + Tailwind                        │
│  http://localhost:4300   │  http://localhost:4400                        │
└────────────┬─────────────┴────────────┬──────────────────────────────────┘
             │                          │
             │  HTTPS (REST + SignalR)  │
             ▼                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                  Backend API (ASP.NET Core 9.0)                          │
│                       http://localhost:5300                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ WebAPI Layer:  23 Controllers + 2 SignalR Hubs + 3 Filters         │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ Business Layer: 8 Modules (Admin / Authorization / HumanResource / │  │
│  │                            Menu / Notification / Order / Payment / │  │
│  │                            Table)                                  │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ Repository Layer: GenericRepository<T> + 1 UnitOfWork              │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ DAL Layer: POSMainContext (EF Core) + 37 Entities + 53 Migrations  │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ Core Layer: Enums + Exceptions + Helpers + Settings + Constants    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└────────────┬──────────────────────────┬──────────────────────────────────┘
             │                          │
             ▼                          ▼
┌──────────────────────────┬───────────────────────────────────────────────┐
│   SQL Server 2022        │   MinIO (S3-compatible Object Storage)        │
│   (Database)             │   (รูปเมนู, Logo, QR, รูปพนักงาน, สลิป)       │
└──────────────────────────┴───────────────────────────────────────────────┘
```

---

## Workflow ของแต่ละระบบ

### 1. Authentication & Authorization Flow

```
[Login Page]                  POST /api/admin/auth/login (Username + Password + ReCaptcha)
      │                                  │
      ▼                                  ▼
  ตรวจสอบ ReCaptcha          ┌───────────────────────────────────────┐
  + Validate Credentials     │  AuthService                          │
                             │   - ตรวจ Username/Email มีอยู่หรือไม่ │
                             │   - ตรวจ PasswordHash (BCrypt)        │
                             │   - ตรวจ IsActive, IsLockedByAdmin    │
                             │   - ตรวจ LockedUntil (auto-lock 15m)  │
                             │   - ผิด 5 ครั้ง → LockoutCount + ล็อค  │
                             │   - สำเร็จ → ดึง Permission Matrix    │
                             │     (Position → AuthorizeMatrix tree) │
                             └───────────────────────────────────────┘
                                           │
                                           ▼
                          { AccessToken (JWT 15m) + RefreshToken (7d) + User Info + Permissions }
                                           │
                                           ▼
                          เก็บใน localStorage → Redirect ไป /
                                           │
                                           ▼
                          [Welcome Page] + Header/Sidebar โหลด Branding + Permissions
                                           │
                                           ▼
            ทุก HTTP Request → AuthInterceptor แนบ Bearer Token อัตโนมัติ
                                           │
                       ┌───────────────────┴────────────────────┐
                       ▼                                        ▼
              Token หมดอายุ                          Token ยังใช้ได้
                       │                                        │
                       ▼                                        ▼
       POST /refresh-token (RefreshToken)              ผ่านปกติ
                       │
                       ▼
       ได้ AccessToken ใหม่ → retry request เดิม
```

**ฟีเจอร์ย่อย:**
- **Forgot Password**: ส่ง OTP ไปอีเมล → verify OTP → ตั้งรหัสผ่านใหม่ (ตรวจ password history ไม่ให้ซ้ำ 5 ครั้งล่าสุด)
- **Change Password**: ต้องระบุรหัสผ่านเดิม + รหัสผ่านใหม่
- **PIN Code**: ตั้ง PIN 4 หลักไว้ใช้ verify-password แบบสะดวก (ทดแทนการกรอกรหัสผ่านในบาง flow)

---

### 2. Menu Management Flow

โครงสร้างเมนูแบ่งเป็น 3 ประเภทใหญ่ (Category Type): **Food / Beverage / Dessert** แต่ละประเภทมี Permission แยก (`menu-food.*`, `menu-beverage.*`, `menu-dessert.*`)

```
[Sidebar > เมนู]
      │
      ├── /menu/categories                              ← จัดการ Sub Category (เรียงลำดับ Drag & Drop)
      │       │                  GET /api/menu/categories/type/{categoryType}
      │       │                  POST/PUT/DELETE /api/menu/categories
      │       └──── เป็นการจัดกลุ่มเมนูภายใน category type หลัก
      │
      ├── /menu/food, /menu/beverage, /menu/dessert     ← รายการเมนู
      │       │                  GET /api/menu/items?categoryType=food
      │       │                  POST /api/menu/items (multipart + S3 upload)
      │       │                  PUT /api/menu/items/{menuId}
      │       │                  DELETE /api/menu/items/{menuId} (soft)
      │       └──── เพิ่ม/แก้ไข: รูปภาพ, ชื่อไทย/อังกฤษ, ราคา, ต้นทุน, Tags,
      │             ช่วงเวลาขาย, ผูกกับ Option Group
      │
      └── /menu/options                                 ← กลุ่มตัวเลือกเสริม
              │                  GET /api/menu/options
              │                  POST/PUT/DELETE /api/menu/options
              └──── เช่น "ระดับความหวาน" → [ปกติ, น้อย, มาก, หวานพิเศษ]
                    ผูกกับเมนูผ่าน M:M (TbMenuOptionGroups)
```

**กฎสำคัญ:**
- รูปเมนูเก็บใน `TbFiles` → `MinIO/S3` (เก็บแค่ FileId ใน `TbMenu.ImageFileId`)
- Soft Delete สำหรับ `TbMenu`, `TbMenuSubCategory` แต่ Hard Delete สำหรับ `TbOptionGroup`, `TbOptionItem`, `TbMenuOptionGroup`
- ช่วงเวลาขาย (PeriodStart/PeriodEnd) ใช้กับ Self-Order — เมนูจะแสดงเฉพาะในช่วงเวลานั้น

---

### 3. Table & Reservation Flow

```
[Sidebar > โต๊ะ]
      │
      ├── /table/floor-plan                ← ผังโต๊ะ (Drag & Drop)
      │       │           GET /api/table/tables + /api/table/zones + /api/table/floor-objects
      │       │           PUT /api/table/tables/positions (อัพเดต X,Y)
      │       │           PUT /api/table/floor-objects/positions
      │       └── รวมโต๊ะ + Floor Objects (เสา, ฉากกั้น, ทางเดิน) ลงในผัง
      │
      ├── /table/zones                     ← จัดการโซน + โต๊ะ (Tab + List)
      │       │           POST/PUT/DELETE /api/table/zones
      │       │           POST/PUT/DELETE /api/table/tables
      │       └── ทุกโต๊ะมี QrToken + QrShortCode สำหรับ Self-Order
      │
      └── /table/reservations              ← Calendar View
              │           GET /api/table/reservations
              │           POST /api/table/reservations
              │           POST /api/table/reservations/{id}/confirm / check-in / cancel / no-show
              └── จองล่วงหน้า, ยืนยัน, เช็คอิน, no-show
```

**Operation บนโต๊ะ:**
- `Open` (เปิดโต๊ะ) → สร้าง `TbOrder` ใหม่ + เปลี่ยน `TableStatus` เป็น Occupied
- `Close` (ปิดโต๊ะ) → ต้องไม่มีรายการที่ Sent/Preparing/Ready/Served
- `Clean` (ทำความสะอาด) → สถานะ Cleaning ก่อนกลับเป็น Available
- `Move` (ย้ายโต๊ะ) → ย้ายออเดอร์ปัจจุบันไปอีกโต๊ะ
- `Link` (เชื่อมโต๊ะ) → รวมหลายโต๊ะเป็น GroupCode เดียวกัน → ออเดอร์ Merge เป็นบิลเดียว
- `Set Unavailable / Available` → ปิด/เปิดให้ใช้งานชั่วคราว

---

### 4. Order Flow (Staff Side)

```
[Sidebar > ออเดอร์]
      │
      ├── /order/overview          ← ภาพรวมร้าน (8 สถานะ — real-time)
      │       │  GET /api/table/tables + SignalR OrderHub group: "order-manage"
      │       └── แสดงสถานะโต๊ะ + รายการอาหารเด่นในออเดอร์
      │
      ├── /order/list              ← รายการออเดอร์ทั้งหมด (paginated)
      │       │  GET /api/order/orders?status=&zone=&table=&date=
      │       └── filter ตามสถานะ Open/Billing/Completed/Cancelled
      │
      ├── /order/list/:orderId     ← รายละเอียดออเดอร์
      │       │  GET /api/order/orders/{orderId}
      │       │  PUT items/{itemId}/serve, cancel, void
      │       │  POST {orderId}/request-bill, send-bill, void-bill
      │       │  POST {orderId}/split/by-item, split/by-amount, unsplit-bill
      │       └── จัดการรายการอาหาร, ส่งครัว, เสิร์ฟ, แยกบิล, ขอบิล
      │
      └── /order/list/:orderId/add-items   ← Staff สั่งอาหารเพิ่มในออเดอร์
              │  POST /api/order/orders/{orderId}/items
              │  POST /api/order/orders/{orderId}/send-kitchen
              └── เลือกเมนู + Option + จำนวน + หมายเหตุ
```

**Order State Machine (`EOrderStatus`: Open / Billing / Completed):**
```
Open ──(request-bill)──> Billing ──(payment success)──> Completed
                            │
                            └──(void-bill)──> Open (ขายต่อได้)
```

> ระบบไม่มีสถานะ "Cancelled" ที่ระดับ Order — การยกเลิกทำที่ระดับ OrderItem แทน (ยกเลิกทุกรายการ = void bill กลับเป็น Open หรือปิดโต๊ะแบบไม่มียอด)

**Order Item State Machine (`EOrderItemStatus`):**
```
Pending ──(send-kitchen)──> Sent ──(prepare)──> Preparing ──(ready)──> Ready ──(serve)──> Served
   │                          │
   └──(void, ก่อนส่งครัว)──> Voided        └──(cancel พร้อมเหตุผล)──> Cancelled
```

> `Void` = ลบรายการก่อนส่งครัว (ไม่ต้องเหตุผล)
> `Cancel` = ยกเลิกหลังส่งครัวแล้ว (ต้องระบุเหตุผล + ผู้ยกเลิก)

---

### 5. Kitchen Display System (KDS)

KDS แยกตามประเภทเมนู (Food / Beverage / Dessert) — แต่ละสถานีเห็นเฉพาะรายการของตน:

```
/kitchen-display/food       ← Permission: kitchen-food.read
/kitchen-display/beverage   ← Permission: kitchen-beverage.read
/kitchen-display/dessert    ← Permission: kitchen-dessert.read
      │
      ▼
GET /api/kitchen/orders?category=food
      │
      ▼
แสดงรายการที่สถานะ Sent + Preparing
      │
      ├── ปุ่ม "เริ่มปรุง"  → PUT /api/kitchen/items/prepare → Preparing
      └── ปุ่ม "พร้อมเสิร์ฟ" → PUT /api/kitchen/items/ready  → Ready
                              │
                              ▼
                      SignalR NotificationHub broadcast
                      → กลุ่ม "Floor" (พนักงานหน้าร้าน) เห็น Toast
                      → Self-Order ลูกค้าเห็นสถานะใน /orders อัพเดต real-time
```

---

### 6. Payment Flow (Checkout)

```
[ผู้ใช้กดขอบิล จาก Order Detail]
      │  POST /api/order/orders/{orderId}/request-bill
      ▼
สถานะออเดอร์ → Billing
      │
      ▼
[/payment/checkout/{orderId}]   ← Checkout Page
      │
      ├── ดูสรุปยอด: subtotal + service charge + discount + grand total
      ├── เลือกประเภทชำระ:
      │     ├── เงินสด → POST /api/payment/payments/cash
      │     │             { orderBillId, amountTendered, changeAmount }
      │     │
      │     └── QR → แสดง QR ของร้าน
      │             ├── (ลูกค้าโอนแล้ว) → POST /api/payment/payments/qr/upload-slip
      │             │                       (file + OCR เช็คยอด + วันที่ + เลขบัญชี)
      │             │
      │             └── POST /api/payment/payments/qr/confirm
      │                  → บันทึก TbPayment + เปลี่ยนสถานะออเดอร์ → Completed
      │
      ▼
GET /api/payment/payments/order/{orderId}/consolidated-receipt
      │
      ▼
แสดงใบเสร็จ + ปุ่มดาวน์โหลด PDF
      │
      ▼
SignalR broadcast TableStatusChanged → ทุกหน้าจอเห็นโต๊ะเปลี่ยนเป็น Cleaning
```

**Split Bill:**
- `Split by Item` — แยกตามรายการที่ลูกค้าเลือก
- `Split by Amount` — แยกตามจำนวนเงิน (เช่น หาร 4)
- ผลลัพธ์: 1 ออเดอร์ → หลาย `TbOrderBill` → ชำระแต่ละบิลแยกกัน

---

### 7. Cashier Session Flow

```
เริ่มกะ:
   POST /api/cashier/sessions/open   { openingBalance, shiftPeriod }
      │
      ▼
   เปิดแคชเชียร์ → ทำงานปกติ (รับชำระเงิน, เงินสดเข้า-ออกลิ้นชัก)
      │
      ├── POST /api/cashier/sessions/{id}/cash-in   (ใส่เงินเพิ่ม)
      └── POST /api/cashier/sessions/{id}/cash-out  (ถอนเงินสด)
      │
      ▼
ปิดกะ:
   POST /api/cashier/sessions/{id}/close   { closingBalance }
      │
      ▼
   ระบบคำนวณยอดสรุป: เปิด + รับเข้า - จ่ายออก = ควรเหลือ → vs ยอดจริง
   → บันทึก ExpectedBalance, ActualBalance, Difference
```

---

### 8. Notification Flow (SignalR)

ระบบมี 2 Hub แยกกัน:

**OrderHub** (`/hubs/order`) — broadcast event ของ Order/Table/Kitchen real-time

| Group | สมาชิก | Event ที่รับ |
| --- | --- | --- |
| `kitchen` | ครัวทั้งหมด (รวม food/beverage/dessert) | `NewOrderItems`, `ItemStatusChanged`, `ItemCancelled` |
| `floor` | พนักงานหน้าร้าน + แคชเชียร์ | `OrderUpdated`, `TableStatusChanged`, `NewOrderItems`, `ItemStatusChanged`, `SlipUploaded`, `PaymentCompleted` |
| `table_{tableId}` | Mobile Web ลูกค้า (auto-join ตามโต๊ะ) | `NewOrderItems`, `ItemStatusChanged`, `RefreshOrders`, `SlipUploaded`, `PaymentCompleted`, `BillClaimed`, `BillReleased`, `BillVoided` |

Frontend ใช้ `JoinGroup(groupName)` / `LeaveGroup(groupName)` ผ่าน SignalR client เพื่อ subscribe เฉพาะ group ที่ต้องการ

**NotificationHub** (`/hubs/notification`) — แจ้งเตือนแบบ Toast + Drawer ไปยังกลุ่มตาม Permission (auto-join เมื่อ login)

| Group | เงื่อนไข auto-join | ตัวอย่าง Event |
| --- | --- | --- |
| `Kitchen` | มี `kitchen-food.read` หรือ `kitchen-beverage.read` หรือ `kitchen-dessert.read` | สั่งอาหารใหม่, ยกเลิกรายการ |
| `Floor` | มี `order-manage.read` | อาหารพร้อมเสิร์ฟ, ลูกค้าเรียกพนักงาน |
| `Cashier` | มี `payment-manage.read` | ลูกค้าขอบิล, อัพโหลดสลิป, ขอชำระเงินสด |
| `Manager` | มี permission > 10 รายการ หรือมี 3 groups ขึ้นไป | สรุปยอด, แจ้งเตือนระบบ |

ฝั่ง Frontend:
- เห็น Toast ทันทีเมื่อมี event
- ดึงประวัติแจ้งเตือนจาก `GET /api/notifications` → แสดงใน Drawer (Bell icon บน header)
- Mark as read: `PATCH /api/notifications/{notificationId}/read`

---

### 9. Self-Order Flow (Mobile Web)

```
[ลูกค้าสแกน QR ที่โต๊ะ]
      │
      ▼
URL ย่อ: /q/{shortCode}  →  GET /q/{shortCode}
      │  Backend redirect ไป Mobile Web พร้อม qrToken
      ▼
http://localhost:4400/auth?token={qrToken}
      │  POST /api/customer/auth { qrToken }
      │  → ตรวจ token + expire + ออกเป็น CustomerSession token (JWT-like)
      ▼
[/menu] เลือกหมวด → เลือกเมนู → /menu/{menuId} ดูรายละเอียด + Option
      │
      ▼
เพิ่มเข้าตะกร้า → [/cart]
      │  POST /api/customer/orders   (ส่งออเดอร์)
      ▼
[/orders] ติดตามสถานะ Real-time (SignalR)
      │  Items: Pending → Sent → Preparing → Ready → Served
      │
      ├── ปุ่มเรียกพนักงาน → POST /api/customer/call-waiter
      │
      ├── ขอบิล → POST /api/customer/request-bill
      │           → ออเดอร์เป็น Billing → ไป [/bill/waiting]
      │
      └── ขอชำระเงินสด → POST /api/customer/request-cash
                          → แจ้ง Cashier ผ่าน SignalR
      ▼
[/bill/summary] ดูยอดรวม + Service Charge + จำนวนคน
      │
      ├── แยกบิล → POST /api/customer/request-split-bill
      │             → Staff ทำ split bill ในระบบ → กลับมาให้ลูกค้าเลือกบิลของตน
      │
      └── ชำระเงิน QR → [/bill/upload]
              │  POST /api/customer/{qrToken}/upload-slip  (multipart)
              │  → Backend OCR สลิป → เก็บ TbCustomerSlip
              ▼
       [/bill/complete]  ← polling /api/customer/{qrToken}/bill/{billId}/status
              │  รอ Cashier ยืนยัน → status: Completed
              ▼
       แสดงใบเสร็จ + ขอบคุณ
```

**กลไกป้องกัน Race Condition (Multi-Device):**
- ลูกค้าหลายคนสแกน QR เดียวกันได้ — แต่ละ device มี CustomerSession แยกกัน
- เมื่อขอบิล → `claim` บิลก่อน → ป้องกัน device อื่นอัพโหลดสลิปซ้ำ
- หากปิด tab → `release` → device อื่น claim ได้

---

### 10. Dashboard Flow

```
[Sidebar > แดชบอร์ด]
      │
      ├── /dashboard                                 ← ภาพรวม
      │       │  GET /api/dashboard/overview
      │       │  GET /api/dashboard/top-selling
      │       │  GET /api/dashboard/peak-hours
      │       └── KPI cards + กราฟยอดขาย + สินค้าขายดี + ช่วงเวลายอดนิยม
      │
      └── /dashboard/sales                           ← รายงานยอดขาย
              │  GET /api/dashboard/sales-report?from=&to=&groupBy=day
              └── กราฟเปรียบเทียบช่วงเวลา + Cost vs Profit + breakdown ตามหมวด
```

---

## Database Schema (37 Entities)

จัดกลุ่มตาม Domain Folder:

| Domain | Entity | บทบาท |
| --- | --- | --- |
| **Auth** | `TbUser` | บัญชีผู้ใช้ระบบ (Username, PasswordHash, PIN, Lockout) |
| | `TbRefreshToken` | JWT Refresh Token |
| | `TbPasswordResetToken` | OTP สำหรับ forgot password |
| | `TbPasswordHistory` | ประวัติรหัสผ่าน (ป้องกันใช้ซ้ำ) |
| **Authorization** | `TbmPosition` | ตำแหน่งงาน (Master) |
| | `TbmPermission` | ประเภท operation (read/create/update/delete) |
| | `TbmModule` | โครงสร้างโมดูล (Tree, parent-child) |
| | `TbmAuthorizeMatrix` | จับคู่ Module + Permission → PermissionPath |
| | `TbAuthorizeMatrixPosition` | กำหนดสิทธิ์ให้ตำแหน่ง |
| **Admin** | `TbShopSettings` | ข้อมูลร้าน (Singleton) |
| | `TbShopOperatingHour` | เวลาเปิด-ปิด 7 วัน |
| | `TbServiceCharge` | ค่าบริการ |
| **Common** | `TbFile` | Metadata ไฟล์ (S3 Key) |
| **HumanResource** | `TbEmployee` | พนักงาน |
| | `TbEmployeeAddress` | ที่อยู่พนักงาน |
| | `TbEmployeeEducation` | ประวัติการศึกษา |
| | `TbEmployeeWorkHistory` | ประวัติการทำงาน |
| **Menu** | `TbMenu` | เมนูอาหาร/เครื่องดื่ม/ของหวาน |
| | `TbMenuSubCategory` | หมวดหมู่ย่อยของเมนู |
| | `TbOptionGroup` | กลุ่มตัวเลือกเสริม |
| | `TbOptionItem` | รายการตัวเลือก |
| | `TbMenuOptionGroup` | M:M เมนู-OptionGroup |
| **Table** | `TbZone` | โซนในร้าน |
| | `TbTable` | โต๊ะ (พร้อม QrToken + QrShortCode) |
| | `TbTableLink` | เชื่อมโต๊ะหลายตัว |
| | `TbFloorObject` | วัตถุตกแต่งผังโต๊ะ |
| | `TbReservation` | การจอง |
| **Order** | `TbOrder` | ออเดอร์ |
| | `TbOrderItem` | รายการในออเดอร์ |
| | `TbOrderItemOption` | ตัวเลือกของรายการ (พร้อม CostPrice snapshot) |
| | `TbOrderBill` | บิล (รองรับ Split Bill) |
| **Payment** | `TbPayment` | การชำระเงิน |
| | `TbCashierSession` | เซสชั่นแคชเชียร์ |
| | `TbCashDrawerTransaction` | เงินสดเข้า-ออกลิ้นชัก |
| **Notification** | `TbNotification` | การแจ้งเตือน |
| | `TbNotificationRead` | สถานะอ่านต่อ user |
| **Customer** | `TbCustomerSession` | เซสชั่นลูกค้า Self-Order |

---

## Migrations Timeline (53 Migrations)

จัดกลุ่มตามเฟส:

| เฟส | ช่วงเวลา | จำนวน | Migration หลัก |
| --- | --- | ---: | --- |
| **Phase 1 — Auth Foundation** | 2025-11 | 2 | `InitialAuthMigration`, `RemovePasswordResetTokens` |
| **Phase 2 — Master Data (Menu + ServiceCharge + Employee)** | 2025-11 | 4 | `AddServiceChargeTable`, `AddMenuTable`, `UpdateMenuImageUrlToMax`, `AddEmployeeTable` |
| **Phase 3 — Standardization** | 2026-03 | 4 | `StandardizeEntitySchema`, `StandardizeNamingConvention`, `AddFileManagementSystem`, `AddPositionBasedRbac` |
| **Phase 4 — Shop Settings + RBAC** | 2026-03 | 4 | `ChangeTitleToEnum`, `AddShopSettingsTables`, `ExpandEmployeeModule`, `RemoveEthnicityAndUpdateEnums` |
| **Phase 5 — User Lockout + ServiceCharge Date Range** | 2026-03 | 4 | `AddLockoutCountToUser`, `RemoveSeedUsers`, `AddFullTimeAndHourlyRate`, `AddDateRangeToServiceCharge` |
| **Phase 6 — Forgot Password + Shop Email** | 2026-03 | 2 | `AddForgotPasswordTables`, `AddShopEmailToShopSettings` |
| **Phase 7 — Login History Removal + PIN** | 2026-03 | 4 | `RemoveLoginHistoryTable`, `AddUserLockAndPinFields`, `SeedUserManagementPermissions`, `ReorderModuleSortOrder` |
| **Phase 8 — Menu System Revision** | 2026-03 | 2 | `ReviseMenuSystemSchema`, `SplitMenuPermissionsByCategory` |
| **Phase 9 — Table System** | 2026-03 | 4 | `AddTableSystem`, `SeedReservationPermissions`, `SeedZoneAndFloorObjectPermissions`, `AddFloorObjectTable` |
| **Phase 10 — Order System** | 2026-03 | 5 | `AddOrderSystem`, `RemoveShapeAndMergePermissions`, `RenameTableChildModules`, `SplitKitchenPermissionsByCategory`, `RenameKitchenModuleLabels` |
| **Phase 11 — Payment + Cashier Session** | 2026-03 | 3 | `AddPaymentSystem`, `AddShiftPeriodToCashierSession`, `RemoveNoteFromCashierSession` |
| **Phase 12 — Notification System + Customer Session** | 2026-03 | 2 | `AddNotificationSystem`, `AddCustomerSessionTable` |
| **Phase 13 — Shop Settings Expansion + Split Bill** | 2026-03 | 3 | `AddBankAndWifiToShopSettings`, `AddServiceChargeIdToOrderBill`, `AddSplitBillFieldsForReceipt` |
| **Phase 14 — Link Tables + Module Cleanup** | 2026-03 | 3 | `AddLinkTableMergeOrderFields`, `RemoveDefaultPositionSeeds`, `RenameModuleDisplayNames` |
| **Phase 15 — Self-Order Enhancement** | 2026-03/04 | 4 | `AddQrShortCodeToTable`, `ChangeActiveOrderToManyRelation`, `AddCustomerSlipToOrderBill`, `AddCostPriceToOrderItemOption` |
| **Phase 16 — PromptPay + OCR + Bill Claim** | 2026-04 | 3 | `AddPromptPayNumberToShopSettings`, `AddCustomerSlipOcrDetails`, `AddBillClaimFields` |

> รายละเอียดทั้งหมด ดูที่ [database-api-reference.md](../architecture/database-api-reference.md) และ Migrations folder

---

## Frontend Routes

### Admin/Staff Client (Total: 40+ routes)

| Path Prefix | Routes | Permission Module |
| --- | ---: | --- |
| `/auth/*` | 2 (login, reset-password) | — (public) |
| `/` | 1 (welcome) | — |
| `/access-denied` | 1 | — |
| `/dashboard/*` | 2 (overview, sales) | `dashboard.view` |
| `/admin-setting/*` | 7 (users, positions, service-charges, shop-settings) | หลายโมดูล |
| `/human-resource/*` | 3 (employees: list, create, update) | `employee` |
| `/menu/*` | 14 (categories + 3 category types + options) | `menu-food/beverage/dessert`, `menu-category`, `menu-option` |
| `/order/*` | 4 (overview, list, detail, add-items) | `order-manage` |
| `/table/*` | 3 (floor-plan, zones, reservations) | `table-manage`, `floor-plan`, `reservation` |
| `/payment/*` | 5 (payment, checkout, session-history × 2, payment-history) | `payment-manage`, `cashier-session` |
| `/kitchen-display/*` | 3 (food, beverage, dessert) | `kitchen-food/beverage/dessert` |
| `/profile` | 1 | — (auth only) |

### Mobile Web (Self-Order) — 11 routes

| Path | Component | Guard |
| --- | --- | --- |
| `/auth` | AuthComponent | — (รับ qrToken) |
| `/expired` | ExpiredComponent | — |
| `/shop-closed` | ExpiredComponent (mode: closed) | — |
| `/menu` | MenuBrowseComponent | CustomerAuthGuard |
| `/menu/:menuId` | MenuDetailComponent | CustomerAuthGuard |
| `/cart` | CartPageComponent | CustomerAuthGuard |
| `/orders` | OrderTrackingComponent | CustomerAuthGuard |
| `/bill/waiting` | BillWaitingComponent | CustomerAuthGuard |
| `/bill/summary` | BillSummaryComponent | CustomerAuthGuard |
| `/bill/upload` | SlipUploadComponent | CustomerAuthGuard |
| `/bill/complete` | PaymentCompleteComponent | CustomerAuthGuard |

---

## SignalR Hubs

### 1. OrderHub (`/hubs/order`)
- **JoinGroup(groupName)** / **LeaveGroup(groupName)** — Client เลือก group ที่จะ subscribe เอง
- Groups (lowercase):
  - `kitchen` — ครัวทั้งหมด (รวมทั้ง food/beverage/dessert)
  - `floor` — พนักงานหน้าร้าน + แคชเชียร์
  - `table_{tableId}` — ลูกค้า Mobile Web (1 group ต่อ 1 โต๊ะ)
- Events ที่ broadcast (จาก `OrderNotificationService`):
  - `NewOrderItems` — มีรายการอาหารถูกส่งใหม่
  - `ItemStatusChanged` — สถานะ item เปลี่ยน (Sent/Preparing/Ready/Served)
  - `ItemCancelled` — รายการถูกยกเลิก
  - `OrderUpdated` — สถานะออเดอร์เปลี่ยน (Open/Billing/Completed)
  - `TableStatusChanged` — สถานะโต๊ะเปลี่ยน
  - `RefreshOrders` — สั่ง Mobile Web ดึงข้อมูลใหม่
  - `SlipUploaded` — ลูกค้าอัพโหลดสลิป
  - `PaymentCompleted` — ชำระเงินสำเร็จ
  - `BillClaimed` / `BillReleased` / `BillVoided` — Customer ดำเนินการกับบิล

### 2. NotificationHub (`/hubs/notification`)
- ผู้ใช้ที่ Login จะ **Auto-join Group ตาม Permission** (ใน `OnConnectedAsync`)
- Groups: `Kitchen` (capitalized), `Floor`, `Cashier`, `Manager`
- Events: ส่ง notification payload ผ่าน method `ReceiveNotification` ไปกลุ่มที่เกี่ยวข้อง
- Frontend: แสดง Toast + อัพเดต Drawer + อัพเดต Badge unread count

---

## Permission Matrix (RBAC)

ระบบใช้ **Position-based RBAC** — แต่ละ Position มี Permission Matrix:

```
TbmModule (tree)              TbmPermission
├── Dashboard                 ├── read
│   └── View                  ├── create
├── Order                     ├── update
│   ├── Manage                └── delete
│   └── Tracking
├── Menu
│   ├── Food
│   ├── Beverage
│   ├── Dessert
│   ├── Category
│   └── Option
├── Table
│   ├── Manage
│   ├── Floor Plan
│   └── Reservation
├── Kitchen
│   ├── Food
│   ├── Beverage
│   └── Dessert
├── Payment
│   ├── Manage
│   └── Cashier Session
├── Human Resource
│   └── Employee
└── Admin Setting
    ├── User Management
    ├── Position
    ├── Service Charge
    └── Shop Settings

TbmAuthorizeMatrix  = (ModuleId, PermissionId) → PermissionPath เช่น "menu-food.read"
TbAuthorizeMatrixPosition = (PositionId, AuthorizeMatrixId)  ← กำหนดสิทธิ์ให้ตำแหน่ง

User → Employee → Position → AuthorizeMatrices → PermissionPaths[]
```

Backend ใช้ `[PermissionAuthorize("permission.code")]` บน Controller method
Frontend ใช้ `PermissionGuard` ใน route + `authService.hasPermission('...')` ใน component

---

## ตัวอย่าง Default Login

| Username | Password | บทบาท |
| --- | --- | --- |
| `admin` | `P@ssw0rd` | ผู้ดูแลระบบ (Full Access — Position "ผู้จัดการ" + Full Permission Matrix) |

> Default user ถูก seed ผ่าน migration (เฉพาะ admin) — ที่เหลือสร้างผ่าน `/admin-setting/users` หรือ `/human-resource/employees` (create-user)

---

## Related Docs

- [System Overview](../architecture/system-overview.md) — N-Tier Architecture + Data Flow
- [Database & API Reference](../architecture/database-api-reference.md) — Schema และ Endpoints ครบทั้งหมด
- [Project Structure](../architecture/project-structure.md) — โครงสร้างไฟล์ในโปรเจค
- [Backend Guide](../development/backend-guide.md) — คู่มือพัฒนา Backend
- [Frontend Guidelines](../development/frontend-guidelines.md) — Patterns และ Standards
- [Development Roadmap](../tasks/TASK-development-roadmap.md) — Roadmap ทุก Phase ที่ทำมา
