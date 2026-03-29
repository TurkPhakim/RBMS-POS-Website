# TASK: เพิ่มข้อมูลโต๊ะเชื่อมในหน้ารายละเอียดออเดอร์ + ปุ่มส่งครัวรายตัว

> สร้าง: 2026-03-28 | เสร็จ: 2026-03-28

## สรุป
เพิ่ม 3 ฟีเจอร์ในหน้า order-detail:
1. **Dropdown ฟิลเตอร์โต๊ะต้นทาง** — เมื่อมีการเชื่อมโต๊ะ แสดง dropdown กรองรายการตามโต๊ะต้นทาง
2. **Header แสดงโต๊ะแม่/ลูก** — บอกว่าโต๊ะแม่คือใคร โต๊ะลูกคือใคร
3. **ปุ่มส่งครัวรายแถว** — แถวที่สถานะ Pending มีปุ่มส่งครัวสำหรับรายการนั้น

---

## Phase 1: Backend

- ✅ 1.1 `OrderDetailResponseModel.cs` — เพิ่ม IsLinked, PrimaryTableName, SecondaryTableNames
- ✅ 1.2 `OrderService.GetOrderByIdAsync` — เพิ่ม EnrichLinkedTableInfoAsync (query TbTableLink)
- ✅ 1.3 `OrderService.SendItemToKitchenAsync` — ส่งรายการเดียวเข้าครัว
- ✅ 1.4 `IOrderService` — เพิ่ม SendItemToKitchenAsync
- ✅ 1.5 `OrdersController` — เพิ่ม endpoint POST items/{orderItemId}/send-kitchen

## Phase 2: gen-api
- ✅ 2.1 Restart BE + ตรวจ Swagger
- ✅ 2.2 ผู้ใช้รัน gen-api

## Phase 3: Frontend

- ✅ 3.1 สร้าง `source-table-dropdown/` — extends DropdownBaseComponent, รับ @Input tableNames
- ✅ 3.2 `order-detail.component.ts` — เพิ่ม sourceTableFilter, sourceTableNames computed, onSendItemToKitchen
- ✅ 3.3 `order-detail.component.html` — Header แสดงโต๊ะแม่/ลูก, Dropdown filter, ปุ่มส่งครัวรายตัว

## ไฟล์ที่แก้ไข

| # | ไฟล์ | การแก้ไข |
|---|------|---------|
| 1 | `OrderDetailResponseModel.cs` | เพิ่ม IsLinked, PrimaryTableName, SecondaryTableNames |
| 2 | `OrderService.cs` | แก้ GetOrderByIdAsync + เพิ่ม EnrichLinkedTableInfoAsync + SendItemToKitchenAsync |
| 3 | `IOrderService.cs` | เพิ่ม SendItemToKitchenAsync |
| 4 | `OrdersController.cs` | เพิ่ม endpoint SendItemToKitchen |
| 5 | `source-table-dropdown.component.ts` | สร้างใหม่ |
| 6 | `shared.module.ts` | เพิ่ม SourceTableDropdownComponent |
| 7 | `order-detail.component.ts` | เพิ่ม filter + method ส่งครัวรายตัว |
| 8 | `order-detail.component.html` | Header + Dropdown + ปุ่มส่งครัว |
