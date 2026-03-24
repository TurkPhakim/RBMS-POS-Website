# TASK: รีดีไซน์ Cashier Module — Sub-Modules + Shift + Date Filter + Order Link

> สถานะ: **เสร็จสมบูรณ์** ✅ | เริ่ม: 2026-03-20 | เสร็จ: 2026-03-20

## ปัญหาปัจจุบัน

1. "ชำระเงิน" เป็น leaf menu item — ไม่มี submenu ทำให้ต้องกดปุ่มเข้าประวัติกะจากภายในหน้า
2. ชื่อ "กะแคชเชียร์" ไม่สื่อ → ผู้ใช้ต้องการเปลี่ยนเป็น "รอบการขาย"
3. หน้าประวัติกะไม่มี filter ช่วงวันที่ — ค้นหาข้อมูลย้อนหลังไม่สะดวก
4. ตอนเปิดรอบไม่มีให้เลือกช่วงเวลา (shift) — ร้านที่เปิด 2 ช่วงไม่สามารถแยกรอบได้
5. จากหน้า Order List ไม่มีทางลัดไปหน้าชำระเงิน

## เป้าหมาย

- แยก sidebar "ชำระเงิน" → parent มี 2 children: "รอบการขาย" + "ประวัติรอบขาย"
- เปลี่ยนชื่อทุกที่จาก "กะแคชเชียร์" → "รอบการขาย"
- เพิ่ม date range filter ในหน้าประวัติรอบขาย
- เพิ่ม shift dropdown ตอนเปิดรอบ (เฉพาะร้านที่ `ShopSettings.HasTwoPeriods = true`)
- เพิ่มปุ่มชำระเงินใน Order List สำหรับออเดอร์สถานะ "Billing"

---

## Design — Sidebar Menu

**ก่อน:**
```
ชำระเงิน (leaf → /payment)
```

**หลัง:**
```
ชำระเงิน (parent)
  ├── รอบการขาย (→ /payment)
  └── ประวัติรอบขาย (→ /payment/session-history)
```

---

## Design — Open Session Dialog (Shift Selection)

**เงื่อนไข:** แสดง shift dropdown เฉพาะเมื่อ `ShopSettings.HasTwoPeriods = true` (field นี้มีอยู่แล้วใน `TbShopSettings`)

**Dialog Layout (เมื่อ hasTwoPeriods = true):**
```
┌───────────────────────────────────┐
│ เปิดรอบการขาย                      │
├───────────────────────────────────┤
│                                     │
│  ช่วงเวลา     [Dropdown ▼]        │
│               ช่วงที่ 1 / ช่วงที่ 2   │
│                                     │
│  เงินสดเปิดรอบ [___________]       │
│                                     │
│  หมายเหตุ     [___________]       │
│                                     │
│      [ยกเลิก]    [บันทึก]          │
└───────────────────────────────────┘
```

**เมื่อ hasTwoPeriods = false:** ไม่แสดง dropdown ช่วงเวลา (เหมือนเดิม)

---

## Design — Date Range Filter ในหน้าประวัติรอบขาย

เพิ่ม filter bar เหนือตาราง (pattern เดียวกับ order-list.component.html):
```
┌──────────────────────────────────────────────────┐
│  วันที่เริ่มต้น [DatePicker]   วันที่สิ้นสุด [DatePicker] │
├──────────────────────────────────────────────────┤
│  ตาราง pagination (เรียงอันล่าสุดก่อน)             │
│  + คอลัมน์ "ช่วงเวลา" ใหม่                         │
└──────────────────────────────────────────────────┘
```

---

## Design — ปุ่มชำระเงินใน Order List

เพิ่มปุ่มกลมสี success ข้างปุ่ม eye ในคอลัมน์ "ตัวเลือก":
- แสดงเฉพาะ `@if (canPayment && item.status === 'Billing')`
- Icon: `invoice-bill` + tooltip "ชำระเงิน"
- คลิก → navigate ไป `/payment/checkout/:orderId`

