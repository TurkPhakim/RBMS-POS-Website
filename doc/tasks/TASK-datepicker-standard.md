# TASK: ตั้งค่า DatePicker มาตรฐานกลาง + Thai Locale

> สถานะ: กำลังดำเนินการ | เริ่ม: 2026-03-12

## ปัญหาปัจจุบัน
- ใช้ `<input type="date">` (native browser) → ปรับ UI ไม่ได้, format ขึ้นกับ OS locale
- ไม่รองรับปี พ.ศ.
- ไม่มี DateFormat Pipe มาตรฐาน

## เป้าหมาย
- ใช้ `primeng-buddhist-year-datepicker` แสดงปี พ.ศ. อัตโนมัติ
- Thai locale (ชื่อเดือน/วันภาษาไทย) เป็นมาตรฐานทั้ง app
- DatePicker Icon Directive ใส่ icon อัตโนมัติ
- DateFormat Pipe สำหรับแสดงวันที่ตามรูปแบบต่างๆ

## Phase 1: Infrastructure

### 1.1 ติดตั้ง package
- [ ] `npm install primeng-buddhist-year-datepicker`

### 1.2 Thai Locale Config (app.module.ts)
- [ ] เพิ่ม `translation` ใน `providePrimeNG()`

### 1.3 DatePickerModule (shared.module.ts)
- [ ] import จาก `primeng-buddhist-year-datepicker`
- [ ] เพิ่มใน PRIMENG_MODULES

### 1.4 DatePicker Icon Directive
- [ ] สร้าง `shared/directives/datepicker-icon.directive.ts`
- [ ] date → pi-calendar, timeOnly → pi-clock

### 1.5 DateFormat Pipe
- [ ] สร้าง `shared/pipes/date-format.pipe.ts`
- [ ] รองรับ: DATE, TIME, DATE_TIME, MONTH, DAY, thLongDate

## Phase 2: แก้ไข Components

### 2.1 employee-manage
- [ ] แทน `<input type="date">` → `<p-datepicker>` (3 จุด)
- [ ] ปรับ FormGroup ใช้ Date object
- [ ] ปรับ data loading + submit

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | Action |
|------|--------|
| `package.json` | install package |
| `src/app/app.module.ts` | Thai locale |
| `src/app/shared/shared.module.ts` | DatePickerModule + declare |
| `src/app/shared/directives/datepicker-icon.directive.ts` | สร้างใหม่ |
| `src/app/shared/pipes/date-format.pipe.ts` | สร้างใหม่ |
| `employee-manage.component.html` | แทน date input |
| `employee-manage.component.ts` | ปรับ Date handling |
