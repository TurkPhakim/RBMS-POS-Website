# TASK: แก้ปัญหาระบบสลิป — Notification + Validation

> สร้าง: 2026-03-31

## สรุปปัญหา

1. **ไม่มีแจ้งเตือนเมื่อลูกค้าส่งสลิป** — CustomerService ส่ง event ผ่าน OrderHub เท่านั้น ไม่ได้ส่งผ่าน NotificationHub → พนักงานไม่ได้ toast/bell
2. **ยอด ManualAmount ต่ำกว่าบิลไม่ block** — Frontend ไม่มี validation ที่ form control + ไม่แสดง error message

---

## Phase 1: Backend — เพิ่ม Notification Broadcast

### Sub-tasks

- ✅ เพิ่ม `INotificationBroadcaster` ใน `CustomerService` constructor
- ✅ เรียก `SendAndBroadcastAsync` ด้วย eventType `SLIP_UPLOADED` หลัง `NotifySlipUploadedAsync`

### ไฟล์ที่แก้
- `Backend-POS/POS.Main/POS.Main.Business.Payment/Services/CustomerService.cs`

### รายละเอียด
- เพิ่ม `using POS.Main.Business.Notification.Interfaces;` + `using POS.Main.Business.Notification.Models;`
- เพิ่ม `INotificationBroadcaster _notificationBroadcaster` ใน constructor
- เรียก `SendAndBroadcastAsync` ด้วย:
  - EventType: `"SLIP_UPLOADED"`
  - Title: `"ลูกค้าส่งสลิปมาแล้ว"`
  - Message: `"ออเดอร์ #{dailyNumber} ส่งสลิปชำระเงิน\nยอดบิล {amount} บาท"`
  - TargetGroup: `"Cashier"`
  - TableId + OrderId

---

## Phase 2: Frontend — Validation ManualAmount

### Sub-tasks

- ✅ สร้าง `validateManualAmount()` helper method
- ✅ เรียก validate ก่อน submit ใน `onConfirmCustomerSlip()` (Scenario A)
- ✅ เรียก validate ก่อน submit ใน `onConfirmWithOcr()` (Scenario B)

### ไฟล์ที่แก้
- `Frontend-POS/RBMS-POS-Client/src/app/features/payment/dialogs/qr-payment-dialog/qr-payment-dialog.component.ts`

### รายละเอียด
- **บังคับกรอก ManualAmount** เมื่อ verificationStatus ≠ "Matched" (OCR อ่านไม่ได้ หรือ ยอดไม่ตรง)
- **ยอดที่กรอกต้อง >= GrandTotal** — ถ้าน้อยกว่า → แสดง error ด้วย `modalService.cancel()`
- แสดง error ชัดเจน ไม่ใช่แค่ reset isSaving

---

## Phase 3: Click Notification → Auto-open QR Dialog

### Sub-tasks

- ✅ Notification Drawer: เพิ่ม `queryParams: { openSlip: true }` เมื่อ click `SLIP_UPLOADED`
- ✅ NotiStoreService: เพิ่ม `orderId` ใน toast data
- ✅ MainLayout Toast: เพิ่ม click handler + `TOAST_NAV_MAP` สำหรับ navigate ไปหน้าที่เกี่ยวข้อง
- ✅ Checkout: อ่าน `openSlip` queryParam → auto-open QR Payment Dialog หลัง bills โหลดเสร็จ

### ไฟล์ที่แก้
- `shared/components/notification-drawer/notification-drawer.component.ts` — เพิ่ม queryParams
- `core/services/noti-store.service.ts` — เพิ่ม orderId ใน toast data
- `layouts/main-layout/main-layout.component.ts` — เพิ่ม Router, TOAST_NAV_MAP, onToastClick()
- `layouts/main-layout/main-layout.component.html` — เพิ่ม (click) + cursor-pointer บน toast
- `features/payment/pages/checkout/checkout.component.ts` — เพิ่ม pendingAutoOpenSlip + auto-open logic

---

## หมายเหตุ
- Frontend NotiStoreService + MainLayout มี setup สำหรับ `SLIP_UPLOADED` ไว้แล้วครบ (toast icon, color, filter group) → ไม่ต้องแก้
- Backend validation ที่ PaymentService (บรรทัด 212-213) ถูกต้องอยู่แล้ว → เพิ่มแค่ Frontend validation
