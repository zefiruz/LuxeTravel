# ==================== 1. Сборка фронтенда ====================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile
COPY frontend/ ./
RUN npm run build   

# ==================== 2. Сборка Go ====================
FROM golang:1.22-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .                                      
COPY --from=frontend-builder /app/frontend/dist ./static   

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./backend  

# ==================== 3. Финальный образ ====================
FROM alpine:latest
WORKDIR /app

COPY --from=go-builder /app/server .
COPY --from=go-builder /app/static ./static

EXPOSE 80
CMD ["./server"]