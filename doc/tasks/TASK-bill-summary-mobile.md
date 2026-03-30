# TASK: แสดงสรุปบิลบน Mobile Web Order Tracking

> สร้าง: 2026-03-31

## สถานะ: ✅ เสร็จสิ้น

## ปัญหา
เมื่อแคชเชียร์แยกบิลแล้วกด "ส่งบิลให้ลูกค้า" — ลูกค้าฝั่ง Mobile Web เห็นแค่รายการ + SubTotal
ไม่รู้ว่ามีกี่บิล แต่ละบิลยอดเท่าไหร่ จ่ายแล้วหรือยัง

## เป้าหมาย
เพิ่ม bills data ใน tracking API แล้วแสดง bill summary section บน order tracking page
- 1 บิล → แสดง breakdown (ยอดรวม, ค่าบริการ, VAT, ยอดสุทธิ)
- หลายบิล → แสดง bill tabs + breakdown ของบิลที่เลือก + สถานะ Paid/Pending

## ไฟล์ที่ต้องแก้

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `Backend-POS/.../Models/SelfOrder/CustomerOrderTrackingResponseModel.cs` | เพิ่ม `OrderStatus`, `Bills` + สร้าง `CustomerTrackingBillModel` |
| `Backend-POS/.../Services/SelfOrderService.cs` | แก้ `GetOrdersAsync()` — include OrderBills, map |
| `Frontend-POS/RBMS-POS-Mobile-Web/.../order-tracking.component.ts` | เพิ่ม signals/computed สำหรับ bills |
| `Frontend-POS/RBMS-POS-Mobile-Web/.../order-tracking.component.html` | แทนที่ Total section ด้วย bill summary UI |

ไม่ต้อง: สร้างไฟล์ใหม่, แก้ Controller, แก้ SignalR, สร้าง Migration

---

## Phase 1: Backend ✅

### 1.1 เพิ่ม Model ✅
- เพิ่ม `OrderStatus` (string) และ `Bills` (List) ใน `CustomerOrderTrackingResponseModel`
- สร้าง `CustomerTrackingBillModel`:
  - OrderBillId, BillNumber, SplitIndex, SplitCount, BillType
  - SubTotal, ServiceChargeAmount, VatAmount, TotalDiscountAmount, GrandTotal
  - Status ("Pending" | "Paid")

### 1.2 แก้ Service ✅
- `SelfOrderService.GetOrdersAsync()`:
  - เพิ่ม `.Include(o => o.OrderBills)` ใน query
  - เพิ่ม `OrderStatus = order.Status.ToString()`
  - เพิ่ม Bills mapping: filter !DeleteFlag, order by SplitIndex

## Phase 2: gen-api ✅
- Restart Backend → ตรวจ Swagger → ผู้ใช้รัน `npm run gen-api`

## Phase 3: Frontend ✅

### 3.1 Component TS ✅
- signals: orderStatus, bills, selectedBillIndex
- computed: hasBills, hasMultipleBills, showBillSummary, selectedBill
- method: onSelectBill(index)

### 3.2 Template HTML ✅
- กรณีไม่มีบิล → SubTotal เดิม
- กรณี 1 บิล → breakdown charges
- กรณีหลายบิล → bill tabs + status badge + breakdown

**Design (อ้างอิง bill-summary + checkout):**
- Bill tabs: `rounded-full`, Paid=success, Pending=primary
- Status badge: success-bg/warning-bg
- Grand total: `rgba(234,118,0,0.05)` background
