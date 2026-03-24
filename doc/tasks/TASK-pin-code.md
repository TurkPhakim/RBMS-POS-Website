# TASK: ตั้งค่า PIN Code จากหน้า Profile

> สร้างเมื่อ: 2026-03-16
> สถานะ: เสร็จสิ้น

## สรุป

เพิ่มฟีเจอร์ตั้งค่า/เปลี่ยน PIN Code 6 หลักจากหน้า Profile ผ่าน Dialog พร้อมแป้นพิมพ์ตัวเลข PIN ใช้ยืนยันการทำรายการสำคัญในอนาคต (ออกใบเสร็จ, ยกเลิกออเดอร์ ฯลฯ)

## Phase 1: Backend — PIN API

- [x] 1.1 เพิ่ม `HasPinCode` ใน EmployeeResponseModel + Mapper
- [x] 1.2 สร้าง Request Models (SetupPinRequestModel, ChangePinRequestModel) — Data Annotations
- [x] 1.3 เพิ่ม PIN methods ใน IAuthService/AuthService (SetupPinAsync, ChangePinAsync)
- [x] 1.4 เพิ่ม Endpoints ใน AuthController (pin/setup, pin/change)
- [x] 1.5 `dotnet build` ผ่าน

## Phase 2: Frontend — gen-api + Shared Component

- [x] 2.1 รัน `npm run gen-api`
- [x] 2.2 สร้าง PinKeypadComponent (shared) — declare + export ใน SharedModule
- [x] 2.3 สร้าง backspace.svg icon

## Phase 3: Frontend — PinCodeDialogComponent

- [x] 3.1 สร้าง PinCodeDialogComponent (TS + HTML)
- [x] 3.2 Declare ใน ProfileModule

## Phase 4: Frontend — เพิ่มปุ่ม PIN ใน Profile

- [x] 4.1 เพิ่มปุ่มใน Breadcrumb + dialog logic ใน ProfileComponent

## Phase 5: เอกสาร

- [x] 5.1 อัพเดต database-api-reference.md (เพิ่ม 2 endpoints)
