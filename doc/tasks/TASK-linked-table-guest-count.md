# TASK: แสดงจำนวนลูกค้ารวมสำหรับโต๊ะเชื่อม

> สร้าง: 2026-03-29

## ปัญหาปัจจุบัน

1. **จำนวนลูกค้าแสดงแค่โต๊ะเดียว** — `OrderDetailResponseModel.GuestCount` มาจาก `TbOrder.GuestCount` ซึ่งเก็บแค่จำนวนตอนเปิดออเดอร์ (โต๊ะ primary) ไม่รวมโต๊ะลูกที่เชื่อม
2. **กดจากโต๊ะลูก แต่ header แสดงโต๊ะแม่** — route `/order/detail/:orderId` ไม่มีข้อมูลว่ากดมาจากโต๊ะไหน
3. **Linked table info แสดงแค่ชื่อ ไม่มีจำนวนคน** — `PrimaryTableName` + `SecondaryTableNames` เป็นแค่ `string[]` ไม่มี `GuestCount`

## เป้าหมาย

- Header แสดง `ลูกค้า: {totalGuestCount} คน` (รวมทุกโต๊ะในกลุ่ม)
- Linked info แสดงรายโต๊ะพร้อมจำนวนคน: `โต๊ะหลัก: โต๊ะA2 (1 คน) | โต๊ะรอง: โต๊ะA1 (2 คน), โต๊ะA3 (3 คน)`

## Design

### Backend Changes

**OrderDetailResponseModel** — เพิ่ม fields:
```
LinkedTables: List<OrderLinkedTableModel>?   ← ใหม่ (แทน PrimaryTableName + SecondaryTableNames)
TotalGuestCount: int                          ← ใหม่ (รวมลูกค้าทุกโต๊ะ)
```

**OrderLinkedTableModel** — class ใหม่ (อยู่ใน `Models/Order/`):
```
TableName: string
GuestCount: int       ← จาก TbTable.CurrentGuests
IsPrimary: bool
```

**EnrichLinkedTableInfoAsync** — แก้ให้ดึง `CurrentGuests` ด้วย:
- Join กับ `TbTable` ดึง `TableName`, `CurrentGuests`, `IsPrimary`
- คำนวณ `TotalGuestCount` = sum ของ `CurrentGuests` ทุกโต๊ะ
- เซ็ต `LinkedTables` = list ของ `OrderLinkedTableModel`
- คง `PrimaryTableName` + `SecondaryTableNames` ไว้เพื่อ backward compat (ไม่ลบ)

### Frontend Changes

**order-detail.component.html** — Header:
- ถ้า `o.isLinked` → แสดง `ลูกค้า: {{ o.totalGuestCount }} คน` แทน `o.guestCount`
- ถ้าไม่ linked → แสดง `o.guestCount` เหมือนเดิม

**order-detail.component.html** — Linked info row:
- แทนที่ `โต๊ะหลัก: โต๊ะA2 | โต๊ะรอง: โต๊ะA1, A3` ด้วย:
- `โต๊ะหลัก: โต๊ะA2 (1 คน) | โต๊ะรอง: โต๊ะA1 (2 คน), โต๊ะA3 (3 คน)`

## ไฟล์ที่แก้

### Backend
1. `POS.Main.Business.Order/Models/Order/OrderDetailResponseModel.cs` — เพิ่ม fields
2. `POS.Main.Business.Order/Models/Order/OrderLinkedTableModel.cs` — class ใหม่
3. `POS.Main.Business.Order/Services/OrderService.cs` — แก้ `EnrichLinkedTableInfoAsync`

### Frontend (หลัง gen-api)
4. `order-detail.component.html` — แก้ header + linked info

## Sub-tasks

### Phase 1: Backend
- ✅ สร้าง `OrderLinkedTableModel` class
- ✅ เพิ่ม `LinkedTables` + `TotalGuestCount` ใน `OrderDetailResponseModel`
- ✅ แก้ `EnrichLinkedTableInfoAsync` ดึง `CurrentGuests`

### Phase 2: Frontend (หลัง gen-api)
- ✅ แก้ header แสดง totalGuestCount เมื่อ linked
- ✅ แก้ linked info row แสดงจำนวนคนรายโต๊ะ
