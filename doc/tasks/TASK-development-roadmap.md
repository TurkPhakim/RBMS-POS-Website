# TASK: Development Roadmap — ลำดับการพัฒนาระบบ RBMS-POS

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-19
**วันที่เสร็จ**: -

> แผนพัฒนาระยะยาว — กำหนดลำดับการทำแต่ละระบบตาม dependency chain
> เอกสารอ้างอิง: `doc/requirements/REQ-*.md` (8 ไฟล์)

---

## สิ่งที่ทำเสร็จแล้ว

| ระบบ | สถานะ | หมายเหตุ |
|------|--------|----------|
| Auth (Login, Forgot Password, Reset Password, OTP) | ✅ เสร็จ | |
| Employee Management (CRUD) | ✅ เสร็จ | |
| Position Management (CRUD) | ✅ เสร็จ | |
| Service Charge Management (CRUD) | ✅ เสร็จ | |
| Shop Settings | ✅ เสร็จ | |
| Menu System (Items, Sub-categories, Option Groups) | ✅ เสร็จ | REQ-menu-system |
| User Management (CRUD, Lock/Unlock) | ✅ เสร็จ | |
| Profile (ดู/แก้ข้อมูลส่วนตัว) | ✅ เสร็จ | |
| PIN Code (ตั้ง/เปลี่ยน/รีเซ็ต/ยืนยัน) | ✅ เสร็จ | |
| Change Password | ✅ เสร็จ | |
| Layout (Sidebar, Header, Breadcrumb) | ✅ เสร็จ | |
| **Phase 1 — Table System** (Zone, Table, Floor Plan, Reservation) | ✅ เสร็จ | REQ-table-system |
| **Phase 2 — Order System** (Order CRUD, POS, Split Bill, SignalR OrderHub) | ✅ เสร็จ | REQ-order-system |
| **Phase 3A — Kitchen (KDS)** (Order View, Menu View, Batch, Timer) | ✅ เสร็จ | REQ-kitchen-system |
| **Phase 3B — Payment System** (Billing, Cashier Session, Receipt, Slip) | ✅ เสร็จ | REQ-payment-system |
| **Phase 4 — Notification System** (NotificationHub, Drawer, Toast, Background Services) | ✅ เสร็จ | REQ-noti-system |
| **Phase 5 — Self-Order System (QR)** (Mobile Web, Customer Auth, Menu, Cart, Bill) | ✅ เสร็จ | REQ-self-order-system |

---

## Dependency Diagram

```
[Menu System ✅] ─────────────┐
                              ▼
[Shop Settings ✅] ──► Phase 1: TABLE SYSTEM ✅
                              │
                              ▼
                       Phase 2: ORDER SYSTEM ✅ ◄── [Menu System ✅]
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
             Phase 3A:              Phase 3B:
             KITCHEN (KDS) ✅       PAYMENT SYSTEM ✅
                    │                    │
                    └─────────┬──────────┘
                              ▼
                       Phase 4: NOTIFICATION SYSTEM ✅
                              │
                              ▼
                       Phase 5: SELF-ORDER SYSTEM (QR) ✅
                              │
                              ▼
                       Phase 6: DASHBOARD ◄── ถัดไป
```

---

## Phase 1 — Table System

**REQ**: [REQ-table-system.md](../requirements/REQ-table-system.md)
**ขนาด**: กลาง | **Depends on**: Shop Settings (operating hours)

### ขอบเขต

- Zone CRUD (โซนพื้นที่ร้าน)
- Table CRUD (โต๊ะ — shape, size, capacity, สถานะ)
- Floor Plan (แผนผังโต๊ะ real-time)
- Table Status Flow (AVAILABLE → RESERVED → OCCUPIED → BILLING → CLEANING → AVAILABLE)
- Reservation CRUD (จอง — วัน/เวลา/จำนวนคน/โต๊ะ)
- Table Operations (เปิด/ปิด/ย้าย/เชื่อม)
- QR Code Generation (สำหรับ Self-Order ในอนาคต)
- Operational Tags (CALL_WAITER, NEW_ORDER ฯลฯ — derive จาก Order data)

### Backend

