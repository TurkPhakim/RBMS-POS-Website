# TASK: Icon System — GenericIcon + PrimeIcons

**สถานะ**: DONE
**วันที่เริ่ม**: 2026-03-11
**วันที่เสร็จ**: 2026-03-11

> สร้างระบบ icon ที่เปลี่ยนสีผ่าน Tailwind `text-*` class ได้ตรงๆ + ใช้ PrimeIcons สำหรับ icon ทั่วไป
> เอกสารอ้างอิง: [design-system.md](../architecture/design-system.md)

---

## กฎที่ต้องยึดถือ

- ใช้ `<app-generic-icon name="xxx">` สำหรับ custom SVG icon
- ใช้ `<i class="pi pi-xxx">` สำหรับ icon ทั่วไป (plus, search, chevron)
- ห้ามใช้ `<img>` สำหรับ icon — ใช้ได้เฉพาะ logo/รูปภาพจริง
- SVG ทุกไฟล์ต้องใช้ `currentColor` (ห้าม hardcode สี)
- เปลี่ยนสีผ่าน `class="text-{color}"` — ห้ามใช้ CSS filter

---

## แผนการทำงาน

### Phase 1 — สร้าง GenericIconComponent + ปรับ SVG

#### 1.1 สร้าง GenericIconComponent (`shared/components/generic-icon/`)

**ปัญหาปัจจุบัน:**
- ไม่มี icon component — ใช้ `<img>` ตรงๆ ทุกที่
- เปลี่ยนสี icon ผ่าน CSS filter ไม่แม่นยำ

**เป้าหมาย:**
- สร้าง component ที่ fetch SVG → inject เข้า DOM → รองรับ `currentColor`
- Static cache ไม่โหลดซ้ำ
- `standalone: false`, constructor injection

#### 1.2 ปรับ SVG ทุกไฟล์ (`public/icons/`)

**ปัญหาปัจจุบัน:**
- SVG format ไม่สม่ำเสมอ — บางตัว `fill="#000000"` บางตัว `currentColor`

**เป้าหมาย:**
- ทุกไฟล์ใช้ `fill="currentColor"` / `stroke="currentColor"`

### Phase 2 — อัพเดต templates

#### 2.1 Header, Sidebar, Login, Modals, Feature pages

**เปลี่ยนจาก → เปลี่ยนเป็น:**
```
<img src="icons/xxx.svg" class="brightness-0 invert"> → <app-generic-icon name="xxx" class="text-white">
<img src="icons/xxx.svg" class="icon-danger">          → <app-generic-icon name="xxx" class="text-danger">
<img src="icons/xxx.svg" class="icon-success">         → <app-generic-icon name="xxx" class="text-success">
<img src="icons/xxx.svg" class="icon-warning">         → <app-generic-icon name="xxx" class="text-warning">
<img src="icons/xxx.svg" class="opacity-40">           → <app-generic-icon name="xxx" class="text-surface-sub">
```

#### 2.2 MenuItem interface

**เปลี่ยนจาก → เปลี่ยนเป็น:**
```
icon: 'icons/dashboard.svg' → icon: 'dashboard'
```

### Phase 3 — ลบ CSS filter + cleanup

- ลบ `.icon-danger`, `.icon-warning`, `.icon-success` จาก `styles.css`
- ลบ `brightness-0 invert` จาก templates ทั้งหมด

### Phase 4 — เอกสาร

- สร้าง `doc/architecture/icon-system.md`
- อัพเดต `CLAUDE.md` กฎ icon
- อัพเดต `MEMORY.md`

---

## ลำดับที่แนะนำ

```
1. Phase 1.1  สร้าง GenericIconComponent     ← foundation ต้องมีก่อน
2. Phase 1.2  ปรับ SVG ให้ใช้ currentColor   ← icon ต้องพร้อมก่อน migrate
3. Phase 2    อัพเดต templates ทั้งหมด        ← เปลี่ยนจาก <img> → <app-generic-icon>
4. Phase 3    ลบ CSS filter                   ← cleanup หลัง migrate เสร็จ
5. Phase 4    เอกสาร                          ← บันทึกสถาปัตยกรรมใหม่
```
