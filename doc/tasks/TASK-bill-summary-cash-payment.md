# TASK: Bill Summary — อ้างอิงดีไซน์จริง + ชำระเงินสด

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-23
**อ้างอิง**: test-bill-summary design ที่ยืนยันแล้ว

---

## เป้าหมาย

1. นำดีไซน์ test-bill-summary ไปใช้ในหน้า bill-summary จริง
2. เพิ่มระบบ "ชำระเงินสด" — ลูกค้ากดปุ่ม → ส่ง notification ไปร้าน → แสดงข้อความแจ้ง

---

## Design ที่ตกลงแล้ว (จาก test-bill-summary)

### Template Structure
```
<div class="px-4 pt-4">
  <!-- Bill Card (white, rounded-2xl, border) -->
  <app-card-header icon="checklist-cash" title="สรุปรายการสั่ง" [subtitle]="orderNumber" gradient="primary">
    <span cardHeaderRight>{{ itemCount }} รายการ</span>
  </app-card-header>

  <!-- Grouped Items by Category -->
  <!-- categoryType 1=อาหาร(primary), 2=เครื่องดื่ม(info), 3=ของหวาน(billing) -->
  <!-- ใช้ pattern เดียวกับ bill-waiting: mb-2 category header, space-y-3 pl-2 items -->

  <!-- Bill Charges (border-t-2, conditional @if) -->
  ยอดอาหาร / ค่าบริการ(@if) / ภาษี(@if) / ส่วนลด(@if)

  <!-- Grand Total (bg-primary/5 border-t-2 border-primary/30) -->
  ยอดรวมสุทธิ → text-2xl font-extrabold text-primary "X,XXX บาท"

  <!-- Payment Buttons (px-5 py-3) -->
  @if (!cashRequested) → 2 buttons flex gap-3: อัปโหลดสลิป + ชำระเงินสด
  @else → success box (ไอคอนซ้าย text ขวา): "แจ้งพนักงานแล้ว" + คำอธิบาย
</div>
```

### Cash Payment Box (ยืนยันแล้ว)
- Layout: `flex items-center gap-2` (ไอคอนซ้าย text ขวา)
- Icon: `bill-invoice` ใน `w-18 h-18` circle `bg-success/10`, icon `w-12 h-12 text-success`
- Title: `text-xl font-bold text-success` "แจ้งพนักงานแล้ว"
- Description: `text-surface-sub` "กรุณาชำระเงินที่เคาน์เตอร์ หรือรอพนักงานมารับเงินที่โต๊ะ"
- Container: `bg-success/5 border border-success/30 rounded-xl p-3`

### Currency Format
- ใช้ "บาท" suffix (ไม่ใช่ ฿ prefix) ทุกที่

---

## ขั้นตอน

### Phase 1: Backend — เพิ่ม endpoint ชำระเงินสด ✅

**Pattern**: เหมือน CallWaiter (ส่ง notification อย่างเดียว ไม่เปลี่ยนสถานะ)

**ไฟล์แก้:**
| ไฟล์ | รายละเอียด |
|------|-----------|
| `SelfOrderService.cs` | เพิ่ม `RequestCashPaymentAsync()` — ดึง table/zone + ส่ง notification |
| `ISelfOrderService.cs` (ถ้ามี) | เพิ่ม method signature |
| `SelfOrderController.cs` | เพิ่ม `POST /api/customer/request-cash` endpoint |

**Notification Detail:**
- EventType: `"REQUEST_CASH_PAYMENT"`
- Title: `"ลูกค้าขอชำระเงินสด"`
- Message: `"โซน{zoneName} - โต๊ะ{tableName} — ออเดอร์ #{dailyRunningNo}"`
- TargetGroup: `"Floor"`

### Phase 2: Restart BE + gen-api ✅

1. Kill Backend → `dotnet run` ใหม่
2. ตรวจ Swagger มี endpoint ใหม่
3. บอกผู้ใช้รัน `npm run gen-api` (Mobile Web project)
4. **หยุดรอ** จนผู้ใช้ยืนยัน

### Phase 3: Frontend — อัพเดต bill-summary จริง ✅

**ไฟล์แก้:**
| ไฟล์ | รายละเอียด |
|------|-----------|
| `bill-summary.component.ts` | อ้างอิง test design ทั้ง template + เพิ่ม cash logic |

**สิ่งที่ต้องเปลี่ยนจาก design เดิม:**
- Header: เปลี่ยนจาก gradient div → `<app-card-header>` component
- Items: เปลี่ยน `gap-1.5` → `mb-2`, divider → `border-dashed`
- Charges: เปลี่ยน `฿` → "บาท", เพิ่ม conditional @if
- Grand Total: ใช้ `bg-primary/5 border-t-2 border-primary/30`
- Buttons: เปลี่ยนจาก fixed bottom → อยู่ในการ์ด, เพิ่มปุ่มเงินสด
- Cash box: เพิ่ม cashRequested signal + API call + success box

**Logic เพิ่ม:**
- `cashRequested = signal(false)`
- `requestCashPayment()` → call `selfOrderService.selfOrderRequestCashPost()` → cashRequested.set(true)
- inject: เพิ่ม SelfOrderService

### Phase 4: อัพเดต Task file + ลบ test page (ถ้าพร้อม) ✅

- อัพเดต TASK-mobile-web-design-review.md → bill-summary = ✅
- ยังไม่ลบ test pages จนกว่าจะ review ครบทุกหน้า
