# RBMS-POS — ระบบ Point of Sale

> อัพเดตล่าสุด: 2026-03-12

ระบบ Point of Sale (POS) สำหรับจัดการการขาย สินค้าคงคลัง และพนักงาน สร้างด้วย **Angular + ASP.NET Core 9** ในรูปแบบ N-Tier Layered Architecture

---

## เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Frontend** | Angular 19.1, Tailwind CSS 3.4, PrimeNG, Angular Signals, SignalR Client |
| **Backend** | ASP.NET Core 9.0, Entity Framework Core, SignalR |
| **ฐานข้อมูล** | SQL Server |
| **เอกสาร API** | Swagger / OpenAPI (ng-openapi-gen) |

---

## โครงสร้างโปรเจค

```
RBMS-POS/
├── Backend-POS/
│   └── POS.Main/
│       ├── RBMS.POS.WebAPI/              # Controllers, Filters, Hubs, Program.cs
│       ├── POS.Main.Business.Admin/      # Auth, ServiceCharge, File
│       ├── POS.Main.Business.Menu/       # Menu management
│       ├── POS.Main.Business.HumanResource/ # Employee management
│       ├── POS.Main.Business.Authorization/ # Position-Based RBAC, Permissions
│       ├── POS.Main.Repositories/        # Repository interfaces + UnitOfWork
│       ├── POS.Main.Dal/                 # Entities, DbContext, Migrations
│       └── POS.Main.Core/                # Enums, Constants, Exceptions, Helpers
│
├── Frontend-POS/
│   └── RBMS-POS-Client/
│       └── src/app/
│           ├── core/                 # API clients (generated), guards, interceptors
│           ├── shared/               # Shared components, modals, pipes
│           ├── layouts/              # main-layout, auth-layout
│           └── features/             # Feature modules (lazy-loaded)
│
└── doc/                              # เอกสารทั้งหมดของโปรเจค
    ├── agents/                       # AI Agent specs
    ├── architecture/                 # System design, technical architecture
    ├── development/                  # Developer guides, setup, how-to
    ├── features/                     # Feature implementation notes
    ├── tasks/                        # Task tracking
    └── requirements/                 # Business & functional requirements
```

---

## เริ่มต้นใช้งาน

### รัน Backend

```bash
cd Backend-POS/POS.Main/RBMS.POS.WebAPI
dotnet run
```

API + Swagger จะอยู่ที่ `https://localhost:5300/swagger`

### รัน Frontend

```bash
cd Frontend-POS/RBMS-POS-Client
npm install
ng serve
```

เปิดเบราว์เซอร์ที่ `http://localhost:4300`

> ดูขั้นตอนแบบละเอียดได้ที่ [doc/development/quick-start.md](doc/development/quick-start.md)

### บัญชีทดสอบ

| ชื่อผู้ใช้ | รหัสผ่าน | ตำแหน่ง |
|------------|----------|---------|
| `Admin` | `P@ssw0rd` | ผู้ดูแลระบบ (สิทธิ์เต็ม) |

---

## สถาปัตยกรรม

**Backend** ใช้ N-Tier Layered Architecture เรียงตาม dependency direction (ห้ามมี circular reference):

```
WebAPI → Business.* (Services) → Repositories → Dal (EF Core) → Core
```

**Frontend** ใช้ Module-based Angular พร้อม Lazy Loading ทุก Feature Module, Angular Signals สำหรับ state, และ Generated API clients จาก ng-openapi-gen

**Real-time** ใช้ SignalR Hub (Backend) + SignalR Client (Frontend) + Angular Signals สำหรับ real-time updates (Order, Table, Kitchen)

---

## สารบัญเอกสาร

เอกสารทั้งหมดอยู่ในโฟลเดอร์ `doc/`

---

### สถาปัตยกรรมระบบ (`doc/architecture/`)

| เอกสาร | รายละเอียด |
|--------|------------|
| [project-structure.md](doc/architecture/project-structure.md) | โครงสร้างไฟล์จริงทั้งหมด — แยกตาม layer และ module |
| [system-overview.md](doc/architecture/system-overview.md) | ภาพรวม Tech Stack, N-Tier Architecture, Frontend/Backend pattern, Data flow |
| [design-system.md](doc/architecture/design-system.md) | Design System — Color tokens, Typography, Component patterns |
| [icon-system.md](doc/architecture/icon-system.md) | ระบบจัดการ Icon — GenericIconComponent + PrimeIcons, คู่มือเพิ่ม icon ใหม่ |
| [file-management.md](doc/architecture/file-management.md) | สถาปัตยกรรมการจัดการไฟล์ — TbFile Entity, S3 Storage, Upload/Download Flow |
| [database-api-reference.md](doc/architecture/database-api-reference.md) | อ้างอิงฐานข้อมูลและ API — ตารางทั้งหมด, Endpoints, ความสัมพันธ์, Enum |

