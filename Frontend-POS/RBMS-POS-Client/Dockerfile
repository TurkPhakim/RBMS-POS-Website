# ═══════════════════════════════════════════════════════════════
# RBMS-POS Frontend Client — Multi-stage Dockerfile (Angular 19)
# Admin/Staff interface
#
# Pattern: Init container — build → copy to shared volume → exit
# Nginx container mount volume เพื่ออ่าน static files
# ═══════════════════════════════════════════════════════════════

# --- Stage 1: Build ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Override URLs สำหรับ Docker deployment
# apiUrl = '' (relative) เพราะ nginx proxy /api → backend
# selfOrderUrl = '/mobile' (same domain, behind nginx)
# recaptchaSiteKey ใช้ค่าจาก source โดยตรง (ไม่ต้องแก้)
RUN sed -i \
    -e "s|apiUrl: '.*'|apiUrl: ''|" \
    -e "s|selfOrderUrl: '.*'|selfOrderUrl: '/mobile'|" \
    src/environments/environment.prod.ts && \
    echo "=== environment.prod.ts ===" && cat src/environments/environment.prod.ts

RUN npx ng build --configuration=production

# --- Stage 2: Init container ---
FROM alpine:3.19
COPY --from=build /app/dist/rbms-pos-client/browser /dist

# Copy built files to shared volume (/output) then exit
CMD ["sh", "-c", "rm -rf /output/* 2>/dev/null; cp -r /dist/* /output/ && echo '[OK] Frontend Client files ready'"]
