# TASK: เพิ่มการคำนวณกำไรขั้นต้นใน Dashboard

> สร้าง: 2026-03-31

## สถานะ: 🔵 กำลังดำเนินการ

## Context

ระบบเก็บราคาต้นทุน (`CostPrice`) ใน `TbMenu` + `TbOptionItem` อยู่แล้ว
- `TbOrderItem.CostPrice` snapshot จาก Menu ตอนสร้าง order ✅
- `TbOrderItemOption` ยังไม่มี CostPrice → ต้องเพิ่ม
- Dashboard ยังไม่มีข้อมูลกำไร → ต้องเพิ่ม

## สูตรคำนวณ

```
ต้นทุนต่อ item = (Menu CostPrice + SUM(Option CostPrices)) × Quantity
ต้นทุนรวม = SUM(ต้นทุนแต่ละ item) — ไม่รวม Voided/Cancelled
กำไรขั้นต้น = ยอดขาย - ต้นทุนรวม
อัตรากำไร % = (กำไร ÷ ยอดขาย) × 100
```

---

## Phase 1: Entity + Migration (Backend)

- ✅ 1.1 `TbOrderItemOption.cs` — เพิ่ม `CostPrice` property
- ✅ 1.2 `TbOrderItemOptionConfiguration.cs` — เพิ่ม config `decimal(10,2)`
- ✅ 1.3 `OrderService.cs` — snapshot `optItem.CostPrice` ตอนสร้าง option
- ✅ 1.4 สร้าง Migration + รัน `dotnet ef database update`

## Phase 2: Dashboard API (Backend)

- ✅ 2.1 `DashboardOverviewResponseModel.cs` — เพิ่ม `TotalCost`, `GrossProfit`, `GrossMarginPercent` ใน `DashboardKpiModel`
- ✅ 2.2 `SalesReportResponseModel.cs` — เพิ่ม `TotalCost`, `GrossProfit` ใน `DailyBreakdownModel`
- ✅ 2.3 `DashboardService.cs` — เพิ่ม `GetTotalCostAsync` helper + แก้ KPI + DailyBreakdown methods

## Phase 3: Verification

- ✅ 3.1 Restart Backend + ตรวจ Swagger response
- ✅ 3.2 ให้ผู้ใช้รัน `npm run gen-api`

---

## ไฟล์ที่แก้

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `POS.Main.Dal/Entities/Order/TbOrderItemOption.cs` | เพิ่ม CostPrice property |
| `POS.Main.Dal/EntityConfigurations/TbOrderItemOptionConfiguration.cs` | เพิ่ม CostPrice config |
| `POS.Main.Business.Order/Services/OrderService.cs` | snapshot CostPrice ตอนสร้าง option |
| `POS.Main.Business.Admin/Models/Dashboard/DashboardOverviewResponseModel.cs` | เพิ่ม fields ใน KpiModel |
| `POS.Main.Business.Admin/Models/Dashboard/SalesReportResponseModel.cs` | เพิ่ม fields ใน DailyBreakdownModel |
| `POS.Main.Business.Admin/Services/DashboardService.cs` | เพิ่ม cost calculation queries |
