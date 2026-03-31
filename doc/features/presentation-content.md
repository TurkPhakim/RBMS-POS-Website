# เนื้อหาสำหรับสไลด์นำเสนอโปรเจค RBMS-POS

> สร้างจากการวิเคราะห์โค้ดจริงและเอกสาร — ข้อมูลทุกจุดตรงกับสิ่งที่อยู่ในระบบ

---

## ที่มาของโปรเจค

ร้านอาหารขนาดเล็ก-กลางจำนวนมากยังจดออเดอร์ด้วยกระดาษ ตะโกนสั่งครัว คิดเงินด้วยเครื่องคิดเลข ทำให้ออเดอร์ตกหล่น คิดเงินผิด และไม่มีข้อมูลสำหรับวางแผนธุรกิจ

**RBMS-POS** จึงพัฒนาขึ้นเป็นระบบจัดการร้านอาหารแบบครบวงจร ทำงานผ่านเว็บเบราว์เซอร์ แบบ Real-time — ร้านไม่ต้องลงทุนเครื่อง POS ราคาแพง แค่มีคอมพิวเตอร์หรือแท็บเล็ตก็ใช้งานได้

---

## วัตถุประสงค์

| # | วัตถุประสงค์ |
|---|-------------|
| 1 | **เปลี่ยนระบบกระดาษสู่ดิจิทัล** — รับออเดอร์ ส่งครัว คิดเงิน ในระบบเดียว ลดขั้นตอนและความผิดพลาด |
| 2 | **ลดเวลารอคอยด้วย QR Self-Ordering** — ลูกค้าสแกน QR สั่งอาหารเอง ออเดอร์ถึงครัวทันที |
| 3 | **จัดการครัว Real-time** — ครัวเห็นออเดอร์บนหน้าจอ อัพเดตสถานะทันที พนักงานรู้เวลาไปรับอาหาร |
| 4 | **ควบคุมสิทธิ์การเข้าถึง** — กำหนดสิทธิ์ตามตำแหน่ง แคชเชียร์เห็นแค่หน้าขาย ผู้จัดการเห็นทุกอย่าง |
| 5 | **มีข้อมูลสำหรับตัดสินใจ** — Dashboard แสดงยอดขาย จำนวนออเดอร์ ภาพรวมร้านแบบ Real-time |

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

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Backend API** | ASP.NET Core 9.0 + Entity Framework Core |
| **Real-time** | SignalR (WebSocket) |
| **Frontend Client** | Angular 19.1 + Tailwind CSS 3.4 + PrimeNG |
| **Frontend Mobile** | Angular 19.1 (Mobile-optimized PWA) |
| **Database** | SQL Server 2022 |
| **File Storage** | MinIO (S3-compatible Object Storage) |
| **API Documentation** | Swagger/OpenAPI |
| **Containerization** | Docker + Docker Compose + Nginx (Reverse Proxy) |
| **SSL** | Certbot (Auto-renew ทุก 12 ชม.) |
| **Font** | Sarabun (รองรับไทย+อังกฤษ) |
| **API Client Gen** | ng-openapi-gen (Auto-generate TypeScript client จาก Swagger) |

---

## Tech Stack ทั้งหมดที่ใช้ (ละเอียด)

### Backend — Framework & Library

| Library | Version | ใช้ทำอะไร |
|---------|---------|---------|
| .NET | 9.0 | Core runtime |
| ASP.NET Core | 9.0 | Web API framework |
| Entity Framework Core | 9.0.10 | ORM จัดการ Database (Code-First) |
| EF Core SQL Server | 9.0.10 | SQL Server provider |
| EF Core Design + Tools | 9.0.10 | Migration CLI (`dotnet ef`) |
| JWT Bearer Authentication | 9.0.10 | JWT token validation |
| BCrypt.Net-Next | 4.0.3 | Password hashing |
| Swashbuckle.AspNetCore | 9.0.6 | Swagger/OpenAPI documentation |
| Newtonsoft.Json (via MVC) | 9.0.10 | JSON serialization |
| AWSSDK.S3 | 4.0.18.8 | S3 client (ใช้กับ MinIO) |
| MailKit | 4.15.1 | SMTP ส่ง Email (OTP, forgot password) |
| SignalR | 9.0 | Real-time WebSocket (Kitchen, Notification) |
| HealthChecks.EF Core | 9.0.10 | Database health check endpoint |
| ResponseCompression | 9.0 | Gzip + Brotli compression |
| HttpOverrides | 9.0 | Nginx reverse proxy support |
| MemoryCache | 9.0 | In-memory caching |

### Frontend Client — Framework & Library

| Library | Version | ใช้ทำอะไร |
|---------|---------|---------|
| Angular | 19.2 | Core framework (Component, Router, Forms, Animations) |
| Angular CDK | 19.2 | Component Dev Kit (overlay, scrolling) |
| PrimeNG | 19.1.4 | UI Components (Table, Dialog, Dropdown, Button) |
| PrimeIcons | 7.0 | Icon library (pi pi-*) |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| NgRx (Store + Effects) | 19.0 | State Management |
| @microsoft/signalr | 9.0.6 | SignalR client (real-time) |
| Chart.js + ng2-charts | 4.5 / 10.0 | กราฟ Dashboard (Line, Bar, Donut) |
| Lottie (ngx-lottie) | 21.2 | Animation สำหรับ Global Loading overlay |
| pdfmake | 0.3.7 | สร้าง PDF ใบเสร็จ |
| qr-code-styling | 1.9.2 | สร้าง QR Code (โต๊ะ, ชำระเงิน) |
| ng-recaptcha | 13.2.1 | Google reCAPTCHA v3 (Login) |
| ng-openapi-gen | 0.51.0 | Auto-generate API client จาก Swagger |
| RxJS | 7.8 | Reactive programming (Observable) |
| TypeScript | 5.7 | Programming language |
| @fontsource/sarabun | 5.2.8 | Sarabun font (ไทย+อังกฤษ) |

### Frontend Mobile Web — Framework & Library

| Library | Version | ใช้ทำอะไร |
|---------|---------|---------|
| Angular | 19.2 | Core framework |
| PrimeNG | 19.1 | UI Components |
| Tailwind CSS | 3.4 | Utility CSS |
| @microsoft/signalr | 9.0.6 | Real-time (order status, notification) |
| Lottie (ngx-lottie) | 21.2 | Loading animation |
| pdfmake | 0.3.7 | PDF ใบเสร็จ |
| ng-openapi-gen | 0.51.0 | API client generation |
| RxJS | 7.8 | Reactive programming |
| TypeScript | 5.7 | Programming language |

### Database & Infrastructure

