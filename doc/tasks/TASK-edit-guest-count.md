# TASK: แก้ไขจำนวนลูกค้าหลังเปิดโต๊ะ

> สร้าง: 2026-03-29

## ปัญหา
- ปัจจุบัน guestCount ตั้งค่าตอนเปิดโต๊ะเท่านั้น ไม่มีทางแก้ไขภายหลัง
- ถ้ามีคนเพิ่ม/ลด ไม่สามารถอัพเดตจำนวนลูกค้าได้

## เป้าหมาย
- เพิ่มปุ่มแก้ไขจำนวนลูกค้าใน **Table Action Dialog** (Quick Actions area) ข้างปุ่ม QR Code
- กดปุ่ม → เปิด dialog เล็กๆ → แก้ค่า → floor plan อัพเดต

## ดีไซน์

### ปุ่มใน Table Action Dialog
- เพิ่มใน Quick Actions area (ข้างปุ่ม QR Code)
- ใช้ icon `human` + style เดียวกับปุ่ม QR
- แสดงเฉพาะ status Occupied หรือ Billing

### Edit Guest Count Dialog
- `<app-card-template>` header "แก้ไขจำนวนลูกค้า"
- Input number + ปุ่ม [-] [+]
- Validation: 1-100
- เรียก API → close ด้วย true

---

## Phase 1: Backend

### 1.1 สร้าง UpdateGuestCountRequestModel ✅
- ที่: `Business.Order/Models/Order/UpdateGuestCountRequestModel.cs`
- Field: `int GuestCount`

### 1.2 เพิ่ม IOrderService + OrderService ✅
- เพิ่ม `UpdateGuestCountAsync(int orderId, UpdateGuestCountRequestModel request, CancellationToken ct)`
- Logic: validate → update TbOrder.GuestCount → update TbTable.CurrentGuests → commit → notify

### 1.3 เพิ่ม Controller endpoint ✅
- `PUT /api/order/orders/{orderId}/update-guest-count`
- Permission: `Permissions.Order.Update`

### 1.4 Build + ตรวจ Swagger ✅

## Phase 2: Frontend

### 2.1 gen-api (ผู้ใช้รัน) ✅

### 2.2 สร้าง EditGuestCountDialog ✅
- ที่: `features/order/dialogs/edit-guest-count-dialog/`
- Declare ใน `order.module.ts`

### 2.3 เพิ่มปุ่มใน Table Action Dialog ✅
- แก้ `table-action-dialog.component.html` + `.ts`
- เปิด dialog → refresh on close

---

## ไฟล์ที่แก้/สร้าง

| ไฟล์ | การแก้ |
|------|--------|
| `Business.Order/Models/Order/UpdateGuestCountRequestModel.cs` | สร้างใหม่ |
| `Business.Order/Interfaces/IOrderService.cs` | เพิ่ม method |
| `Business.Order/Services/OrderService.cs` | implement |
| `RBMS.POS.WebAPI/Controllers/OrdersController.cs` | เพิ่ม endpoint |
| `order/dialogs/edit-guest-count-dialog/*` | สร้างใหม่ |
| `order/order.module.ts` | declare |
| `table-action-dialog.component.html` | เพิ่มปุ่ม |
| `table-action-dialog.component.ts` | เพิ่ม method |