---

## Generated API ที่เกี่ยวข้อง

| Service Method | ใช้ทำอะไร |
|----------------|-----------|
| `cashierSessionsOpenSessionPost({body})` | เปิดรอบ — เพิ่ม shiftPeriod ใน body |
| `cashierSessionsGetSessionHistoryGet({Page, ItemPerPage, dateFrom?, dateTo?})` | ดึงประวัติรอบ + date filter ใหม่ |
| `shopSettingsGet()` | ดึง hasTwoPeriods |

## สิ่งที่ค้นพบ

- `TbShopSettings.HasTwoPeriods` (bool) มีอยู่แล้ว — ใช้เช็คว่าแสดง shift dropdown หรือไม่
- `TbCashierSession` ยังไม่มี `ShiftPeriod` field → ต้องเพิ่ม + migration
- Backend `GetSessionHistoryAsync` รับแค่ `PaginationModel` → ต้องเพิ่ม dateFrom/dateTo
- Session history FE มี pagination แล้ว แต่ไม่มี filter
- Order list มี date filter pattern อยู่แล้ว — ใช้เป็น reference

---

## Phase 1: Backend — เพิ่ม ShiftPeriod + Date Range Filter

| Sub-task | สถานะ |
|----------|-------|
| เพิ่ม `ShiftPeriod` ใน `TbCashierSession` entity | ✅ |
| เพิ่ม `ShiftPeriod` ใน `OpenCashierSessionRequestModel` | ✅ |
| เพิ่ม `ShiftPeriod` ใน `CashierSessionResponseModel` + Mapper | ✅ |
| แก้ `CashierSessionService.OpenSessionAsync` map ShiftPeriod | ✅ |
| เพิ่ม dateFrom/dateTo ใน `ICashierSessionService.GetSessionHistoryAsync` | ✅ |
| เพิ่ม date filter ใน `CashierSessionService.GetSessionHistoryAsync` | ✅ |
| เพิ่ม dateFrom/dateTo params ใน `CashierSessionsController` | ✅ |
| สร้าง Migration `AddShiftPeriodToCashierSession` | ✅ |
| รัน `dotnet ef database update` | ✅ |
| เพิ่ม `HasTwoPeriods` ใน `ShopBrandingResponseModel` + Mapper | ✅ |

## Phase 2: Frontend — Sidebar + Rename + Date Filter

| Sub-task | สถานะ |
|----------|-------|
| แก้ sidebar แยก "ชำระเงิน" เป็น parent + 2 children | ✅ |
| Rename "กะแคชเชียร์" → "รอบการขาย" ทุกไฟล์ | ✅ |
| เพิ่ม date range filter ในหน้า session-history | ✅ |

## Phase 3: Frontend — Shift Dropdown + Order Link

| Sub-task | สถานะ |
|----------|-------|
| เพิ่ม shift dropdown ใน Open Session Dialog (conditional) | ✅ |
| เพิ่ม `hasTwoPeriods` signal ใน `ShopBrandingService` | ✅ |
| เพิ่มคอลัมน์ "ช่วงเวลา" ในตารางประวัติรอบขาย | ✅ |
| เพิ่มปุ่มชำระเงินใน Order List | ✅ |

## Phase 4: gen-api + ทดสอบ

| Sub-task | สถานะ |
|----------|-------|
| Restart Backend + ตรวจ Swagger | ✅ |
| บอกผู้ใช้รัน gen-api + รอยืนยัน (ครั้งที่ 1: shiftPeriod + dateFrom/dateTo) | ✅ |
| บอกผู้ใช้รัน gen-api + รอยืนยัน (ครั้งที่ 2: hasTwoPeriods ใน branding) | ✅ |
| ลบ dead code (`onViewHistory` ใน payment.component.ts) | ✅ |
| Build Frontend ตรวจ compile | ✅ |
