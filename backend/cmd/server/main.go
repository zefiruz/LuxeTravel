package main

import (
	"fmt"
	"log"
	"net/http"

	"luxetravel/internal/handler"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"
	"luxetravel/internal/configs"
	appMiddleware "luxetravel/internal/middleware"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/go-chi/cors"
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
	routeRepo := repository.NewPostgresRouteRepository(db)

	authHandler := handler.NewAuthHandler(userRepo, cfg.JWTSecret)
	routeHandler := handler.NewRouteHandler(routeRepo)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, 
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api/v1", func(r chi.Router) {
		// ОТКРЫТЫЕ РУЧКИ
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)

		// ЗАКРЫТЫЕ РУЧКИ 
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.AuthMiddleware(cfg.JWTSecret)) 
			
			r.Get("/protected/ping", func(w http.ResponseWriter, r *http.Request) {
				userID := r.Context().Value(appMiddleware.UserIDKey)

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				fmt.Fprintf(w, `{"message": "pong", "user_id": "%v", "status": "authorized"}`, userID)
			})

			r.Post("/routes", routeHandler.CreateRoute)
    		r.Get("/routes/{id}", routeHandler.GetRoute)    
    		r.Put("/routes/{id}", routeHandler.UpdateRoute)
    		r.Delete("/routes/{id}", routeHandler.DeleteRoute)
		})
	})

	fmt.Println("Работает...")

	if err := http.ListenAndServe(cfg.ServerPort, r); err != nil {
		log.Fatal(err)
	}
}
