#!/bin/bash
# ============================================================
# FitWebAI — VPS Setup Script (Timeweb Ubuntu)
# Run as root on a fresh VPS
#
# Usage: bash setup-vps.sh
# ============================================================

set -euo pipefail

APP_DIR="/var/www/fitwebai"
REPO_URL="https://github.com/YOUR_USER/demo-site-generator.git"  # <- CHANGE THIS
DOMAIN="fitwebai.ru"
NODE_VERSION="20"

echo "=== FitWebAI VPS Setup ==="

# 1. System packages
echo "[1/8] Installing system packages..."
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-dns-cloudflare build-essential

# 2. Node.js (via nvm)
echo "[2/8] Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node -v), npm: $(npm -v)"

# 3. PM2
echo "[3/8] Installing PM2..."
npm install -g pm2

# 4. Clone repo
echo "[4/8] Cloning repository..."
if [ -d "$APP_DIR" ]; then
  echo "Directory exists, pulling latest..."
  cd "$APP_DIR"
  git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# 5. Install & build Next.js
echo "[5/8] Building Next.js app..."
cd "$APP_DIR"
npm install
npm run build

# 6. Install & build Worker
echo "[6/8] Building Worker..."
cd "$APP_DIR/worker"
npm install
npm run build

# 7. Nginx config
echo "[7/8] Setting up Nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/fitwebai
ln -sf /etc/nginx/sites-available/fitwebai /etc/nginx/sites-enabled/fitwebai
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t
systemctl reload nginx

# 8. PM2 startup
echo "[8/8] Starting PM2 processes..."
cd "$APP_DIR"

# Create logs directory
mkdir -p logs

# Copy .env (must be created manually before first run!)
if [ ! -f .env ]; then
  echo ""
  echo "⚠️  IMPORTANT: Create .env file before starting!"
  echo "   cp .env.example .env && nano .env"
  echo ""
fi

# Start apps
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Create .env:   cp .env.example .env && nano .env"
echo "2. Setup SSL:     bash deploy/setup-ssl.sh"
echo "3. Setup DNS:     Add wildcard A record: *.${DOMAIN} → $(curl -s ifconfig.me)"
echo "4. Run migration: psql or Supabase SQL editor → deploy/migration.sql"
echo "5. Restart:       pm2 restart all"
echo ""
