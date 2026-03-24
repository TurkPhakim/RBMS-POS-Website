# ระบบจัดการเมนูอาหาร (Menu Management System)

> สถานะ: **Draft** | อัปเดตล่าสุด: 2026-03-17

---

## 1. ภาพรวม

### 1.1 บทนำ

ระบบจัดการเมนูอาหาร (Menu Management) เป็นหัวใจของระบบ POS ทำหน้าที่จัดการรายการเมนูทั้งหมดของร้าน ตั้งแต่การจัดหมวดหมู่ ตั้งราคา กำหนดช่วงเวลาขาย ไปจนถึงตัวเลือกเสริม (Extra/Add-on) โดยข้อมูลจากระบบนี้จะถูกนำไปใช้ในหน้าสั่งอาหาร (Order), ระบบรายงาน (Report), และการจัดการสต็อก (Inventory) ในอนาคต

### 1.2 สถานะปัจจุบัน vs ที่ต้องการ

| หัวข้อ | ปัจจุบัน | ที่ต้องการ |
|--------|----------|-----------|
| ประเภทหลัก | 2 (อาหาร, เครื่องดื่ม) — enum ตายตัว | 3 (อาหาร, เครื่องดื่ม, ของหวาน) — enum ตายตัว |
| หมวดหมู่ย่อย | ไม่มี | Configurable — ร้านเพิ่ม/ลบได้ พร้อมสถานะเปิด/ปิด |
| ตัวเลือกเสริม | ไม่มี | Option Groups + Option Items (แบบ FoodStory/Toast POS) |
| ช่วงเวลาขาย | ไม่มี | เชื่อมกับ Shop Settings (1-2 ช่วง) |
| ราคาต้นทุน | ไม่มี | CostPrice — สำหรับ P&L report |
| Tags | ไม่มี | 3 tags: แนะนำ, ตามเทศกาล, ใช้เวลาล่าช้า |
| สารก่อภูมิแพ้ | ไม่มี | Free text |
| แคลอรี่ | ไม่มี | ต่อหน่วย (ต่อจาน/ต่อแก้ว) |
| สถานะ | 2 สถานะ (ระบบ + การขาย) | 1 สถานะ (การขาย อย่างเดียว) |
| หน้า List | 1 หน้ารวม + filter client-side | 3 หน้าแยกตามประเภท + server-side pagination |

### 1.3 ขอบเขต (Scope)

**ทำ:**
- ลบโค้ด Menu module เดิมทั้งหมด (Backend + Frontend)
- สร้างระบบหมวดหมู่ย่อย (Sub-Categories) พร้อม CRUD
- สร้างระบบเมนู (Menu Items) ใหม่ทั้งหมดพร้อม fields ใหม่
- สร้างระบบตัวเลือกเสริม (Option Groups) พร้อม CRUD
- Frontend routes, components, sidebar ใหม่ทั้งหมด

**ไม่ทำ (อนาคต):**
- หน้าสั่งอาหาร (Order) — จะอ้างอิง MenuId จากระบบนี้
- ระบบรายงาน (Report) — จะดึง Price/CostPrice มาคำนวณ
- ระบบสต็อก/วัตถุดิบ (Inventory) — cost breakdown ระดับส่วนผสม

---

## 2. โครงสร้างหมวดหมู่

### 2.1 ประเภทหลัก (Main Categories)

ประเภทหลักเป็น **enum ตายตัว** ร้านไม่สามารถเพิ่มหรือลบได้ ใช้สำหรับแบ่งเมนูเป็น 3 กลุ่มใหญ่:

| ค่า | ชื่อ (ไทย) | ชื่อ (อังกฤษ) | ตัวอย่าง |
|-----|-----------|--------------|---------|
| 1 | อาหาร | Food | ข้าวผัด, ต้มยำ, แกงเขียวหวาน |
| 2 | เครื่องดื่ม | Beverage | กาแฟ, ชาเขียว, น้ำผลไม้ |
| 3 | ของหวาน | Dessert | ไอศกรีม, เค้ก, บัวลอย |

### 2.2 หมวดหมู่ย่อย (Sub-Categories)

ร้านสามารถสร้างหมวดหมู่ย่อยภายในแต่ละประเภทหลักได้ เพื่อจัดกลุ่มเมนูให้ละเอียดขึ้น

**ข้อมูลของหมวดหมู่ย่อย:**

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| ชื่อหมวดหมู่ | string(100) | ใช่ | |
| ประเภทหลัก | enum (1/2/3) | ใช่ | ผูกกับ Food/Beverage/Dessert |
| ลำดับ | int | ไม่ | จัดด้วย drag & drop ในหน้า List (default 0) — ใช้เรียงลำดับในหน้าสั่งอาหาร + dropdown |
| สถานะการขาย | bool | ใช่ | ถ้าปิด → เมนูทั้งหมดในหมวดนี้ไม่แสดงในหน้าสั่ง |

**ตัวอย่าง:**

| ประเภทหลัก | หมวดหมู่ย่อย |
|-----------|-------------|
| อาหาร | แกง, อาหารจานด่วน, มังสวิรัติ, อาหารทะเล |
| เครื่องดื่ม | ร้อน, เย็น, ปั่น, น้ำผลไม้สด |
| ของหวาน | ไอศกรีม, เบเกอรี่, ขนมไทย |

**Business Rules:**
- ต้องมีอย่างน้อย 1 หมวดหมู่ย่อยในแต่ละประเภทหลัก ก่อนสร้างเมนูได้
- ห้ามลบหมวดหมู่ย่อยที่มีเมนูอ้างอิงอยู่ (ต้องย้ายเมนูออกก่อน หรือแสดง error)

---

## 3. รายการเมนู (Menu Items)

### 3.1 ข้อมูลเมนู

| Field | Type | Required | Validation | หมายเหตุ |
|-------|------|----------|------------|----------|
| ชื่อไทย | string(200) | ใช่ | | |
| ชื่ออังกฤษ | string(200) | ใช่ | | |
| คำอธิบาย | string(1000) | ไม่ | | รายละเอียดเมนู |
| รูปเมนู | IFormFile | ไม่ | max 10MB, jpg/png/webp | อัพโหลดไป TbFile |
| หมวดหมู่ย่อย | FK | ใช่ | ต้องมีอยู่จริง + IsActive | เลือกจาก dropdown |
| ราคาขาย | decimal(10,2) | ใช่ | 0–99,999,999.99 | แสดงในหน้าสั่ง |
| ราคาต้นทุน | decimal(10,2) | ไม่ | 0–99,999,999.99 | สำหรับ P&L report |
| เปิดขายช่วงที่ 1 | bool | ใช่ | default true | เชื่อม Shop Settings |
| เปิดขายช่วงที่ 2 | bool | ใช่ | default true | เชื่อม Shop Settings |
| Tags | bitmask (int) | ไม่ | 0–7 | 1=แนะนำ, 2=ตามเทศกาล, 4=ใช้เวลาล่าช้า |
| สารก่อภูมิแพ้ | string(500) | ไม่ | | free text เช่น "ถั่วลิสง, นม, กลูเตน" |
| แคลอรี่/หน่วย | decimal(8,2) | ไม่ | 0–99,999.99 | กิโลแคลอรี่ต่อ serving |
| สถานะการขาย | bool | ใช่ | default true | เปิด/ปิดขายเมนูนี้ |
| ปักหมุด | bool | ไม่ | default false | ปักหมุดเมนูไว้ด้านบนสุดของหมวดหมู่ย่อยนั้น |

### 3.2 Tags (ป้ายกำกับ)

ใช้ bitmask ในฐานข้อมูล สามารถติดได้หลาย tag พร้อมกัน:

| ค่า | Tag | Icon | สีเมื่อเลือก | สีเมื่อไม่เลือก | ตัวอย่างการใช้ |
|-----|-----|------|-------------|----------------|---------------|
| 1 | แนะนำ | TBD (เช่น star/thumbs-up) | primary | text-gray-400 | เมนูขายดี เมนูเด่น |
| 2 | ตามเทศกาล | TBD (เช่น calendar/gift) | warning | text-gray-400 | เมนูปีใหม่ เมนูสงกรานต์ |
| 4 | ใช้เวลาล่าช้า | TBD (เช่น clock/hourglass) | danger | text-gray-400 | เมนูที่ต้องเตรียมนาน |

**การรวม:** ค่า 3 = แนะนำ + ตามเทศกาล, ค่า 5 = แนะนำ + ใช้เวลาล่าช้า, ค่า 7 = ทั้ง 3 tags

