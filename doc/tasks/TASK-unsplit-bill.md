# TASK: ยกเลิกการแยกบิล (Unsplit Bill)

> สร้าง: 2026-03-29

## ปัญหาปัจจุบัน
- เมื่อ split bill แล้ว ไม่มีทางรวมกลับเป็นบิลเดียว
- ต้อง void bill ทั้งหมดแล้วขอบิลใหม่ ซึ่งยุ่งยาก

## เป้าหมาย
- เพิ่ม API `unsplit-bill` ที่ลบ bills ที่แยกไว้แล้วสร้าง Full Bill ใหม่ 1 ใบ
- เพิ่มปุ่ม "ยกเลิกการแยกบิล" ในแถบ bill tabs ของหน้า checkout
- แสดงเฉพาะเมื่อมี > 1 bills + ทุกบิลยังเป็น Pending

## Design

### Backend
**UnsplitBillAsync** — logic เลียนแบบ VoidBill + RequestBill:
1. ตรวจ `Status == Billing`
2. ดึง bills ทั้งหมด → ตรวจว่ามี > 1 + ทุกบิล Pending
3. Hard delete bills ทั้งหมด
4. Clear `OrderBillId = null` ใน items
5. สร้าง Full Bill ใหม่ 1 ใบ (SubTotal, SC, VAT, GrandTotal)
6. Return bills ใหม่

**Endpoint:** `POST /api/order/orders/{orderId}/unsplit-bill`

### Frontend (หลัง gen-api)
- เพิ่มปุ่มสีแดงในแถบ bill tabs (ขวาสุด)
- ใช้ `modalService.info()` ยืนยันก่อน → เรียก API → `loadBills()`

## ไฟล์ที่แก้

### Backend
1. `POS.Main.Business.Order/Interfaces/IOrderService.cs` — เพิ่ม method
2. `POS.Main.Business.Order/Services/OrderService.cs` — เพิ่ม UnsplitBillAsync
3. `RBMS.POS.WebAPI/Controllers/OrdersController.cs` — เพิ่ม endpoint

### Frontend (หลัง gen-api)
4. `checkout.component.html` — เพิ่มปุ่ม
5. `checkout.component.ts` — เพิ่ม onUnsplitBill()

## Sub-tasks

### Phase 1: Backend
- ✅ เพิ่ม method ใน `IOrderService.cs`
- ✅ เพิ่ม `UnsplitBillAsync` ใน `OrderService.cs`
- ✅ เพิ่ม endpoint ใน `OrdersController.cs`

### Phase 2: Frontend (หลัง gen-api)
- ✅ เพิ่มปุ่มยกเลิกการแยกบิลในแถบ bill tabs + `canUnsplit` computed
- ✅ เพิ่ม `onUnsplitBill()` method
