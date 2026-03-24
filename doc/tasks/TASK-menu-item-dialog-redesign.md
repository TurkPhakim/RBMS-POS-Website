# TASK: ปรับดีไซน์ Menu Item Dialog ตาม Test Page

> สร้าง: 2026-03-24

## เป้าหมาย

นำดีไซน์จาก test page (`test-dialog-page/test-menu-item-dialog-content`) ไปใช้กับ dialog จริง (`features/order/dialogs/menu-item-dialog`) ให้ตรง 100%

## ดีไซน์ที่ตกลงแล้ว

### สิ่งที่เปลี่ยนจากเดิม
- Menu Info: รูปใหญ่ขึ้น (w-48 h-48) + ชื่อ text-2xl + ราคารวม+จำนวนอยู่ด้านล่างในกลุ่มเดียวกัน
- Option Group: Card style + icon (option-extra) + bg-surface header + error state (border-danger + error message)
- Option Items: ปุ่มใหญ่ขึ้น (text-lg, py-3) + custom checkbox circle + border style แทน ring
- Quantity: pill border อยู่ข้างราคารวม (ไม่แยกส่วน)
- Total Price: อยู่ในส่วน Menu Info เป็น text-3xl (ไม่แยก bar ด้านล่าง)
- Error Validation: เพิ่ม submitted flag + isGroupError() + visual error
- Note: label font-bold text-lg
- Footer: ปุ่ม p-button-lg
- Header: "เลือกตัวเลือก" → "ตัวเลือกเมนู"

## ไฟล์ที่แก้

| # | ไฟล์ | แก้อะไร | สถานะ |
|---|------|--------|-------|
| 1 | `features/order/dialogs/menu-item-dialog/menu-item-dialog.component.ts` | เพิ่ม submitted, isGroupError() | ✅ |
| 2 | `features/order/dialogs/menu-item-dialog/menu-item-dialog.component.html` | เปลี่ยน template ตาม test page | ✅ |
| 3 | `features/order/pages/staff-order/staff-order.component.ts` | header → "ตัวเลือกเมนู" | ✅ |
| 4 | ลบ test page ทั้งหมด | component + route + declaration | ⬜ (รอผู้ใช้ยืนยัน) |
