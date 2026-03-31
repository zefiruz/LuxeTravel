# ====================== 1. Сборка фронтенда ======================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Копируем package.json и устанавливаем зависимости
COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile

# Копируем весь фронтенд и собираем
COPY frontend/ ./
RUN npm run build

# ====================== 2. Сборка Go ======================
FROM golang:1.25-alpine AS go-builder
WORKDIR /workspace

COPY . .

# Копируем собранный фронтенд в static (важно!)
# Vite по умолчанию собирает в папку dist
COPY --from=frontend-builder /app/frontend/dist ./static

# Собираем Go-приложение
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./backend/cmd/server

# ====================== 3. Финальный образ ======================
FROM alpine:latest
WORKDIR /app

COPY --from=go-builder /app/server .
COPY --from=go-builder /workspace/static ./static

EXPOSE 80
CMD ["./server"]