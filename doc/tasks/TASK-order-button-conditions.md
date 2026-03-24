# TASK: ปรับปรุงเงื่อนไขปุ่มหน้า Order Detail

> สร้าง: 2026-03-21

## เป้าหมาย

1. **ย้ายปุ่ม "สั่งอาหาร" ไป Breadcrumb** — แสดงเฉพาะเมื่อ status = Open + canUpdate
2. **เงื่อนไขปุ่มอัจฉริยะ** — ซ่อนปุ่มที่ไม่สามารถใช้ได้ตาม item status
3. **ปุ่มขนาดเท่ากัน** — ใช้ `min-w-[100px]` ให้ปุ่ม header ทุกตัวเท่ากัน
4. **Reload หลัง action** — เพิ่ม `loadOrder()` + `commonSuccess()` หลัง ส่งครัว/ขอบิล/ยกเลิก/Void

## เงื่อนไขปุ่มใหม่

| ปุ่ม | ตำแหน่ง | เงื่อนไข |
|------|---------|----------|
| สั่งอาหาร | Breadcrumb | `status === 'Open' && canUpdate` |
| ส่งครัว | Header | `status === 'Open' && canUpdate && hasPendingItems` |
| ขอบิล | Header | `status === 'Open' && canUpdate && canRequestBill` (allItemsFinal && hasServedItems) |
| แยกบิล | Header | `status === 'Billing' && canUpdate` |
| ยกเลิก | Header | `status === 'Open' && canDelete` |

## Computed Signals

```typescript
hasPendingItems  = items.some(status === 'Pending')
allItemsFinal    = items.every(status in ['Served','Voided','Cancelled'])
hasServedItems   = items.some(status === 'Served')
canRequestBill   = allItemsFinal && hasServedItems
```

## ไฟล์ที่แก้

- `features/order/pages/order-detail/order-detail.component.ts`
- `features/order/pages/order-detail/order-detail.component.html`

## Sub-tasks

- ✅ แก้ .ts — เพิ่ม computed signals, ย้ายปุ่มไป breadcrumb, reload หลัง action
- ✅ แก้ .html — เงื่อนไขปุ่มใหม่, ขนาดเท่ากัน, ลบปุ่มสั่งอาหาร
