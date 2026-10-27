# Stage 1: Build Next.js Production Assets
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Final Unified Container (Python 3.12 + Node.js Runtime)
FROM python:3.12-slim
WORKDIR /app

# Install Node.js 20 and system libraries for OpenCV & PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy frontend source and production build from builder stage
COPY --from=frontend-builder /app/frontend ./frontend

# Copy and setup unified startup script
COPY start_unified.sh .
RUN chmod +x start_unified.sh

# Expose web port
EXPOSE 3000

# Launch both FastAPI & Next.js together
CMD ["./start_unified.sh"]
