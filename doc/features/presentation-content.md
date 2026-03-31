# เนื้อหาสำหรับสไลด์นำเสนอโปรเจค RBMS-POS

> สร้างจากการวิเคราะห์โค้ดจริงและเอกสาร — ข้อมูลทุกจุดตรงกับสิ่งที่อยู่ในระบบ

---

## Background & Objectives

ธุรกิจร้านอาหารในปัจจุบันต้องเผชิญกับปัญหาด้านความรวดเร็ว ความแม่นยำ และการควบคุมยอดขาย ระบบแบบเดิมที่พึ่งพาแรงงานคนมักเกิดข้อผิดพลาดและไม่ทันต่อความต้องการของลูกค้า จึงได้พัฒนา **RBMS-POS** ขึ้นเพื่อจัดการทุกขั้นตอนตั้งแต่สั่งอาหาร ชำระเงิน ไปจนถึงสรุปยอดขาย รองรับ QR Code สั่งอาหาร, Real-time Notification และ Dashboard วิเคราะห์ข้อมูล

**วัตถุประสงค์**

1. **เพิ่มประสิทธิภาพในการบริหารจัดการร้านอาหาร** — ลดขั้นตอนซ้ำซ้อน จัดการออเดอร์ ชำระเงิน และโต๊ะอย่างเป็นระบบ
2. **ยกระดับประสบการณ์ของลูกค้า** — สั่งอาหารผ่าน QR Code, แจ้งเตือน Real-time, ติดตามสถานะอัตโนมัติ
3. **ติดตามและวิเคราะห์ข้อมูลยอดขาย** — Dashboard สรุปยอดขาย ออเดอร์ และข้อมูลสำคัญรายวัน

---

## Project Scope

| #   | ขอบเขต                                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **จัดการเมนูอาหารและเครื่องดื่ม** — เพิ่ม แก้ไข ลบ กำหนดหมวดหมู่ ราคา ภาพ สถานะเปิด-ปิดการขาย แสดงผลหน้าลูกค้าแบบ Real-time                               |
| 2   | **จัดการโต๊ะและผังพื้นที่นั่ง** — กำหนดหมายเลขโต๊ะ โซน จำนวนที่นั่ง สถานะ (Available / Occupied / Reserved) เชื่อมโยงกับคำสั่งซื้ออัตโนมัติ               |
| 3   | **แสดงและจัดการออเดอร์ Real-time** — รายการออเดอร์เข้าทันที จัดการสถานะ แก้ไข/ยกเลิกตามสิทธิ์พนักงาน                                                      |
| 4   | **รับออเดอร์หลายช่องทาง** — ทั้งจากพนักงานในร้านและลูกค้าสแกน QR Code ส่งต่อไปครัว/บาร์แยกหมวดหมู่อัตโนมัติ                                               |
| 5   | **Kitchen Display แยกครัว/บาร์** — แสดงออเดอร์แยกส่วน พนักงานจัดการเฉพาะงานตัวเอง ปรับสถานะ "กำลังทำ" → "เสร็จแล้ว"                                       |
| 6   | **ชำระเงิน** — รองรับเงินสดและสแกนจ่าย เชื่อมต่อรายการออเดอร์ของโต๊ะ ตรวจสอบก่อนชำระได้                                                                   |
| 7   | **Mobile Web สั่งอาหารผ่าน QR Code** — ลูกค้าสแกน → เลือกเมนู → ส่งออเดอร์ → ติดตามสถานะ Real-time ผูกโต๊ะอัตโนมัติ พร้อมปุ่มเรียกพนักงานและเรียกชำระเงิน |
| 8   | **บริหารจัดการพนักงาน** — เพิ่ม แก้ไข ลบ จัดกลุ่มตามหน้าที่ ตั้งค่าบัญชีผู้ใช้และรหัสผ่านสำหรับเข้าสู่ระบบ                                                |
| 9   | **ตั้งค่าระบบและสิทธิ์การเข้าถึง** — กำหนดค่าพื้นฐาน (VAT, Service Charge) และ Role-based Access Control แยกสิทธิ์ตามบทบาท                                |
| 10  | **Dashboard รายงานสรุปยอดขาย** — ยอดขายรายวัน/เดือน/ปี จำนวนลูกค้า เมนูขายดี สนับสนุนการวิเคราะห์และวางแผนธุรกิจ                                          |

---

## สรุป 160 ฟีเจอร์ทั้งระบบ

### Auth (11 ฟีเจอร์)

Login + ReCaptcha, Logout, Auto Refresh Token, ล็อคบัญชีอัตโนมัติ, Admin ล็อค/ปลดล็อค, ลืมรหัสผ่าน (Email → OTP), ยืนยัน OTP, ตั้งรหัสใหม่ (ห้ามซ้ำ 3 รหัสล่าสุด), เปลี่ยนรหัสผ่าน, ReCaptcha ป้องกัน Bot, ยืนยันรหัสสำหรับ action สำคัญ

### Profile (9 ฟีเจอร์)

ดูข้อมูลส่วนตัว, แก้ไขข้อมูล (ชื่อเล่น/Line/เบอร์โทร/ธนาคาร), อัพโหลดรูปโปรไฟล์, จัดการที่อยู่, จัดการประวัติการศึกษา, จัดการประวัติงาน, ตั้ง PIN 6 หลัก, เปลี่ยน PIN, รีเซ็ต PIN

### Dashboard (10 ฟีเจอร์)

KPI Cards 6 ใบ, กราฟแนวโน้มรายได้, เปรียบเทียบ 2 ช่วงเวลา, กราฟสัดส่วนครัว, กราฟชั่วโมงขายดี, Top 5 เมนูขายดี, รายงานยอดขายตามช่วงวันที่, เลือกวันที่กรอง, สลับช่วง 7/30 วัน, Mock Data Mode

### Order (18 ฟีเจอร์)

ผังโต๊ะ Real-time, รายการออเดอร์ (Filter+Pagination), รายละเอียดออเดอร์, สร้างออเดอร์, เพิ่มรายการอาหาร+ตัวเลือก, ส่งครัว Real-time, อัพเดตสถานะ (กำลังทำ/พร้อมเสิร์ฟ), เสิร์ฟ/เสิร์ฟทั้งหมด, Void รายการ, Cancel+เหตุผล, ขอบิล, ส่ง/ยกเลิกบิล, แยกบิลตามรายการ, แยกบิลตามจำนวนเงิน, ยกเลิกแยกบิล, รวมโต๊ะ, ย้ายโต๊ะ

### Menu (13 ฟีเจอร์)

ดูรายการเมนู (แยกประเภท), สร้าง/แก้ไข/ลบเมนู, อัพโหลดรูปเมนู, จัดการหมวดหมู่ย่อย, จัดเรียงหมวดหมู่ (Drag & Drop), จัดการกลุ่มตัวเลือก, จัดการรายการตัวเลือก, เชื่อมเมนูกับ Options, ค้นหาเมนู, กรองสถานะ, Permission แยกตามประเภท

### Table (13 ฟีเจอร์)

จัดการโซน CRUD, จัดการโต๊ะ CRUD, ออกแบบผังร้าน (Drag & Drop), วัตถุตกแต่ง, สถานะโต๊ะ+สี, เปิด/ปิดโต๊ะ, รวม/แยกโต๊ะ, QR Token, จัดเรียงโซน, จองโต๊ะ CRUD, Reservation Status Flow, ยกเลิก/NoShow, ปฏิทินการจอง

### Payment (12 ฟีเจอร์)

เปิด/ปิดรอบขาย, เงินเข้า/ออกลิ้นชัก, ชำระเงินสด (คำนวณทอน), ชำระ QR+อัพโหลดสลิป, Slip OCR ตรวจสอบอัตโนมัติ, ยืนยัน QR Payment, ประวัติชำระเงิน, ประวัติรอบขาย, รายละเอียดรอบขาย, ออกใบเสร็จ/ดาวน์โหลด

### Kitchen Display (9 ฟีเจอร์)

แสดงรายการรอทำ (แยกประเภท), 2 มุมมอง (Order/Menu View), เริ่มทำ, ทำเสร็จ, Real-time ออเดอร์ใหม่, Real-time สถานะเปลี่ยน, ข้อมูลโต๊ะ+โซน, KPI สรุป, Permission แยกตาม category

### Human Resource (10 ฟีเจอร์)

รายชื่อพนักงาน (Filter+Pagination), เพิ่ม/แก้ไข/ลบพนักงาน, สร้างบัญชีผู้ใช้ (Auto-generate), จัดการที่อยู่, ประวัติการศึกษา, ประวัติงาน, อัพโหลดรูปโปรไฟล์, ค้นหาพนักงาน

### Admin Setting (11 ฟีเจอร์)

รายชื่อผู้ใช้งาน, แก้ไขผู้ใช้ (Active/ล็อค), รีเซ็ต Failed Login, จัดการตำแหน่ง CRUD, Permission Matrix (Tree+Checkbox), Module Tree, ตั้งค่าร้านค้า, อัพโหลดโลโก้, อัพโหลด QR ชำระเงิน, ตั้งเวลาเปิด-ปิดร้าน, จัดการค่าบริการ

