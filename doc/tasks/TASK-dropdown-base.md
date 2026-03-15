# TASK: DropdownBaseComponent + จัดโฟลเดอร์ Dropdown

> สถานะ: เสร็จสมบูรณ์ | วันที่เริ่ม: 2026-03-12 | วันที่เสร็จ: 2026-03-12

## ปัญหาปัจจุบัน

- Dropdown 4 ตัวกระจายอยู่ใน `shared/components/` ปนกับ component อื่น
- ไม่มี base class — เขียน boilerplate ซ้ำทุกตัว
- ใช้ `@Input value` + `@Output valueChange` แทน ControlValueAccessor
- ไม่รองรับ lazy load / pagination

## เป้าหมาย

- สร้าง `DropdownBaseComponent` + ControlValueAccessor เป็นมาตรฐานกลาง
- ย้ายทุก dropdown ไป `shared/components/dropdowns/`
- ใช้ `formControlName` binding แทน verbose `[value]/(valueChange)`
- เตรียม lazy load สำหรับ dropdown ขนาดใหญ่ในอนาคต

## รายละเอียด

ดู Plan file: `C:\Users\Phakim Sangunpat\.claude\plans\eventual-sniffing-hippo.md`

## Phases

- [x] Phase 1: สร้าง DropdownBaseComponent (TS + HTML)
- [x] Phase 2: สร้าง child dropdowns 4 ตัว (extends base)
- [x] Phase 3: อัพเดต SharedModule + ลบ dropdown เดิม
- [x] Phase 4: แก้ page templates ใช้ formControlName
- [x] Phase 5: อัพเดต CLAUDE.md + Build ตรวจสอบ
