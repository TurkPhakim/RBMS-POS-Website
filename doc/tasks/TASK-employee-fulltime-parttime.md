# TASK: เพิ่ม FullTime/PartTime + Required ใน Dialog

> สถานะ: **DONE**
> วันที่สร้าง: 2026-03-14

---

## สรุปงาน

เพิ่มฟีเจอร์ 3 อย่างในหน้าจัดการพนักงาน:
1. เพิ่มฟิลด์ FullTime/PartTime พร้อม radio UI — FullTime แสดงเงินเดือนต่อเดือน, PartTime แสดงค่าจ้างรายชั่วโมง
2. ทำให้ "ตำแหน่ง" เป็น required ใน Work History dialog
3. ทำให้ "สาขาวิชา" เป็น required ใน Education dialog

---

## ไฟล์ที่แก้ไข

### Backend

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `POS.Main.Dal/Entities/HumanResource/TbEmployee.cs` | เพิ่ม `IsFullTime` (bool), `HourlyRate` (decimal?) |
| `POS.Main.Dal/EntityConfigurations/TbEmployeeConfiguration.cs` | config IsFullTime (default true) + HourlyRate (decimal 12,2) |
| `POS.Main.Business.HumanResource/Models/CreateEmployeeRequestModel.cs` | เพิ่ม IsFullTime, HourlyRate |
| `POS.Main.Business.HumanResource/Models/UpdateEmployeeRequestModel.cs` | เพิ่ม IsFullTime, HourlyRate |
| `POS.Main.Business.HumanResource/Models/EmployeeResponseModel.cs` | เพิ่ม IsFullTime, HourlyRate |
| `POS.Main.Business.HumanResource/Models/EmployeeMapper.cs` | Map IsFullTime + HourlyRate ทั้ง Create/Update/Response |
| `POS.Main.Business.HumanResource/Models/EmployeeWorkHistory/Create...RequestModel.cs` | Position → [Required] |
| `POS.Main.Business.HumanResource/Models/EmployeeWorkHistory/Update...RequestModel.cs` | Position → [Required] |
| `POS.Main.Business.HumanResource/Models/EmployeeEducation/Create...RequestModel.cs` | Major → [Required] |
| `POS.Main.Business.HumanResource/Models/EmployeeEducation/Update...RequestModel.cs` | Major → [Required] |
| Migration: `AddFullTimeAndHourlyRate` | เพิ่มคอลัมน์ IsFullTime + HourlyRate ใน TbEmployee |

### Frontend

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `employee-manage.component.ts` | เพิ่ม isFullTime, hourlyRate ใน form + valueChanges logic |
| `employee-manage.component.html` | Radio UI + conditional salary/hourlyRate |
| `work-history-dialog.component.ts` | position → Validators.required |
| `work-history-dialog.component.html` | เพิ่ม * + field-error ที่ตำแหน่ง |
| `education-dialog.component.ts` | major → Validators.required |
| `education-dialog.component.html` | เพิ่ม * + field-error ที่สาขาวิชา |
| `shared.module.ts` | เพิ่ม RadioButton import |

---

## การทดสอบ

1. เปิดหน้าเพิ่มพนักงาน → ค่าเริ่มต้นเป็น "Full-Time" + แสดงฟิลด์เงินเดือน
2. เลือก "Part-Time" → ฟิลด์เงินเดือนหายไป แสดงฟิลด์ค่าจ้างรายชั่วโมงแทน
3. กลับเป็น "Full-Time" → ฟิลด์ค่าจ้างรายชั่วโมงหายไป ค่าเงินเดือนถูก reset
4. เปิด dialog เพิ่มประวัติการทำงาน → กดบันทึกโดยไม่กรอกตำแหน่ง → ขึ้น error
5. เปิด dialog เพิ่มประวัติการศึกษา → กดบันทึกโดยไม่กรอกสาขาวิชา → ขึ้น error
6. Edit mode → IsFullTime + HourlyRate patch ค่าจาก API ถูกต้อง
