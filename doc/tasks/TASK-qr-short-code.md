# TASK: QR Short Code — ย่อ URL สำหรับ QR Code สั่งอาหาร

## สถานะ: ✅ เสร็จแล้ว

## ปัญหา
QR Code URL ยาวมาก (~400 ตัวอักษร) เพราะแนบ JWT token ทั้งก้อนใน query string:
```
http://localhost:4400/auth?token=eyJhbGciOiJIUzI1NiIs...ยาวมาก
```

## เป้าหมาย
ย่อ URL ให้สั้น (~40 ตัวอักษร) โดยใช้ short code:
```
https://localhost:5300/q/A7xK2m
```
เมื่อสแกน → Backend redirect ไป Mobile Web พร้อม JWT เดิม → ไม่ต้องแก้ Mobile Web

## Flow
1. Staff เปิดโต๊ะ → BE generate JWT + **short code 8 ตัว** เก็บใน `TbTable.QrShortCode`
2. Staff เปิด QR dialog → FE ใช้ URL: `{apiUrl}/q/{shortCode}`
3. ลูกค้าสแกน → ไป Backend `GET /q/{code}`
4. Backend lookup short code → หา JWT → **redirect 302** ไป `{selfOrderUrl}/auth?token={jwt}`
5. Mobile Web ทำงานเหมือนเดิม

## Design

### Backend
- เพิ่ม `QrShortCode` (string, max 10) ใน `TbTable`
- เพิ่ม unique index `IX_Tables_QrShortCode`
- `GenerateShortCode()` → random 8 ตัว (A-Z, a-z, 0-9)
- set `QrShortCode` ตอน `OpenTableAsync` + `MoveTableAsync` (เวลาเดียวกับ QrToken)
- clear `QrShortCode` ตอนปิดโต๊ะ (เหมือน QrToken)
- เพิ่ม `QrShortCode` ใน `TableResponseModel` + `TableMapper`
- สร้าง `QrRedirectController` — `GET /q/{code}` → lookup → redirect 302
- สร้าง `SelfOrderUrl` ใน config (appsettings.json) สำหรับ redirect target

### Frontend
- `qr-code-dialog.component.ts` — เปลี่ยน URL จาก `{selfOrderUrl}/auth?token={jwt}` เป็น `{apiUrl}/q/{shortCode}`
- ต้อง gen-api ก่อน (เพราะ response model เปลี่ยน)

### Mobile Web
- ไม่ต้องแก้เลย

---

## Sub-tasks

### Phase 1: Backend
- ✅ เพิ่ม `QrShortCode` ใน `TbTable` entity
- ✅ เพิ่ม config ใน `TbTableConfiguration`
- ✅ อัพเดต `TableService` — generate short code ตอน open/move table, clear ตอนปิด
- ✅ อัพเดต `TableResponseModel` + `TableMapper`
- ✅ สร้าง `QrRedirectController` — `GET /q/{code}` redirect
- ✅ เพิ่ม `SelfOrderUrl` ใน `appsettings.json`
- ✅ สร้าง Migration + รัน database update

### Phase 2: Frontend
- ✅ gen-api (ผู้ใช้รันเอง)
- ✅ อัพเดต `qr-code-dialog.component.ts` ใช้ short URL