| ไฟล์ | ประเภท |
|------|--------|
| `POS.Main.Core/Enums/ETableStatus.cs` | Enum |
| `POS.Main.Core/Enums/ETableShape.cs` | Enum |
| `POS.Main.Core/Enums/ETableSize.cs` | Enum |
| `POS.Main.Core/Enums/EGuestType.cs` | Enum |
| `POS.Main.Core/Enums/EReservationStatus.cs` | Enum |
| `POS.Main.Dal/Entities/Table/TbZone.cs` | Entity |
| `POS.Main.Dal/Entities/Table/TbTable.cs` | Entity |
| `POS.Main.Dal/Entities/Table/TbTableLink.cs` | Entity |
| `POS.Main.Dal/Entities/Table/TbReservation.cs` | Entity |
| EntityConfigurations (4 ไฟล์) | Config |
| Repositories (4 interfaces + 4 implementations) | Repository |
| `POS.Main.Business.Table/` | Services, Models, Mappers |
| `RBMS.POS.WebAPI/Controllers/` | ZonesController, TablesController, ReservationsController |
| Migrations (2-3 ไฟล์) | Migration + Seed permissions |

### Frontend

| Component | หมายเหตุ |
|-----------|----------|
| `features/table/` | Module + Routing |
| Floor Plan page | แผนผัง real-time (card grid) |
| Zone management pages | CRUD โซน |
| Table management pages | CRUD โต๊ะ |
| Reservation management pages | CRUD จอง |
| Table Detail page | เปิด/ปิดโต๊ะ, ดู order (ใช้จริงใน Phase 2) |
| `shared/dropdowns/zone-dropdown/` | Dropdown โซน |
| `shared/dropdowns/table-dropdown/` | Dropdown โต๊ะ |

### เช็คลิสต์

- [x] อ่าน Pre-flight docs (backend-guide, frontend-guidelines)
- [x] **Backend — Entity + Migration**
  - [x] สร้าง Enums (5 ไฟล์ + EFloorObjectType เพิ่มเติม)
  - [x] สร้าง Entities (TbZone, TbTable, TbTableLink, TbReservation + TbFloorObject)
  - [x] สร้าง EntityConfigurations (5 ไฟล์)
  - [x] อัพเดต DbContext (DbSet 5 ตาราง)
  - [x] สร้าง Migration + Seed permissions (4 migrations)
  - [x] รัน `dotnet ef database update`
- [x] **Backend — Repository + Service + Controller**
  - [x] สร้าง Repositories (5 interfaces + 5 implementations — รวม FloorObject)
  - [x] อัพเดต UnitOfWork (Zones, Tables, TableLinks, Reservations, FloorObjects)
  - [x] สร้าง Business module (4 Services, 4 Interfaces, Models, Mappers)
  - [x] สร้าง Controllers (Zones 7ep, Tables 15ep, Reservations 9ep, FloorObjects 5ep)
  - [x] Register DI ใน Program.cs
  - [x] ทดสอบ API ผ่าน Swagger
- [x] **Frontend — gen-api + Pages**
  - [x] Restart Backend + ตรวจ Swagger + บอกผู้ใช้รัน `npm run gen-api`
  - [x] สร้าง Feature module + Routing
  - [x] สร้าง Zone list + manage pages (Zone+Table รวมหน้าเดียว)
  - [x] สร้าง Table list + manage pages
  - [x] สร้าง Floor Plan page (spatial drag-and-drop + FloorObject layer)
  - [x] สร้าง Reservation Calendar View + manage pages
  - [x] สร้าง Dropdowns (zone-dropdown)
  - [x] เพิ่ม Sidebar menu + Permissions
  - [x] สร้าง Dialogs (TableAction, OpenTable, MoveTable, LinkTable, ConfirmReservation, FloorObject)
- [x] อัพเดต database-api-reference.md
- [x] อัพเดต REQ-table-system.md ให้ตรงกับ implementation จริง

### สิ่งที่เลื่อนไป Phase 2 (ต้องมี Order System ก่อน)

- Operational Tags (WAITING_ORDER, WAITING_SERVE, ALL_SERVED, CALL_WAITER)
- Status Dashboard View (จัดกลุ่มโต๊ะตาม operational tag)
- TbTable.ActiveOrderId (FK → TbOrder)
- SignalR broadcast (TABLE_CLEANED, floor plan real-time update)
- QR Code Dialog (ใช้ `qr-code-styling` — รอ Self-Order System)

### สิ่งที่แตกต่างจาก REQ (ตั้งใจเปลี่ยน)

- **Zone + Table**: รวมเป็นหน้าเดียว (tab Zone/Table) แทนหน้าแยก
- **Reservation Calendar**: ใช้ Month View + day detail panel แทน Timeslot Grid
- **Sidebar**: 3 items (ผังโต๊ะ / จัดการโซน·โต๊ะ / การจอง) แทน 4 items
- **Permissions**: แยก `zone.*` + `floor-object.*` ออกจาก `table.*` (granular กว่า REQ)
- **FloorObject**: เพิ่ม layer วัตถุตกแต่ง (Restroom, Stairs, Counter ฯลฯ) บน Floor Plan

---

