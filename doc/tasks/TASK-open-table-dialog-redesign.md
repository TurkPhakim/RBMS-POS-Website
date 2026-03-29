# TASK: ปรับปรุง Open Table Dialog

> สถานะ: เสร็จสมบูรณ์ | เริ่ม: 2026-03-27 | เสร็จ: 2026-03-27

## เป้าหมาย
ปรับปรุง Open Table Dialog 3 เรื่อง:
1. Header แสดง "โซน{zone} - โต๊ะ{table}" ตามมาตรฐาน
2. Quantity picker เป็นแบบ pill-shape ตาม staff-order
3. เมื่อเลือก "จองล่วงหน้า" → แสดง dropdown รายการจอง Pending ของวันนี้ + auto check-in

## ไฟล์ที่ต้องแก้/สร้าง

### Backend
- `POS.Main.Business.Table/Models/Table/OpenTableRequestModel.cs` — เพิ่ม `ReservationId?`
- `POS.Main.Business.Table/Services/TableService.cs` — เพิ่ม reservation check-in logic

### Frontend
- `shared/dropdowns/reservation-available-dropdown/reservation-available-dropdown.component.ts` — สร้างใหม่
- `shared/shared.module.ts` — declare + export
- `features/order/dialogs/open-table-dialog/open-table-dialog.component.html` — แก้ไข
- `features/order/dialogs/open-table-dialog/open-table-dialog.component.ts` — แก้ไข

## ดีไซน์

### Header
- ใช้ `#cardHeader cardHeader` แทน `headerLabel`
- แสดง: `โซน{zoneName} - โต๊ะ{tableName}`

### Quantity Picker (pill-shape)
- ปุ่ม -/+ ในกรอบ rounded-full (เหมือน staff-order)
- min=1, max=table.capacity

### Reservation Dropdown (เมื่อเลือก "จองล่วงหน้า")
- Filter: status=Pending, วันนี้, เวลา >= ปัจจุบัน-1ชม.
- Option พิเศษ: "ไม่ได้อยู่ในระบบจอง" (value=0)
- Display: "{customerName} - {HH:mm} ({guestCount} คน)"
- Auto-fill guestCount เมื่อเลือก reservation
- เมื่อ submit → Backend set reservation.Status = CheckedIn

## Sub-tasks

### Phase 1: Backend
- ✅ เพิ่ม `ReservationId?` ใน `OpenTableRequestModel`
- ✅ เพิ่ม reservation check-in logic ใน `OpenTableAsync`

### Phase 2: gen-api
- ✅ Restart BE + ตรวจ Swagger + ผู้ใช้รัน gen-api

### Phase 3: Frontend
- ✅ สร้าง `reservation-available-dropdown` (extends DropdownBaseComponent)
- ✅ แก้ Open Table Dialog HTML (header, counter, dropdown)
- ✅ แก้ Open Table Dialog TS (logic, methods, form)
- ✅ Declare ใน SharedModule
