# TASK: Payment System (Phase 3B)

> สถานะ: ✅ COMPLETED
> เริ่ม: 2026-03-20
> เสร็จ: 2026-03-20

## ภาพรวม

ระบบชำระเงินสำหรับ POS — ปิดลูป Billing → Payment → Completed → Cleaning

**Scope:**
- Cashier Session (เปิด/ปิดกะ + Cash In/Out)
- Cash Payment (เงินสด + numpad)
- QR Payment + Slip Upload + OCR (Tesseract)
- Receipt PDF (pdfmake — download)
- Customer QR Panel (ลูกค้าดูบิล + upload สลิปผ่านมือถือ)
- Payment History + SignalR events

**ไม่ทำ (เลื่อนไป):** Discount System, Mixed Payment, Void/Refund, Tax Invoice, Thermal Printer

---

## Phase 3B-1: Backend Foundation ✅

- [x] สร้าง Enums: EPaymentMethod, ECashierSessionStatus, ECashDrawerTransactionType, ESlipVerificationStatus
- [x] สร้าง Entity: TbPayment, TbCashierSession, TbCashDrawerTransaction
- [x] สร้าง EntityConfigurations (3)
- [x] สร้าง Repositories (3 interface + 3 impl)
- [x] อัพเดต UnitOfWork (เพิ่ม 3 properties)
- [x] อัพเดต POSMainContext (เพิ่ม 3 DbSet)
- [x] แก้ TbShopSettings (เพิ่ม ReceiptHeaderText, ReceiptFooterText)
- [x] สร้าง Business Module: POS.Main.Business.Payment
- [x] อัพเดต Permissions.cs (เพิ่ม CashierSession)
- [x] สร้าง Migration + รัน database update
- [x] dotnet build ผ่าน

## Phase 3B-2: Cashier Session (Backend + Frontend) ✅

- [x] สร้าง CashierSessionService + ICashierSessionService
- [x] สร้าง Request/Response Models + Mapper
- [x] สร้าง CashierSessionsController (8 endpoints)
- [x] dotnet build ผ่าน
- [x] gen-api
- [x] สร้าง Payment module + routing + sidebar
- [x] สร้าง CashierSessionComponent + CashierSessionHistoryComponent
- [x] สร้าง Dialogs: OpenShift, CloseShift, CashDrawer
- [x] ng build ผ่าน

## Phase 3B-3: Cash Payment (Backend + Frontend) ✅

- [x] สร้าง PaymentService + IPaymentService
- [x] สร้าง Request/Response Models + Mapper
- [x] สร้าง PaymentsController (3+ endpoints)
- [x] dotnet build ผ่าน
- [x] gen-api
- [x] สร้าง PaymentProcessComponent (bill summary + numpad)
- [x] เพิ่มปุ่ม "ชำระเงิน" ใน OrderDetail + TableActionDialog
- [x] ng build ผ่าน

## Phase 3B-4: QR Payment + Slip Upload + OCR ✅

- [x] เพิ่ม QR endpoints ใน PaymentsController
- [x] สร้าง SlipOcrService (Tesseract)
- [x] dotnet build ผ่าน
- [x] gen-api
- [x] เพิ่ม QR panel + SlipUploadDialog ใน PaymentProcess
- [x] เพิ่ม SignalR event: SLIP_UPLOADED
- [x] ng build ผ่าน

## Phase 3B-5: Receipt PDF + Payment History ✅

- [x] เพิ่ม receipt + history endpoints ใน PaymentsController
- [x] แก้ ShopSettings models (ReceiptHeaderText/FooterText)
- [x] gen-api
- [x] สร้าง ReceiptService (pdfmake)
- [x] สร้าง PaymentHistoryComponent (รวมในหน้า payment)
- [x] เพิ่ม Receipt fields ใน Shop Settings page
- [x] ng build ผ่าน

## Phase 3B-6: Customer QR Panel ✅

- [x] สร้าง CustomerController (public, no auth — 3 endpoints)
- [x] สร้าง CustomerService (validate QR token + bill data + slip upload)
- [x] เพิ่ม SignalR events: SlipUploaded, PaymentCompleted
- [x] gen-api
- [x] สร้าง Customer module (แยก layout, no sidebar) — route: `/customer/:qrToken`
- [x] สร้าง CustomerBillComponent (ดูบิล + upload สลิป + polling สถานะ)
- [x] ng build ผ่าน
- [x] อัพเดต database-api-reference.md
