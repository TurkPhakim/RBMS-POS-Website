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

### Phase 3 — ตั้งค่า Server + Deploy ⬜

| # | Sub-task | สถานะ | คำสั่ง |
|---|----------|-------|--------|
| 3.1 | ติดตั้ง Docker | ✅ | `Docker v29.3.0, Compose v5.1.1` |
| 3.2 | ติดตั้ง Git | ✅ | `git v2.43.0` (มีอยู่แล้ว) |
| 3.3 | Clone โปรเจค | ✅ | `~/www/RBMS-POS/` |
| 3.4 | สร้าง `.env` | ⬜ | `cp .env.example .env && nano .env` |
| 3.5 | สร้าง SSL Certificate (Self-signed) | ⬜ | ดูคำสั่งด้านล่าง |
| 3.6 | Build + Start ทั้งระบบ | ⬜ | `docker compose up -d --build` |
| 3.7 | ลบ build cache (ประหยัด disk) | ⬜ | `docker builder prune -f` |
| 3.8 | ตรวจสอบว่าทุก container รัน | ⬜ | `docker compose ps` |
| 3.9 | ทดสอบเปิดเว็บจากเบราว์เซอร์ | ⬜ | `https://172.16.8.240.nip.io` |
| 3.10 | ทดสอบ QR Code scan จากมือถือ | ⬜ | `https://172.16.8.240.nip.io/mobile` |

### Phase 4 — ปรับแก้โค้ด (ทำทีหลังได้) ⬜

| # | Sub-task | สถานะ |
|---|----------|-------|
| 4.1 | แก้ `Program.cs` — ปิด Swagger ใน Production | ⬜ |
| 4.2 | ตั้ง Firewall (UFW) | ⬜ |
| 4.3 | ตั้ง Backup cron | ⬜ |

---

## Checklist — คำสั่งทีละขั้น (Copy วางใน Server)

> ทำตามลำดับ ทำเสร็จแต่ละขั้นให้เช็ค ✅

### ขั้นที่ 1: สร้าง `.env`

```bash
cd ~/www/RBMS-POS
cp .env.example .env
nano .env
```

**แก้ค่าเหล่านี้ใน `.env`:**

```bash
DOMAIN=172.16.8.240.nip.io
CERTBOT_EMAIL=turkphakim@email.com
MSSQL_SA_PASSWORD=RbmsPos@2026!
SA_PASSWORD=RbmsPos@2026!
JWT_SECRET=ใช้คำสั่ง: openssl rand -base64 48
MINIO_ROOT_USER=rbmsadmin
MINIO_ROOT_PASSWORD=RbmsMinIO@2026!
MSSQL_MEMORY_LIMIT_MB=1024
```

> สร้าง JWT_SECRET ด้วย: `openssl rand -base64 48` แล้ว copy ไปวาง

### ขั้นที่ 2: สร้าง SSL Certificate (Self-signed)

เพราะ Server เป็น Private IP → Let's Encrypt ใช้ไม่ได้ → ใช้ Self-signed แทน

```bash
cd ~/www/RBMS-POS
source .env
docker compose run --rm --entrypoint "" certbot sh -c "\
  mkdir -p /etc/letsencrypt/live/$DOMAIN && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=$DOMAIN'"
```

> Self-signed cert จะแสดง warning ในเบราว์เซอร์ — กด "Advanced" → "Proceed" ได้เลย

### ขั้นที่ 3: Build + Start ทั้งระบบ

```bash
cd ~/www/RBMS-POS
docker compose up -d --build
```

> ครั้งแรกใช้เวลา 5-15 นาที (download images + build)

### ขั้นที่ 4: ลบ build cache (ประหยัด disk)

```bash
docker builder prune -f
```

### ขั้นที่ 5: ตรวจสอบ

```bash
# ดูสถานะทุก container (ต้องขึ้น Up ทุกตัว ยกเว้น frontend-* ที่ Exited 0)
docker compose ps

# ดู logs ถ้ามีปัญหา
docker compose logs -f --tail=30

# ทดสอบ API
curl -k https://localhost/api/health
```

### ขั้นที่ 6: เปิดเบราว์เซอร์ทดสอบ (ต้องต่อ WiFi มอ.)

| หน้า | URL |
|------|-----|
| Client (Admin/พนักงาน) | `https://172.16.8.240.nip.io` |
| Mobile-Web (ลูกค้าสแกน QR) | `https://172.16.8.240.nip.io/mobile` |
| API Health | `https://172.16.8.240.nip.io/api/health` |

> Login: `admin` / `P@ssw0rd`

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
