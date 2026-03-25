# TASK: แก้ไขระบบปิดโต๊ะ + ลบ EOrderStatus.Cancelled

> สร้าง: 2026-03-24

## สรุป Requirement

1. **ปิดโต๊ะ → ข้าม Cleaning ไป Available เลย** (เปิดโต๊ะได้ใหม่ทันที)
2. **Hard delete Order เปล่า** (ไม่มี items / มีแต่ Pending/Voided/Cancelled) เมื่อปิดโต๊ะ
3. **ลบ `Cancelled` ออกจาก `EOrderStatus`** — ไม่มีการยกเลิก Order ทั้งตัวอีกต่อไป (ยกเลิกได้เฉพาะ item)
4. **เงื่อนไขปิดโต๊ะ**: ปิดได้เมื่อไม่มี item ที่สถานะ Sent/Preparing/Ready/Served (ยกเว้นถ้า item ทั้งหมดถูก cancel แล้ว)

### เงื่อนไขปิดโต๊ะ

| กรณี | ปิดได้? |
|------|---------|
| Order ไม่มี items เลย | ได้ |
| มี items แต่ทุกตัวเป็น Pending | ได้ |
| มี items แต่ทุกตัวเป็น Voided/Cancelled | ได้ |
| มี items ผสม Pending + Voided/Cancelled | ได้ |
| มี item ใดก็ตามเป็น Sent/Preparing/Ready/Served | **ไม่ได้** |

### สถานะ Cleaning ที่เหลือ
- **ยังใช้อยู่**: หลังจ่ายเงินเสร็จ (Payment → Cleaning → Available ผ่านปุ่ม "ทำความสะอาดเสร็จ")
- **ไม่ใช้แล้ว**: ตอนปิดโต๊ะเอง (ข้าม Cleaning ไป Available เลย)

---

## Phase 1: Backend — ลบ EOrderStatus.Cancelled + แก้ CloseTable

### Sub-task 1.1: ลบ Cancelled จาก EOrderStatus
- ✅ ลบ `Cancelled = 3` จาก `EOrderStatus.cs`
- ✅ ตรวจ + ไม่มี reference ที่อ้างถึง EOrderStatus.Cancelled ใน Backend

### Sub-task 1.2: แก้ CloseTableAsync ใน TableService
- ✅ แก้ `CloseTableAsync` — เช็คเงื่อนไข item, hard delete order, ข้าม Cleaning ไป Available

**Logic ที่แก้แล้ว**:
1. ตรวจสอบ table status (Occupied/Billing)
2. ถ้ามี ActiveOrderId → เช็ค item ที่สถานะ Sent/Preparing/Ready/Served
   - ถ้ามี → throw BusinessException
   - ถ้าไม่มี → clear ActiveOrderId FK ก่อน → hard delete OrderItems → OrderBills → Order
3. เปลี่ยน table เป็น Available + clear session data + ลบ table links
4. Notify SignalR (Available)

---

## Phase 2: Frontend — ลบ Cancelled case

### Sub-task 2.1: ลบ Cancelled จาก Order status displays
- ✅ `order-list.component.ts` — ลบ case 'Cancelled' จาก `getStatusLabel()` + `getStatusClass()`
- ✅ `order-detail.component.ts` — ลบ case 'Cancelled' จาก `getBannerGradient()`, `getStatusColor()`, `getOrderStatusLabel()`
- ✅ `order-status-dropdown.component.ts` — ลบ option `{ value: 'Cancelled', label: 'ยกเลิก' }`

### Sub-task 2.2: ปุ่มปิดโต๊ะ — ใช้ BE เป็น gatekeeper
- ✅ ปล่อยให้ BE throw BusinessException ถ้ามี item ที่ส่งครัวแล้ว (FE แสดง error dialog อัตโนมัติ)

---

## ไฟล์ที่แก้แล้ว

### Backend
| ไฟล์ | สิ่งที่แก้ |
|------|-----------|
| `POS.Main.Core/Enums/EOrderStatus.cs` | ลบ `Cancelled = 3` |
| `POS.Main.Business.Table/Services/TableService.cs` | แก้ `CloseTableAsync` ทั้งหมด |

### Frontend
| ไฟล์ | สิ่งที่แก้ |
|------|-----------|
| `order-list.component.ts` | ลบ case Cancelled |
| `order-detail.component.ts` | ลบ case Cancelled จาก 3 methods |
| `order-status-dropdown.component.ts` | ลบ option Cancelled |

### ไม่ต้องแก้ (Item-level Cancelled ยังใช้อยู่)
- `EOrderItemStatus.cs` — `Cancelled = 6` ยังใช้ (ยกเลิกรายการ)
- `OrderService.CancelOrderItemAsync` — ยังใช้
- `kitchen-display` — แสดง cancelled items ยังใช้
- `order-detail` item status badge/label — ยังใช้
