# ====================== 1. Сборка фронтенда ======================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile

COPY frontend/ ./
RUN npm run build

# ====================== 2. Сборка Go ======================
FROM golang:1.22-alpine AS go-builder

# Копируем ВСЁ сразу в одну директорию
WORKDIR /workspace

COPY . .

# Копируем собранный фронтенд
COPY --from=frontend-builder /app/frontend/dist ./static

# Переходим в папку с Go-кодом и собираем
WORKDIR /workspace/backend/cmd/server

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

# ====================== 3. Финальный образ ======================
FROM alpine:latest
WORKDIR /app

COPY --from=go-builder /app/server .
COPY --from=go-builder /workspace/static ./static

EXPOSE 80
CMD ["./server"]