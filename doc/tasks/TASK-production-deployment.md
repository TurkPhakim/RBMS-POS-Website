# TASK: Production Deployment — ขึ้น Server มหาวิทยาลัย

**สถานะ**: IN_PROGRESS
**วันที่เริ่ม**: 2026-03-25
**วันที่เสร็จ**: -

> เตรียมระบบ deployment สำหรับ RBMS-POS ให้รันบน Server มหาวิทยาลัย (Ubuntu)
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

### ข้อจำกัดที่พบ

- **nip.io ถูก firewall มอ. บล็อก** → ใช้ IP ตรง `172.16.8.240` แทน
- **Let's Encrypt ใช้ไม่ได้** → ใช้ Self-signed SSL Certificate (เพราะ Private IP)
- **Docker Hub อาจช้า/timeout** → อาจต้อง retry หลายครั้ง

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
| 2.10 | อัพเดต `.env.example` (เพิ่ม DOMAIN, JWT, SMTP, reCAPTCHA) | ✅ |
| 2.11 | สร้าง `scripts/init-letsencrypt.sh` (SSL bootstrap) | ✅ |
| 2.12 | สร้าง `scripts/backup.sh` (auto-backup cron) | ✅ |
| 2.13 | สร้าง `.dockerignore` (Backend + Frontend x2) | ✅ |
| 2.14 | สร้าง `nginx/logrotate.conf` | ✅ |

### Phase 3 — ตั้งค่า Server + Deploy

| # | Sub-task | สถานะ | หมายเหตุ |
|---|----------|-------|----------|
| 3.1 | ติดตั้ง Docker | ✅ | `Docker v29.3.0, Compose v5.1.1` |
| 3.2 | ติดตั้ง Git | ✅ | `git v2.43.0` (มีอยู่แล้ว) |
| 3.3 | Clone โปรเจค | ✅ | `~/www/RBMS-POS/` |
| 3.4 | สร้าง `.env` | ✅ | ดูค่าด้านล่าง |
| 3.5 | สร้าง SSL Certificate (Self-signed) | ✅ | openssl บน host → copy เข้า Docker volume |
| 3.6 | Build + Start ทั้งระบบ | ✅ | ทุก container รันปกติ |
| 3.7 | ลบ build cache (ประหยัด disk) | ⬜ | `docker builder prune -f` |
| 3.8 | ตรวจสอบว่าทุก container รัน | ✅ | backend healthy, nginx up |
| 3.9 | ทดสอบเปิดเว็บจากเบราว์เซอร์ | ✅ | หน้า Login โหลดได้ |
| 3.10 | แก้ reCAPTCHA domain (เปลี่ยนจาก nip.io → IP) | ✅ | เพิ่ม `172.16.8.240` ใน Google Console |
| 3.11 | แก้ Dockerfile ส่ง reCAPTCHA Site Key ตอน build | ✅ | ใช้ Docker ARG |
| 3.12 | Rebuild frontend-client + nginx | ⬜ | รอ push + rebuild |
| 3.13 | ทดสอบ Login สำเร็จ | ⬜ | `admin` / `P@ssw0rd` |
| 3.14 | ทดสอบ Mobile-Web | ⬜ | `https://172.16.8.240/mobile` |
| 3.15 | ทดสอบ SMTP ส่งเมลจริง | ⬜ | ลืมรหัสผ่าน → OTP → email |

### Phase 4 — Security + โค้ดที่แก้ไข ✅

| # | Sub-task | สถานะ | หมายเหตุ |
|---|----------|-------|----------|
| 4.1 | ปิด Swagger ใน Production | ✅ | `Program.cs` — wrap ด้วย `IsDevelopment()` |
| 4.2 | เพิ่ม ForwardedHeaders middleware | ✅ | `Program.cs` — สำหรับ Nginx reverse proxy |
| 4.3 | เพิ่ม Auto-Migration | ✅ | `Program.cs` — `Database.MigrateAsync()` ก่อน seed |
| 4.4 | ล้าง credentials จาก `appsettings.json` | ✅ | SMTP username/password ย้ายไป env vars |
| 4.5 | อัพเดต SMTP App Password ใน dev | ✅ | `appsettings.Development.json` |
| 4.6 | ตั้ง Firewall (UFW) | ⬜ | ยังไม่ได้ทำ |
| 4.7 | ตั้ง Backup cron | ⬜ | ยังไม่ได้ทำ |

