# TASK: กราฟเส้นเปรียบเทียบยอดขายระหว่างช่วงเวลา

> สร้าง: 2026-03-31
> สถานะ: เสร็จแล้ว

## สรุปงาน

เพิ่มกราฟเส้น 2 เส้นใน Dashboard เปรียบเทียบยอดขายระหว่างช่วงเวลาที่ 1 กับช่วงเวลาที่ 2
- แสดงเฉพาะเมื่อ `HasTwoPeriods = true` (ร้านเปิด 2 ช่วง)
- ชื่อช่วงใช้อัตโนมัติ: "ช่วงที่ 1 (10:00-14:00)", "ช่วงที่ 2 (17:00-22:00)"
- แกน X = วัน (7/30 วัน toggle)
- ไม่ต้องเพิ่ม field ใหม่ใน DB

## Design

### Layout — วางใต้ Revenue Trend Chart เดิม

```
┌─────── เปรียบเทียบยอดขายตามช่วงเวลา ──────────────┐
│  [7 วัน] [30 วัน]                                    │
│                                                       │
│  ── ช่วงที่ 1 (10:00-14:00)                          │
│  ── ช่วงที่ 2 (17:00-22:00)                          │
│                                                       │
│        ยอดขาย                                         │
│  ฿80k │          ╱──●  เส้นช่วง 2                    │
│       │   ●──╱                                        │
│  ฿45k │  ╱──●──●   เส้นช่วง 1                       │
│       │─●                                             │
│       └──────────────────                             │
│         จ.  อ.  พ.  พฤ.  ศ.  ส.  อา.                │
└───────────────────────────────────────────────────────┘
```

### API Response — เพิ่ม field ใน DashboardOverviewResponseModel

```csharp
// เพิ่มใน DashboardOverviewResponseModel
public List<PeriodRevenueTrendModel> PeriodRevenueTrend { get; set; } = new();
public bool HasTwoPeriods { get; set; }
public string? Period1Label { get; set; }  // "ช่วงที่ 1 (10:00-14:00)"
public string? Period2Label { get; set; }  // "ช่วงที่ 2 (17:00-22:00)"

// Model ใหม่
public class PeriodRevenueTrendModel
{
    public DateTime Date { get; set; }
    public decimal Period1Sales { get; set; }
    public decimal Period2Sales { get; set; }
}
```

### Backend Logic — คำนวณจาก Order time + Operating Hours

1. ดึง ShopSettings + OperatingHours ของวันนี้ (DayOfWeek)
2. ถ้า `HasTwoPeriods = false` → return list ว่าง
3. ถ้า `HasTwoPeriods = true`:
   - สร้าง label: "ช่วงที่ 1 ({OpenTime1}-{CloseTime1})"
   - Query Orders ย้อนหลัง N วัน
   - แต่ละวัน: ดู DayOfWeek → ดึง OpenTime1/CloseTime1/OpenTime2/CloseTime2
   - Order ที่ CreatedAt time อยู่ในช่วง 1 → Period1Sales
   - Order ที่ CreatedAt time อยู่ในช่วง 2 → Period2Sales

### Frontend — เพิ่ม section ใน dashboard-overview

- signal ใหม่: `periodComparisonData = signal<ChartData<'line'>>(...)`
- ใช้ chart.js line chart เหมือน Revenue Trend
- 2 datasets (สีต่างกัน): ช่วง 1 = primary (#f97316), ช่วง 2 = info (#0ea5e3)
- legend: แสดง (ต่างจาก Revenue Trend ที่ซ่อน legend)
- `@if (hasTwoPeriods())` ซ่อน/แสดง section
- Toggle 7/30 วัน แยกจาก Revenue Trend

## ไฟล์ที่ต้องแก้

### Backend
| ไฟล์ | การแก้ |
|------|--------|
| `POS.Main.Business.Admin/Models/Dashboard/DashboardOverviewResponseModel.cs` | เพิ่ม fields: PeriodRevenueTrend, HasTwoPeriods, Period1Label, Period2Label |
| `POS.Main.Business.Admin/Models/Dashboard/PeriodRevenueTrendModel.cs` | สร้างใหม่ |
| `POS.Main.Business.Admin/Services/DashboardService.cs` | เพิ่ม logic คำนวณ period comparison ใน GetOverviewAsync |

### Frontend (หลัง gen-api)
| ไฟล์ | การแก้ |
|------|--------|
| `dashboard-overview.component.ts` | เพิ่ม signal, method build chart, toggle |
| `dashboard-overview.component.html` | เพิ่ม section กราฟ + legend + toggle buttons |

## Sub-tasks

### Phase 1: Backend
- ✅ 1.1 สร้าง `PeriodRevenueTrendModel.cs`
- ✅ 1.2 เพิ่ม fields ใน `DashboardOverviewResponseModel`
- ✅ 1.3 เพิ่ม logic ใน `DashboardService.GetOverviewAsync()` — query orders แยกตามช่วงเวลา

### Phase 2: gen-api
- ✅ 2.1 Restart Backend + ตรวจ Swagger
- ✅ 2.2 บอกผู้ใช้รัน `npm run gen-api`

### Phase 3: Frontend
- ✅ 3.1 เพิ่ม signal + chart config ใน component.ts
- ✅ 3.2 เพิ่ม section กราฟใน component.html
- ⬜ 3.3 ทดสอบ (mock mode + real API)