## Phase 2 — Order System

**REQ**: [REQ-order-system.md](../requirements/REQ-order-system.md)
**ขนาด**: ใหญ่ | **Depends on**: Phase 1 (Table) + Menu System

### ขอบเขต

- Order CRUD (ผูกกับโต๊ะ — 1 โต๊ะ : 1 order ที่ active)
- Order Items (เพิ่ม/ลบ items จากเมนู + options + จำนวน + หมายเหตุ)
- Order Item Status (PENDING → SENT → PREPARING → READY → SERVED / VOIDED / CANCELLED)
- Order Status (OPEN → BILLING → COMPLETED)
- POS Interface (หน้าสั่งอาหาร — เลือกเมนู → เพิ่ม item → ส่งครัว)
- Table Detail (ดู order ของโต๊ะ, จัดการ items)
- Send to Kitchen (เปลี่ยน PENDING → SENT)
- Void / Cancel (PENDING → VOIDED ฟรี, SENT/PREPARING → CANCELLED ต้อง manager auth)
- Mark Served (READY → SERVED — Floor staff กด)
- Split Bill (แบ่ง items เป็นหลายบิล)
- Request Bill (เปลี่ยน Order → BILLING)
- Bill Calculation (SubTotal, ServiceCharge, VAT, GrandTotal)
- **OrderHub (SignalR)** — สร้าง Hub ใหม่สำหรับ KDS + Floor Plan real-time

### Backend

| ไฟล์ | ประเภท |
|------|--------|
| `POS.Main.Core/Enums/EOrderStatus.cs` | Enum |
| `POS.Main.Core/Enums/EOrderItemStatus.cs` | Enum |
| `POS.Main.Core/Enums/EBillType.cs` | Enum |
| `POS.Main.Core/Enums/EBillStatus.cs` | Enum |
| `POS.Main.Dal/Entities/Order/TbOrder.cs` | Entity |
| `POS.Main.Dal/Entities/Order/TbOrderItem.cs` | Entity |
| `POS.Main.Dal/Entities/Order/TbOrderItemOption.cs` | Entity |
| `POS.Main.Dal/Entities/Order/TbOrderBill.cs` | Entity |
| EntityConfigurations (4 ไฟล์) | Config |
| Repositories (4 interfaces + 4 implementations) | Repository |
| `POS.Main.Business.Order/` | OrderService, SplitBillService, Models, Mappers |
| `RBMS.POS.WebAPI/Controllers/OrdersController.cs` | Controller |
| `RBMS.POS.WebAPI/Hubs/OrderHub.cs` | **SignalR Hub ใหม่** |
| Migrations | สร้างตาราง + Seed permissions |

### Frontend

| Component | หมายเหตุ |
|-----------|----------|
| `features/order/` | Module + Routing |
| Order List page | ดูรายการ order ทั้งหมด |
| POS / Order Create page | หน้าสั่งอาหาร (เลือกเมนู → cart → ส่งครัว) |
| Table Detail (ปรับปรุง) | แสดง order items, ปุ่ม void/cancel/serve |
| Split Bill dialog | แบ่ง items เป็นหลายบิล |
| Cancel Reason dialog | กรอกเหตุผลยกเลิก + manager auth |

### เช็คลิสต์

- [x] อ่าน Pre-flight docs
- [x] **Backend — Entity + Migration**
  - [x] สร้าง Enums (4 ไฟล์)
  - [x] สร้าง Entities (TbOrder, TbOrderItem, TbOrderItemOption, TbOrderBill)
  - [x] สร้าง EntityConfigurations
  - [x] อัพเดต DbContext
  - [x] สร้าง Migration + Seed permissions
  - [x] รัน `dotnet ef database update`
- [x] **Backend — Repository + Service + Controller**
  - [x] สร้าง Repositories
  - [x] อัพเดต UnitOfWork
  - [x] สร้าง Business module (OrderService, SplitBillService, Models, Mappers)
  - [x] สร้าง OrdersController
  - [x] Register DI
- [x] **Backend — SignalR OrderHub**
  - [x] สร้าง OrderHub.cs
  - [x] Register Hub ใน Program.cs
  - [x] Implement event broadcasting (NewOrderItems, ItemStatusChanged, ItemCancelled, OrderUpdated)
- [x] **Frontend — gen-api + Pages**
  - [x] Restart Backend + ตรวจ Swagger + gen-api
  - [x] สร้าง Feature module + Routing
  - [x] สร้าง Order List page
  - [x] สร้าง POS / Order Create page
  - [x] ปรับปรุง Table Detail page (แสดง order items)
  - [x] สร้าง Split Bill dialog
  - [x] สร้าง Cancel Reason dialog
  - [x] เพิ่ม Sidebar menu + Permissions
