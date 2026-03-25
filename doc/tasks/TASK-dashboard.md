# TASK-dashboard — ระบบแดชบอร์ด (Phase 6)

> สร้าง: 2026-03-24 | REQ: [REQ-dashboard-system.md](../requirements/REQ-dashboard-system.md)

## สรุป

Dashboard สำหรับ Owner/Manager — 2 หน้า (Overview + Sales Report) ใช้ aggregate queries จาก entities ที่มีอยู่ ไม่ต้อง migration / ไม่ต้อง seed permission

---

## Design ที่ตกลงแล้ว

### API Endpoints (4 endpoints)
| Method | Route | Params | Response |
|--------|-------|--------|----------|
| GET | `/api/dashboard/overview` | `date?`, `days=7` | KPI selected+previous, kitchenBreakdown, revenueTrend |
| GET | `/api/dashboard/top-selling` | `date?`, `days=30` | food/beverage/dessert Top 5 |
| GET | `/api/dashboard/peak-hours` | `date?` | hours[] (hour, orderCount) |
| GET | `/api/dashboard/sales-report` | `from`, `to` | summary KPI, dailyBreakdown, categoryBreakdown, kitchenBreakdown |

### Key Decisions
- KPI "ยอดเฉลี่ย" = ยอดขาย / จำนวนออเดอร์ (per order ไม่ใช่ per bill)
- ออเดอร์แยกครัว = SUM(Quantity) by CategoryType (จำนวนรายการ ไม่ใช่ DISTINCT orders)
- ไม่มี channel breakdown (ลบแล้ว)
- Response fields: `averagePerOrder`, `itemCount` (ใน kitchenBreakdown)
- Chart Library: ng2-charts (Chart.js)
- Sidebar: parent + 2 children (ภาพรวม + รายงานยอดขาย)

### Overview Layout
```
Row 1: 4x KPI Cards (ยอดขาย, ออเดอร์, ลูกค้า, เฉลี่ย/ออเดอร์) + เปรียบเทียบ %
Row 2: 3x mini cards ออเดอร์แยกครัว (อาหาร/เครื่องดื่ม/ของหวาน)
Row 3: Revenue Trend Line Chart + toggle 7/30 วัน
Row 4: Top Selling 3x Horizontal Bar (grid 3 cols)
Row 5: Peak Hours Vertical Bar
```

### Sales Report Layout
```
Filter: 4 preset buttons + Custom DateRange + ปุ่ม "ค้นหา"
Row 1: 4x KPI Cards (ไม่มีเปรียบเทียบ %)
Row 2: Pie chart สัดส่วนยอดขาย + Kitchen Breakdown แนวตั้ง
Row 3: ตารางยอดขายรายวัน (p-table, client-side pagination)
```

---

## Phase 1: Backend

### Sub-task 1.1 — Response Models
- ✅ `Business.Admin/Models/Dashboard/DashboardOverviewResponseModel.cs`
- ✅ `Business.Admin/Models/Dashboard/TopSellingResponseModel.cs`
- ✅ `Business.Admin/Models/Dashboard/PeakHoursResponseModel.cs`
- ✅ `Business.Admin/Models/Dashboard/SalesReportResponseModel.cs`

### Sub-task 1.2 — IDashboardService Interface
- ✅ `Business.Admin/Interfaces/IDashboardService.cs`

### Sub-task 1.3 — DashboardService Implementation
- ✅ `Business.Admin/Services/DashboardService.cs`

### Sub-task 1.4 — DashboardController
- ✅ `RBMS.POS.WebAPI/Controllers/DashboardController.cs`

### Sub-task 1.5 — DI Registration
- ✅ `RBMS.POS.WebAPI/Program.cs` — เพิ่ม 1 บรรทัด

> **Build สำเร็จ**: 0 errors, 0 warnings

---

## Phase 2: gen-api

- ✅ Restart Backend + ตรวจ Swagger (4 endpoints + schemas ครบ)
- ✅ แจ้งผู้ใช้รัน `npm run gen-api` → ผู้ใช้ยืนยันเสร็จ
- ✅ ตรวจ generated files (DashboardService, models มี averagePerOrder + itemCount)

---

## Phase 3: Frontend

### Sub-task 3.1 — Setup
- ✅ `npm install ng2-charts chart.js` (v10.0.0 + v4.5.1, --legacy-peer-deps)
- ✅ ลบ placeholder เดิม (`features/dashboard/pages/dashboard/`)

### Sub-task 3.3 — KpiCardComponent
- ✅ `features/dashboard/components/kpi-card/kpi-card.component.ts` + `.html`

### Sub-task 3.4 — DashboardOverviewComponent
- ✅ `features/dashboard/pages/dashboard-overview/` (.ts + .html)

### Sub-task 3.5 — SalesReportComponent
- ✅ `features/dashboard/pages/sales-report/` (.ts + .html)

### Sub-task 3.6 — Module + Routing
- ✅ `dashboard.module.ts` — BaseChartDirective + provideCharts (ng2-charts v10)
- ✅ `dashboard-routing.module.ts` — เพิ่ม sales route

### Sub-task 3.7 — Sidebar
- ✅ `side-bar.component.ts` — Dashboard → parent + 2 children

### Sub-task 3.8 — อัพเดตเอกสาร
- ✅ `doc/architecture/database-api-reference.md` — เพิ่ม Dashboard API 4 endpoints

> **Frontend Build สำเร็จ**: 0 errors

---

## สถานะ: ✅ เสร็จสมบูรณ์ทุก Phase
