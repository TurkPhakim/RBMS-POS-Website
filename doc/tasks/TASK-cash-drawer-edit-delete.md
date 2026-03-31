# TASK: เพิ่มปุ่มแก้ไข/ลบ รายการเงินเข้า/ออกลิ้นชัก

> สร้าง: 2026-03-31

## สรุป
เพิ่มความสามารถในการแก้ไขและลบรายการเงินเข้า/ออกลิ้นชัก (Cash Drawer Transaction) ในหน้า Payment
ปัจจุบันตารางเป็น read-only → ต้องเพิ่มคอลัมน์ "ตัวเลือก" พร้อมปุ่มแก้ไข/ลบ

## Design

### Backend API ใหม่
- `PUT /api/cashier/sessions/{cashierSessionId}/cash-drawer/{cashDrawerTransactionId}` → แก้ไข amount + reason
- `DELETE /api/cashier/sessions/{cashierSessionId}/cash-drawer/{cashDrawerTransactionId}` → soft delete

### Frontend
- เพิ่มคอลัมน์ "ตัวเลือก" ในตาราง cash drawer transactions (ปุ่มแก้ไข + ปุ่มลบ)
- แก้ cash-drawer-dialog ให้รองรับ edit mode (pre-fill form + เรียก update API)
- Delete → confirm dialog → reload session → card อัพเดตอัตโนมัติ

### กฎ
- แก้ไข/ลบได้เฉพาะ session ที่ยังเปิดอยู่
- TransactionType fix ไว้ตอน edit (ไม่ให้เปลี่ยน CashIn ↔ CashOut)
- Permission: `CashierSession.Update`

---

## Phase 1: Backend — เพิ่ม Update + Delete endpoint

### ไฟล์ที่แก้
- `ICashierSessionService.cs` — เพิ่ม method signatures
- `CashierSessionService.cs` — implement update/delete logic
- `CashierSessionsController.cs` — เพิ่ม 2 endpoint

### Sub-tasks
- ✅ เพิ่ม `UpdateCashDrawerTransactionAsync` ใน Interface + Service
- ✅ เพิ่ม `DeleteCashDrawerTransactionAsync` ใน Interface + Service
- ✅ เพิ่ม PUT + DELETE endpoint ใน Controller

---

## Phase 2: Frontend — gen-api + แก้ Dialog + ตาราง

### ไฟล์ที่แก้
- `cash-drawer-dialog.component.ts/html` — เพิ่ม edit mode
- `payment.component.ts/html` — เพิ่มคอลัมน์ตัวเลือก + handler

### Sub-tasks
- ✅ Restart Backend + gen-api (ให้ผู้ใช้รัน)
- ✅ แก้ cash-drawer-dialog รองรับ edit mode
- ✅ เพิ่มคอลัมน์ "ตัวเลือก" + ปุ่มแก้ไข/ลบ ในตาราง payment
- ✅ เพิ่ม onEditTransaction / onDeleteTransaction ใน payment.component.ts
