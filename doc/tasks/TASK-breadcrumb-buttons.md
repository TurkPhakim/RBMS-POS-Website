# TASK: ย้ายปุ่ม Save/Back ไป Breadcrumb

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-11
**วันที่เสร็จ**: -

> ย้ายปุ่ม "บันทึก" และ "กลับ" จากด้านล่างฟอร์มไปแสดงที่ breadcrumb area แทน โดยใช้ BreadcrumbService ที่มีอยู่แล้ว
> เอกสารอ้างอิง: [frontend-guidelines.md](../development/frontend-guidelines.md)

---

## กฎที่ต้องยึดถือตลอดการทำ Task

- ปุ่ม "กลับ" ต้องใช้คำว่า **"กลับ"** ไม่ใช่ "ยกเลิก"
- ปุ่ม Save + กลับ ต้องอยู่ที่ **breadcrumb** เท่านั้น ห้ามอยู่ด้านล่างฟอร์ม
- ทุก manage component **ต้องมี `ngOnDestroy`** เรียก `breadcrumbService.clearButtons()`
- ใช้ `BreadcrumbService.addOrUpdateButton()` ลงทะเบียนปุ่มใน `ngOnInit()`
- ใช้ `BreadcrumbService.setButtonLoading()` / `setButtonDisabled()` สำหรับ sync state

---

## Dependencies / สิ่งที่ต้องเตรียม

- BreadcrumbService (`core/services/breadcrumb.service.ts`) — พร้อมใช้งานแล้ว
- NgRx Store (layout actions/reducer/selectors) — พร้อมใช้งานแล้ว
- TopBreadcrumbComponent — render ปุ่มจาก store อยู่แล้ว
- BreadcrumbButton, Pbutton interfaces — อยู่ใน `shared/component-interfaces.ts`

---

## แผนการทำงาน

### Phase 1 — แก้ไข Manage Components (3 ไฟล์)

กระทบ: 3 หน้า manage (employee, menu, service-charge) | ความซับซ้อน: ต่ำ

#### 1.1 employee-manage (`features/human-resource/pages/employee-manage/`)

**ปัญหาปัจจุบัน:**
- ปุ่ม "ยกเลิก" + "บันทึก" อยู่ด้านล่างฟอร์ม (HTML บรรทัด 322-329)
- ไม่มี `ngOnDestroy`
- ใช้คำว่า "ยกเลิก" แทน "กลับ"

**เป้าหมาย:**
- ลบปุ่มด้านล่างออก
- เพิ่ม `OnDestroy` + inject `BreadcrumbService`
- ลงทะเบียนปุ่ม "กลับ" (secondary, outlined) + "บันทึก" ใน `ngOnInit()`
- เพิ่ม `ngOnDestroy()` เรียก `clearButtons()`

#### 1.2 menu-manage (`features/menu/pages/menu-manage/`)

**ปัญหาปัจจุบัน:**
- ปุ่ม "ยกเลิก" + "บันทึก" อยู่ด้านล่างฟอร์ม (HTML บรรทัด 193-200)
- ไม่มี `ngOnDestroy`

**เป้าหมาย:**
- เหมือน 1.1

#### 1.3 service-charge-manage (`features/admin/pages/service-charge-manage/`)

**ปัญหาปัจจุบัน:**
- ปุ่ม "ยกเลิก" + "บันทึก" อยู่ด้านล่างฟอร์ม (HTML บรรทัด 114-131)
- ไม่มี `ngOnDestroy`

**เป้าหมาย:**
- เหมือน 1.1

### Phase 2 — เพิ่มกฎใน CLAUDE.md

กระทบ: CLAUDE.md | ความซับซ้อน: ต่ำ

#### 2.1 เพิ่มกฎ Breadcrumb Buttons ใน CLAUDE.md

**เป้าหมาย:**
- เพิ่มกฎว่าหน้า manage ทุกหน้าต้องใช้ breadcrumb buttons
- ต้องมี `ngOnDestroy` + `clearButtons()`
- ปุ่ม "กลับ" ไม่ใช่ "ยกเลิก"

---

## ลำดับที่แนะนำในการทำ

```
1. Phase 1.1  employee-manage     ← ทำเป็นต้นแบบ
2. Phase 1.2  menu-manage         ← ทำตาม pattern เดียวกัน
3. Phase 1.3  service-charge-manage  ← ทำตาม pattern เดียวกัน
4. Phase 2.1  CLAUDE.md           ← เพิ่มกฎหลังแก้โค้ดเสร็จ
```