- [x] อัพเดต database-api-reference.md
- [x] อัพเดต Task file สถานะ

---

## Phase 3A — Kitchen System (KDS)

**REQ**: [REQ-kitchen-system.md](../requirements/REQ-kitchen-system.md)
**ขนาด**: เล็ก-กลาง | **Depends on**: Phase 2 (Order + OrderHub)

> ทำคู่ขนานกับ Phase 3B ได้

### ขอบเขต

- Kitchen Display System (KDS) — หน้าจอครัวแสดง order items ที่ต้องทำ
- 2 View Modes: Order View (การ์ดตาม order) + Menu View (จัดกลุ่มตามเมนู)
- Batch Operations (เลือกหลาย items → กด "เริ่มทำ" / "เสร็จแล้ว" พร้อมกัน)
- 3 หมวด KDS แยก route: อาหาร / เครื่องดื่ม / ของหวาน
- Ready Section (รอเสิร์ฟ — items ที่ READY รอ Floor staff มารับ)
- Real-time ผ่าน OrderHub (สร้างแล้วใน Phase 2)
- Timer + Overdue Warning (เตือนเมื่อทำนานเกิน)

### Backend

| ไฟล์ | ประเภท |
|------|--------|
| `POS.Main.Dal/Entities/Order/TbOrderItem.cs` | **แก้ไข** — เพิ่ม `CookingStartedAt` |
| `POS.Main.Business.Order/Services/KitchenService.cs` | Service ใหม่ |
| `POS.Main.Business.Order/Interfaces/IKitchenService.cs` | Interface ใหม่ |
| `RBMS.POS.WebAPI/Controllers/KitchenController.cs` | Controller ใหม่ (3 endpoints) |
| `RBMS.POS.WebAPI/Hubs/OrderHub.cs` | **แก้ไข** — implement event broadcasting |
| `Permissions.cs` | **แก้ไข** — 6 permissions (kitchen-food/beverage/dessert .read/.update) |
| Migration | เพิ่ม CookingStartedAt + Seed permissions |

### Frontend

| Component | หมายเหตุ |
|-----------|----------|
| `features/kitchen-display/` | Module + Routing (3 child routes) |
| Kitchen Header | Tab หมวด + View toggle + Timer settings |
| Order View | การ์ดแสดง order items (batch checkbox) |
| Menu View | จัดกลุ่มตามชื่อเมนู (batch cooking) |
| Ready Section | รอเสิร์ฟ (แสดง items READY จัดตามโต๊ะ) |
| `core/services/kitchen-signalr.service.ts` | OrderHub client |
| `core/services/kitchen-state.service.ts` | State management (signals) |

### เช็คลิสต์

- [x] อ่าน Pre-flight docs
- [x] **Backend**
  - [x] เพิ่ม CookingStartedAt field ใน TbOrderItem
  - [x] สร้าง Migration + Seed permissions (6 permissions)
  - [x] รัน `dotnet ef database update`
  - [x] สร้าง KitchenService + Interface
  - [x] สร้าง KitchenController (GET orders, PUT prepare, PUT ready)
  - [x] Implement OrderHub event broadcasting
  - [x] Register DI
  - [x] ทดสอบ API ผ่าน Swagger
- [x] **Frontend**
  - [x] Restart Backend + ตรวจ Swagger + gen-api
  - [x] สร้าง Feature module + Routing (3 child routes แยกหมวด)
  - [x] สร้าง Kitchen Header component
  - [x] สร้าง Order View component
  - [x] สร้าง Menu View component
  - [x] สร้าง Ready Section component
  - [x] สร้าง SignalR service + State service
  - [x] เพิ่ม Sidebar menu + Permissions (array 3 หมวด)
- [x] อัพเดต database-api-reference.md
- [x] อัพเดต Task file สถานะ

---

## Phase 3B — Payment System

**REQ**: [REQ-payment-system.md](../requirements/REQ-payment-system.md)
**ขนาด**: ใหญ่ | **Depends on**: Phase 2 (Order) + Phase 1 (Table)

> ทำคู่ขนานกับ Phase 3A ได้

### ขอบเขต

- Billing Flow (Staff-initiated + Customer-initiated)
- Billing Preparation (Cashier เลือก ServiceCharge + ใส่ส่วนลด → ยืนยันบิล → สร้าง TbOrderBill)
- Discount System (ส่วนลดรายการ + ส่วนลดบิล — % หรือจำนวนเงิน)
- Payment Methods (เงินสด + QR/สลิป)
- Slip Upload + OCR Verification (auto + manual)
- Cashier Session (เปิด/ปิดกะ + Cash In/Out)
- Receipt Generation (pdfmake — Download PDF)
- Split Bill (UI flow — entity สร้างใน Phase 2)
- SignalR events (REQUEST_BILL, SLIP_UPLOADED, PAYMENT_COMPLETED → ใช้ใน Phase 4)

