# TASK: นำดีไซน์จาก test-reservation ไปใช้ในหน้าจริง reservation-list

> สร้าง: 2026-03-27 | สถานะ: ✅ เสร็จสมบูรณ์

## เป้าหมาย
นำสไตล์ที่ผ่านการอนุมัติจาก `test-reservation.component` ไปใช้ในหน้าจริง `reservation-list.component` ให้ตรง 100%

## ไฟล์ที่แก้
- `features/table/pages/reservation-list/reservation-list.component.html`
- `features/table/pages/reservation-list/reservation-list.component.ts`

## ข้อจำกัด
- แก้เฉพาะ UI/styling — **ห้ามแก้** business logic, API, permissions, dialog, breadcrumb

---

## รายการแก้ไข

### Phase 1: Calendar Header
- ✅ Spacer + Dropdown container: `w-[180px]` → `w-[280px]`
- ✅ Day header text: `text-sm` → `text-lg`

### Phase 2: Day Cells
- ✅ Selected date style: `bg-primary text-white` → `bg-primary-light ring-2 ring-primary text-primary`
- ✅ Today: ลบ "วันนี้" label + ring → ใช้วงกลม `w-9 h-9 bg-primary text-white`
- ✅ Font weight: แยก today (circle) กับ selected (bold) กับ currentMonth (semibold)
- ✅ Status dots: `gap-0.5 mt-1` → `gap-1.5 mt-2`, ลบ ring on selected
- ✅ Count badge: ลบ conditional color → ใช้ `bg-primary text-white` เสมอ

### Phase 3: Day Detail Title
- ✅ เปลี่ยนจาก `text-section-title` + badge → Icon box (calendar-clock) + `text-2xl` + count text

### Phase 4: Timeline Cards
- ✅ Gap + sizing: `gap-4` → `gap-5`, `w-[70px]` → `w-[80px]`, `text-lg` → `text-2xl`, `w-px` → `w-0.5`, `p-4 mb-3` → `px-6 py-5 mb-4`, เพิ่ม `pt-5`
- ✅ Card layout: Status+Actions แถวบน (justify-between), Customer name แยกแถว
- ✅ Text sizes: Status badge `text-xs px-2.5 py-0.5` → `text-sm px-3 py-1`, Details `text-sm gap-x-5` → `text-lg gap-x-6`
- ✅ Detail icons: `pi pi-phone` → `telephone`, `pi pi-users` → `human`, `floors w-4` → `table w-5`
- ✅ Table text: เพิ่ม prefix "โต๊ะ"
- ✅ Note icon: `pi pi-comment` → `chat-message` generic icon
- ✅ Buttons: `w-9 h-9 gap-1.5` → `w-10 h-10 gap-2`, ยืนยัน `bg-primary` → `bg-cleaning`, Check-in ใช้ `check-in` icon `w-7 h-7`, แก้ไข ใช้ `eye` `w-6 h-6`, ไม่มา ใช้ `user-minus` `w-6 h-6`, ลบ `text-sm` จาก pi icons

### Phase 5: TS — Status Colors
- ✅ `getStatusColor('NoShow')`: `text-surface-sub` → `text-white`
- ✅ `getStatusBgColor('NoShow')`: `bg-surface` → `bg-surface-sub`
