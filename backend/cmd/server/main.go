package main

import (
	"fmt"
	"log"
	"net/http"

	"luxetravel/internal/configs"
	"luxetravel/internal/handler"
	appMiddleware "luxetravel/internal/middleware"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
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
	routeRepo := repository.NewPostgresRouteRepository(db)
	cityRepo := repository.NewPostgresCityRepository(db)
	hotelRepo := repository.NewPostgresHotelRepository(db)

	authHandler := handler.NewAuthHandler(userRepo, cfg.JWTSecret)
	routeHandler := handler.NewRouteHandler(routeRepo)
	cityHandler := handler.NewCityHandler(cityRepo)
	hotelHandler := handler.NewHotelHandler(hotelRepo)

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

	r.Route("/api", func(r chi.Router) {
		// ОТКРЫТЫЕ РУЧКИ
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)

		r.Get("/cities", cityHandler.ListCities)

		// ЗАКРЫТЫЕ РУЧКИ
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.AuthMiddleware(cfg.JWTSecret))

			r.Post("/routes", routeHandler.CreateRoute)
			r.Get("/routes", routeHandler.ListUserRoutes)
			r.Get("/routes/{id}", routeHandler.GetRoute)
			r.Put("/routes/{id}", routeHandler.UpdateRoute)
			r.Delete("/routes/{id}", routeHandler.DeleteRoute)

			r.Get("/auth/profile", authHandler.GetProfile)
			r.Put("/auth/profile", authHandler.UpdateProfile)

			r.Get("/city/{cityId}", hotelHandler.ListHotelsByCity)
		})
	})

	fmt.Println("Работает...")

	if err := http.ListenAndServe(cfg.ServerPort, r); err != nil {
		log.Fatal(err)
	}
}