---

## Production .env — ค่าปัจจุบัน (2026-03-26)

```bash
# === Domain ===
DOMAIN=172.16.8.240
CERTBOT_EMAIL=turkphakim@gmail.com

# === SQL Server ===
MSSQL_SA_PASSWORD=RbmsPos@2026!
MSSQL_MEMORY_LIMIT_MB=2048
SA_PASSWORD=RbmsPos@2026!

# === JWT ===
JWT_SECRET=1RbH2Sxq+H6KurI/ObL6Km43arVcPRMGID54evs0wGrm6LQqR6R5tomiBuQFx+bL

# === MinIO (S3 Storage) ===
MINIO_ROOT_USER=rbmsadmin
MINIO_ROOT_PASSWORD=RbmsMinIO@2026!
MINIO_BUCKET_NAME=rbms-pos-files

# === SMTP (Gmail App Password) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=turk.phakim.sgn@gmail.com
SMTP_PASSWORD="yykt oijb vwpv zggq"

# === Google reCAPTCHA v2 ===
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=6LeGqZcsAAAAADzfA0Iy-W8n7YG_JlG_D8Jezt6c
RECAPTCHA_SECRET_KEY=6LeGqZcsAAAAAFIqCgrSuJA0bJzDJ_BxLH31w3YS
```

> **หมายเหตุ**: SMTP_PASSWORD ต้องอยู่ในเครื่องหมาย `"..."` เพราะมีช่องว่าง

---

## reCAPTCHA Keys

| ชุด | Site Key | Domain |
|-----|----------|--------|
| **Production** | `6LeGqZcsAAAAADzfA0Iy-W8n7YG_JlG_D8Jezt6c` | `172.16.8.240` |
| **Development** | `6LcWEIosAAAAAImvdkgyCTpnjZ1lDGeXcjth3JAD` | `localhost` |

- Production Secret Key: `6LeGqZcsAAAAAFIqCgrSuJA0bJzDJ_BxLH31w3YS`
- Development Secret Key: `6LcWEIosAAAAAP2ImdqHjW7IP2ItqKoXFwU_A49g`

---

## SSL Certificate

| รายการ | ค่า |
|--------|-----|
| ประเภท | Self-signed (เพราะ Private IP) |
| อายุ | 10 ปี (3650 วัน) |
| ที่อยู่ cert | Docker volume `rbms-pos-certbot-conf` → `/live/172.16.8.240/` |
| ไฟล์ | `fullchain.pem` + `privkey.pem` |

> เบราว์เซอร์จะแสดง warning "Not Secure" — กด Advanced → Proceed ได้เลย (ปกติสำหรับ self-signed)

---

## URL ทดสอบ

| หน้า | URL |
|------|-----|
| Client (Admin/พนักงาน) | `https://172.16.8.240` |
| Mobile-Web (ลูกค้าสแกน QR) | `https://172.16.8.240/mobile` |
| Login credentials | `admin` / `P@ssw0rd` |

> ต้องต่อ WiFi มหาวิทยาลัยถึงจะเข้าถึงได้ (Private network)

---

## ปัญหาที่เจอระหว่าง Deploy (2026-03-26)

### 1. QR Code URL เป็น relative path — มือถือกดลิงค์ไม่ได้
- **สาเหตุ**: `environment.selfOrderUrl = '/mobile'` (Production) → QR แสดง `/mobile/auth?token=...` ซึ่งไม่ใช่ full URL
- **แก้**: เพิ่มตรวจ `startsWith('http')` → ถ้าไม่มี ให้ prepend `window.location.origin`
- **ไฟล์**: `qr-code-dialog.component.ts`