**UI ใน Menu Manage Page:**
- แสดงเป็น icon toggle 3 อัน วางเรียงกัน
- **ไม่เลือก** → icon สีเทา (`text-gray-400`) + พื้นหลังจาง
- **เลือกแล้ว** → icon สีสัน (ตามสีของ tag) + พื้นหลังอ่อนๆ ของสีนั้น
- กดจิ้มเพื่อ toggle เปิด/ปิด แต่ละ tag อิสระจากกัน
- แสดง label ใต้ icon เพื่อให้รู้ว่า tag นี้คืออะไร

**UI ใน Menu List Page (ตาราง):**
- แสดงเป็น badges สีเล็กๆ เรียงกัน (เฉพาะ tag ที่เลือก)
- เช่น `[แนะนำ]` สี primary + `[ช้า]` สี danger

### 3.3 ช่วงเวลาขาย

เชื่อมกับ Shop Settings (`HasTwoPeriods` และ `TbShopOperatingHour`):

**กรณีร้านมี 1 ช่วง** (`HasTwoPeriods = false`):
- UI แสดง toggle เดียว: "เปิดขาย"
- Bind กับ `IsAvailablePeriod1` (Period2 จะเป็น true เสมอ — ไม่มีผล)
- Filter dropdown: ทั้งหมด / เปิดขาย / ปิดขาย

**กรณีร้านมี 2 ช่วง** (`HasTwoPeriods = true`):
- UI แสดง 2 toggles พร้อม label เวลาจริงจาก Operating Hours:
  - "ช่วงที่ 1 (06:00–14:00)" → `IsAvailablePeriod1`
  - "ช่วงที่ 2 (14:00–22:00)" → `IsAvailablePeriod2`
- เปิดทั้ง 2 ช่วง = ขายทั้งวัน
- ปิดทั้ง 2 ช่วง = **UI ต้อง auto ปิด "สถานะการขาย" (IsAvailable → false) ด้วย** เพราะไม่มีช่วงเวลาขายเลย (ไม่ต้องแจ้ง notification — auto เงียบ)
- Filter dropdown: ทั้งหมด / ช่วงที่ 1 เท่านั้น / ช่วงที่ 2 เท่านั้น / ทั้งสองช่วง

**การใช้งานในหน้าสั่งอาหาร (อนาคต):**
- ระบบเช็คเวลาปัจจุบันว่าอยู่ช่วงไหน → แสดงเฉพาะเมนูที่เปิดขายในช่วงนั้น
- ถ้าเวลาอยู่นอกช่วงทั้งสอง → ไม่แสดงเมนูใดเลย (หรือแสดงพร้อม badge "นอกเวลาขาย")

### 3.4 ราคาต้นทุนและการรายงาน

- **ราคาต้นทุน (CostPrice)** คือราคาวัตถุดิบโดยประมาณต่อ 1 หน่วยเมนู (ต่อจาน/ต่อแก้ว)
- ร้านกรอกเองเป็นตัวเลขรวม ไม่ต้องระบุส่วนประกอบทีละรายการ
- **กำไรขั้นต้น (Gross Profit)** = ราคาขาย - ราคาต้นทุน
- **ตัวเลือกเสริม (Extra) มี CostPrice แยก** (optional) — ถ้าไม่กรอก ถือว่า Extra เป็นรายได้ล้วนๆ

**ตัวอย่าง — เมนูเดี่ยว (ไม่มี Extra):**

| เมนู | ราคาขาย | ราคาต้นทุน | กำไรขั้นต้น | อัตรากำไร |
|------|---------|-----------|------------|----------|
| ข้าวผัดกุ้ง | 120 | 45 | 75 | 62.5% |
| ชาเขียวเย็น | 55 | 12 | 43 | 78.2% |

**ตัวอย่าง — เมนู + Extra:**

| รายการ | ราคาขาย | ราคาต้นทุน | กำไร |
|--------|---------|-----------|------|
| ข้าวผัดกุ้ง | 120 | 45 | 75 |
| + ไข่ดาว | +10 | 3 (optional) | 7 |
| + ชีส | +15 | 5 (optional) | 10 |
| **รวม** | **145** | **53** | **92** |

- ถ้า Option Item ไม่กรอก CostPrice → ถือว่าต้นทุน = 0 (Extra income ทั้งหมดเป็นกำไร)

**รายงานที่รองรับ (อนาคต):**
- กำไรขั้นต้นต่อเมนู / ต่อหมวดหมู่ / ต่อประเภท
- เมนูขายดี vs เมนูกำไรสูง
- เมนูที่อัตรากำไรต่ำ (ควรปรับราคาหรือต้นทุน)
- สรุปยอดขายตามช่วงเวลา

> **ดู [REQ-dashboard-system](REQ-dashboard-system.md) สำหรับ Dashboard Phase 1** (ยอดขาย, เมนูขายดี, ช่วงเวลาขายดี) — กำไรขั้นต้น (Gross Profit) อยู่ใน Phase 2

**ถ้าต้องการ cost breakdown ระดับวัตถุดิบ** → เป็น scope ของ Inventory Management module (อนาคต) ที่จะเชื่อม recipe → ingredients → stock

---

## 4. ตัวเลือกเสริม (Option Groups & Items)

### 4.1 แนวคิด

อ้างอิงจาก FoodStory, Toast POS, FoodNerd — ระบบ POS มาตรฐานใช้ pattern **Option Group → Option Items**:

- **Option Group** = กลุ่มตัวเลือก (เช่น "ระดับความเผ็ด", "เพิ่มท็อปปิ้ง", "ขนาดแก้ว")
- **Option Item** = ตัวเลือกย่อยในกลุ่ม (เช่น "ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดมาก")
- Option Group เป็น **shared** — สร้างครั้งเดียวแล้วผูกกับหลายเมนูได้

### 4.2 ข้อมูล Option Group

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| ชื่อกลุ่ม | string(100) | ใช่ | เช่น "ระดับความเผ็ด", "เพิ่มท็อปปิ้ง" |
| ประเภทที่ใช้ได้ | int (enum) | ใช่ | 1=อาหาร, 2=เครื่องดื่ม, 3=ของหวาน (ใช้ EMenuCategory เดียวกับหมวดหมู่ย่อย) |
| บังคับเลือก | bool | ใช่ | true = ลูกค้าต้องเลือก, false = เลือกหรือไม่ก็ได้ |
| เลือกขั้นต่ำ | int | ใช่ | default 0, ถ้า required ต้อง >= 1 |
| เลือกสูงสุด | int? | ไม่ | null = ไม่จำกัด, 1 = เลือกได้อย่างเดียว |
| ลำดับ | int | ไม่ | ลำดับแสดงในหน้าสั่ง |
| สถานะ | bool | ใช่ | เปิด/ปิดกลุ่มตัวเลือกนี้ |

### 4.3 ข้อมูล Option Item

| Field | Type | Required | หมายเหตุ |
|-------|------|----------|----------|
| ชื่อตัวเลือก | string(100) | ใช่ | เช่น "ไข่ดาว", "ไม่เผ็ด" |
| ราคาเพิ่ม | decimal(10,2) | ใช่ | default 0, เช่น +10, +15 |
| ราคาต้นทุน | decimal(10,2) | ไม่ | ต้นทุนวัตถุดิบ (ถ้าไม่กรอก ถือว่า 0) |
| ลำดับ | int | ไม่ | ลำดับแสดง (จัดด้วย drag & drop) |
| สถานะ | bool | ใช่ | เปิด/ปิดตัวเลือกนี้ |

### 4.4 ตัวอย่างการใช้งาน

| Option Group | ประเภท | บังคับ? | Min | Max | ตัวเลือก |
|---|---|---|---|---|---|
| ระดับความเผ็ด | อาหาร | ใช่ | 1 | 1 | ไม่เผ็ด(+0), เผ็ดน้อย(+0), เผ็ดกลาง(+0), เผ็ดมาก(+0) |
| เพิ่มท็อปปิ้ง | อาหาร | ไม่ | 0 | null | ไข่ดาว(+10), ชีส(+15), เบคอน(+20), ผักเพิ่ม(+5) |
| ขนาดแก้ว | เครื่องดื่ม | ใช่ | 1 | 1 | S(+0), M(+10), L(+20) |
| หมายเหตุพิเศษ | อาหาร | ไม่ | 0 | null | ไม่ใส่ผัก(+0), ไม่ใส่ผงชูรส(+0), เพิ่มข้าว(+10) |

