#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# RBMS-POS — Auto Backup Script
# ═══════════════════════════════════════════════════════════════
# Backup: SQL Server database + MinIO files
# เก็บ 7 วัน ลบอัตโนมัติ
#
# ตั้ง cron:
#   (crontab -l 2>/dev/null; echo "0 2 * * * $HOME/www/RBMS-POS/scripts/backup.sh >> /var/log/rbms-backup.log 2>&1") | crontab -

set -e

# Config
BACKUP_DIR="${HOME}/backup/rbms-pos"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="${HOME}/www/RBMS-POS"

# อ่าน .env
source "${PROJECT_DIR}/.env"

# สร้าง directory
mkdir -p "${BACKUP_DIR}/daily"

echo "[$(date)] Starting RBMS-POS backup..."

# 1. Backup SQL Server
echo "  Backing up database..."
docker compose -f "${PROJECT_DIR}/docker-compose.yml" exec -T sqlserver \
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C \
    -Q "BACKUP DATABASE [RBMS_POS] TO DISK = '/var/opt/mssql/backup_temp.bak' WITH INIT"

# Copy backup file out of container
docker compose -f "${PROJECT_DIR}/docker-compose.yml" cp \
    sqlserver:/var/opt/mssql/backup_temp.bak "${BACKUP_DIR}/daily/db_${DATE}.bak"

# Compress
gzip "${BACKUP_DIR}/daily/db_${DATE}.bak"
echo "  Database backup: db_${DATE}.bak.gz"

# 2. Backup MinIO data
echo "  Backing up MinIO files..."
docker run --rm \
    -v rbms-pos-minio-data:/data:ro \
    -v "${BACKUP_DIR}/daily:/backup" \
    alpine tar czf "/backup/minio_${DATE}.tar.gz" -C /data .
echo "  MinIO backup: minio_${DATE}.tar.gz"

# 3. ลบ backup เก่ากว่า N วัน
echo "  Cleaning old backups (>${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}/daily" -type f -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup complete!"
echo "  Location: ${BACKUP_DIR}/daily/"
ls -lh "${BACKUP_DIR}/daily/" | tail -5
