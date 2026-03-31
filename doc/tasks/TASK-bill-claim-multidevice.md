# TASK: แก้ไขระบบแยกบิล + ชำระเงินฝั่งลูกค้า (Multi-Device)

> สร้าง: 2026-04-01 | สถานะ: เสร็จสมบูรณ์

## ปัญหา
ระบบแยกบิลฝั่งลูกค้า (Mobile Web) มีปัญหาเมื่อใช้งานกับมือถือหลายเครื่อง:
1. กดเงินสดแล้วไม่มี feedback (Multiple bills)
2. เครื่องอื่นไม่เห็น real-time ว่าบิลไหนจ่ายแล้ว
3. 2 มือถือรุ่นเดียวกันสแกน QR ได้ชื่อเล่นซ้ำ (device fingerprint collision)
4. ไม่มีระบบ lock บิล → 2 คนจ่ายบิลเดียวกันได้
5. หลังจ่ายครบทุกบิล เครื่องอื่นไม่ redirect ไปหน้าดาวน์โหลดใบเสร็จ
6. Staff checkout ต้องรองรับลูกค้าส่ง slip พร้อมกันหลายบิล

## Design

### Bill Claim System
- เมื่อลูกค้ากดเงินสด/โอนเงินของบิลหนึ่ง → claim บิลนั้น
- เครื่องอื่นเห็นว่าบิลถูกจองแล้ว + ชื่อผู้จอง + วิธีจ่าย
- บิลที่ถูกจองโดยคนอื่น → ซ่อนปุ่มจ่าย แสดง badge "กำลังชำระ"
- เงินสด: claim + แจ้งพนักงาน (ระบุ billId)
- โอนเงิน: claim + navigate to slip upload

### Device Fingerprint Fix
- เปลี่ยนจาก `btoa(UA+lang+screen)` → `crypto.randomUUID()` เก็บใน localStorage
- สแกนซ้ำจากเครื่องเดิม → reuse fingerprint จาก localStorage → session เดิม
- สแกนจากเครื่องใหม่ → fingerprint ใหม่ → session ใหม่

### DB Changes (TbOrderBill)
```
+ ClaimedBySessionId (int?, FK → TbCustomerSession)
+ ClaimedAt (DateTime?)
+ ClaimPaymentMethod (string?) — "Cash" / "Transfer"
```

### API ใหม่
```
POST /api/customer/{qrToken}/bills/{orderBillId}/claim
POST /api/customer/{qrToken}/bills/{orderBillId}/release
```

### SignalR Events ใหม่
- `BillClaimed` → table_{tableId}
- `BillReleased` → table_{tableId}

---

## Phase 1: Fix Device Fingerprint
- ✅ แก้ `auth.component.ts` — `getDeviceFingerprint()` ใช้ randomUUID + localStorage

## Phase 2: Backend — Bill Claim System
### 2.1 Entity + Migration
- ✅ เพิ่ม fields ใน `TbOrderBill.cs`
- ✅ เพิ่ม FK config ใน `TbOrderBillConfiguration.cs`
- ✅ สร้าง Migration `AddBillClaimFields`
- ✅ รัน `dotnet ef database update`

### 2.2 API + Service
- ✅ เพิ่ม interface methods ใน `ICustomerService.cs`
- ✅ เพิ่ม `ClaimBillAsync` + `ReleaseBillAsync` ใน `CustomerService.cs`
- ✅ เพิ่ม endpoints ใน `CustomerController.cs` (+ `[CustomerAuthorize]` + `GetCustomerSessionId()`)
- ✅ เพิ่ม `ClaimBillRequestModel` ใน `CustomerBillResponseModel.cs`

### 2.3 Response Model + Notification
- ✅ เพิ่ม claim info ใน `CustomerBillSummaryModel.cs` (ClaimedByNickname, ClaimPaymentMethod, IsClaimedByMe)
- ✅ อัพเดต `GetBillByQrTokenAsync` mapping (Include ClaimedBySession + sessionId param)
- ✅ เพิ่ม `NotifyBillClaimedAsync` + `NotifyBillReleasedAsync` ใน interface + implementation
- ✅ เพิ่ม SignalR listeners ใน `signalr.service.ts` (BillClaimed + BillReleased)

## Phase 3: gen-api
- ✅ restart Backend + ตรวจ Swagger
- ✅ ผู้ใช้รัน gen-api เสร็จ (ทั้ง Mobile Web + Client)

## Phase 4: Frontend Mobile Web
- ✅ bill-summary: claim flow (claimBill + releaseBill methods)
- ✅ bill-summary: แสดง claim UI (จองแล้ว/กำลังชำระ/จองโดยคนอื่น) ทั้ง single + multiple bills
- ✅ bill-summary: fallback poll ทุก 15 วิ (setInterval + cleanup OnDestroy)
- ✅ bill-summary: allBillsPaid → แสดงปุ่มดาวน์โหลดใบเสร็จรวม
- ✅ payment-complete: auto-redirect ไป bill-summary เมื่อทุกบิลจ่ายเสร็จ (checkAllBillsPaid)
- ✅ slip-upload: release claim ใน ngOnDestroy ถ้ายังไม่ได้ upload (uploadResult === null)

## Phase 5: Staff Checkout Enhancement
- ✅ Auto-switch tab เมื่อมี slip ใหม่ (pendingAutoSwitchToSlip flag + autoSwitchToSlipBill)
- ✅ Badge count "สลิปรอยืนยัน N" แสดงใน bill tabs area
