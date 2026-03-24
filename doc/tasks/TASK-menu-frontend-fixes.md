# TASK: แก้ไข Frontend Menu ให้ครบตาม REQ

**สถานะ**: COMPLETED
**วันที่เริ่ม**: 2026-03-18
**วันที่เสร็จ**: 2026-03-18

> เก็บตก 5 จุดที่ยังไม่ตรงกับ REQ-menu-system.md
> อ้างอิง: [REQ-menu-system.md](../requirements/REQ-menu-system.md)
> Task หลัก: [TASK-menu-frontend.md](./TASK-menu-frontend.md) (COMPLETED)

---

## สิ่งที่ต้องแก้ (5 จุด)

### Fix 1 — SubCategory Manage: เพิ่ม Card 2 เมนูในหมวดหมู่ (REQ 7.4)

**ปัญหาปัจจุบัน:** หน้า SubCategory Manage มีแค่ Card 1 (form) — ขาดตารางแสดงเมนูในหมวดหมู่ (edit mode)
**เป้าหมาย:** เพิ่ม Card 2 ตาราง read-only 7 คอลัมน์ (รหัส, รูปเมนู, ชื่อไทย, ชื่ออังกฤษ, ราคา, ช่วงเวลา, สถานะ)
**วิธี:** ใช้ `menuItemsGetMenusGet({ subCategoryId })` โหลดแยก — ไม่ต้องแก้ Backend
**ไฟล์:**
- `features/menu/pages/sub-category-manage/sub-category-manage.component.ts`
- `features/menu/pages/sub-category-manage/sub-category-manage.component.html`

---

### Fix 2 — Menu List: เพิ่มคอลัมน์ช่วงเวลา (REQ 7.5)

**ปัญหาปัจจุบัน:** ตารางมี 9 คอลัมน์ — ขาดคอลัมน์ "ช่วงเวลา"
**เป้าหมาย:** เพิ่มคอลัมน์ "ช่วงเวลา" (w-[120px]) แสดง badge: ทั้งวัน / ช่วง 1 / ช่วง 2 / ปิด
**ไฟล์:**
- `features/menu/pages/menu-list/menu-list.component.ts` — เพิ่ม `getPeriodLabel()` helper
- `features/menu/pages/menu-list/menu-list.component.html` — เพิ่มคอลัมน์ + colspan 9→10

---

### Fix 3 — Menu Manage: Auto-close IsAvailable เมื่อปิดทั้ง 2 ช่วง (REQ 3.3)

**ปัญหาปัจจุบัน:** ปิดทั้ง 2 ช่วง แต่ IsAvailable ยังเปิดอยู่
**เป้าหมาย:** เมื่อ hasTwoPeriods=true + ปิด period1 + period2 → auto set isAvailable=false (เงียบ)
**วิธี:** Watch valueChanges ของ isAvailablePeriod1/2 → ถ้าทั้งคู่ false → patchValue isAvailable=false
**ไฟล์:**
- `features/menu/pages/menu-manage/menu-manage.component.ts`

---

### Fix 4 — Menu Manage Card 6: Drag & drop + แสดงราคาตัวเลือก (REQ 7.6)

**ปัญหาปัจจุบัน:** ตัวเลือกเสริมไม่มี drag handle + ไม่แสดงราคาเพิ่ม
**เป้าหมาย:**
- เพิ่ม CDK DragDrop + drag handle column (⠿ w-[40px])
- ตัวเลือกแสดงราคา: "ไข่ดาว(+10), ชีส(+15)"
- เพิ่ม `onOptionGroupDrop()` method
**ไฟล์:**
- `features/menu/pages/menu-manage/menu-manage.component.ts`
- `features/menu/pages/menu-manage/menu-manage.component.html`

---

### Fix 5 — OptionGroup Manage Card 3: เพิ่มคอลัมน์รูปเมนู + แยกชื่อไทย/อังกฤษ (REQ 7.8)

**ปัญหาปัจจุบัน:** ตาราง linked menus มี 4 คอลัมน์ — ขาดรูปเมนู + ชื่อรวม 2 บรรทัดแทนที่จะแยกคอลัมน์
**เป้าหมาย:** เปลี่ยนเป็น 6 คอลัมน์ตาม REQ (รหัส, รูปเมนู, ชื่อไทย, ชื่ออังกฤษ, ประเภท, สถานะ)
**ไฟล์:**
- `features/menu/pages/option-group-manage/option-group-manage.component.ts` — เพิ่ม `getImageUrl()` + inject `ApiConfiguration`
- `features/menu/pages/option-group-manage/option-group-manage.component.html`

---

## ลำดับการทำงาน

```
Fix 1 → SubCategory Manage Card 2
Fix 2 → Menu List ช่วงเวลาคอลัมน์
Fix 3 → Menu Manage auto-close
Fix 4 → Menu Manage Card 6 drag & drop + ราคา
Fix 5 → OptionGroup Manage Card 3 columns
```

**หมายเหตุ:** ไม่ต้องแก้ Backend และไม่ต้อง gen-api ใหม่ — ทุก fix เป็น Frontend เท่านั้น
