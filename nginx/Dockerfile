# ═══════════════════════════════════════════════════════════════
# RBMS-POS — Nginx Container (Reverse Proxy + Static Files)
# ═══════════════════════════════════════════════════════════════

FROM nginx:stable-alpine

# Install envsubst (gettext) for template processing
RUN apk add --no-cache gettext

# Copy nginx config templates (production + local)
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY nginx.local.conf /etc/nginx/nginx.local.conf

EXPOSE 80 443

# Default: Production mode — replace ${DOMAIN} in template then start
CMD ["/bin/sh", "-c", "envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
