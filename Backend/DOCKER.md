# Docker Deployment Guide — BFSI Digital Banking Backend

## Quick Reference

### Build Image
```bash
docker build -t bfsi-backend .
```

### Run Container (Production)
```bash
docker run -d \
  --name bfsi-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bfsi-app \
  -e JWT_SECRET=<your-production-secret> \
  -e JWT_EXPIRES_IN=7d \
  -e CLIENT_URL=https://yourdomain.com \
  -e API_BASE_URL=https://api.yourdomain.com \
  -e CORS_ORIGIN=https://yourdomain.com \
  bfsi-backend
```

### Run Container (Development)
```bash
docker run -d \
  --name bfsi-backend-dev \
  -p 5000:5000 \
  -e NODE_ENV=development \
  -e PORT=5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/bfsi-app \
  -e JWT_SECRET=dev-secret-key \
  -e CLIENT_URL=http://localhost:5173 \
  -e API_BASE_URL=http://localhost:5000 \
  -e CORS_ORIGIN=http://localhost:5173 \
  bfsi-backend
```

> **Note:** `host.docker.internal` resolves to host machine on Docker Desktop (Windows/Mac). On Linux, use `--network host` or the host IP.

---

## Container Management

| Action | Command |
|--------|---------|
| View logs | `docker logs bfsi-backend` |
| Follow logs | `docker logs -f bfsi-backend` |
| Stop | `docker stop bfsi-backend` |
| Start | `docker start bfsi-backend` |
| Restart | `docker restart bfsi-backend` |
| Remove container | `docker rm -f bfsi-backend` |
| Remove image | `docker rmi bfsi-backend` |
| Shell into container | `docker exec -it bfsi-backend sh` |
| Check health | `docker inspect --format='{{.State.Health.Status}}' bfsi-backend` |

---

## Oracle VM Deployment (Ubuntu + Nginx + HTTPS)

```bash
# 1. Build on VM
docker build -t bfsi-backend .

# 2. Run with MongoDB Atlas
docker run -d \
  --name bfsi-backend \
  --restart unless-stopped \
  -p 127.0.0.1:5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGO_URI="mongodb+srv://<user>:<pass>@cluster.mongodb.net/bfsi-app" \
  -e JWT_SECRET="<strong-secret>" \
  -e CLIENT_URL="https://yourdomain.com" \
  -e API_BASE_URL="https://api.yourdomain.com" \
  -e CORS_ORIGIN="https://yourdomain.com" \
  bfsi-backend

# 3. Nginx reverse proxy config (in /etc/nginx/sites-available/api)
# server {
#     listen 443 ssl;
#     server_name api.yourdomain.com;
#     ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
#     location / {
#         proxy_pass http://127.0.0.1:5000;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }
```

---

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Build Docker Image
  run: docker build -t bfsi-backend ./Backend

- name: Run Tests in Container
  run: |
    docker run --rm \
      -e NODE_ENV=test \
      -e MONGO_URI=${{ secrets.MONGO_URI_TEST }} \
      -e JWT_SECRET=test-secret \
      bfsi-backend npm test
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | production | Environment mode |
| PORT | No | 5000 | Server port |
| MONGO_URI | **Yes** | — | MongoDB connection string |
| JWT_SECRET | **Yes** | — | JWT signing secret |
| JWT_EXPIRES_IN | No | 7d | Token expiry |
| CLIENT_URL | No | http://localhost:5173 | Frontend URL |
| API_BASE_URL | No | http://localhost:5000 | API base URL |
| CORS_ORIGIN | No | http://localhost:5173 | Allowed origins (comma-separated) |
| RATE_LIMIT_WINDOW_MS | No | 60000 | Rate limit window |
| RATE_LIMIT_MAX_REQUESTS | No | 60 | Max requests per window |
| BCRYPT_SALT_ROUNDS | No | 10 | Password hashing rounds |
| SESSION_TIMEOUT_MINUTES | No | 30 | Session timeout |

---

## Troubleshooting

- **Container exits immediately:** Check `docker logs bfsi-backend` — likely missing MONGO_URI or JWT_SECRET
- **Cannot connect to MongoDB:** Ensure Atlas whitelist includes VM IP (or use `0.0.0.0/0` for testing)
- **Port already in use:** Change host port: `-p 3000:5000`
- **CORS errors:** Set `CORS_ORIGIN` to your frontend domain
