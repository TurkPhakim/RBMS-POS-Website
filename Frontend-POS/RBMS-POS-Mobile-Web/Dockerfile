# ═══════════════════════════════════════════════════════════════
# RBMS-POS Frontend Mobile-Web — Multi-stage Dockerfile (Angular 19)
# Customer self-order interface (QR scan)
#
# Pattern: Init container — build → copy to shared volume → exit
# ═══════════════════════════════════════════════════════════════

# --- Stage 1: Build ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Override environment สำหรับ Docker deployment
# apiUrl = '' (relative) เพราะ nginx proxy /api → backend
RUN printf "export const environment = {\n\
  production: true,\n\
  apiUrl: ''\n\
};\n" > src/environments/environment.prod.ts

RUN npx ng build --configuration=production

# --- Stage 2: Init container ---
FROM alpine:3.19
COPY --from=build /app/dist/rbms-pos-mobile-web/browser /dist

# Copy built files to shared volume (/output) then exit
CMD ["sh", "-c", "rm -rf /output/* 2>/dev/null; cp -r /dist/* /output/ && echo '[OK] Frontend Mobile-Web files ready'"]