### Mobile Web (21 ฟีเจอร์)

สแกน QR → Session, ตั้งชื่อเล่น, ดูเมนูแยกหมวด, ค้นหาเมนู, รายละเอียดเมนู+ตัวเลือก, ตะกร้า (เพิ่ม/แก้ไข/ลบ), สั่งอาหาร, ติดตามสถานะ Real-time, เรียกพนักงาน (Cooldown 60s), ขอบิล, รอบิล (auto-navigate), สรุปบิล, ชำระเงินสด, ชำระ QR+อัพโหลดสลิป, หารบิลเท่า, หารบิลตามรายการ, รอตรวจสลิป, ดาวน์โหลดใบเสร็จ, หน้าร้านปิด, หน้า Token หมดอายุ

### Notification (10 ฟีเจอร์)

รับแจ้งเตือน Real-time, Toast notification, Notification Drawer, Badge ยังไม่อ่าน, อ่านแจ้งเตือน, กรอง 9 ประเภท, กลุ่ม Kitchen/Floor/Cashier/Manager

### Base Web (13 ฟีเจอร์)

Sidebar 8 เมนูหลัก+22 เมนูย่อย (แสดงตามสิทธิ์), Sidebar พับได้, Header (โลโก้+ชื่อร้านจาก API), Notification Badge, User Menu, Breadcrumb+Action Buttons, Global Loading, Auth Guard, Permission Guard, Guest Guard, Session Timeout Dialog, Access Denied Page, Lazy Loading

---

## สไลด์ 1: ภาพรวมโปรเจค

**RBMS-POS** — ระบบ Point of Sale สำหรับร้านอาหาร

- ระบบจัดการร้านอาหารแบบครบวงจร ครอบคลุมตั้งแต่การสั่งอาหาร การจัดการเมนู พนักงาน ไปจนถึงการชำระเงินและรายงาน
- มี 2 ฝั่งการใช้งาน:
  - **Client Web** — สำหรับ Admin/Staff จัดการร้าน (Desktop)
  - **Mobile Web** — สำหรับลูกค้าสั่งอาหารเอง (Mobile QR Code)
- ทำงานแบบ Real-time ผ่าน SignalR — ครัวเห็นออเดอร์ทันที แคชเชียร์เห็นการชำระเงินทันที

---

## สไลด์ 2: Technology Stack

| ส่วน                  | เทคโนโลยี                                                    |
| --------------------- | ------------------------------------------------------------ |
| **Backend API**       | ASP.NET Core 9.0 + Entity Framework Core                     |
| **Real-time**         | SignalR (WebSocket)                                          |
| **Frontend Client**   | Angular 19.1 + Tailwind CSS 3.4 + PrimeNG                    |
| **Frontend Mobile**   | Angular 19.1 (Mobile-optimized PWA)                          |
| **Database**          | SQL Server 2022                                              |
| **File Storage**      | MinIO (S3-compatible Object Storage)                         |
| **API Documentation** | Swagger/OpenAPI                                              |
| **Containerization**  | Docker + Docker Compose + Nginx (Reverse Proxy)              |
| **SSL**               | Certbot (Auto-renew ทุก 12 ชม.)                              |
| **Font**              | Sarabun (รองรับไทย+อังกฤษ)                                   |
| **API Client Gen**    | ng-openapi-gen (Auto-generate TypeScript client จาก Swagger) |

---

## Tech Stack ทั้งหมดที่ใช้ (ละเอียด)

### Backend — Framework & Library

| Library                   | Version  | ใช้ทำอะไร                                   |
| ------------------------- | -------- | ------------------------------------------- |
| .NET                      | 9.0      | Core runtime                                |
| ASP.NET Core              | 9.0      | Web API framework                           |
| Entity Framework Core     | 9.0.10   | ORM จัดการ Database (Code-First)            |
| EF Core SQL Server        | 9.0.10   | SQL Server provider                         |
| EF Core Design + Tools    | 9.0.10   | Migration CLI (`dotnet ef`)                 |
| JWT Bearer Authentication | 9.0.10   | JWT token validation                        |
| BCrypt.Net-Next           | 4.0.3    | Password hashing                            |
| Swashbuckle.AspNetCore    | 9.0.6    | Swagger/OpenAPI documentation               |
| Newtonsoft.Json (via MVC) | 9.0.10   | JSON serialization                          |
| AWSSDK.S3                 | 4.0.18.8 | S3 client (ใช้กับ MinIO)                    |
| MailKit                   | 4.15.1   | SMTP ส่ง Email (OTP, forgot password)       |
| SignalR                   | 9.0      | Real-time WebSocket (Kitchen, Notification) |
| HealthChecks.EF Core      | 9.0.10   | Database health check endpoint              |
| ResponseCompression       | 9.0      | Gzip + Brotli compression                   |
| HttpOverrides             | 9.0      | Nginx reverse proxy support                 |
| MemoryCache               | 9.0      | In-memory caching                           |

### Frontend Client — Framework & Library

| Library                | Version    | ใช้ทำอะไร                                             |
| ---------------------- | ---------- | ----------------------------------------------------- |
| Angular                | 19.2       | Core framework (Component, Router, Forms, Animations) |
| Angular CDK            | 19.2       | Component Dev Kit (overlay, scrolling)                |
| PrimeNG                | 19.1.4     | UI Components (Table, Dialog, Dropdown, Button)       |
| PrimeIcons             | 7.0        | Icon library (pi pi-\*)                               |
| Tailwind CSS           | 3.4        | Utility-first CSS framework                           |
| NgRx (Store + Effects) | 19.0       | State Management                                      |
| @microsoft/signalr     | 9.0.6      | SignalR client (real-time)                            |
| Chart.js + ng2-charts  | 4.5 / 10.0 | กราฟ Dashboard (Line, Bar, Donut)                     |
| Lottie (ngx-lottie)    | 21.2       | Animation สำหรับ Global Loading overlay               |
| pdfmake                | 0.3.7      | สร้าง PDF ใบเสร็จ                                     |
| qr-code-styling        | 1.9.2      | สร้าง QR Code (โต๊ะ, ชำระเงิน)                        |
| ng-recaptcha           | 13.2.1     | Google reCAPTCHA v3 (Login)                           |
| ng-openapi-gen         | 0.51.0     | Auto-generate API client จาก Swagger                  |
| RxJS                   | 7.8        | Reactive programming (Observable)                     |
| TypeScript             | 5.7        | Programming language                                  |
| @fontsource/sarabun    | 5.2.8      | Sarabun font (ไทย+อังกฤษ)                             |

### Frontend Mobile Web — Framework & Library

| Library             | Version | ใช้ทำอะไร                              |
| ------------------- | ------- | -------------------------------------- |
| Angular             | 19.2    | Core framework                         |
| PrimeNG             | 19.1    | UI Components                          |
| Tailwind CSS        | 3.4     | Utility CSS                            |
| @microsoft/signalr  | 9.0.6   | Real-time (order status, notification) |
| Lottie (ngx-lottie) | 21.2    | Loading animation                      |
| pdfmake             | 0.3.7   | PDF ใบเสร็จ                            |
| ng-openapi-gen      | 0.51.0  | API client generation                  |
| RxJS                | 7.8     | Reactive programming                   |
| TypeScript          | 5.7     | Programming language                   |

### Database & Infrastructure

