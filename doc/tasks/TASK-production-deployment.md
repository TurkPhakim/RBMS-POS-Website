# TASK: Production Deployment — ขึ้น Server มหาวิทยาลัย

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-25
**วันที่เสร็จ**: -

> เตรียมระบบ deployment สำหรับ RBMS-POS ให้รันบน Server มหาวิทยาลัย (Ubuntu)
> อ้างอิง pattern จากโปรเจค GAMS ที่เคย deploy สำเร็จแล้ว
> รองรับ 2 โหมด: Local Development + Production Server

### สเปค Server จริง (2026-03-25)

| รายการ | ข้อมูล |
|--------|--------|
| IP | `172.16.8.240` (Private) |
| SSH | `turk@172.16.8.240` |
| OS | Ubuntu 24.04.1 LTS |
| CPU | 2 cores (QEMU VM) |
| RAM | 7.8 GB |
| Disk | 15 GB (ว่าง 9.4 GB) — **ค่อนข้างน้อย** |
| Swap | 2 GB |
| เครือข่าย | Internal มอ. (ต้องต่อ WiFi มอ.) |

---

## แผนการทำงาน

### Phase 1 — เอกสาร ✅

| # | Sub-task | สถานะ |
|---|----------|-------|
| 1.1 | สร้าง `doc/deployment/SERVER-INFO-CHECKLIST.md` | ✅ |
| 1.2 | สร้าง `doc/deployment/DEPLOYMENT-GUIDE.md` | ✅ |

### Phase 2 — Deployment Files ✅

| # | Sub-task | สถานะ |
|---|----------|-------|
| 2.1 | สร้าง `Backend-POS/Dockerfile` (.NET 9 multi-stage) | ✅ |
| 2.2 | สร้าง `Frontend-POS/RBMS-POS-Client/Dockerfile` (init container) | ✅ |
| 2.3 | สร้าง `Frontend-POS/RBMS-POS-Mobile-Web/Dockerfile` (init container) | ✅ |
| 2.4 | สร้าง `docker-compose.yml` (Production full stack) | ✅ |
| 2.5 | สร้าง `docker-compose.local.yml` (Local override — HTTP, เปิด ports) | ✅ |
| 2.6 | สร้าง `docker-compose.dev.yml` (Dev เดิม — แค่ SQL+MinIO) | ✅ |
| 2.7 | สร้าง `nginx/nginx.conf` (Production — HTTPS + 2 Frontend + WebSocket) | ✅ |
| 2.8 | สร้าง `nginx/nginx.local.conf` (Local — HTTP only) | ✅ |
| 2.9 | สร้าง `nginx/Dockerfile` (envsubst template) | ✅ |
| 2.10 | อัพเดต `.env.example` (เพิ่ม DOMAIN, JWT, SMTP) | ✅ |
| 2.11 | สร้าง `scripts/init-letsencrypt.sh` (SSL bootstrap) | ✅ |
| 2.12 | สร้าง `scripts/backup.sh` (auto-backup cron) | ✅ |
| 2.13 | สร้าง `.dockerignore` (Backend + Frontend x2) | ✅ |
| 2.14 | สร้าง `nginx/logrotate.conf` | ✅ |

### Phase 3 — ทดสอบ + ปรับแก้ ⬜

| # | Sub-task | สถานะ |
|---|----------|-------|
| 3.1 | แก้ `Program.cs` — ปิด Swagger ใน Production | ⬜ |
| 3.2 | ทดสอบ Local Docker build | ⬜ |
| 3.3 | ทดสอบบน Server จริง | ⬜ |
| 3.4 | ทดสอบ QR Code scan จากมือถือ | ⬜ |

---

## คำสั่งใช้งาน 3 โหมด

```bash
# Dev (SQL+MinIO เดิม — Backend/Frontend รัน native)
docker compose -f docker-compose.dev.yml up -d

# Local Docker test (full stack, HTTP)
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build

# Production server (full stack, HTTPS)
docker compose up -d --build

# อัพเดตโค้ด (ข้อมูลไม่หาย)
git pull && docker compose up -d --build
```

---

## ไฟล์ที่สร้างทั้งหมด

```
RBMS-POS/
├── docker-compose.yml              ← Production (full stack)
├── docker-compose.local.yml        ← Local override (HTTP, open ports)
├── docker-compose.dev.yml          ← Dev เดิม (SQL+MinIO only)
├── .env.example                    ← Template (อัพเดตแล้ว)
├── Backend-POS/
│   ├── Dockerfile                  ← .NET 9 multi-stage build
│   └── .dockerignore
├── Frontend-POS/
│   ├── RBMS-POS-Client/
│   │   ├── Dockerfile              ← Angular 19 init container
│   │   └── .dockerignore
│   └── RBMS-POS-Mobile-Web/
│       ├── Dockerfile              ← Angular 19 init container
│       └── .dockerignore
├── nginx/
│   ├── Dockerfile                  ← Nginx + envsubst
│   ├── nginx.conf                  ← Production (HTTPS + WebSocket)
│   ├── nginx.local.conf            ← Local (HTTP only)
│   └── logrotate.conf              ← Log rotation
├── scripts/
│   ├── init-letsencrypt.sh         ← SSL bootstrap
│   └── backup.sh                   ← Auto-backup cron
└── doc/deployment/
    ├── SERVER-INFO-CHECKLIST.md    ← คำสั่งเก็บข้อมูล server
    └── DEPLOYMENT-GUIDE.md         ← คู่มือ deploy ฉบับสมบูรณ์
```
