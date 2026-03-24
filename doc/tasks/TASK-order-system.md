# TASK: Phase 2 — Order System

**สถานะ**: COMPLETED (Backend + Frontend หลัก)
**วันที่เริ่ม**: 2026-03-19
**วันที่เสร็จ**: 2026-03-20

> ระบบสั่งอาหาร — หัวใจของ POS: สั่ง → ส่งครัว → เสิร์ฟ → ขอบิล
> REQ: [REQ-order-system.md](../requirements/REQ-order-system.md)

---

## ขอบเขต

- Order lifecycle (OPEN → BILLING → COMPLETED/CANCELLED)
- Order Items + Options (PENDING → SENT → PREPARING → READY → SERVED / VOIDED / CANCELLED)
- Staff Ordering page, Order List, Order Detail
- Send to Kitchen, Void, Cancel (manager auth), Mark Served
- Request Bill, Split Bill (by item / by amount / full)
- Bill Calculation (SubTotal, ServiceCharge snapshot, VAT 7%)
- OrderHub (SignalR) — basic events สำหรับ KDS
- TbTable.ActiveOrderId FK
- Price Snapshot

---

## เช็คลิสต์

### Pre-flight
- [x] อ่าน Pre-flight docs (backend-guide, backend-coding-standards, frontend-guidelines, frontend-coding-standards)

### Sub-phase 2.1: Backend Foundation (Entity + Migration)
- [x] สร้าง 4 Enums (EOrderStatus, EOrderItemStatus, EBillType, EBillStatus)
- [x] สร้าง 4 Entities (TbOrder, TbOrderItem, TbOrderItemOption, TbOrderBill)
- [x] สร้าง 4 EntityConfigurations
- [x] อัพเดต POSMainContext (DbSets + hardDeleteTypes: TbOrderItemOption)
- [x] เพิ่ม TbTable.ActiveOrderId FK + config
- [x] สร้าง Business project POS.Main.Business.Order + reference
- [x] สร้าง Migration AddOrderSystem → `dotnet ef database update`
- [x] Permissions seed อยู่ใน Migration AddPositionBasedRbac (module `order-manage` + `kitchen-order`)

### Sub-phase 2.2: Backend Logic (Repository + Service + Controller)
- [x] สร้าง 4 Repository interfaces + implementations (Order, OrderItem, OrderItemOption, OrderBill)
- [x] อัพเดต UnitOfWork (4 lazy properties)
- [x] สร้าง Models (Request/Response) + Mappers
- [x] สร้าง IOrderService + OrderService (14 methods)
- [x] สร้าง OrdersController (14 endpoints — route: `api/order/orders`)
- [x] Register DI ใน Program.cs (OrderService + OrderNotificationService)
- [x] ทดสอบ API ผ่าน Swagger

### Sub-phase 2.3: Backend SignalR — OrderHub
- [x] สร้าง OrderHub.cs (JoinGroup/LeaveGroup)
- [x] Register MapHub ใน Program.cs (`/hubs/order`)
- [x] สร้าง IOrderNotificationService + OrderNotificationService
- [x] Broadcast events: NewOrderItems → kitchen, ItemStatusChanged → kitchen+floor, ItemCancelled → kitchen, OrderUpdated → floor

### Sub-phase 2.4: Frontend — gen-api + Order List + Detail
- [x] Restart Backend + ตรวจ Swagger + gen-api
- [x] สร้าง Order List page (p-table, filter status/date/search, pagination)
- [x] สร้าง Order Detail page (items table + action buttons + bills section)
- [x] อัพเดต routing + module (3 routes: list, detail, add-items)
- [x] สร้าง CancelReasonDialog

### Sub-phase 2.5: Frontend — Staff Order (POS page)
- [x] สร้าง Staff Order page (menu browse + cart)
- [x] สร้าง MenuItemDialog (options + qty + note)
- [x] เชื่อม API (add items + send kitchen)
- [x] เพิ่มปุ่ม "สั่งอาหาร" ใน Floor Plan table action

### Sub-phase 2.6: Frontend — Split Bill + Request Bill
- [x] สร้าง SplitBillDialog (by item / by amount)
- [x] เชื่อม API (split bill + get bills)
- [x] Request Bill flow
- [x] ตรวจสอบ build (`ng build`) ✅

### งานเสริมที่ทำระหว่าง Phase 2
- [x] QR Code Dialog — แสดง QR Token เมื่อเปิดโต๊ะ (qr-code-styling lib)
- [x] Fix BaseController.Success() — string overload ใส่ QR token ใน message แทน result
- [x] Fix dialog chain — TableActionDialog ปิดตัวเองก่อน child → floor plan ไม่ reload
- [x] Auto-create Order เมื่อเปิดโต๊ะ (TableService.OpenTableAsync)
- [x] เพิ่ม shopNameThai ใน ShopBrandingService + Backend

### หลังเสร็จ
- [ ] อัพเดต database-api-reference.md
- [x] อัพเดต Task file สถานะ

---

## ความแตกต่างจาก REQ

| หัวข้อ | REQ ระบุ | ทำจริง | หมายเหตุ |
|--------|----------|--------|----------|
| Permission names | `order.read/create/update/delete` | `order-manage.read/create/update/delete` | ใช้ pattern `{module-code}.{action}` ตาม convention |
| Route prefix | `/api/orders` | `/api/order/orders` | ใช้ pattern `/api/{module}/{resource}` |
| Kitchen permissions | แยก 3 หมวด: `kitchen-food/beverage/dessert` (6 perm) | รวมเป็น 1: `kitchen-order.read/update` (2 perm) | ลดความซับซ้อน — แยกหมวดได้ภายหลังถ้าจำเป็น |
| KDS Frontend | ✅ ระบุใน scope | ❌ ยังไม่ทำ | รอ Phase แยก (REQ-kitchen-system) |
| Self-Order Frontend | ✅ ระบุใน scope | ❌ ยังไม่ทำ | รอ Phase แยก (REQ-self-order-system) |
| NotificationHub | ✅ ระบุใน scope | ❌ ยังไม่ทำ | รอ Notification module |
| SignalR client (Frontend) | ✅ ระบุใน scope | ❌ ยังไม่มี | `@microsoft/signalr` ติดตั้งแล้วแต่ยังไม่ได้ใช้ |
| Auto-create Order เมื่อเปิดโต๊ะ | ✅ ระบุใน REQ (Section 2.1) | ✅ ทำใน TableService | ไม่ได้อยู่ใน OrderService แต่อยู่ใน TableService เพื่อหลีกเลี่ยง cross-project dependency |
