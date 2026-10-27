#!/bin/sh
set -e

echo "=================================================="
echo " Starting PRAMAAN-AICTE Unified Full-Stack Engine"
echo "=================================================="

# Export configuration flags
export SEED_DEMO_COLLEGES=true
export PYTHONUNBUFFERED=1

# 1. Start FastAPI backend on internal port 8000
echo "--> Launching FastAPI backend on 127.0.0.1:8000..."
cd /app/backend
uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Brief pause to ensure FastAPI ASGI loop is listening and startup events finish
sleep 4

# 2. Start Next.js frontend on public cloud $PORT (defaults to 3000)
PUBLIC_PORT=${PORT:-3000}
echo "--> Launching Next.js frontend on 0.0.0.0:${PUBLIC_PORT}..."
cd /app/frontend
exec npm run start -- -p ${PUBLIC_PORT}
