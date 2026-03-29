# TASK: เพิ่ม Source Table Grouping สำหรับ Linked Tables

> สร้าง: 2026-03-28

## สรุปปัญหา
เมื่อเชื่อมโต๊ะ (Link Tables) รายการสั่งอาหารจากหลายโต๊ะถูกรวมเป็นออเดอร์เดียว แต่ **Kitchen Display** และ **Order Detail** ไม่แสดงว่ารายการไหนมาจากโต๊ะไหน

## ข้อมูลที่มีอยู่แล้ว
- `TbOrderItem.SourceTableId` + `SourceTable` (navigation) → เก็บโต๊ะต้นทางของแต่ละ item
- เมื่อสร้าง item ปกติ → `SourceTableId = order.TableId`
- เมื่อ link tables → items จากโต๊ะรองได้ `SourceTableId = secondaryTable.TableId`

## Design

### Kitchen Display — Order View
- เมื่อ order มีหลาย sourceTableName → จัดกลุ่ม items ตาม sourceTableName
- แสดง section divider: `"โต๊ะ{name}"` เป็นแถบเล็กๆ
- ถ้ามี sourceTableName เดียว (ออเดอร์ปกติ) → แสดงเหมือนเดิม

### Kitchen Display — Menu View
- เปลี่ยนให้ใช้ `sourceTableName` แทน order-level `tableName`

### Order Detail
- เมื่อ items มีหลาย sourceTableName → แสดง section header ก่อนแต่ละ group
- ถ้ามี sourceTableName เดียว → แสดงเหมือนเดิม

---

## Phase 1: Backend — เพิ่ม SourceTableName ใน Models

- ✅ 1.1 `KitchenOrderItemModel.cs` — เพิ่ม `SourceTableName`
- ✅ 1.2 `KitchenService.cs` — Include SourceTable + map
- ✅ 1.3 `OrderItemResponseModel.cs` — เพิ่ม `SourceTableName`
- ✅ 1.4 `OrderItemMapper.cs` — Map SourceTableName
- ✅ 1.5 `OrderService.cs` — Include SourceTable (2 methods)

## Phase 2: gen-api

- ✅ 2.1 Restart BE + ตรวจ Swagger
- ✅ 2.2 ผู้ใช้รัน gen-api
- ✅ 2.3 ตรวจ generated models

## Phase 3: Frontend — Kitchen Display

- ✅ 3.1 Order View — group items by sourceTableName + section divider
- ✅ 3.2 Menu View — ใช้ sourceTableName แทน tableName

## Phase 4: Frontend — Order Detail

- ✅ 4.1 เพิ่มคอลัมน์ "โต๊ะต้นทาง" (แสดงเฉพาะเมื่อ linked tables)

## ไฟล์ที่แก้ไข

| # | ไฟล์ | การแก้ไข |
|---|------|---------|
| 1 | `KitchenOrderItemModel.cs` | เพิ่ม `SourceTableName` |
| 2 | `KitchenService.cs` | Include SourceTable + map |
| 3 | `OrderItemResponseModel.cs` | เพิ่ม `SourceTableName` |
| 4 | `OrderItemMapper.cs` | Map SourceTableName |
| 5 | `OrderService.cs` | Include SourceTable (2 methods) |
| 6 | `kitchen-display.component.html` | Group by source table (Order View) |
| 7 | `kitchen-display.component.ts` | computed สำหรับ grouping + Menu View |
| 8 | `order-detail.component.html` | Section headers per source table |
| 9 | `order-detail.component.ts` | computed สำหรับ grouping |