### 4.5 การผูก Option Group ↔ Menu

- ใช้ตาราง junction (many-to-many)
- 1 เมนูผูกได้หลาย Option Group
- 1 Option Group ผูกกับหลายเมนูได้
- มี SortOrder สำหรับลำดับแสดง Option Group ในแต่ละเมนู

**ตัวอย่าง:**
- "ข้าวผัดกุ้ง" → ระดับความเผ็ด, เพิ่มท็อปปิ้ง
- "ชาเขียวเย็น" → ขนาดแก้ว, เพิ่มท็อปปิ้ง
- "ส้มตำ" → ระดับความเผ็ด, หมายเหตุพิเศษ

### 4.6 Business Rules

- ถ้า `IsRequired = true` → `MinSelect` ต้อง >= 1
- ถ้า `MaxSelect = 1` → UI แสดงเป็น radio button (เลือกได้อันเดียว)
- ถ้า `MaxSelect > 1` หรือ `null` → UI แสดงเป็น checkbox (เลือกได้หลายอัน)
- Option Item ที่ `IsActive = false` → ไม่แสดงในหน้าสั่ง แต่ยังเห็นในหน้าจัดการ
- Option Group ที่ `IsActive = false` → **ซ่อนแค่ group นั้น** จากหน้าสั่ง แม้จะเป็น required → เมนูยังสั่งได้ (ถือว่าไม่บังคับเลือกชั่วคราว)

**การลบ:**
- **Option Group** — ถ้ายังมีเมนูผูกอยู่ → ห้ามลบ (แสดง error) / ถ้าไม่มีเมนูผูก → **hard delete** (ลบจริงพร้อม Option Items ทั้งหมด)
- **Option Item** — ลบจากตาราง inline ในหน้า Manage → **hard delete** (ลบจริง เพราะยังไม่ถูกอ้างอิงใน Order)
- **TbMenuOptionGroup** (junction) — ถอด link → **hard delete**

**Delta Pattern สำหรับ Update Option Group (Backend):**
- API `PUT /api/menu/options/{id}` รับ Group data + array ของ Option Items
- Backend เปรียบเทียบ items ที่ส่งมากับ items ใน DB:
  - **มี id + ข้อมูลเปลี่ยน** → update
  - **มี id + ข้อมูลเหมือนเดิม** → skip
  - **ไม่มี id (item ใหม่)** → insert
  - **id ที่อยู่ใน DB แต่ไม่อยู่ใน request** → hard delete

---

## 5. Database Schema

### 5.1 Entity ที่แก้ไข

**TbMenu** (แก้ไข):

```
ลบ:
- Category (EMenuCategory enum)
- IsActive (สถานะระบบ)

เพิ่ม:
- SubCategoryId (int, FK → TbMenuSubCategory, required)
- CostPrice (decimal(10,2), nullable)
- IsAvailablePeriod1 (bool, default true)
- IsAvailablePeriod2 (bool, default true)
- Tags (int, default 0) — bitmask
- Allergens (string(500), nullable)
- CaloriesPerServing (decimal(8,2), nullable)
- IsPinned (bool, default false) — ปักหมุดเมนูไว้ด้านบนสุดของหมวดหมู่ย่อย

คงเดิม:
- MenuId, NameThai, NameEnglish, Description, ImageFileId, Price, IsAvailable
- BaseEntity fields (CreatedAt/By, UpdatedAt/By, DeleteFlag/At/By)
```

**EMenuCategory** (enum แก้ไข):
```
Food = 1
Beverage = 2
Dessert = 3 ← เพิ่ม
```

### 5.2 Entity ใหม่

**TbMenuSubCategory:**

| Column | Type | Constraints |
|--------|------|-------------|
| SubCategoryId | int | PK, identity |
| CategoryType | int | required (1/2/3) |
| Name | nvarchar(100) | required |
| SortOrder | int | default 0 |
| IsActive | bit | default true |
| (BaseEntity fields) | | auto-managed |

Indexes: `[CategoryType]`, `[IsActive]`

Navigation: `ICollection<TbMenu> Menus`

---

**TbOptionGroup:** (hard delete — ถ้าไม่มีเมนูผูก / ห้ามลบถ้ายังมีเมนูผูก)

| Column | Type | Constraints |
|--------|------|-------------|
| OptionGroupId | int | PK, identity |
| Name | nvarchar(100) | required |
| CategoryType | int | required (1=Food, 2=Beverage, 3=Dessert) — ใช้ EMenuCategory |
| IsRequired | bit | default false |
| MinSelect | int | default 0 |
| MaxSelect | int? | nullable (null = unlimited) |
| SortOrder | int | default 0 |
| IsActive | bit | default true |
| (BaseEntity fields) | | auto-managed |

Indexes: `[Name]`, `[IsActive]`, `[CategoryType]`

Navigation: `ICollection<TbOptionItem> OptionItems`, `ICollection<TbMenuOptionGroup> MenuOptionGroups`

Delete: cascade hard delete → ลบ TbOptionItem ทั้งหมดที่อยู่ใน group

---

**TbOptionItem:** (hard delete — ใช้ Delta Pattern ตอน update group)

| Column | Type | Constraints |
|--------|------|-------------|
| OptionItemId | int | PK, identity |
| OptionGroupId | int | FK → TbOptionGroup, required, cascade delete |
| Name | nvarchar(100) | required |
| AdditionalPrice | decimal(10,2) | default 0 |
| CostPrice | decimal(10,2)? | nullable, default null (ถ้าไม่กรอก ถือว่า 0) |
| SortOrder | int | default 0 |
| IsActive | bit | default true |
| (BaseEntity fields) | | auto-managed |

Indexes: `[OptionGroupId]`, `[IsActive]`

---

**TbMenuOptionGroup (junction):** (hard delete — ถอด link)

| Column | Type | Constraints |
|--------|------|-------------|
| MenuOptionGroupId | int | PK, identity |
| MenuId | int | FK → TbMenu, required |
| OptionGroupId | int | FK → TbOptionGroup, required |
| SortOrder | int | default 0 |
| (BaseEntity fields) | | auto-managed |

Indexes: `[MenuId, OptionGroupId]` unique, `[MenuId]`, `[OptionGroupId]`

### 5.3 Enum ใหม่

**EMenuTag (Flags):**
```csharp
[Flags]
public enum EMenuTag
{
    None = 0,
    Recommended = 1,    // แนะนำ
    Seasonal = 2,       // ตามเทศกาล
    SlowPreparation = 4 // ใช้เวลาล่าช้า
}
```

### 5.4 ER Diagram (Text)

```
TbMenuSubCategory (1) ──── (*) TbMenu (*) ──── (*) TbOptionGroup
       │                           │                      │
       │ CategoryType              │ SubCategoryId (FK)   │
       │ Name                      │ Tags (bitmask)       │
       │ IsActive                  │ IsAvailablePeriod1   │ OptionGroupId
       │                           │ IsAvailablePeriod2   │ Name
       │                           │ CostPrice            │ IsRequired
       │                           │ Allergens            │ MinSelect / MaxSelect
       │                           │ CaloriesPerServing   │
       │                           │                      │
       │                           │                      │
       │                    TbMenuOptionGroup       TbOptionItem (*)
       │                    (junction table)              │
       │                    MenuId + OptionGroupId        │ OptionGroupId (FK)
       │                    SortOrder                     │ Name
       │                                                  │ AdditionalPrice
       │                                                  │ CostPrice
       │
  TbFile ←── ImageFileId (FK, nullable)
```

---

## 6. API Endpoints

### 6.1 หมวดหมู่ย่อย (Sub-Categories)

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/menu/categories` | menu-category.read | ดึงทั้งหมด (grouped by CategoryType) |
| GET | `/api/menu/categories/{subCategoryId}` | menu-category.read | ดึงตาม ID (รวมเมนูในหมวดหมู่) |
| GET | `/api/menu/categories/type/{categoryType}` | menu-category.read | ดึงตามประเภทหลัก |
| POST | `/api/menu/categories` | menu-category.create | สร้างใหม่ |
| PUT | `/api/menu/categories/{subCategoryId}` | menu-category.update | แก้ไข |
| DELETE | `/api/menu/categories/{subCategoryId}` | menu-category.delete | Soft delete (ต้องไม่มีเมนูอ้างอิง) |
| PUT | `/api/menu/categories/sort-order` | menu-category.update | อัพเดตลำดับ (รับ array ของ {id, sortOrder}) |

**Controller:** `MenuCategoriesController` (แยกจาก MenusController เดิม)

### 6.2 รายการเมนู (Menu Items)

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/menu/items` | menu-{category}.read | Paginated list + filters |
| GET | `/api/menu/items/{menuId}` | menu-{category}.read | ดึงตาม ID (รวม option groups) |
| POST | `/api/menu/items` | menu-{category}.create | สร้างใหม่ (multipart) |
| PUT | `/api/menu/items/{menuId}` | menu-{category}.update | แก้ไข (multipart) |
| DELETE | `/api/menu/items/{menuId}` | menu-{category}.delete | Soft delete |

