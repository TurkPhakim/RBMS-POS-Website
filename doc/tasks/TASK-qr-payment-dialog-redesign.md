# TASK: QR Payment Dialog — ปรับปรุง UI + Zoom QR + Auto OCR

> สร้าง: 2026-03-29

## สถานะ: 🔄 กำลังดำเนินการ

## ปัญหาปัจจุบัน
1. QR Code เล็กเกินไป (`w-[160px]`) กดขยายไม่ได้
2. UI slip upload ไม่สวย ไม่มี visual consistency
3. ต้องกดปุ่ม "ตรวจสอบด้วย OCR" แยก — ควร auto OCR หลังอัพโหลดทันที
4. มีปุ่มเปลี่ยนรูป + ยืนยันด้วยตนเอง ที่ไม่จำเป็น

## เป้าหมาย
- QR Code ใหญ่ขึ้น + คลิกขยายเต็มจอ (PrimeNG `p-image`)
- ใช้ visual style คล้าย `app-image-upload-card` (decorative circles background)
- Slip upload auto OCR ทันทีหลังเลือกไฟล์
- ลบปุ่มที่ไม่จำเป็น (เปลี่ยนรูป, ตรวจ OCR แยก, ยืนยันด้วยตนเอง)

## อ้างอิง
- QR dialog: `features/payment/dialogs/qr-payment-dialog/`
- Visual pattern: `shared/cards/image-upload-card/image-upload-card.component.ts`
- PrimeNG `ImageModule` (มีใน SharedModule แล้ว)

## Design

### QR Code Display Section
- Background: `bg-primary-subtle rounded-xl border overflow-hidden relative`
- Decorative circles (clone จาก `image-upload-card`)
- QR image: `<p-image>` + `[preview]="true"` + `border-4 border-white rounded-xl` + ~200px
- Bank info + ยอดเงิน อยู่ข้างๆ QR

### Slip Upload Section
- ก่อนอัพโหลด: dashed border upload area + icon + label
- หลังอัพโหลด: preview ใน decorative background + auto OCR + spinner overlay
- ไม่มีปุ่มเปลี่ยนรูป
- OCR เสร็จ → แสดง Matched/Mismatched/None

### Flow ใหม่
- ✅ ปุ่ม "ยืนยันชำระเงิน" (หลัง OCR เสร็จ)
- ✅ ปุ่ม "ยืนยันโดยไม่มีสลิป"
- ✅ ช่อง "ยอดจริง (กรอกเอง)" เมื่อ OCR ไม่ตรง
- ✅ หมายเหตุ
- ❌ ปุ่ม "ตรวจสอบด้วย OCR" (auto)
- ❌ ปุ่ม "เปลี่ยนรูป"
- ❌ ปุ่ม "ยืนยันด้วยตนเอง"

---

## Phase 1: สร้าง Test Component

### Sub-task 1.1: สร้าง test-qr-payment component
- ⬜ สร้าง `test-dialog-page/test-qr-payment/test-qr-payment.component.ts`
- ⬜ Mock data: QR URL, bank info, bill amount, OCR results

### Sub-task 1.2: เพิ่มใน test-dialog-page + app.module
- ⬜ เพิ่มปุ่มเปิดใน `test-dialog-page.component.html`
- ⬜ Declare ใน `app.module.ts`

### Sub-task 1.3: ปรับแต่ง style จน OK
- ⬜ ทดสอบ QR zoom (p-image preview)
- ⬜ ทดสอบ slip upload + auto OCR mock
- ⬜ ปรับ style ตามผู้ใช้ต้องการ

---

## Phase 2: Apply ไป Dialog จริง (หลัง test เสร็จ)
- ⬜ Apply style ไป `qr-payment-dialog.component.html`
- ⬜ แก้ `qr-payment-dialog.component.ts` — auto OCR ใน `onSelectSlip()`
- ⬜ ลบปุ่มที่ไม่จำเป็น
- ⬜ ลบ test component
