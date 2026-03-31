# ====================== 1. Сборка фронтенда ======================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile

COPY frontend/ ./
RUN npm run build

# ====================== 2. Сборка Go-приложения ======================
FROM golang:1.22-alpine AS go-builder
WORKDIR /app

# Копируем go-модули (для кэширования зависимостей)
COPY go.mod go.sum ./
RUN go mod download

# Копируем весь проект
COPY . .

# Копируем собранный фронтенд в папку static (Go будет её отдавать)
COPY --from=frontend-builder /app/frontend/dist ./static

# Собираем приложение (главный main.go находится в backend/cmd/server/)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./backend/cmd/server

# ====================== 3. Финальный лёгкий образ ======================
FROM alpine:latest
WORKDIR /app

COPY --from=go-builder /app/server .
COPY --from=go-builder /app/static ./static

EXPOSE 80
CMD ["./server"]