> **หมายเหตุ:** `{category}` = `food` / `beverage` / `dessert` ขึ้นกับ `categoryType` ของเมนู — ดู §9.1 Permission Constants

**GET `/api/menu/items` Query Parameters:**

| Parameter | Type | Default | หมายเหตุ |
|-----------|------|---------|----------|
| categoryType | int? | null | 1=Food, 2=Beverage, 3=Dessert |
| subCategoryId | int? | null | filter ตามหมวดหมู่ย่อย |
| search | string? | null | ค้นหาชื่อไทย/อังกฤษ |
| period | string? | null | "period1" / "period2" / "both" |
| isAvailable | bool? | null | สถานะการขาย |
| page | int | 1 | หน้าที่ |
| itemPerPage | int | 10 | จำนวนต่อหน้า |

**Response:** `PaginationResult<MenuResponseModel>`

### 6.3 ตัวเลือกเสริม (Option Groups)

| Method | Route | Permission | รายละเอียด |
|--------|-------|-----------|-----------|
| GET | `/api/menu/options` | menu-option.read | Paginated list + filters |
| GET | `/api/menu/options/{optionGroupId}` | menu-option.read | ดึงตาม ID (รวม items + linked menus) |
| POST | `/api/menu/options` | menu-option.create | สร้างใหม่ (พร้อม items) |
| PUT | `/api/menu/options/{optionGroupId}` | menu-option.update | แก้ไข (พร้อม items) |
| DELETE | `/api/menu/options/{optionGroupId}` | menu-option.delete | Hard delete (ต้องไม่มีเมนูผูก — ลบ Group + Items ทั้งหมด) |

**GET `/api/menu/options` Query Parameters:**

| Parameter | Type | Default | หมายเหตุ |
|-----------|------|---------|----------|
| search | string? | null | ค้นหาชื่อกลุ่ม |
| categoryType | int? | null | 1=Food, 2=Beverage, 3=Dessert |
| isActive | bool? | null | สถานะเปิด/ปิด |
| page | int | 1 | หน้าที่ |
| itemPerPage | int | 10 | จำนวนต่อหน้า |

**Response:** `PaginationResult<OptionGroupResponseModel>`

**Controller:** `MenuOptionsController`

### 6.4 Response Models

**MenuResponseModel (ปรับใหม่):**
```
menuId, nameThai, nameEnglish, description, imageFileId, imageFileName,
subCategoryId, subCategoryName, categoryType, categoryTypeName,
price, costPrice, isAvailable,
isAvailablePeriod1, isAvailablePeriod2,
tags, allergens, caloriesPerServing, isPinned,
optionGroups: [{ optionGroupId, name, isRequired, minSelect, maxSelect, items: [...] }],
createdAt, updatedAt, createdBy, updatedBy
```

**SubCategoryResponseModel:**
```
subCategoryId, categoryType, categoryTypeName, name, sortOrder, isActive,
menuCount (จำนวนเมนูในหมวดหมู่นี้),
menus: [{ menuId, imageFileId, nameThai, nameEnglish, price, isAvailablePeriod1, isAvailablePeriod2, isAvailable }] (optional — เฉพาะ getById)
```

**OptionGroupResponseModel:**
```
optionGroupId, name, categoryType, categoryTypeName, isRequired, minSelect, maxSelect, sortOrder, isActive,
optionItems: [{ optionItemId, name, additionalPrice, costPrice, sortOrder, isActive }],
linkedMenuCount (จำนวนเมนูที่ผูก),
linkedMenus: [{ menuId, imageFileId, nameThai, nameEnglish, categoryTypeName, isAvailable }] (optional — เฉพาะ getById)
```

---

## 7. Frontend Pages & Components

### 7.1 Sidebar Navigation

```
เมนู (icon: menu-restaurant, permissions: ['menu-food.read', 'menu-beverage.read', 'menu-dessert.read'])
├── หมวดหมู่ (icon: TBD) → /menu/categories
│   permissions: ['menu-category.read']
├── เมนูอาหาร (icon: food) → /menu/food
│   permissions: ['menu-food.read']
├── เมนูเครื่องดื่ม (icon: TBD) → /menu/beverage
│   permissions: ['menu-beverage.read']
├── เมนูของหวาน (icon: TBD) → /menu/dessert
│   permissions: ['menu-dessert.read']
└── ตัวเลือกเสริม (icon: TBD) → /menu/options
    permissions: ['menu-option.read']
```

> **หมายเหตุ:** Parent menu "เมนู" แสดงถ้ามี permission ใดก็ได้ใน 3 ประเภท (OR logic)

### 7.2 Routes

```
/menu
├── /categories                           → SubCategoryListComponent
├── /categories/create                    → SubCategoryManageComponent
├── /categories/update/:subCategoryId     → SubCategoryManageComponent
│
├── /food                                 → MenuListComponent (route data: categoryType=1)
├── /food/create                          → MenuManageComponent (route data: categoryType=1)
├── /food/update/:menuId                  → MenuManageComponent
│
├── /beverage                             → MenuListComponent (route data: categoryType=2)
├── /beverage/create                      → MenuManageComponent (route data: categoryType=2)
├── /beverage/update/:menuId              → MenuManageComponent
│
├── /dessert                              → MenuListComponent (route data: categoryType=3)
├── /dessert/create                       → MenuManageComponent (route data: categoryType=3)
├── /dessert/update/:menuId               → MenuManageComponent
│
├── /options                              → OptionGroupListComponent
├── /options/create                       → OptionGroupManageComponent
└── /options/update/:optionGroupId        → OptionGroupManageComponent
```

**Component reuse:** `MenuListComponent` และ `MenuManageComponent` ใช้ร่วมกัน 3 ประเภท (แยกด้วย route data `categoryType`)

### 7.3 หมวดหมู่ย่อย — List Page

**Layout:**
- Header: icon + title "หมวดหมู่เมนู"
- 3 tabs: อาหาร | เครื่องดื่ม | ของหวาน (p-tabs + p-tablist + p-tabpanels)
- Breadcrumb button: เปลี่ยนตาม tab ที่ active (ถ้ามี canCreate):
  - Tab อาหาร → "เพิ่มหมวดหมู่อาหาร"
  - Tab เครื่องดื่ม → "เพิ่มหมวดหมู่เครื่องดื่ม"
  - Tab ของหวาน → "เพิ่มหมวดหมู่ของหวาน"
- กดปุ่มเพิ่ม → navigate ไปหน้า Create พร้อมส่ง categoryType ตาม tab ปัจจุบัน

**แต่ละ Tab มีตาราง (รองรับ drag & drop เรียงลำดับ):**

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| ⠿ | w-[40px] | drag handle — จับลากเรียงลำดับ |
| รหัส | w-[80px] | centered |
| ชื่อหมวดหมู่ | w-[200px] | |
| จำนวนเมนู | w-[120px] | centered, badge |
| สถานะการขาย | w-[120px] | centered, สีเขียว/แดง |
| ตัวเลือก | w-[100px] | ปุ่ม edit + delete |

**Drag & Drop:** ลากแถวเพื่อเปลี่ยนลำดับภายใน tab → auto-save SortOrder ทันที (เรียก API)

**Filters:** Search (ชื่อหมวดหมู่, Enter key)
**Pagination:** rows=10, rowsPerPageOptions=[10, 25, 50]

**อ้างอิง UI:** คล้าย Position List — ตาราง + search + breadcrumb button (เพิ่ม tabs)

### 7.4 หมวดหมู่ย่อย — Manage Page

**Breadcrumb:** "ย้อนกลับ" (secondary/outlined) + "บันทึก"

