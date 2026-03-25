# TASK: ปรับ Checkout ใช้ Shared Service Charge Dropdown

> สร้าง: 2026-03-24

## สรุปงาน
เพิ่ม `ServiceChargeId` FK ใน `TbOrderBill` เพื่อ track ว่าใช้ service charge ตัวไหน
แล้วปรับหน้า checkout ให้ใช้ `<app-service-charge-dropdown>` แทน `<p-dropdown>` ตรง

## Phase 1: Backend — เพิ่ม ServiceChargeId FK

### Sub-task 1.1: แก้ Entity + Configuration
- ✅ `TbOrderBill.cs` — เพิ่ม `ServiceChargeId` (int?) + navigation `TbServiceCharge`
- ✅ `TbOrderBillConfiguration.cs` — เพิ่ม FK relationship `.OnDelete(SetNull)`

### Sub-task 1.2: Migration
- ✅ สร้าง migration `AddServiceChargeIdToOrderBill`
- ✅ รัน `dotnet ef database update`

### Sub-task 1.3: แก้ Service + Response
- ✅ `OrderService.UpdateBillChargesAsync` — บันทึก `bill.ServiceChargeId = request.ServiceChargeId`
- ✅ `OrderBillResponseModel` — เพิ่ม `ServiceChargeId` (int?)
- ✅ `OrderBillMapper.ToResponse` — map `ServiceChargeId`

### Sub-task 1.4: ลบ GetServiceChargeOptions (ไม่มีที่อื่นใช้)
- ✅ ลบ endpoint `GetServiceChargeOptions` ใน `OrdersController`
- ✅ ลบ `GetServiceChargeOptionsAsync` ใน `IOrderService` + `OrderService`
- ✅ ลบ `ServiceChargeOptionModel.cs`

## Phase 2: Frontend — ปรับ Checkout

### Sub-task 2.1: gen-api (ผู้ใช้รัน)
- ✅ Restart BE → ตรวจ Swagger → บอกผู้ใช้รัน gen-api
- ✅ ตรวจ generated files: `OrderBillResponseModel` มี `serviceChargeId`, ไม่มี `ServiceChargeOptionModel`

### Sub-task 2.2: ปรับ checkout component
- ✅ `checkout.component.ts` — ลบ `scOptions` signal, ลบ import `ServiceChargeOptionModel`, ลบ API call `ordersGetServiceChargeOptionsGet()`, ง่าย `syncScDropdown` ใช้ `bill.serviceChargeId` ตรง
- ✅ `checkout.component.html` — แทน `<p-dropdown>` ด้วย `<app-service-charge-dropdown>`

## ไฟล์ที่แก้

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `TbOrderBill.cs` | เพิ่ม `ServiceChargeId` FK |
| `TbOrderBillConfiguration.cs` | เพิ่ม relationship config |
| Migration `AddServiceChargeIdToOrderBill` | เพิ่ม column + FK + index |
| `OrderService.cs` | บันทึก `ServiceChargeId` ใน UpdateBillCharges, ลบ `GetServiceChargeOptionsAsync` |
| `IOrderService.cs` | ลบ `GetServiceChargeOptionsAsync` |
| `OrderBillResponseModel.cs` | เพิ่ม `ServiceChargeId` |
| `OrderBillMapper.cs` | map `ServiceChargeId` |
| `OrdersController.cs` | ลบ `GetServiceChargeOptions` endpoint |
| `ServiceChargeOptionModel.cs` | **ลบไฟล์** |
| `checkout.component.html` | ใช้ `<app-service-charge-dropdown>` แทน `<p-dropdown>` |
| `checkout.component.ts` | ลบ `scOptions`, ลบ API call, ง่าย `syncScDropdown` |
