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

# Override environment.ts สำหรับ Docker deployment
# หมายเหตุ: โปรเจคไม่มี fileReplacements ใน angular.json
# ดังนั้น production build ใช้ environment.ts โดยตรง (ไม่ใช่ environment.prod.ts)
RUN sed -i \
    -e "s|production: false|production: true|" \
    -e "s|apiUrl: '.*'|apiUrl: ''|" \
    -e "s|selfOrderUrl: '.*'|selfOrderUrl: '/mobile'|" \
    -e "s|recaptchaSiteKey: '.*'|recaptchaSiteKey: '6LeGqZcsAAAAADzfA0Iy-W8n7YG_JlG_D8Jezt6c'|" \
    src/environments/environment.ts && \
    echo "=== environment.ts ===" && cat src/environments/environment.ts

RUN npx ng build --configuration=production

# --- Stage 2: Init container ---
FROM alpine:3.19
COPY --from=build /app/dist/rbms-pos-client/browser /dist

# Copy built files to shared volume (/output) then exit
CMD ["sh", "-c", "rm -rf /output/* 2>/dev/null; cp -r /dist/* /output/ && echo '[OK] Frontend Client files ready'"]
