# TASK: เพิ่มเลข PromptPay ในตั้งค่าร้าน + ตรวจสอบ OCR

> สร้าง: 2026-03-31

## สรุปปัญหา
ระบบ OCR สลิปเปรียบเทียบเลขบัญชีจากสลิปกับเลขบัญชีร้านเพียงตัวเดียว (`AccountNumber`)
เมื่อลูกค้าโอนผ่าน PromptPay สลิปจะแสดงเลข PromptPay (เช่น 5657) ซึ่งไม่ตรงกับเลขบัญชีธนาคาร (เช่น 4400)
→ ระบบแสดง "ไม่ตรงกับบัญชีร้าน" ทั้งที่โอนมาถูกต้อง

## เป้าหมาย
- เพิ่มช่อง "เลข PromptPay" ใน `TbShopSettings`
- แก้ PaymentService ให้เช็คทั้งเลขบัญชีธนาคาร + PromptPay
- อัพเดตหน้าตั้งค่าร้าน (FE) ให้กรอกเลข PromptPay ได้

## ไฟล์ที่ต้องแก้

### Backend
| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| `TbShopSettings.cs` | เพิ่ม `PromptPayNumber` |
| Migration | เพิ่มคอลัมน์ |
| `UpdateShopSettingsRequestModel.cs` | เพิ่ม `PromptPayNumber` |
| `ShopSettingsResponseModel.cs` | เพิ่ม `PromptPayNumber` |
| `ShopSettingsMapper.cs` | เพิ่ม mapping ทั้ง ToResponse + UpdateEntity |
| `PaymentService.cs` | แก้ verification: เช็คทั้ง AccountNumber + PromptPayNumber |

### Frontend
| ไฟล์ | สิ่งที่ทำ |
|------|----------|
| gen-api | สร้าง models ใหม่ |
| หน้าตั้งค่าร้าน | เพิ่มช่อง PromptPay |

## Sub-tasks

### Phase 1: Backend ✅
- ✅ 1.1 เพิ่ม `PromptPayNumber` ใน Entity
- ✅ 1.2 สร้าง Migration (`AddPromptPayNumberToShopSettings`)
- ✅ 1.3 อัพเดต Request/Response Models
- ✅ 1.4 อัพเดต Mapper (ToResponse + UpdateEntity)
- ✅ 1.5 แก้ PaymentService: เช็คทั้ง AccountNumber + PromptPayNumber

### Phase 2: Frontend ✅
- ✅ 2.1 gen-api
- ✅ 2.2 เพิ่มช่อง PromptPay ในหน้าตั้งค่าร้าน (เปลี่ยน layout เป็น 2x2: ธนาคาร/เลขบัญชี/ชื่อบัญชี/เลขพร้อมเพย์)