**Card 1: ข้อมูลหมวดหมู่**
- ประเภทหลัก: dropdown (Food/Beverage/Dessert) — disabled ใน edit mode
- ชื่อหมวดหมู่: text input (required)
- สถานะการขาย: toggle
- (ลำดับจัดด้วย drag & drop ในหน้า List — ไม่มี input ในหน้านี้)

**Card 2: เมนูในหมวดหมู่นี้ (edit mode only)**

ตารางแสดงเมนูที่อยู่ในหมวดหมู่นี้ (read-only — ไม่สามารถแก้ไขจากหน้านี้):

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| รหัส | w-[80px] | centered |
| รูปเมนู | w-[80px] | thumbnail |
| ชื่อเมนู (ไทย) | w-[200px] | |
| ชื่อเมนู (อังกฤษ) | w-[200px] | |
| ราคา | w-[100px] | format เป็นสกุลเงิน |
| ช่วงเวลา | w-[120px] | badge: "ทั้งวัน" / "ช่วง 1" / "ช่วง 2" / "ปิด" |
| สถานะการขาย | w-[120px] | badge สีเขียว/แดง |

**อ้างอิง UI:** คล้าย Position Manage → ตาราง "พนักงานในตำแหน่งนี้"

### 7.5 เมนู — List Page (ใช้ร่วม 3 ประเภท)

**Layout:**
- Header: icon + title (เปลี่ยนตามประเภท: "เมนูอาหาร" / "เมนูเครื่องดื่ม" / "เมนูของหวาน")
- Breadcrumb button: "เพิ่มเมนู" (ถ้ามี canCreate)

**Filters:**

| Filter | Type | Default | หมายเหตุ |
|--------|------|---------|----------|
| Search | text + Enter key | "" | ค้นหาชื่อไทย/อังกฤษ |
| หมวดหมู่ย่อย | dropdown | ทั้งหมด | โหลด sub-categories ตาม categoryType |
| ช่วงเวลา | dropdown | ทั้งหมด | ทั้งหมด / ช่วงที่ 1 / ช่วงที่ 2 / ทั้งสองช่วง (ซ่อนถ้า 1 ช่วง) |
| สถานะการขาย | dropdown | ทั้งหมด | เปิดขาย / ปิดขาย |

**ตาราง:**

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| รหัส | w-[80px] | centered |
| รูปเมนู | w-[80px] | thumbnail + fallback icon |
| ชื่อเมนู | w-[200px] | 2 บรรทัด: ไทย (bold) + อังกฤษ (sub color) |
| หมวดหมู่ย่อย | w-[140px] | badge |
| ราคา | w-[100px] | format ฿XX.XX |
| ช่วงเวลา | w-[120px] | badge: "ทั้งวัน" / "ช่วง 1" / "ช่วง 2" / "ปิด" |
| Tags | w-[160px] | badges สี (แสดงได้หลาย tag) |
| ปักหมุด | w-[80px] | centered, icon pin สี/เทา |
| สถานะการขาย | w-[120px] | centered, สีเขียว/แดง, bold |
| ตัวเลือก | w-[100px] | ปุ่ม edit + delete |

**Pagination:** rows=10, rowsPerPageOptions=[10, 25, 50], server-side

**อ้างอิง UI:** คล้าย Employee List — ตาราง + filters + pagination + breadcrumb button

### 7.6 เมนู — Manage Page (ใช้ร่วม 3 ประเภท)

**Breadcrumb:** "ย้อนกลับ" (secondary/outlined) + "บันทึก"

**Card 1: ข้อมูลเมนู** (icon: TBD)
- Grid 2 คอลัมน์
- ชื่อไทย: text input (required)
- ชื่ออังกฤษ: text input (required)
- คำอธิบาย: textarea
- หมวดหมู่ย่อย: dropdown (โหลดตาม categoryType จาก route data)
- ราคาขาย: p-inputNumber (currency THB)
- ราคาต้นทุน: p-inputNumber (currency THB, optional)

**Card 2: รูปเมนู** (icon: TBD)
- `<app-image-upload-card>` — อัพโหลด/เปลี่ยน/ลบรูป

**Card 3: ช่วงเวลาขาย** (icon: TBD)
- ถ้า 1 ช่วง → toggle เดียว: "เปิดขาย"
- ถ้า 2 ช่วง → 2 toggles: "ช่วงที่ 1 (เวลา)" + "ช่วงที่ 2 (เวลา)"

**Card 4: Tags** (icon: TBD)
- 3 icon toggles วางเรียงกัน (ไม่ใช่ checkbox):
  - แนะนำ (icon TBD) — ไม่เลือก: สีเทา / เลือก: สี primary + พื้นอ่อน
  - ตามเทศกาล (icon TBD) — ไม่เลือก: สีเทา / เลือก: สี warning + พื้นอ่อน
  - ใช้เวลาล่าช้า (icon TBD) — ไม่เลือก: สีเทา / เลือก: สี danger + พื้นอ่อน
- กดจิ้มเพื่อ toggle เปิด/ปิดแต่ละ tag อิสระกัน
- แสดง label ใต้ icon

**Card 5: ข้อมูลเพิ่มเติม** (icon: TBD)
- สารก่อภูมิแพ้: textarea (placeholder: "เช่น ถั่วลิสง, นม, กลูเตน, อาหารทะเล")
- แคลอรี่ต่อหน่วย: p-inputNumber (suffix: "kcal")

**Card 6: ตัวเลือกเสริม** (icon: TBD)
- ปุ่ม "เพิ่มตัวเลือกเสริม" → เปิด dialog เลือก Option Group ที่มีอยู่ (filter เฉพาะ CategoryType เดียวกับเมนู)
- ตารางแสดง Option Groups ที่ผูกกับเมนูนี้ (รองรับ drag & drop เรียงลำดับ):

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| ⠿ | w-[40px] | drag handle — จับลากเรียงลำดับ |
| ชื่อกลุ่ม | w-[200px] | |
| บังคับ? | w-[100px] | badge: บังคับ (primary) / ไม่บังคับ (secondary) |
| ตัวเลือก | w-[300px] | แสดงชื่อ items + ราคา เช่น "ไข่ดาว(+10), ชีส(+15)" |
| จัดการ | w-[80px] | ปุ่มลบ (เอาออกจากเมนู ไม่ได้ลบ Option Group) |

- **Drag & Drop:** ลากแถวเพื่อเปลี่ยนลำดับ Option Group → SortOrder อัพเดตใน TbMenuOptionGroup (junction) → ลำดับแสดงในหน้าสั่งอาหาร

**Card 7: สถานะการขาย** (icon: TBD)
- Toggle: เปิด/ปิดขาย
- Toggle: ปักหมุด (IsPinned) — ปักหมุดเมนูไว้ด้านบนสุดของหมวดหมู่ย่อยนั้นในหน้าสั่งอาหาร

**อ้างอิง UI:** คล้าย Employee Manage — แบ่ง Card sections, breadcrumb buttons ด้านบน, form validation ด้วย `markFormDirty()`

### 7.7 ตัวเลือกเสริม — List Page

**Layout:**
- Header: icon + title "ตัวเลือกเสริม"
- Breadcrumb button: "เพิ่มกลุ่มตัวเลือก" (ถ้ามี canCreate)

**Filters:**

| Filter | Type | Default | หมายเหตุ |
|--------|------|---------|----------|
| Search | text + Enter key | "" | ค้นหาชื่อกลุ่ม |
| ประเภทที่ใช้ได้ | dropdown | ทั้งหมด | อาหาร / เครื่องดื่ม / ของหวาน (filter ตาม categoryType) |
| สถานะ | dropdown | ทั้งหมด | เปิด / ปิด |

**ตาราง:**

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| รหัส | w-[80px] | centered |
| ชื่อกลุ่ม | w-[200px] | |
| ประเภท | w-[120px] | badge: อาหาร / เครื่องดื่ม / ของหวาน |
| จำนวนตัวเลือก | w-[120px] | centered |
| เมนูที่ใช้ | w-[120px] | centered, จำนวนเมนูที่ผูก |
| สถานะ | w-[120px] | centered, สีเขียว/แดง |
| ตัวเลือก | w-[100px] | ปุ่ม edit + delete |

**Pagination:** rows=10, rowsPerPageOptions=[10, 25, 50]

**อ้างอิง UI:** คล้าย Employee List — ตาราง + filters + pagination + breadcrumb button

### 7.8 ตัวเลือกเสริม — Manage Page

**Breadcrumb:** "ย้อนกลับ" (secondary/outlined) + "บันทึก"

