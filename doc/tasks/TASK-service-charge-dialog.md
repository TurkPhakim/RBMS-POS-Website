# TASK: เปลี่ยน Service Charge Manage จาก Page เป็น Dialog

> สร้าง: 2026-03-21

## เป้าหมาย

เปลี่ยนการเพิ่ม/แก้ไข Service Charge จากหน้า page (navigate ไป route ใหม่) เป็นเปิด Dialog แทน — ใช้ pattern เดียวกับ `zone-dialog`

## Design

- **เพิ่ม**: เปิด dialog ไม่ส่ง data → create mode
- **แก้ไข**: โหลด data จาก API ตาม id → ส่งผ่าน `config.data.serviceCharge` → edit mode
- **Read-only**: ถ้าไม่มี permission update → form disabled, ไม่แสดงปุ่มบันทึก
- **close(true)** → list reload data / **close(false)** → ไม่ทำอะไร
- Dialog config: `width: '50vw'`, `styleClass: 'card-dialog'`, `showHeader: false`

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | Action |
|------|--------|
| `features/admin/dialogs/service-charge-dialog/*.ts, *.html` | สร้างใหม่ |
| `features/admin/pages/service-charge-list/service-charge-list.component.ts` | แก้ไข |
| `features/admin/admin-routing.module.ts` | แก้ไข (ลบ route create/update) |
| `features/admin/admin.module.ts` | แก้ไข (ลบ ManageComponent, เพิ่ม DialogComponent) |
| `features/admin/pages/service-charge-manage/*.ts, *.html` | ลบ |

## Sub-tasks

- ✅ สร้าง Task file
- ✅ สร้าง service-charge-dialog component (TS + HTML)
- ✅ แก้ service-charge-list ให้เปิด Dialog แทน navigate
- ✅ ลบ route create/update จาก admin-routing
- ✅ อัพเดต admin.module.ts
- ✅ ลบ service-charge-manage component
