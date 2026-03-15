# TASK: เพิ่มฟิลด์อีเมลร้านค้าในตั้งค่าร้าน

> สถานะ: เสร็จสิ้น | สร้าง: 2026-03-15

## สรุป

เพิ่มฟิลด์ `ShopEmail` (optional) ในระบบ Shop Settings เพื่อให้ร้านค้าสามารถระบุอีเมลติดต่อได้

## ปัญหาปัจจุบัน

- ระบบ Shop Settings มีข้อมูลติดต่อ: เบอร์โทร, Facebook, Instagram, Website, Line ID
- ยังขาดช่องอีเมลร้านค้า

## เป้าหมาย

- เพิ่มฟิลด์ `ShopEmail` (optional, max 200, email validation) ในส่วน "ที่อยู่และติดต่อ"

## Phase 1: Backend

| Sub-task | สถานะ |
|----------|--------|
| เพิ่ม property `ShopEmail` ใน `TbShopSettings` entity | ✅ |
| เพิ่ม config ใน `TbShopSettingsConfiguration` | ✅ |
| เพิ่มใน `UpdateShopSettingsRequestModel` + validation | ✅ |
| เพิ่มใน `ShopSettingsResponseModel` | ✅ |
| อัพเดต `ShopSettingsMapper` (ToResponse + UpdateEntity) | ✅ |
| สร้าง Migration `AddShopEmailToShopSettings` | ✅ |

## Phase 2: Frontend

| Sub-task | สถานะ |
|----------|--------|
| เพิ่ม form control `shopEmail` ใน component TS | ✅ |
| เพิ่มช่อง Email ใน HTML template (Card ที่อยู่และติดต่อ) | ✅ |
| รัน `npm run gen-api` | ⬜ (ต้องรัน Backend ก่อน) |

## Phase 3: เอกสาร

| Sub-task | สถานะ |
|----------|--------|
| อัพเดต `database-api-reference.md` | ✅ |