**Card 1: ข้อมูลกลุ่มตัวเลือก** (icon: TBD)
- ชื่อกลุ่ม: text input (required)
- ประเภทที่ใช้ได้: dropdown (อาหาร / เครื่องดื่ม / ของหวาน) — เลือกได้อันเดียว, required, disabled ใน edit mode
- บังคับเลือก: toggle
- เลือกขั้นต่ำ: p-inputNumber (แสดงเมื่อ toggle เปิด)
- เลือกสูงสุด: p-inputNumber (null = ไม่จำกัด, ใช้ checkbox "ไม่จำกัด")
- สถานะ: toggle

**Card 2: รายการตัวเลือก** (icon: TBD)
- ปุ่ม "เพิ่มตัวเลือก" → เพิ่มแถวใหม่ในตาราง (inline edit)
- ตาราง (รองรับ drag & drop เรียงลำดับ):

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| ⠿ | w-[40px] | drag handle — จับลากเรียงลำดับ |
| ชื่อตัวเลือก | w-[200px] | inline text input |
| ราคาเพิ่ม | w-[140px] | inline p-inputNumber |
| ราคาต้นทุน | w-[140px] | inline p-inputNumber (optional, placeholder "0") |
| สถานะ | w-[100px] | toggle |
| จัดการ | w-[80px] | ปุ่มลบแถว |

- **Drag & Drop:** ลากแถวเพื่อเปลี่ยนลำดับตัวเลือก → SortOrder อัพเดตในหน่วยความจำ (ต้องกด "บันทึก" ถึงจะ save ลง DB)
- เมื่อเพิ่มตัวเลือกใหม่ → ต่อท้ายลำดับล่าสุด

**Card 3: เมนูที่ใช้กลุ่มนี้ (edit mode only)** (icon: TBD)
- ตาราง read-only แสดงเมนูที่ผูก Option Group นี้:

| คอลัมน์ | Width | หมายเหตุ |
|---------|-------|----------|
| รหัส | w-[80px] | centered |
| รูปเมนู | w-[80px] | thumbnail |
| ชื่อเมนู (ไทย) | w-[200px] | |
| ชื่อเมนู (อังกฤษ) | w-[200px] | |
| ประเภท | w-[120px] | badge: อาหาร/เครื่องดื่ม/ของหวาน |
| สถานะการขาย | w-[120px] | badge สีเขียว/แดง |

**อ้างอิง UI:** คล้าย Position Manage — Card ข้อมูล + ตารางย่อย "พนักงานในตำแหน่ง" / "สิทธิ์การเข้าใช้"

---

## 8. UserFlow ละเอียด

### 8.1 Flow: ตั้งค่าระบบเมนูครั้งแรก

```
1. Admin เข้า sidebar "เมนู" → "หมวดหมู่"
2. เห็น 3 tabs ว่างเปล่า (ยังไม่มีหมวดหมู่ย่อย)
3. กดปุ่ม "เพิ่มหมวดหมู่" (breadcrumb)
4. → หน้า Create: เลือกประเภท "อาหาร", กรอกชื่อ "แกง", เปิดสถานะ
5. กด "บันทึก" → กลับหน้า list → เห็น "แกง" ใน tab อาหาร
6. ทำซ้ำ: เพิ่ม "อาหารจานด่วน" (อาหาร), "ร้อน"/"เย็น" (เครื่องดื่ม), "ไอศกรีม" (ของหวาน)
```

### 8.2 Flow: สร้าง Option Group

```
1. Admin เข้า sidebar "เมนู" → "ตัวเลือกเสริม"
2. กดปุ่ม "เพิ่มกลุ่มตัวเลือก"
3. → หน้า Create:
   Card ข้อมูลกลุ่มตัวเลือก:
   - ชื่อ: "ระดับความเผ็ด"
   - บังคับเลือก: เปิด
   - เลือกขั้นต่ำ: 1
   - เลือกสูงสุด: 1

   Card รายการตัวเลือก:
   - กด "เพิ่มตัวเลือก" → แถวใหม่: "ไม่เผ็ด" ราคา +0
   - กด "เพิ่มตัวเลือก" → แถวใหม่: "เผ็ดน้อย" ราคา +0
   - กด "เพิ่มตัวเลือก" → แถวใหม่: "เผ็ดมาก" ราคา +0
   - (ถ้าต้องการจัดลำดับ → drag & drop แถวเรียงตามต้องการ)

4. กด "บันทึก" → กลับหน้า list
```

### 8.3 Flow: เพิ่มเมนูอาหารใหม่

```
1. Admin เข้า sidebar "เมนู" → "เมนูอาหาร"
2. เห็นตาราง (ว่าง หรือมีเมนูเดิม)
3. กดปุ่ม "เพิ่มเมนู" (breadcrumb)
4. → หน้า Create:
   Card ข้อมูลเมนู:
   - ชื่อไทย: "ข้าวผัดกุ้ง"
   - ชื่ออังกฤษ: "Shrimp Fried Rice"
   - คำอธิบาย: "ข้าวผัดกุ้งสด ไข่ ผักสด"
   - หมวดหมู่ย่อย: เลือก "อาหารจานด่วน" (dropdown)
   - ราคาขาย: 120
   - ราคาต้นทุน: 45

   Card รูปเมนู:
   - อัพโหลดรูปข้าวผัดกุ้ง

   Card ช่วงเวลาขาย:
   - ช่วงที่ 1 (06:00–14:00): เปิด ✓
   - ช่วงที่ 2 (14:00–22:00): เปิด ✓

   Card Tags:
   - แนะนำ: ✓
   - ตามเทศกาล: ✗
   - ใช้เวลาล่าช้า: ✗

   Card ข้อมูลเพิ่มเติม:
   - สารก่อภูมิแพ้: "กุ้ง, ไข่, ถั่วลิสง"
   - แคลอรี่: 450

   Card ตัวเลือกเสริม:
   - กด "เพิ่มตัวเลือกเสริม" → เลือก "ระดับความเผ็ด"
   - กด "เพิ่มตัวเลือกเสริม" → เลือก "เพิ่มท็อปปิ้ง"

   Card สถานะ:
   - สถานะการขาย: เปิด ✓

5. กด "บันทึก" → กลับหน้า list → เห็นข้าวผัดกุ้งในตาราง
```

### 8.4 Flow: ค้นหาและกรองเมนู

```
1. Admin เปิดหน้า "เมนูอาหาร"
2. เห็นเมนูทั้งหมดในประเภทอาหาร (paginated)
3. พิมพ์ "ข้าว" ใน Search → กด Enter → เห็นเฉพาะเมนูที่ชื่อมี "ข้าว"
4. เลือก dropdown หมวดหมู่ → "อาหารจานด่วน" → กรองเพิ่ม
5. เลือก dropdown สถานะ → "เปิดขาย" → เห็นเฉพาะที่เปิดขาย
6. ล้าง filter → กลับเห็นทั้งหมด
```

### 8.5 Flow: ปิดหมวดหมู่ย่อย

```
1. Admin เข้าหน้า "หมวดหมู่"
2. เลือก tab "เครื่องดื่ม"
3. กดปุ่มแก้ไข "เย็น"
4. → หน้า Update: เห็นตาราง "เมนูในหมวดหมู่นี้" (มีชาเขียวเย็น, กาแฟเย็น ฯลฯ)
5. ปิดสถานะการขาย → กด "บันทึก"
6. ผลลัพธ์: เมนูเครื่องดื่มเย็นทั้งหมดไม่แสดงในหน้าสั่งอาหาร
   (แต่ยังเห็นในหน้าจัดการเมนู)
```

### 8.6 Flow: สร้างเมนูที่ไม่มีตัวเลือกเสริม

```
1. Admin เปิดหน้า "เมนูของหวาน" → กด "เพิ่มเมนู"
2. กรอกข้อมูลปกติ: ชื่อ, ราคา, หมวดหมู่, รูป, ช่วงเวลา, tags ฯลฯ
3. Card "ตัวเลือกเสริม" → ว่างเปล่า → ไม่ต้องทำอะไร (ไม่บังคับ)
4. กด "บันทึก" → สำเร็จ
5. ในหน้าสั่งอาหาร: เมนูนี้สั่งได้เลย ไม่มีตัวเลือกให้เลือก
```

### 8.7 Flow: สร้างเมนูแล้วอยากเพิ่มตัวเลือกเสริมที่ยังไม่มี