### Backend

| ไฟล์ | ประเภท |
|------|--------|
| `POS.Main.Core/Enums/EPaymentMethod.cs` | Enum |
| `POS.Main.Core/Enums/ECashierSessionStatus.cs` | Enum |
| `POS.Main.Core/Enums/ECashDrawerTransactionType.cs` | Enum |
| `POS.Main.Core/Enums/EDiscountType.cs` | Enum |
| `POS.Main.Core/Enums/ESlipVerificationStatus.cs` | Enum |
| `POS.Main.Dal/Entities/Payment/TbPayment.cs` | Entity |
| `POS.Main.Dal/Entities/Payment/TbCashierSession.cs` | Entity |
| `POS.Main.Dal/Entities/Payment/TbCashDrawerTransaction.cs` | Entity |
| `POS.Main.Dal/Entities/Order/TbOrderDiscount.cs` | Entity |
| EntityConfigurations (4 ไฟล์) | Config |
| Repositories (4 interfaces + 4 implementations) | Repository |
| `POS.Main.Business.Payment/` | PaymentService, BillingService, CashierSessionService, Models, Mappers |
| `RBMS.POS.WebAPI/Controllers/` | PaymentsController, CashierSessionsController |
| Migrations | สร้างตาราง + Seed permissions |

### Frontend

| Component | หมายเหตุ |
|-----------|----------|
| `features/payment/` | Module + Routing |
| Payment Process page | เตรียมบิล → เลือก ServiceCharge → ส่วนลด → ยืนยัน → ชำระ |
| Payment History page | ประวัติการชำระ |
| Cashier Session pages | เปิด/ปิดกะ, Cash In/Out, สรุปกะ |
| Receipt component | pdfmake PDF generation + Download |
| Discount dialog | เพิ่ม/แก้ไขส่วนลด (รายการ/บิล) |
| Slip Verification dialog | ดูสลิป + ยืนยัน/ปฏิเสธ |

### เช็คลิสต์

- [x] อ่าน Pre-flight docs
- [x] **Backend — Entity + Migration**
  - [x] สร้าง Enums (5 ไฟล์)
  - [x] สร้าง Entities (TbPayment, TbCashierSession, TbCashDrawerTransaction, TbOrderDiscount)
  - [x] สร้าง EntityConfigurations
  - [x] อัพเดต DbContext
  - [x] สร้าง Migration + Seed permissions
  - [x] รัน `dotnet ef database update`
- [x] **Backend — Repository + Service + Controller**
  - [x] สร้าง Repositories
  - [x] อัพเดต UnitOfWork
  - [x] สร้าง Business module (PaymentService, BillingService, CashierSessionService)
  - [x] สร้าง Controllers (Payments, CashierSessions)
  - [x] Register DI
  - [x] ทดสอบ API ผ่าน Swagger
- [x] **Frontend — gen-api + Pages**
  - [x] Restart Backend + ตรวจ Swagger + gen-api
  - [x] สร้าง Feature module + Routing
  - [x] สร้าง Payment Process page (billing flow)
  - [x] สร้าง Discount dialog
  - [x] สร้าง Receipt component (pdfmake)
  - [x] สร้าง Slip Verification dialog
  - [x] สร้าง Cashier Session pages (เปิด/ปิดกะ, สรุป)
  - [x] สร้าง Payment History page
  - [x] เพิ่ม Sidebar menu + Permissions
- [x] อัพเดต database-api-reference.md
- [x] อัพเดต Task file สถานะ

---

## Phase 4 — Notification System

**REQ**: [REQ-noti-system.md](../requirements/REQ-noti-system.md)
**ขนาด**: กลาง | **Depends on**: Phase 1-3 (events จากทุกระบบ)

### ขอบเขต

- **NotificationHub (SignalR)** — Hub ใหม่แยกจาก OrderHub
- 8 Notification Events (NEW_ORDER, ORDER_READY, CALL_WAITER, REQUEST_BILL, RESERVATION_REMINDER, ORDER_CANCELLED, SLIP_UPLOADED, PAYMENT_COMPLETED)
- Role-based Groups (Kitchen, Floor, Cashier, Manager)
- Sidebar Drawer UI (slide จากขวา ~400px, filter chips, table filter, read/unread)
- Toast (PrimeNG Toast — top-right, 5 วินาที, urgent events)
- NotiStore (Angular Signals — แทน NgRx สำหรับ noti state)
- Mark Read / Mark All Read / Clear All
- Click → Navigate ไปหน้าที่เกี่ยวข้อง
- Reservation Reminder (Background Service — ทุก 5 นาที check จองที่จะมาถึง)
- Auto-cleanup 7 วัน (CleanupBackgroundService)

