# ====================== 1. Сборка фронтенда ======================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile

COPY frontend/ ./
RUN npm run build

# ====================== 2. Сборка Go ======================
FROM golang:1.25-alpine AS go-builder
WORKDIR /workspace/backend

COPY backend/go.mod backend/go.sum* ./
RUN go mod download

COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist /workspace/static

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

# ====================== 3. Финальный образ ======================
FROM alpine:latest
WORKDIR /app

COPY --from=go-builder /app/server .
COPY --from=go-builder /workspace/static ./static

EXPOSE 80
CMD ["./server"]