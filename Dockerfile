# Multi-stage Dockerfile for Hugging Face Spaces (Port 7860, 2 vCPU, 16 GB RAM)
# 100% Free, Zero-Card Cloud Deployment

# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY architecture-explorer/package*.json ./
RUN npm install
COPY architecture-explorer/ ./
RUN npm run build

# Stage 2: Python Backend & Static Server
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=7860 \
    PYTHONPATH=/app/src

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY src/ /app/src/
COPY app.py /app/app.py
COPY LICENSE /app/LICENSE
COPY README.md /app/README.md

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist /app/architecture-explorer/dist

# Non-root user for security (Hugging Face standard UID 1000)
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 7860

CMD ["python", "app.py"]

