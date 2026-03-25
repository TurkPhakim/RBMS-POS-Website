# Server Info Checklist — ข้อมูลที่ต้องเก็บจาก Server

> เอกสารนี้ใช้สำหรับเก็บข้อมูล Server มหาวิทยาลัยก่อนเริ่ม deploy RBMS-POS
> **วิธีใช้**: SSH เข้า server แล้ว copy คำสั่งไปวางทีละบล็อก → เอา output กลับมาให้

---

## 1. ข้อมูลการเชื่อมต่อ (กรอกเอง)

```
IP Address ของ Server     : ___________________
SSH Port                   : ___________________ (ปกติ 22)
SSH Username               : ___________________
วิธี Login                 : [ ] Password  [ ] SSH Key
OS ที่ติดตั้ง               : ___________________ (เช่น Ubuntu 22.04)
Server อยู่ในเครือข่าย      : [ ] Public (เข้าจาก internet ได้)  [ ] Internal (ต้องต่อ VPN/อยู่ในมอ.)
มี Domain Name หรือไม่      : [ ] มี: ___________________  [ ] ไม่มี (ใช้ nip.io)
```

---

## 2. ข้อมูล Hardware + OS (รันคำสั่งใน Server)

### 2.1 OS + Kernel

```bash
echo "=== OS Info ===" && cat /etc/os-release | head -5 && echo "" && echo "=== Kernel ===" && uname -r && echo "" && echo "=== Architecture ===" && uname -m
```

### 2.2 CPU

```bash
echo "=== CPU ===" && nproc && echo "cores" && lscpu | grep "Model name"
```

### 2.3 RAM

```bash
echo "=== RAM (MB) ===" && free -m | head -2
```

### 2.4 Disk

```bash
echo "=== Disk ===" && df -h / && echo "" && echo "=== Total Disk ===" && lsblk -d -o NAME,SIZE,TYPE | grep disk
```

### 2.5 รวมทุกอย่างในคำสั่งเดียว (Copy อันนี้อันเดียวก็พอ)

```bash
echo "========================================="
echo "  RBMS-POS — Server Info Collection"
echo "========================================="
echo ""
echo "--- OS ---"
cat /etc/os-release | head -4
echo ""
echo "--- Kernel + Arch ---"
uname -r && uname -m
echo ""
echo "--- CPU ---"
echo "Cores: $(nproc)"
lscpu | grep "Model name" 2>/dev/null || echo "(ไม่พบข้อมูล CPU model)"
echo ""
echo "--- RAM (MB) ---"
free -m | head -2
echo ""
echo "--- Disk ---"
df -h / | tail -1
echo ""
echo "--- IP Address ---"
hostname -I 2>/dev/null || ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
echo ""
echo "--- Hostname ---"
hostname
echo ""
echo "========================================="
```

---

## 3. ตรวจสอบ Software ที่ติดตั้งแล้ว

```bash
echo "========================================="
echo "  Software Check"
echo "========================================="
echo ""
echo "--- Docker ---"
docker --version 2>/dev/null || echo "NOT INSTALLED"
echo ""
echo "--- Docker Compose ---"
docker compose version 2>/dev/null || docker-compose --version 2>/dev/null || echo "NOT INSTALLED"
echo ""
echo "--- Git ---"
git --version 2>/dev/null || echo "NOT INSTALLED"
echo ""
echo "--- UFW (Firewall) ---"
sudo ufw status 2>/dev/null || echo "NOT INSTALLED"
echo ""
echo "--- Fail2Ban ---"
fail2ban-client --version 2>/dev/null || echo "NOT INSTALLED"
echo ""
echo "--- Certbot ---"
certbot --version 2>/dev/null || echo "NOT INSTALLED (ไม่เป็นไร ใช้ Docker แทน)"
echo ""
echo "========================================="
```

---

## 4. ตรวจสอบ Network + Port

```bash
echo "========================================="
echo "  Network Check"
echo "========================================="
echo ""
echo "--- Ports ที่เปิดอยู่ ---"
sudo ss -tlnp 2>/dev/null || sudo netstat -tlnp 2>/dev/null || echo "ต้องติดตั้ง net-tools"
echo ""
echo "--- Firewall Rules ---"
sudo ufw status verbose 2>/dev/null || sudo iptables -L -n 2>/dev/null | head -20 || echo "ไม่มี firewall"
echo ""
echo "--- Public IP (ถ้ามี) ---"
curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "ไม่สามารถเข้าถึง internet หรือเป็น internal network"
echo ""
echo "========================================="
```

---

## 5. ตรวจสอบ Docker (ถ้ามีติดตั้งแล้ว)

```bash
echo "========================================="
echo "  Docker Check"
echo "========================================="
echo ""
echo "--- Docker Status ---"
sudo systemctl is-active docker 2>/dev/null || echo "Docker service not found"
echo ""
echo "--- Docker Containers ที่รันอยู่ ---"
docker ps 2>/dev/null || echo "ไม่มีสิทธิ์ docker หรือไม่ได้ติดตั้ง"
echo ""
echo "--- Docker Images ---"
docker images 2>/dev/null || echo "ไม่มีสิทธิ์"
echo ""
echo "--- Docker Volumes ---"
docker volume ls 2>/dev/null || echo "ไม่มีสิทธิ์"
echo ""
echo "--- Docker Disk Usage ---"
docker system df 2>/dev/null || echo "ไม่มีสิทธิ์"
echo ""
echo "========================================="
```

---

## 6. ตรวจสอบ User + Permission

