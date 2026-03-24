# TASK: ปรับดีไซน์หน้า Checkout ให้น่าใช้ขึ้น

> สร้างเมื่อ: 2026-03-20

## เป้าหมาย

ปรับหน้า Checkout (ชำระเงิน) ให้แสดงรายละเอียดเมนูครบถ้วนและ UI สวยขึ้น

## สิ่งที่ต้องทำ

### การเปลี่ยนแปลง

| # | รายละเอียด | ก่อน | หลัง |
|---|-----------|------|------|
| 1 | รูปเมนู | ไม่แสดงรูป | แสดงรูปเมนู (thumbnail) ด้านหน้ารายการ |
| 2 | ชื่อเมนู | แสดงเฉพาะชื่อไทย | แสดงชื่อไทย + ชื่ออังกฤษ |
| 3 | ปุ่ม numpad | สี่เหลี่ยมโค้ง (rounded-xl) | วงกลม (rounded-full) |
| 4 | ปุ่มกลับ | อยู่ใน header ของ page | ย้ายไปอยู่ใน breadcrumb |

### ไฟล์ที่ต้องแก้

**Backend:**
- `POS.Main.Business.Order/Models/OrderItem/OrderItemResponseModel.cs` — เพิ่ม `MenuImageFileId`
- `POS.Main.Business.Order/Models/OrderItem/OrderItemMapper.cs` — map MenuImageFileId จาก TbMenu
- อาจต้องแก้ query ใน Service ให้ include Menu entity

**Frontend:**
- `features/payment/pages/checkout/checkout.component.html` — ปรับ layout ทั้งหมด
- `features/payment/pages/checkout/checkout.component.ts` — เพิ่ม breadcrumb buttons, getImageUrl

---

## Phase 1: Backend — เพิ่ม MenuImageFileId

### Sub-tasks

- ✅ เพิ่ม `MenuImageFileId` ใน `OrderItemResponseModel.cs`
- ✅ แก้ `OrderItemMapper.cs` ให้ map `MenuImageFileId`
- ✅ แก้ query ใน Service ให้ Include TbMenu (ถ้ายังไม่ได้ include)

## Phase 2: gen-api

- ✅ Restart Backend → ตรวจ Swagger → บอกผู้ใช้ gen-api
- ✅ รอผู้ใช้ยืนยันว่า gen-api เสร็จ

## Phase 3: Frontend — ปรับ UI

- ✅ เพิ่มรูปเมนู (thumbnail) ในรายการ items
- ✅ แสดงชื่อไทย + อังกฤษ
- ✅ ปรับปุ่ม numpad เป็นวงกลม
- ✅ ย้ายปุ่มกลับไปไว้ใน breadcrumb (ใช้ BreadcrumbService)
- ✅ ลบ header เดิมที่มีปุ่มกลับ
