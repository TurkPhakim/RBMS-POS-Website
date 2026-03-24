# TASK: Redesign หน้าสั่งอาหาร (StaffOrderComponent)

> สร้าง: 2026-03-22

## เป้าหมาย
ปรับดีไซน์หน้าสั่งอาหาร (staff-order) ให้น่าใช้กว่าเดิม โดยเพิ่มข้อมูล แคลอรี่, ไอคอนแพ้อาหาร, Search แบบ real-time

## ดีไซน์ที่ตกลง

### Menu Card ใหม่
```
┌──────────────────────────┐
│  [IMAGE area 4:3]        │
│  ┌──────┐ ┌────────┐    │  ← Tag badges overlay
│  │แนะนำ │ │ใช้เวลา │    │
│  └──────┘ └────────┘    │
├──────────────────────────┤
│ ชื่อเมนู          ⚠     │  ← allergen icon + tooltip
│ English Name             │
│ 120 kcal                 │  ← calories
│ 120.00 บาท               │
│ ⚙ มีตัวเลือกเพิ่มเติม   │
└──────────────────────────┘
```

### Search: real-time (พิมพ์แล้ว filter ทันที, client-side)

## ไฟล์ที่แก้ (2 ไฟล์)
- `features/order/pages/staff-order/staff-order.component.ts`
- `features/order/pages/staff-order/staff-order.component.html`

## Sub-tasks

### Phase 1: แก้ TS Component ✅
- ✅ เพิ่ม searchTerm, hasTag(), onSearchInput(), clearSearch(), applyFilters()
- ✅ แก้ onSelectSubCategory() → ใช้ applyFilters()
- ✅ แก้ loadCategoryData() → reset search + applyFilters()

### Phase 2: แก้ HTML Template ✅
- ✅ เพิ่ม Search bar (real-time `(input)`, ระหว่าง category tabs กับ sub-category chips)
- ✅ แก้ Menu Card (aspect-[4/3], tag badges overlay, allergen icon + pTooltip, calories, rounded-xl)
- ✅ แก้ bg-surface-hover → `bg-primary-subtle` (tabs/chips hover), `bg-surface` (image placeholder), `bg-surface-muted/30` (cart buttons)
- ✅ เพิ่ม image hover zoom effect (`group-hover:scale-105`)
