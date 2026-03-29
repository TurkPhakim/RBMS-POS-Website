# TASK: ปรับดีไซน์ Table Action Dialog ตาม Test Page

> สถานะ: เสร็จสมบูรณ์ | เริ่ม: 2026-03-27 | เสร็จ: 2026-03-27

## เป้าหมาย
นำดีไซน์จาก `test-table-status` component (ที่ approved แล้ว) ไป apply กับ dialog จริง `table-action-dialog` 100%

## ไฟล์ที่ต้องแก้
- `features/order/dialogs/table-action-dialog/table-action-dialog.component.html`
- `features/order/dialogs/table-action-dialog/table-action-dialog.component.ts`

## ดีไซน์ที่ Approved (จาก test page)

### Header (Custom)
- ใช้ `#cardHeader cardHeader` แทน `headerLabel`
- ซ้าย: `โซน{zoneName} - โต๊ะ{tableName}` (text-xl font-bold text-primary-dark)
- ขวา: Status badge (rounded-full, dot + label, สีตามสถานะ)

### Body
- **Table Visual**: solid bg (getTableBgClasses) + `table-dinner` icon w-16 h-16 white
- **Info**:
  - จำนวนคน: `currentGuests ?? 0 / capacity` + human icon + Walk-in/จองมา badge (`guestType`)
  - เวลา+เชื่อมโต๊ะ: แถวเดียวกัน (TIME_DATE format + linked tables)
  - หมายเหตุ: `table.note` + chat-message icon
- **Quick Actions** (ขวา): QR Code (scan-barcode) + ชำระเงิน (bill-rastaurant, Billing only)
- **Serving Progress**: ไอคอน order-dinner + progress bar สี + "กำลังเสิร์ฟ"/"เสิร์ฟครบแล้ว"

### Footer
- ลำดับ: ปิด (secondary) → action buttons → ปุ่มหลัก (primary) ขวาสุด
- สี: ย้ายโต๊ะ=help, เชื่อมโต๊ะ=warn, ยกเลิกเชื่อม=danger, ดูออเดอร์=primary
- "เปิดโต๊ะ (เช็คอิน)" ไม่ใช่ Check-in

### Mapping Test → Real
- `mock.openType` → `table.guestType` ("WalkIn" / "Reserved")
- `mock.tableNote` → `table.note`
- test methods ส่ง `table` param → real methods ใช้ `this.table`

## Sub-tasks

- ✅ อัพเดต HTML ทั้งหมด (custom header, body layout, progress, footer)
- ✅ อัพเดต TS — เพิ่ม `getTableBgClasses()`, ลบ `headerLabel` + `getTableVisualClasses()`
- ✅ ตรวจสอบไม่มี error, เทียบ test vs real ครบทุกจุด
