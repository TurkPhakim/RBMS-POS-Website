# TASK: เปลี่ยน Title (คำนำหน้าชื่อ) จาก Text เป็น Enum

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-12
**วันที่เสร็จ**: 2026-03-12

> เปลี่ยน field คำนำหน้าชื่อ (Title) ของพนักงานจาก text input เป็น Enum dropdown มาตรฐาน HR (นาย/นาง/นางสาว)

---

## แผนการทำงาน

### Phase 1 — Backend (Enum + Entity + Models)

#### 1.1 สร้าง Enum `ETitle` (`POS.Main.Core/Enums/ETitle.cs`)

**ปัญหาปัจจุบัน:**
- ไม่มี Enum สำหรับคำนำหน้าชื่อ — ใช้ string อิสระ ทำให้ข้อมูลไม่สม่ำเสมอ

**เป้าหมาย:**
- สร้าง `ETitle` enum: Mr=1, Mrs=2, Miss=3

#### 1.2 แก้ Entity `TbEmployee` (`POS.Main.Dal/Entities/HumanResource/TbEmployee.cs`)

**ปัญหาปัจจุบัน:**
- `Title` เป็น `string?` — กรอกอะไรก็ได้

**เป้าหมาย:**
- เปลี่ยนเป็น `ETitle?` (nullable เพราะไม่บังคับ)

**Class เก่า → ใหม่:**
```
public string? Title → public ETitle? Title
```

#### 1.3 แก้ EntityConfiguration (`TbEmployeeConfiguration.cs`)

**ปัญหาปัจจุบัน:**
- Title config: `HasMaxLength(20)` เฉยๆ ไม่มี conversion

**เป้าหมาย:**
- เพิ่ม `HasConversion<string>()` ตาม pattern ของ Gender/EmploymentStatus

#### 1.4 แก้ Request + Response Models

**ปัญหาปัจจุบัน:**
- `CreateEmployeeRequestModel.Title` = `string?` + StringLength attribute
- `UpdateEmployeeRequestModel.Title` = `string?` + StringLength attribute
- `EmployeeResponseModel.Title` = `string?`

**เป้าหมาย:**
- ทุก Model เปลี่ยน Title เป็น `ETitle?`
- Response เพิ่ม `TitleName` property

#### 1.5 สร้าง Migration + Update Database

---

### Phase 2 — Frontend (Dropdown + Form)

#### 2.1 สร้าง `TitleDropdownComponent` (`shared/components/dropdowns/title-dropdown.component.ts`)

**ปัญหาปัจจุบัน:**
- ไม่มี dropdown component สำหรับคำนำหน้าชื่อ

**เป้าหมาย:**
- สร้าง dropdown ตาม pattern ของ `GenderDropdownComponent`
- Options: นาย/นาง/นางสาว, showClear=true (nullable)

#### 2.2 ลงทะเบียนใน SharedModule

#### 2.3 แก้ Employee Manage Form (TS + HTML)

**ปัญหาปัจจุบัน:**
- Title เป็น `<input pInputText>` กรอกเป็น text

**เป้าหมาย:**
- เปลี่ยนเป็น `<app-title-dropdown formControlName="title">`
- เปลี่ยน field error type เป็น `"select"`

#### 2.4 Regenerate API Client

---

## ลำดับที่แนะนำ

```
1. Phase 1.1-1.4  Backend Enum + Entity + Models  ← ต้องเสร็จก่อนสร้าง Migration
2. Phase 1.5      Migration                        ← ต้อง build ได้ก่อน migrate
3. Phase 2.1-2.2  Frontend Dropdown                ← สร้าง component ก่อนใช้
4. Phase 2.4      Regenerate API                   ← ต้อง Backend running ก่อน gen-api
5. Phase 2.3      แก้ Form                         ← สุดท้ายเชื่อมทุกอย่างเข้าด้วยกัน
```
