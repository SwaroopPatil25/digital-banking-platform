# Oracle VM Backend Deployment Guide

Complete guide to deploy BFSI Digital Banking Backend on Oracle Free VM.

---

## Prerequisites

- Oracle Cloud Free Tier VM (Ubuntu 22.04+)
- SSH access to VM
- MongoDB Atlas cluster with connection string
- Domain name pointing to VM IP (for HTTPS later)
- Vercel frontend URL (for CORS)

---

## 1. Initial VM Setup

```bash
# SSH into VM
ssh -i <your-key.pem> ubuntu@<VM_PUBLIC_IP>

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git ufw
```

---

## 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER

# Apply group change (or logout/login)
newgrp docker

# Verify
docker --version
```

---

## 3. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo nginx -t
```

---

## 4. Configure Firewall

```bash
# Oracle VM uses iptables by default. Allow required ports:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Save rules
sudo netfilter-persistent save

# Also ensure Oracle Cloud Security List allows:
#   - Port 80 (HTTP)
#   - Port 443 (HTTPS)
#   - Port 22 (SSH) — already open
# Do NOT expose port 5000 publicly (Nginx proxies it internally)
```

> **IMPORTANT:** Go to Oracle Cloud Console → Networking → Virtual Cloud Networks → Security Lists → Add Ingress Rules for ports 80 and 443.

---

## 5. Clone Repository

```bash
# Create app directory
sudo mkdir -p /opt/bfsi-backend
sudo chown $USER:$USER /opt/bfsi-backend

# Clone
cd /opt/bfsi-backend
git clone <your-repo-url> .

# Navigate to backend
cd Backend
```

> If monorepo: `git clone <repo> /opt/bfsi-backend && cd /opt/bfsi-backend/Backend`

---

## 6. Configure Production Environment

```bash
# Create production env file
cp deploy/.env.production.template .env.production

# Edit with actual values
nano .env.production
```

**Required changes:**
- `MONGO_URI` → Your MongoDB Atlas connection string
- `JWT_SECRET` → Generate: `openssl rand -base64 64`
- `COOKIE_SECRET` → Generate: `openssl rand -base64 32`
- `CLIENT_URL` → Your Vercel frontend URL (e.g., `https://myapp.vercel.app`)
- `CORS_ORIGIN` → Same as CLIENT_URL
- `API_BASE_URL` → Your API domain (e.g., `https://api.myapp.com`) or `http://<VM_IP>` temporarily

**MongoDB Atlas Setup:**
1. Go to Atlas → Network Access → Add IP: `<VM_PUBLIC_IP>/32`
2. Or use `0.0.0.0/0` temporarily (restrict later)
3. Ensure database user has readWrite access

---

## 7. Build and Deploy

```bash
# Make deploy script executable
chmod +x deploy/deploy.sh

# Build Docker image
./deploy/deploy.sh build

# Start container
./deploy/deploy.sh start

# Check health
./deploy/deploy.sh health
```

---

## 8. Configure Nginx

```bash
# Copy Nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/bfsi-api

# Edit: replace api.yourdomain.com with your domain (or VM IP for testing)
sudo nano /etc/nginx/sites-available/bfsi-api

# Enable site
sudo ln -sf /etc/nginx/sites-available/bfsi-api /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

**For testing without domain:** Replace `server_name api.yourdomain.com;` with `server_name _;` or your VM IP.

---

## 9. Verify Deployment

```bash
# Check container running
docker ps

# Check health endpoint
curl http://127.0.0.1:5000/api/health

# Check via Nginx
curl http://localhost/api/health

# Check from outside (replace with VM IP)
curl http://<VM_PUBLIC_IP>/api/health
```

Expected response:
```json
{"success":true,"message":"Server is running","environment":"production","timestamp":"..."}
```

---

## 10. Enable HTTPS (After Domain Setup)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (domain must point to VM IP first)
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

After certbot:
1. Uncomment HTTPS server block in `/etc/nginx/sites-available/bfsi-api`
2. Uncomment HTTP→HTTPS redirect
3. Update `.env.production`: `API_BASE_URL=https://api.yourdomain.com`
4. Restart container: `./deploy/deploy.sh restart`

---

## 11. Management Commands

| Task | Command |
|------|---------|
| View logs | `./deploy/deploy.sh logs` |
| Restart | `./deploy/deploy.sh restart` |
| Stop | `./deploy/deploy.sh stop` |
| Full redeploy | `./deploy/deploy.sh deploy` |
| Health check | `./deploy/deploy.sh health` |
| Container status | `./deploy/deploy.sh status` |
| Manual logs | `docker logs --tail 100 bfsi-backend` |
| Shell into container | `docker exec -it bfsi-backend sh` |

---

## 12. Auto-Recovery

The `--restart unless-stopped` flag ensures:
- Container restarts on crash
- Container starts on VM reboot
- Only manual `docker stop` prevents restart

Verify after VM reboot:
```bash
sudo reboot
# After reconnect:
docker ps  # Container should be running
```

---

## 13. Update Deployment

```bash
cd /opt/bfsi-backend/Backend
./deploy/deploy.sh deploy
```

This runs: `git pull` → `stop` → `build` → `start` → `health`

---

## 14. Future: GitHub Actions Auto-Deploy

Add these secrets to GitHub repo settings:
- `ORACLE_VM_HOST` → VM public IP
- `ORACLE_VM_USER` → `ubuntu` (or your SSH user)
- `ORACLE_VM_SSH_KEY` → Private SSH key content

The deploy job in `.github/workflows/backend-ci.yml` is pre-configured (commented out). Uncomment when ready.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Container won't start | `docker logs bfsi-backend` — check for missing env vars |
| MongoDB connection refused | Check Atlas IP whitelist, verify MONGO_URI |
| 502 Bad Gateway (Nginx) | Container not running or wrong port — `docker ps` |
| CORS errors in browser | Ensure `CORS_ORIGIN` matches exact frontend URL |
| Port 80/443 not reachable | Check Oracle Security List ingress rules |
| Certbot fails | Ensure domain A record points to VM IP, port 80 open |
| Container restarts loop | `docker logs bfsi-backend` — likely env or Mongo issue |

---

## Architecture

```
Internet
    │
    ▼
┌──────────────────────┐
│ Oracle Cloud Security │  (Ports 80, 443 open)
│ List / Firewall       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Nginx (port 80/443)  │  SSL termination + reverse proxy
└──────────┬───────────┘
           │ proxy_pass http://127.0.0.1:5000
           ▼
┌──────────────────────┐
│ Docker Container      │  Node.js backend (port 5000, internal only)
│ (bfsi-backend)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ MongoDB Atlas         │  Cloud database (external)
└──────────────────────┘
```
