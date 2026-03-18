package main

import (
	"fmt"
	"log"
	"net/http"

	"luxetravel/internal/handler"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"
	"luxetravel/internal/configs"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := configs.LoadConfig()

	db, err := gorm.Open(postgres.Open(cfg.DBDSN), &gorm.Config{})
	if err != nil {
		log.Fatal("Ошибка подключения к БД: ", err)
	}
	fmt.Println("Успешное подключение к PostgreSQL")

	err = db.AutoMigrate(
		&model.User{},
		&model.UserInfo{},
		&model.City{},
		&model.Hotel{},
		&model.Room{},
		&model.Route{},
		&model.Booking{},
	)
	if err != nil {
		log.Fatal("Ошибка миграции таблиц: ", err)
	}

	userRepo := repository.NewPostgresUserRepository(db)
	authHandler := handler.NewAuthHandler(userRepo, cfg.JWTSecret)

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)
	})

	r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	})

	fmt.Println("Работает...")

	if err := http.ListenAndServe(cfg.ServerPort, r); err != nil {
		log.Fatal(err)
	}
}
