# TASK: แก้ไขระบบใบเสร็จรองรับ Split Bill

> สร้าง: 2026-03-24

## สถานะ: ✅ เสร็จสมบูรณ์

---

## ปัญหาปัจจุบัน

1. **แยกตามรายการ (ByItem)**: ใบเสร็จแสดง **ทุกรายการ** ของออเดอร์ แทนที่จะแสดงเฉพาะรายการในบิลนั้น
2. **หารเท่า (ByAmount)**: ใบเสร็จแสดงตารางรายการอาหารทั้งหมด แต่ยอดเงินเป็นส่วนที่หาร → ตัวเลขไม่สอดคล้อง
3. **ใบเสร็จรวม (Consolidated)**: ยังไม่มี — ต้องเพิ่มให้ดาวน์โหลดหลังจ่ายครบทุกบิล

### สาเหตุหลัก
- `GetReceiptDataAsync` (PaymentService.cs:304) ดึง `order.OrderItems` ทั้งหมดเสมอ
- `TbOrderItem` ไม่มี FK `OrderBillId` → ไม่รู้ว่า item อยู่บิลไหน (ByItem)
- `TbOrderBill` ไม่มี `SplitCount`/`SplitIndex` → ไม่รู้ว่าหารกี่ส่วน (ByAmount)
- Frontend `buildDocDefinition()` แสดงตารางรายการเสมอ ไม่แยกตาม BillType

### ขอบเขต (Scope)
- **Client app** (Admin/Staff): checkout page — ใบเสร็จรายบิล + ใบเสร็จรวม
- **Mobile Web** (ลูกค้า): payment-complete page — ใบเสร็จรายบิล (ลูกค้าเห็นแค่บิลตัวเอง)

---

## ออกแบบ

### DB Schema Changes

```
TbOrderItem — เพิ่ม:
  OrderBillId  int?  FK → TbOrderBill (nullable, SetNull on delete)

TbOrderBill — เพิ่ม:
  SplitCount   int   default 0  (0 = ไม่ split, N = หารกี่ส่วน)
  SplitIndex   int   default 0  (0 = ไม่ split, 1..N = ส่วนที่เท่าไหร่)
  Navigation: ICollection<TbOrderItem> OrderItems
```

### Receipt แต่ละ BillType

**Full** (บิลเต็ม): แสดงตารางรายการอาหารตามปกติ (ไม่เปลี่ยน)

**ByItem** (แยกตามรายการ): แสดงเฉพาะรายการในบิลนั้น
- Backend filter items ที่มี `OrderBillId == bill.OrderBillId`

**ByAmount** (หารเท่า): ไม่แสดงตารางรายการ → แสดง:
```
- - - - - - - - - - - - -
  หารเท่า 3 ส่วน
  ส่วนที่ 1 จาก 3
- - - - - - - - - - - - -
```

**Consolidated** (ใบเสร็จรวม): แสดงทุกรายการ + รายละเอียดการชำระแต่ละบิล

### ReceiptDataModel — เพิ่ม fields

```csharp
public string BillType { get; set; }        // "Full", "ByItem", "ByAmount"
public int SplitCount { get; set; }          // ByAmount only
public int SplitIndex { get; set; }          // ByAmount only
public bool IsConsolidated { get; set; }     // Consolidated receipt flag
public List<ConsolidatedPaymentInfo>? Payments { get; set; }
```

### Endpoint ใหม่

```
GET /api/payment/payments/order/{orderId}/consolidated-receipt
  → BaseResponseModel<ReceiptDataModel>
  Permission: Payment.Read

GET /api/customer/consolidated-receipt/{orderId}  (SelfOrder — Mobile Web)
  → BaseResponseModel<ReceiptDataModel>
  Auth: CustomerAuthorize
```

---

## Phase 1: Database — เพิ่ม Columns + Migration

| # | Sub-task | สถานะ |
|---|----------|------|
| 1.1 | เพิ่ม `OrderBillId` FK ใน `TbOrderItem.cs` | ✅ |
| 1.2 | เพิ่ม `SplitCount`, `SplitIndex`, `OrderItems` nav ใน `TbOrderBill.cs` | ✅ |
| 1.3 | อัพเดต `TbOrderItemConfiguration.cs` — FK config + index | ✅ |
| 1.4 | อัพเดต `TbOrderBillConfiguration.cs` — HasMany (ไม่ต้องแก้ config อยู่ฝั่ง Item) | ✅ |
| 1.5 | สร้าง Migration + รัน `dotnet ef database update` | ✅ |

