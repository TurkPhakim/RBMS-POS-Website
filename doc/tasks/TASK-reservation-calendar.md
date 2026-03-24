# TASK: หน้าจัดการการจอง — Calendar View

> สถานะ: กำลังทำ | เริ่ม: 2026-03-19

## เป้าหมาย

เปลี่ยนหน้า "จัดการการจอง" จากตาราง + pagination เป็น **Calendar View (Month View)** เต็มหน้าจอ

## ขอบเขต

- แสดงปฏิทินเดือน — แต่ละวันมีจุดสีตาม status ของ reservation
- กดวันใดก็ได้ → แสดงรายละเอียดด้านล่างปฏิทิน
- มีปุ่ม action ครบ: ยืนยัน, Check-in, แก้ไข, ยกเลิก, ไม่มา
- filter สถานะ + ปุ่ม "วันนี้"

## ไฟล์ที่แก้

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `reservation-list.component.ts` | เปลี่ยน logic เป็น calendar (currentMonth, selectedDate, calendarDays) |
| `reservation-list.component.html` | เปลี่ยน template เป็น calendar grid + day detail cards |

## สถานะ

- [ ] สร้าง Task file
- [ ] แก้ reservation-list.component.ts
- [ ] แก้ reservation-list.component.html
- [ ] ตรวจสอบ build