```
1. Admin กำลังสร้างเมนู "ไอศกรีมช็อกโกแลต" → อยากให้ลูกค้าเลือกท็อปปิ้งได้
2. แต่ยังไม่เคยสร้าง Option Group "เลือกท็อปปิ้ง"
3. บันทึกเมนูก่อน (ยังไม่ผูก option group)
4. ไปหน้า sidebar "ตัวเลือกเสริม" → กด "เพิ่มกลุ่มตัวเลือก"
5. สร้าง "เลือกท็อปปิ้ง" (ไม่บังคับ, min=0, max=null)
   - วิปครีม(+10), ถั่ว(+5), ซอสช็อก(+0), ผลไม้(+15)
6. บันทึก → กลับหน้า list
7. กลับไปหน้า "เมนูของหวาน" → กดแก้ไข "ไอศกรีมช็อกโกแลต"
8. Card "ตัวเลือกเสริม" → กด "เพิ่มตัวเลือกเสริม" → เลือก "เลือกท็อปปิ้ง"
9. บันทึก → เมนูนี้มีตัวเลือกเสริมแล้ว
```

### 8.8 Flow: แก้ไขเมนูเดิม

```
1. Admin เปิดหน้า "เมนูเครื่องดื่ม"
2. กดปุ่มแก้ไข "ชาเขียวเย็น"
3. → หน้า Update: โหลดข้อมูลเดิมมาแสดง
4. แก้ราคา: 55 → 60
5. เพิ่ม Option Group "ขนาดแก้ว"
6. กด "บันทึก" → กลับหน้า list
```

---

## 9. Permissions

### 9.1 Permission Constants

```
menu-category.read    — ดูหมวดหมู่
menu-category.create  — สร้างหมวดหมู่
menu-category.update  — แก้ไขหมวดหมู่
menu-category.delete  — ลบหมวดหมู่

menu-food.read        — ดูเมนูอาหาร
menu-food.create      — สร้างเมนูอาหาร
menu-food.update      — แก้ไขเมนูอาหาร
menu-food.delete      — ลบเมนูอาหาร

menu-beverage.read    — ดูเมนูเครื่องดื่ม
menu-beverage.create  — สร้างเมนูเครื่องดื่ม
menu-beverage.update  — แก้ไขเมนูเครื่องดื่ม
menu-beverage.delete  — ลบเมนูเครื่องดื่ม

menu-dessert.read     — ดูเมนูของหวาน
menu-dessert.create   — สร้างเมนูของหวาน
menu-dessert.update   — แก้ไขเมนูของหวาน
menu-dessert.delete   — ลบเมนูของหวาน

menu-option.read      — ดูตัวเลือกเสริม
menu-option.create    — สร้างตัวเลือกเสริม
menu-option.update    — แก้ไขตัวเลือกเสริม
menu-option.delete    — ลบตัวเลือกเสริม
```

### 9.2 Permission ที่ต้อง Seed ใน Migration

5 Modules: `menu-category` (4), `menu-food` (4), `menu-beverage` (4), `menu-dessert` (4), `menu-option` (4)

> **หมายเหตุ:** `menu-item.*` เดิมถูกแยกเป็น 3 modules (`menu-food`, `menu-beverage`, `menu-dessert`) ตาม Migration `SplitMenuPermissionsByCategory` เพื่อให้ควบคุมสิทธิ์แยกตามประเภทเมนูได้

**รวม:** 20 permissions

**หน้าจัดการตำแหน่ง (Position Manage):** ไม่ต้องแก้ UI — หน้านี้ดึง permissions จาก DB อัตโนมัติ เมื่อ seed permissions ใหม่ใน migration → หน้าจัดการตำแหน่งจะแสดง permissions ใหม่ให้ tick ได้เลย

### 9.3 Frontend Permission Guards

| Route | Permission |
|-------|-----------|
| /menu/categories | menu-category.read |
| /menu/categories/create | menu-category.create |
| /menu/categories/update/:id | menu-category.read (component check update) |
| /menu/food | menu-food.read |
| /menu/food/create | menu-food.create |
| /menu/food/update/:menuId | menu-food.read (component check update) |
| /menu/beverage | menu-beverage.read |
| /menu/beverage/create | menu-beverage.create |
| /menu/beverage/update/:menuId | menu-beverage.read (component check update) |
| /menu/dessert | menu-dessert.read |
| /menu/dessert/create | menu-dessert.create |
| /menu/dessert/update/:menuId | menu-dessert.read (component check update) |
| /menu/options | menu-option.read |
| /menu/options/create | menu-option.create |
| /menu/options/update/:id | menu-option.read (component check update) |

### 9.4 Component-level Permission Checks

**ทุกหน้า List:**
- `canCreate` → แสดง/ซ่อนปุ่มเพิ่มใน breadcrumb
- `canUpdate` → แสดง/ซ่อนปุ่มแก้ไขในตาราง
- `canDelete` → แสดง/ซ่อนปุ่มลบในตาราง

**ทุกหน้า Manage:**
- `canCreate` (create mode) / `canUpdate` (edit mode) → แสดง/ซ่อนปุ่มบันทึกใน breadcrumb

**Backend:**
- ทุก Controller endpoint ต้องมี `[PermissionAuthorize(Permissions.{Module}.{Action})]`

---

## 10. จุดเชื่อมต่อระบบอื่น

### 10.1 Shop Settings → ช่วงเวลาขาย

**ข้อมูลที่ใช้:**
- `HasTwoPeriods` (bool) → ตัดสินใจแสดง 1 หรือ 2 toggles
- `TbShopOperatingHour` → ดึง OpenTime1/CloseTime1, OpenTime2/CloseTime2 มาแสดงเป็น label

**API ที่ต้องเรียก:**
- Frontend Menu Manage ต้องเรียก API ดึง Shop Settings เพื่อรู้ว่ามีกี่ช่วง + เวลาแต่ละช่วง

### 10.2 Order System (อนาคต)

**ข้อมูลที่ Order ต้องใช้จาก Menu:**
- MenuId → อ้างอิงว่าสั่งเมนูอะไร
- Price → ราคาขาย ณ เวลาที่สั่ง (snapshot — ไม่เปลี่ยนแม้แก้ราคาเมนูภายหลัง)
- Selected OptionItems + AdditionalPrice → ตัวเลือกเสริมที่ลูกค้าเลือก (snapshot ราคา ณ เวลาสั่ง)
- CategoryType → เก็บเป็น field ใน TbOrderItem (1=Food, 2=Beverage, 3=Dessert) ใช้สำหรับแยก KDS + Dashboard เมนูขายดี — ดู [REQ-dashboard-system](REQ-dashboard-system.md) Section 5

**ตาราง Order (1 ตาราง — TbOrderItem):**
- ใช้ตารางเดียว `TbOrderItem` + field `CategoryType` แทนการแยก 3 ตาราง
- เหตุผล: query ง่ายกว่า (ไม่ต้อง UNION), รองรับ Dashboard เมนูขายดีแยก 3 หมวดได้ด้วย `GROUP BY CategoryType` — ดู [REQ-dashboard-system](REQ-dashboard-system.md) Section 5
- **รายละเอียดเต็ม:** ดู REQ-order-system.md Section 3

**โครงสร้าง Order Item:**
```
TbOrderItem:
- OrderItemId (PK)
- OrderId (FK → TbOrder)
- MenuId (FK → TbMenu)
- MenuNameThai (snapshot)
- MenuNameEnglish (snapshot)
- CategoryType (1=Food, 2=Beverage, 3=Dessert)
- UnitPrice (snapshot — ราคาขายต่อหน่วย ณ เวลาสั่ง)
- Quantity
- OptionsTotalPrice (รวมราคา options)
- TotalPrice (= (UnitPrice + OptionsTotalPrice) × Quantity)
- Status, Note, OrderedBy, etc.

TbOrderItemOption (ตัวเลือกเสริมที่ลูกค้าเลือก):
- OrderItemOptionId (PK)
- OrderItemId (FK → TbOrderItem)
- OptionGroupId (FK → TbOptionGroup)
- OptionGroupName (snapshot)
- OptionItemId (FK → TbOptionItem)
- OptionItemName (snapshot)
- AdditionalPrice (snapshot — ราคาเพิ่ม ณ เวลาสั่ง)
```

### 10.3 การชำระเงิน / ปิดบิล (อนาคต)

**การคำนวณราคารวมต่อ Order Item:**
```
ราคาต่อชิ้น = UnitPrice + sum(AdditionalPrice ของ selected options)
ราคารวม = ราคาต่อชิ้น × Quantity
```

