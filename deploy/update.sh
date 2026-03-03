#!/bin/bash
# ============================================================
# FitWebAI — Quick update script (run on VPS after git push)
#
# Usage: bash deploy/update.sh
# ============================================================

set -euo pipefail

APP_DIR="/var/www/fitwebai"
cd "$APP_DIR"

echo "=== FitWebAI Update ==="

# Pull latest code
echo "[1/4] Pulling latest code..."
git pull

# Rebuild Next.js
echo "[2/4] Building Next.js..."
npm install --production=false
npm run build

# Rebuild Worker
echo "[3/4] Building Worker..."
cd worker
npm install --production=false
npm run build
cd ..

# Restart PM2 processes
echo "[4/4] Restarting PM2..."
pm2 restart all

echo ""
echo "=== Update Complete ==="
pm2 status
