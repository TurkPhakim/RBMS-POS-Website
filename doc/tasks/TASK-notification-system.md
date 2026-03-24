# TASK: Notification System (Phase 4)

**สถานะ**: COMPLETED
**วันที่เริ่ม**: 2026-03-21
**วันที่เสร็จ**: -

> ระบบแจ้งเตือน real-time สำหรับ staff ผ่าน SignalR Hub + Sidebar Drawer + Toast
> เอกสารอ้างอิง: [REQ-noti-system.md](../requirements/REQ-noti-system.md) | [auto-cleanup.md](../architecture/auto-cleanup.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- **TbNotification ไม่ inherit BaseEntity** — เป็นข้อมูลชั่วคราว ใช้ hard delete, มี CreatedAt เอง
- **ไม่มี Permission แยกสำหรับ notification** — ผูกกับ group membership ตาม permissions ที่มีอยู่
- **2 Hub Architecture** — NotificationHub (ใหม่) แยกจาก OrderHub (มีอยู่)
- **NgRx layout state เรื่อง notification → ลบ** แทนที่ด้วย NotiStore (Angular Signals)
- **notification-panel skeleton เดิม → ลบ** แทนที่ด้วย notification-drawer ใหม่

---

## สิ่งที่มีอยู่แล้ว (Reusable)

| สิ่งที่มี | ที่อยู่ | ใช้ยังไง |
|-----------|--------|---------|
| OrderHub + OrderNotificationService | `Hubs/OrderHub.cs`, `Services/OrderNotificationService.cs` | Pattern แม่แบบ group broadcasting |
| Header bell icon | `header.component.ts:63` | เปลี่ยน dispatch → `notiStore.toggleDrawer()` |
| NgRx Layout State (notificationPanelOpen) | `store/layout/*` | **ลบทิ้ง** — แทนที่ด้วย NotiStore |
| notification-panel (skeleton) | `shared/components/notification-panel/` | **ลบทิ้ง** — แทนที่ด้วย notification-drawer |
| TbReservation.ReminderSent | `Entities/Table/TbReservation.cs:26` | ใช้เลย — track ว่าส่ง reminder แล้วหรือยัง |
| ForbiddenException → 403 | `GlobalExceptionFilter.cs` | ใช้ได้ |
| Permissions constants | `Permissions.cs` | เพิ่ม group mapping logic |
| PrimeNG Toast (MessageService) | SharedModule | เพิ่ม `<p-toast>` ใน main-layout |

---

## Dependencies / สิ่งที่ต้องเตรียม

- Backend ต้องรันได้ (dotnet run + database update)
- Phase 1-3B เสร็จแล้ว (Order, Kitchen, Payment services พร้อม integrate triggers)
- ผู้ใช้ต้องรัน `npm run gen-api` เองหลัง Backend เสร็จ

---

## แผนการทำงาน

### Phase 4.1 — Backend Entity + Migration + Repository

กระทบ: Dal + Repositories | ความซับซ้อน: ต่ำ

#### 4.1.1 สร้าง Entity `TbNotification` (`Dal/Entities/Notification/TbNotification.cs`)

**ปัจจุบัน:** ยังไม่มี
**เป้าหมาย:** สร้าง entity สำหรับเก็บ notification (ไม่ inherit BaseEntity — hard delete)

```csharp
// Fields:
NotificationId (int, PK, Identity)
EventType (string, 50, NOT NULL)       // "NEW_ORDER", "CALL_WAITER", etc.
Title (string, 200, NOT NULL)
Message (string, 1000, NOT NULL)
TableId (int?, FK → TbTable)
OrderId (int?, FK → TbOrder)
ReservationId (int?, FK → TbReservation)
TargetGroup (string, 50, NOT NULL)     // "Kitchen", "Floor", "Cashier", "Manager"
Payload (string?, max)                 // JSON ข้อมูลเพิ่มเติม
CreatedAt (DateTime, NOT NULL, default GETUTCDATE())

// Navigation:
Table → TbTable
Order → TbOrder
Reservation → TbReservation
NotificationReads → ICollection<TbNotificationRead>
```

#### 4.1.2 สร้าง Entity `TbNotificationRead` (`Dal/Entities/Notification/TbNotificationRead.cs`)

**ปัจจุบัน:** ยังไม่มี
**เป้าหมาย:** Track per-user read + clear status

```csharp
// Fields:
NotificationReadId (int, PK, Identity)
NotificationId (int, FK → TbNotification, NOT NULL)
UserId (int, FK → TbUser, NOT NULL)
ReadAt (DateTime?, null = ยังไม่อ่าน)
ClearedAt (DateTime?, null = ไม่ได้ clear)

// Navigation:
Notification → TbNotification
User → TbUser
```

#### 4.1.3 สร้าง EntityConfigurations

**ไฟล์:**
- `TbNotificationConfiguration.cs` — PK, indexes (EventType, TargetGroup, CreatedAt), FK relationships
- `TbNotificationReadConfiguration.cs` — PK, Unique(NotificationId + UserId), FK relationships

#### 4.1.4 อัพเดต DbContext + Migration

- เพิ่ม `DbSet<TbNotification>` + `DbSet<TbNotificationRead>` ใน POSMainContext
- สร้าง Migration: `dotnet ef migrations add AddNotificationSystem`
- รัน `dotnet ef database update`

#### 4.1.5 สร้าง Repository + อัพเดต UnitOfWork

- `INotificationRepository.cs` + `NotificationRepository.cs`
- เพิ่มใน `IUnitOfWork` / `UnitOfWork`

---

### Phase 4.2 — Backend Service + Hub + Controller + Background Services

กระทบ: Business.Notification + WebAPI | ความซับซ้อน: สูง

#### 4.2.1 สร้าง Business Project `POS.Main.Business.Notification`

**ไฟล์ที่สร้าง:**
- `Interfaces/INotificationService.cs`
- `Services/NotificationService.cs`
- `Models/NotificationResponseModel.cs`
- `Models/NotificationMapper.cs`

**Methods ของ NotificationService:**
```
SendAsync(model) → บันทึก DB + broadcast SignalR
GetNotificationsAsync(userId, eventType?, tableId?, limit, before?) → query + cursor pagination
GetUnreadCountAsync(userId) → count
MarkReadAsync(notificationId, userId) → set ReadAt
MarkAllReadAsync(userId) → set ReadAt ทุก noti ของ user
ClearAllAsync(userId) → set ClearedAt timestamp
```

**Query Logic สำคัญ:**
- Filter ตาม TargetGroup ที่ user มี permission เข้าถึง
- ซ่อน noti ที่ ClearedAt >= CreatedAt
- Cursor pagination (WHERE NotificationId < before ORDER BY NotificationId DESC)

#### 4.2.2 สร้าง NotificationHub (`Hubs/NotificationHub.cs`)

**ปัจจุบัน:** ยังไม่มี
**เป้าหมาย:** SignalR Hub สำหรับ staff notification

```
Route: /hubs/notification
Authentication: JWT token (เดียวกับ API)
OnConnectedAsync() → ดึง user permissions → join groups (Kitchen/Floor/Cashier/Manager)
OnDisconnectedAsync() → leave groups
Client method: "ReceiveNotification" (payload: NotificationResponseModel)
```

**Group assignment ตาม permissions:**
- kitchen-food.read OR kitchen-beverage.read OR kitchen-dessert.read → "Kitchen"
- order-manage.read → "Floor"
- payment-manage.read → "Cashier"
- เป็น Manager (มี permission ครบ) → ทุก group

#### 4.2.3 สร้าง NotificationsController (`Controllers/NotificationsController.cs`)

**5 Endpoints:**
| Method | Route | รายละเอียด |
|--------|-------|-----------|
| GET | `/api/notifications` | ดึง notifications (query: eventType, tableId, limit, before) |
| GET | `/api/notifications/unread-count` | จำนวน unread |
| PATCH | `/api/notifications/{notificationId}/read` | Mark อ่านแล้ว |
| PATCH | `/api/notifications/read-all` | Mark ทั้งหมดอ่านแล้ว |
| DELETE | `/api/notifications/clear-all` | ซ่อน noti ทั้งหมดของ user (set ClearedAt) |

**ไม่ต้อง PermissionAuthorize** — ใช้แค่ `[Authorize]` (ทุกคนที่ login ได้)

#### 4.2.4 สร้าง ReservationReminderService (`Services/ReservationReminderService.cs`)

**ปัจจุบัน:** ยังไม่มี
**เป้าหมาย:** IHostedService check ทุก 5 นาที

```
Logic:
1. ดึง reservations: status=CONFIRMED, ReservationDate=วันนี้, เวลาจองอีก ≤ 30 นาที, ReminderSent=false
2. ส่ง RESERVATION_REMINDER notification → Manager group
3. Mark ReminderSent=true
```

#### 4.2.5 สร้าง CleanupBackgroundService (`Services/CleanupBackgroundService.cs`)

**ปัจจุบัน:** ยังไม่มี
**เป้าหมาย:** IHostedService สำหรับ cleanup ข้อมูลชั่วคราว

```
ทุก 6 ชั่วโมง:
- ลบ expired RefreshTokens (ExpiresAt < now OR IsRevoked)
ทุกวัน 03:00:
- ลบ TbNotificationRead ที่ NotificationId เก่ากว่า 7 วัน
- ลบ TbNotification ที่ CreatedAt เก่ากว่า 7 วัน
```

#### 4.2.6 Integrate notification triggers

**ไฟล์ที่แก้ไข:**
- `OrderService` → NEW_ORDER (ส่งครัว), REQUEST_BILL, ORDER_CANCELLED
- `KitchenService` → ORDER_READY (PREPARING → READY)
- `PaymentService` → SLIP_UPLOADED, PAYMENT_COMPLETED

**Pattern:**
```csharp
// ใน Service method หลัง business logic เสร็จ:
await _notificationService.SendAsync(new SendNotificationModel {
    EventType = "NEW_ORDER",
    Title = "ออเดอร์ใหม่",
    Message = $"โต๊ะ {tableName} — {itemsSummary}",
    TableId = tableId,
    OrderId = orderId,
    TargetGroup = "Kitchen"
});
```

#### 4.2.7 Register DI + Hub ใน Program.cs

- `builder.Services.AddScoped<INotificationService, NotificationService>()`
- `builder.Services.AddHostedService<ReservationReminderService>()`
- `builder.Services.AddHostedService<CleanupBackgroundService>()`
- `app.MapHub<NotificationHub>("/hubs/notification")`
- เพิ่ม project reference: `Business.Notification`

---

### Phase 4.3 — Frontend gen-api + NotiStore + SignalR Client

กระทบ: core/services + store/layout | ความซับซ้อน: ปานกลาง

#### 4.3.1 Restart Backend + ตรวจ Swagger + gen-api

- Kill Backend process → `dotnet run` ใหม่
- ตรวจ Swagger ว่ามี NotificationsController endpoints ครบ
- **บอกผู้ใช้รัน `npm run gen-api`** → หยุดรอ

#### 4.3.2 สร้าง NotiStore (`core/services/noti-store.service.ts`)

**ปัจจุบัน:** ไม่มี (ใช้ NgRx layout state แค่ toggle panel)
**เป้าหมาย:** State management ด้วย Angular Signals

```typescript
// Signals:
notifications = signal<NotificationResponseModel[]>([]);
isDrawerOpen = signal(false);
activeFilter = signal<string | null>(null);    // null = ทั้งหมด
tableFilter = signal<number | null>(null);     // null = ทุกโต๊ะ

// Computed:
unreadCount = computed(() => ...)
filteredNotifications = computed(() => ...)
availableTables = computed(() => ...)           // unique tables จาก notifications

// Methods:
addNotification(noti) → เพิ่ม + show toast (ถ้า drawer ปิด + event มี toast)
markRead(notificationId) → API PATCH + update local
markAllRead() → API PATCH + update local
clearAll() → confirm dialog → API DELETE + clear local
toggleDrawer()
setFilter(eventType)
setTableFilter(tableId)
loadNotifications() → API GET → set signal
```

#### 4.3.3 สร้าง NotificationSignalRService (`core/services/notification-signalr.service.ts`)

**ปัจจุบัน:** ไม่มี
**เป้าหมาย:** SignalR client → NotiStore

```
Pattern: เหมือน kitchen-signalr.service.ts
- connect() → HubConnectionBuilder + JWT token
- join groups อัตโนมัติ (server-side)
- listen "ReceiveNotification" → notiStore.addNotification()
- auto-reconnect → notiStore.loadNotifications()
- disconnect() → stop connection
```

#### 4.3.4 ลบ NgRx layout state เกี่ยวกับ notification

**ไฟล์ที่แก้ไข:**
- `layout.state.ts` → ลบ `notificationPanelOpen`
- `layout.actions.ts` → ลบ `toggleNotificationPanel`, `closeNotificationPanel`
- `layout.reducer.ts` → ลบ cases ที่เกี่ยวกับ notification
- `layout.selectors.ts` → ลบ `selectNotificationPanelOpen`

#### 4.3.5 แก้ Header component

**ไฟล์:** `header.component.ts` + `.html`
**เปลี่ยน:**
- Bell click → `notiStore.toggleDrawer()` แทน dispatch action
- เพิ่ม badge จาก `notiStore.unreadCount()`
- ลบ import NgRx store ที่เกี่ยวกับ notification

---

### Phase 4.4 — Frontend Notification Drawer + Toast + Cleanup

กระทบ: shared/components + main-layout | ความซับซ้อน: สูง

#### 4.4.1 ลบ notification-panel (skeleton เดิม)

**ไฟล์ที่ลบ:**
- `shared/components/notification-panel/notification-panel.component.ts`
- `shared/components/notification-panel/notification-panel.component.html`
- ลบ declaration + export จาก `shared.module.ts`
- ลบ reference จาก `header.component.html`

#### 4.4.2 สร้าง NotificationDrawerComponent (`shared/components/notification-drawer/`)

**เป้าหมาย:** Sidebar Drawer slide จากขวา ~400px

**Layout:**
```
┌─ Header: "การแจ้งเตือน" + ปุ่มปิด (X) ──────────┐
│ [อ่านทั้งหมด] [เคลียร์]                            │
│                                                    │
│ Filter chips: [ทั้งหมด] [ออเดอร์ใหม่] [อาหารพร้อม] │
│   [เรียกพนง.] [เรียกชำระ] [อื่นๆ]                  │
│                                                    │
│ กรองโต๊ะ: [ทั้งหมด ▼]                              │
│                                                    │
│ ┌── Notification Item (unread) ──────────────┐     │
│ │ ● icon Title                               │     │
│ │   Message — 2 นาทีที่แล้ว                    │     │
│ └────────────────────────────────────────────┘     │
│ ┌── Notification Item (read) ────────────────┐     │
│ │   icon Title                               │     │
│ │   Message — 5 นาทีที่แล้ว                    │     │
│ └────────────────────────────────────────────┘     │
│                                                    │
│ (ยังไม่มีการแจ้งเตือน — empty-view)                  │
└────────────────────────────────────────────────────┘
```

**สิ่งที่ต้องทำ:**
- Overlay bg-black/30 (กดปิด drawer)
- z-index สูงกว่า content ต่ำกว่า dialog
- Slide animation (transform translateX)
- Filter chips toggle (active: bg-primary text-white)
- Table filter dropdown
- Notification list (scrollable, เรียงใหม่สุด)
- Unread dot (●) + bg-primary/5
- Click → mark read + close drawer + navigate ตาม event type
- Relative time ("2 นาทีที่แล้ว", "1 ชั่วโมงที่แล้ว")
- Empty state: `<app-empty-view>`

**Navigation mapping (click noti → router.navigate):**
| Event | Route |
|-------|-------|
| NEW_ORDER | `/order/{orderId}` |
| ORDER_READY | `/order/{orderId}` |
| CALL_WAITER | `/table/floor-plan/{tableId}` |
| REQUEST_BILL | `/payment/process/{orderId}` |
| RESERVATION_REMINDER | `/table/reservations/update/{reservationId}` |
| ORDER_CANCELLED | `/order/{orderId}` |
| SLIP_UPLOADED | `/payment/process/{orderId}` |
| PAYMENT_COMPLETED | `/table/floor-plan` |

#### 4.4.3 เพิ่ม Toast + Drawer ใน main-layout

**ไฟล์:** `main-layout.component.html`
- เพิ่ม `<p-toast position="top-right" key="noti">`
- เพิ่ม `<app-notification-drawer>`
- ลบ `<app-notification-panel>` (ถ้ายังมี reference)

**ไฟล์:** `main-layout.component.ts`
- Inject NotificationSignalRService → connect เมื่อ init, disconnect เมื่อ destroy

#### 4.4.4 อัพเดต shared.module.ts

- ลบ NotificationPanelComponent
- เพิ่ม NotificationDrawerComponent

#### 4.4.5 อัพเดต database-api-reference.md

- เพิ่ม TbNotification, TbNotificationRead schemas
- เพิ่ม NotificationsController endpoints (5)
- เพิ่ม NotificationHub

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 4.1  Entity + Migration + Repository    ← ฐานข้อมูลต้องพร้อมก่อน
2. Phase 4.2  Service + Hub + Controller + BG     ← Backend API ต้องเสร็จก่อน gen-api
3. Phase 4.3  gen-api + NotiStore + SignalR Client ← ต้อง gen-api ก่อนเขียน FE
4. Phase 4.4  Drawer UI + Toast + Cleanup          ← UI สุดท้าย
```

---

## เช็คลิสต์

- [x] **Phase 4.1 — Entity + Migration + Repository**
  - [x] สร้าง TbNotification entity
  - [x] สร้าง TbNotificationRead entity (UserId = Guid ตาม TbUser)
  - [x] สร้าง TbNotificationConfiguration
  - [x] สร้าง TbNotificationReadConfiguration
  - [x] อัพเดต POSMainContext (2 DbSet)
  - [x] สร้าง Migration + รัน database update
  - [x] สร้าง INotificationRepository + NotificationRepository + INotificationReadRepository + NotificationReadRepository
  - [x] อัพเดต IUnitOfWork + UnitOfWork
- [x] **Phase 4.2 — Service + Hub + Controller + Background**
  - [x] สร้าง Business.Notification project (Interface + Service + Models + Mapper)
  - [x] สร้าง NotificationHub (JWT auth, group assignment ตาม permissions)
  - [x] สร้าง NotificationsController (5 endpoints)
  - [x] สร้าง INotificationBroadcaster + NotificationBroadcaster (save + SignalR broadcast)
  - [x] สร้าง ReservationReminderService (BackgroundService, ทุก 5 นาที)
  - [x] สร้าง CleanupBackgroundService (BackgroundService, ทุก 6 ชม.)
  - [x] Integrate triggers (OrderService, KitchenService, PaymentService)
  - [x] Register DI + Hub + JWT SignalR support ใน Program.cs
  - [x] Build สำเร็จ (0 errors)
  - [ ] ทดสอบ API ผ่าน Swagger (ต้องรัน Backend ก่อน)
- [x] **Phase 4.3 — Frontend gen-api + NotiStore + SignalR**
  - [x] Restart Backend + ตรวจ Swagger + บอกผู้ใช้รัน gen-api
  - [x] สร้าง NotiStore (core/services/noti-store.service.ts)
  - [x] สร้าง NotificationSignalRService (core/services/notification-signalr.service.ts)
  - [x] ลบ NgRx layout state เกี่ยวกับ notification
  - [x] แก้ Header (bell → notiStore + badge)
  - [x] ลบ notification-panel (skeleton เดิม) + shared.module cleanup
  - [x] เพิ่ม MessageService ใน app.module.ts
  - [x] Build สำเร็จ (0 errors)
- [x] **Phase 4.4 — Drawer UI + Toast + Cleanup**
  - [x] ลบ notification-panel (ย้ายมาทำใน Phase 4.3)
  - [x] สร้าง NotificationDrawerComponent (shared/components/notification-drawer/)
  - [x] เพิ่ม Toast + Drawer ใน main-layout + SignalR connect/disconnect
  - [x] อัพเดต shared.module.ts (declaration + export)
  - [x] เพิ่ม slide-in-right animation ใน tailwind.config.js
  - [x] อัพเดต database-api-reference.md (TbNotification, TbNotificationRead, endpoints, hub)
  - [x] Build สำเร็จ (0 errors)

---

## หมายเหตุ

- **gen-api**: ห้ามรันเอง — บอกผู้ใช้รัน + หยุดรอจนกว่ายืนยัน
- **Migration**: ต้อง kill Backend ก่อนรัน EF commands
- **Toast**: ไม่แสดงถ้า drawer เปิดอยู่ + แสดงสูงสุด 3 ตัว
- **CALL_WAITER + REQUEST_BILL**: trigger จาก Customer Mobile (Phase 5) ด้วย — แต่ Backend พร้อมรับอยู่แล้ว