## Phase 2: Backend — แก้ Service Logic

| # | Sub-task | สถานะ |
|---|----------|------|
| 2.1 | แก้ `SplitBillByItemAsync` — set OrderBillId บน items | ✅ |
| 2.2 | แก้ `SplitBillByAmountAsync` — set SplitCount/SplitIndex | ✅ |
| 2.3 | เพิ่ม fields ใน `ReceiptDataModel` + สร้าง `ConsolidatedPaymentInfo` | ✅ |
| 2.4 | แก้ `GetReceiptDataAsync` — filter items ตาม BillType | ✅ |
| 2.5 | เพิ่ม `GetConsolidatedReceiptDataAsync` ใน PaymentService | ✅ |
| 2.6 | เพิ่ม endpoint ใน PaymentsController | ✅ |
| 2.7 | เพิ่ม `GetCustomerConsolidatedReceiptAsync` ใน SelfOrderService | ✅ |
| 2.8 | เพิ่ม endpoint ใน SelfOrderController | ✅ |
| 2.9 | อัพเดต `OrderBillResponseModel` + `OrderBillMapper` — เพิ่ม splitCount/splitIndex | ✅ |

## Phase 3: Frontend — gen-api + แก้ Receipt PDF

| # | Sub-task | สถานะ |
|---|----------|------|
| 3.0 | **หยุดรอ gen-api** — ผู้ใช้รัน `npm run gen-api` ทั้ง Client + Mobile | ✅ |
| 3.1 | **Client** — แก้ `receipt.service.ts` buildDocDefinition ตาม BillType | ✅ |
| 3.2 | **Client** — เพิ่ม `downloadConsolidatedReceipt(orderId)` | ✅ |
| 3.3 | **Client** — เพิ่มปุ่มใน checkout "ชำระเงินครบทุกบิลแล้ว" screen + `onDownloadConsolidatedReceipt()` | ✅ |
| 3.4 | **Mobile Web** — แก้ `receipt.service.ts` buildDocDefinition ตาม BillType + เพิ่ม `downloadConsolidatedReceipt()` | ✅ |
| 3.5 | **Mobile Web** — payment-complete: แสดง receipt summary ถูกต้องตาม BillType (ByAmount แสดงข้อมูลหารเท่า) | ✅ |

## Phase 4: เอกสาร

| # | Sub-task | สถานะ |
|---|----------|------|
| 4.1 | อัพเดต `database-api-reference.md` — เพิ่ม relationship TbOrderItems→TbOrderBills, endpoint consolidated-receipt (Payments + Customer) | ✅ |

---

## ไฟล์ที่เกี่ยวข้อง

### Backend
- `POS.Main.Dal/Entities/Order/TbOrderItem.cs`
- `POS.Main.Dal/Entities/Order/TbOrderBill.cs`
- `POS.Main.Dal/EntityConfigurations/TbOrderItemConfiguration.cs`
- `POS.Main.Dal/EntityConfigurations/TbOrderBillConfiguration.cs`
- `POS.Main.Business.Order/Services/OrderService.cs` (SplitBill methods)
- `POS.Main.Business.Order/Models/OrderBill/OrderBillResponseModel.cs`
- `POS.Main.Business.Order/Models/OrderBill/OrderBillMapper.cs`
- `POS.Main.Business.Payment/Services/PaymentService.cs` (GetReceiptDataAsync)
- `POS.Main.Business.Payment/Models/Payment/ReceiptDataModel.cs`
- `POS.Main.Business.Payment/Interfaces/IPaymentService.cs`
- `POS.Main.Business.Payment/Services/SelfOrderService.cs`
- `POS.Main.Business.Payment/Interfaces/ISelfOrderService.cs`
- `RBMS.POS.WebAPI/Controllers/PaymentsController.cs`
- `RBMS.POS.WebAPI/Controllers/SelfOrderController.cs`

### Frontend Client
- `core/services/receipt.service.ts`
- `features/payment/pages/checkout/checkout.component.html`
- `features/payment/pages/checkout/checkout.component.ts`

### Frontend Mobile Web
- `core/services/receipt.service.ts`
- `features/bill/pages/payment-complete/payment-complete.component.ts`
