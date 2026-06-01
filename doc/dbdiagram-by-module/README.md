# ER Diagram แยกตามหมวด — สำหรับใช้ในรายงานปริญญานิพนธ์

> สร้างเมื่อ 2026-06-01
> สำหรับเอกสารฐานข้อมูลในบทที่ 3 การออกแบบระบบ

---

## วัตถุประสงค์

ไฟล์ `doc/dbdiagram-export.txt` ฉบับเต็มมี **37 ตาราง** เมื่อ render บน [dbdiagram.io](https://dbdiagram.io) จะได้รูปขนาดใหญ่มากที่ไม่สามารถใส่ในรายงานปริญญานิพนธ์ได้ (ตัวอักษรเล็กเกินกว่าจะอ่านได้)

โฟลเดอร์นี้แบ่ง ER Diagram ออกเป็น **9 รูปย่อย** ตามหมวดหมู่ระบบ เพื่อให้แต่ละรูปมีขนาดพอดีกับหน้ารายงาน (A4 แนวตั้ง/แนวนอน)

---

## 9 รูปที่แบ่งไว้

| ไฟล์ | ชื่อรูป | จำนวนตาราง | หมวดในระบบ |
| --- | --- | --- | --- |
| [01-authentication.dbml](01-authentication.dbml) | ระบบยืนยันตัวตน | 4 | Foundation |
| [02-authorization.dbml](02-authorization.dbml) | ระบบจัดการสิทธิ์ (RBAC) | 5 | Module 1 |
| [03-human-resource.dbml](03-human-resource.dbml) | ระบบทรัพยากรบุคคล | 4 (+3 ref) | Module 3 |
| [04-admin-settings.dbml](04-admin-settings.dbml) | ระบบตั้งค่าร้านค้า | 3 (+1 ref) | Module 2 |
| [05-menu.dbml](05-menu.dbml) | ระบบจัดการเมนู | 5 (+1 ref) | Module 4 |
| [06-table.dbml](06-table.dbml) | ระบบจัดการโต๊ะและการจอง | 5 | Module 5 |
| [07-order-bill.dbml](07-order-bill.dbml) | ระบบออเดอร์และบิล | 4 (+8 ref) | Module 6 |
| [08-payment.dbml](08-payment.dbml) | ระบบชำระเงินและแคชเชียร์ | 3 (+3 ref) | Module 7 |
| [09-notification-customer-file.dbml](09-notification-customer-file.dbml) | ระบบแจ้งเตือน + ลูกค้า + ไฟล์ | 4 (+4 ref) | Module 8 + Customer + File |

> **รวมตารางหลัก: 37 ตาราง** (ตรงกับ ER Diagram ต้นฉบับ)
>
> **ตาราง Reference (ref)** = ตารางที่อยู่ในรูปอื่น แต่ใส่ไว้แค่ PK เพื่อแสดง FK Relationship — ไม่นับซ้ำในจำนวนรวม

---

## หลักการแบ่ง

1. **แบ่งตาม 8 Business Modules ของระบบ** (ตาม `doc/modules/`)
2. **เพิ่ม Authentication เป็น Foundation** เพราะเป็น Module พื้นฐานของทุก Module
3. **รวม Customer + File ใน Diagram 9** เพราะมีตารางน้อย (1 ตารางต่อหมวด)
4. **ตัด Audit Fields ออก** (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deleteFlag`, `deletedAt`, `deletedBy`)
   - เหตุผล: ทุกตารางที่ inherit `BaseEntity` มีคอลัมน์เดียวกัน 7 คอลัมน์ — ถ้าใส่ทุก Diagram จะรกเกินไป
   - ในรายงานบทที่ 3 ให้อธิบาย `BaseEntity` ครั้งเดียว แล้วใส่หมายเหตุใต้รูปว่า "ตารางที่ inherit BaseEntity มีคอลัมน์ Audit เพิ่ม 7 คอลัมน์ (createdAt, createdBy, updatedAt, updatedBy, deleteFlag, deletedAt, deletedBy)"
5. **ใส่ตาราง Reference เป็น Stub** (เฉพาะ PK) สำหรับ FK ที่ข้ามหมวด — เพื่อให้เห็น Relationship แต่ไม่ทำให้ Diagram ใหญ่
   - ตาราง Reference จะมีสี **เทา (#94A3B8)** เพื่อแยกจากตารางหลัก
   - มี note ว่า "อ้างอิงจากรูปที่ X.Y"

---

## วิธีใช้กับ dbdiagram.io

### ขั้นตอน

1. เปิดเว็บ [https://dbdiagram.io/d](https://dbdiagram.io/d)
2. สำหรับแต่ละ Diagram (9 รูป):
   - คลิก **New Diagram** หรือ **+ New** เพื่อสร้างหน้าใหม่
   - เปิดไฟล์ `.dbml` (เช่น `01-authentication.dbml`)
   - คัดลอกเนื้อหาทั้งหมด → วางในช่อง Editor ฝั่งซ้าย
   - dbdiagram.io จะ render รูป ER อัตโนมัติทางขวา
3. **Export เป็นรูปภาพ**:
   - กด **Export → Export to PNG** (สำหรับรูปทั่วไป)
   - กด **Export → Export to PDF** (สำหรับใส่ในรายงาน — คมชัดกว่า)
4. ตั้งชื่อไฟล์เป็น `รูปที่ 3.X.1.png` ถึง `รูปที่ 3.X.9.png` (X = ลำดับหัวข้อในบทที่ 3)

### Tip การใช้ใน dbdiagram.io

- **จัด Layout ก่อน Export** — ลาก-วางตารางใน Canvas ให้สวยก่อนกด Export
- **ตั้งค่า Theme** — ใช้ Theme `Default` เพื่อให้สีตาราง (`headercolor`) ปรากฏชัด
- **Zoom 100%** — อย่า Zoom ออกก่อน Export มิเช่นนั้นรูปจะเบลอ

---

## วิธีอ้างอิงในรายงานบทที่ 3

### ตัวอย่างเนื้อหา

```markdown
### 3.X.1 ระบบยืนยันตัวตน (Authentication)

ระบบยืนยันตัวตนใช้สถาปัตยกรรม JWT (JSON Web Token) ร่วมกับ Refresh Token
ประกอบด้วยตาราง 4 ตาราง ดังแสดงในรูปที่ 3.X.1 ได้แก่ TB_USERS สำหรับเก็บบัญชีผู้ใช้
TB_REFRESH_TOKENS สำหรับเก็บ Refresh Token เพื่อต่ออายุ Access Token
TB_PASSWORD_HISTORIES สำหรับเก็บประวัติรหัสผ่านเพื่อป้องกันการใช้ซ้ำ
และ TB_PASSWORD_RESET_TOKENS สำหรับขั้นตอนรีเซ็ตรหัสผ่านด้วย OTP แบบ 2-Step Verification

[รูปที่ 3.X.1 ER Diagram ระบบยืนยันตัวตน]

หมายเหตุ: ตารางที่ inherit BaseEntity มีคอลัมน์ Audit Fields เพิ่ม 7 คอลัมน์
ได้แก่ createdAt, createdBy, updatedAt, updatedBy, deleteFlag, deletedAt, deletedBy
```

---

## ข้อมูลอ้างอิง

- ER Diagram ฉบับเต็ม: [`doc/dbdiagram-export.txt`](../dbdiagram-export.txt)
- รายละเอียดคอลัมน์เต็มทุกตาราง: [`doc/architecture/database-api-reference.md`](../architecture/database-api-reference.md)
- มาตรฐาน Diagram: [`memory/project-diagram-standards.md`](C:/Users/Phakim%20Sangunpat/.claude/projects/d--RBMS-POS/memory/project-diagram-standards.md)

---

## ตรวจสอบความครบถ้วน

ทั้ง 9 ไฟล์รวมตารางหลัก = **37 ตาราง** ตรงกับสเปคโปรเจค

| Diagram | ตารางหลัก |
| --- | --- |
| 01 Authentication | TB_USERS, TB_REFRESH_TOKENS, TB_PASSWORD_HISTORIES, TB_PASSWORD_RESET_TOKENS (4) |
| 02 Authorization | TBM_POSITIONS, TBM_MODULES, TBM_PERMISSIONS, TBM_AUTHORIZE_MATRICES, TB_AUTHORIZE_MATRIX_POSITIONS (5) |
| 03 Human Resource | TB_EMPLOYEES, TB_EMPLOYEE_ADDRESSES, TB_EMPLOYEE_EDUCATIONS, TB_EMPLOYEE_WORK_HISTORIES (4) |
| 04 Admin Settings | TB_SHOP_SETTINGS, TB_SHOP_OPERATING_HOURS, TB_SERVICE_CHARGES (3) |
| 05 Menu | TB_MENU_SUB_CATEGORIES, TB_MENUS, TB_OPTION_GROUPS, TB_OPTION_ITEMS, TB_MENU_OPTION_GROUPS (5) |
| 06 Table | TB_ZONES, TB_TABLES, TB_TABLE_LINKS, TB_FLOOR_OBJECTS, TB_RESERVATIONS (5) |
| 07 Order & Bill | TB_ORDERS, TB_ORDER_ITEMS, TB_ORDER_ITEM_OPTIONS, TB_ORDER_BILLS (4) |
| 08 Payment | TB_CASHIER_SESSIONS, TB_CASH_DRAWER_TRANSACTIONS, TB_PAYMENTS (3) |
| 09 Notification + Customer + File | TB_NOTIFICATIONS, TB_NOTIFICATION_READS, TB_CUSTOMER_SESSIONS, TB_FILES (4) |
| **รวม** | **37 ตาราง** |