### 2. Dropdown ไม่เต็มความกว้าง
- **สาเหตุ**: PrimeNG `<p-dropdown>` host element เป็น `display: inline` โดย default
- **แก้**: เพิ่ม global CSS: `p-dropdown, p-select { display: block; width: 100%; }`
- **ไฟล์**: `styles.css`

### 3. หน้า Welcome แสดง Section ร้านค้าทั้งที่ไม่มีข้อมูล
- **สาเหตุ**: ShopSettings ถูก seed ด้วย HasData (empty values) → API return object ว่าง → `@if (shopInfo())` เป็น truthy เสมอ
- **แก้**: สร้าง `hasShopData` computed ตรวจว่ามี shopName จริงหรือไม่
- **ไฟล์**: `welcome.component.ts`, `welcome.component.html`

### 4. Backend fail: PendingModelChangesWarning ⚠️
- **สาเหตุ**: ลบ HasData seed positions (2,3) ออกจาก `TbmPositionConfiguration.cs` โดยไม่ได้สร้าง migration ใหม่
- **Error**: `The model for context 'POSMainContext' has pending changes`
- **แก้**: Revert กลับมาเป็น 3 positions เหมือนเดิม (ตรงกับ migration snapshot)
- **ไฟล์**: `TbmPositionConfiguration.cs`
- **บทเรียน**: ถ้าแก้ Entity/HasData/EntityConfiguration → **ต้องสร้าง migration ใหม่** (ด้วย `dotnet ef migrations add`) ก่อน push ขึ้น server เสมอ

---

## คำสั่ง Deploy ที่ใช้บ่อย

### อัพเดตหลัง push โค้ดใหม่

| สถานการณ์ | คำสั่ง |
|-----------|--------|
| **แก้อะไรก็ได้ (ปลอดภัยสุด)** | `git pull && docker compose up -d --build` |
| **แก้แค่ Backend** | `git pull && docker compose up -d --build backend` |
| **แก้แค่ Frontend Client** | `git pull && docker compose up -d --build frontend-client nginx` |
| **แก้แค่ Frontend Mobile** | `git pull && docker compose up -d --build frontend-mobile nginx` |
| **แก้ Frontend ทั้ง 2** | `git pull && docker compose up -d --build frontend-client frontend-mobile nginx` |
| **แก้ Nginx config** | `git pull && docker compose up -d --build nginx` |
| **แก้ .env บน server** | `nano .env && docker compose down && docker compose up -d` |

> **สำคัญ**: rebuild Frontend ต้อง restart nginx ด้วยเสมอ (เพราะ Frontend เป็น init container ที่ copy ไฟล์ไป shared volume)

### คำสั่งทั่วไป

```bash
# ดู logs
docker compose logs -f --tail=50

# ดู logs เฉพาะ backend
docker compose logs backend --tail=50

# ดูสถานะทุก container
docker compose ps

# Restart ทั้งระบบ
docker compose down && docker compose up -d

# ลบ build cache ประหยัด disk
docker builder prune -f

# ดู disk ที่เหลือ
df -h
```

---

## ไฟล์ที่สร้าง/แก้ไขทั้งหมด

```
RBMS-POS/
├── docker-compose.yml              ← Production (+ reCAPTCHA site key ARG)
├── docker-compose.local.yml        ← Local override (HTTP, open ports)
├── docker-compose.dev.yml          ← Dev เดิม (SQL+MinIO only)
├── .env.example                    ← Template (SMTP + reCAPTCHA)
├── Backend-POS/
│   ├── Dockerfile                  ← .NET 9 multi-stage build
│   ├── .dockerignore
│   └── POS.Main/RBMS.POS.WebAPI/
│       ├── Program.cs              ← +ForwardedHeaders, +Swagger dev-only, +MigrateAsync
│       ├── appsettings.json        ← ล้าง SMTP credentials (ใช้ env vars)
│       └── appsettings.Development.json ← อัพเดต SMTP App Password
├── Frontend-POS/
│   ├── RBMS-POS-Client/
│   │   ├── Dockerfile              ← +ARG RECAPTCHA_SITE_KEY
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
