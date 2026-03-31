# TASK: ปรับ Flow Mobile Web — Redirect ตามสถานะ + Disable สั่งอาหารเมื่อรอชำระ

> สร้าง: 2026-03-31

## สรุปปัญหา
1. ลูกค้าสแกน QR เข้า Mobile Web → navigate ไป `/menu` เสมอ แม้ขอบิลไปแล้ว → เจอ error modal
2. หน้าตะกร้า ไม่มีการ disable ปุ่ม "สั่งอาหาร" เมื่ออยู่สถานะรอชำระ → กดแล้วเจอ error

## เป้าหมาย
- หลัง auth → redirect ตามสถานะ order (Billing → bill page, Open → menu)
- หน้าตะกร้า → disable ปุ่ม + แสดงเตือนแดง "กำลังอยู่ในกระบวนการรอชำระเงิน"

## ไฟล์ที่ต้องแก้

### Backend
| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| `CustomerAuthResponseModel.cs` | เพิ่ม OrderStatus (string?), HasBills (bool) |
| `SelfOrderService.cs` (AuthenticateAsync) | Query active order → set status + hasBills |

### Frontend (Mobile Web)
| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| gen-api | สร้าง models ใหม่ |
| `auth.component.ts` | Redirect ตามสถานะ |
| `cart-page.component.ts` | เช็ค orderStatus + signal |
| `cart-page.component.html` | Disable ปุ่ม + banner เตือนแดง |

## Sub-tasks

### Phase 1: Backend ✅
- ✅ 1.1 เพิ่ม `OrderStatus` + `HasBills` ใน `CustomerAuthResponseModel`
- ✅ 1.2 อัพเดต `SelfOrderService.AuthenticateAsync()` — query order + set fields

### Phase 2: Frontend (Mobile Web) ✅
- ✅ 2.1 gen-api (ผู้ใช้รัน)
- ✅ 2.2 แก้ `auth.component.ts` — redirect ตามสถานะ
- ✅ 2.3 แก้ `cart-page.component.ts` + HTML — disable ปุ่ม + เตือนแดง
