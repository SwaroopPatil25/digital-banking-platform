#!/bin/bash
# ============================================
# BFSI Backend - Oracle VM Deployment Script
# ============================================
# Usage: ./deploy.sh [build|start|stop|restart|logs|status|health]

set -e

APP_NAME="bfsi-backend"
IMAGE_NAME="bfsi-backend"
PORT=5000

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$APP_DIR/.env.production"
cd "$APP_DIR"

case "$1" in
  build)
    echo "🔨 Building Docker image..."
    docker build -t $IMAGE_NAME .
    echo "✅ Build complete"
    ;;

  start)
    echo "🚀 Starting container..."
    docker run -d \
      --name $APP_NAME \
      --restart unless-stopped \
      -p 127.0.0.1:$PORT:$PORT \
      --env-file $ENV_FILE \
      $IMAGE_NAME
    echo "✅ Container started"
    sleep 3
    docker logs --tail 10 $APP_NAME
    ;;

  stop)
    echo "🛑 Stopping container..."
    docker stop $APP_NAME 2>/dev/null || true
    docker rm $APP_NAME 2>/dev/null || true
    echo "✅ Container stopped"
    ;;

  restart)
    echo "🔄 Restarting..."
    $0 stop
    $0 start
    ;;

  deploy)
    echo "📦 Full deployment..."
    git pull origin main
    $0 stop
    $0 build
    $0 start
    $0 health
    ;;

  logs)
    docker logs --tail 50 $APP_NAME
    ;;

  status)
    docker ps --filter "name=$APP_NAME" --format "table {{.Status}}\t{{.Ports}}"
    ;;

  health)
    echo "🏥 Health check..."
    sleep 3
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT/api/health || echo "000")
    if [ "$HEALTH" = "200" ]; then
      echo "✅ Backend healthy (HTTP 200)"
    else
      echo "⚠️  Backend returned HTTP $HEALTH"
      echo "Recent logs:"
      docker logs --tail 20 $APP_NAME
    fi
    ;;

  *)
    echo "Usage: $0 {build|start|stop|restart|deploy|logs|status|health}"
    exit 1
    ;;
esac