### Backend

| ไฟล์ | ประเภท |
|------|--------|
| `POS.Main.Dal/Entities/Notification/TbNotification.cs` | Entity |
| `POS.Main.Dal/Entities/Notification/TbNotificationRead.cs` | Entity (มี ClearedAt) |
| EntityConfigurations (2 ไฟล์) | Config |
| `POS.Main.Repositories/` | NotificationRepository |
| `POS.Main.Business.Notification/` | NotificationService |
| `RBMS.POS.WebAPI/Hubs/NotificationHub.cs` | **SignalR Hub ใหม่** |
| `RBMS.POS.WebAPI/Controllers/NotificationsController.cs` | 5 endpoints |
| `RBMS.POS.WebAPI/Services/ReservationReminderService.cs` | Background Service |
| `RBMS.POS.WebAPI/Services/CleanupBackgroundService.cs` | Background Service (cleanup) |
| Migration | สร้างตาราง + Seed permissions |

### Frontend

| Component | หมายเหตุ |
|-----------|----------|
| `core/services/noti-store.service.ts` | NotiStore (Signals) |
| `core/services/notification-signalr.service.ts` | SignalR client → NotiStore |
| `shared/components/notification-drawer/` | Sidebar Drawer UI |
| `main-layout.component.html` | เพิ่ม `<p-toast>` + `<app-notification-drawer>` |
| `header.component.ts` | Bell click → `notiStore.toggleDrawer()` |
| ลบ notification-panel/ (skeleton เดิม) | แทนที่ด้วย drawer |

### เช็คลิสต์

- [x] อ่าน Pre-flight docs
- [x] **Backend — Entity + Migration**
  - [x] สร้าง Entities (TbNotification, TbNotificationRead)
  - [x] สร้าง EntityConfigurations (2 ไฟล์)
  - [x] อัพเดต DbContext
  - [x] สร้าง Migration (`20260321060423_AddNotificationSystem`) + Seed permissions
  - [x] รัน `dotnet ef database update`
- [x] **Backend — Hub + Service + Controller**
  - [x] สร้าง NotificationHub (`Hubs/NotificationHub.cs`)
  - [x] สร้าง NotificationService (send, query, mark read, clear)
  - [x] สร้าง NotificationBroadcaster (`Services/NotificationBroadcaster.cs`)
  - [x] สร้าง OrderNotificationService (`Services/OrderNotificationService.cs`)
  - [x] สร้าง NotificationsController (5 endpoints)
  - [x] สร้าง ReservationReminderService (IHostedService)
  - [x] สร้าง CleanupBackgroundService (IHostedService)
  - [x] Register DI + Hubs ใน Program.cs
  - [x] **Integrate events** — เพิ่ม notification triggers ใน OrderService, KitchenService, PaymentService
  - [x] ทดสอบ API + SignalR ผ่าน Swagger
- [x] **Frontend — gen-api + Components**
  - [x] Restart Backend + ตรวจ Swagger + gen-api
  - [x] สร้าง NotiStore (Angular Signals) (`core/services/noti-store.service.ts`)
  - [x] สร้าง NotificationSignalRService (`core/services/notification-signalr.service.ts`)
  - [x] สร้าง NotificationDrawerComponent (`shared/components/notification-drawer/`)
  - [x] สร้าง NotificationTableDropdown (`shared/dropdowns/notification-table-dropdown/`)
  - [x] เพิ่ม Toast ใน main-layout
  - [x] แก้ไข Header (bell → toggleDrawer)
  - [x] ลบ notification-panel skeleton เดิม
  - [x] ลบ layout NgRx state เกี่ยวกับ notification
- [x] อัพเดต database-api-reference.md
- [x] อัพเดต Task file สถานะ

---

## Phase 5 — Self-Order System (QR)

**REQ**: [REQ-self-order-system.md](../requirements/REQ-self-order-system.md)
**ขนาด**: ใหญ่มาก | **Depends on**: Phase 1-4 (ทุกระบบ)

### ขอบเขต

