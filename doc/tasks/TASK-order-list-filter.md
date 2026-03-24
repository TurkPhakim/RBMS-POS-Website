# TASK: ปรับ Filter หน้ารายการออเดอร์ (เพิ่ม Dropdown โซน/โต๊ะ)

> สร้าง: 2026-03-21 (อัพเดตรอบ 2)

## เป้าหมาย
ปรับปรุง Filter Section ของหน้ารายการออเดอร์ให้มี Dropdown โซน + โต๊ะ และจัดเรียง Layout ใหม่

## Layout ที่ตกลง

```
แถว 1: [ค้นหา (หมายเลข order)]  [Dropdown โซน]  [Dropdown โต๊ะ]
แถว 2: [Dropdown สถานะ]  [วันที่เริ่มต้น]  [วันที่สิ้นสุด]
```

## รายละเอียด

### Backend
- เพิ่ม `zoneId` parameter ใน `GetOrders` endpoint
- ไฟล์: `OrdersController.cs`, `IOrderService.cs`, `OrderService.cs`
- Filter: `query.Where(o => o.Table.ZoneId == zoneId.Value)`

### Frontend — สร้าง `table-dropdown` (shared/dropdowns/)
- Extends `DropdownBaseComponent`
- `@Input() zoneId` — เมื่อเปลี่ยน zone จะ reload options เฉพาะ zone นั้น
- ใช้ `TablesService.tablesGetTablesGet({ zoneId })` ดึงข้อมูล
- Map: `{ value: tableId, label: tableName }`

### Frontend — แก้ order-list
- ปรับ placeholder ค้นหา: "ค้นหาด้วยหมายเลขออเดอร์"
- เพิ่ม `zoneFilter`, `tableFilter` ใน component
- เมื่อเลือกโซน → ส่ง `zoneId` ไป API + filter dropdown โต๊ะ + reset tableFilter
- เมื่อเลือกโต๊ะ → ส่ง `tableId` ไป API

---

## Sub-tasks

### Phase 1: Backend
- ⬜ เพิ่ม `int? zoneId` ใน Controller, Interface, Service

### Phase 2: Frontend
- ⬜ สร้าง `table-dropdown` component
- ⬜ ลงทะเบียนใน `SharedModule`
- ⬜ แก้ `order-list.component.html` — ปรับ layout filter
- ⬜ แก้ `order-list.component.ts` — เพิ่ม zone/table filter logic

### Phase 3: gen-api + ทดสอบ
- ⬜ Restart Backend + ตรวจ Swagger
- ⬜ ให้ผู้ใช้รัน gen-api
- ⬜ ตรวจ generated params ว่ามี zoneId

---

## ประวัติ (รอบแรก — เสร็จแล้ว)
- ✅ เพิ่ม ZoneName, GuestType ใน OrderResponseModel
- ✅ อัพเดต OrderMapper + OrderService
- ✅ สร้าง OrderStatusDropdown
- ✅ แก้ Filter layout + ตาราง
