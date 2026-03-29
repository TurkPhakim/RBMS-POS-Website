# TASK: แก้ช่องโหว่ Real-Time Sync (SignalR) ทั้งระบบ

> สร้าง: 2026-03-30 | สถานะ: ✅ เสร็จสมบูรณ์

## สรุปปัญหา

### ปัญหาที่ผู้ใช้แจ้ง
- ลูกค้ากดขอบิลจาก Mobile Web → ภาพรวมร้าน (order-overview) อัพเดตสถานะโต๊ะ ✅
- แต่หน้ารายละเอียดออเดอร์ (order-detail) **ไม่อัพเดตตาม** → ลูกค้ากดขอบิลซ้ำได้

### สาเหตุ (Audit ทั้งระบบ)
Backend ส่ง **8 SignalR events** แต่ Frontend `OrderHubService` listen เพียง **4 events** — ขาด 4 ตัว:
1. `OrderUpdated` — สถานะออเดอร์เปลี่ยน (Billing, Completed, Open)
2. `PaymentCompleted` — ชำระเงินสำเร็จ
3. `SlipUploaded` — ลูกค้าอัพโหลดสลิป
4. `RefreshOrders` — สำหรับ Mobile Web customer devices

และหน้า **order-detail**, **checkout**, **staff-order** ไม่มี SignalR subscription เลย

---

## Audit Matrix

### Backend → Frontend Event Coverage

| Event | Backend Groups | OrderHubService | order-overview | order-detail | checkout |
|-------|---------------|-----------------|----------------|-------------|----------|
| `TableStatusChanged` | floor | ✅ | ✅ | - | - |
| `NewOrderItems` | kitchen, floor, table_{id} | ✅ | ✅ | ❌ ต้องเพิ่ม | - |
| `ItemStatusChanged` | kitchen, floor, table_{id} | ✅ | ✅ | ❌ ต้องเพิ่ม | - |
| `ItemCancelled` | kitchen | ✅ | ✅ | ❌ ต้องเพิ่ม | - |
| **`OrderUpdated`** | floor | ❌ ต้องเพิ่ม | ❌ ต้องเพิ่ม | ❌ ต้องเพิ่ม | - |
| **`PaymentCompleted`** | floor, table_{id} | ❌ ต้องเพิ่ม | ❌ ต้องเพิ่ม | - | - |
| **`SlipUploaded`** | floor, table_{id} | ❌ ต้องเพิ่ม | - | - | ❌ ต้องเพิ่ม |
| `RefreshOrders` | table_{id} only | - (Mobile Web เท่านั้น) | - | - | - |

### ลำดับ RequestBill Flow ที่ทำให้เกิดปัญหา

```
ลูกค้ากด "ขอบิล" (Mobile Web)
  → Backend: SelfOrderService.RequestBillAsync()
    → order.Status = Billing
    → table.Status = Billing
    → NotifyOrderUpdatedAsync(orderId, "Billing")    → Group "floor"
    → NotifyTableStatusChangedAsync(tableId, "Billing") → Group "floor"

order-overview: เห็น TableStatusChanged → loadTables() → สถานะเปลี่ยน ✅
order-detail:   ไม่ subscribe SignalR เลย → ไม่อัพเดต ❌
                → ปุ่ม "ขอบิล" ยังแสดงอยู่ → ลูกค้ากดซ้ำได้
```

---

## แผนแก้ไข

### Phase 1: เพิ่ม event listeners ใน OrderHubService
- ⬜ เพิ่ม `orderUpdated$` Subject
- ⬜ เพิ่ม `paymentCompleted$` Subject
- ⬜ เพิ่ม `slipUploaded$` Subject
- ⬜ Register listeners ใน `registerListeners()`
- ⬜ Complete subjects ใน `ngOnDestroy()`

### Phase 2: แก้ order-detail — เพิ่ม SignalR
- ⬜ Inject `OrderHubService`
- ⬜ Start hub + join "floor" group ใน `ngOnInit()`
- ⬜ Leave group ใน `ngOnDestroy()`
- ⬜ Subscribe to `orderUpdated$` → filter by orderId → `loadOrder()`
- ⬜ Subscribe to `itemStatusChanged$` → filter by orderId → `loadOrder()`
- ⬜ Subscribe to `newOrderItems$` → filter by orderId → `loadOrder()`
- ⬜ Subscribe to `itemCancelled$` → filter by orderId → `loadOrder()`

### Phase 3: แก้ order-overview — เพิ่ม events
- ⬜ Subscribe to `orderUpdated$` → `loadTables()`
- ⬜ Subscribe to `paymentCompleted$` → `loadTables()`

### Phase 4: แก้ checkout — เพิ่ม SlipUploaded
- ⬜ Inject `OrderHubService`
- ⬜ Start hub + join "floor" group ใน `ngOnInit()`
- ⬜ Leave group ใน `ngOnDestroy()`
- ⬜ Subscribe to `slipUploaded$` → reload bill data

### Phase 5: Build + ตรวจสอบ

---

## ไฟล์ที่แก้

| ไฟล์ | การแก้ |
|------|--------|
| `core/services/order-hub.service.ts` | เพิ่ม 3 events: orderUpdated$, paymentCompleted$, slipUploaded$ |
| `features/order/pages/order-detail/order-detail.component.ts` | เพิ่ม SignalR subscriptions ทั้งหมด |
| `features/order/pages/order-overview/order-overview.component.ts` | เพิ่ม orderUpdated$ + paymentCompleted$ |
| `features/payment/pages/checkout/checkout.component.ts` | เพิ่ม slipUploaded$ subscription |
