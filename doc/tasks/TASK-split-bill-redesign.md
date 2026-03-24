# TASK: ปรับดีไซน์ Split Bill Dialog ตาม Test Page

> สร้าง: 2026-03-24

## เป้าหมาย

นำดีไซน์จาก test page (`test-dialog-page/test-split-bill-content`) ไปใช้กับ dialog จริง (`shared/dialogs/split-bill-dialog`) ให้ตรง 100%

## ดีไซน์ที่ตกลงแล้ว

### Layout หลัก
```
┌─ card-template (header: "แยกบิลชำระเงิน") ──────────────────┐
│                                                                │
│  ┌─ Gradient Banner ────────────────────────────────────────┐  │
│  │ [icon] แยกบิลชำระเงิน          ยอดรวม                    │  │
│  │        N รายการ               1,327.00 บาท               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─ Mode Selector (tab style) ──────────────────────────────┐  │
│  │  [divide icon] หารเท่า  |  [checklist icon] แยกตามรายการ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  === By Amount ===                                             │
│  จำนวนที่ต้องการแยก            [-] 2 [+]                       │
│  ┌ ยอดต่อบิล                          [5 บิล] p-tag ┐         │
│  │ ┌──────┐ ┌──────┐                                │         │
│  │ │บิล 1 │ │บิล 2 │  (grid 2 cols, max 4 + text)  │         │
│  │ │xxx฿  │ │xxx฿  │                                │         │
│  │ └──────┘ └──────┘                                │         │
│  └──────────────────────────────────────────────────┘         │
│                                                                │
│  === By Item === (2 คอลัมน์)                                   │
│  จำนวนกลุ่มบิล                 [-] 2 [+]                       │
│  ┌─ LEFT: Items ────────┬─ RIGHT: Bill Cards ──────┐          │
│  │ เมนู x2   [บิล 1 ▾] │ ● บิล 1  N รายการ       │          │
│  │ เมนู      [บิล 2 ▾] │   xxx.xx บาท             │          │
│  │ (scroll 400px)       │ ● บิล 2  N รายการ       │          │
│  │                      │   xxx.xx บาท             │          │
│  │                      │ (scroll 400px)           │          │
│  └──────────────────────┴──────────────────────────┘          │
│                                                                │
│  ┌─ Footer ─────────────────────────────────────────────────┐  │
│  │            [ย้อนกลับ]    [แยกบิล]                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### สิ่งที่เปลี่ยนจากเดิม
- เพิ่ม Header Banner (gradient + icon + ยอดรวม)
- Mode Selector → tab style + custom icons (divide, check-list)
- By-Amount → เพิ่ม preview cards (color-coded) + p-tag จำนวนบิล
- By-Item → 2 คอลัมน์ (ซ้าย items + ขวา bill cards) + compact dropdown
- แสดง quantity (x2, x3) ถ้า > 1
- Bill cards มีสี 5 แบบหมุนวน (primary, info, success, warning, danger)
- Footer: ย้อนกลับ / แยกบิล
- Dialog width: 45vw → 55vw
- Header: "แยกบิล" → "แยกบิลชำระเงิน"

## ไฟล์ที่แก้

| # | ไฟล์ | แก้อะไร | สถานะ |
|---|------|--------|-------|
| 1 | `shared/dialogs/split-bill-dialog/split-bill-dialog.component.ts` | เพิ่ม BILL_COLORS, totalAmount, quantity, methods ใหม่ | ✅ |
| 2 | `shared/dialogs/split-bill-dialog/split-bill-dialog.component.html` | เปลี่ยน template ทั้งหมดตาม test page | ✅ |
| 3 | `features/payment/pages/checkout/checkout.component.ts` | width 55vw + header แยกบิลชำระเงิน | ✅ |
| 4 | `features/order/pages/order-detail/order-detail.component.ts` | width 55vw + header แยกบิลชำระเงิน | ✅ |
| 5 | ลบ test page ทั้งหมด | component + route + declaration | ⬜ (รอผู้ใช้ยืนยัน) |

## หมายเหตุ
- totalAmount: คำนวณจาก items ใน dialog เอง (รวม totalPrice ของ active items) — ไม่ต้องพึ่งค่าจากภายนอก
- ItemGroup interface: เพิ่ม field `quantity`
- CSS compact-dropdown: มีอยู่ใน styles.css แล้ว ไม่ต้องเพิ่ม
