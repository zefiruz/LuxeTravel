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
	"luxetravel/internal/service"

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
		&model.Role{},
		&model.RouteStatus{},
		&model.BookingStatus{},
		&model.City{},
		&model.User{},
		&model.UserInfo{},
		&model.Hotel{},
		&model.Room{},
		&model.Route{},
		&model.Booking{},
		&model.HotelManager{},
		&model.Meet{},
	)
	if err != nil {
		log.Fatal("Ошибка миграции таблиц: ", err)
	}

	userRepo := repository.NewPostgresUserRepository(db)
	routeRepo := repository.NewPostgresRouteRepository(db)
	cityRepo := repository.NewPostgresCityRepository(db)
	hotelRepo := repository.NewPostgresHotelRepository(db)

	aiService := service.NewGigaChatService(cfg.GigaChatSecret)

	authHandler := handler.NewAuthHandler(userRepo, cfg.JWTSecret)
	routeHandler := handler.NewRouteHandler(routeRepo, cityRepo, aiService)
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
		r.Get("/cities/{id}", cityHandler.GetCity)

		r.Get("/cities/{cityId}/hotels", hotelHandler.ListHotelsByCity)

		// ЗАКРЫТЫЕ РУЧКИ
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.AuthMiddleware(cfg.JWTSecret))
			//r.Use(appMiddleware.CheckRole("manager"))
			r.Route("/routes", func(r chi.Router) {
				r.Post("/generate", routeHandler.SuggestCitiesAI)
				r.Post("/", routeHandler.CreateCompleteRoute) // Создать весь маршрут целиком

				r.Get("/", routeHandler.ListUserRoutes) // Получить список моих маршрутов
				r.Get("/{id}", routeHandler.GetRoute)

				r.Put("/{id}", routeHandler.UpdateRoute)

				r.Delete("/{id}", routeHandler.DeleteRoute)
			})

			r.Get("/auth/profile", authHandler.GetProfile)
			r.Put("/auth/profile", authHandler.UpdateProfile)
		})
	})

	fmt.Println("Работает...")

	if err := http.ListenAndServe(cfg.ServerPort, r); err != nil {
		log.Fatal(err)
	}
}
