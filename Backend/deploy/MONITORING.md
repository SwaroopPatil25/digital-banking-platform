# Production Monitoring & Backup Guide

---

## Health Check Endpoints

| Endpoint | Purpose | Auth | Response |
|----------|---------|------|----------|
| `GET /api/health` | Full health (monitoring dashboards) | None | Server, Mongo, memory, uptime |
| `GET /api/health/live` | Liveness probe (Docker/K8s) | None | `OK` (200) or fail |
| `GET /api/health/ready` | Readiness probe (traffic routing) | None | `ready: true/false` |

### /api/health Response Example

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "mongo": "connected",
  "memory": {
    "rss": 85,
    "heap": 42,
    "heapTotal": 65
  },
  "version": "1.0.0"
}
```

Returns `503` if MongoDB is disconnected.

---

## Uptime Monitoring (UptimeRobot)

### Setup:
1. Go to [UptimeRobot](https://uptimerobot.com) → Add Monitor
2. Monitor Type: **HTTP(s)**
3. URL: `https://api.yourdomain.com/api/health`
4. Monitoring Interval: 5 minutes
5. Alert Contacts: Your email/Slack/Discord

### Alternative Monitors:
- [Better Uptime](https://betteruptime.com)
- [Freshping](https://freshping.io)
- AWS CloudWatch Synthetics

---

## Structured Logging

### Log Levels (production = `warn`)

| Level | Logged in Production | Use Case |
|-------|---------------------|----------|
| ERROR | ✅ | Server errors, unhandled exceptions |
| WARN | ✅ | Auth failures, rate limits, security events |
| INFO | ❌ | Request lifecycle, transactions |
| DEBUG | ❌ | Development tracing |

### Production Log Format (JSON)

```json
{"level":"security","timestamp":"2025-01-15T10:30:00.000Z","message":"[AUTH] Authentication failed","method":"POST","path":"/api/auth/login","status":401,"ip":"192.168.1.1","duration":45}
```

### Security Events Logged

| Event | Trigger |
|-------|---------|
| Auth failure | 401 on /api/auth/* |
| Rate limit exceeded | 429 on any route |
| Forbidden access | 403 (fraud, blocked beneficiary) |
| Server error | 500+ response |
| JWT expired | Token expiry rejection |
| Invalid token | Malformed/tampered JWT |

### Sensitive Data Protection

These fields are **NEVER** logged:
- password, token, accessToken, refreshToken
- otp, pin, cvv, cardNumber
- secret, authorization, cookie, jwt

---

## Error Tracking (Sentry Integration Point)

The codebase is prepared for Sentry. To enable:

### 1. Install
```bash
npm install @sentry/node
```

### 2. Initialize (add to server.ts before startServer)
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 3. Add error handler (in app.ts before errorHandler)
```typescript
app.use(Sentry.Handlers.errorHandler());
```

### Integration Points Ready:
- `src/middleware/error.middleware.ts` — central error handler
- `src/utils/logger.ts` — structured logging (can pipe to Sentry)
- `src/middleware/security-audit.middleware.ts` — security events

---

## MongoDB Atlas Backup

### Automatic Backups (Atlas)

Atlas Free Tier includes:
- **Daily snapshots** retained for 2 days

Atlas M10+ includes:
- Continuous backup with point-in-time recovery
- Custom snapshot schedule
- Cross-region backup

### Enable in Atlas:
1. Atlas Dashboard → Cluster → Backup
2. Enable Continuous Backup (M10+) or verify daily snapshots (Free)

### Manual Backup

```bash
# Export all collections
mongodump --uri="mongodb+srv://<user>:<pass>@cluster.mongodb.net/bfsi-app" --out=./backup-$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb+srv://<user>:<pass>@cluster.mongodb.net/bfsi-app" ./backup-20250115/bfsi-app
```

### Backup Strategy (BFSI)

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Daily snapshot | Daily | 7 days | Atlas automatic |
| Weekly export | Weekly | 30 days | mongodump cron |
| Pre-deploy backup | Before each deploy | 7 days | Manual mongodump |

### VM Cron for Weekly Backup

```bash
# Add to crontab on Oracle VM
0 2 * * 0 mongodump --uri="$MONGO_URI" --out=/opt/backups/bfsi-$(date +\%Y\%m\%d) && find /opt/backups -mtime +30 -delete
```

---

## Docker Log Management

### View Logs
```bash
docker logs --tail 100 bfsi-backend
docker logs --since 1h bfsi-backend
```

### Log Rotation (prevent disk fill)
Create `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Then: `sudo systemctl restart docker`

---

## Alerts Checklist

| Alert | Threshold | Tool |
|-------|-----------|------|
| API down | Health check fails 2x | UptimeRobot |
| High memory | RSS > 256MB | Custom /api/health check |
| MongoDB disconnected | health.mongo != "connected" | UptimeRobot keyword |
| Disk space | > 80% used | VM cron + email |
| SSL expiry | < 7 days | Certbot auto-renew |
| Failed deploys | CI deploy job fails | GitHub Actions notification |

---

## Production Checklist

- [x] Structured JSON logging (production)
- [x] Sensitive data redaction
- [x] Security event tracking
- [x] Health check with MongoDB status
- [x] Liveness/readiness probes
- [x] Error handler with structured logs
- [x] Rate limit logging
- [x] Docker log rotation ready
- [x] UptimeRobot ready (/api/health)
- [x] Sentry integration point prepared
- [x] MongoDB Atlas backup documented
- [x] No blocking operations in monitoring code
