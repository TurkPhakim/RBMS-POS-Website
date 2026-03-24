# TASK: ลบ Note (หมายเหตุ) ออกจากระบบ Cashier Session

> สร้างเมื่อ: 2026-03-20

## เป้าหมาย
ลบฟิลด์ `Note` ออกจากระบบ Cashier Session ทั้งหมด (BE + FE + Migration)

## ไฟล์ที่ต้องแก้

### Backend (ลบ Note property/mapping)
| # | ไฟล์ | สถานะ |
|---|------|-------|
| 1 | `POS.Main.Dal/Entities/Payment/TbCashierSession.cs` | ✅ |
| 2 | `POS.Main.Dal/EntityConfigurations/TbCashierSessionConfiguration.cs` | ✅ |
| 3 | `POS.Main.Business.Payment/Models/CashierSession/OpenCashierSessionRequestModel.cs` | ✅ |
| 4 | `POS.Main.Business.Payment/Models/CashierSession/CloseCashierSessionRequestModel.cs` | ✅ |
| 5 | `POS.Main.Business.Payment/Models/CashierSession/CashierSessionResponseModel.cs` | ✅ |
| 6 | `POS.Main.Business.Payment/Models/CashierSession/CashierSessionMapper.cs` | ✅ |
| 7 | `POS.Main.Business.Payment/Services/CashierSessionService.cs` | ✅ |

### Migration
| # | สิ่งที่ต้องทำ | สถานะ |
|---|--------------|-------|
| 8 | สร้าง Migration `RemoveNoteFromCashierSession` | ✅ |
| 9 | รัน `dotnet ef database update` | ✅ |

### Frontend (ลบ note จาก form + display)
| # | ไฟล์ | สถานะ |
|---|------|-------|
| 10 | `payment.component.html` — ลบ `@if (session.note)` block | ✅ |
| 11 | `open-session-dialog.component.html` — ลบ note input | ✅ |
| 12 | `open-session-dialog.component.ts` — ลบ `note` จาก form | ✅ |
| 13 | `close-session-dialog.component.html` — ลบ note input | ✅ |
| 14 | `close-session-dialog.component.ts` — ลบ `note` จาก form | ✅ |

### หลัง gen-api
| # | สิ่งที่ต้องทำ | สถานะ |
|---|--------------|-------|
| 15 | Restart BE → ตรวจ Swagger → ผู้ใช้รัน gen-api | ✅ |
| 16 | Build FE สำเร็จ | ✅ |

## สรุป
✅ **เสร็จสมบูรณ์** — ลบ Note ออกจากทั้งระบบแล้ว (7 BE files + 5 FE files + 1 Migration)
