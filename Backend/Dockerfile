# ============================================
# BFSI Digital Banking Platform - Backend
# Production-Ready Multi-Stage Dockerfile
# ============================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first (layer caching)
COPY package.json package-lock.json tsconfig.json ./

# Install all dependencies (including dev for TypeScript build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built output from builder (exclude tests)
COPY --from=builder /app/dist ./dist/
RUN rm -rf ./dist/tests

# Copy env example as reference (actual env injected at runtime)
COPY .env.example ./

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Expose port (configurable via env)
EXPOSE 5000

# Health check (lightweight liveness probe)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-5000}/api/health/live || exit 1

# Start server
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
