#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# RBMS-POS — Let's Encrypt SSL Certificate Bootstrap
# ═══════════════════════════════════════════════════════════════
# รันครั้งเดียวตอน deploy ครั้งแรก
# อ้างอิงจาก GAMS Project init-letsencrypt.sh
#
# วิธีใช้:
#   chmod +x scripts/init-letsencrypt.sh
#   ./scripts/init-letsencrypt.sh

set -e

# อ่านค่าจาก .env
if [ ! -f .env ]; then
    echo "ERROR: .env file not found! Copy from .env.example first."
    exit 1
fi
source .env

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost" ]; then
    echo "ERROR: DOMAIN must be set in .env (not localhost)"
    echo "Example: DOMAIN=161.246.199.200.nip.io"
    exit 1
fi

if [ -z "$CERTBOT_EMAIL" ] || [ "$CERTBOT_EMAIL" = "your-email@example.com" ]; then
    echo "ERROR: CERTBOT_EMAIL must be set in .env"
    exit 1
fi

echo "========================================="
echo "  RBMS-POS SSL Certificate Setup"
echo "========================================="
echo "Domain: $DOMAIN"
echo "Email:  $CERTBOT_EMAIL"
echo ""

# Step 1: สร้าง self-signed cert ชั่วคราว (ให้ nginx start ได้)
echo "[1/4] Creating temporary self-signed certificate..."
docker compose run --rm --entrypoint "" certbot sh -c "
    mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj '/CN=$DOMAIN'
"

# Step 2: Start nginx กับ cert ชั่วคราว
echo "[2/4] Starting nginx with temporary certificate..."
docker compose up -d nginx
sleep 5

# Step 3: ลบ cert ชั่วคราว แล้วขอ cert จริงจาก Let's Encrypt
echo "[3/4] Requesting real certificate from Let's Encrypt..."
docker compose run --rm --entrypoint "" certbot sh -c "
    rm -rf /etc/letsencrypt/live/$DOMAIN && \
    rm -rf /etc/letsencrypt/archive/$DOMAIN && \
    rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf && \
    certbot certonly --webroot -w /var/www/certbot \
        --email $CERTBOT_EMAIL \
        -d $DOMAIN \
        --agree-tos \
        --no-eff-email \
        --force-renewal
"

# Step 4: Reload nginx กับ cert จริง
echo "[4/4] Reloading nginx with real certificate..."
docker compose exec nginx nginx -s reload

echo ""
echo "========================================="
echo "  SSL Certificate installed successfully!"
echo "========================================="
echo ""
echo "  https://$DOMAIN"
echo ""
echo "  Certificate auto-renews every 12 hours"
echo "  via certbot container."
echo ""
