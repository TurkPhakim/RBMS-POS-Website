# TASK: ปรับดีไซน์ Cancel Reason Dialog ตาม Test Page

> สร้าง: 2026-03-24

## เป้าหมาย

นำดีไซน์จาก test page (`test-dialog-page/test-cancel-reason-content`) ไปใช้กับ dialog จริง (`features/order/dialogs/cancel-reason-dialog`) ให้ตรง 100%

## ดีไซน์ที่ตกลงแล้ว

### Layout
```
┌─ card-template (header: "ยกเลิกออเดอร์") ───────────────────┐
│                                                                │
│  ┌─ Danger Gradient Banner ────────────────────────────────┐  │
│  │ [cancel icon] ยกเลิกรายการ{อาหาร/เครื่องดื่ม/ของหวาน}  │  │
│  │               รายการนี้จะถูกยกเลิกจากออเดอร์             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─ Item Info Card (bg-surface) ───────────────────────────┐  │
│  │ ชื่อเมนูไทย                             x2 (badge)     │  │
│  │ ชื่อเมนู EN                                             │  │
│  │ [plus icon] ไข่ดาว (+15.00)           228.00 บาท (แดง)  │  │
│  │ [plus icon] เพิ่มข้าว (+10.00)                          │  │
│  │ [info icon] เผ็ดน้อย ไม่ใส่ถั่ว                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ระบุเหตุผล *                                                 │
│  ┌─ textarea ──────────────────────────────────────────────┐  │
│  │ ระบุเหตุผลประกอบ                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  <app-field-error> (กรุณาระบุ — เมื่อกดปุ่มแล้วว่าง)         │
│                                                                │
│  ┌─ Footer ─────────────────────────────────────────────────┐  │
│  │            [ย้อนกลับ]    [ยกเลิกออเดอร์ (danger)]        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### สิ่งที่เปลี่ยนจากเดิม
- เพิ่ม Danger Gradient Banner (icon cancel + หมวดหมู่)
- เพิ่ม Item Info Card (ชื่อ, EN, options + icon plus, note + icon info, quantity badge, totalPrice สีแดง)
- Textarea: `ngModel` → `FormControl` + `Validators.required` + `<app-field-error>`
- ลบ `[disabled]` ออกจากปุ่ม — กด confirm แล้ว markDirty แทน
- เพิ่ม PIN verify (`VerifyPinDialogComponent`) ก่อนยืนยัน
- data ที่ส่ง: `{ menuName }` → `{ item: OrderItemResponseModel }`
- categoryLabel คำนวณจาก `item.categoryType`
- Header: "ยกเลิกรายการ" → "ยกเลิกออเดอร์"
- ปุ่ม: "ยกเลิก"→"ย้อนกลับ", "ยืนยัน"→"ยกเลิกออเดอร์"

## ไฟล์ที่แก้

| # | ไฟล์ | แก้อะไร | สถานะ |
|---|------|--------|-------|
| 1 | `cancel-reason-dialog.component.ts` | เพิ่ม item, categoryLabel, FormControl, PIN verify, DialogService | ✅ |
| 2 | `cancel-reason-dialog.component.html` | เปลี่ยน template ทั้งหมดตาม test page | ✅ |
| 3 | `order-detail.component.ts` | ส่ง item ทั้งตัว + header "ยกเลิกออเดอร์" | ✅ |
| 4 | ลบ test page ทั้งหมด | component + route + declaration | ⬜ (รอผู้ใช้ยืนยัน) |
