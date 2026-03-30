# TASK: เชื่อม Dashboard Overview กับ API จริง + Mock Mode Toggle

## สถานะ: ✅ เสร็จแล้ว

## เป้าหมาย
เชื่อม Dashboard Overview กับ API จริง โดยมี flag `USE_MOCK = true/false` สลับระหว่าง mock data กับ API จริง

## Design

### Mock Mode Toggle
- `const USE_MOCK = true;` ที่ด้านบนไฟล์ component
- `true` → ใช้ mock data (ดีไซน์เดิม)
- `false` → เรียก API จริง + transform data

### Image URL Pattern
- `TbMenu` มี `ImageFileId` → `TbFile`
- Frontend สร้าง URL: `${apiConfig.rootUrl}/api/admin/file/${fileId}`
- ถ้าไม่มีรูป → ใช้ placeholder

---

## Phase 1: Backend — เพิ่ม ImageFileId ใน TopSelling

### 1.1 ✅ TopSellingResponseModel.cs — เพิ่ม field
- เพิ่ม `public int? ImageFileId { get; set; }` ใน `TopSellingItemModel`
- ไฟล์: `Backend-POS/POS.Main/POS.Main.Business.Admin/Models/Dashboard/TopSellingResponseModel.cs`

### 1.2 ✅ DashboardService.cs — แก้ query
- หลัง query top 5 → fetch ImageFileId จาก TbMenu ด้วย MenuId
- ไฟล์: `Backend-POS/POS.Main/POS.Main.Business.Admin/Services/DashboardService.cs`

## Phase 2: gen-api
### 2.1 ✅ Restart Backend + ตรวจ Swagger + ให้ผู้ใช้รัน gen-api

## Phase 3: Frontend — เชื่อม API + Mock Toggle

### 3.1 ✅ dashboard-overview.component.ts — เพิ่ม USE_MOCK flag + API logic
- `const USE_MOCK = true;` ควบคุมโหมด
- ถ้า `USE_MOCK` → ใช้ mock data เหมือนเดิม
- ถ้า `!USE_MOCK` → เรียก API จริง + transform data:
  - KPI: `transformKpi()` — API selected/previous → format + calcChange
  - Kitchen: `transformKitchen()` — categoryType → icon/color config
  - Top Selling: `mapTopSellingItems()` — imageFileId → image URL หรือ placeholder
  - Peak Hours: `transformPeakHours()` — heightPercent + isPeak threshold 80%
  - Revenue Trend: `buildRevenueTrendFromApi()` — chart.js data
- API calls: `forkJoin` เรียก 3 API พร้อมกัน (overview + topSelling + peakHours)
- `loadOverviewOnly()` สำหรับ toggle trend days (เรียกแค่ overview API)

### 3.2 ✅ dashboard-overview.component.html — เพิ่ม @if guard
- KPI: `@if (kpiCards.length > 0)` ครอบ grid
- Kitchen: `@if (kitchenCards.length > 0)` ครอบ grid
- Podium: `@if (items.length >= 3)` ป้องกัน items[0/1/2] crash + `@else` แสดง "ยังไม่มีข้อมูล"
- 4th/5th: `@if (items.length > 3)` แสดงเฉพาะมีข้อมูล
- Peak Hours: `@if (peakHours.length > 0)` + `@else` แสดง "ยังไม่มีข้อมูล"

---

## ไฟล์ที่แก้
| ไฟล์ | การแก้ |
|------|--------|
| `TopSellingResponseModel.cs` | เพิ่ม ImageFileId |
| `DashboardService.cs` | fetch ImageFileId หลัง top 5 query |
| `dashboard-overview.component.ts` | USE_MOCK flag + API integration |
| `dashboard-overview.component.html` | @if guards |
