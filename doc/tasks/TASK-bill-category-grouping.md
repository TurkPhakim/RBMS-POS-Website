# TASK: เพิ่ม CategoryType ใน Customer Bill เพื่อแยกหมวดหมู่

> สร้าง: 2026-03-23

## สรุปงาน

เพิ่ม field `CategoryType` ใน `CustomerOrderItemModel` เพื่อให้ Frontend (Mobile Web) สามารถ group รายการอาหารตามหมวดหมู่ (อาหาร/เครื่องดื่ม/ของหวาน) ในหน้า Bill Summary ได้

## สถานะปัจจุบัน

- `TbOrderItem` entity **มี `CategoryType` (int)** เก็บค่า 1=Food, 2=Beverage, 3=Dessert อยู่แล้ว
- `CustomerOrderItemModel` (Response DTO) **ไม่มี field `CategoryType`** → Frontend ไม่รู้หมวดหมู่
- Frontend แสดง items เป็น flat list ไม่ได้ group

## แผนงาน

### Phase 1: Backend — เพิ่ม CategoryType ใน Response

| # | Sub-task | สถานะ |
|---|----------|-------|
| 1.1 | เพิ่ม `public int CategoryType { get; set; }` ใน `CustomerOrderItemModel` | ✅ |
| 1.2 | Map `CategoryType = oi.CategoryType` ใน `CustomerService.GetBillByQrTokenAsync()` | ✅ |
| 1.3 | เพิ่ม `.OrderBy(oi => oi.CategoryType).ThenBy(oi => oi.OrderItemId)` เรียงตาม category + ลำดับสั่ง | ✅ |

**ไฟล์แก้:**
- `Backend-POS/POS.Main/POS.Main.Business.Payment/Models/Customer/CustomerBillResponseModel.cs`
- `Backend-POS/POS.Main/POS.Main.Business.Payment/Services/CustomerService.cs`

### Phase 2: Restart Backend + gen-api

| # | Sub-task | สถานะ |
|---|----------|-------|
| 2.1 | Restart Backend + ตรวจ Swagger ว่ามี `categoryType` ใน schema | ✅ |
| 2.2 | บอกผู้ใช้รัน `npm run gen-api` (Mobile Web) แล้วหยุดรอ | ✅ |
| 2.3 | ตรวจ generated model `customer-order-item-model.ts` ว่ามี `categoryType` | ✅ |

### Phase 3: Frontend — Group items ตาม category ในหน้า bill-summary

| # | Sub-task | สถานะ |
|---|----------|-------|
| 3.1 | อ่าน bill-summary component ปัจจุบัน | ✅ |
| 3.2 | เพิ่ม logic group items ตาม `categoryType` (Food=1, Beverage=2, Dessert=3) | ✅ |
| 3.3 | แสดง header หมวดหมู่ + icon + สี ตามดีไซน์ที่ปรับใน test page | ✅ |
| 3.4 | เรียงลำดับ: Food → Beverage → Dessert, ภายใน category เรียงตาม `OrderItemId` (ลำดับสั่ง) | ✅ |

## EMenuCategory Enum

```
Food = 1      → อาหาร (icon: chicken-drumstick, สี: primary)
Beverage = 2  → เครื่องดื่ม (icon: drinks-glass, สี: info)
Dessert = 3   → ของหวาน (icon: dessert, สี: billing)
```

## ข้อมูลอ้างอิง

- Entity: `TbOrderItem.CategoryType` (int) — copy จาก `TbMenuSubCategory.CategoryType` ตอนสร้าง order
- Service: `CustomerService.GetBillByQrTokenAsync()` บรรทัด 52-64
- Model: `CustomerOrderItemModel` (ไม่มี Migration เพราะแค่เพิ่ม field ใน DTO)