---

### คู่มือพัฒนา (`doc/development/`)

| เอกสาร | รายละเอียด |
|--------|------------|
| [quick-start.md](doc/development/quick-start.md) | รันโปรเจคครั้งแรก — ขั้นตอนตั้งแต่ต้น: database → backend → frontend |
| [module-development-workflow.md](doc/development/module-development-workflow.md) | End-to-End Workflow 16 ขั้นตอน — Backend → Frontend พร้อม checklist |
| [backend-guide.md](doc/development/backend-guide.md) | คู่มือ Backend — Architecture, Patterns ทุก Layer, 10-Step Workflow, Common Errors |
| [backend-coding-standards.md](doc/development/backend-coding-standards.md) | มาตรฐานโค้ด Backend — DO/DON'T: naming, entity, repo, service, controller, DTO, query |
| [frontend-guidelines.md](doc/development/frontend-guidelines.md) | สถาปัตยกรรม Frontend — Component patterns, Signals, API usage, Tailwind tokens |
| [frontend-coding-standards.md](doc/development/frontend-coding-standards.md) | มาตรฐานโค้ด Frontend — DO/DON'T: Signals, takeUntilDestroyed, forms, routing, tokens |
| [ai-prompting-guide.md](doc/development/ai-prompting-guide.md) | คู่มือใช้ AI Agents — SA→Backend→Frontend workflow, prompt templates |

---

### AI Agent Specs (`doc/agents/`)

| เอกสาร | หน้าที่ |
|--------|---------|
| [system-analyst.md](doc/agents/system-analyst.md) | SA Agent — ออกแบบ Entity, API, DTOs, Business Rules |
| [backend-expert.md](doc/agents/backend-expert.md) | Backend Agent — เขียน/review .NET code ทุก layer |
| [frontend-expert.md](doc/agents/frontend-expert.md) | Frontend Agent — เขียน/review Angular code, Signals, Tailwind, UX/UI Design |
| [code-reviewer.md](doc/agents/code-reviewer.md) | Code Review Agent — 6 priority levels, severity checklist |

---

### บันทึกฟีเจอร์ (`doc/features/`)

| เอกสาร | รายละเอียด |
|--------|------------|
| [project-status.md](doc/features/project-status.md) | สถานะโปรเจคปัจจุบัน — Endpoints ทั้งหมด, สิ่งที่ยังขาด, Priority ถัดไป |

---

### ติดตาม Task งาน (`doc/tasks/`)

| เอกสาร | รายละเอียด |
|--------|------------|
| [README.md](doc/tasks/README.md) | รูปแบบและกฎการใช้งาน Task tracking system |
| [TASK-ui-redesign.md](doc/tasks/TASK-ui-redesign.md) | Task: UI Redesign — กฎ icon, token class, ลำดับการทำ Phase 1-6 |
| [TASK-backend-patterns.md](doc/tasks/TASK-backend-patterns.md) | Task: Reusable Backend Patterns — BaseEntity, Response Models, BaseController, GlobalExceptionFilter (6 Phases) |
| [TASK-file-management.md](doc/tasks/TASK-file-management.md) | Task: File Management System — S3 Storage, TbFile Entity, Menu/Employee Migration (4 Phases) |
| [TASK-fe-layout-redesign.md](doc/tasks/TASK-fe-layout-redesign.md) | Task: Frontend Layout Redesign — main-layout, header, sidebar, breadcrumb, welcome (5 Phases) |
| [TASK-login-redesign.md](doc/tasks/TASK-login-redesign.md) | Task: Login Page Redesign — ปรับหน้า login ให้ตรง design system |
| [TASK-icon-system.md](doc/tasks/TASK-icon-system.md) | Task: Icon System — GenericIconComponent + PrimeIcons, ย้ายจาก `<img>` CSS filter |

---

## เพิ่มเอกสารใหม่

วางไฟล์ตามหมวดหมู่แล้ว **อัปเดตตารางในไฟล์นี้ (README.md) เสมอ**

```
doc/
├── architecture/     ← สถาปัตยกรรม, Technical design
├── development/      ← Setup guides, How-to, คู่มือ Developer
├── features/         ← สรุปฟีเจอร์ที่พัฒนา, Implementation notes
├── agents/           ← AI Agent specs
├── requirements/     ← Business requirements, Functional specs
└── tasks/            ← Task tracking (TASK-{ชื่อ}.md)
```

---

*RBMS-POS v1.0 | Angular 19.1 + ASP.NET Core 9.0 | SQL Server*
