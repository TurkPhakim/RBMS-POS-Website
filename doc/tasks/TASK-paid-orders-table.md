# TASK: เพิ่มตารางออเดอร์ชำระเงินเสร็จสิ้นในหน้า Payment

> สร้างเมื่อ: 2026-03-20

## เป้าหมาย
แสดงรายการออเดอร์ที่ชำระเงินแล้วในกะปัจจุบัน พร้อมข้อมูล โซน/โต๊ะ, ประเภทลูกค้า (Walk-in/จอง), จำนวนคน

## Design

### คอลัมน์ตาราง
| คอลัมน์ | ข้อมูล | width |
|---------|--------|-------|
| เลขออเดอร์ | `payment.orderNumber` | 140px |
| โต๊ะ | `{zoneName} / {tableName}` | 160px |
| ประเภทลูกค้า | Walk-in / จองล่วงหน้า (badge) | 140px |
| จำนวนคน | `payment.guestCount` คน | 100px |
| วิธีชำระ | เงินสด / QR | 120px |
| ยอดชำระ | `payment.grandTotal` | 120px |
| เวลาชำระ | `payment.paidAt` | 160px |

### แนวทาง — embed Payments ลงใน CashierSession response
- `TbCashierSession` มี `Payments` collection อยู่แล้ว
- เพิ่ม fields ใน PaymentResponseModel: `ZoneName`, `GuestType`, `GuestCount`
- Include chain: Payments → OrderBill → Order → Table → Zone

## ไฟล์ที่แก้

### Backend
| # | ไฟล์ | สิ่งที่ทำ | สถานะ |
|---|------|----------|-------|
| 1 | `PaymentResponseModel.cs` | เพิ่ม `ZoneName`, `GuestType`, `GuestCount` | ✅ |
| 2 | `PaymentMapper.cs` | map 3 fields ใหม่ | ✅ |
| 3 | `CashierSessionResponseModel.cs` | เพิ่ม `List<PaymentResponseModel> Payments` | ✅ |
| 4 | `CashierSessionMapper.cs` | map Payments collection | ✅ |
| 5 | `CashierSessionService.cs` | Include Payments → OrderBill → Order → Table → Zone (3 queries) | ✅ |

### Frontend (หลัง gen-api)
| # | ไฟล์ | สิ่งที่ทำ | สถานะ |
|---|------|----------|-------|
| 6 | `payment.component.html` | เพิ่มตาราง "ออเดอร์ชำระเงินเสร็จสิ้น" | ✅ |

### gen-api
| # | สิ่งที่ต้องทำ | สถานะ |
|---|--------------|-------|
| 7 | Restart BE → ตรวจ Swagger → ผู้ใช้รัน gen-api | ✅ |
| 8 | Build FE สำเร็จ | ✅ |

## สรุป
✅ **เสร็จสมบูรณ์** — เพิ่มตารางออเดอร์ชำระเงินเสร็จสิ้น (5 BE files + 1 FE file)
