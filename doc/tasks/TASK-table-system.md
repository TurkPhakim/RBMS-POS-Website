# TASK: Table System (Phase 1)

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-19
**วันที่เสร็จ**: -

> ระบบจัดการโต๊ะ — เป็นฐานของระบบ Order, Payment, Kitchen, Self-Order ทุกระบบ
> เอกสารอ้างอิง: [REQ-table-system.md](../requirements/REQ-table-system.md) | [TASK-development-roadmap.md](TASK-development-roadmap.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- **ยังไม่มี OrderService** — ปุ่ม Open/Close/Move เปลี่ยน status ได้ แต่ยังไม่ผูก Order
- **TbTableLink ใช้ hard delete** — ไม่ soft delete (เป็น junction/temporary record)
- **QR Token ใช้ JWT** — sign ด้วย HMAC-SHA256, claims: tableId, nonce, exp (12hr)
- **Reservation validate เวลาทำการ** — ดึงจาก TbShopSettings

---

## Dependencies / สิ่งที่มีอยู่แล้ว

- [x] Module `table-manage` (ModuleId=15) + Permissions (AM=22-25) — seed แล้วตั้งแต่ RBAC migration
- [x] Permission constants `Permissions.Table.*` — มีแล้วใน `Permissions.cs`
- [ ] Module `reservation` + Permissions — **ต้องเพิ่มใหม่**
- [ ] Permission constants `Permissions.Reservation.*` — **ต้องเพิ่มใหม่**

---

## แผนการทำงาน

### Phase 1.1 — Backend: Enums + Entities + EntityConfiguration

กระทบ: POS.Main.Core, POS.Main.Dal | ความซับซ้อน: ปานกลาง

#### 1.1.1 สร้าง Enums (5 ไฟล์)

| ไฟล์ | ค่า |
|------|-----|
| `Enums/ETableStatus.cs` | Available=0, Occupied=1, Billing=2, Reserved=3, Cleaning=4, Unavailable=5 |
| `Enums/ETableShape.cs` | Square=0, Round=1 |
| `Enums/ETableSize.cs` | Small=0, Medium=1, Large=2 |
| `Enums/EGuestType.cs` | WalkIn=0, Reserved=1 |
| `Enums/EReservationStatus.cs` | Pending=0, Confirmed=1, CheckedIn=2, Cancelled=3, NoShow=4 |

#### 1.1.2 สร้าง Entities (4 ไฟล์)

| ไฟล์ | Fields |
|------|--------|
| `Entities/Table/TbZone.cs` | ZoneId, ZoneName, Color, SortOrder, IsActive |
| `Entities/Table/TbTable.cs` | TableId, TableName, ZoneId(FK), Capacity, PositionX, PositionY, Shape, Size, Status, CurrentGuests?, GuestType?, OpenedAt?, Note?, QrToken?, QrTokenExpiresAt?, QrTokenNonce? |
| `Entities/Table/TbTableLink.cs` | TableLinkId, GroupCode, TableId(FK) |
| `Entities/Table/TbReservation.cs` | ReservationId, CustomerName, CustomerPhone, ReservationDate, ReservationTime, GuestCount, TableId?(FK), Note?, Status, ReminderSent |

#### 1.1.3 สร้าง EntityConfigurations (4 ไฟล์)

| ไฟล์ | Key indexes |
|------|-------------|
| `TbZoneConfiguration.cs` | Unique ZoneName, index DeleteFlag+IsActive+SortOrder |
| `TbTableConfiguration.cs` | Unique TableName, FK→Zone, index ZoneId/Status/DeleteFlag |
| `TbTableLinkConfiguration.cs` | Unique TableId, index GroupCode, **hardDeleteTypes** |
| `TbReservationConfiguration.cs` | FK→Table, index ReservationDate+Status, TableId |

#### 1.1.4 แก้ไข POSMainContext.cs

เพิ่ม 4 DbSets + 4 ApplyConfiguration + เพิ่ม TbTableLink ใน hardDeleteTypes

---

### Phase 1.2 — Backend: Migration + Seed Reservation Permissions

#### 1.2.1 Migration: AddTableSystem

สร้าง 4 ตาราง (TbZones, TbTables, TbTableLinks, TbReservations)

#### 1.2.2 Migration: SeedReservationPermissions

- Module 25: "reservation" (child of table=6), SortOrder=2
- AuthorizeMatrix 56-59: reservation.read/create/update/delete
- Grant Admin (PositionId=1)

#### 1.2.3 เพิ่ม Permission constants

```
Permissions.Reservation.Read = "reservation.read"
Permissions.Reservation.Create = "reservation.create"
Permissions.Reservation.Update = "reservation.update"
Permissions.Reservation.Delete = "reservation.delete"
```

---

### Phase 1.3 — Backend: Repository + UnitOfWork

สร้าง 4 Repository interfaces + 4 implementations, เพิ่มใน IUnitOfWork + UnitOfWork

---

### Phase 1.4 — Backend: Zone Service + Controller

Business module: `POS.Main.Business.Table/`
Controller: `ZonesController.cs` → `api/table/zones`
Endpoints: GET list, GET {zoneId}, POST, PUT {zoneId}, DELETE {zoneId}, PUT sort-order

---

### Phase 1.5 — Backend: Table Service + Controller

Controller: `TablesController.cs` → `api/table/tables`
Endpoints: CRUD + Open, Close, Clean, Move, Link/Unlink, SetAvailable/Unavailable, UpdatePositions, GetQrToken

---

### Phase 1.6 — Backend: Reservation Service + Controller

Controller: `ReservationsController.cs` → `api/table/reservations`
Endpoints: CRUD + Confirm, CheckIn, Cancel, NoShow, GetToday, GetCalendar

---

### Phase 1.7 — Frontend: gen-api + Module + Zone pages

- Restart Backend + gen-api
- สร้าง TableModule + routing + Zone list/manage pages
- เพิ่ม sidebar menu + layout routing

---

### Phase 1.8 — Frontend: Table pages + Floor Plan + Dialogs

- Floor Plan (card grid view + zone tabs)
- Table manage page
- Dialogs: open-table, move-table, link-table, qr-code
- zone-dropdown component

---

### Phase 1.9 — Frontend: Reservation pages

- Reservation today (list + status buttons)
- Reservation manage (form)
- Reservation calendar

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1.1  Enums + Entities + Config       ← สร้างโครงสร้างข้อมูล
2. Phase 1.2  Migration + Seed Permissions     ← สร้างตารางจริง + permission
3. Phase 1.3  Repository + UnitOfWork          ← Data access layer
4. Phase 1.4  Zone Service + Controller        ← CRUD ง่ายสุด
5. Phase 1.5  Table Service + Controller       ← Operations ซับซ้อน
6. Phase 1.6  Reservation Service + Controller ← CRUD + status changes
   ── ทดสอบ API ผ่าน Swagger ──
7. Phase 1.7  Frontend: Module + Zone pages    ← เริ่ม UI
8. Phase 1.8  Frontend: Table + Floor Plan     ← หน้าหลัก
9. Phase 1.9  Frontend: Reservation pages      ← Calendar + CRUD
```

---

## หมายเหตุ

- สิ่งที่เลื่อนไป Phase 2 (Order): ActiveOrderId FK, auto-create Order, Operational Tags, SignalR broadcast
- Reservation Reminder (Background Service) → Phase 4 (Notification)