**ตัวอย่าง:**
```
ข้าวผัดกุ้ง (120 บาท) × 2
  + เผ็ดมาก (+0)
  + ไข่ดาว (+10)
  + ชีส (+15)
= ราคาต่อชิ้น: 120 + 0 + 10 + 15 = 145
= ราคารวม: 145 × 2 = 290 บาท
```

**สรุปบิลทั้งโต๊ะ:**
```
รวมอาหาร     = sum(SubTotal ทุก item) + sum(AdditionalPrice ทุก option × quantity)
Service Charge = รวมอาหาร × อัตรา% (snapshot ตอนขอบิล — Cashier เลือกจาก Service Charge Master Data dropdown, เก็บใน TbOrderBill)
VAT           = (รวมอาหาร + Service Charge) × 7%
ยอดรวมสุทธิ   = รวมอาหาร + Service Charge + VAT
```

**ข้อมูล snapshot ที่เก็บใน Order (ป้องกันราคาเปลี่ยนภายหลัง):**
- ชื่อเมนู, ราคาขาย, ชื่อตัวเลือกเสริม, ราคาเพิ่ม → เก็บค่า ณ เวลาที่สั่ง
- ถ้าร้านแก้ราคาเมนู/ตัวเลือกเสริมภายหลัง → ออเดอร์เก่ายังคงราคาเดิม
- Report ดึงจาก snapshot ใน Order ไม่ใช่จาก Menu โดยตรง

### 10.4 Report System (อนาคต)

> **ดู [REQ-dashboard-system](REQ-dashboard-system.md) สำหรับ Phase 1 Dashboard** — ยอดขาย, เมนูขายดี, ช่วงเวลาขายดี, รายงานยอดขาย

**ข้อมูลที่ Report ต้องใช้:**
- Price + CostPrice → คำนวณ Gross Profit
- CategoryType + SubCategory → Group by สำหรับ breakdown
- Tags → Filter เฉพาะเมนูแนะนำ / ตามเทศกาล
- Period availability → วิเคราะห์ยอดขายตามช่วงเวลา

### 10.5 หน้าสั่งอาหาร / Customer Ordering (อนาคต)

**เงื่อนไขแสดงเมนูในหน้าสั่ง:**
1. `TbMenu.IsAvailable = true` — เมนูเปิดขาย
2. `TbMenuSubCategory.IsActive = true` — หมวดหมู่ย่อยเปิด
3. `IsAvailablePeriod1/2` — ตรงกับช่วงเวลาปัจจุบัน
4. `TbMenu.DeleteFlag = false` — ไม่ถูก soft delete

**การแสดงตัวเลือกเสริม:**
- ดึง Option Groups ที่ผูกกับเมนู (เฉพาะ IsActive = true)
- แสดง Option Items (เฉพาะ IsActive = true)
- Validate min/max selection ตาม Option Group config
- คำนวณราคารวม: ราคาเมนู + sum(AdditionalPrice ของ selected items)

---

## 11. Validation Rules & Error Scenarios

### 11.1 หมวดหมู่ย่อย

| Validation | Error Message | HTTP |
|-----------|---------------|------|
| ชื่อว่าง | "กรุณาระบุชื่อหมวดหมู่" | 400 |
| ลบหมวดหมู่ที่มีเมนู | "ไม่สามารถลบหมวดหมู่ที่ยังมีเมนูอยู่ ({count} รายการ)" | 422 |
| ไม่พบหมวดหมู่ | "ไม่พบหมวดหมู่ที่ระบุ" | 404 |

### 11.2 เมนู

| Validation | Error Message | HTTP |
|-----------|---------------|------|
| ชื่อไทย/อังกฤษว่าง | "กรุณาระบุชื่อเมนู (ไทย/อังกฤษ)" | 400 |
| ไม่เลือกหมวดหมู่ | "กรุณาเลือกหมวดหมู่" | 400 |
| หมวดหมู่ไม่ตรง categoryType | "หมวดหมู่ไม่ตรงกับประเภทเมนู" | 400 |
| ราคาขาย <= 0 | "ราคาขายต้องมากกว่า 0" | 400 |
| ราคาต้นทุน < 0 | "ราคาต้นทุนต้องไม่ติดลบ" | 400 |
| ไฟล์ > 10MB | "ไฟล์รูปภาพต้องไม่เกิน 10MB" | 400 |
| ไม่พบเมนู | "ไม่พบเมนูที่ระบุ" | 404 |

### 11.3 ตัวเลือกเสริม

| Validation | Error Message | HTTP |
|-----------|---------------|------|
| ชื่อกลุ่มว่าง | "กรุณาระบุชื่อกลุ่มตัวเลือก" | 400 |
| Required + MinSelect < 1 | "กลุ่มบังคับเลือกต้องตั้งขั้นต่ำอย่างน้อย 1" | 400 |
| MaxSelect < MinSelect | "จำนวนสูงสุดต้องไม่น้อยกว่าขั้นต่ำ" | 400 |
| ไม่มี Option Items | "ต้องมีตัวเลือกอย่างน้อย 1 รายการ" | 400 |
| ลบกลุ่มที่มีเมนูผูก | "ไม่สามารถลบกลุ่มที่ยังมีเมนูใช้งานอยู่ ({count} เมนู)" | 422 |
| AdditionalPrice < 0 | "ราคาเพิ่มต้องไม่ติดลบ" | 400 |

---

## 12. Migration Plan (ข้อมูลเดิม)

เมนูเดิมในระบบ (ถ้ามี) ต้อง migrate:
1. สร้าง default sub-categories: "ทั่วไป" สำหรับแต่ละ CategoryType
2. เมนูเดิมที่เป็น `Category = Food` → ย้ายไป SubCategory "ทั่วไป" ของ Food
3. เมนูเดิมที่เป็น `Category = Beverage` → ย้ายไป SubCategory "ทั่วไป" ของ Beverage
4. ลบ column `Category` (enum) และ `IsActive`
5. เพิ่ม columns ใหม่ทั้งหมด (default values)

---

## 13. สรุปไฟล์ที่ต้องสร้าง/แก้ไข

### Backend

| ไฟล์ | Action |
|------|--------|
| `POS.Main.Dal/Entities/Menu/TbMenu.cs` | แก้ไข (เพิ่ม/ลบ fields) |
| `POS.Main.Dal/Entities/Menu/TbMenuSubCategory.cs` | สร้างใหม่ |
| `POS.Main.Dal/Entities/Menu/TbOptionGroup.cs` | สร้างใหม่ |
| `POS.Main.Dal/Entities/Menu/TbOptionItem.cs` | สร้างใหม่ |
| `POS.Main.Dal/Entities/Menu/TbMenuOptionGroup.cs` | สร้างใหม่ |
| `POS.Main.Dal/EntityConfigurations/TbMenu*Configuration.cs` | สร้าง/แก้ไข |
| `POS.Main.Core/Enums/EMenuCategory.cs` | แก้ไข (เพิ่ม Dessert) |
| `POS.Main.Core/Enums/EMenuTag.cs` | สร้างใหม่ |
| `POS.Main.Core/Constants/Permissions.cs` | แก้ไข (เพิ่ม permissions) |
| `POS.Main.Repositories/Interfaces/` | สร้าง/แก้ไข repositories |
| `POS.Main.Repositories/Implementations/` | สร้าง/แก้ไข repositories |
| `POS.Main.Business.Menu/` | แก้ไขทั้ง module (Services, Models, Mappers) |
| `RBMS.POS.WebAPI/Controllers/` | สร้าง/แก้ไข controllers |
| Migrations | สร้าง migration ใหม่ |

### Frontend

| ไฟล์ | Action |
|------|--------|
| `features/menu/` | ลบทั้งหมดแล้วสร้างใหม่ |
| `shared/dropdowns/menu-category-dropdown/` | แก้ไข (เพิ่ม Dessert) |
| `shared/dropdowns/sub-category-dropdown/` | สร้างใหม่ |
| `shared/dropdowns/menu-period-dropdown/` | สร้างใหม่ |
| `shared/dropdowns/menu-sale-status-dropdown/` | สร้างใหม่ |
| `shared/components/side-bar/` | แก้ไข (sidebar items) |
| Generated API (core/api/) | Regenerate ด้วย gen-api |

---

*เอกสารนี้เป็น Draft — รอ review จากผู้ใช้ก่อนเริ่ม implementation*
