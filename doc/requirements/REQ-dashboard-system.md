# REQ-dashboard-system — ระบบแดชบอร์ด

> อัพเดตล่าสุด: 2026-03-19

---

## สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Dashboard Overview Page](#2-dashboard-overview-page)
3. [KPI Cards](#3-kpi-cards)
4. [กราฟยอดขาย (Revenue Trend)](#4-กราฟยอดขาย-revenue-trend)
5. [เมนูขายดี (Top Selling Menus)](#5-เมนูขายดี-top-selling-menus)
6. [ช่วงเวลาขายดี (Peak Hours)](#6-ช่วงเวลาขายดี-peak-hours)
7. [Sales Report Page](#7-sales-report-page)
8. [API Endpoints](#8-api-endpoints)
9. [Backend Structure](#9-backend-structure)
10. [Frontend Structure](#10-frontend-structure)
11. [Permissions](#11-permissions)
12. [จุดเชื่อมต่อระบบอื่น](#12-จุดเชื่อมต่อระบบอื่น)
13. [UserFlow](#13-userflow)
14. [Edge Cases & Validation](#14-edge-cases--validation)
15. [สรุปไฟล์ที่ต้องสร้าง/แก้ไข](#15-สรุปไฟล์ที่ต้องสร้างแก้ไข)

---

## 1. ภาพรวม

### 1.1 บทนำ

Dashboard สำหรับ Owner/Manager ดูสรุปภาพรวมยอดขาย, ออเดอร์, ลูกค้า, เมนูขายดี ของร้านอาหาร

- **2 หน้า**: Dashboard Overview + Sales Report
- **Chart Library**: ng2-charts (Chart.js wrapper สำหรับ Angular) — เบา, ง่าย, ไม่มีค่าลิขสิทธิ์
- **Data refresh**: โหลดตอนเปิดหน้า + ปุ่ม Refresh manual (ไม่ใช้ SignalR)
- **ไม่สร้าง entities ใหม่** — Dashboard ใช้ aggregate queries จาก entities ของ Order/Payment System

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน | ที่ต้องการ |
|--------|----------|-----------|
| Dashboard | Placeholder ว่าง | 2 หน้า: Overview + Sales Report |
| KPI Cards | ไม่มี | 4 KPI + เปรียบเทียบวันก่อนหน้า |
| กราฟ | ไม่มี | Line (trend), Bar (top selling, peak hours), Pie (category, channel) |
| Chart Library | ไม่มี | ng2-charts (Chart.js) |
| Date Filter | ไม่มี | Overview = single date, Sales Report = date range |

### 1.3 ขอบเขต

**ทำ (Phase 1):**
- KPI cards (ยอดขาย, ออเดอร์, ลูกค้า, เฉลี่ยต่อบิล) + เปรียบเทียบวันก่อนหน้า
- Revenue Trend (line chart 7/30 วัน)
- เมนูขายดี Top 5 แยก 3 หมวด (อาหาร/เครื่องดื่ม/ของหวาน)
- ช่วงเวลาขายดี (hourly bar chart)
- Sales Report (period filter + KPI summary + pie charts + daily table)
- Date filter ทั้ง 2 หน้า

**ไม่ทำ (Phase 2 / อนาคต):**
- Export PDF/Excel
- Multi-branch comparison
- Inventory/Cost report / กำไรขั้นต้น (อ้างอิง [REQ-menu-system](REQ-menu-system.md) §3.4)
- Real-time auto-refresh (SignalR)
- Staff performance report

### 1.4 ความเป็นเจ้าของ

| เรื่อง | เจ้าของ |
|--------|---------|
| TbOrder, TbOrderItem, TbOrderBill entities | [REQ-order-system](REQ-order-system.md) |
| TbPayment entity | [REQ-payment-system](REQ-payment-system.md) |
| TbMenu (ชื่อ/ราคา) | [REQ-menu-system](REQ-menu-system.md) |
| **DashboardController + DashboardService** | **REQ-dashboard-system** (เอกสารนี้) |
| **Response Models** | **REQ-dashboard-system** |
| **Frontend Dashboard pages** | **REQ-dashboard-system** |

---

## 2. Dashboard Overview Page

### 2.1 Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: แดชบอร์ด > ภาพรวม                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  วันที่: [19/03/2026 ▼]                               [Refresh]   │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ ยอดขาย   │  │ ออเดอร์  │  │ ลูกค้า   │  │ เฉลี่ย/บิล│          │
│  │ ฿12,450  │  │ 28      │  │ 45       │  │ ฿444.64  │          │
│  │ ▲ +15.2% │  │ ▲ +7.7% │  │ ▼ -3.2%  │  │ ▲ +6.9%  │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ยอดขายย้อนหลัง                       [7 วัน] [30 วัน]    │    │
│  │                                                            │    │
│  │  ฿│     ╱╲                    ╱╲                           │    │
│  │   │   ╱    ╲      ╱╲       ╱    ╲      ╱                  │    │
│  │   │ ╱        ╲  ╱    ╲   ╱        ╲  ╱                    │    │
│  │   │╱          ╲╱        ╲╱          ╲╱                     │    │
│  │   └──┬────┬────┬────┬────┬────┬────┬──►                    │    │
│  │     13   14   15   16   17   18   19                       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────┐┌──────────────────┐┌──────────────────┐     │
│  │ อาหารขายดี Top 5 ││ เครื่องดื่ม Top5  ││ ของหวาน Top 5    │     │
│  │                   ││                   ││                   │     │
│  │ ข้าวผัดกุ้ง █████ ││ ชาเขียว    █████ ││ ไอศกรีม    █████ │     │
│  │ ต้มยำกุ้ง  ████  ││ กาแฟเย็น   ████  ││ เค้ก       ████  │     │
│  │ แกงเขียว   ███   ││ น้ำส้ม     ███   ││ บัวลอย     ███   │     │
│  │ ผัดไทย     ██    ││ สมูทตี้    ██    ││ ขนมปัง     ██    │     │
│  │ ส้มตำ      █     ││ ชามะนาว   █     ││ วาฟเฟิล    █     │     │
│  └──────────────────┘└──────────────────┘└──────────────────┘     │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ช่วงเวลาขายดี                                             │    │
│  │                                                            │    │
│  │  จำนวน│      ██                                            │    │
│  │  ออเดอร์│  ██ ██ ██                                        │    │
│  │       │██ ██ ██ ██ ██                                      │    │
│  │       │██ ██ ██ ██ ██ ██ ██                                │    │
│  │       └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──►               │    │
│  │         10  11  12  13  14  15  16  17  18  19  20  21     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Layout

- **Header**: Date picker (PrimeNG Calendar, default = วันนี้) + ปุ่ม Refresh
- **Row 1**: 4 KPI Cards (grid 4 columns, responsive → 2 columns บน tablet, 1 column บน mobile)
- **Row 2**: Revenue Trend Line Chart (full width) พร้อม toggle 7/30 วัน
- **Row 3**: Top Selling 3 Horizontal Bar Charts (grid 3 columns → 1 column บน mobile)
- **Row 4**: Peak Hours Vertical Bar Chart (full width)

### 2.3 Date Filter บน Overview

- เปลี่ยนวัน → API call ใหม่ → KPI + Peak Hours อัพเดตตามวันที่เลือก
- Revenue Trend: 7/30 วันย้อนหลังจากวันที่เลือก (ไม่ใช่จากวันนี้)
- Top Selling: 30 วันย้อนหลังจากวันที่เลือก
- เปรียบเทียบ %: เทียบกับวันก่อนหน้าวันที่เลือก (ไม่ใช่เสมอเทียบกับเมื่อวาน)

---

## 3. KPI Cards

### 3.1 ข้อมูล KPI

| KPI | Icon | Data Source | สูตร |
|-----|------|-----------|------|
| ยอดขาย | `pi pi-dollar` | TbOrderBill | `SUM(GrandTotal) WHERE Status=PAID AND DATE(PaidAt)=selectedDate` |
| จำนวนออเดอร์ | `pi pi-shopping-cart` | TbOrder | `COUNT(*) WHERE DATE(CreatedAt)=selectedDate AND Status NOT IN (CANCELLED)` |
| จำนวนลูกค้า | `pi pi-users` | TbOrder | `SUM(GuestCount) WHERE DATE(CreatedAt)=selectedDate AND Status NOT IN (CANCELLED)` |
| ยอดเฉลี่ยต่อบิล | `pi pi-chart-bar` | คำนวณ | ยอดขาย / จำนวนออเดอร์ (ถ้า 0 → แสดง "฿0") |

### 3.2 เปรียบเทียบวันก่อนหน้า

- คำนวณ KPI ชุดเดียวกันสำหรับวันก่อนหน้า (selectedDate - 1)
- `changePercent = ((selected - previous) / previous) * 100`
- ถ้าวันก่อนหน้า = 0 → แสดง "ไม่มีข้อมูลเปรียบเทียบ"
- ถ้าบวก → สี success + `pi pi-arrow-up`
- ถ้าลบ → สี danger + `pi pi-arrow-down`

### 3.3 Design

- Card: `bg-surface-card rounded-xl p-4`
- Value: `text-2xl font-bold`
- Label: `text-sm text-surface-sub`
- Comparison badge: `text-sm` + `text-success` หรือ `text-danger`

---

## 4. กราฟยอดขาย (Revenue Trend)

- **Chart type**: Line chart (ng2-charts)
- **Toggle**: 7 วัน (default) / 30 วัน — ย้อนหลังจากวันที่เลือก
- **X-axis**: วันที่ (format: DD/MM)
- **Y-axis**: ยอดขาย (บาท)
- **Data**: `SUM(TbOrderBill.GrandTotal) WHERE Status=PAID GROUP BY DATE(PaidAt)`
- **Line color**: `#f97316` (primary)
- **Fill**: gradient ส้มอ่อน (opacity 0.1)
- **Tooltip**: วันที่ + ยอดขาย format สกุลเงิน

---

## 5. เมนูขายดี (Top Selling Menus)

> ย้ายมาจาก [REQ-order-system](REQ-order-system.md) §1.3 "รองรับ Dashboard เมนูขายดี (GROUP BY CategoryType)"

- **Chart type**: Horizontal Bar Chart × 3 ชุด
- **3 หมวด**: อาหาร (CategoryType=1) / เครื่องดื่ม (CategoryType=2) / ของหวาน (CategoryType=3)
- **Top 5** per category
- **Period**: 30 วันย้อนหลังจากวันที่เลือก
- **Data**:
  ```sql
  SELECT TOP 5 MenuNameThai, SUM(Quantity)
  FROM TbOrderItem
  WHERE Status NOT IN (VOIDED, CANCELLED)
    AND CategoryType = @categoryType
    AND CreatedAt >= @selectedDate - 30
  GROUP BY MenuId, MenuNameThai
  ORDER BY SUM(Quantity) DESC
  ```
- **แสดง**: ชื่อเมนู (ไทย) + จำนวนชิ้นที่ขาย
- **สี bar**:
  - อาหาร: `#f97316` (primary)
  - เครื่องดื่ม: `#14b8a6` (success)
  - ของหวาน: `#fbbf24` (warning)
- **อันดับ 1**: badge "ขายดีที่สุด"

---

## 6. ช่วงเวลาขายดี (Peak Hours)

- **Chart type**: Vertical Bar Chart
- **Data**: `COUNT(TbOrder) WHERE DATE(CreatedAt)=selectedDate GROUP BY HOUR(CreatedAt)`
- **X-axis**: ชั่วโมง (แสดงเฉพาะชั่วโมงที่มีข้อมูล)
- **Y-axis**: จำนวนออเดอร์
- **Bar color**: `#f97316` (primary) — ชั่วโมงสูงสุดใช้ `#ea580c` (primary-dark)
- **Tooltip**: "{HH}:00 - {HH+1}:00 | {count} ออเดอร์"

---

## 7. Sales Report Page

### 7.1 Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: แดชบอร์ด > รายงานยอดขาย                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ช่วงเวลา: [วันนี้] [สัปดาห์นี้] [เดือนนี้] [ไตรมาสนี้]   │    │
│  │  Custom: [DD/MM/YYYY] ถึง [DD/MM/YYYY]          [ค้นหา]   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ ยอดขาย   │  │ ออเดอร์  │  │ ลูกค้า   │  │ เฉลี่ย/บิล│          │
│  │ ฿185,600 │  │ 412     │  │ 680      │  │ ฿450.49  │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                    │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │ สัดส่วนยอดขาย          │  │ ช่องทางการสั่ง          │           │
│  │ ตามหมวดหมู่             │  │                        │           │
│  │     ╭────╮             │  │     ╭────╮             │           │
│  │   ╱ อาหาร ╲            │  │   ╱  Staff  ╲          │           │
│  │  │  60%    │           │  │  │  65%      │         │           │
│  │   ╲ เครื่อง ╱           │  │   ╲ Customer ╱         │           │
│  │     ╰────╯             │  │     ╰────╯             │           │
│  │  ของหวาน 15%           │  │                        │           │
│  └────────────────────────┘  └────────────────────────┘           │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ยอดขายรายวัน                                               │    │
│  │  ┌────────┬──────────┬────────┬────────┬──────────┐        │    │
│  │  │ วันที่  │ ยอดขาย   │ ออเดอร์ │ ลูกค้า │ เฉลี่ย/บิล│        │    │
│  │  ├────────┼──────────┼────────┼────────┼──────────┤        │    │
│  │  │ 19/03  │ ฿12,450  │   28   │   45   │ ฿444.64  │        │    │
│  │  │ 18/03  │ ฿10,800  │   26   │   42   │ ฿415.38  │        │    │
│  │  │ 17/03  │ ฿15,200  │   35   │   58   │ ฿434.29  │        │    │
│  │  └────────┴──────────┴────────┴────────┴──────────┘        │    │
│  │  [Pagination: 1 - 7 of 30]                                 │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 Period Filter

- **Preset buttons**: วันนี้ / สัปดาห์นี้ / เดือนนี้ / ไตรมาสนี้
- **Custom range**: 2 DatePicker พร้อม `[minDate]` validation (`linkDateRange`)
- กดปุ่ม "ค้นหา" → เรียก API ใหม่ → ข้อมูลทั้งหมดเปลี่ยน
- **Max range**: 365 วัน

### 7.3 KPI Summary

- 4 KPI cards เหมือน Overview แต่ **ไม่มีเปรียบเทียบ %** (เพราะ period ต่างกัน)
- แสดงผลรวมสำหรับ period ที่เลือก

### 7.4 Pie chart — สัดส่วนยอดขายตามหมวดหมู่

- **Data**: `SUM(TotalPrice) FROM TbOrderItem WHERE Status NOT IN (VOIDED, CANCELLED) GROUP BY CategoryType`
- **3 slices**: อาหาร (primary) / เครื่องดื่ม (success) / ของหวาน (warning)
- แสดง % + ยอดเงิน

### 7.5 Pie chart — ช่องทางการสั่ง

- **Data**: จำแนกจาก `TbOrderItem.OrderedBy`:
  - `"staff:*"` = พนักงานสั่ง
  - `"customer:*"` = ลูกค้าสั่งเอง (Self-Order) — ดู [REQ-self-order-system](REQ-self-order-system.md) §4.2
- **2 slices**: พนักงานสั่ง (primary) / ลูกค้าสั่งเอง (#60A5FA)

### 7.6 ตารางยอดขายรายวัน

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| วันที่ | `w-[120px]` | DD/MM/YYYY |
| ยอดขาย | `w-[140px]` | format สกุลเงิน |
| จำนวนออเดอร์ | `w-[120px]` | centered |
| จำนวนลูกค้า | `w-[120px]` | centered |
| เฉลี่ยต่อบิล | `w-[140px]` | format สกุลเงิน |

Pagination: `[paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"`

---

## 8. API Endpoints

**Controller**: `DashboardController` — ใช้ `[PermissionAuthorize(Permissions.Dashboard.Read)]` ทุก endpoint

### 8.1 รายการ Endpoints

| Method | Route | Query Params | รายละเอียด |
|--------|-------|-------------|-----------|
| GET | `/api/dashboard/overview` | `date` (default=today) | KPI cards + เปรียบเทียบวันก่อนหน้า + revenue trend |
| GET | `/api/dashboard/top-selling` | `date`, `days` (default=30) | เมนูขายดี Top 5 แยก 3 หมวด |
| GET | `/api/dashboard/peak-hours` | `date` | จำนวนออเดอร์รายชั่วโมง |
| GET | `/api/dashboard/sales-report` | `from`, `to` | Summary + daily breakdown + category breakdown + channel breakdown |

### 8.2 Response Models

**GET /api/dashboard/overview:**

```json
{
  "status": "success",
  "result": {
    "selected": {
      "totalSales": 12450.00,
      "orderCount": 28,
      "guestCount": 45,
      "averagePerBill": 444.64
    },
    "previous": {
      "totalSales": 10800.00,
      "orderCount": 26,
      "guestCount": 46,
      "averagePerBill": 415.38
    },
    "revenueTrend": [
      { "date": "2026-03-13", "totalSales": 9500.00 },
      { "date": "2026-03-14", "totalSales": 11200.00 },
      { "date": "2026-03-15", "totalSales": 8800.00 },
      { "date": "2026-03-16", "totalSales": 13400.00 },
      { "date": "2026-03-17", "totalSales": 15200.00 },
      { "date": "2026-03-18", "totalSales": 10800.00 },
      { "date": "2026-03-19", "totalSales": 12450.00 }
    ]
  }
}
```

**GET /api/dashboard/top-selling:**

```json
{
  "status": "success",
  "result": {
    "food": [
      { "menuId": 1, "menuName": "ข้าวผัดกุ้ง", "totalQuantity": 85 },
      { "menuId": 2, "menuName": "ต้มยำกุ้ง", "totalQuantity": 72 },
      { "menuId": 3, "menuName": "แกงเขียวหวาน", "totalQuantity": 58 },
      { "menuId": 4, "menuName": "ผัดไทย", "totalQuantity": 45 },
      { "menuId": 5, "menuName": "ส้มตำ", "totalQuantity": 38 }
    ],
    "beverage": [
      { "menuId": 10, "menuName": "ชาเขียว", "totalQuantity": 120 },
      { "menuId": 11, "menuName": "กาแฟเย็น", "totalQuantity": 95 },
      { "menuId": 12, "menuName": "น้ำส้มคั้น", "totalQuantity": 68 },
      { "menuId": 13, "menuName": "สมูทตี้", "totalQuantity": 42 },
      { "menuId": 14, "menuName": "ชามะนาว", "totalQuantity": 30 }
    ],
    "dessert": [
      { "menuId": 20, "menuName": "ไอศกรีม", "totalQuantity": 55 },
      { "menuId": 21, "menuName": "เค้กช็อกโกแลต", "totalQuantity": 40 },
      { "menuId": 22, "menuName": "บัวลอย", "totalQuantity": 28 },
      { "menuId": 23, "menuName": "ขนมปังปิ้ง", "totalQuantity": 22 },
      { "menuId": 24, "menuName": "วาฟเฟิล", "totalQuantity": 18 }
    ]
  }
}
```

**GET /api/dashboard/peak-hours:**

```json
{
  "status": "success",
  "result": {
    "hours": [
      { "hour": 10, "orderCount": 3 },
      { "hour": 11, "orderCount": 5 },
      { "hour": 12, "orderCount": 8 },
      { "hour": 13, "orderCount": 6 },
      { "hour": 14, "orderCount": 2 },
      { "hour": 17, "orderCount": 4 },
      { "hour": 18, "orderCount": 7 },
      { "hour": 19, "orderCount": 9 },
      { "hour": 20, "orderCount": 5 },
      { "hour": 21, "orderCount": 3 }
    ]
  }
}
```

**GET /api/dashboard/sales-report:**

```json
{
  "status": "success",
  "result": {
    "summary": {
      "totalSales": 185600.00,
      "orderCount": 412,
      "guestCount": 680,
      "averagePerBill": 450.49
    },
    "dailyBreakdown": [
      {
        "date": "2026-03-19",
        "totalSales": 12450.00,
        "orderCount": 28,
        "guestCount": 45,
        "averagePerBill": 444.64
      },
      {
        "date": "2026-03-18",
        "totalSales": 10800.00,
        "orderCount": 26,
        "guestCount": 42,
        "averagePerBill": 415.38
      }
    ],
    "categoryBreakdown": [
      { "categoryType": 1, "categoryName": "อาหาร", "totalSales": 111360.00, "percentage": 60.0 },
      { "categoryType": 2, "categoryName": "เครื่องดื่ม", "totalSales": 46400.00, "percentage": 25.0 },
      { "categoryType": 3, "categoryName": "ของหวาน", "totalSales": 27840.00, "percentage": 15.0 }
    ],
    "channelBreakdown": [
      { "channel": "staff", "channelName": "พนักงานสั่ง", "orderCount": 268, "percentage": 65.0 },
      { "channel": "customer", "channelName": "ลูกค้าสั่งเอง", "orderCount": 144, "percentage": 35.0 }
    ]
  }
}
```

---

## 9. Backend Structure

### 9.1 ไฟล์ที่ต้องสร้าง

| ไฟล์ | หมายเหตุ |
|------|----------|
| `RBMS.POS.WebAPI/Controllers/DashboardController.cs` | 4 endpoints, inherit BaseController |
| `POS.Main.Business.Admin/Interfaces/IDashboardService.cs` | Interface |
| `POS.Main.Business.Admin/Services/DashboardService.cs` | Aggregate queries |
| `POS.Main.Business.Admin/Models/Dashboard/DashboardOverviewResponseModel.cs` | Overview DTO |
| `POS.Main.Business.Admin/Models/Dashboard/TopSellingResponseModel.cs` | Top selling DTO |
| `POS.Main.Business.Admin/Models/Dashboard/PeakHoursResponseModel.cs` | Peak hours DTO |
| `POS.Main.Business.Admin/Models/Dashboard/SalesReportResponseModel.cs` | Sales report DTO |

> วาง Dashboard service ใน `POS.Main.Business.Admin` (ไม่สร้าง Business module ใหม่) เพราะ Dashboard เป็น read-only aggregation

### 9.2 หมายเหตุสำคัญ

- **ไม่สร้าง entity ใหม่ / ไม่ต้อง migration** — Dashboard ใช้ aggregate queries จาก repositories ที่มีอยู่
- **Dependencies**: DashboardService ต้องรอจนกว่า Order/Payment entities implement เสร็จก่อน
- ใช้ `AsNoTracking` ทุก query เพราะเป็น read-only
- ใช้ `BaseResponseModel<T>` ครอบ response ทุก endpoint

---

## 10. Frontend Structure

### 10.1 Packages

```bash
npm install ng2-charts chart.js
```

### 10.2 Routing

| Route | Component | Permission |
|-------|-----------|-----------|
| `/dashboard` | DashboardOverviewComponent | `dashboard.view.read` |
| `/dashboard/sales` | SalesReportComponent | `dashboard.view.read` |

### 10.3 Sidebar

เปลี่ยนจาก single item เป็น parent + 2 children:

```
แดชบอร์ด (icon: dashboard)
├── ภาพรวม (icon: chart-pie) → /dashboard
└── รายงานยอดขาย (icon: chart-bar) → /dashboard/sales
```

### 10.4 Components

| Component | ที่อยู่ | หมายเหตุ |
|-----------|--------|----------|
| DashboardOverviewComponent | `features/dashboard/pages/dashboard-overview/` | แทนที่ placeholder เดิม |
| SalesReportComponent | `features/dashboard/pages/sales-report/` | หน้าใหม่ |
| KpiCardComponent | `features/dashboard/components/kpi-card/` | Reusable card widget |

> ลบ placeholder เดิม (`pages/dashboard/`) + ลบ `dashboard.component.css`

---

## 11. Permissions

- ใช้ `dashboard.view.read` เดิมสำหรับทุก endpoint + ทุกหน้า
- ไม่เพิ่ม permission ใหม่
- ไม่ต้อง migration seed permission (มีอยู่แล้ว)

---

## 12. จุดเชื่อมต่อระบบอื่น

| ระบบ | ความสัมพันธ์ |
|------|-------------|
| **Order System** ([REQ-order-system](REQ-order-system.md)) | TbOrder (count, guest count, CreatedAt), TbOrderItem (quantity, CategoryType, OrderedBy, status filter, MenuNameThai) — aggregate queries |
| **Payment System** ([REQ-payment-system](REQ-payment-system.md)) | TbOrderBill (GrandTotal, Status=PAID, PaidAt) |
| **Menu System** ([REQ-menu-system](REQ-menu-system.md)) | TbMenu — ใช้ MenuNameThai snapshot จาก TbOrderItem (ไม่ query TbMenu โดยตรง) |
| **Self-Order System** ([REQ-self-order-system](REQ-self-order-system.md)) | OrderedBy format `"customer:{sessionId}"` สำหรับ channel breakdown |
| **Auth System** | Permission check `dashboard.view.read` |

---

## 13. UserFlow

### 13.1 Owner ดูภาพรวมร้านวันนี้

1. เข้าสู่ระบบ → Sidebar "แดชบอร์ด" → "ภาพรวม"
2. เห็น 4 KPI cards (วันนี้ + เปรียบเทียบเมื่อวาน)
3. เห็น Revenue Trend 7 วัน → toggle ดู 30 วัน
4. เห็น Top Selling 3 หมวด → รู้ว่าเมนูไหนขายดี
5. เห็น Peak Hours → รู้ช่วงเวลาที่ลูกค้าเยอะ

### 13.2 Owner ดูข้อมูลวันก่อนหน้า

1. เปลี่ยน date picker เป็นวันเมื่อวาน
2. KPI cards + Peak Hours + Revenue Trend + Top Selling อัพเดตตามวันที่เลือก
3. เปรียบเทียบ % เทียบกับวันก่อนหน้าอีกที (2 วันก่อน)

### 13.3 Manager ดูรายงานยอดขายประจำเดือน

1. Sidebar → "แดชบอร์ด" → "รายงานยอดขาย"
2. กดปุ่ม "เดือนนี้"
3. เห็น KPI Summary, Pie charts (หมวดหมู่ + ช่องทาง), ตารางรายวัน
4. ดูตาราง → เลื่อนดูแต่ละวัน → สังเกตวันที่ขายดี/ไม่ดี

### 13.4 Manager ดูข้อมูลช่วงเวลาเฉพาะ

1. เข้า Sales Report → เลือก Custom
2. ตั้งวันเริ่ม 1/3/2026 → วันสิ้นสุด 7/3/2026 → กด "ค้นหา"
3. ข้อมูลแสดงเฉพาะช่วง 1-7 มีนาคม

---

## 14. Edge Cases & Validation

### 14.1 สถานการณ์พิเศษ

| สถานการณ์ | การจัดการ |
|----------|----------|
| ร้านเพิ่งเปิด ไม่มีข้อมูล | KPI แสดง 0, กราฟแสดง empty state "ยังไม่มีข้อมูล" |
| วันก่อนหน้ายอด = 0 | เปรียบเทียบ % แสดง "ไม่มีข้อมูลเปรียบเทียบ" |
| Custom date range > 365 วัน | Frontend validation "ช่วงเวลาต้องไม่เกิน 365 วัน" |
| From > To | DatePicker ใช้ `[minDate]` ป้องกันอัตโนมัติ |
| Order CANCELLED | ไม่นับใน KPI |
| Order Item VOIDED/CANCELLED | ไม่นับใน Top Selling + Category breakdown |
| หมวดหมู่ไม่มีเมนูขายเลย | Top Selling หมวดนั้นแสดง "ยังไม่มีข้อมูล" |
| เลือกวันที่ในอนาคต | ข้อมูลเป็น 0 ทั้งหมด (ไม่ block) |

### 14.2 Backend Validation

| กฎ | Error Message | HTTP Status |
|----|--------------|-------------|
| `from` > `to` (sales-report) | "วันเริ่มต้นต้องไม่เกินวันสิ้นสุด" | 400 |
| Range > 365 วัน | "ช่วงเวลาต้องไม่เกิน 365 วัน" | 400 |
| `date` format ไม่ถูกต้อง | "รูปแบบวันที่ไม่ถูกต้อง" | 400 |

---

## 15. สรุปไฟล์ที่ต้องสร้าง/แก้ไข

### Backend

| ไฟล์ | หมายเหตุ |
|------|----------|
| `DashboardController.cs` | 4 endpoints |
| `IDashboardService.cs` + `DashboardService.cs` | Aggregate queries |
| `Models/Dashboard/*.cs` | 4 response models |
| `Program.cs` | เพิ่ม DI registration |

### Frontend

| ไฟล์ | หมายเหตุ |
|------|----------|
| `pages/dashboard-overview/` | แทนที่ placeholder |
| `pages/sales-report/` | หน้าใหม่ |
| `components/kpi-card/` | Reusable widget |
| `dashboard.module.ts` | เพิ่ม NgChartsModule + declarations |
| `dashboard-routing.module.ts` | เพิ่ม sales route |
| `side-bar.component.ts` | เปลี่ยน dashboard menu เป็น parent+children |
| `package.json` | เพิ่ม ng2-charts + chart.js |
| Generated API (core/api/) | Regenerate ด้วย gen-api |

---

## 16. เอกสารอ้างอิง

| เอกสาร | ความเกี่ยวข้อง |
|--------|---------------|
| [REQ-order-system](REQ-order-system.md) | TbOrder, TbOrderItem, TbOrderBill — แหล่งข้อมูลหลักสำหรับ aggregate queries |
| [REQ-payment-system](REQ-payment-system.md) | TbOrderBill.GrandTotal, PaidAt — ยอดขาย |
| [REQ-menu-system](REQ-menu-system.md) | CategoryType (§10.3), CostPrice สำหรับ Phase 2 (§3.4) |
| [REQ-self-order-system](REQ-self-order-system.md) | OrderedBy format สำหรับ channel breakdown (§4.2) |
