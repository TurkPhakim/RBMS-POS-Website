# TASK: ปรับปรุง UI สลิปลูกค้า (Scenario A) ให้ตรงกับ Scenario B

> สร้าง: 2026-03-31

## สรุปปัญหา
เมื่อลูกค้าส่งสลิปมา (Scenario A) ข้อมูล OCR แสดงแค่ยอดเงิน + สถานะ
แต่เมื่อพนักงานแนบสลิปเอง (Scenario B) แสดงครบ: ยอดเงิน, วันที่โอน, บัญชีปลายทาง, การตรวจสอบทั้งหมด
→ ต้องทำให้ Scenario A แสดงข้อมูลเท่า Scenario B + ปรับ UI

## เป้าหมาย
- Backend: เก็บ date/account/matching จาก OCR สำหรับสลิปลูกค้า (ปัจจุบันเก็บแค่ amount + status)
- Frontend: ปรับ Scenario A ให้ layout เหมือน Scenario B (grid OCR panel + image preview)
- UI: เปลี่ยน icon เป็น check-in, text เป็น "ลูกค้าแนบสลิปชำระเงินมาแล้ว", text ใหญ่ขึ้น, กดพรีวิวรูปได้

## ไฟล์ที่ต้องแก้

### Backend
| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| `TbOrderBill.cs` | เพิ่ม 4 fields: OcrTransferDate, OcrAccountNumber, IsAccountMatched, IsDateToday |
| `TbOrderBillConfiguration.cs` | เพิ่ม property config |
| Migration | `AddCustomerSlipOcrDetails` |
| `CustomerService.cs` | เพิ่ม date/account verification + store ลง entity |
| `OrderBillResponseModel.cs` | เพิ่ม 4 fields |
| `OrderBillMapper.cs` | เพิ่ม mapping |

### Frontend
| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| gen-api | สร้าง models ใหม่ |
| `qr-payment-dialog.component.html` | ปรับ Scenario A layout ทั้งหมด |

## Sub-tasks

### Phase 1: Backend ✅
- ✅ 1.1 เพิ่ม 4 fields ใน `TbOrderBill` entity
- ✅ 1.2 อัพเดต `TbOrderBillConfiguration`
- ✅ 1.3 สร้าง Migration (`AddCustomerSlipOcrDetails`) — รอ Docker เพื่อ update DB
- ✅ 1.4 อัพเดต `CustomerService.UploadSlipAsync()` — date/account verification + store
- ✅ 1.5 อัพเดต `OrderBillResponseModel` + `OrderBillMapper`

### Phase 2: Frontend ✅
- ✅ 2.1 Docker + database update + restart Backend + gen-api (ผู้ใช้รัน)
- ✅ 2.2 ปรับ Scenario A HTML: p-image preview, check-in icon, text ใหม่, OCR grid panel
