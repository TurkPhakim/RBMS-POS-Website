# TASK: เพิ่มข้อมูลธนาคาร + WiFi + Flow แยกบิลฝั่งลูกค้า

**สถานะ**: IN PROGRESS
**วันที่เริ่ม**: 2026-03-23

---

## เป้าหมาย

1. เพิ่ม 5 fields ใน TbShopSettings: `BankName`, `AccountNumber`, `AccountName`, `WifiSsid`, `WifiPassword`
2. Staff จัดการข้อมูลธนาคาร + WiFi ในหน้าตั้งค่าร้านค้า
3. ลูกค้าเห็น QR + ข้อมูลธนาคารในหน้า slip-upload
4. ลูกค้าเห็น WiFi ใน Footer
5. ลูกค้าขอแยกบิลได้ (หารเท่า / แยกตามรายการ) → ส่ง notification ไปพนักงาน

---

## Phase 1: Backend — เพิ่ม 5 fields + Models + Split Bill Endpoint

| Sub-task | สถานะ |
|----------|--------|
| 1.1 TbShopSettings.cs — เพิ่ม 5 fields | ✅ |
| 1.2 Migration — AddBankAndWifiToShopSettings | ✅ |
| 1.3 ShopSettingsResponseModel.cs — เพิ่ม 5 fields | ✅ |
| 1.4 UpdateShopSettingsRequestModel.cs — เพิ่ม 5 fields + validation | ✅ |
| 1.5 ShopSettingsMapper.cs — ToResponse + UpdateEntity | ✅ |
| 1.6 CustomerAuthResponseModel.cs (BE) — เพิ่ม 6 fields | ✅ |
| 1.7 SelfOrderService.AuthenticateAsync() — map 6 fields | ✅ |
| 1.8 RequestSplitBillModel.cs (new) — SplitType + NumberOfPeople | ✅ |
| 1.9 ISelfOrderService + SelfOrderService — RequestSplitBillAsync | ✅ |
| 1.10 SelfOrderController — POST request-split-bill endpoint | ✅ |

## Phase 2: Restart Backend + gen-api

| Sub-task | สถานะ |
|----------|--------|
| 2.1 Kill Backend → dotnet run ใหม่ | ✅ |
| 2.2 ตรวจ Swagger fields + endpoint ใหม่ | ✅ |
| 2.3 บอกผู้ใช้รัน gen-api (Client + Mobile Web) | ✅ |
| 2.4 ตรวจ generated models หลัง gen-api | ✅ |

## Phase 3: Staff Frontend — ตั้งค่าร้านค้า

| Sub-task | สถานะ |
|----------|--------|
| 3.1 shop-settings.component.ts — เพิ่ม 5 form controls + patch + submit | ✅ |
| 3.2 shop-settings.component.html — ปรับ Card ชำระเงิน + เพิ่ม Card WiFi | ✅ |

## Phase 4: Mobile Web — ข้อมูลชำระเงิน + WiFi + แยกบิล

| Sub-task | สถานะ |
|----------|--------|
| 4.1 customer-auth.service.ts — เพิ่ม 6 fields ใน saveSession | ✅ |
| 4.2 slip-upload.component.ts — แสดง QR + bank info | ✅ |
| ~~4.3 customer-layout — WiFi footer~~ | ❌ ตัดออก (ผู้ใช้ไม่ต้องการ) |
| 4.4 bill-summary.component.ts — เพิ่มปุ่มแยกบิล + splitRequested | ✅ |
| 4.5 split-bill-dialog.component.ts (new) — Dialog เลือกวิธีแยกบิล | ✅ |
| 4.6 bill.module.ts — declare split-bill-dialog | ✅ |

---

## Phase 5: ปรับดีไซน์ bill-summary ตาม test page (ยืนยันแล้ว)

**เหตุผล**: ดีไซน์เดิมใช้ Dialog + 2 ปุ่ม → ผู้ใช้ยืนยันดีไซน์ใหม่จาก test page เป็น 3 ปุ่ม + inline dropdown

| Sub-task | สถานะ |
|----------|--------|
| 5.1 bill-summary.component.ts — เปลี่ยนเป็น 3 ปุ่ม + inline dropdown | ✅ (แก้แล้วใน session ก่อนหน้า) |
| 5.2 bill-summary — dropdown กว้างเท่ากลุ่มปุ่ม (relative ที่ parent) | ✅ |
| 5.3 card-header — responsive (shared component) | ✅ |
| 5.4 ลบ split-bill-dialog.component.ts + แก้ bill.module.ts | ⬜ |
| 5.5 ลบ test pages ทั้งหมด | ⬜ |

