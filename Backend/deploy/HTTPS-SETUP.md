# Domain + HTTPS Setup Guide

Complete guide for configuring custom domain, DNS, Nginx reverse proxy, and HTTPS for BFSI backend.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      INTERNET                           │
└───────────┬─────────────────────────────┬───────────────┘
            │                             │
            ▼                             ▼
┌───────────────────────┐   ┌─────────────────────────────┐
│ Vercel (Frontend)     │   │ Oracle VM (Backend)         │
│ yourdomain.com        │   │ api.yourdomain.com          │
│ www.yourdomain.com    │   │                             │
│                       │   │ ┌─────────────────────────┐ │
│ Next/React App        │   │ │ Nginx (443/80)          │ │
│ Calls api.* for data  │   │ │ SSL termination         │ │
│                       │   │ │ Rate limiting           │ │
└───────────────────────┘   │ │ Security headers        │ │
                            │ └───────────┬─────────────┘ │
                            │             │ proxy_pass     │
                            │             ▼               │
                            │ ┌─────────────────────────┐ │
                            │ │ Docker (127.0.0.1:5000) │ │
                            │ │ Node.js Express API     │ │
                            │ └───────────┬─────────────┘ │
                            └─────────────┼───────────────┘
                                          │
                                          ▼
                            ┌─────────────────────────────┐
                            │ MongoDB Atlas (Cloud)       │
                            └─────────────────────────────┘
```

---

## 1. DNS Configuration

### Domain Provider Setup (Namecheap, GoDaddy, Cloudflare, etc.)

| Record | Type | Name | Value | TTL |
|--------|------|------|-------|-----|
| Frontend | CNAME | `@` | `cname.vercel-dns.com` | Auto |
| Frontend | CNAME | `www` | `cname.vercel-dns.com` | Auto |
| Backend | A | `api` | `<ORACLE_VM_PUBLIC_IP>` | 300 |

> **Note:** If using Cloudflare, set the `api` record to "DNS only" (gray cloud) initially so certbot can verify directly. Enable proxy (orange cloud) after SSL is working if desired.

### Verify DNS

```bash
# From local machine (Windows/Mac/Linux)
nslookup api.yourdomain.com
# Should return your Oracle VM IP

# Or
ping api.yourdomain.com
```

Wait for DNS propagation (usually 5-30 minutes, up to 48 hours).

---

## 2. Vercel Frontend Configuration

In Vercel Dashboard:
1. Settings → Domains → Add `yourdomain.com` and `www.yourdomain.com`
2. Vercel provides the CNAME target automatically

In your frontend code, set API base URL:
```
VITE_API_URL=https://api.yourdomain.com
```

---

## 3. Oracle VM — Nginx Setup

```bash
ssh ubuntu@<VM_IP>
cd /opt/bfsi-backend/Backend

# Run Nginx setup
sudo chmod +x deploy/setup-nginx.sh deploy/setup-ssl.sh
sudo ./deploy/setup-nginx.sh

# Edit config with your actual domain
sudo nano /etc/nginx/sites-available/bfsi-api
# Replace all "api.yourdomain.com" with your real domain

# Reload
sudo nginx -t && sudo systemctl reload nginx

# Test HTTP (before HTTPS)
curl http://<VM_IP>/api/health
```

---

## 4. SSL/HTTPS Setup

**Prerequisites:**
- Domain `api.yourdomain.com` A record points to VM IP ✓
- Port 80 open in Oracle Security List ✓
- Nginx running and serving HTTP ✓

```bash
# Run SSL setup
sudo ./deploy/setup-ssl.sh api.yourdomain.com
```

This will:
1. Install certbot
2. Obtain Let's Encrypt certificate
3. Auto-configure Nginx for HTTPS
4. Set up auto-renewal cron

---

## 5. Enable HTTPS in Nginx Config

After certbot succeeds, edit `/etc/nginx/sites-available/bfsi-api`:

1. **Uncomment** the HTTPS server block
2. **Uncomment** the HTTP → HTTPS redirect block
3. **Comment out** (or remove) the plain HTTP server block

```bash
sudo nano /etc/nginx/sites-available/bfsi-api
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. Update Backend Environment

```bash
nano /opt/bfsi-backend/Backend/.env.production
```

Update:
```env
CLIENT_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

Restart container:
```bash
cd /opt/bfsi-backend/Backend
./deploy/deploy.sh restart
```

---

## 7. Verify Full Production Flow

```bash
# Health check via HTTPS
curl https://api.yourdomain.com/api/health

# Expected:
# {"success":true,"message":"Server is running","environment":"production","timestamp":"..."}

# Verify HTTPS redirect
curl -I http://api.yourdomain.com
# Expected: 301 redirect to https://

# Check SSL certificate
echo | openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com 2>/dev/null | openssl x509 -noout -dates
```

---

## 8. Frontend ↔ Backend Verification Checklist

| Feature | Endpoint | Verify |
|---------|----------|--------|
| Health | GET /api/health | 200 OK |
| Register | POST /api/auth/register | Creates user |
| Login | POST /api/auth/login | Returns JWT |
| Dashboard | GET /api/dashboard | Auth required, returns data |
| Accounts | GET /api/account | Auth required |
| Transfers | POST /api/transfer | Auth required |
| Beneficiaries | GET /api/beneficiaries | Auth required |
| Bills | GET /api/bills | Auth required |
| Transactions | GET /api/transactions | Auth required |
| Statements | GET /api/statement | Auth required |
| Notifications | GET /api/notifications | Auth required |
| Activity | GET /api/activity | Auth required |

Test from browser console:
```javascript
fetch('https://api.yourdomain.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 9. Security Checklist

| Item | Status |
|------|--------|
| HTTPS enforced (HTTP redirects) | After certbot |
| HSTS header (2 years) | In HTTPS block |
| X-Frame-Options: DENY | ✅ |
| X-Content-Type-Options: nosniff | ✅ |
| X-XSS-Protection | ✅ |
| Referrer-Policy | ✅ |
| Permissions-Policy | ✅ |
| Content-Security-Policy | In HTTPS block |
| Rate limiting (API: 10r/s) | ✅ |
| Rate limiting (Auth: 3r/s) | ✅ |
| Gzip compression | ✅ |
| Request size limit (10MB) | ✅ |
| Non-API paths blocked (404) | ✅ |
| Backend port not exposed publicly | ✅ (127.0.0.1 only) |
| SSL protocols (TLS 1.2+) | In HTTPS block |
| OCSP stapling | In HTTPS block |
| Session tickets disabled | In HTTPS block |

---

## 10. Auto SSL Renewal

Certbot auto-renewal is configured:
- Cron runs daily at 3 AM
- Automatically renews certificates expiring within 30 days
- Reloads Nginx after renewal

Verify:
```bash
sudo certbot renew --dry-run
```

---

## 11. Troubleshooting

| Issue | Fix |
|-------|-----|
| Certbot "could not connect" | DNS not pointing to VM, or port 80 blocked |
| 502 Bad Gateway | Backend container not running: `docker ps` |
| Mixed content warnings | Frontend calling `http://` instead of `https://` |
| CORS blocked | `CORS_ORIGIN` doesn't match exact frontend URL |
| Certificate expired | `sudo certbot renew` — check cron is active |
| Nginx won't start | `sudo nginx -t` for syntax errors |
| Rate limit errors (429) | Normal for brute force; adjust in nginx.conf if needed |
