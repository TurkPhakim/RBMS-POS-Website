# TASK: เพิ่ม Required Validation + Duplicate Check (เลขบัตร/อีเมล)

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-14
**วันที่เสร็จ**: 2026-03-14

> เพิ่ม required validation 10 ฟิลด์ + duplicate check แบบ realtime (blur) สำหรับเลขบัตรประชาชนและอีเมล รวม soft-deleted records
> เอกสารอ้างอิง: [database-api-reference.md](../architecture/database-api-reference.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- FieldErrorComponent ใช้ `control.dirty` เท่านั้น (ไม่ใช้ `touched`) — error แสดงเมื่อ `markFormDirty()` ตอนกดบันทึก
- Duplicate check ยิงตอน blur ออกจากฟิลด์ — ไม่รอ submit
- ตรวจรวม soft-deleted records ด้วย `IgnoreQueryFilters()`
- Frontend maxLength ต้องตรงกับ Backend StringLength

---

## แผนการทำงาน (แบ่งเป็น Phase)

### Phase 1 — Backend: API ตรวจซ้ำ + Required

กระทบ: Repository, Service, Controller, Request Models | ความซับซ้อน: ปานกลาง

#### 1.1 แก้ Repository IgnoreQueryFilters (`EmployeeRepository.cs`)

**ปัญหาปัจจุบัน:**
- `IsNationalIdExistsAsync()` และ `IsEmailExistsAsync()` ใช้ `_dbSet` ซึ่งมี Global Query Filter กรอง DeleteFlag=true ออกอัตโนมัติ
- ทำให้สร้างพนักงานซ้ำกับคนที่ถูกลบ (soft delete) ได้

**เป้าหมาย:**
- ใช้ `_context.Set<TbEmployee>().IgnoreQueryFilters()` แทน `_dbSet` เพื่อตรวจรวม records ที่ถูก soft delete

#### 1.2 เพิ่ม `[Required]` ใน Request Models (`CreateEmployeeRequestModel.cs` + `UpdateEmployeeRequestModel.cs`)

**ปัญหาปัจจุบัน:**
- หลายฟิลด์ไม่มี `[Required]` ทำให้ส่งค่าว่างได้

**เป้าหมาย:**
- เพิ่ม `[Required]` ให้ 10 ฟิลด์: Title, Nickname, DateOfBirth, NationalId, Nationality, Religion, LineId, PositionId, Phone, Email

#### 1.3 เพิ่ม Service method (`IEmployeeService.cs` + `EmployeeService.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี method สำหรับตรวจซ้ำแบบ generic (รับ field name)

**เป้าหมาย:**
- เพิ่ม `CheckDuplicateAsync(string field, string value, int? excludeEmployeeId)` ที่รองรับ `nationalId` และ `email`

#### 1.4 เพิ่ม Controller endpoint (`HumanResourceController.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี API endpoint สำหรับตรวจซ้ำ

**เป้าหมาย:**
- เพิ่ม `GET /api/humanresource/check-duplicate?field=xxx&value=xxx&excludeEmployeeId=xxx`
- Response: `BaseResponseModel<bool>` — `true` = ซ้ำ

---

### Phase 2 — Frontend: Required + Duplicate Check

กระทบ: employee-manage component, field-error component | ความซับซ้อน: ปานกลาง

#### 2.1 เพิ่ม duplicate error ใน FieldErrorComponent (`field-error.component.ts`)

**ปัญหาปัจจุบัน:**
- ไม่มี error key `duplicate`

**เป้าหมาย:**
- เพิ่ม `if (errors['duplicate'])` → แสดง "ข้อมูลนี้ถูกใช้งานแล้ว"

#### 2.2 เพิ่ม Required validators + แก้ maxLength (`employee-manage.component.ts`)

**ปัญหาปัจจุบัน:**
- 10 ฟิลด์ไม่มี `Validators.required`
- maxLength บางฟิลด์ไม่ตรง Backend (nationalId: 20→13, lineId: 100→50, email: 200→100, bankName: 200→100, bankAccountNumber: 50→20)

**เป้าหมาย:**
- เพิ่ม `Validators.required` ให้ 10 ฟิลด์
- แก้ maxLength ให้ตรง Backend

#### 2.3 เพิ่ม checkDuplicate() method (`employee-manage.component.ts`)

**ปัญหาปัจจุบัน:**
- ไม่มี logic ตรวจซ้ำ

**เป้าหมาย:**
- เพิ่ม `checkDuplicate(field: 'nationalId' | 'email')` — เรียก API ตอน blur
- ถ้าซ้ำ → `setErrors({ duplicate: true })`
- ถ้าไม่ซ้ำ → ลบ error `duplicate` ออก (เก็บ error อื่นไว้)
- ส่ง `excludeEmployeeId` ตอน Edit mode

#### 2.4 แก้ template (`employee-manage.component.html`)

**ปัญหาปัจจุบัน:**
- ฟิลด์ required ใหม่ไม่มีเครื่องหมาย `*` และ `<app-field-error>`

**เป้าหมาย:**
- เพิ่ม `<span class="text-danger">*</span>` ที่ label ทุกฟิลด์ required
- เพิ่ม `<app-field-error>` ให้ฟิลด์ที่ยังไม่มี (dropdown ใช้ `type="select"`, input ใช้ `type="text"`)
- เพิ่ม `(blur)="checkDuplicate('nationalId')"` และ `(blur)="checkDuplicate('email')"`
- แก้ maxlength ของ bankAccountNumber จาก 12 เป็น 20

#### 2.5 Regenerate API client

- รัน `npm run gen-api` หลัง Backend restart

---

## ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `Backend-POS/.../Implementations/EmployeeRepository.cs` | IgnoreQueryFilters() |
| `Backend-POS/.../Interfaces/IEmployeeService.cs` | เพิ่ม CheckDuplicateAsync |
| `Backend-POS/.../Services/EmployeeService.cs` | เพิ่ม CheckDuplicateAsync |
| `Backend-POS/.../Models/CreateEmployeeRequestModel.cs` | เพิ่ม [Required] 10 ฟิลด์ |
| `Backend-POS/.../Models/UpdateEmployeeRequestModel.cs` | เพิ่ม [Required] 10 ฟิลด์ |
| `Backend-POS/.../Controllers/HumanResourceController.cs` | เพิ่ม CheckDuplicate endpoint |
| `Frontend-POS/.../field-error.component.ts` | เพิ่ม 'duplicate' error key |
| `Frontend-POS/.../employee-manage.component.ts` | เพิ่ม validators + checkDuplicate() |
| `Frontend-POS/.../employee-manage.component.html` | เพิ่ม *, field-error, blur events |
| `Frontend-POS/.../core/api/` | regenerate (gen-api) |

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1.1  IgnoreQueryFilters          ← แก้ bug ก่อน เพราะกระทบ logic ตรวจซ้ำ
2. Phase 1.2  Request Models Required     ← Backend validation ต้องพร้อมก่อน Frontend
3. Phase 1.3  Service CheckDuplicateAsync ← Business logic
4. Phase 1.4  Controller endpoint         ← เปิด API ให้ Frontend เรียก
5. Phase 2.5  gen-api                     ← สร้าง TypeScript method จาก Swagger
6. Phase 2.1  FieldError duplicate        ← เตรียม UI component
7. Phase 2.2  Validators + maxLength      ← เพิ่ม required ใน form
8. Phase 2.3  checkDuplicate() method     ← Logic ตรวจซ้ำ
9. Phase 2.4  Template                    ← แสดงผล UI
```

---

## หมายเหตุ

- Duplicate check ตรวจแบบ case-sensitive (ตาม SQL Server collation ของ database)
- ถ้า field มี error อื่น (เช่น email format ผิด, maxlength เกิน) จะไม่ยิง API ตรวจซ้ำ — ต้องแก้ error อื่นก่อน
