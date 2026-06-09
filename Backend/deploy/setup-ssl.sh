#!/bin/bash
# ============================================
# BFSI Backend - HTTPS/SSL Setup Script
# ============================================
# Usage: sudo ./setup-ssl.sh <domain>
# Example: sudo ./setup-ssl.sh api.yourdomain.com
#
# Prerequisites:
#   - Nginx installed and running
#   - Domain A record pointing to VM IP
#   - Port 80 open (Oracle Security List + iptables)

set -e

DOMAIN="${1:?Usage: $0 <domain> (e.g. api.yourdomain.com)}"
NGINX_CONF="/etc/nginx/sites-available/bfsi-api"

echo "🔒 Setting up HTTPS for: $DOMAIN"

# 1. Install certbot
echo "📦 Installing certbot..."
apt-get update -qq
apt-get install -y certbot python3-certbot-nginx

# 2. Verify Nginx config
echo "🔍 Verifying Nginx config..."
nginx -t

# 3. Obtain certificate
echo "🔐 Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" --redirect

# 4. Verify certificate
echo "✅ Verifying certificate..."
certbot certificates --domain "$DOMAIN"

# 5. Test auto-renewal
echo "🔄 Testing auto-renewal..."
certbot renew --dry-run

# 6. Setup renewal cron (certbot usually adds this automatically)
if ! crontab -l 2>/dev/null | grep -q certbot; then
    echo "⏰ Adding renewal cron..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
fi

echo ""
echo "============================================"
echo "✅ HTTPS setup complete for $DOMAIN"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Update Nginx config to use HTTPS server block"
echo "  2. Enable HTTP → HTTPS redirect"
echo "  3. sudo nginx -t && sudo systemctl reload nginx"
echo "  4. Update .env.production: API_BASE_URL=https://$DOMAIN"
echo "  5. Restart backend: ./deploy.sh restart"
echo ""
echo "Test: curl https://$DOMAIN/api/health"
