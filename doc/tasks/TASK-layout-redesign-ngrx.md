# TASK: Header + Breadcrumb + Sidebar Redesign (NgRx)

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-11
**วันที่เสร็จ**: -

> Redesign 3 component หลัก (Header, Breadcrumb, Sidebar) + ติดตั้ง NgRx Store เป็นตัวกลาง state
> อ้างอิง: plan file `swift-plotting-wreath.md`

---

## แผนการทำงาน

### Phase 1 — NgRx Setup + Interfaces
- [ ] ติดตั้ง @ngrx/store, @ngrx/effects, @ngrx/store-devtools
- [ ] สร้าง store/layout/ (state, actions, reducer, selectors, index)
- [ ] เพิ่ม Pbutton, BreadcrumbButton, แก้ MenuItem (children) ใน component-interfaces.ts

### Phase 2 — Services
- [ ] สร้าง HeaderService (wrap NgRx)
- [ ] สร้าง BreadcrumbService (wrap NgRx + auto-clear on navigation)
- [ ] Migrate SidebarService → NgRx

### Phase 3 — Header Rewrite ✅
- [x] header.component.ts — NgRx + notification bell + profile dropdown
- [x] header.component.html — UI ใหม่

### Phase 4 — Notification Panel
- [ ] notification-panel.component.ts + .html — UI เปล่า

### Phase 5 — Breadcrumb Rewrite ✅
- [x] top-breadcrumb.component.ts — dynamic buttons
- [x] top-breadcrumb.component.html — button + tieredMenu

### Phase 6 — Sidebar Rewrite ✅
- [x] side-bar.component.ts — multi-level + NgRx
- [x] side-bar.component.html — drill-down UI

### Phase 7 — Module Updates
- [ ] app.module.ts — NgRx imports
- [ ] shared.module.ts — NotificationPanel + TieredMenuModule

---

## Build Verification ✅

- `ng build` ผ่าน — ไม่มี error ใหม่ มีแค่ pre-existing errors 74 ตัว (จาก module อื่นที่ยังไม่ได้แก้)
