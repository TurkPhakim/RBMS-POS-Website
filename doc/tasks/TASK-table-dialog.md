# TASK: เปลี่ยน Table Manage จาก Page → Dialog

## สถานะ: ✅ เสร็จแล้ว

## ปัญหา
เพิ่ม/แก้ไขโต๊ะ ใช้ page component (`/table/tables/create`, `/table/tables/update/:tableId`) ที่ต้อง navigate ออกจากหน้า list — ไม่สะดวกเหมือนการจัดการโซนที่ใช้ Dialog

## เป้าหมาย
เปลี่ยนเป็น Dialog เหมือน zone-dialog — เปิดจาก zone-list ไม่ต้อง navigate ไปหน้าอื่น

## Design

### Table Dialog
- Pattern เดียวกับ zone-dialog (DynamicDialog + card-template)
- Form 4 fields: ชื่อโต๊ะ, โซน, ความจุ, ขนาด
- รับ `config.data.tableId` (null = เพิ่ม, number = แก้ไข)
- audit-footer แบบ compact (edit mode)
- ปุ่ม ยกเลิก + บันทึก
- ตัด "สถานะปัจจุบัน" ออก (runtime info ไม่เกี่ยวกับการจัดการ)

### ไฟล์ที่แก้
- **สร้างใหม่:** `features/table/dialogs/table-dialog/table-dialog.component.ts` + `.html`
- **แก้:** `zone-list.component.ts` (เปิด dialog แทน navigate), `table-routing.module.ts`, `table.module.ts`
- **ลบ:** `table-manage.component.ts` + `.html`

---

## Sub-tasks
- ✅ สร้าง `table-dialog.component.ts` + `.html`
- ✅ อัพเดต `zone-list.component.ts` — เปิด dialog แทน navigate
- ✅ ลบ table-manage page + routes
- ✅ อัพเดต `table.module.ts`
