# TASK: แก้ Bill Flow — Warning รายการไม่ครบ + ส่งบิลให้ลูกค้า

> สร้าง: 2026-03-29 | สถานะ: ✅ เสร็จสมบูรณ์

## สรุปปัญหา

### Issue #2: "ไม่สามารถสร้างบิลได้"
- `OrderService.RequestBillAsync` throw error เมื่อมีรายการยังเสิร์ฟไม่ครบ
- พนักงานเห็น error dialog แต่ทำอะไรไม่ได้
- **แก้**: แสดง Warning dialog → พนักงานยืนยัน → สร้างบิลจากรายการ Served เท่านั้น

### Issue #3: ไม่มี Flow ส่งบิลให้ลูกค้า
- หลัง Staff สร้างบิล + ปรับ ServiceCharge แล้ว ไม่มีทางส่งบิลกลับไปให้ Mobile Web
- `bill-waiting` ลูกค้ารอไม่รู้จบ (Backend ไม่เคยส่ง SignalR event)
- **แก้**: เพิ่มปุ่ม "ส่งบิลให้ลูกค้า" → ส่ง SignalR → Mobile Web redirect ไป bill-summary

---

## Design

### Issue #2: เพิ่ม `force` parameter

**Backend:**
- `RequestBillAsync(orderId, force=false)` — force=false: throw เหมือนเดิม, force=true: ข้าม validation สร้างบิลจาก served items
- Controller: `[FromQuery] bool force = false`

**Frontend:**
- `autoCreateBill()` ตรวจ items ก่อนเรียก API
- ถ้ามีรายการยังไม่เสิร์ฟ → ModalService.info() Warning → ยืนยัน → เรียก API พร้อม force=true
- ถ้าเสิร์ฟครบ → เรียก API ปกติ

### Issue #3: ปุ่มส่งบิลให้ลูกค้า

**Backend:**
- `POST /api/order/orders/{orderId}/send-bill` — ส่ง `RefreshOrders` SignalR ไป `table_{tableId}`
- `NotifyTableOrderRefreshAsync(tableId)` มีอยู่แล้ว ใช้ซ้ำได้

**Frontend Client:**
- ปุ่ม "ส่งบิลให้ลูกค้า" ในคอลัมน์ขวาของ checkout
- กดแล้วแสดง success state

**Frontend Mobile Web:** ไม่ต้องแก้ — infrastructure พร้อม (`effect()` → `loadBillData()` → redirect)

---

## Phase 1: Backend

### Sub-task 1.1: แก้ IOrderService + OrderService — RequestBillAsync force
- ✅ แก้ `IOrderService.cs` เพิ่ม `bool force = false`
- ✅ แก้ `OrderService.cs` เพิ่ม force logic
- ✅ แก้ `OrdersController.cs` เพิ่ม `[FromQuery] bool force = false`

### Sub-task 1.2: เพิ่ม SendBillToCustomerAsync
- ✅ เพิ่ม `IOrderService.SendBillToCustomerAsync`
- ✅ เพิ่ม `OrderService.SendBillToCustomerAsync`
- ✅ เพิ่ม `OrdersController.SendBillToCustomer` endpoint

### Sub-task 1.3: Build + ตรวจ Swagger
- ✅ Build สำเร็จ (0 errors, 0 warnings)
- ✅ Swagger มี endpoint ใหม่ + force param

## Phase 2: gen-api
- ✅ Restart Backend
- ✅ ตรวจ Swagger
- ✅ ผู้ใช้รัน gen-api
- ✅ ตรวจ generated files — `ordersRequestBillPost` มี `force?: boolean`, `ordersSendBillToCustomerPost` สร้างมาถูกต้อง

## Phase 3: Frontend Client

### Sub-task 3.1: แก้ autoCreateBill — Warning dialog
- ✅ ตรวจ items ก่อนเรียก API (filter unserved items)
- ✅ แสดง Warning dialog เมื่อมีรายการยังไม่เสิร์ฟ (Icon.Warning + "สร้างบิล" button)
- ✅ แยก `createBill(force)` method — เรียก API พร้อม force parameter

### Sub-task 3.2: ปุ่มส่งบิลให้ลูกค้า
- ✅ เพิ่ม `billSentToCustomer` signal + `onSendBillToCustomer()` method
- ✅ เพิ่มปุ่มใน HTML (ใต้แยกบิล/ยกเลิกบิล + success state)
- ✅ Build สำเร็จ

---

## ไฟล์ที่แก้

| ไฟล์ | การแก้ |
|------|--------|
| `Business.Order/Interfaces/IOrderService.cs` | เพิ่ม force param + SendBillToCustomerAsync |
| `Business.Order/Services/OrderService.cs` | แก้ RequestBillAsync + เพิ่ม SendBillToCustomerAsync |
| `RBMS.POS.WebAPI/Controllers/OrdersController.cs` | แก้ RequestBill + เพิ่ม SendBillToCustomer |
| `checkout.component.ts` | autoCreateBill Warning + ปุ่มส่งบิล |
| `checkout.component.html` | ปุ่มส่งบิลให้ลูกค้า |
