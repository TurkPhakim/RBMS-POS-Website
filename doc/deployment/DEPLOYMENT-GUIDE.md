# RBMS-POS — Deployment Guide

> คู่มือการ deploy RBMS-POS ขึ้น Server จริง (มหาวิทยาลัย)
> อ้างอิง pattern จากโปรเจค GAMS ที่ deploy สำเร็จแล้ว
> รองรับ 2 โหมด: **Local Development** + **Production Server**

---

## สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [โหมด Local vs Production](#2-โหมด-local-vs-production)
3. [โครงสร้างไฟล์ Deployment](#3-โครงสร้างไฟล์-deployment)
4. [ข้อกังวลเรื่องข้อมูล — git pull แล้วข้อมูลหายไหม?](#4-ข้อกังวลเรื่องข้อมูล)
5. [ขั้นตอน: ตั้งค่า Server ครั้งแรก](#5-ตั้งค่า-server-ครั้งแรก)
6. [ขั้นตอน: Deploy ครั้งแรก](#6-deploy-ครั้งแรก)
7. [ขั้นตอน: อัพเดตโค้ด (ใช้ประจำ)](#7-อัพเดตโค้ด)
8. [ขั้นตอน: รัน Local Development](#8-รัน-local-development)
9. [การจัดการ SSL Certificate](#9-ssl-certificate)
10. [Backup + Recovery](#10-backup--recovery)
11. [Security Hardening](#11-security-hardening)
12. [Troubleshooting](#12-troubleshooting)
13. [คำสั่งที่ใช้บ่อย](#13-คำสั่งที่ใช้บ่อย)

---

## 1. ภาพรวมระบบ

### Architecture บน Server

```
                    Internet / เครือข่ายมอ.
                            │
                   ┌────────▼─────────┐
                   │   Nginx Container │  ← port 80 (HTTP redirect)
                   │   (Reverse Proxy) │  ← port 443 (HTTPS + SSL)
                   └──┬─────┬─────┬───┘
                      │     │     │
        ┌─────────────┘     │     └──────────────┐
        │                   │                    │
   ┌────▼──────┐     ┌─────▼──────┐     ┌──────▼──────┐
   │  Frontend  │     │  Frontend   │     │   Backend   │
   │  Client    │     │  Mobile-Web │     │  .NET 9     │
   │  (static)  │     │  (static)   │     │  :5000      │
   │  Admin/    │     │  ลูกค้า     │     │             │
   │  พนักงาน   │     │  สแกน QR    │     │  SignalR    │
   └────────────┘     └─────────────┘     └──────┬──────┘
                                                 │
                      ┌──────────────────────────┤
                      │                          │
               ┌──────▼──────┐           ┌──────▼──────┐
               │  SQL Server  │           │    MinIO    │
               │  2022        │           │  (S3 Files) │
               │  :1433       │           │  :9000      │
               │  (internal)  │           │  (internal) │
               └──────────────┘           └─────────────┘
```

### Services ทั้งหมด (Docker Containers)

| Service | Image | Port (internal) | Port (exposed) | หน้าที่ |
|---------|-------|----------------|----------------|---------|
| **nginx** | nginx:stable-alpine | 80, 443 | **80, 443** | Reverse proxy + SSL + Static files |
| **backend** | .NET 9 (build เอง) | 5000 | - (internal) | API + SignalR |
| **sqlserver** | mssql/server:2022 | 1433 | - (internal) | Database |
| **minio** | minio/minio | 9000, 9001 | - (internal) | File storage (รูปภาพ, เอกสาร) |
| **minio-init** | minio/mc | - | - | สร้าง bucket อัตโนมัติ (รันครั้งเดียว) |
| **certbot** | certbot/certbot | - | - | Auto-renew SSL ทุก 12 ชั่วโมง |

> **Port ที่เปิดสู่ภายนอก: 80 + 443 เท่านั้น** — ที่เหลือเป็น internal Docker network

---

## 2. โหมด Local vs Production

### ความแตกต่าง

| รายการ | Local Development | Production Server |
|--------|------------------|-------------------|
| **วิธีรัน** | `docker compose -f docker-compose.yml -f docker-compose.local.yml up` | `docker compose up` |
| **Protocol** | HTTP (ไม่มี SSL) | HTTPS (Let's Encrypt) |
| **Domain** | `localhost` | `{IP}.nip.io` |
| **Frontend URL** | `http://localhost` (Client), `http://localhost/mobile` (Mobile) | `https://{IP}.nip.io`, `https://{IP}.nip.io/mobile` |
| **API URL** | `http://localhost/api` | `https://{IP}.nip.io/api` |
| **Swagger** | เปิด (`/swagger`) | **ปิด** (security) |
| **DB Port** | เปิด :1433 (เข้าจาก host ได้) | **ปิด** (internal only) |
| **MinIO Console** | เปิด :9001 (จัดการ files) | **ปิด** (internal only) |
| **Certbot** | ปิด (sleep) | เปิด (auto-renew 12 ชม.) |
| **Security Headers** | ไม่มี | HSTS, X-Frame-Options, etc. |

### ทำไมต้อง 2 โหมด?

- **Local**: ใช้ทดสอบ Docker build บนเครื่องตัวเอง ก่อน push ขึ้น server
- **Production**: ใช้บน server จริง มี SSL, security headers, ปิด port ที่ไม่จำเป็น
- **ไฟล์โค้ดเดียวกัน** — แค่สลับ compose file ที่ใช้

---

## 3. โครงสร้างไฟล์ Deployment

```
RBMS-POS/
├── docker-compose.yml              ← Production (ตัวหลัก)
├── docker-compose.local.yml        ← Local override (HTTP, เปิด ports)
├── .env.example                    ← Template สำหรับ environment variables
├── .env                            ← ค่าจริง (ห้ามเข้า git!)
│
├── Backend-POS/
│   ├── Dockerfile                  ← Multi-stage build (.NET 9)
│   └── .dockerignore
│
├── Frontend-POS/
│   ├── RBMS-POS-Client/
│   │   ├── Dockerfile              ← Multi-stage build (Angular 19)
│   │   └── .dockerignore
│   └── RBMS-POS-Mobile-Web/
│       ├── Dockerfile              ← Multi-stage build (Angular 19)
│       └── .dockerignore
│
├── nginx/
│   ├── nginx.conf                  ← Production (HTTPS + reverse proxy)
│   ├── nginx.local.conf            ← Local (HTTP only)
│   └── logrotate.conf              ← Log rotation (14 วัน)
│
└── scripts/
    ├── init-letsencrypt.sh         ← สร้าง SSL cert ครั้งแรก
    └── backup.sh                   ← Backup database + files
```

---

## 4. ข้อกังวลเรื่องข้อมูล

### git pull แล้วข้อมูลหายไหม?

**ไม่หาย** — เพราะ Docker แยก "โค้ด" กับ "ข้อมูล" ออกจากกัน:

```
สิ่งที่อยู่ใน Git (โค้ด)              สิ่งที่อยู่ใน Docker Volume (ข้อมูล)
─────────────────────────           ───────────────────────────────────
├── source code                     ├── sqlserver-data (ข้อมูลทั้งหมด)
├── Dockerfile                      ├── minio-data (รูปภาพ, ไฟล์)
├── docker-compose.yml              ├── certbot-conf (SSL certificates)
├── nginx config                    └── nginx-logs (log files)
└── .env.example
                                    ↑ ข้อมูลเหล่านี้ไม่ถูกลบ
                                      แม้ rebuild container ใหม่
```

### Flow การอัพเดต (ปลอดภัย)

```
เครื่อง Dev                          Server Production
───────────                          ──────────────────
1. แก้โค้ด
2. ทดสอบ Local
3. git push ──────────────────────► 4. git pull
                                    5. docker compose up --build -d
                                       ├── rebuild container ใหม่ (โค้ดใหม่)
                                       └── volume เดิม (ข้อมูลไม่หาย)
                                    6. ใช้งานได้เลย ข้อมูลครบ
```

### อะไรบ้างที่ **จะ** ถูกแทนที่เมื่อ rebuild?

| รายการ | ถูกแทนที่? | คำอธิบาย |
|--------|----------|---------|
| Source code (.NET, Angular) | ใช่ | นี่คือจุดประสงค์ — อัพเดตโค้ดใหม่ |
| Database records | **ไม่** | อยู่ใน Docker volume `sqlserver-data` |
| รูปภาพ/ไฟล์ที่อัพโหลด | **ไม่** | อยู่ใน Docker volume `minio-data` |
| SSL certificates | **ไม่** | อยู่ใน Docker volume `certbot-conf` |
| .env (secrets) | **ไม่** | อยู่นอก git ไม่ถูก pull ทับ |
| nginx.conf | ใช่ | ถ้าแก้ config ใน git จะถูกอัพเดต |

### ข้อควรระวัง

> **ห้ามใช้ `docker compose down -v`** — flag `-v` จะ **ลบ volumes ทั้งหมด** (ข้อมูลหาย!)
> ใช้ `docker compose down` (ไม่มี `-v`) เมื่อต้องการหยุด service

> **ห้ามใช้ `docker system prune -a --volumes`** — จะลบทุกอย่างรวม volumes

---

## สเปค Server จริง (อัพเดต 2026-03-25)

| รายการ | ข้อมูล |
|--------|--------|
| IP | `172.16.8.240` (Private — เครือข่ายมอ.) |
| SSH | `turk@172.16.8.240` |
| OS | Ubuntu 24.04.1 LTS |
| CPU | 2 cores (QEMU VM) |
| RAM | 7.8 GB |
| Disk | 15 GB (ว่าง 9.4 GB) |
| Swap | 2 GB |

> ⚠️ Disk ค่อนข้างน้อย — ต้อง `docker builder prune -f` หลัง build ทุกครั้ง

---

## โครงสร้างโฟลเดอร์บน Server

```
/home/turk/                         ← Home directory
├── www/                            ← Web projects
│   └── RBMS-POS/                   ← git clone มาที่นี่
│       ├── .env                    ← Environment variables (ห้ามเข้า git)
│       ├── docker-compose.yml      ← Production compose
│       ├── Backend-POS/            ← .NET 9 source code
│       ├── Frontend-POS/           ← Angular 19 source code (x2)
│       ├── nginx/                  ← Nginx config
│       ├── scripts/                ← Backup, SSL scripts
│       └── doc/                    ← เอกสาร
│
├── backup/                         ← Backup files
│   └── rbms-pos/
│       └── daily/                  ← backup อัตโนมัติ (เก็บ 7 วัน)
│           ├── db_20260325_020000.bak.gz
│           └── minio_20260325_020000.tar.gz
│
└── (Docker volumes — จัดการโดย Docker)
    ├── rbms-pos_sqlserver-data      ← ข้อมูล Database ทั้งหมด
    ├── rbms-pos_minio-data          ← รูปภาพ/ไฟล์ที่อัพโหลด
    ├── rbms-pos_certbot-conf        ← SSL certificates
    ├── rbms-pos_certbot-www         ← ACME challenge files
    ├── rbms-pos_client-dist         ← Frontend Client (static)
    ├── rbms-pos_mobile-dist         ← Frontend Mobile (static)
    └── rbms-pos_nginx-logs          ← Nginx access/error logs
```

### คำอธิบาย

| โฟลเดอร์ | เก็บอะไร | ใครจัดการ | หายเมื่อ git pull? |
|----------|---------|----------|-------------------|
| `~/www/RBMS-POS/` | Source code ทั้งหมด | Git | **ใช่** (อัพเดตโค้ดใหม่) |
| `~/www/RBMS-POS/.env` | Secrets, passwords | เราแก้เอง | **ไม่** (ไม่อยู่ใน git) |
| `~/backup/rbms-pos/` | Backup files | cron script | **ไม่** (อยู่นอก project) |
| Docker volumes | Database, files, certs | Docker | **ไม่** (แยกจาก code) |

---

## 5. ตั้งค่า Server ครั้งแรก

> ทำครั้งเดียว — หลังจากนี้ใช้แค่ `git pull` + `docker compose up`

### Step 1: ติดตั้ง Docker Engine

```bash
# ถอนของเก่า (ถ้ามี)
sudo apt-get remove docker docker-engine docker.io containerd runc 2>/dev/null

# ติดตั้ง prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# เพิ่ม Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# เพิ่ม Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# ติดตั้ง Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# ให้ user ปัจจุบันใช้ docker ได้โดยไม่ต้อง sudo
sudo usermod -aG docker $USER
newgrp docker

# ทดสอบ
docker --version
docker compose version
```

### Step 2: ติดตั้ง Git (ถ้ายังไม่มี)

```bash
sudo apt-get install -y git
git --version
```

### Step 3: ตั้งค่า UFW Firewall

```bash
# ตั้งค่า default
sudo ufw default deny incoming
sudo ufw default allow outgoing

# เปิด port ที่ต้องใช้
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect → HTTPS)
sudo ufw allow 443/tcp   # HTTPS

# เปิดใช้งาน
sudo ufw enable
sudo ufw status
```

### Step 4: Clone โปรเจค

```bash
# สร้าง directory
mkdir -p ~/www
cd ~/www

# Clone
git clone https://github.com/{YOUR_USERNAME}/RBMS-POS.git
cd RBMS-POS
```

### Step 5: สร้าง `.env`

```bash
# Copy template
cp .env.example .env

# แก้ไขค่า
nano .env
```

**ค่าที่ต้องแก้ใน `.env`:**

```bash
# === Domain ===
# ถ้าไม่มี domain จริง ใช้ nip.io:
# เช่น IP = 161.246.199.200 → DOMAIN=161.246.199.200.nip.io
DOMAIN=___YOUR_IP___.nip.io
CERTBOT_EMAIL=your-email@example.com

# === Database ===
MSSQL_SA_PASSWORD=___STRONG_PASSWORD___     # อย่างน้อย 8 ตัว มี A-Z, a-z, 0-9, สัญลักษณ์

# === JWT ===
JWT_SECRET=___RANDOM_64_CHARS___            # สร้างด้วย: openssl rand -base64 48

# === MinIO (S3 Storage) ===
MINIO_ROOT_USER=___YOUR_MINIO_USER___
MINIO_ROOT_PASSWORD=___YOUR_MINIO_PASS___
MINIO_BUCKET_NAME=rbms-pos-files

# === SMTP (ถ้าใช้ email) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=___YOUR_EMAIL___
SMTP_PASSWORD=___APP_PASSWORD___
```

### Step 6: สร้าง SSL Certificate

**Option A: มี internet + port 80/443 เปิดรับจากภายนอก (ใช้ Let's Encrypt)**

```bash
chmod +x scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh
```

**Option B: Internal network / port ถูก block (ใช้ Self-signed)**

```bash
source .env
docker compose run --rm --entrypoint "" certbot sh -c "
    mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj '/CN=$DOMAIN'
"
```

> Self-signed cert จะแสดง warning ในเบราว์เซอร์ แต่ใช้งานได้ (กด "Advanced" → "Proceed")

### Step 7: Build + Start ทั้งระบบ

```bash
docker compose up -d --build
```

> ครั้งแรกจะใช้เวลา 5-15 นาที (download images + build .NET + build Angular)

### Step 8: ตรวจสอบ

```bash
# ดูสถานะทุก container
docker compose ps

# ดู logs
docker compose logs -f --tail=50

# ทดสอบ health
curl -k https://localhost/api/health
```

**URLs:**
- Client (Admin/พนักงาน): `https://{DOMAIN}`
- Mobile-Web (ลูกค้าสแกน QR): `https://{DOMAIN}/mobile`
- API: `https://{DOMAIN}/api`

---

## 6. Deploy ครั้งแรก

> สรุปขั้นตอนทั้งหมดเรียงลำดับ (สำหรับ copy ตามทีละขั้น)

```bash
# === 1. ติดตั้ง Docker (ถ้ายังไม่มี) ===
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

# === 2. Firewall ===
sudo ufw default deny incoming && sudo ufw default allow outgoing
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw --force enable

# === 3. Clone ===
mkdir -p ~/www && cd ~/www
git clone https://github.com/{YOUR_USERNAME}/RBMS-POS.git
cd RBMS-POS

# === 4. Environment ===
cp .env.example .env
nano .env    # แก้ค่าทุกตัว!

# === 5. SSL (เลือก Option A หรือ B) ===
# Option A: Let's Encrypt
chmod +x scripts/init-letsencrypt.sh && ./scripts/init-letsencrypt.sh

# Option B: Self-signed
source .env && docker compose run --rm --entrypoint "" certbot sh -c "mkdir -p /etc/letsencrypt/live/$DOMAIN && openssl req -x509 -nodes -newkey rsa:2048 -days 3650 -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem -subj '/CN=$DOMAIN'"

# === 6. Build + Start ===
docker compose up -d --build

# === 7. ตรวจสอบ ===
docker compose ps
curl -k https://localhost/api/health
```

---

## 7. อัพเดตโค้ด

> ใช้ทุกครั้งที่แก้โค้ดบนเครื่อง dev แล้วต้องการอัพเดต server

### สิ่งสำคัญที่ต้องเข้าใจ

- **`git pull` อย่างเดียวไม่พอ** — `git pull` แค่ดึงโค้ดใหม่มาที่ server แต่ตัวแอพยังทำงานจาก Docker image เดิม
- **ต้อง `docker compose up -d --build` ทุกครั้ง** — เพื่อให้ Docker สร้าง image ใหม่จากโค้ดที่ pull มา
- **Frontend เป็น init container** — build Angular → copy static files ไป shared volume → Nginx serve จาก volume นั้น ดังนั้นเมื่อ rebuild frontend ต้อง **restart nginx ด้วย** เพื่อให้ใช้ไฟล์ใหม่

### วิธีอัพเดต (ข้อมูลไม่หาย)

```bash
cd ~/www/RBMS-POS

# 1. ดึงโค้ดใหม่
git pull origin main

# 2. Rebuild + restart (เฉพาะ container ที่มีการเปลี่ยน)
docker compose up -d --build

# 3. ตรวจสอบ
docker compose ps
docker compose logs -f --tail=20
```

> `--build` จะ rebuild เฉพาะ image ที่ Dockerfile/source code เปลี่ยน
> Container ที่ไม่เปลี่ยน (เช่น sqlserver, minio) จะไม่ถูก restart

### แก้ตรงไหน → ต้อง rebuild อะไร

| แก้โค้ดตรงไหน | คำสั่งที่ต้องรัน | หมายเหตุ |
|---------------|-----------------|---------|
| **แก้อะไรก็ได้ (ไม่แน่ใจ)** | `git pull && docker compose up -d --build` | ปลอดภัยที่สุด — rebuild ทุกอย่าง |
| **Backend** (.NET code) | `git pull && docker compose up -d --build backend` | auto-migrate ตอน startup |
| **Frontend Client** (Angular) | `git pull && docker compose up -d --build frontend-client nginx` | ต้อง restart nginx ด้วย เพราะ init container copy ไฟล์ไป shared volume |
| **Frontend Mobile-Web** (Angular) | `git pull && docker compose up -d --build frontend-mobile nginx` | เหมือนกัน — ต้อง restart nginx |
| **Frontend ทั้ง 2 ตัว** | `git pull && docker compose up -d --build frontend-client frontend-mobile nginx` | |
| **Nginx config** (`nginx/`) | `git pull && docker compose up -d --build nginx` | |
| **Backend + Frontend ทั้งหมด** | `git pull && docker compose up -d --build backend frontend-client frontend-mobile nginx` | |
| **docker-compose.yml** | `git pull && docker compose up -d --build` | เปลี่ยน compose config ต้อง rebuild ทั้งหมด |
| **แก้ `.env` บน server** | `nano .env && docker compose down && docker compose up -d` | ต้อง down ก่อนเพื่อให้อ่าน env ใหม่ |

### ข้อผิดพลาดที่พบบ่อย

| ทำอะไร | ผลลัพธ์ | ทำไม |
|--------|---------|------|
| `git pull` อย่างเดียว | แอพยังเป็นเวอร์ชันเดิม | Docker image ไม่ได้ build ใหม่ |
| `git pull` + restart nginx | Frontend เดิม, Backend เดิม | Nginx serve ไฟล์จาก volume เดิม ต้อง rebuild frontend container |
| rebuild frontend ไม่ restart nginx | อาจได้ไฟล์เก่า | Init container copy ไฟล์ไป volume แต่ nginx อาจ cache ไว้ |
| ลบ HasData seed ใน EF แล้ว build | Backend fail (PendingModelChangesWarning) | ต้องสร้าง migration ใหม่ก่อน หรือ revert การเปลี่ยน |

### ขั้นตอนมาตรฐานหลังอัพเดต

```bash
cd ~/www/RBMS-POS

# 1. ดึงโค้ดใหม่
git pull origin main

# 2. Rebuild ทุกอย่าง
docker compose up -d --build

# 3. ตรวจสอบสถานะ
docker compose ps

# 4. ถ้า backend unhealthy → ดู logs
docker compose logs backend --tail=50

# 5. ลบ build cache (ประหยัด disk — server มี disk น้อย)
docker builder prune -f

# 6. ตรวจสอบ disk ที่เหลือ
df -h
```

### กรณีต้องรัน Database Migration

Backend มี **auto-migrate** (`Database.MigrateAsync()`) ตอน startup อยู่แล้ว — ไม่ต้องรัน migration ด้วยมือ

> **ข้อควรระวัง**: ถ้าแก้ Entity/HasData แล้วไม่ได้สร้าง migration ใหม่ (ด้วย `dotnet ef migrations add`) → Backend จะ fail ด้วย `PendingModelChangesWarning` เพราะ model ไม่ตรงกับ migration snapshot ล่าสุด — **ต้องสร้าง migration บนเครื่อง dev ก่อน push ขึ้น server**

### กรณีต้องเปลี่ยน `.env`

```bash
# แก้ .env
nano .env

# Restart ทั้งหมด (ให้อ่าน env ใหม่)
docker compose down && docker compose up -d
```

> **จำไว้**: `.env` ไม่อยู่ใน git — แก้ที่ server โดยตรง

---

## 8. รัน Local Development

> ใช้ทดสอบ Docker build บนเครื่อง dev ก่อน push ขึ้น server

### วิธีรัน Local (Windows/Mac)

```bash
cd D:\RBMS-POS

# สร้าง .env (ถ้ายังไม่มี)
cp .env.example .env
# แก้ .env: DOMAIN=localhost

# รัน Local mode (HTTP, ไม่มี SSL, เปิด ports ทั้งหมด)
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

### URLs ใน Local mode

| Service | URL |
|---------|-----|
| Client (Admin/พนักงาน) | `http://localhost` |
| Mobile-Web (ลูกค้า) | `http://localhost/mobile` |
| API | `http://localhost/api` |
| Swagger | `http://localhost/api/swagger` |
| MinIO Console | `http://localhost:9001` |

### หยุด Local

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml down
```

### กลับไปใช้ dev mode ปกติ (ไม่ใช้ Docker)

```bash
# หยุด Docker containers
docker compose -f docker-compose.yml -f docker-compose.local.yml down

# รัน dev แบบเดิม (แยก terminal)
# Terminal 1: docker compose up -d (แค่ SQL Server + MinIO)
# Terminal 2: cd Backend-POS/POS.Main/RBMS.POS.WebAPI && dotnet run
# Terminal 3: cd Frontend-POS/RBMS-POS-Client && npx ng serve
# Terminal 4: cd Frontend-POS/RBMS-POS-Mobile-Web && npx ng serve
```

---

## 9. SSL Certificate

### nip.io คืออะไร?

nip.io เป็น wildcard DNS service ฟรี ที่แปลง IP → domain อัตโนมัติ:

```
161.246.199.200.nip.io  →  resolves to  →  161.246.199.200
10.0.0.5.nip.io         →  resolves to  →  10.0.0.5
```

ทำให้ใช้ Let's Encrypt ได้แม้ไม่มี domain จริง (เพราะ Let's Encrypt ไม่ออก cert ให้ IP โดยตรง)

### เงื่อนไขที่ต้องมีสำหรับ Let's Encrypt

- Server ต้องเข้าถึงได้จาก internet (port 80)
- nip.io ต้อง resolve ได้ (ต้องมี DNS ที่ทำงาน)
- ถ้า firewall มอ. block port 80 จากภายนอก → ใช้ self-signed cert แทน

### Renew Certificate

Let's Encrypt cert มีอายุ 90 วัน — Certbot container auto-renew ให้ทุก 12 ชั่วโมง

ตรวจสอบ cert:

```bash
# ดูวันหมดอายุ
docker compose exec certbot certbot certificates

# Force renew (ถ้าจำเป็น)
docker compose exec certbot certbot renew --force-renewal
docker compose exec nginx nginx -s reload
```

---

## 10. Backup + Recovery

### Auto-Backup (ตั้ง cron)

```bash
# สร้าง script
chmod +x scripts/backup.sh

# ตั้ง cron (ทุกคืน 02:00)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/www/RBMS-POS/scripts/backup.sh >> /var/log/rbms-backup.log 2>&1") | crontab -
```

### Manual Backup

```bash
# Backup Database
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C \
    -Q "BACKUP DATABASE [RBMS_POS] TO DISK = '/var/opt/mssql/backup/RBMS_POS_$(date +%Y%m%d).bak'"

# Backup MinIO files
docker run --rm -v rbms-pos-minio-data:/data -v $(pwd)/backup:/backup \
    alpine tar czf /backup/minio-$(date +%Y%m%d).tar.gz /data
```

### Recovery

```bash
# Restore Database
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C \
    -Q "RESTORE DATABASE [RBMS_POS] FROM DISK = '/var/opt/mssql/backup/RBMS_POS_YYYYMMDD.bak' WITH REPLACE"
```

---

## 11. Security Hardening

### SSH Hardening

```bash
# แก้ SSH config
sudo nano /etc/ssh/sshd_config

# เปลี่ยนค่า:
PermitRootLogin no
PasswordAuthentication no        # ใช้ SSH key เท่านั้น
MaxAuthTries 3

# Restart SSH
sudo systemctl restart sshd
```

> **ก่อนปิด PasswordAuthentication** ต้อง setup SSH key ก่อน!

### Fail2Ban (กัน brute force)

```bash
sudo apt-get install -y fail2ban

# สร้าง config
sudo tee /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Auto Security Updates

```bash
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 12. Troubleshooting

### Container ไม่ขึ้น

```bash
# ดู logs ของ container ที่มีปัญหา
docker compose logs backend --tail=50
docker compose logs sqlserver --tail=50

# ดู status
docker compose ps

# Restart container เดียว
docker compose restart backend
```

### Backend fail: PendingModelChangesWarning

```
Unhandled exception. System.InvalidOperationException:
The model for context 'POSMainContext' has pending changes.
Add a new migration before updating the database.
```

**สาเหตุ**: แก้ Entity, HasData, หรือ EntityConfiguration บน dev แล้ว push ขึ้น server โดยไม่ได้สร้าง migration ใหม่

**วิธีแก้**:
1. กลับไปเครื่อง dev
2. สร้าง migration: `dotnet ef migrations add {Name} --project POS.Main/POS.Main.Dal --startup-project POS.Main/RBMS.POS.WebAPI`
3. Push ขึ้น git
4. ที่ server: `git pull && docker compose up -d --build`

**หรือ**: ถ้าไม่ต้องการสร้าง migration → revert การเปลี่ยน Entity/HasData ให้ตรงกับ migration snapshot ล่าสุด

### Database ไม่ connect

```bash
# ตรวจสอบว่า sqlserver พร้อม
docker compose exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1"

# ดู logs
docker compose logs sqlserver --tail=30
```

### Port ถูกใช้อยู่

```bash
# ดูว่า port ไหนถูกใช้
sudo ss -tlnp | grep -E ':(80|443|1433|9000) '

# ถ้า GAMS ใช้อยู่ ต้องหยุดก่อน
cd ~/www/GAMS-Project && docker compose down
```

### Build ช้า / ค้าง

```bash
# ลบ Docker build cache
docker builder prune -f

# Rebuild จากศูนย์
docker compose build --no-cache
docker compose up -d
```

### SSL cert ไม่ทำงาน

```bash
# ตรวจสอบ cert
docker compose exec nginx ls -la /etc/letsencrypt/live/

# ดู nginx error
docker compose logs nginx --tail=30

# Test nginx config
docker compose exec nginx nginx -t
```

---

## 13. คำสั่งที่ใช้บ่อย

### ทั่วไป

```bash
# Start ทั้งระบบ
docker compose up -d

# หยุดทั้งระบบ (ข้อมูลไม่หาย)
docker compose down

# ดู status
docker compose ps

# ดู logs (real-time)
docker compose logs -f --tail=50

# ดู logs ของ service เดียว
docker compose logs -f backend --tail=50
```

### อัพเดต

```bash
# อัพเดตโค้ด + rebuild
git pull origin main && docker compose up -d --build

# อัพเดตเฉพาะ backend
docker compose up -d --build backend

# อัพเดตเฉพาะ frontend
docker compose up -d --build frontend-client frontend-mobile
```

### Debug

```bash
# เข้าไปใน container
docker compose exec backend bash
docker compose exec sqlserver bash
docker compose exec nginx sh

# ดู disk usage
docker system df

# ลบ images/cache ที่ไม่ใช้
docker system prune -f
```

### ฉุกเฉิน

```bash
# Restart ทั้งหมด
docker compose down && docker compose up -d

# Rebuild จากศูนย์ (ไม่ลบข้อมูล)
docker compose down && docker compose build --no-cache && docker compose up -d

# ⚠️ ลบข้อมูลทั้งหมด (ระวัง!)
# docker compose down -v    # ← ลบ volumes ด้วย (ข้อมูลหาย!)
```
