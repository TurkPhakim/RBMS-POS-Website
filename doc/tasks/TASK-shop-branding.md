# TASK: Dynamic Shop Branding ใน Header

> สถานะ: กำลังดำเนินการ | สร้างเมื่อ: 2026-03-13

## เป้าหมาย

Header แสดง Logo + ชื่อร้านจากตั้งค่าร้านค้า แทน hardcode เดิม (Fallback เป็น `images/RBMS_Logo.png` + `RBMS POS`)

## Scope

- แก้เฉพาะ **Header** เท่านั้น — Sidebar ใช้ logo เว็บเดิม

## ปัญหาที่แก้

- `GET /api/admin/shop-settings` ต้องการ permission `shop-settings.read` แต่ Header แสดงให้ทุก user
- สร้าง endpoint ใหม่ `GET /api/admin/shop-settings/branding` ที่ใช้แค่ `[Authorize]`

## Phase 1: Backend

| Sub-task | สถานะ |
|----------|--------|
| สร้าง `ShopBrandingResponseModel.cs` | ⬜ |
| เพิ่ม `ToBrandingResponse()` ใน Mapper | ⬜ |
| เพิ่ม `GetBrandingAsync()` ใน Service interface + impl | ⬜ |
| เพิ่ม `GetBranding` endpoint ใน Controller | ⬜ |

## Phase 2: Frontend

| Sub-task | สถานะ |
|----------|--------|
| `npm run gen-api` | ⬜ |
| สร้าง `ShopBrandingService` (`core/services/`) | ⬜ |
| แก้ Header component (TS + HTML) | ⬜ |
| แก้ Shop Settings page (เพิ่ม refresh) | ⬜ |

## Phase 3: เอกสาร

| Sub-task | สถานะ |
|----------|--------|
| อัพเดต `database-api-reference.md` | ⬜ |
