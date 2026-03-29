# TASK: แก้ปุ่มส่งครัวใน Staff-Order ให้ส่งเฉพาะ Items ในตะกร้าปัจจุบัน

> สร้าง: 2026-03-28 | เสร็จ: 2026-03-28

## สรุปปัญหา
ปุ่ม "ส่งครัว" ใน staff-order ทำ 2 API calls: `AddItems` → `SendToKitchen`
แต่ `SendToKitchen` ส่ง **ทุก** items ที่ status=Pending ไปครัว (รวมทั้ง items ที่เคยกด "เพิ่มรายการ" ไว้ก่อนหน้า)

## Design
- เพิ่ม flag `SendToKitchen` ใน `AddOrderItemsRequestModel`
- Backend: หลัง add items → ถ้า flag=true → ส่งเฉพาะ items ที่เพิ่งเพิ่มไปครัว (1 API call)
- Frontend: `onSendToKitchen()` เปลี่ยนจาก 2 calls เป็น 1 call with `sendToKitchen: true`
- Backward compatible: `SendToKitchen` endpoint เดิมยังใช้ได้ (order-detail ยังเรียก)

---

## Phase 1: Backend

- ✅ 1.1 `AddOrderItemsRequestModel.cs` — เพิ่ม `SendToKitchen` property
- ✅ 1.2 `OrderService.AddOrderItemsAsync` — หลัง commit → ถ้า sendToKitchen → update items ที่เพิ่งเพิ่ม + notifications

## Phase 2: gen-api

- ✅ 2.1 Restart BE + ตรวจ Swagger
- ✅ 2.2 ผู้ใช้รัน gen-api

## Phase 3: Frontend

- ✅ 3.1 `staff-order.component.ts` — `onSendToKitchen()` เปลี่ยนเป็น 1 call with `sendToKitchen: true`

## ไฟล์ที่แก้ไข

| # | ไฟล์ | การแก้ไข |
|---|------|---------|
| 1 | `AddOrderItemsRequestModel.cs` | เพิ่ม `SendToKitchen` |
| 2 | `OrderService.cs` | เพิ่ม logic ส่งครัวเฉพาะ items ใหม่ |
| 3 | `staff-order.component.ts` | เปลี่ยนเป็น 1 API call |
