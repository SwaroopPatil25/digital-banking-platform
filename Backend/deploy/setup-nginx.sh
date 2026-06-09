#!/bin/bash
# ============================================
# BFSI Backend - Nginx Setup Script
# ============================================
# Usage: sudo ./setup-nginx.sh
# Run once on Oracle VM after initial deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔧 Setting up Nginx for BFSI Backend..."

# 1. Install proxy params snippet
echo "📄 Installing proxy-params snippet..."
cp "$SCRIPT_DIR/proxy-params.conf" /etc/nginx/snippets/proxy-params.conf

# 2. Install site config
echo "📄 Installing site config..."
cp "$SCRIPT_DIR/nginx.conf" /etc/nginx/sites-available/bfsi-api

# 3. Enable site
echo "🔗 Enabling site..."
ln -sf /etc/nginx/sites-available/bfsi-api /etc/nginx/sites-enabled/

# 4. Remove default site
rm -f /etc/nginx/sites-enabled/default

# 5. Test config
echo "🔍 Testing Nginx config..."
nginx -t

# 6. Reload
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "✅ Nginx configured successfully"
echo ""
echo "Next steps:"
echo "  1. Edit /etc/nginx/sites-available/bfsi-api"
echo "     Replace 'api.yourdomain.com' with your actual domain"
echo "  2. sudo nginx -t && sudo systemctl reload nginx"
echo "  3. Test: curl http://<VM_IP>/api/health"
echo "  4. For HTTPS: sudo ./setup-ssl.sh api.yourdomain.com"