- **Angular Project ใหม่** (Mobile Web — แยกจาก Staff POS)
- QR Code Flow (สแกน → validate token → สร้าง session → ตั้งชื่อเล่น)
- Customer Menu Browse (หมวดหมู่ → เมนู → bottom sheet → options → ตะกร้า)
- Cart + Submit Order (ยืนยัน → ส่งครัว auto)
- Order Tracking (ติดตามสถานะ real-time ผ่าน SignalR OrderHub)
- Call Waiter (เรียกพนักงาน — cooldown 60 วินาที)
- Request Bill (ขอเช็คบิล → BILLING → รอแคชเชียร์ → เห็นบิลสรุป)
- Bill View + QR Payment + Slip Upload
- Guest Bearer Token Authentication
- Customer Session Management (TbCustomerSession)
- Customer SignalR Events (BillPrepared, PaymentCompleted, TableClosed)

### Backend

| ไฟล์ | ประเภท |
|------|--------|
| `POS.Main.Dal/Entities/Customer/TbCustomerSession.cs` | Entity ใหม่ |
| EntityConfigurations | Config |
| `POS.Main.Repositories/` | CustomerSessionRepository |
| `POS.Main.Business.Payment/Services/SelfOrderService.cs` | SelfOrderService (667 บรรทัด, 13 methods) |
| `POS.Main.Business.Payment/Models/SelfOrder/` | 8 models (Auth, Menu, Order, Tracking, SubmitOrder) |
| `POS.Main.Business.Payment/Models/Customer/` | 2 models (BillResponse, UploadSlip) |
| `RBMS.POS.WebAPI/Controllers/CustomerController.cs` | Customer auth endpoints |
| `RBMS.POS.WebAPI/Controllers/SelfOrderController.cs` | Self-order endpoints (menu, cart, bill) |
| `RBMS.POS.WebAPI/Attributes/CustomerAuthorizeAttribute.cs` | Auth attribute (guest JWT) |
| Migration `20260321193417_AddCustomerSessionTable` | สร้างตาราง TbCustomerSession |

### Frontend (Project ใหม่ — Mobile Web)

| Component | หมายเหตุ |
|-----------|----------|
| **Project setup** | Angular 19.1 + Tailwind + PrimeNG (port 4400) |
| **5 Feature Modules** | `menu/`, `cart/`, `orders/`, `bill/`, `actions/` |
| QR Landing page (`/auth`) | Validate token → redirect |
| Nickname page | ตั้งชื่อเล่น |
| Menu Browse page | Category tabs → Sub-category chips → Menu cards |
| Menu Detail (bottom sheet) | Options, quantity, note |
| Cart page | รายการ + แก้ไข + ยืนยัน |
| Order Tracking page | สถานะ real-time (SignalR) |
| Actions page | Call Waiter + Request Bill |
| Bill Waiting page | "รอพนักงานจัดเตรียมบิล..." |
| Bill Summary page | ยอดชำระ + QR Code ร้าน + Upload สลิป |
| Slip Upload page | อัพโหลดสลิป |
| Payment Complete page | "ชำระเสร็จ" + ดูใบเสร็จ |
| Session Expired page (`/expired`) | แจ้งว่า session หมดอายุ |
| **Core Services (6)** | customer-auth, cart, signalr, loading, receipt, receipt-fonts |
| **Guards + Interceptors** | customer-auth.guard, customer-token.interceptor, loading.interceptor |
| **Layout** | customer-layout (sticky header + fixed bottom nav) |

### เช็คลิสต์

- [x] อ่าน Pre-flight docs
- [x] **Backend**
  - [x] สร้าง TbCustomerSession Entity + Config
  - [x] สร้าง Migration (`20260321193417_AddCustomerSessionTable`)
  - [x] รัน `dotnet ef database update`
  - [x] สร้าง CustomerAuthorizeAttribute (guest JWT auth)
  - [x] สร้าง SelfOrderService (13 methods: Auth, Menu, Cart, Order, Bill)
  - [x] สร้าง CustomerController + SelfOrderController
  - [x] เพิ่ม customer SignalR events ใน OrderHub
  - [x] Register DI ใน Program.cs
  - [x] ทดสอบ API ผ่าน Swagger
- [x] **Frontend — Project ใหม่ (RBMS-POS-Mobile-Web)**
  - [x] สร้าง Angular project (port 4400)
  - [x] Setup Tailwind + PrimeNG + gen-api config
  - [x] สร้าง Customer Layout (sticky header + bottom nav)
  - [x] สร้าง QR Landing page (`/auth`)
  - [x] สร้าง Menu Browse page + Menu Card + Menu Detail (bottom sheet)
  - [x] สร้าง Cart page
  - [x] สร้าง Order Tracking page (SignalR)
  - [x] สร้าง Actions page (Call Waiter + Request Bill)
  - [x] สร้าง Bill Waiting + Bill Summary + Slip Upload pages
  - [x] สร้าง Payment Complete page
  - [x] สร้าง Session Expired page (`/expired`)
  - [x] สร้าง Core Services (customer-auth, cart, signalr, loading, receipt)
  - [x] สร้าง Guards + Interceptors (customer-auth.guard, customer-token.interceptor)
