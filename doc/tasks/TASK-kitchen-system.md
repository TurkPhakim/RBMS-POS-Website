# TASK: Phase 3A — Kitchen Display System (KDS)

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-20
**วันที่เสร็จ**: 2026-03-20
**REQ**: [REQ-kitchen-system.md](../requirements/REQ-kitchen-system.md)

> หน้าจอครัว real-time — พนักงานครัวรับงาน (เริ่มทำ) + ทำเสร็จ (พร้อมเสิร์ฟ) + ดู items จัดกลุ่มตาม Order
> แยก 3 Sub-Module (ครัวอาหาร / ครัวเครื่องดื่ม / ครัวของหวาน) พร้อม Permission แยกอิสระ

---

## เช็คลิสต์

### Backend

- [x] สร้าง `IKitchenService` + `KitchenService`
  - [x] `GetKitchenItemsAsync(categoryType, includeReady)` — query items Sent/Preparing group by Order
  - [x] `StartPreparingAsync(orderItemIds)` — batch: Sent → Preparing + CookingStartedAt
  - [x] `MarkReadyAsync(orderItemIds)` — batch: Preparing → Ready + ReadyAt
- [x] สร้าง Response/Request Models (Kitchen/)
  - [x] `BatchItemRequestModel` เพิ่ม `CategoryType` สำหรับ dynamic permission check
- [x] สร้าง `KitchenController` — dynamic permission check ตาม `categoryType` (ตาม pattern MenuItemsController)
- [x] Register DI ใน Program.cs
- [x] แยก `Permissions.cs` — `KitchenFood`, `KitchenBeverage`, `KitchenDessert` (read + update)
- [x] Migration `SplitKitchenPermissionsByCategory` — seed 3 modules + 6 AMs + migrate grants + ลบ module เดิม
- [x] `dotnet build` ผ่าน + `dotnet ef database update`

### gen-api

- [x] Restart Backend + ตรวจ Swagger
- [x] ผู้ใช้รัน `npm run gen-api`
- [x] ตรวจสอบ generated files

### Frontend

- [x] อัพเดต `OrderHubService` — เพิ่ม kitchen SignalR events + group management
- [x] สร้าง `KitchenStateService` — state management (signals) + real-time
  - [x] เพิ่ม `categoryType` param ใน `startPreparing()` / `markReady()`
- [x] แยก 3 child routes — `/kitchen-display/food`, `/beverage`, `/dessert` + PermissionGuard
- [x] อัพเดต Sidebar — parent "ครัว" + 3 children (ครัวอาหาร, ครัวเครื่องดื่ม, ครัวของหวาน)
- [x] อัพเดต `layout-routing` — permissions array 3 ตัว
- [x] อัพเดต `kitchen-display` component — ลบ category tabs, อ่าน `categoryType` + `updatePermission` จาก route data
- [x] `ng build` ผ่าน

### เอกสาร

- [x] อัพเดต Task file สถานะ
- [x] อัพเดต database-api-reference.md

---

## Permissions

| Module Code | ModuleId | Permission Path | AM ID |
|---|---|---|---|
| kitchen-food | 28 | kitchen-food.read | 68 |
| kitchen-food | 28 | kitchen-food.update | 69 |
| kitchen-beverage | 29 | kitchen-beverage.read | 70 |
| kitchen-beverage | 29 | kitchen-beverage.update | 71 |
| kitchen-dessert | 30 | kitchen-dessert.read | 72 |
| kitchen-dessert | 30 | kitchen-dessert.update | 73 |

---

## Phase 3B — Menu View (มุมมองตามเมนู)

- [x] เพิ่ม `viewMode` signal + localStorage (`kds-view-mode`)
- [x] เพิ่ม `pendingMenuGroups` computed — group by `menuId + options combination`
- [x] เพิ่ม Menu View template — card ต่อเมนู, rows ต่อโต๊ะ, batch actions
- [x] Toggle buttons "ตามออเดอร์" / "ตามเมนู" ใน Page Header
- [x] Per-row action buttons + card-level batch buttons (เริ่มทำทั้งหมด / เสร็จทั้งหมด)
- [x] `ng build` ผ่าน
- [x] อัพเดต Task file

---

## สิ่งที่เลื่อนไป

- Sound alerts (placeholder)
- Expo View (รวมทุกสถานี)
- Ready section collapse/expand + alert timer

---

## ไฟล์ที่สร้าง/แก้ไข

### Backend
- `POS.Main.Business.Order/Interfaces/IKitchenService.cs` — interface
- `POS.Main.Business.Order/Services/KitchenService.cs` — service
- `POS.Main.Business.Order/Models/Kitchen/KitchenOrderModel.cs` — response models
- `POS.Main.Business.Order/Models/Kitchen/BatchItemRequestModel.cs` — request model (+ CategoryType)
- `RBMS.POS.WebAPI/Controllers/KitchenController.cs` — 3 endpoints + dynamic permission check
- `RBMS.POS.WebAPI/Program.cs` — DI registration
- `POS.Main.Core/Constants/Permissions.cs` — แยก KitchenFood / KitchenBeverage / KitchenDessert
- `Migrations/SplitKitchenPermissionsByCategory.cs` — seed permissions ใหม่

### Frontend
- `core/services/order-hub.service.ts` — อัพเดต: group management + kitchen events
- `core/services/kitchen-state.service.ts` — สร้างใหม่ (+ categoryType param)
- `features/kitchen-display/kitchen-display-routing.module.ts` — 3 child routes
- `features/kitchen-display/pages/kitchen-display/kitchen-display.component.ts` — rewrite (route data)
- `features/kitchen-display/pages/kitchen-display/kitchen-display.component.html` — ลบ tabs
- `features/table/pages/floor-plan/floor-plan.component.ts` — อัพเดต start('floor')/leaveGroup('floor')
- `layouts/layout-routing.module.ts` — permissions array
- `shared/components/side-bar/side-bar.component.ts` — parent + 3 children
