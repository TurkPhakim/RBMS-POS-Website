# TASK: หน้ารายละเอียดรอบขาย (Session Detail)

> สร้างเมื่อ: 2026-03-24

## สรุปงาน
เพิ่มหน้าดูรายละเอียดรอบขายย้อนหลัง — ปุ่มดวงตาในตาราง Session History → เข้าหน้า Session Detail ที่แสดง KPI + ออเดอร์ชำระเสร็จ + เงินเข้า/ออกลิ้นชัก + ดาวน์โหลดใบเสร็จ

## Design

### Layout หน้า Session Detail
```
┌─────────────────────────────────────────────────────┐
│ [icon] รายละเอียดรอบขาย          [Operator Card]    │
│                                   ปิดแล้ว/เปิดอยู่   │
│                                   ชื่อ, ตำแหน่ง      │
│                                   ช่วงเวลา, เปิดเมื่อ │
├─────────────────────────────────────────────────────┤
│ KPI Grid 2x4 (read-only, ไม่มีปุ่ม cash-in/out)     │
│ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐    │
│ │เงินเปิดรอบ││ยอดขายสด  ││ยอดขาย QR ││เงินสดคงเหลือ│ │
│ └──────────┘└──────────┘└──────────┘└──────────┘    │
│ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐    │
│ │ยอดขายสุทธิ││จำนวนบิล  ││เงินสดจริง ││ผลต่าง    │    │
│ └──────────┘└──────────┘└──────────┘└──────────┘    │
├─────────────────────────────────────────────────────┤
│ [ออเดอร์ชำระเงินเสร็จสิ้น] (p-table 5 rows/page)   │
│ เลขออเดอร์ | โต๊ะ | ลูกค้า | คน | วิธีชำระ | ยอด | เวลา | ใบเสร็จ │
├─────────────────────────────────────────────────────┤
│ [รายการเงินเข้า/ออกลิ้นชัก] (ถ้ามี)                │
│ เวลา | ประเภท | จำนวนเงิน | เหตุผล                  │
└─────────────────────────────────────────────────────┘
Breadcrumb: ปุ่ม "ย้อนกลับ"
```

### KPI Cards (8 ช่อง, read-only)
- Row 1: เงินเปิดรอบ, ยอดขายเงินสด, ยอดขาย QR Code, เงินสดคงเหลือ (computed)
- Row 2: ยอดขายสุทธิ, จำนวนบิล, เงินสดจริง (actualCash), ผลต่าง (variance)

### API ที่ใช้
- `GET /api/cashier/sessions/{cashierSessionId}` — มีอยู่แล้ว, include ครบ (User, Payments+Order+Table+Zone, CashDrawerTransactions)

### Route
- `/payment/session-history/:cashierSessionId` — permission: `cashier-session.read`

## ไฟล์ที่ต้องสร้าง/แก้

### สร้างใหม่
- `features/payment/pages/session-detail/session-detail.component.ts`
- `features/payment/pages/session-detail/session-detail.component.html`

### แก้ไข
- `features/payment/payment-routing.module.ts` — เพิ่ม route
- `features/payment/payment.module.ts` — เพิ่ม declaration
- `features/payment/pages/session-history/session-history.component.html` — เพิ่มคอลัมน์ตัวเลือก (ปุ่มดวงตา)
- `features/payment/pages/session-history/session-history.component.ts` — เพิ่ม Router + method navigate

## Sub-tasks

### Phase 1: Session Detail Component
- ✅ ตรวจสอบ BE API — `GetSessionByIdAsync` include ครบแล้ว
- ✅ สร้าง session-detail.component.ts
- ✅ สร้าง session-detail.component.html
- ✅ เพิ่ม route + declaration

### Phase 2: เพิ่มปุ่มในตาราง Session History
- ✅ เพิ่มคอลัมน์ "ตัวเลือก" + ปุ่มดวงตา
- ✅ เพิ่ม method navigate ไปหน้า detail
