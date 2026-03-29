# TASK: ปรับปรุงใบ QR Scan (QR Code Dialog) — โลโก้ ชื่อร้าน WiFi กรอบ QR

> สร้าง: 2026-03-30

## บริบท

ใบ QR scan ปัจจุบัน layout 2-column (QR ซ้าย, ข้อมูลขวา) — ต้องการปรับเป็น vertical layout ที่มีข้อมูลครบ: โลโก้+ชื่อร้านเหนือ QR, กรอบ QR, โซน-โต๊ะ, วันที่, WiFi

## Layout ใหม่

```
┌──────────────────────────┐
│        [โลโก้ร้าน]        │
│     ชื่อร้านไทย            │
│     ชื่อร้านอังกฤษ          │
│                          │
│  ┌────────────────────┐  │
│  │    [QR CODE]       │  │ ← กรอบ primary-subtle
│  └────────────────────┘  │
│                          │
│  [สแกนเพื่อสั่งอาหาร]     │ ← badge
│  โซนXXX - โต๊ะYYY        │
│  30 มีนาคม 2569          │
│                          │
│  WiFi: ชื่อ / รหัส: xxx   │ ← เฉพาะเมื่อมี
└──────────────────────────┘
```

---

## Phase 1: แก้ QR Code Dialog (TS) ✅

**ไฟล์**: `Frontend-POS/RBMS-POS-Client/src/app/features/order/dialogs/qr-code-dialog/qr-code-dialog.component.ts`

- เพิ่ม WiFi fetch จาก `shopSettingsGetGet()`
- ปรับ `onDownload()` → vertical layout + logo + กรอบ QR + WiFi

## Phase 2: แก้ QR Code Dialog (HTML) — ไม่ต้องแก้ ✅

- ผู้ใช้ยืนยันว่า dialog preview คงเดิม แก้เฉพาะรูปดาวน์โหลด

---

## ไฟล์ที่แก้

| ไฟล์ | การแก้ |
|------|--------|
| `qr-code-dialog.component.ts` | เพิ่ม WiFi, ปรับ onDownload() |
| `qr-code-dialog.component.html` | layout vertical + WiFi |
