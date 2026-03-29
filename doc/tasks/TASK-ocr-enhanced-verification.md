# TASK: เพิ่ม OCR ตรวจ "วันที่โอน" + "เลขบัญชีปลายทาง"

> สร้าง: 2026-03-29

## สรุป
เพิ่มการตรวจสอบ 2 รายการใหม่ใน OCR Slip Verification:
1. **วันที่โอน** — ตรวจว่าเป็นวันนี้หรือไม่ (ป้องกันสลิปเก่า)
2. **เลขบัญชีปลายทาง** — ตรวจว่าโอนมาบัญชีร้านจริง (เทียบกับ `TbShopSettings.AccountNumber`)

ทั้งสองเป็น "ช่วยตรวจ" — ถ้า OCR อ่านไม่ได้ก็ไม่ block

## Phase 1: Backend

### 1.1 สร้าง `SlipOcrResultModel` (internal)
- ✅ `Business.Payment/Models/Payment/SlipOcrResultModel.cs`

### 1.2 แก้ `ISlipOcrService` + `SlipOcrService`
- ✅ เปลี่ยน return type → `Task<SlipOcrResultModel>`
- ✅ เพิ่ม `ParseDate(text)` — regex: วันที่ไทย/อังกฤษ/ตัวเลข
- ✅ เพิ่ม `ParseAccountNumber(text)` — regex: เลขบัญชี (label, masked, standalone)
- ✅ แก้ `CustomerService.cs` ที่เรียก method เดิม

### 1.3 แก้ `SlipUploadResultModel`
- ✅ เพิ่ม: `OcrTransferDate`, `IsDateToday`, `OcrAccountNumber`, `ShopAccountNumber`, `IsAccountMatched`

### 1.4 แก้ `PaymentService.UploadSlipAsync()`
- ✅ ใช้ `SlipOcrResultModel` + เทียบวันที่/บัญชี
- ✅ ดึง `AccountNumber` จาก `TbShopSettings` (ผ่าน `_unitOfWork.ShopSettings`)

### 1.5 Build + ตรวจ Swagger
- ✅ Build สำเร็จ
- ✅ Swagger มี fields ใหม่ครบ

## Phase 2: Frontend

### 2.1 gen-api
- ✅ ผู้ใช้รัน gen-api — generated model มี fields ครบ

### 2.2 แก้ `qr-payment-dialog.component.html`
- ✅ เพิ่มแถวแสดงผลวันที่ + บัญชี ในส่วน "ผลการตรวจสอบ OCR" (Scenario B)
- Scenario A (customer slip) ไม่มี fields ใหม่ — ข้อมูลเก็บใน bill entity ซึ่งยังไม่มี date/account

## ไฟล์ที่แก้

| ไฟล์ | การแก้ |
|------|--------|
| `Business.Payment/Models/Payment/SlipOcrResultModel.cs` | สร้างใหม่ |
| `Business.Payment/Interfaces/ISlipOcrService.cs` | เปลี่ยน return type |
| `Business.Payment/Services/SlipOcrService.cs` | เพิ่ม ParseDate + ParseAccountNumber |
| `Business.Payment/Services/CustomerService.cs` | แก้เรียก method ใหม่ |
| `Business.Payment/Models/Payment/SlipUploadResultModel.cs` | เพิ่ม 5 fields |
| `Business.Payment/Services/PaymentService.cs` | ใช้ OCR result ใหม่ + เทียบวันที่/บัญชี |
| `qr-payment-dialog.component.html` | แสดงผลตรวจเพิ่ม (วันที่ + บัญชี) |
