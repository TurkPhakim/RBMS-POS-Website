# TASK: เพิ่ม Permission Check ในหน้า Employee List + Manage

> สถานะ: **DONE** (รอผู้ใช้ re-login เพื่อทดสอบ)
> วันที่สร้าง: 2026-03-14

---

## สรุปงาน

เพิ่มการตรวจสอบสิทธิ์ (Permission) ในหน้า Employee List + Manage:
- ถ้าไม่มีสิทธิ์ write → ดูข้อมูลได้ แต่ Form disabled, ซ่อนปุ่มบันทึก + เพิ่ม + ลบ
- ใช้ระบบ Permission ที่มีอยู่แล้ว (`AuthService.hasPermission()`, `PermissionGuard`)

## หมายเหตุ: บั๊กที่ผู้ใช้รายงาน

ผู้ใช้รายงานว่าเข้าหน้า Employee Manage ไม่ได้ทั้ง create และ edit หลังเพิ่ม permission checks

**สาเหตุ**: permissions ใน localStorage เป็นค่าเก่าจาก login session ก่อนหน้า (ก่อนที่จะมีระบบ RBAC)
- **CREATE route**: `PermissionGuard` ตรวจ `employee.create` → ไม่พบใน localStorage → redirect ไป `/access-denied`
- **EDIT route**: `isReadOnly = !hasPermission('employee.update')` → true → form disabled, ไม่มีปุ่มบันทึก

**วิธีแก้**: **Logout แล้ว Login ใหม่** เพื่อให้ permissions ใน localStorage อัพเดตจาก backend
- Backend (migration) seed permissions ครบ 31 ตัวให้ Position 1 (ผู้ดูแลระบบ) แล้ว
- Frontend build สำเร็จ ไม่มี compile errors
- โค้ดทั้งหมดถูกต้อง ปัญหาอยู่ที่ stale data ใน localStorage เท่านั้น

---

## ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `human-resource-routing.module.ts` | เพิ่ม `PermissionGuard` + `permissions: ['employee.create']` ที่ route `/create` |
| `employee-list.component.ts` | inject AuthService, เพิ่ม `canCreate` / `canDelete`, ซ่อนปุ่มเพิ่มพนักงาน |
| `employee-list.component.html` | ซ่อนปุ่ม "สร้างผู้ใช้" (`canCreate`), "ลบ" (`canDelete`) |
| `employee-manage.component.ts` | inject AuthService, เพิ่ม `isReadOnly`, disable form, ซ่อนปุ่มบันทึก |
| `employee-manage.component.html` | ซ่อนปุ่มเพิ่ม/แก้ไข/ลบ sub-entity + upload ถ้า `isReadOnly` |

---

## Permission ที่ใช้

| Permission | ผลต่อ UI |
|-----------|----------|
| `employee.read` | เข้าหน้า list + ดูข้อมูลได้ (ควบคุมระดับ layout route) |
| `employee.create` | ปุ่ม "เพิ่มพนักงาน", ปุ่ม "สร้างผู้ใช้", เข้าหน้า create |
| `employee.update` | ปุ่ม "บันทึก", form enabled, ปุ่มแก้ไข sub-entity |
| `employee.delete` | ปุ่ม "ลบ" ในหน้า list |

---

## การทดสอบ

1. Login ด้วย user ที่มีสิทธิ์ครบ → ทุกปุ่มแสดง, form แก้ไขได้
2. Login ด้วย user ที่มีแค่ `employee.read` → ไม่เห็นปุ่มเพิ่ม/ลบ, form disabled + ไม่มีปุ่มบันทึก
3. พยายามเข้า `/create` โดยไม่มี `employee.create` → redirect ไป access-denied
4. เข้าหน้า edit ในโหมด readOnly → ปุ่ม sub-entity + upload หายไป