```bash
echo "========================================="
echo "  User + Permission Check"
echo "========================================="
echo ""
echo "--- Current User ---"
whoami
echo ""
echo "--- User Groups ---"
groups
echo ""
echo "--- Sudo Access ---"
sudo -l 2>/dev/null | head -10 || echo "ไม่มีสิทธิ์ sudo"
echo ""
echo "--- Docker Group ---"
getent group docker 2>/dev/null || echo "ไม่มี docker group"
echo ""
echo "--- Home Directory ---"
ls -la ~ | head -5
echo ""
echo "--- Disk Space in Home ---"
du -sh ~ 2>/dev/null || echo "ไม่สามารถคำนวณได้"
echo ""
echo "========================================="
```

---

## 7. ทดสอบ Internet + nip.io (สำคัญสำหรับ SSL)

```bash
echo "========================================="
echo "  Internet + nip.io Test"
echo "========================================="
echo ""
echo "--- DNS Resolution ---"
MY_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $MY_IP"
echo "nip.io domain: $MY_IP.nip.io"
echo ""
echo "--- nip.io DNS Test ---"
nslookup $MY_IP.nip.io 2>/dev/null || dig +short $MY_IP.nip.io 2>/dev/null || echo "ไม่มี nslookup/dig (ติดตั้งด้วย: sudo apt install dnsutils)"
echo ""
echo "--- Internet Test ---"
curl -s --connect-timeout 5 -o /dev/null -w "HTTP Status: %{http_code}\n" https://acme-v02.api.letsencrypt.org/directory 2>/dev/null || echo "ไม่สามารถเข้าถึง Let's Encrypt (อาจต้องใช้ self-signed cert)"
echo ""
echo "--- Port 80 + 443 (inbound test) ---"
echo "ทดสอบจากเครื่องอื่น: curl http://$MY_IP.nip.io"
echo "ถ้าเข้าไม่ได้ = port ถูก block โดย firewall มอ."
echo ""
echo "========================================="
```

---

## 8. ตรวจสอบ GAMS (ถ้ายังรันอยู่บน server เดียวกัน)

```bash
echo "========================================="
echo "  GAMS Project Check"
echo "========================================="
echo ""
echo "--- GAMS Containers ---"
docker ps --filter "name=gams" 2>/dev/null || echo "ไม่มี GAMS containers"
echo ""
echo "--- GAMS Volumes ---"
docker volume ls --filter "name=gams" 2>/dev/null || echo "ไม่มี GAMS volumes"
echo ""
echo "--- GAMS Port Usage ---"
sudo ss -tlnp | grep -E ':(80|443|3000|3306) ' 2>/dev/null || echo "ไม่พบ"
echo ""
echo "========================================="
echo ""
echo "*** ถ้า GAMS ใช้ port 80/443 อยู่ ต้องหยุด GAMS ก่อน deploy RBMS-POS ***"
echo "*** หรือใช้ server คนละเครื่อง ***"
echo ""
```

---

## สรุป — ข้อมูลจริงจาก Server (อัพเดต 2026-03-25)

| รายการ | ข้อมูล |
|--------|--------|
| IP Address | `172.16.8.240` (Private — ต้องอยู่ในเครือข่ายมอ.) |
| SSH | `turk@172.16.8.240` port 22 (Password) |
| Hostname | `turkserver` |
| OS + Version | **Ubuntu 24.04.1 LTS** (Noble Numbat) |
| CPU | **2 cores** — QEMU Virtual CPU v2.5+ (VM) |
| RAM | **7.8 GB** (ใช้อยู่ ~420MB, ว่าง ~7.3GB) |
| Swap | 2.0 GB |
| Disk (/) | **15 GB** (ใช้ 4.5GB, ว่าง **9.4GB**) |
| Disk (/boot) | 2.0 GB (ใช้ 102MB) |
| Docker ติดตั้งแล้ว? | ❌ ยังไม่ได้เช็ค |
| Git ติดตั้งแล้ว? | ❌ ยังไม่ได้เช็ค |
| Sudo access? | ✅ ใช่ |
| Internet access? | ❌ ยังไม่ได้เช็ค |
| nip.io resolve ได้? | ❌ ยังไม่ได้เช็ค |
| Let's Encrypt เข้าถึงได้? | ❌ ยังไม่ได้เช็ค |
| Port 80/443 ว่าง? | ❌ ยังไม่ได้เช็ค |
| Server เดียวกับ GAMS? | ไม่ (เครื่องใหม่, GAMS อยู่ที่ 161.246.199.200) |
| มี Domain Name? | ไม่ (ใช้ `172.16.8.240.nip.io`) |

### ⚠️ ข้อจำกัดที่ต้องระวัง

1. **Disk เหลือ 9.4GB — ค่อนข้างน้อยสำหรับ Docker**
   - SQL Server image: ~1.5GB
   - .NET build layer: ~1.5GB (runtime ~200MB)
   - Node.js build layer: ~1GB (เก็บแค่ static files)
   - MinIO + Nginx: ~300MB
   - Build cache: ~2-3GB (ลบได้หลัง build)
   - **รวม: ใช้ ~4-5GB** → เหลือ ~4GB สำหรับ data + backup
   - **แนะนำ**: ลบ build cache หลัง build ด้วย `docker builder prune -f`

2. **Private IP (172.16.x.x)** — เข้าถึงจากภายนอกมอ.ไม่ได้
   - Let's Encrypt อาจใช้ไม่ได้ (ต้อง port 80 เปิดรับจาก internet)
   - อาจต้องใช้ **Self-signed certificate** แทน
   - QR Code scan ต้องอยู่ในเครือข่ายมอ.เดียวกัน

3. **RAM 7.8GB — เพียงพอ** แต่ต้อง limit SQL Server
   - ตั้ง `MSSQL_MEMORY_LIMIT_MB=1024` ใน `.env`

> ข้อมูลเหล่านี้ใช้กำหนด config ใน `.env`, `nginx.conf`, และ `docker-compose.yml`
