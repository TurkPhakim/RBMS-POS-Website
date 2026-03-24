# TASK: เพิ่มข้อมูลติดต่อร้านใน Mobile Web Footer

> สร้าง: 2026-03-22

## สรุปงาน

เพิ่ม 6 fields ข้อมูลติดต่อร้าน (Address, PhoneNumber, ShopEmail, Facebook, Instagram, Website) ใน `CustomerAuthResponseModel` ของ Backend → เก็บใน session ของ Frontend → แสดงเป็น Footer ใน `customer-layout` ทุกหน้าของ Mobile Web

**หมายเหตุ:** `TbShopSettings` entity มี fields เหล่านี้ครบแล้ว — ไม่ต้องแก้ Entity/Migration

---

## Footer Design

```
┌─────────────────────────────────────┐
│  ── ข้อมูลติดต่อ ──                   │
│  📍 123 ถ.สุขุมวิท กรุงเทพฯ           │  ← pi-map-marker + Address
│  📞 02-123-4567                      │  ← pi-phone + PhoneNumber (tel:)
│  ✉️ info@shop.com                    │  ← pi-envelope + ShopEmail (mailto:)
│  🌐 www.shop.com                     │  ← pi-globe + Website (link)
│  f  facebook.com/shop                │  ← pi-facebook + Facebook (link)
│  📷 @shopname                        │  ← pi-instagram + Instagram (link)
└─────────────────────────────────────┘
```

- แสดงเฉพาะ field ที่มีค่า (ไม่ null/empty)
- ถ้าทุก field เป็น null → ไม่แสดง Footer เลย
- Phone/Email/Links clickable (tel:, mailto:, target="_blank")
- Footer อยู่ใน scrollable content area (ไม่ fixed)
- PrimeIcons + สี `text-surface-sub` / `text-surface-dark`
- พื้นหลัง: `bg-surface-ground` + `border-t border-surface-border`

---

## ขั้นตอน

### Phase 1: Backend — เพิ่ม 6 fields

| # | Sub-task | ไฟล์ | สถานะ |
|---|----------|------|-------|
| 1.1 | เพิ่ม 6 properties ใน CustomerAuthResponseModel | `Backend-POS/.../Models/SelfOrder/CustomerAuthResponseModel.cs` | ✅ |
| 1.2 | Map 6 fields จาก shopSettings ใน AuthenticateAsync | `Backend-POS/.../Services/SelfOrderService.cs` | ✅ |

### Phase 2: Restart Backend + gen-api

| # | Sub-task | สถานะ |
|---|----------|-------|
| 2.1 | Kill Backend → dotnet run → ตรวจ Swagger | ✅ |
| 2.2 | บอกผู้ใช้รัน gen-api → รอยืนยัน | ✅ |

### Phase 3: Frontend — Session + Footer

| # | Sub-task | ไฟล์ | สถานะ |
|---|----------|------|-------|
| 3.1 | ลบ SessionInfo → ใช้ generated CustomerAuthResponseModel แทน + อัพเดต saveSession | `core/services/customer-auth.service.ts` | ✅ |
| 3.2 | ส่ง 6 fields ตอนเรียก saveSession | `pages/auth/auth.component.ts` | ✅ |
| 3.3 | เพิ่ม Footer ใน customer-layout | `layouts/customer-layout/customer-layout.component.ts` | ✅ |
| 3.4 | อัพเดต test-bill-waiting (mock footer) | `pages/test-bill-waiting/test-bill-waiting.component.ts` | ✅ |
