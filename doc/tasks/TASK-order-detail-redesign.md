# TASK: ปรับปรุงหน้ารายละเอียดออเดอร์ (Order Detail Redesign)

> สร้าง: 2026-03-21

## สรุปงาน
ปรับปรุงหน้ารายละเอียดออเดอร์ (`/order/:orderId`) ให้แสดงข้อมูลครบถ้วนขึ้น + แก้ breadcrumb + ย้ายปุ่ม + เพิ่ม filter

## ปัญหาปัจจุบัน
1. Breadcrumb แสดง "ออเดอร์ > รายละเอียดออเดอร์" → ควรเป็น "ออเดอร์ > รายการออเดอร์ > รายละเอียดออเดอร์"
2. ปุ่ม action (ส่งครัว/ขอบิล/แยกบิล) อยู่ตรง Order Header → ควรอยู่แถว "รายการอาหาร"
3. มีปุ่ม "ยกเลิก" ในหน้านี้ → ต้องเอาออก
4. ตารางขาดข้อมูล: รูปเมนู, ชื่ออังกฤษ, หมวดหมู่/ย่อย, pagination, filter

## เป้าหมาย
- Breadcrumb 3 ระดับ
- ปุ่ม action ย้ายไปแถว "รายการอาหาร"
- ไม่มีปุ่มยกเลิกในหน้านี้
- ตารางแสดง: รูปเมนู, ชื่อไทย+อังกฤษ, หมวดหมู่/ย่อย
- มี pagination + filter ตามหมวดหมู่

---

## Phase 1: Backend — เพิ่ม fields ใน Response Model

### Sub-task 1.1: เพิ่ม ZoneName ใน OrderDetailResponseModel ✅
### Sub-task 1.2: เพิ่ม SubCategoryName ใน OrderItemResponseModel ✅
### Sub-task 1.3: อัพเดต OrderMapper.ToDetailResponse() ✅
### Sub-task 1.4: อัพเดต OrderItemMapper.ToResponse() ✅
### Sub-task 1.5: อัพเดต Include chain ใน OrderService ✅

---

## Phase 2: gen-api ✅
- Restart Backend → ตรวจ Swagger → ผู้ใช้รัน gen-api เสร็จแล้ว

---

## Phase 3: Frontend — แก้ Breadcrumb + Redesign

### Sub-task 3.1: แก้ Breadcrumb routing ✅
- ใช้ componentless parent route ทำให้ breadcrumb แสดง 3 ระดับ

### Sub-task 3.2: อัพเดต order-detail.component.ts ✅
- Inject `ApiConfiguration` + เพิ่ม `getImageUrl()`
- เพิ่ม `getCategoryLabel()`, `categoryFilter` signal, `filteredItems` computed
- ลบ `onCancelOrder()`

### Sub-task 3.3: Redesign order-detail.component.html ✅
- Order Header: แสดง "โซน{zoneName} - โต๊ะ{tableName}", ลบปุ่ม action
- Section header: "รายการอาหาร" + ปุ่ม ส่งครัว/ขอบิล/แยกบิล อยู่ขวา
- เพิ่ม filter chips + pagination (client-side)
- ตารางใหม่: รูป, เมนู(TH+EN), หมวดหมู่, จำนวน, ราคา/หน่วย, ตัวเลือกเพิ่ม, รวม, สถานะ, ผู้สั่ง, ตัวเลือก

---

## Phase 4: UI Redesign จาก test-order-detail (2026-03-22)

### ดีไซน์ที่ตกลงแล้ว

**Header — Gradient Banner:**
- Gradient เปลี่ยนสีตามสถานะ order (Open=primary, Billing=billing, Completed=success, Cancelled=danger)
- Decorative scattered circles (bg-white/10 ~ bg-white/20) 8 วง
- Icon box สีขาว + icon สีตามสถานะ (w-20 h-20)
- Status badge สีขาว + text สีตามสถานะ (px-10 rounded-xl)
- Note: information icon + "หมายเหตุ:" สี text-info, ข้อความสีปกติ
- Stats: icon menu-list + payment-bath (w-12 h-12) พร้อมตัวเลข text-2xl

**Table Section:**
- หัว "รายการออเดอร์" text-2xl font-bold
- Filter dropdown + ปุ่ม action อยู่แถวเดียวกัน
- ปุ่มขนาดปกติ (ไม่มี p-button-sm) + text-lg
- ปุ่ม: เพิ่มรายการ (outlined), ส่งครัว (primary), ขอบิล (warning), แยกบิล (outlined), ชำระเงิน (success)
- Table text-lg, header whitespace-nowrap
- รูป h-24 w-24 + border กรอบ + icon ตาม category
- ตัวเลือกเพิ่ม แต่ละตัวแยกบรรทัด + ราคาสี primary
- ราคา/หน่วย + ราคารวม เติม "บาท"
- สถานะ: สีตัวอักษร font-bold (ไม่ใช่ badge), Voided="ลบรายการ", opacity-60
- ปุ่มตัวเลือก w-10 h-10 + frozen column ขวา

### Sub-task 4.1: อัพเดต order-detail.component.ts ✅
- เพิ่ม methods: getCategoryIcon, getItemStatusBadge, getBannerGradient, getStatusColor
- แก้ getStatusLabel: Voided → "ลบรายการ"
- แก้ getItemStatusClass: line-through → opacity-60

### Sub-task 4.2: อัพเดต order-detail.component.html ✅
- Header: Gradient banner + circles + icon box + status badge + note + stats
- Table: text-lg, whitespace-nowrap, รูปใหญ่+กรอบ+category icon, frozen column, ปุ่มใหญ่

### Sub-task 4.3: ลบ test-order-detail ✅
- ลบ component files + route + declaration
