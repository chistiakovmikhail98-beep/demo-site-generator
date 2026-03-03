#!/bin/bash
# ============================================================
# FitWebAI — Wildcard SSL Setup (Let's Encrypt + Cloudflare DNS)
#
# Prerequisites:
# 1. Domain DNS managed by Cloudflare
# 2. Cloudflare API token with Zone:DNS:Edit permission
#
# Usage: bash deploy/setup-ssl.sh
# ============================================================

set -euo pipefail

DOMAIN="fitwebai.ru"
CF_CREDS="/etc/letsencrypt/cloudflare.ini"

echo "=== Wildcard SSL Setup for *.${DOMAIN} ==="

# 1. Install certbot + cloudflare plugin
echo "[1/3] Installing certbot cloudflare plugin..."
apt-get install -y certbot python3-certbot-dns-cloudflare

# 2. Create Cloudflare credentials file
if [ ! -f "$CF_CREDS" ]; then
  echo "[2/3] Creating Cloudflare credentials..."
  echo ""
  echo "Enter your Cloudflare API token (Zone:DNS:Edit):"
  read -r CF_TOKEN

  cat > "$CF_CREDS" << EOF
dns_cloudflare_api_token = ${CF_TOKEN}
EOF
  chmod 600 "$CF_CREDS"
  echo "Credentials saved to ${CF_CREDS}"
else
  echo "[2/3] Cloudflare credentials already exist"
fi

# 3. Request wildcard certificate
echo "[3/3] Requesting wildcard certificate..."
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials "$CF_CREDS" \
  -d "${DOMAIN}" \
  -d "*.${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  --email admin@${DOMAIN}

# Reload nginx
echo "Reloading Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "=== SSL Setup Complete ==="
echo "Certificate: /etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
echo "Auto-renewal: certbot renew (cron already configured)"
echo ""

# Verify auto-renewal timer
systemctl list-timers | grep certbot || echo "Note: Set up certbot cron manually if timer not found"