| เครื่องมือ              | Version | ใช้ทำอะไร                                              |
| ----------------------- | ------- | ------------------------------------------------------ |
| SQL Server              | 2022    | Relational database หลัก                               |
| MinIO                   | latest  | S3-compatible file storage (รูปเมนู, รูปโปรไฟล์, สลิป) |
| Docker + Docker Compose | -       | Container orchestration                                |
| Nginx                   | latest  | Reverse proxy + SSL termination                        |
| Certbot                 | latest  | Auto SSL certificate (Let's Encrypt)                   |

---

## ภาพรวมการทำงานของระบบ

### แต่ละส่วนทำหน้าที่อะไร

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ผู้ใช้งาน (Users)                             │
│                                                                     │
│   👤 Admin/Staff                              📱 ลูกค้า              │
│   เปิดเว็บบนคอมพิวเตอร์                       สแกน QR Code ที่โต๊ะ   │
│   ┌─────────────┐                             ┌─────────────┐       │
│   │ Client Web  │                             │ Mobile Web  │       │
│   │ (Angular)   │                             │ (Angular)   │       │
│   │ Port 4300   │                             │ Port 4400   │       │
│   └──────┬──────┘                             └──────┬──────┘       │
│          │                                           │              │
│          │          HTTPS / WebSocket                │              │
│          └────────────────┬──────────────────────────┘              │
│                           │                                         │
│                    ┌──────▼──────┐                                  │
│                    │   Nginx     │ ← Certbot ต่อ SSL อัตโนมัติ      │
│                    │ Port 80/443 │                                  │
│                    └──────┬──────┘                                  │
│                           │ แยก route:                              │
│                           │  /         → Client Web                 │
│                           │  /mobile   → Mobile Web                 │
│                           │  /api      → Backend API                │
│                           │  /hub      → SignalR WebSocket          │
│                    ┌──────▼──────┐                                  │
│                    │ Backend API │                                  │
│                    │ .NET 9      │                                  │
│                    │ Port 5300   │                                  │
│                    └──┬──────┬──┘                                   │
│                       │      │                                      │
│              ┌────────▼┐  ┌──▼──────────┐                          │
│              │SQL Server│  │ MinIO (S3)  │                          │
│              │Port 1433 │  │ Port 9000   │                          │
│              │ข้อมูลทั้งหมด│ │ไฟล์ทั้งหมด   │                          │
│              └──────────┘  └─────────────┘                          │
│                                                                     │
│   ทุกอย่างรันใน Docker Container (docker compose up)                │
└─────────────────────────────────────────────────────────────────────┘
```

### หน้าที่ของแต่ละส่วน

| ส่วน            | หน้าที่                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| **Client Web**  | เว็บสำหรับ Admin/Staff — จัดการเมนู, ออเดอร์, ครัว, ชำระเงิน, พนักงาน, ตั้งค่าร้าน |
| **Mobile Web**  | เว็บสำหรับลูกค้า — สแกน QR สั่งอาหาร, ดูสถานะ, ชำระเงิน, ดาวน์โหลดใบเสร็จ          |
| **Nginx**       | ประตูหน้าบ้าน — รับ request จากทุกคน แล้วแยกส่งไปที่ถูกต้อง + จัดการ SSL           |
| **Certbot**     | ต่อใบรับรอง SSL (HTTPS) จาก Let's Encrypt อัตโนมัติทุก 12 ชม.                      |
| **Backend API** | สมองของระบบ — ประมวลผล business logic ทั้งหมด, จัดการสิทธิ์, ส่ง real-time         |
| **SQL Server**  | เก็บข้อมูลทั้งหมด — ออเดอร์, เมนู, พนักงาน, การชำระเงิน, สิทธิ์ (37 ตาราง)         |
| **MinIO (S3)**  | เก็บไฟล์ทั้งหมด — รูปเมนู, รูปโปรไฟล์, โลโก้ร้าน, QR ชำระเงิน, สลิปโอนเงิน         |
| **Docker**      | บรรจุทุกส่วนเป็น Container — สั่ง `docker compose up` ครั้งเดียวรันทั้งระบบ        |

### การทำงานร่วมกัน — ตัวอย่าง Flow จริง

**Flow 1: พนักงานสร้างเมนูใหม่**

```
Staff เปิด Client Web → Login
  → ไปหน้าเมนู → กดสร้าง → กรอกข้อมูล + เลือกรูป
  → กดบันทึก
     Client Web ส่ง POST /api/menu → Nginx → Backend API
        Backend บันทึกข้อมูลเมนูลง SQL Server
        Backend อัพโหลดรูปเมนูไป MinIO (S3)
     ← ตอบกลับ สำเร็จ
  → Client Web แสดงเมนูใหม่
```

**Flow 2: ลูกค้าสั่งอาหารผ่าน QR**

```
ลูกค้าสแกน QR ที่โต๊ะ → เปิด Mobile Web
  → ดูเมนู → เลือกอาหาร → ใส่ตะกร้า → กดสั่ง
     Mobile Web ส่ง POST /api/order → Nginx → Backend API
        Backend บันทึกออเดอร์ลง SQL Server
        Backend ส่ง SignalR (WebSocket) ไป Client Web ทันที
           → หน้าจอครัว (Kitchen Display) แสดงออเดอร์ใหม่
           → แคชเชียร์เห็นออเดอร์ใหม่
           → พนักงานเสิร์ฟได้รับแจ้งเตือน
     ← ตอบกลับ สำเร็จ
  → Mobile Web แสดง "สั่งอาหารแล้ว" + ติดตามสถานะ Real-time
```

**Flow 3: ชำระเงินด้วย QR + ตรวจสลิปอัตโนมัติ**

```
ลูกค้ากดขอบิล → เลือกชำระ QR
  → Mobile Web แสดง QR Code ร้าน + เลขบัญชี
  → ลูกค้าโอนเงิน → อัพโหลดสลิป
     Mobile Web ส่ง POST /api/payment + ไฟล์สลิป → Nginx → Backend API
        Backend เก็บสลิปใน MinIO (S3)
        Backend อ่าน QR ในสลิป + ตรวจจำนวนเงิน (Slip OCR)
        Backend บันทึกการชำระลง SQL Server
        Backend ส่ง SignalR → แคชเชียร์เห็นสลิปทันที
     ← ตอบกลับ รอตรวจสอบ
  → แคชเชียร์กดยืนยัน → Backend ส่ง SignalR → Mobile Web แสดง "ชำระสำเร็จ"
  → ลูกค้าดาวน์โหลดใบเสร็จ (PDF สร้างจาก pdfmake)
```

**Flow 4: ครัวทำอาหารเสร็จ → แจ้งเตือนทุกคน**

```
พ่อครัวเปิด Client Web → หน้า Kitchen Display
  → เห็นออเดอร์รอทำ (Real-time จาก SignalR)
  → กดเริ่มทำ → กดทำเสร็จ
     Client Web ส่ง PUT /api/order/status → Nginx → Backend API
        Backend อัพเดตสถานะลง SQL Server
        Backend ส่ง SignalR พร้อมกัน 3 ทาง:
           → พนักงานเสิร์ฟ: "อาหารพร้อมเสิร์ฟ โต๊ะ 5"
           → แคชเชียร์: อัพเดตสถานะออเดอร์
           → ลูกค้า (Mobile Web): "อาหารของคุณพร้อมเสิร์ฟแล้ว"
```

### สรุปความสัมพันธ์

```
Client Web ──── REST API ────┐
                              ├──→ Backend API ──→ SQL Server (ข้อมูล)
Mobile Web ──── REST API ────┘        │
                                       └──→ MinIO (ไฟล์)
Client Web ←─── SignalR ─────── Backend API
Mobile Web ←─── SignalR ─────── Backend API

Nginx = ประตูหน้า (รับทุก request แล้วแยกส่ง)
Certbot = ต่อ SSL ให้ Nginx อัตโนมัติ
Docker = บรรจุทุกอย่างเป็น Container
```

---

## สไลด์ 3: สถาปัตยกรรมระบบ (System Architecture)

```
                     ┌───────────────────────┐
                     │    Nginx (Port 80/443) │
                     │    Reverse Proxy + SSL │
                     └──────────┬────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
   ┌──────────▼──────┐  ┌──────▼───────┐  ┌──────▼───────┐
   │  Client Web     │  │  Mobile Web  │  │  Backend API │
   │  Angular 19     │  │  Angular 19  │  │  .NET 9      │
   │  Port 4300      │  │  Port 4400   │  │  Port 5300   │
   │  (Admin/Staff)  │  │  (ลูกค้า)    │  │  (REST+WS)   │
   └────────┬────────┘  └──────┬───────┘  └──┬───────┬───┘
            │                  │              │       │
            └──────────────────┴──────────────┘       │
                     HTTP/HTTPS + WebSocket           │
                                              ┌───────┴───────┐
                                              │               │
                                     ┌────────▼──┐    ┌───────▼──────┐
                                     │ SQL Server │    │ MinIO (S3)   │
                                     │ Port 1433  │    │ Port 9000    │
                                     │ 38 Tables  │    │ File Storage │
                                     └────────────┘    └──────────────┘
```

---

## สไลด์ 4: สถาปัตยกรรม Backend (N-Tier Architecture)

```
Layer 1: RBMS.POS.WebAPI
├── 24 Controllers (150+ Endpoints)
├── GlobalExceptionFilter (Error Handling อัตโนมัติ)
├── PermissionAuthorize (RBAC ทุก Endpoint)
├── SignalR Hubs (OrderHub + NotificationHub)
└── CustomOperationIdFilter (Auto API naming)

Layer 2: POS.Main.Business.* (8 Business Modules)
├── Admin (Auth, Users, ShopSettings, ServiceCharge, File, JWT, S3, Dashboard)
├── Authorization (Position, Permission Matrix)
├── Menu (Menu, SubCategory, OptionGroup)
├── HumanResource (Employee + Sub-entities)
├── Table (Table, Zone, Reservation, FloorObject)
├── Order (Order, Kitchen, OrderNotification)
├── Payment (Payment, CashierSession, SlipOCR, Customer, SelfOrder)
└── Notification (Real-time Notification)

Layer 3: POS.Main.Repositories
├── Generic Repository Pattern
├── Unit of Work Pattern
└── 15+ Repository Interfaces + Implementations

Layer 4: POS.Main.Dal
├── 38 Entities (ทุกตัว inherit BaseEntity)
├── 20+ EntityConfigurations (Fluent API)
├── POSMainContext (DbContext)
├── Global Query Filter (Soft Delete อัตโนมัติ)
└── 20+ Migrations

Layer 5: POS.Main.Core
├── Enums, Constants
├── Custom Exceptions (Validation, NotFound, Business, Forbidden)
├── BaseResponseModel, PaginationResult
└── Helpers
```

**กฎสำคัญ:**

- Controller บาง → ไม่มี business logic, ไม่มี try-catch
- Service throw exceptions → GlobalExceptionFilter แปลงเป็น HTTP status อัตโนมัติ
- ทุก Entity มี Soft Delete + Audit Trail อัตโนมัติ (CreatedAt/By, UpdatedAt/By, DeleteFlag)
- ห้ามใช้ AutoMapper → Manual Mapping เท่านั้น (ควบคุมได้ 100%)

---

## สไลด์ 5: ฐานข้อมูล (38 Entities)

### Auth & Users (5 ตาราง)

| Entity               | คำอธิบาย                                                  |
| -------------------- | --------------------------------------------------------- |
| TbUser               | บัญชีผู้ใช้ (Username, Email, PasswordHash, LockoutCount) |
| TbRefreshToken       | JWT Refresh Token                                         |
| TbPasswordResetToken | Token สำหรับรีเซ็ตรหัสผ่าน                                |
| TbPasswordHistory    | ประวัติรหัสผ่านที่เคยใช้                                  |
| TbLoginHistory       | ประวัติการเข้าสู่ระบบ                                     |

### Authorization / RBAC (5 ตาราง)

| Entity                    | คำอธิบาย                                    |
| ------------------------- | ------------------------------------------- |
| TbmPosition               | ตำแหน่งงาน (Master Data)                    |
| TbmPermission             | ประเภทสิทธิ์ (read, create, update, delete) |
| TbmModule                 | โมดูลระบบ (parent/child hierarchy)          |
| TbmAuthorizeMatrix        | จับคู่ Module + Permission                  |
| TbAuthorizeMatrixPosition | กำหนดสิทธิ์ต่อตำแหน่ง                       |

### Human Resource (4 ตาราง)

| Entity                | คำอธิบาย                                               |
| --------------------- | ------------------------------------------------------ |
| TbEmployee            | ข้อมูลพนักงาน (ชื่อ, เพศ, วันเกิด, ตำแหน่ง, เงินเดือน) |
| TbEmployeeAddress     | ที่อยู่พนักงาน (หลายที่อยู่ต่อคน)                      |
| TbEmployeeEducation   | ประวัติการศึกษา                                        |
| TbEmployeeWorkHistory | ประวัติการทำงาน                                        |

### Menu (5 ตาราง)

| Entity            | คำอธิบาย                                     |
| ----------------- | -------------------------------------------- |
| TbMenu            | รายการเมนู (ชื่อ, ราคา, ต้นทุน, รูปภาพ)      |
| TbMenuSubCategory | หมวดหมู่ย่อย (อาหาร/เครื่องดื่ม/ของหวาน)     |
| TbOptionGroup     | กลุ่มตัวเลือกเสริม (ระดับความเผ็ด, ท็อปปิ้ง) |
| TbOptionItem      | รายการตัวเลือก (เผ็ดน้อย, +ไข่ดาว)           |
| TbMenuOptionGroup | เชื่อม Menu กับ OptionGroup (M:M)            |

### Table & Zone (4 ตาราง)

| Entity        | คำอธิบาย                              |
| ------------- | ------------------------------------- |
| TbZone        | โซนพื้นที่ (ชั้น 1, ดาดฟ้า)           |
| TbTable       | โต๊ะ (ชื่อ, สถานะ, ตำแหน่ง, QR Token) |
| TbTableLink   | เชื่อมโต๊ะ (รวมโต๊ะ)                  |
| TbFloorObject | วัตถุตกแต่งบนผังร้าน                  |

### Reservation (1 ตาราง)

| Entity        | คำอธิบาย                                          |
| ------------- | ------------------------------------------------- |
| TbReservation | การจองโต๊ะ (ชื่อลูกค้า, เบอร์โทร, วันเวลา, สถานะ) |

### Order (4 ตาราง)

| Entity            | คำอธิบาย                                       |
| ----------------- | ---------------------------------------------- |
| TbOrder           | ออเดอร์ (เลขออเดอร์, สถานะ, จำนวนลูกค้า, โต๊ะ) |
| TbOrderItem       | รายการอาหาร (เมนู, จำนวน, ราคา, สถานะ)         |
| TbOrderItemOption | ตัวเลือกของรายการ (ท็อปปิ้ง, ระดับเผ็ด)        |
| TbOrderBill       | บิล (ยอดรวม, ค่าบริการ, ภาษี, สถานะ)           |

### Payment & Cashier (3 ตาราง)

| Entity                  | คำอธิบาย                                  |
| ----------------------- | ----------------------------------------- |
| TbPayment               | การชำระเงิน (วิธี, จำนวนเงิน, เลขใบเสร็จ) |
| TbCashierSession        | รอบขาย (เปิด/ปิดกะ, ยอดเปิด/ปิด)          |
| TbCashDrawerTransaction | เงินเข้า/ออกลิ้นชัก                       |

### Admin Settings (3 ตาราง)

| Entity              | คำอธิบาย                                 |
| ------------------- | ---------------------------------------- |
| TbShopSettings      | ข้อมูลร้าน (ชื่อ, โลโก้, QR Code, สถานะ) |
| TbShopOperatingHour | เวลาเปิด-ปิดร้าน (จันทร์-อาทิตย์)        |
| TbServiceCharge     | ค่าบริการ (เปอร์เซ็นต์, สถานะ)           |

### Notification (2 ตาราง)

| Entity             | คำอธิบาย                                      |
| ------------------ | --------------------------------------------- |
| TbNotification     | การแจ้งเตือน (ประเภท, กลุ่มเป้าหมาย, ข้อความ) |
| TbNotificationRead | สถานะอ่าน (ต่อผู้ใช้)                         |

### Other (2 ตาราง)

| Entity            | คำอธิบาย                           |
| ----------------- | ---------------------------------- |
| TbFile            | Metadata ไฟล์ (ชื่อ, ขนาด, S3 Key) |
| TbCustomerSession | Session ลูกค้า (สแกน QR)           |

---

## สไลด์ 6: ระบบ Authentication & Authorization

### Authentication Flow

```
1. ผู้ใช้กรอก Username + Password + Captcha
2. Backend ตรวจสอบ → ออก JWT Access Token (8 ชม.) + Refresh Token (7 วัน)
3. Frontend เก็บ Token → แนบ Authorization header ทุก request
4. Token หมดอายุ → Auto refresh ด้วย Refresh Token
5. Refresh Token หมดอายุ → กลับหน้า Login
```

**ฟีเจอร์ความปลอดภัย:**

- ReCaptcha ป้องกัน Bot
- Account Lockout หลังกรอกผิด 5 ครั้ง (ล็อค 15 นาที)
- Admin สามารถล็อค/ปลดล็อคบัญชีได้
- Password History — ป้องกันตั้งรหัสซ้ำเดิม
- OTP ผ่าน Email สำหรับลืมรหัสผ่าน
- PIN Code สำหรับยืนยันตัวตนด่วน (6 หลัก)

### Authorization (RBAC — Role-Based Access Control)

```
Position (ตำแหน่ง)
  └── Permission Matrix
       ├── Module: เมนูอาหาร
       │    ├── read    ✅
       │    ├── create  ✅
       │    ├── update  ✅
       │    └── delete  ❌
       ├── Module: ชำระเงิน
       │    ├── read    ✅
       │    └── create  ❌
       └── Module: ตั้งค่าระบบ
            └── (ไม่มีสิทธิ์ทั้งหมด) ❌
```

**การทำงาน:**

- สร้างตำแหน่ง (เช่น ผู้จัดการ, พนักงานเสิร์ฟ, แคชเชียร์, พ่อครัว)
- กำหนดสิทธิ์แต่ละ Module (อ่าน/สร้าง/แก้ไข/ลบ)
- เมื่อพนักงานล็อกอิน → ดึงสิทธิ์ตามตำแหน่ง
- Backend: ทุก API endpoint ตรวจสิทธิ์ด้วย `[PermissionAuthorize]`
- Frontend: Sidebar, ปุ่ม, หน้า ซ่อน/แสดงตามสิทธิ์

---

## สไลด์ 7: โมดูล — เข้าสู่ระบบ (Auth Module)

### หน้าที่มี:

1. **หน้า Login** — กรอก Username/Password + Captcha
2. **หน้า Reset Password** — ตั้งรหัสผ่านใหม่ (จาก link ใน email)

### Dialog:

1. **ลืมรหัสผ่าน** — กรอก email → ส่ง OTP ไป email
2. **ยืนยัน OTP** — กรอก OTP 6 หลัก → redirect ไปตั้งรหัสใหม่

### User Flow:

```
กรอก Username + Password + Captcha
  → ถูกต้อง → เข้าสู่ Dashboard
  → ผิด → แสดงข้อผิดพลาด (เหลือ X ครั้ง)
  → ผิด 5 ครั้ง → ล็อคบัญชี 15 นาที

ลืมรหัสผ่าน
  → กรอก Email → ได้รับ OTP 6 หลัก
  → กรอก OTP → ตั้งรหัสผ่านใหม่
```

---

## สไลด์ 8: โมดูล — โปรไฟล์ (Profile Module)

### หน้าที่มี:

1. **หน้าโปรไฟล์** — ดู/แก้ไขข้อมูลส่วนตัว

### ข้อมูลที่แสดง:

- **ข้อมูลบัญชี** (อ่านอย่างเดียว): Username
- **ข้อมูลส่วนตัว**: ชื่อ-นามสกุล(ไทย/อังกฤษ), เพศ, วันเกิด, อายุ(คำนวณอัตโนมัติ), สัญชาติ, ศาสนา, เลขบัตรประชาชน, ชื่อเล่น(แก้ได้), LineID(แก้ได้)
- **ข้อมูลการจ้างงาน** (อ่านอย่างเดียว): ตำแหน่ง, วันเริ่มงาน, เต็มเวลา/พาร์ทไทม์, เงินเดือน
- **ข้อมูลติดต่อ**: อีเมล(อ่านอย่างเดียว), เบอร์โทร(แก้ได้), ธนาคาร(แก้ได้), เลขบัญชี(แก้ได้)
- **ข้อมูลเพิ่มเติม**: ที่อยู่(เพิ่ม/แก้/ลบได้), ประวัติการศึกษา, ประวัติการทำงาน
- **รูปโปรไฟล์**: อัพโหลด/ลบได้

### Dialog:

1. **ตั้งค่า/เปลี่ยน PIN** — ตั้ง PIN 6 หลักสำหรับยืนยันตัวตนด่วน

### User Flow:

```
ดูข้อมูลส่วนตัว → แก้ไขข้อมูลที่แก้ได้ → บันทึก
เพิ่ม/แก้ไข ที่อยู่ → dialog → บันทึก
ตั้งค่า/เปลี่ยน PIN → กรอกรหัสผ่านยืนยัน → ตั้ง PIN ใหม่
```

---

## สไลด์ 9: โมดูล — แดชบอร์ด (Dashboard Module)

### หน้าที่มี:

1. **ภาพรวม** — KPI cards + กราฟ + รายการขายดี
2. **รายงานยอดขาย** — รายงานยอดขายตามวันที่

### KPI Cards (6 ใบ):

| #   | ชื่อ            | หน่วย | ตัวอย่าง |
| --- | --------------- | ----- | -------- |
| 1   | ยอดขาย          | บาท   | 45,230   |
| 2   | จำนวนออเดอร์    | บิล   | 127      |
| 3   | จำนวนลูกค้า     | คน    | 284      |
| 4   | เฉลี่ย/ออเดอร์  | บาท   | 356      |
| 5   | กำไรขั้นต้น     | บาท   | 18,092   |
| 6   | เปอร์เซ็นต์กำไร | %     | 40%      |

### กราฟ:

- **แนวโน้มรายได้** (Line Chart) — 7 วัน / 30 วัน
- **เปรียบเทียบช่วงเวลา** (Line Chart) — เปรียบเทียบ 2 ช่วง
- **สัดส่วนครัว** (Donut Chart) — อาหาร / เครื่องดื่ม / ของหวาน
- **ชั่วโมงขายดี** (Bar Chart) — ออเดอร์ตามชั่วโมง

### รายการขายดี:

- Top 5 อาหาร
- Top 5 เครื่องดื่ม
- Top 5 ของหวาน

---

## สไลด์ 10: โมดูล — ออเดอร์ (Order Module)

### หน้าที่มี:

1. **ภาพรวมร้าน** — แสดงผังโต๊ะ + สถานะโต๊ะ (ว่าง/ใช้งาน/ไม่พร้อม)
2. **รายการออเดอร์** — ตารางออเดอร์ทั้งหมด + filter
3. **รายละเอียดออเดอร์** — ดูรายละเอียด items + สถานะ + บิล
4. **สั่งอาหาร** — เพิ่มรายการเมนูเข้าออเดอร์

### Dialogs (8 ตัว):

1. **Table Action** — เลือก action สำหรับโต๊ะ (เปิดโต๊ะ, ย้าย, รวม)
2. **Add Item** — เพิ่มเมนูเข้าออเดอร์
3. **Item Detail** — แก้ไขรายละเอียด item
4. **Remove Item** — ยืนยันลบรายการ
5. **Modify Item** — แก้ไขตัวเลือกเสริม
6. **Bill Rounding** — ปัดเศษบิล
7. **Void Order** — ยกเลิกออเดอร์ทั้งหมด
8. **Split Bill** — แยกบิล

### WorkFlow — สั่งอาหาร (Staff):

```
1. เลือกโต๊ะจากผังร้าน (ภาพรวมร้าน)
2. เปิดโต๊ะ → สร้าง Order อัตโนมัติ
3. เพิ่มรายการอาหาร → เลือกเมนู + ตัวเลือก + จำนวน
4. ส่งครัว → สถานะเปลี่ยนเป็น "กำลังทำ"
5. ครัวทำเสร็จ → สถานะเปลี่ยนเป็น "พร้อมเสิร์ฟ"
6. เสิร์ฟ → สถานะเปลี่ยนเป็น "เสิร์ฟแล้ว"
```

### WorkFlow — จัดการออเดอร์:

```
Order Status Flow:
  Pending (รอ) → Cooking (กำลังทำ) → ReadyServe (พร้อมเสิร์ฟ)
    → Served (เสิร์ฟแล้ว) → Completed (เสร็จสิ้น)

Item Status Flow:
  Pending → Cooking → Ready → Served
  หรือ → Void (ยกเลิก) / Cancelled (ยกเลิก)
```

### API Endpoints (21 ตัว):

- สร้าง/ดู Order
- เพิ่ม/แก้/ลบ รายการ
- ส่งครัว (Send to Kitchen)
- เสิร์ฟรายการ (Serve)
- Void รายการ
- ร้องขอบิล (Request Bill)
- ส่งบิล / ยกเลิกบิล
- Split/Unsplit บิล

---

## สไลด์ 11: โมดูล — เมนู (Menu Module)

### หน้าที่มี:

1. **หมวดหมู่เมนู** — จัดการหมวดหมู่ย่อย (Sub-category) + ลากเรียงลำดับ (Drag & Drop)
2. **เมนูอาหาร** — รายการเมนูอาหาร (categoryType = 1)
3. **เมนูเครื่องดื่ม** — รายการเมนูเครื่องดื่ม (categoryType = 2)
4. **เมนูของหวาน** — รายการเมนูของหวาน (categoryType = 3)
5. **ตัวเลือกเสริม** — จัดการ Option Groups + Option Items
6. **หน้าเพิ่ม/แก้ไข** — ฟอร์มจัดการเมนูแต่ละรายการ

### Dialogs (2 ตัว):

1. **สร้างหมวดหมู่ย่อย** — เพิ่ม Sub-category ใหม่
2. **เลือก Option Group** — เลือกกลุ่มตัวเลือกสำหรับเมนู

### WorkFlow — จัดการเมนู:

```
1. สร้างหมวดหมู่ย่อย (เช่น "อาหารจานเดียว", "น้ำผลไม้")
2. สร้างตัวเลือกเสริม (เช่น "ระดับความเผ็ด" → เผ็ดน้อย/กลาง/มาก)
3. สร้างเมนู → เลือกหมวดหมู่ → กรอกชื่อ/ราคา/ต้นทุน → อัพโหลดรูป → เลือกตัวเลือกเสริม
4. จัดการสถานะ (เปิด/ปิดขาย)
```

### ฟีเจอร์เด่น:

- **แยกตามประเภท** — อาหาร / เครื่องดื่ม / ของหวาน (แต่ละประเภทมี Permission แยกกัน)
- **รูปภาพเมนู** — อัพโหลดไปเก็บใน S3/MinIO
- **ตัวเลือกเสริม** — Required (ต้องเลือก) / Optional + Single/Multiple choice + ราคาเพิ่ม
- **ลำดับการแสดง** — ลาก Drag & Drop จัดเรียงหมวดหมู่

---

## สไลด์ 12: โมดูล — โต๊ะ (Table Module)

### หน้าที่มี:

1. **ผังร้าน** (Floor Plan) — Designer ลาก/วางโต๊ะ + วัตถุตกแต่ง
2. **โซน / โต๊ะ** — จัดการโซนและโต๊ะ (Tab-based + Drag reorder)
3. **จองโต๊ะ** (Reservation) — ปฏิทินการจอง

### Dialogs (5 ตัว):

1. **Zone Dialog** — สร้าง/แก้ไขโซน
2. **Table Dialog** — สร้าง/แก้ไขโต๊ะ
3. **Floor Object Dialog** — แก้ไขวัตถุตกแต่ง (เสา, ต้นไม้)
4. **Reservation Dialog** — สร้าง/แก้ไขการจอง
5. **Available Table Dialog** — เลือกโต๊ะว่างสำหรับจอง

### WorkFlow — จัดการโต๊ะ:

```
1. สร้างโซน (เช่น "ชั้น 1", "ดาดฟ้า", "ห้อง VIP")
2. เพิ่มโต๊ะในโซน → ตั้งชื่อ, จำนวนที่นั่ง
3. จัดวางตำแหน่งในผังร้าน (Drag & Drop)
4. เพิ่มวัตถุตกแต่ง (เสา, ต้นไม้, ผนัง)
```

### WorkFlow — จองโต๊ะ:

```
Reservation Status Flow:
  Pending (รอยืนยัน) → Confirmed (ยืนยันแล้ว)
    → CheckedIn (เช็คอินแล้ว) → Completed (เสร็จ)
    หรือ → Cancelled (ยกเลิก) / NoShow (ไม่มา)
```

### ฟีเจอร์เด่น:

- **Floor Plan Designer** — ลากวาง Designer ออกแบบผังร้าน
- **สถานะโต๊ะ Real-time** — ว่าง (เขียว) / ใช้งาน (ส้ม) / ไม่พร้อม (เทา)
- **รวมโต๊ะ** (Table Linking) — รวมหลายโต๊ะเป็นกลุ่มเดียว (GroupCode)
- **QR Token** — แต่ละโต๊ะมี QR Code ให้ลูกค้าสแกนสั่งอาหาร
- **ปฏิทินการจอง** — แสดงการจองในรูปแบบ Calendar

---

## สไลด์ 13: โมดูล — ชำระเงิน (Payment Module)

### หน้าที่มี:

1. **รอบการขาย** — แสดง Session ปัจจุบัน + สรุปยอด
2. **ชำระบิลออเดอร์** — หน้าชำระเงินสำหรับแต่ละออเดอร์
3. **ประวัติรอบขาย** — ดูรอบขายที่ผ่านมาทั้งหมด
4. **รายละเอียดรอบขาย** — ดูรายละเอียดของแต่ละรอบ
5. **ประวัติชำระเงิน** — ดูรายการชำระเงินทั้งหมด

### Dialogs (5 ตัว):

1. **Payment Method** — เลือกวิธีชำระเงิน
2. **Discount** — ใส่ส่วนลด
3. **Surcharge** — เพิ่มค่าธรรมเนียม
4. **Split Bill** — แยกบิล
5. **Receipt** — แสดง/พิมพ์ใบเสร็จ

### WorkFlow — ชำระเงิน:

```
1. เปิดรอบขาย (Open Session) → กรอกยอดเงินเปิดลิ้นชัก
2. รับชำระเงิน → เลือกวิธี: เงินสด / โอน QR
   - เงินสด → รับเงิน → ทอนเงิน → ออกใบเสร็จ
   - โอน QR → ลูกค้าอัพโหลด Slip → ตรวจสอบ (OCR) → ยืนยัน
3. ปิดรอบขาย (Close Session) → สรุปยอด + ตรวจนับเงิน
```

### WorkFlow — Cashier Session:

```
Session Status Flow:
  เปิดรอบ (Open)
    → รับชำระเงินตลอดวัน
    → เงินเข้า/ออกลิ้นชัก (Cash In/Out)
    → ปิดรอบ (Close) → สรุปยอด
```

### ฟีเจอร์เด่น:

- **Slip OCR** — ตรวจสอบสลิปโอนเงินอัตโนมัติ (อ่าน QR + จำนวนเงิน)
- **Split Bill** — แยกบิลตามรายการ / หารเท่า
- **Cash Drawer** — บันทึกเงินเข้า-ออกลิ้นชัก
- **ใบเสร็จ** — ออกใบเสร็จ + ดาวน์โหลด

---

## สไลด์ 14: โมดูล — ครัว (Kitchen Display Module)

### หน้าที่มี:

1. **ครัวอาหาร** — แสดงออเดอร์อาหารที่รอทำ (categoryType = 1)
2. **บาร์เครื่องดื่ม** — แสดงออเดอร์เครื่องดื่มที่รอทำ (categoryType = 2)
3. **ครัวขนมหวาน** — แสดงออเดอร์ของหวานที่รอทำ (categoryType = 3)

### ฟีเจอร์:

- **Real-time ผ่าน SignalR** — ออเดอร์ใหม่ปรากฏทันทีไม่ต้อง refresh
- **แยกตามประเภทอาหาร** — พ่อครัวเห็นแค่ส่วนที่รับผิดชอบ
- **อัพเดตสถานะ** — ลาก Drag & Drop เปลี่ยนสถานะ (กำลังทำ → เสร็จ)
- **แสดงข้อมูลโต๊ะ** — รู้ว่าเป็นโต๊ะไหน ออเดอร์อะไร

### WorkFlow — ครัว:

```
1. ออเดอร์ใหม่เข้ามา (Real-time จาก SignalR)
2. พ่อครัวเห็นรายการ → เริ่มทำ (สถานะ: Cooking)
3. ทำเสร็จ → เปลี่ยนสถานะ (สถานะ: Ready)
4. พนักงานเสิร์ฟมารับ → เสิร์ฟ (สถานะ: Served)
```

---

## สไลด์ 15: โมดูล — ทรัพยากรบุคคล (Human Resource Module)

### หน้าที่มี:

1. **รายชื่อพนักงาน** — ตารางพนักงานทั้งหมด + ค้นหา/กรอง
2. **เพิ่มพนักงาน** — ฟอร์มเพิ่มพนักงานใหม่
3. **แก้ไขพนักงาน** — ฟอร์มแก้ไขข้อมูลพนักงาน

### Dialogs (2 ตัว):

1. **สร้างบัญชีผู้ใช้** — สร้าง Username/Password สำหรับพนักงาน
2. **ข้อมูลบัญชี** — แสดง/รีเซ็ตรหัสผ่าน

### ข้อมูลพนักงาน:

- **ข้อมูลส่วนตัว**: ชื่อ-นามสกุล(ไทย/อังกฤษ), เพศ, วันเกิด, สัญชาติ, ศาสนา, เลขบัตรฯ, รูปโปรไฟล์
- **ข้อมูลการจ้างงาน**: ตำแหน่ง, วันเริ่มงาน, เต็มเวลา/พาร์ทไทม์, เงินเดือน, ค่าจ้างรายชั่วโมง
- **ข้อมูลติดต่อ**: อีเมล, เบอร์โทร, Line ID, ธนาคาร, เลขบัญชี
- **ข้อมูลเพิ่มเติม**: ที่อยู่(หลายรายการ), ประวัติการศึกษา, ประวัติการทำงาน

### WorkFlow — จัดการพนักงาน:

```
1. เพิ่มพนักงาน → กรอกข้อมูลส่วนตัว + การจ้างงาน + ติดต่อ
2. เพิ่มข้อมูลเพิ่มเติม → ที่อยู่, การศึกษา, ประวัติงาน
3. สร้างบัญชีผู้ใช้ → ตั้ง Username/Password
4. กำหนดตำแหน่ง → ได้รับสิทธิ์ตาม Permission Matrix
```

---

## สไลด์ 16: โมดูล — ตั้งค่าระบบ (Admin Setting Module)

### หน้าที่มี:

1. **รายชื่อผู้ใช้งาน** — ตารางผู้ใช้ทั้งหมด + จัดการสถานะ
2. **แก้ไขผู้ใช้งาน** — แก้ไขข้อมูลผู้ใช้ + รีเซ็ต Failed Login
3. **จัดการตำแหน่ง** — รายการตำแหน่ง + Permission Matrix
4. **เพิ่ม/แก้ไขตำแหน่ง** — กำหนดชื่อตำแหน่ง + เลือกสิทธิ์แต่ละ Module
5. **ตั้งค่าร้านค้า** — ข้อมูลร้าน + โลโก้ + QR Code + เวลาเปิด-ปิด
6. **ค่าบริการ** — จัดการ Service Charge (เปอร์เซ็นต์ + สถานะ)

### Dialog (1 ตัว):

1. **Service Charge Dialog** — สร้าง/แก้ไขค่าบริการ

### ฟีเจอร์เด่น:

- **Permission Matrix** — UI แบบ Tree + Checkbox กำหนดสิทธิ์ต่อ Module
- **Module Tree** — แสดง Module แบบ Parent/Child (เช่น เมนู → เมนูอาหาร, เมนูเครื่องดื่ม)
- **ตั้งค่าร้าน** — อัพโหลดโลโก้/QR Code + ตั้งเวลาเปิด-ปิด 7 วัน
- **จัดการผู้ใช้** — ล็อค/ปลดล็อค + รีเซ็ต Failed Login Count

---

## สไลด์ 17: Base Web — โครงสร้าง Layout (Client Web)

### โครงสร้างหน้าจอ:

```
┌─────────┬──────────────────────────────────────────┐
│         │              Header                       │
│         │  [Toggle] Logo ShopName    [Bell] [User]  │
│         ├──────────────────────────────────────────┤
│ Sidebar │           Breadcrumb                      │
│         │  แดชบอร์ด > ภาพรวม        [ย้อนกลับ][บันทึก]│
│ Menu    ├──────────────────────────────────────────┤
│ Items   │                                          │
│         │           Page Content                    │
│ (พับได้) │           (router-outlet)                 │
│         │                                          │
│         │                                          │
│         │                                          │
└─────────┴──────────────────────────────────────────┘
```

### Sidebar (8 เมนูหลัก, 22 เมนูย่อย):

| #   | เมนูหลัก      | เมนูย่อย                                             |
| --- | ------------- | ---------------------------------------------------- |
| 1   | แดชบอร์ด      | ภาพรวม, รายงานยอดขาย                                 |
| 2   | ออเดอร์       | ภาพรวมร้าน, รายการออเดอร์                            |
| 3   | เมนู          | หมวดหมู่, อาหาร, เครื่องดื่ม, ของหวาน, ตัวเลือกเสริม |
| 4   | โต๊ะ          | ผังร้าน, โซน/โต๊ะ, จองโต๊ะ                           |
| 5   | ชำระเงิน      | รอบการขาย, ประวัติรอบขาย                             |
| 6   | ครัว          | ครัวอาหาร, บาร์เครื่องดื่ม, ครัวขนมหวาน              |
| 7   | ทรัพยากรบุคคล | รายชื่อพนักงาน                                       |
| 8   | ตั้งค่าระบบ   | ผู้ใช้งาน, ตำแหน่ง, ตั้งค่าร้าน, ค่าบริการ           |

### ฟีเจอร์ Layout:

- **Sidebar พับได้** — Full (256px) / Collapsed (80px) + Tooltip เมื่อพับ
- **Permission-based Menu** — แสดงเฉพาะเมนูที่มีสิทธิ์
- **Breadcrumb + Action Buttons** — ปุ่ม "ย้อนกลับ" + "บันทึก" อยู่ใน Breadcrumb
- **Notification** — กระดิ่งแจ้งเตือน + Badge จำนวน + Notification Drawer
- **Toast** — ข้อความแจ้งเตือนมุมบนขวา (Real-time จาก SignalR)
- **User Menu** — ดูโปรไฟล์ + เปลี่ยนรหัสผ่าน + ออกจากระบบ
- **Global Loading** — Overlay animation อัตโนมัติทุก HTTP request

---

## สไลด์ 18: โมดูล — Mobile Web (ลูกค้าสั่งอาหารเอง)

### หน้าที่มี:

1. **หน้า Auth** — สแกน QR Code → ได้ Session
2. **เรียกดูเมนู** — เลือกหมวดหมู่ → ดูเมนู → เลือกตัวเลือก
3. **รายละเอียดเมนู** — ดูรูป + เลือก option + จำนวน + หมายเหตุ
4. **ตะกร้า** — ดูรายการ + แก้จำนวน/หมายเหตุ + สั่งอาหาร
5. **ติดตามออเดอร์** — ดูสถานะอาหาร Real-time
6. **รอบิล** — รอพนักงานจัดเตรียมบิล
7. **สรุปบิล** — ดูรายละเอียด + เลือกวิธีชำระ
8. **อัพโหลด Slip** — อัพโหลดหลักฐานโอนเงิน
9. **ชำระสำเร็จ** — แสดงใบเสร็จ + ดาวน์โหลด
10. **ร้านปิด** — แจ้งว่าร้านปิดให้บริการ
11. **หมดเวลา** — Session หมดอายุ

### โครงสร้างหน้าจอ Mobile:

```
┌─────────────────────────────┐
│     Header (Sticky)          │ ← สีส้ม gradient
│ Logo ชื่อร้าน                 │
│ โซนชั้น 1 - โต๊ะ5             │
│ สั่งโดยคุณ: ปลา    [บิล][พนักงาน]│
├─────────────────────────────┤
│                             │
│     Page Content            │
│     (เลื่อนได้)              │
│                             │
├─────────────────────────────┤
│   Footer (ข้อมูลร้าน)        │ ← ที่อยู่, เบอร์, เว็บ
├─────────────────────────────┤
│  [เมนู]  [ตะกร้า(3)]  [ออเดอร์]│ ← Bottom Nav (Fixed)
└─────────────────────────────┘
```

---

## สไลด์ 19: User Flow — ลูกค้าสั่งอาหาร (Mobile Web)

```
  ┌────────────────────┐
  │   สแกน QR Code      │ ← QR อยู่บนโต๊ะ
  │   ที่โต๊ะ            │
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   ตั้งชื่อเล่น       │ ← ป๊อปอัพถามชื่อ (ครั้งแรก)
  │   (เช่น "ปลา")      │
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   เรียกดูเมนู       │ ← เลือกหมวดหมู่
  │   อาหาร/เครื่องดื่ม/ของหวาน│    ค้นหาเมนู
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   เลือกเมนู         │ ← ดูรูป, ราคา
  │   + ตัวเลือกเสริม    │    เลือก option (เผ็ดมาก, +ไข่ดาว)
  │   + จำนวน + หมายเหตุ │    กำหนดจำนวน, ใส่ note
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   ใส่ตะกร้า         │ ← ดู/แก้ไข/ลบรายการ
  │   (สั่งเพิ่มได้)     │    เห็นราคารวม
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   สั่งอาหาร!        │ ← กดยืนยัน → ส่งครัวทันที
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   ติดตามสถานะ       │ ← Real-time อัพเดต
  │   รอทำ → กำลังทำ    │    ผ่าน SignalR
  │   → เสร็จ → เสิร์ฟ  │
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   ขอบิล            │ ← กดปุ่ม "ขอบิล" ที่ Header
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   เลือกวิธีชำระ     │
  │   ├ เงินสด          │ → รอแคชเชียร์
  │   ├ โอน QR          │ → แสดง QR + อัพโหลด Slip
  │   └ หารบิล          │ → หารเท่า / แยกตามรายการ
  └─────────┬──────────┘
            ▼
  ┌────────────────────┐
  │   ชำระสำเร็จ!       │ ← แสดงใบเสร็จ
  │   ดาวน์โหลดใบเสร็จ  │    ดาวน์โหลดได้
  └────────────────────┘
```

---

## สไลด์ 20: ระบบ Real-time (SignalR)

### สถาปัตยกรรม:

```
Backend (SignalR Hub)
  ├── OrderHub (/hubs/order)
  │    └── Broadcast: สถานะออเดอร์, รายการใหม่, ยกเลิก
  └── NotificationHub (/hubs/notification)
       └── Broadcast: แจ้งเตือนตามสิทธิ์

Frontend (SignalR Client)
  ├── Client Web → รับแจ้งเตือน + อัพเดตหน้าจอ
  └── Mobile Web → อัพเดตสถานะออเดอร์ + บิล
```

### กลุ่มการรับแจ้งเตือน (Groups):

| กลุ่ม       | ใครได้รับ            | ตัวอย่างแจ้งเตือน             |
| ----------- | -------------------- | ----------------------------- |
| Kitchen     | พ่อครัว/บาร์เทนเดอร์ | ออเดอร์ใหม่เข้ามา             |
| Floor       | พนักงานเสิร์ฟ        | อาหารพร้อมเสิร์ฟ, ลูกค้าเรียก |
| Cashier     | แคชเชียร์            | ขอบิล, อัพโหลด Slip           |
| Manager     | ผู้จัดการ            | ทุกแจ้งเตือน                  |
| table\_{id} | ลูกค้าที่โต๊ะนั้น    | สถานะอาหาร, บิลพร้อม          |

### ประเภทแจ้งเตือน (9 ประเภท):

| Event                | คำอธิบาย            |
| -------------------- | ------------------- |
| NEW_ORDER            | มีออเดอร์ใหม่เข้ามา |
| ORDER_READY          | อาหารพร้อมเสิร์ฟ    |
| CALL_WAITER          | ลูกค้าเรียกพนักงาน  |
| REQUEST_BILL         | ลูกค้าขอบิล         |
| REQUEST_SPLIT_BILL   | ลูกค้าขอแยกบิล      |
| ORDER_CANCELLED      | ออเดอร์ถูกยกเลิก    |
| SLIP_UPLOADED        | ลูกค้าอัพโหลด Slip  |
| PAYMENT_COMPLETED    | ชำระเงินสำเร็จ      |
| RESERVATION_REMINDER | เตือนการจอง         |

---

## สไลด์ 21: ระบบจัดการไฟล์ (File Management)

### สถาปัตยกรรม:

```
┌──────────────┐     Upload      ┌──────────────┐
│   Frontend   │ ──────────────→ │   Backend    │
│   (Angular)  │                 │   (.NET 9)   │
└──────────────┘                 └──────┬───────┘
                                        │
                            ┌───────────┼──────────┐
                            │           │          │
                   ┌────────▼──┐  ┌─────▼────┐    │
                   │ TbFile    │  │ MinIO    │    │
                   │ (Metadata)│  │ (S3)     │    │
                   │ SQL Server│  │ ไฟล์จริง  │    │
                   └───────────┘  └──────────┘    │
                                                  │
                   ┌──────────────────────────────┘
                   │ Download
                   ▼
              ┌──────────────┐
              │   Frontend   │ ← แสดงรูป/ดาวน์โหลด
              └──────────────┘
```

### ที่ใช้:

- รูปเมนูอาหาร (TbMenu.ImageFileId)
- รูปโปรไฟล์พนักงาน (TbEmployee.ImageFileId)
- โลโก้ร้าน (TbShopSettings.LogoFileId)
- QR Code ชำระเงิน (TbShopSettings.PaymentQrCodeFileId)
- Slip การโอนเงิน

---

## สไลด์ 22: ระบบ Error Handling

### Backend — GlobalExceptionFilter:

| Exception                   | HTTP Status       | ตัวอย่าง                       |
| --------------------------- | ----------------- | ------------------------------ |
| ValidationException         | 400 Bad Request   | "กรุณาระบุชื่อเมนู"            |
| EntityNotFoundException     | 404 Not Found     | "ไม่พบเมนู ID: 5"              |
| BusinessException           | 422 Unprocessable | "เมนูนี้ถูกปิดขายแล้ว"         |
| ForbiddenException          | 403 Forbidden     | "ไม่มีสิทธิ์เข้าถึง"           |
| InvalidCredentialsException | 401 Unauthorized  | "รหัสผ่านไม่ถูกต้อง"           |
| AccountLockedException      | 423 Locked        | "บัญชีถูกล็อค" (+ เวลาปลดล็อค) |
| Unhandled Exception         | 500 Internal      | Log error + return message     |

### Frontend — Feedback System:

- **Success Modal** — แสดงเมื่อบันทึกสำเร็จ (ปิดอัตโนมัติ 2 วิ)
- **Error Modal** — แสดงเมื่อเกิดข้อผิดพลาด (ต้องกดปิด)
- **Confirm Modal** — ถามยืนยันก่อนลบ/ยกเลิก
- **Toast** — แจ้งเตือน Real-time มุมบนขวา
- **Global Loading** — Overlay animation ทุก HTTP request (ไม่ต้องเขียน loading state เอง)

---

## สไลด์ 23: ระบบ Auto-Cleanup

### Background Service ทำงานอัตโนมัติ:

| งาน                          | ความถี่      | รายละเอียด                  |
| ---------------------------- | ------------ | --------------------------- |
| ลบ Expired Refresh Tokens    | ทุก 6 ชม.    | ลบ token ที่หมดอายุแล้ว     |
| ลบ Expired Customer Sessions | ทุก 6 ชม.    | ลบ session ลูกค้าที่หมดอายุ |
| ลบ Notifications เก่า        | ทุกวัน 03:00 | ลบแจ้งเตือนเก่ากว่า 7 วัน   |

---

## สไลด์ 24: ตัวเลขสำคัญ (Key Metrics)

| เมตริก                           | ตัวเลข                   |
| -------------------------------- | ------------------------ |
| **Database Tables**              | 38 ตาราง                 |
| **API Controllers**              | 24 ตัว                   |
| **API Endpoints**                | 150+ endpoints           |
| **Business Modules (Backend)**   | 8 modules                |
| **Feature Modules (Client Web)** | 11 modules               |
| **Pages (Client Web)**           | 32+ หน้า                 |
| **Dialogs (Client Web)**         | 26+ dialogs              |
| **Pages (Mobile Web)**           | 11 หน้า                  |
| **Shared Dropdowns**             | 22+ ตัว                  |
| **Shared Components**            | 20+ ตัว                  |
| **Shared Modals/Dialogs**        | 10+ ตัว                  |
| **SignalR Hubs**                 | 2 (Order + Notification) |
| **Notification Types**           | 9 ประเภท                 |
| **Permission Modules**           | 16+ modules              |
| **Database Migrations**          | 20+ migrations           |

---

## สไลด์ 25: Deployment Architecture (Docker)

```
Docker Compose
├── sqlserver (SQL Server 2022)
│   └── Port 1433
├── minio (MinIO S3)
│   ├── Port 9000 (API)
│   └── Port 9001 (Console)
├── minio-init (สร้าง Bucket อัตโนมัติ)
├── backend (.NET 9 API)
│   └── Port 5300
├── frontend-client (Angular 19 Admin)
│   └── Static files → Nginx
├── frontend-mobile (Angular 19 Customer)
│   └── Static files → Nginx
├── nginx (Reverse Proxy)
│   ├── Port 80 (HTTP → redirect HTTPS)
│   └── Port 443 (HTTPS + SSL)
└── certbot (Auto-renew SSL ทุก 12 ชม.)
```

---

## สไลด์ 26: Design System

### สี (Color Tokens):

| Token           | สี               | ใช้สำหรับ                |
| --------------- | ---------------- | ------------------------ |
| primary         | Orange (#f97316) | ปุ่มหลัก, Header, Accent |
| success         | Teal (#14b8a6)   | สถานะสำเร็จ, Active      |
| danger          | Rose (#f43f5e)   | สถานะผิดพลาด, ลบ         |
| warning         | Amber (#f59e0b)  | สถานะเตือน               |
| info            | Sky (#0ea5e9)    | ข้อมูล                   |
| surface         | Slate (#f8fafc)  | พื้นหลังหน้า             |
| surface-dark    | Slate (#334155)  | ตัวอักษรหลัก             |
| surface-sidebar | Slate (#1e293b)  | พื้นหลัง Sidebar         |

### Typography:

- Font: **Sarabun** (รองรับไทย + อังกฤษ)
- Page Title: 1.75rem / Bold (700)
- Section Title: 1.125rem / Semi-Bold (600)
- Card Title: 1rem / Semi-Bold (600)
- Body: 1rem / Regular (400)

### Icon System:

- **Custom SVG Icons** — ใช้ `<app-generic-icon>` (70+ icons)
- **PrimeIcons** — ใช้ `pi pi-*` สำหรับ icon ทั่วไป
- ทุก icon ใช้ `currentColor` เปลี่ยนสีตาม Tailwind class

---

## สไลด์ 27: WorkFlow รวม — ร้านอาหาร 1 วัน

```
 เช้า                    กลางวัน                   เย็น/ค่ำ              ปิดร้าน
  │                        │                        │                    │
  ▼                        ▼                        ▼                    ▼
┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐
│เปิดรอบ│→│ลูกค้ามา   │→│สั่งอาหาร  │→│ครัวทำ     │→│ชำระเงิน  │→│ปิดรอบ │
│ขาย   │  │สแกน QR   │  │(Staff/QR)│  │เสิร์ฟ    │  │ออกบิล   │  │ขาย   │
└──────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────┘
  │                                                                  │
  ├ เปิด Cashier Session                              ปิด Session ──┤
  ├ กรอกยอดเปิดลิ้นชัก                                 สรุปยอด      │
  │                                                  ตรวจนับเงิน    │
  │                                                                  │
  │  ┌─────── ระหว่างวัน ───────┐                                   │
  │  │ เงินเข้า/ออกลิ้นชัก      │                                   │
  │  │ จัดการจอง (Reservation)  │                                   │
  │  │ เปิด/ปิด/ย้ายโต๊ะ        │                                   │
  │  │ Void ออเดอร์             │                                   │
  │  │ Split Bill               │                                   │
  │  └─────────────────────────┘                                   │
  └────────────────────────────────────────────────────────────────┘
```

---

## สไลด์ 28: สรุป — จุดเด่นของ RBMS-POS

1. **ครบวงจร** — จัดการร้านอาหารตั้งแต่ เมนู → สั่งอาหาร → ครัว → ชำระเงิน → รายงาน
2. **Real-time** — ครัวเห็นออเดอร์ทันที ลูกค้าเห็นสถานะทันที ผ่าน SignalR
3. **Self-service** — ลูกค้าสแกน QR สั่งอาหารเอง ลดภาระพนักงาน
4. **RBAC** — กำหนดสิทธิ์ละเอียดทุก Module ทุก Action
5. **Secure** — JWT + Refresh Token + Account Lockout + ReCaptcha + PIN
6. **Modern Stack** — .NET 9 + Angular 19 + Tailwind + PrimeNG + SignalR + Docker
7. **Slip OCR** — ตรวจสอบสลิปโอนเงินอัตโนมัติ
8. **Auto-Cleanup** — ลบข้อมูลชั่วคราวอัตโนมัติ ไม่ให้ DB บวม
9. **File Storage** — S3-compatible (MinIO) รองรับ scale
10. **Thai-first** — ออกแบบสำหรับร้านอาหารไทย (ภาษา, เงินบาท, ฟอนต์ Sarabun)