| เครื่องมือ | Version | ใช้ทำอะไร |
|-----------|---------|---------|
| SQL Server | 2022 | Relational database หลัก |
| MinIO | latest | S3-compatible file storage (รูปเมนู, รูปโปรไฟล์, สลิป) |
| Docker + Docker Compose | - | Container orchestration |
| Nginx | latest | Reverse proxy + SSL termination |
| Certbot | latest | Auto SSL certificate (Let's Encrypt) |

### Testing

| เครื่องมือ | ใช้ทำอะไร |
|-----------|---------|
| Karma | Test runner |
| Jasmine | Testing framework |
| karma-coverage | Code coverage |

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

| ส่วน | หน้าที่ |
|------|--------|
| **Client Web** | เว็บสำหรับ Admin/Staff — จัดการเมนู, ออเดอร์, ครัว, ชำระเงิน, พนักงาน, ตั้งค่าร้าน |
| **Mobile Web** | เว็บสำหรับลูกค้า — สแกน QR สั่งอาหาร, ดูสถานะ, ชำระเงิน, ดาวน์โหลดใบเสร็จ |
| **Nginx** | ประตูหน้าบ้าน — รับ request จากทุกคน แล้วแยกส่งไปที่ถูกต้อง + จัดการ SSL |
| **Certbot** | ต่อใบรับรอง SSL (HTTPS) จาก Let's Encrypt อัตโนมัติทุก 12 ชม. |
| **Backend API** | สมองของระบบ — ประมวลผล business logic ทั้งหมด, จัดการสิทธิ์, ส่ง real-time |
| **SQL Server** | เก็บข้อมูลทั้งหมด — ออเดอร์, เมนู, พนักงาน, การชำระเงิน, สิทธิ์ (37 ตาราง) |
| **MinIO (S3)** | เก็บไฟล์ทั้งหมด — รูปเมนู, รูปโปรไฟล์, โลโก้ร้าน, QR ชำระเงิน, สลิปโอนเงิน |
| **Docker** | บรรจุทุกส่วนเป็น Container — สั่ง `docker compose up` ครั้งเดียวรันทั้งระบบ |

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

## Prompt สำหรับ Gen รูป Diagram (ใช้กับ Gemini)

### Prompt 1: System Architecture Diagram (ภาพรวมทั้งระบบ) — ปรับปรุงแล้ว

```
Create a professional system architecture diagram for a Restaurant POS system called "RBMS-POS". Use a clean, modern, flat design style with a white background suitable for a presentation slide (16:9 aspect ratio).

Title at top: "RBMS-POS — System Architecture"

Layout: Top-to-bottom flow with clear separation into 5 horizontal layers.

═══════════════════════════════════════════════════
LAYER 1 — Users (top)
═══════════════════════════════════════════════════
- Left side: An icon of a person at a desktop computer, labeled "Admin / Staff" with subtitle "Client Web (Angular 19)" and "Port 4300". Use a blue color theme (#3B82F6).
  Below the box, show 3 small tags: "Dashboard" "Order & Kitchen" "Management"
- Right side: An icon of a person holding a smartphone, labeled "Customer" with subtitle "Mobile Web (Angular 19)" and "Port 4400". Use a green color theme (#10B981).
  Below the box, show 3 small tags: "QR Ordering" "Track Status" "Payment"
- Both send solid arrows downward labeled "HTTPS (REST API)".
- IMPORTANT: Both also have dashed arrows coming back UP from the Backend's SignalR component (see Layer 3). The left dashed arrow is labeled "Real-time: Kitchen, Notification" and the right dashed arrow is labeled "Real-time: Order Status, Payment".

═══════════════════════════════════════════════════
LAYER 2 — Gateway
═══════════════════════════════════════════════════
- A single wide rounded rectangle in the center, labeled "Nginx (Reverse Proxy + Load Balancer)" with subtitle "Port 80 (HTTP) → 443 (HTTPS)". Use a dark gray color (#1E293B) with white text.
- To the right of Nginx, a small badge labeled "Certbot" with a lock icon and text "Let's Encrypt SSL Auto-Renew". Connected to Nginx with a small arrow labeled "certificates".
- Arrow from Nginx going down to Backend, labeled with route mapping:
  "/api/* → Backend"
  "/hub/* → SignalR"

═══════════════════════════════════════════════════
LAYER 3 — Backend (the largest section)
═══════════════════════════════════════════════════
- A large rounded rectangle in the center, labeled "Backend API" with subtitle "ASP.NET Core 9.0 — Port 5300". Use an orange color theme (#F97316) border.

- Inside the Backend box, arrange components in 2 rows:

  ROW 1 (top, 4 boxes side by side):
  1. "REST API" subtitle: "24 Controllers, 215 Endpoints"
  2. "SignalR Hubs" subtitle: "OrderHub + NotificationHub" (this is where the dashed arrows originate going back UP to Layer 1)
  3. "Business Logic" subtitle: "8 Service Modules"
  4. "JWT Auth + RBAC" subtitle: "Position-based Permissions"

  ROW 2 (bottom, 3 boxes side by side):
  5. "Slip OCR" subtitle: "QR Reader + Amount Verify"
  6. "Background Jobs" subtitle: "Auto-Cleanup, Reservation Reminder"
  7. "Email Service" subtitle: "MailKit SMTP (OTP, Password Reset)"

- From "Email Service", draw an arrow going RIGHT outside the Docker border to an external cloud icon labeled "Gmail SMTP" with envelope icon.

═══════════════════════════════════════════════════
LAYER 4 — Data Storage
═══════════════════════════════════════════════════
- Left: A cylinder (database icon) labeled "SQL Server 2022" with subtitle "Port 1433". Use a blue color (#3B82F6).
  Below it, show grouped data: "37 Tables: Orders, Menus, Tables, Employees, Payments, Permissions, Notifications"
  Below that: a small volume icon labeled "sqlserver-data (Docker Volume)"

- Right: A bucket/storage icon labeled "MinIO (S3-Compatible Storage)" with subtitle "Port 9000". Use a pink/red color (#F43F5E).
  Below it, show stored file types: "Menu Images, Profile Photos, Shop Logo, Payment QR, Slip Images, Receipts"
  Below that: a small volume icon labeled "minio-data (Docker Volume)"

- Solid arrows from Backend going down to both SQL Server (labeled "EF Core ORM") and MinIO (labeled "S3 API (AWSSDK)").

═══════════════════════════════════════════════════
LAYER 5 — External Services (outside Docker border, far right)
═══════════════════════════════════════════════════
- Small cloud icon: "Gmail SMTP" (connected from Email Service)
- Small cloud icon: "Google reCAPTCHA v3" (connected from JWT Auth with dashed line labeled "Bot Protection")
- These sit OUTSIDE the Docker border on the right side.

═══════════════════════════════════════════════════
OUTER BORDER
═══════════════════════════════════════════════════
- A large dashed blue border wrapping Layer 1 through Layer 4 (NOT the external services).
- Label at the bottom-center: "Docker Compose" with a Docker whale icon.
- Small subtitle: "Single command deployment: docker compose up -d"
- Bottom-left corner: small network icon labeled "rbms-pos-network (Bridge)"

═══════════════════════════════════════════════════
LEGEND (bottom of diagram)
═══════════════════════════════════════════════════
- Solid arrow: "HTTP/HTTPS Request (REST API)"
- Dashed arrow: "Real-time Push (WebSocket / SignalR)"
- Cylinder: "Database"
- Bucket: "Object Storage"

═══════════════════════════════════════════════════
STYLE REQUIREMENTS
═══════════════════════════════════════════════════
- Flat design, no 3D effects, no heavy gradients (subtle gradient OK)
- Rounded corners (12px radius) on all boxes
- Arrows: clean, with clear arrowheads. Solid for HTTP, dashed for WebSocket.
- Consistent outlined icon style throughout
- Font: clean sans-serif (Inter, Segoe UI, or similar)
- Color palette:
  - Blue (#3B82F6) — Client Web, SQL Server
  - Orange (#F97316) — Backend API
  - Green (#10B981) — Mobile Web
  - Dark Gray (#1E293B) — Nginx
  - Pink/Red (#F43F5E) — MinIO
  - Light Gray (#F8FAFC) — background fills inside boxes
- White background overall
- 16:9 aspect ratio
- All text must be clearly readable at presentation size (minimum ~12pt equivalent)
- All text in English
- Professional quality suitable for a university project presentation or investor pitch
```

### บทพูดอธิบาย System Architecture Diagram

> ใช้ประกอบตอนพรีเซนต์รูป Diagram ด้านบน — พูดตามลำดับจากบนลงล่าง

---

**เปิด:**
"ภาพนี้แสดงภาพรวมของระบบ RBMS-POS ทั้งหมดว่ามีกี่ส่วน แต่ละส่วนเชื่อมต่อกันยังไง"

---

**Layer 1 — ผู้ใช้งาน:**
"ระบบเรามีผู้ใช้ 2 กลุ่ม — ฝั่งซ้ายคือ Admin กับ Staff ที่ใช้งานผ่าน Client Web บนคอมพิวเตอร์ สำหรับจัดการออเดอร์ ดูหน้าจอครัว จัดการเมนู พนักงาน ตั้งค่าร้าน ฝั่งขวาคือลูกค้า ที่สแกน QR Code ที่โต๊ะแล้วสั่งอาหารผ่าน Mobile Web บนมือถือ ทั้งสองฝั่งสร้างด้วย Angular 19 เหมือนกัน แต่แยก Codebase เพราะ UI และฟีเจอร์ต่างกัน"

---

**Layer 2 — Nginx:**
"ทุก request จากทั้งสองฝั่งจะผ่าน Nginx ก่อน ซึ่งทำหน้าที่เป็น Reverse Proxy คือรับ request แล้วแยกส่งไปที่ถูกต้อง — ถ้าเป็น /api จะส่งไป Backend ถ้าเป็น /hub จะส่งไป SignalR ตรงนี้ Certbot จะจัดการต่อใบรับรอง SSL ให้อัตโนมัติ ทำให้ทุกการเชื่อมต่อเป็น HTTPS ตลอด"

---

**Layer 3 — Backend (เน้น):**
"ส่วนนี้คือหัวใจของระบบ — Backend API สร้างด้วย ASP.NET Core 9 มีทั้งหมด 24 Controllers รวม 215 API endpoints ข้างในแบ่งเป็น 8 Business Modules เช่น Order, Menu, Payment, Kitchen

จุดสำคัญคือ **SignalR Hub** ที่เป็นเส้นประในรูป — ปกติ REST API จะเป็นแบบ ถาม-ตอบ คือ Frontend ถาม Backend ตอบ แต่ SignalR ทำให้ Backend **ส่งข้อมูลไปหา Frontend ได้เอง** โดยไม่ต้องรอถาม เช่น ลูกค้าสั่งอาหารปุ๊บ หน้าจอครัวเห็นทันที แคชเชียร์เห็นทันที โดยไม่ต้อง refresh

นอกจากนี้ยังมี Slip OCR ที่อ่าน QR ในสลิปและตรวจจำนวนเงินอัตโนมัติ Background Jobs ที่ทำความสะอาดข้อมูลชั่วคราวและเตือนการจอง และ Email Service สำหรับส่ง OTP ตอนลืมรหัสผ่าน"

---

**Layer 4 — Data Storage:**
"ข้อมูลเก็บ 2 ที่ — SQL Server เก็บข้อมูลทั้งหมด 37 ตาราง ตั้งแต่ออเดอร์ เมนู พนักงาน การชำระเงิน ส่วน MinIO เก็บไฟล์ทั้งหมด เช่น รูปเมนู รูปโปรไฟล์ สลิปโอนเงิน โลโก้ร้าน โดย MinIO เป็น S3-Compatible คือใช้มาตรฐานเดียวกับ AWS S3 แต่เราโฮสต์เองได้"

---

**Docker + External:**
"ทุกอย่างที่เห็นในกรอบเส้นประนี้ รันอยู่ใน Docker Container ทั้งหมด สั่ง docker compose up ครั้งเดียวก็ได้ทั้งระบบ ส่วนนอก Docker มี 2 บริการภายนอกคือ Gmail สำหรับส่งเมล และ Google reCAPTCHA สำหรับป้องกัน Bot ตอน Login"

---

**ปิด:**
"สรุปคือระบบนี้มีทั้ง Frontend 2 ตัว, Backend 1 ตัว, Database, File Storage, Reverse Proxy รวมอยู่ใน Docker ทำงานร่วมกันผ่าน REST API และ Real-time WebSocket"

---

### Prompt 2: Data Flow Diagram (ลูกค้าสั่งอาหาร → ครัว → ชำระเงิน) — ปรับปรุงแล้ว

```
Create a professional data flow diagram showing the complete restaurant ordering process for a POS system called "RBMS-POS". Use a clean, modern infographic style with a white background for a presentation slide (16:9 aspect ratio).

Title at top: "Complete Restaurant Ordering Flow"

The flow is arranged in 2 ROWS to fit all 8 steps clearly:

ROW 1 (top row, steps 1-4, left to right):

STEP 1 — "Scan QR Code" (green background — Customer action)
- Icon: A smartphone scanning a QR code on a restaurant table
- Label: "Customer scans QR at table → Get session token"
- Arrow going right to Step 2

STEP 2 — "Browse & Order" (green background — Customer action)
- Icon: A smartphone showing a food menu grid with a cart icon
- Label: "Browse menu by category → Select options → Add to cart → Place order"
- Small note below: "via Nginx → Backend API → SQL Server"
- Arrow going right to Step 3

STEP 3 — "Kitchen Display" (orange background — System processing)
- Icon: A large monitor/screen showing order tickets in a grid
- Label: "Order appears instantly on Kitchen Display"
- Badge: "Real-time via SignalR" with a lightning bolt icon
- Sub-flow showing 3 status icons in a row: "Pending → Cooking → Ready"
- Arrow going right to Step 4

STEP 4 — "Track Status + Call Waiter" (green background — Customer action)
- Icon: A smartphone showing a progress/status tracker with checkmarks
- Label: "Customer tracks order status in real-time on mobile"
- Second line: "Can call waiter anytime (button with 60s cooldown)"
- Badge: "Live Update" with a refresh/sync icon
- Arrow going DOWN to Step 5 (transition to row 2)

ROW 2 (bottom row, steps 5-8, LEFT to right — same direction):

STEP 5 — "Serve Food" (blue background — Staff action)
- Icon: A waiter carrying a plate of food
- Label: "Staff receives 'Ready to Serve' notification → Delivers food to table"
- Badge: "Real-time Alert"
- Arrow going right to Step 6

STEP 6 — "Request Bill" (green background — Customer action)
- Icon: A smartphone showing a bill/receipt summary with a total amount
- Label: "Customer requests bill → System calculates total + service charge"
- Second line: "Split Bill: Equal split (by person) or Split by item"
- Arrow going right to Step 7

STEP 7 — "Payment" (orange background — System processing)
- Icon: A smartphone showing QR code + a payment slip image
- Label: "Choose payment method:"
- Show 2 sub-paths stacked:
  Path A: "Cash → Cashier calculates change"
  Path B: "QR Transfer → Upload slip → Slip OCR auto-verify amount → Cashier confirms"
- Arrow going right to Step 8

STEP 8 — "Receipt" (green background — Customer action)
- Icon: A PDF document icon with a download arrow
- Label: "Download digital receipt (PDF)"
- Second line: "Per-bill or combined receipt"
- End marker (a checkmark or flag icon)

═══════════════════════════════════════════════════
BOTTOM BAR (below both rows)
═══════════════════════════════════════════════════
A thin horizontal bar spanning the full width, divided into 3 color-coded sections:
- Green section: "Mobile Web (Customer)" — covers Step 1, 2, 4, 6, 8
- Orange section: "Backend API (.NET 9 + SignalR)" — spans ALL steps as the backbone
- Blue section: "Client Web (Staff/Kitchen)" — covers Step 3, 5, 7

═══════════════════════════════════════════════════
STYLE REQUIREMENTS
═══════════════════════════════════════════════════
- Clean infographic style with numbered circles (1-8) at the top of each card
- Steps connected by flowing arrows with arrowheads
- Each step is a rounded rectangle card with: colored background, icon, step name (bold), description text
- 2 rows of 4 steps each, with a clear transition arrow from Step 4 down to Step 5
- Color coding:
  - Green (#10B981 light tint) — Customer actions (Step 1, 2, 4, 6, 8)
  - Orange (#F97316 light tint) — System/Backend processing (Step 3, 7)
  - Blue (#3B82F6 light tint) — Staff actions (Step 5)
- White background overall
- Flat design, no 3D, subtle rounded shadows OK
- Font: clean sans-serif
- All text in English
- Text must be readable at presentation size
- Professional quality suitable for a university presentation
```

### บทพูดอธิบาย Data Flow Diagram

> พูดตาม Step 1-8 แต่รวบบางจุดที่ไม่ต้องอธิบายยาว

---

**เปิด:**
"ภาพนี้แสดง Flow การใช้งานจริงของลูกค้าตั้งแต่เข้าร้านจนกลับบ้าน ทั้งหมด 8 ขั้นตอน แถวบนเป็นขั้นตอนสั่งอาหาร แถวล่างเป็นขั้นตอนชำระเงิน"

---

**Step 1-2 (รวบ):**
"เริ่มจากลูกค้าสแกน QR Code ที่โต๊ะ ระบบจะให้ Session Token เชื่อมกับโต๊ะนั้นอัตโนมัติ จากนั้นลูกค้าเลือกเมนูตามหมวดหมู่ เลือกตัวเลือกเสริมเช่นระดับความเผ็ด ใส่ตะกร้า แล้วกดสั่ง ตรงนี้ข้อมูลจะวิ่งผ่าน Nginx ไป Backend แล้วบันทึกลง Database"

---

**Step 3 (เน้น — Real-time):**
"จุดสำคัญคือ Step 3 — พอลูกค้ากดสั่งปุ๊บ ออเดอร์จะปรากฏบนหน้าจอครัวทันทีผ่าน SignalR โดยไม่ต้อง refresh หน้า ครัวก็เริ่มทำ อัพเดตสถานะจาก Pending เป็น Cooking แล้วเป็น Ready"

---

**Step 4 (เน้น — ฟีเจอร์เด่น):**
"ระหว่างรออาหาร ลูกค้าจะเห็นสถานะของทุกเมนูที่สั่งบนมือถือแบบ Real-time เลย เช่นเมนูไหนกำลังทำ เมนูไหนพร้อมเสิร์ฟแล้ว และถ้าต้องการอะไรก็กดปุ่มเรียกพนักงานได้เลย พนักงานจะได้รับแจ้งเตือนทันที"

---

**Step 5-6 (รวบ):**
"พออาหารเสร็จ พนักงานจะได้รับ notification ว่าพร้อมเสิร์ฟ ก็ไปรับมาเสิร์ฟที่โต๊ะ เมื่อทานเสร็จลูกค้ากดขอบิล ระบบจะคำนวณยอดรวมพร้อมค่าบริการให้อัตโนมัติ ตรงนี้ยังมีฟีเจอร์หารบิลด้วย ทั้งแบบหารเท่าและแบบเลือกตามรายการ"

---

**Step 7 (เน้น — Slip OCR):**
"การชำระเงินมี 2 ช่องทาง — เงินสดก็จ่ายที่แคชเชียร์ปกติ แต่ถ้าโอน QR ลูกค้าอัพโหลดสลิปมา ระบบจะอ่าน QR ในสลิปและตรวจจำนวนเงินให้อัตโนมัติ แล้วแคชเชียร์กดยืนยันอีกที"

---

**Step 8:**
"สุดท้ายลูกค้าดาวน์โหลดใบเสร็จเป็น PDF ได้ทั้งแบบรายบิลและรวม"

---

**ปิด:**
"สังเกตแถบด้านล่าง — สีเขียวคือฝั่งลูกค้า สีส้มคือ Backend ที่ทำงานอยู่เบื้องหลังทุกขั้นตอน สีน้ำเงินคือฝั่งพนักงาน ทั้งหมดนี้ทำงานร่วมกันแบบ Real-time"

---

### Prompt 3: Real-time Communication Diagram (SignalR) — ปรับปรุงแล้ว

```
Create a professional diagram showing real-time communication flow in a Restaurant POS system using SignalR WebSocket. Clean, modern style, white background, 16:9 presentation slide.

Title at top: "Real-time Communication — SignalR WebSocket"

═══════════════════════════════════════════════════
CENTER — SignalR Hub
═══════════════════════════════════════════════════
- A large hexagon labeled "SignalR Hub" with a lightning bolt icon inside. Use orange color (#F97316).
- Subtitle line 1: "Backend API (.NET 9)"
- Subtitle line 2: "OrderHub + NotificationHub"
- Below the hexagon, a small box showing "Notification UI" with 2 items:
  "Toast popup (top-right)" and "Badge counter on bell icon"

═══════════════════════════════════════════════════
4 USER GROUPS around the center (hub-and-spoke layout)
═══════════════════════════════════════════════════

TOP-LEFT — "Kitchen Display" (red/warm color #EF4444):
- Icon: A chef with a large monitor screen
- Group label: "Kitchen Group"
- Arrow FROM center (solid, labeled): "New Order Arrived"
- Arrow TO center (dashed, labeled): "Update Status (Cooking → Ready)"

TOP-RIGHT — "Floor Staff" (blue color #3B82F6):
- Icon: A waiter
- Group label: "Floor Group"
- Arrow FROM center (solid, labeled): "Food Ready to Serve, Customer Calling Waiter"

BOTTOM-LEFT — "Cashier" (green color #10B981):
- Icon: A person at a cash register/computer
- Group label: "Cashier Group"
- Arrow FROM center (solid, labeled): "Bill Requested, Slip Uploaded, Payment Status"
- Arrow TO center (dashed, labeled): "Confirm Payment, Approve/Reject Slip"

BOTTOM-RIGHT — "Customer — Mobile Web" (teal color #14B8A6):
- Icon: A person holding a smartphone
- Group label: "Customer (per-table session)"
- Arrow TO center (dashed, labeled): "Place Order, Request Bill, Upload Slip, Call Waiter"
- Arrow FROM center (solid, labeled): "Order Status Update, Payment Confirmed, Bill Ready"

═══════════════════════════════════════════════════
EVENTS LIST (small card near center or to the side)
═══════════════════════════════════════════════════
Title: "9 Real-time Event Types"
Show as a numbered list:
1. New Order
2. Order Status Changed
3. Food Ready
4. Bill Requested
5. Slip Uploaded
6. Payment Confirmed
7. Customer Calling Waiter
8. Table Moved
9. Table Linked

═══════════════════════════════════════════════════
LEGEND (bottom of diagram)
═══════════════════════════════════════════════════
- Solid arrow (→): "Real-time push via WebSocket (server → client)"
- Dashed arrow (←): "Event trigger via HTTP (client → server → broadcast to groups)"
- Note: "Role-based groups — each role only receives relevant notifications"

═══════════════════════════════════════════════════
STYLE REQUIREMENTS
═══════════════════════════════════════════════════
- Hub-and-spoke layout: hexagon center with 5 groups around it
- Clean arrows with clear arrowheads and labels
- Solid arrows = server push, Dashed arrows = client trigger
- Each group has: distinct color, icon, group name label, connection labels
- Flat design, no 3D effects
- Icons: simple, consistent style (outlined or filled, not mixed)
- Font: clean sans-serif
- Color palette:
  - Orange (#F97316) — SignalR Hub (center)
  - Red (#EF4444) — Kitchen Display
  - Blue (#3B82F6) — Floor Staff
  - Green (#10B981) — Cashier
  - Teal (#14B8A6) — Customer
- White background
- 16:9 aspect ratio
- All text in English
- Professional quality suitable for a university presentation
```

### Prompt 4: Database ER Diagram (ภาพรวม)

```
Create a professional Entity-Relationship overview diagram for a Restaurant POS system called "RBMS-POS". This is a HIGH-LEVEL overview showing table groups and relationships between groups — NOT a detailed column-level ER diagram. White background, 16:9, presentation style.

Title at top: "Database Design — 37 Tables"

═══════════════════════════════════════════════════
LAYOUT — 6 colored groups arranged in a grid
═══════════════════════════════════════════════════
Each group is a large rounded rectangle with a colored header bar. Inside each group, list the table names as simple rows (no columns, just table names).

GROUP 1 — "User & Auth" (blue #3B82F6) — TOP LEFT:
Tables (11):
- TbUsers
- TbEmployees
- TbEmployeeAddresses
- TbEmployeeEducations
- TbEmployeeWorkHistories
- TbPasswordHistories
- TbmPosition
- TbmPermission
- TbmModule
- TbmAuthorizeMatrix
- TbAuthorizeMatrixPosition
Small note: "Position-based RBAC + Employee sub-entities"

GROUP 2 — "Menu" (orange #F97316) — TOP CENTER:
Tables (6):
- TbMenus
- TbMenuSubCategories
- TbOptionGroups
- TbOptionItems
- TbMenuOptionGroups (M:M badge)
- TbServiceCharges
Small note: "3 categories: Food, Beverage, Dessert"

GROUP 3 — "Shop & File" (purple #7C3AED) — TOP RIGHT:
Tables (4):
- TbShopSettings
- TbShopOperatingHours
- TbFiles
- TbRefreshTokens
Small note: "S3 file storage + JWT tokens"

GROUP 4 — "Table & Zone" (green #10B981) — BOTTOM LEFT:
Tables (5):
- TbZones
- TbTables
- TbTableLinks
- TbReservations
- TbFloorObjects
Small note: "Floor plan + Drag & Drop"

GROUP 5 — "Order" (red #EF4444) — BOTTOM CENTER:
Tables (6):
- TbOrders
- TbOrderItems
- TbOrderBills
- TbOrderItemOptions
- TbCustomers
- TbSelfOrderSessions
Small note: "Core business logic"

GROUP 6 — "Payment & Notification" (teal #14B8A6) — BOTTOM RIGHT:
Tables (5):
- TbCashierSessions
- TbCashDrawerTransactions
- TbPayments
- TbNotifications
- TbNotificationReads
Small note: "Cash + QR + Slip OCR"

═══════════════════════════════════════════════════
RELATIONSHIP ARROWS between groups
═══════════════════════════════════════════════════
Draw arrows between groups to show how they connect:

1. "User & Auth" → "Order" (labeled: "CreatedBy / Staff")
2. "User & Auth" → "Payment & Notification" (labeled: "Cashier / Notification Reader")
3. "Menu" → "Order" (labeled: "OrderItems → Menu")
4. "Table & Zone" → "Order" (labeled: "Order → Table")
5. "Order" → "Payment & Notification" (labeled: "Bill → Payment")
6. "Shop & File" → "Menu" (labeled: "Menu Images")
7. "Shop & File" → "User & Auth" (labeled: "Profile Photos")
8. "Shop & File" → "Payment & Notification" (labeled: "Slip Images")

═══════════════════════════════════════════════════
SUMMARY BAR (bottom)
═══════════════════════════════════════════════════
A horizontal bar showing key stats:
"37 Tables | 6 Domain Groups | Soft Delete (BaseEntity) | Audit Trail (CreatedAt/By, UpdatedAt/By)"

═══════════════════════════════════════════════════
LEGEND
═══════════════════════════════════════════════════
- "Tb" prefix = Business table
- "Tbm" prefix = Master Data (seed)
- "(M:M)" badge = Many-to-Many junction table
- Arrow = Foreign Key relationship between groups

═══════════════════════════════════════════════════
STYLE
═══════════════════════════════════════════════════
- Each group is a rounded rectangle with colored header + white body
- Table names listed as simple text rows inside each group (no columns/types)
- Arrows between groups: solid lines with arrowheads, labeled
- Clean, flat design
- Color-coded by domain (each group has a distinct color)
- Font: clean sans-serif
- White background, 16:9
- All text in English
- Professional quality suitable for a university presentation
```

### บทพูดอธิบาย Database ER Diagram

> อธิบายภาพรวม → เน้น 2-3 กลุ่มสำคัญ → สรุปด้านล่าง

---

**เปิด:**
"ภาพนี้แสดงการออกแบบฐานข้อมูลทั้งหมด 37 ตาราง แบ่งเป็น 6 กลุ่มตามหน้าที่ ลูกศรระหว่างกลุ่มแสดงว่าข้อมูลเชื่อมกันยังไง"

---

**กลุ่มสำคัญ (ไล่สั้นๆ):**
"กลุ่มที่ใหญ่ที่สุดคือ User & Auth มี 11 ตาราง เพราะนอกจากข้อมูลพนักงานแล้ว ยังรวมระบบสิทธิ์ด้วย ตั้งแต่ตำแหน่ง โมดูล ไปจนถึง Permission Matrix ที่กำหนดว่าตำแหน่งไหนเข้าถึงอะไรได้บ้าง

กลุ่ม Order ตรงกลางคือหัวใจของระบบ เก็บออเดอร์ รายการอาหาร บิล ตัวเลือกเสริม รวมถึง Self-Order Session ของลูกค้าที่สั่งผ่าน QR

กลุ่ม Shop & File เป็นกลุ่มที่เชื่อมกับทุกกลุ่ม เพราะ TbFiles เก็บไฟล์ทั้งหมดไว้ที่เดียว ไม่ว่าจะเป็นรูปเมนู รูปโปรไฟล์ หรือสลิปโอนเงิน"

---

**ลูกศร (เน้นสั้น):**
"สังเกตลูกศร — ทุกกลุ่มชี้เข้าหา Order เพราะออเดอร์ต้องรู้ว่าใครสั่ง สั่งเมนูอะไร โต๊ะไหน แล้ว Order ก็ชี้ไป Payment เพราะต้องออกบิลและชำระเงิน"

---

**ปิด:**
"ด้านล่างคือสิ่งที่ทุกตารางมีร่วมกัน — ทุกตารางมี Soft Delete คือลบแล้วข้อมูลยังอยู่ เรียกคืนได้ และมี Audit Trail บันทึกว่าใครสร้าง ใครแก้ไข เมื่อไหร่ อัตโนมัติ"

---

### Prompt 5: Use Case Diagram (ลูกค้า vs พนักงาน)

```
Create a professional Use Case Diagram for a Restaurant POS system called "RBMS-POS". Show what each user type can do. Clean, modern style, white background, 16:9 presentation slide.

Title at top: "Use Case Diagram — Who Can Do What"

═══════════════════════════════════════════════════
LAYOUT — Split into LEFT and RIGHT halves
═══════════════════════════════════════════════════

LEFT HALF — "Staff (Client Web)" with a desktop computer icon
Background: light blue tint

Show 4 actor stick figures on the far left, stacked vertically:
1. "Admin" (red icon) — with a star badge
2. "Cashier" (green icon) — with a cash register
3. "Kitchen" (orange icon) — with a chef hat
4. "Floor Staff" (blue icon) — with a serving tray

In the center-left area, show use case ovals grouped by module:

DASHBOARD group:
- "View Dashboard & KPI" — connected to Admin only
- "View Sales Report" — connected to Admin only

ORDER group:
- "View Restaurant Overview (Floor Plan)" — connected to Admin, Floor Staff
- "Create / Edit Order" — connected to Admin, Floor Staff
- "Send to Kitchen" — connected to Admin, Floor Staff
- "Void / Cancel Order Item" — connected to Admin, Floor Staff
- "Request Bill / Split Bill" — connected to Admin, Floor Staff
- "Move Table / Link Tables" — connected to Admin, Floor Staff

KITCHEN group:
- "View Kitchen Display" — connected to Admin, Kitchen
- "Update Order Status (Cooking → Ready)" — connected to Kitchen only

MENU group:
- "Manage Menus (CRUD)" — connected to Admin only
- "Manage Categories & Options" — connected to Admin only

TABLE group:
- "Manage Zones & Tables (CRUD)" — connected to Admin only
- "Design Floor Plan (Drag & Drop)" — connected to Admin only
- "Manage Reservations" — connected to Admin only

PAYMENT group:
- "Open / Close Cashier Session" — connected to Admin, Cashier
- "Process Payment (Cash / QR)" — connected to Cashier only
- "Verify Slip (OCR)" — connected to Cashier only
- "View Payment History" — connected to Admin, Cashier

HR group:
- "Manage Employees (CRUD)" — connected to Admin only
- "Create User Account" — connected to Admin only

ADMIN SETTINGS group:
- "Manage Users (Lock/Unlock)" — connected to Admin only
- "Manage Positions & Permissions" — connected to Admin only
- "Shop Settings (Logo, QR, Hours)" — connected to Admin only

COMMON (all staff):
- "View Notifications (Real-time)" — connected to ALL 4 roles
- "View Profile / Change Password / PIN" — connected to ALL 4 roles

═══════════════════════════════════════════════════

RIGHT HALF — "Customer (Mobile Web)" with a smartphone icon
Background: light green tint

Show 1 actor stick figure on the far right:
- "Customer" (teal icon) — with a smartphone

Use case ovals in the center-right area:

ORDERING group:
- "Scan QR Code at Table"
- "Set Nickname"
- "Browse Menu by Category"
- "Search Menu"
- "View Menu Details + Options"
- "Add to Cart / Edit Cart"
- "Place Order (Send to Kitchen)"

TRACKING group:
- "Track Order Status (Real-time)"
- "Call Waiter (60s Cooldown)"

PAYMENT group:
- "Request Bill"
- "Split Bill (Equal / By Item)"
- "Pay by Cash (notify cashier)"
- "Pay by QR (Upload Slip)"
- "View Bill Summary"

RECEIPT group:
- "Download Receipt (PDF)"

All ovals connected to the single Customer actor.

═══════════════════════════════════════════════════
DIVIDER
═══════════════════════════════════════════════════
A vertical dashed line separating Left and Right halves.
Left side header: "Client Web — Desktop (Staff)"
Right side header: "Mobile Web — Smartphone (Customer)"

═══════════════════════════════════════════════════
BOTTOM NOTE
═══════════════════════════════════════════════════
"Staff permissions are dynamic — Admin can create custom positions and assign specific permissions per module (Position-based RBAC)"

═══════════════════════════════════════════════════
STYLE
═══════════════════════════════════════════════════
- UML Use Case style: stick figure actors + oval use cases
- Use case ovals grouped by module with a labeled boundary box
- Lines connecting actors to their use cases
- Color coding:
  - Admin lines: Red (#EF4444)
  - Cashier lines: Green (#10B981)
  - Kitchen lines: Orange (#F97316)
  - Floor Staff lines: Blue (#3B82F6)
  - Customer lines: Teal (#14B8A6)
- Left background: very light blue (#EFF6FF)
- Right background: very light green (#ECFDF5)
- Flat design, clean lines
- Font: clean sans-serif
- White overall background, 16:9
- All text in English
- Professional quality suitable for a university presentation
```

### บทพูดอธิบาย SignalR Diagram

> พูดตามลำดับ ตรงกลาง → 4 กลุ่ม → สรุป

---

**เปิด:**
"ภาพนี้แสดงว่าระบบ Real-time ของเราทำงานยังไง ตรงกลางคือ SignalR Hub ซึ่งเป็นตัวกลางที่คอยกระจายข้อมูลไปให้ทุกฝ่ายแบบทันที โดยมี 2 Hub คือ OrderHub จัดการเรื่องออเดอร์กับครัว และ NotificationHub จัดการแจ้งเตือนทั่วไป"

---

**4 กลุ่ม (ไล่ทีละมุม):**
"ระบบแบ่งผู้ใช้เป็น 4 กลุ่ม แต่ละกลุ่มจะได้รับแจ้งเตือนเฉพาะที่เกี่ยวข้องกับตัวเองเท่านั้น

ฝั่งครัว — พอลูกค้าสั่งอาหาร ออเดอร์จะปรากฏบนหน้าจอครัวทันที ครัวกดเริ่มทำ กดเสร็จ สถานะก็ส่งกลับมา

ฝั่งพนักงานเสิร์ฟ — จะได้รับแจ้งเตือนเมื่ออาหารพร้อมเสิร์ฟ หรือเมื่อลูกค้ากดปุ่มเรียก

ฝั่งแคชเชียร์ — จะเห็นเมื่อลูกค้าขอบิล อัพโหลดสลิป หรือมีการชำระเงินเข้ามา แล้วก็กดยืนยันกลับไป

ฝั่งลูกค้า — จะเห็นสถานะอาหารที่สั่งเปลี่ยนแบบ Real-time เลย ไม่ต้อง refresh หน้า รวมถึงเห็นผลชำระเงินทันที"

---

**ปิด:**
"ทั้งหมดนี้ทำงานผ่าน WebSocket ซึ่งต่างจาก HTTP ปกติตรงที่ server ส่งข้อมูลไปหา client ได้เองโดยไม่ต้องรอถาม ทำให้ทุกคนเห็นข้อมูลเดียวกันพร้อมกันทันที"

---

### บทพูดอธิบาย Docker Deployment Diagram

> พูดตามลำดับ นอก → ใน → ล่าง

---

**เปิด:**
"ภาพนี้แสดงว่าระบบ RBMS-POS deploy ยังไง — ทุกอย่างรันอยู่ใน Docker Container ทั้งหมด 7 ตัว"

---

**จุดเข้า (Nginx):**
"เริ่มจากด้านนอก เมื่อผู้ใช้เปิดเว็บ request จะเข้ามาที่ Nginx ก่อนเสมอ ซึ่งทำหน้าที่เป็น Reverse Proxy คือรับ request แล้วดูว่าจะส่งไปที่ไหน — ถ้าเป็นหน้าเว็บ Admin ก็ส่งไป Client Web ถ้าเป็นหน้าลูกค้าก็ส่งไป Mobile Web ถ้าเป็น API ก็ส่งไป Backend ตรงนี้ Certbot จะต่อใบรับรอง SSL ให้อัตโนมัติ ทำให้ทุกการเชื่อมต่อเป็น HTTPS"

---

**7 Containers (เน้นสั้น):**
"ข้างในมี 7 containers — Frontend 2 ตัวแยก Admin กับลูกค้า, Backend 1 ตัวเป็นหัวใจระบบ, Nginx กับ Certbot จัดการ SSL, SQL Server เก็บข้อมูล, MinIO เก็บไฟล์ ทั้งหมดคุยกันผ่าน Docker Network ภายใน"

---

**Docker Volumes (เน้น):**
"ด้านล่างคือ Docker Volumes — เป็นที่เก็บข้อมูลถาวร แม้ restart หรือ update container ข้อมูลใน Database และไฟล์ทั้งหมดจะไม่หายไป"

---

**ปิด:**
"ข้อดีของ Docker คือ deploy ทั้งระบบด้วยคำสั่งเดียว docker compose up แค่นั้น ไม่ต้องติดตั้งทีละตัว ย้ายเครื่องก็แค่ copy ไฟล์ config แล้วสั่ง up ใหม่"

---

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
| Entity | คำอธิบาย |
|--------|---------|
| TbUser | บัญชีผู้ใช้ (Username, Email, PasswordHash, LockoutCount) |
| TbRefreshToken | JWT Refresh Token |
| TbPasswordResetToken | Token สำหรับรีเซ็ตรหัสผ่าน |
| TbPasswordHistory | ประวัติรหัสผ่านที่เคยใช้ |
| TbLoginHistory | ประวัติการเข้าสู่ระบบ |

### Authorization / RBAC (5 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbmPosition | ตำแหน่งงาน (Master Data) |
| TbmPermission | ประเภทสิทธิ์ (read, create, update, delete) |
| TbmModule | โมดูลระบบ (parent/child hierarchy) |
| TbmAuthorizeMatrix | จับคู่ Module + Permission |
| TbAuthorizeMatrixPosition | กำหนดสิทธิ์ต่อตำแหน่ง |

### Human Resource (4 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbEmployee | ข้อมูลพนักงาน (ชื่อ, เพศ, วันเกิด, ตำแหน่ง, เงินเดือน) |
| TbEmployeeAddress | ที่อยู่พนักงาน (หลายที่อยู่ต่อคน) |
| TbEmployeeEducation | ประวัติการศึกษา |
| TbEmployeeWorkHistory | ประวัติการทำงาน |

### Menu (5 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbMenu | รายการเมนู (ชื่อ, ราคา, ต้นทุน, รูปภาพ) |
| TbMenuSubCategory | หมวดหมู่ย่อย (อาหาร/เครื่องดื่ม/ของหวาน) |
| TbOptionGroup | กลุ่มตัวเลือกเสริม (ระดับความเผ็ด, ท็อปปิ้ง) |
| TbOptionItem | รายการตัวเลือก (เผ็ดน้อย, +ไข่ดาว) |
| TbMenuOptionGroup | เชื่อม Menu กับ OptionGroup (M:M) |

### Table & Zone (4 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbZone | โซนพื้นที่ (ชั้น 1, ดาดฟ้า) |
| TbTable | โต๊ะ (ชื่อ, สถานะ, ตำแหน่ง, QR Token) |
| TbTableLink | เชื่อมโต๊ะ (รวมโต๊ะ) |
| TbFloorObject | วัตถุตกแต่งบนผังร้าน |

### Reservation (1 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbReservation | การจองโต๊ะ (ชื่อลูกค้า, เบอร์โทร, วันเวลา, สถานะ) |

### Order (4 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbOrder | ออเดอร์ (เลขออเดอร์, สถานะ, จำนวนลูกค้า, โต๊ะ) |
| TbOrderItem | รายการอาหาร (เมนู, จำนวน, ราคา, สถานะ) |
| TbOrderItemOption | ตัวเลือกของรายการ (ท็อปปิ้ง, ระดับเผ็ด) |
| TbOrderBill | บิล (ยอดรวม, ค่าบริการ, ภาษี, สถานะ) |

### Payment & Cashier (3 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbPayment | การชำระเงิน (วิธี, จำนวนเงิน, เลขใบเสร็จ) |
| TbCashierSession | รอบขาย (เปิด/ปิดกะ, ยอดเปิด/ปิด) |
| TbCashDrawerTransaction | เงินเข้า/ออกลิ้นชัก |

### Admin Settings (3 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbShopSettings | ข้อมูลร้าน (ชื่อ, โลโก้, QR Code, สถานะ) |
| TbShopOperatingHour | เวลาเปิด-ปิดร้าน (จันทร์-อาทิตย์) |
| TbServiceCharge | ค่าบริการ (เปอร์เซ็นต์, สถานะ) |

### Notification (2 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbNotification | การแจ้งเตือน (ประเภท, กลุ่มเป้าหมาย, ข้อความ) |
| TbNotificationRead | สถานะอ่าน (ต่อผู้ใช้) |

### Other (2 ตาราง)
| Entity | คำอธิบาย |
|--------|---------|
| TbFile | Metadata ไฟล์ (ชื่อ, ขนาด, S3 Key) |
| TbCustomerSession | Session ลูกค้า (สแกน QR) |

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
| # | ชื่อ | หน่วย | ตัวอย่าง |
|---|------|------|---------|
| 1 | ยอดขาย | บาท | 45,230 |
| 2 | จำนวนออเดอร์ | บิล | 127 |
| 3 | จำนวนลูกค้า | คน | 284 |
| 4 | เฉลี่ย/ออเดอร์ | บาท | 356 |
| 5 | กำไรขั้นต้น | บาท | 18,092 |
| 6 | เปอร์เซ็นต์กำไร | % | 40% |

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
| # | เมนูหลัก | เมนูย่อย |
|---|---------|---------|
| 1 | แดชบอร์ด | ภาพรวม, รายงานยอดขาย |
| 2 | ออเดอร์ | ภาพรวมร้าน, รายการออเดอร์ |
| 3 | เมนู | หมวดหมู่, อาหาร, เครื่องดื่ม, ของหวาน, ตัวเลือกเสริม |
| 4 | โต๊ะ | ผังร้าน, โซน/โต๊ะ, จองโต๊ะ |
| 5 | ชำระเงิน | รอบการขาย, ประวัติรอบขาย |
| 6 | ครัว | ครัวอาหาร, บาร์เครื่องดื่ม, ครัวขนมหวาน |
| 7 | ทรัพยากรบุคคล | รายชื่อพนักงาน |
| 8 | ตั้งค่าระบบ | ผู้ใช้งาน, ตำแหน่ง, ตั้งค่าร้าน, ค่าบริการ |

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
| กลุ่ม | ใครได้รับ | ตัวอย่างแจ้งเตือน |
|-------|---------|----------------|
| Kitchen | พ่อครัว/บาร์เทนเดอร์ | ออเดอร์ใหม่เข้ามา |
| Floor | พนักงานเสิร์ฟ | อาหารพร้อมเสิร์ฟ, ลูกค้าเรียก |
| Cashier | แคชเชียร์ | ขอบิล, อัพโหลด Slip |
| Manager | ผู้จัดการ | ทุกแจ้งเตือน |
| table_{id} | ลูกค้าที่โต๊ะนั้น | สถานะอาหาร, บิลพร้อม |

### ประเภทแจ้งเตือน (9 ประเภท):
| Event | คำอธิบาย |
|-------|---------|
| NEW_ORDER | มีออเดอร์ใหม่เข้ามา |
| ORDER_READY | อาหารพร้อมเสิร์ฟ |
| CALL_WAITER | ลูกค้าเรียกพนักงาน |
| REQUEST_BILL | ลูกค้าขอบิล |
| REQUEST_SPLIT_BILL | ลูกค้าขอแยกบิล |
| ORDER_CANCELLED | ออเดอร์ถูกยกเลิก |
| SLIP_UPLOADED | ลูกค้าอัพโหลด Slip |
| PAYMENT_COMPLETED | ชำระเงินสำเร็จ |
| RESERVATION_REMINDER | เตือนการจอง |

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
| Exception | HTTP Status | ตัวอย่าง |
|-----------|-----------|---------|
| ValidationException | 400 Bad Request | "กรุณาระบุชื่อเมนู" |
| EntityNotFoundException | 404 Not Found | "ไม่พบเมนู ID: 5" |
| BusinessException | 422 Unprocessable | "เมนูนี้ถูกปิดขายแล้ว" |
| ForbiddenException | 403 Forbidden | "ไม่มีสิทธิ์เข้าถึง" |
| InvalidCredentialsException | 401 Unauthorized | "รหัสผ่านไม่ถูกต้อง" |
| AccountLockedException | 423 Locked | "บัญชีถูกล็อค" (+ เวลาปลดล็อค) |
| Unhandled Exception | 500 Internal | Log error + return message |

### Frontend — Feedback System:
- **Success Modal** — แสดงเมื่อบันทึกสำเร็จ (ปิดอัตโนมัติ 2 วิ)
- **Error Modal** — แสดงเมื่อเกิดข้อผิดพลาด (ต้องกดปิด)
- **Confirm Modal** — ถามยืนยันก่อนลบ/ยกเลิก
- **Toast** — แจ้งเตือน Real-time มุมบนขวา
- **Global Loading** — Overlay animation ทุก HTTP request (ไม่ต้องเขียน loading state เอง)

---

## สไลด์ 23: ระบบ Auto-Cleanup

### Background Service ทำงานอัตโนมัติ:
| งาน | ความถี่ | รายละเอียด |
|-----|--------|-----------|
| ลบ Expired Refresh Tokens | ทุก 6 ชม. | ลบ token ที่หมดอายุแล้ว |
| ลบ Expired Customer Sessions | ทุก 6 ชม. | ลบ session ลูกค้าที่หมดอายุ |
| ลบ Notifications เก่า | ทุกวัน 03:00 | ลบแจ้งเตือนเก่ากว่า 7 วัน |

---

## สไลด์ 24: ตัวเลขสำคัญ (Key Metrics)

| เมตริก | ตัวเลข |
|--------|--------|
| **Database Tables** | 38 ตาราง |
| **API Controllers** | 24 ตัว |
| **API Endpoints** | 150+ endpoints |
| **Business Modules (Backend)** | 8 modules |
| **Feature Modules (Client Web)** | 11 modules |
| **Pages (Client Web)** | 32+ หน้า |
| **Dialogs (Client Web)** | 26+ dialogs |
| **Pages (Mobile Web)** | 11 หน้า |
| **Shared Dropdowns** | 22+ ตัว |
| **Shared Components** | 20+ ตัว |
| **Shared Modals/Dialogs** | 10+ ตัว |
| **SignalR Hubs** | 2 (Order + Notification) |
| **Notification Types** | 9 ประเภท |
| **Permission Modules** | 16+ modules |
| **Database Migrations** | 20+ migrations |

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
| Token | สี | ใช้สำหรับ |
|-------|---|---------|
| primary | Orange (#f97316) | ปุ่มหลัก, Header, Accent |
| success | Teal (#14b8a6) | สถานะสำเร็จ, Active |
| danger | Rose (#f43f5e) | สถานะผิดพลาด, ลบ |
| warning | Amber (#f59e0b) | สถานะเตือน |
| info | Sky (#0ea5e9) | ข้อมูล |
| surface | Slate (#f8fafc) | พื้นหลังหน้า |
| surface-dark | Slate (#334155) | ตัวอักษรหลัก |
| surface-sidebar | Slate (#1e293b) | พื้นหลัง Sidebar |

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
