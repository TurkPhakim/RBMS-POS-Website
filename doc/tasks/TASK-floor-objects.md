# TASK: Floor Objects + แยก Permission Modules

> สถานะ: กำลังดำเนินการ | เริ่ม: 2026-03-19

## สรุป

เพิ่มระบบ Floor Objects (วัตถุตกแต่งบนผังโต๊ะ) และแยก Permission ให้ "จัดการโซน" + "วัตถุบนผัง" เป็น Module แยกจาก "จัดการโต๊ะ"

## ปัญหาปัจจุบัน

1. **Floor Objects** — ผังโต๊ะแสดงได้เฉพาะโต๊ะ ไม่มีวัตถุตกแต่ง (ห้องน้ำ, บันได, เคาน์เตอร์ ฯลฯ)
2. **Permission ไม่ครบ** — หน้า "จัดการตำแหน่ง" ขาด Module "จัดการโซน" + "วัตถุบนผัง" (ZonesController ใช้ `Permissions.Table.*` ร่วมกับ TablesController)

---

## Phase 1: Backend — Permissions แยก Module

| Sub-task | สถานะ | รายละเอียด |
|----------|--------|-----------|
| 1.1 เพิ่ม Permission classes | ⬜ | Zone + FloorObject ใน Permissions.cs |
| 1.2 อัพเดต ZonesController | ⬜ | `Permissions.Table.*` → `Permissions.Zone.*` |
| 1.3 สร้าง Migration seed | ⬜ | ModuleId 26,27 + AuthorizeMatrixId 60-67 |
| 1.4 รัน database update | ⬜ | `dotnet ef database update` |

## Phase 2: Backend — Floor Object Entity + API

| Sub-task | สถานะ | รายละเอียด |
|----------|--------|-----------|
| 2.1 Enum | ⬜ | EFloorObjectType (7 ประเภท) |
| 2.2 Entity | ⬜ | TbFloorObject (id, zoneId?, type, label, posX, posY) |
| 2.3 Configuration | ⬜ | TbFloorObjectConfiguration |
| 2.4 DbContext | ⬜ | เพิ่ม DbSet + Configuration |
| 2.5 Repository | ⬜ | IFloorObjectRepository + Impl |
| 2.6 UnitOfWork | ⬜ | เพิ่ม FloorObjects property |
| 2.7 Models | ⬜ | Create/Update/Response/Mapper/Positions |
| 2.8 Service | ⬜ | IFloorObjectService + Impl (5 methods) |
| 2.9 Controller | ⬜ | FloorObjectsController (5 endpoints) |
| 2.10 DI | ⬜ | Program.cs registration |
| 2.11 Migration | ⬜ | AddFloorObjectTable |
| 2.12 Database update | ⬜ | `dotnet ef database update` |

## Phase 3: Frontend (หลัง gen-api)

| Sub-task | สถานะ | รายละเอียด |
|----------|--------|-----------|
| 3.1 Sidebar | ⬜ | "จัดการโซน" → zone.read |
| 3.2 Routes | ⬜ | Zone routes → zone.* permissions |
| 3.3 Zone components | ⬜ | เปลี่ยน permission check |
| 3.4 Floor Plan canvas | ⬜ | เพิ่ม floor objects rendering |
| 3.5 FloorObjectDialog | ⬜ | Dialog เพิ่ม/แก้ไข/ลบ |
| 3.6 Module declarations | ⬜ | เพิ่ม declarations |
| 3.7 Build test | ⬜ | ng build |