## Phase 6: Payment Complete + ดาวน์โหลดใบเสร็จ

### 6A: Backend — เพิ่ม Customer Receipt Endpoint

| Sub-task | สถานะ |
|----------|--------|
| 6A.1 ISelfOrderService — เพิ่ม GetCustomerReceiptAsync(tableId, orderBillId) | ✅ |
| 6A.2 SelfOrderService — implement: validate orderBillId อยู่ใน table → หา paymentId → เรียก PaymentService.GetReceiptDataAsync | ✅ |
| 6A.3 SelfOrderController — GET receipt/{orderBillId} + [CustomerAuthorize] | ✅ |

### 6B: Restart BE + gen-api (Mobile Web)

| Sub-task | สถานะ |
|----------|--------|
| 6B.1 Restart Backend + ตรวจ Swagger | ✅ |
| 6B.2 ผู้ใช้รัน gen-api (Mobile Web) | ✅ |

### 6C: Mobile Web — pdfMake + ReceiptService

| Sub-task | สถานะ |
|----------|--------|
| 6C.1 ติดตั้ง pdfmake + @types/pdfmake | ✅ |
| 6C.2 copy receipt-fonts.ts จาก Client | ✅ |
| 6C.3 สร้าง receipt.service.ts (copy จาก Client ปรับ import) | ✅ |

### 6D: Apply design payment-complete จริง

| Sub-task | สถานะ |
|----------|--------|
| 6D.1 payment-complete.component.ts — ปรับ template ตาม test (animation, receipt card, download button) | ✅ |
| 6D.2 เรียก API ดึง bill data เมื่อ isCompleted → แสดงใน receipt card | ✅ |
| 6D.3 ปุ่มดาวน์โหลด → เรียก ReceiptService.downloadReceipt() | ✅ |

### 6E: Cleanup

| Sub-task | สถานะ |
|----------|--------|
| 6E.1 ลบ split-bill-dialog + test pages ทั้งหมด | ✅ |
| 6E.2 อัพเดต bill.module.ts (ไม่ต้องแก้ — ไม่มี test component ใน bill module) | ✅ |

---

## Design ที่ตกลงแล้ว (อัพเดตล่าสุด 2026-03-24)

### Bill Summary Buttons (ดีไซน์ใหม่ — ยืนยันจาก test page)
```
@if (!cashRequested() && !splitRequested()) {
  3 ปุ่มเรียงแถวเดียว:
  [เงินสด](green) | [โอนเงิน](orange) | [แยกบิลชำระเงิน ▼](info)

  ปุ่ม "แยกบิลชำระเงิน" — split button:
  - ซ้าย: ข้อความ "แยกบิลชำระเงิน"
  - ขวา: ลูกศร ▼ แยกด้วยเส้น border-l (animate rotate-180 เปิด/ปิด)

  Dropdown (absolute, ไม่ใช่ Dialog):
  - หารเท่า → คลิกแล้วเปลี่ยนเป็น stepper + คนละกี่บาท + ปุ่มกลับ/ยืนยัน
  - แยกตามรายการ → เรียก API ทันที → แสดง success box
}
@if (cashRequested()) → success box (สีเขียว): "แจ้งพนักงานแล้ว"
@if (splitRequested()) → info box (สีฟ้า): "กรุณารอพนักงานมาแยกบิลชำระเงินให้ที่โต๊ะ"
```

**สิ่งที่เปลี่ยนจากดีไซน์เดิม:**
- ❌ ลบ Dialog (SplitBillDialogComponent) → ✅ ใช้ inline dropdown แทน
- ❌ 2 ปุ่ม + 1 ปุ่มแยกบิล → ✅ 3 ปุ่มเรียงแถวเดียว (เงินสด/โอนเงิน/แยกบิลชำระเงิน)
- ❌ "อัปโหลดสลิป" → ✅ "โอนเงิน" (navigate ไป slip-upload เหมือนเดิม)
- ❌ "ขอแยกบิล" outlined → ✅ "แยกบิลชำระเงิน" เป็น dropdown button สี info
- ❌ "หารเท่าๆ กัน" → ✅ "หารเท่า"
- ❌ Card มี overflow-hidden → ✅ ไม่มี (dropdown แสดงออกนอก card ได้)

### Notification Details
- **REQUEST_SPLIT_BILL**
  - หารเท่า: `"โซน{zone} - โต๊ะ{table} — ออเดอร์ #{daily} ขอหารเท่า {N} คน"`
  - แยกตามรายการ: `"โซน{zone} - โต๊ะ{table} — ออเดอร์ #{daily} ขอแยกตามรายการ (กรุณาไปพูดคุยกับลูกค้า)"`
  - TargetGroup: "Floor"