- [x] อัพเดต database-api-reference.md
- [x] อัพเดต Task file สถานะ

---

## Phase 6 — Dashboard

**REQ**: [REQ-dashboard-system.md](../requirements/REQ-dashboard-system.md)
**ขนาด**: เล็ก | **Depends on**: Phase 2 (Order) + Phase 3B (Payment)

### ขอบเขต

- Dashboard Overview (4 KPI cards + Revenue Trend + Top Selling + Peak Hours)
- Sales Report (Date range + KPI Summary + Pie charts + ตารางรายวัน)
- Date comparison (เลือกวัน → เทียบกับวันก่อนหน้า)
- Quick filters (วันนี้ / เมื่อวาน / 7 วัน / 30 วัน / เดือนนี้ / Custom)
- Aggregate queries (read-only — ไม่มี Entity ใหม่)

### Backend

| ไฟล์ | ประเภท |
|------|--------|
| `RBMS.POS.WebAPI/Controllers/DashboardController.cs` | 4 endpoints |
| `POS.Main.Business.Dashboard/` | DashboardService (aggregate queries) |
| `POS.Main.Business.Dashboard/Models/` | 4 response models |
| `Permissions.cs` | เพิ่ม `dashboard.view.read` |
| Migration | Seed permission |

### Frontend

| Component | หมายเหตุ |
|-----------|----------|
| `features/dashboard/` | Module + Routing |
| Dashboard Overview page | KPI cards + charts |
| Sales Report page | Date range + charts + table |
| KPI Card component | แสดงตัวเลข + เปรียบเทียบ % |
| Chart components | Revenue Trend (line), Top Selling (bar), Peak Hours (bar), Pie charts |

### เช็คลิสต์

- [ ] อ่าน Pre-flight docs
- [ ] **Backend**
  - [ ] สร้าง DashboardService + Interface
  - [ ] สร้าง Response Models
  - [ ] สร้าง DashboardController (4 endpoints)
  - [ ] เพิ่ม permission + Seed Migration
  - [ ] รัน `dotnet ef database update`
  - [ ] Register DI
  - [ ] ทดสอบ API ผ่าน Swagger
- [ ] **Frontend**
  - [ ] Restart Backend + ตรวจ Swagger + gen-api
  - [ ] สร้าง Feature module + Routing
  - [ ] สร้าง Dashboard Overview page + KPI cards
  - [ ] สร้าง Chart components (line, bar, pie)
  - [ ] สร้าง Sales Report page
  - [ ] เพิ่ม Sidebar menu + Permissions
- [ ] อัพเดต database-api-reference.md
- [ ] อัพเดต Task file สถานะ

---

## สรุปภาพรวม

| Phase | ระบบ | Entity ใหม่ | SignalR | ขนาด | สถานะ |
|-------|------|------------|---------|------|--------|
| 1 | Table | 4 | - | กลาง | ✅ เสร็จ |
| 2 | Order | 4 | OrderHub (สร้าง) | ใหญ่ | ✅ เสร็จ |
| 3A | Kitchen (KDS) | 0 (+1 field) | OrderHub (ใช้) | เล็ก | ✅ เสร็จ |
| 3B | Payment | 4 | - | ใหญ่ | ✅ เสร็จ |
| 4 | Notification | 2 | NotificationHub (สร้าง) | กลาง | ✅ เสร็จ |
| 5 | Self-Order (QR) | 1 | OrderHub (ใช้) | ใหญ่มาก | ✅ เสร็จ |
| 6 | Dashboard | 0 | - | เล็ก | ⬜ ถัดไป |
| **รวม** | | **15 entities** | **2 hubs** | | **6/7 เสร็จ** |

---

## หมายเหตุ

- **ก่อนเริ่มแต่ละ Phase** → สร้าง TASK file แยก (เช่น `TASK-table-system.md`) พร้อม sub-tasks ละเอียด
- **ทุก Phase** ต้องอัพเดต [database-api-reference.md](../architecture/database-api-reference.md) หลังเสร็จ
- **gen-api** ต้องรันทุกครั้งที่ Backend API เปลี่ยน — บอกผู้ใช้รัน ห้ามรันเอง
- **Migration** ต้อง kill Backend process ก่อนรัน EF commands
- **แต่ละ Phase อาจแบ่งเป็นหลาย session** — อัพเดตเช็คลิสต์ทุกครั้งที่เสร็จ sub-task
