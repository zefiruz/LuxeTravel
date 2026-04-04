package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"luxetravel/internal/configs"
	"luxetravel/internal/handler"
	appMiddleware "luxetravel/internal/middleware"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"
	"luxetravel/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := configs.LoadConfig()

	db, err := gorm.Open(postgres.Open(cfg.DBDSN), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
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
		&model.RoomType{},
		&model.Route{},
		&model.Booking{},
		&model.HotelManager{},
	)
	if err != nil {
		log.Fatal("Ошибка миграции таблиц: ", err)
	}

	// Seed: начальные данные
	type seedRow struct {
		title string
	}
	seeds := []struct {
		table string
		rows  []seedRow
	}{
		{
			table: "roles",
			rows:  []seedRow{{"client"}, {"manager"}, {"admin"}},
		},
		{
			table: "route_statuses",
			rows:  []seedRow{{"draft"}, {"confirmed"}, {"completed"}},
		},
		{
			table: "booking_statuses",
			rows:  []seedRow{{"pending"}, {"confirmed"}, {"cancelled"}},
		},
	}

	for _, seed := range seeds {
		for _, row := range seed.rows {
			var count int64
			db.Table(seed.table).Where("title = ?", row.title).Count(&count)
			if count == 0 {
				db.Table(seed.table).Create(map[string]interface{}{
					"id":    uuid.New(),
					"title": row.title,
				})
			}
		}
	}

	userRepo := repository.NewPostgresUserRepository(db)
	routeRepo := repository.NewPostgresRouteRepository(db)
	cityRepo := repository.NewPostgresCityRepository(db)
	hotelRepo := repository.NewPostgresHotelRepository(db)
	adminRepo := repository.NewPostgresAdminRepository(db)
	managerRepo := repository.NewPostgresManagerRepository(db)

	aiService := service.NewGigaChatService(cfg.GigaChatSecret)

	authHandler := handler.NewAuthHandler(userRepo, cfg.JWTSecret)
	routeHandler := handler.NewRouteHandler(routeRepo, cityRepo, aiService)
	cityHandler := handler.NewCityHandler(cityRepo)
	hotelHandler := handler.NewHotelHandler(hotelRepo, cityRepo)
	adminHandler := handler.NewAdminHandler(adminRepo, cityRepo, hotelRepo)
	managerHandler := handler.NewManagerHandler(managerRepo)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api", func(r chi.Router) {
		// --- ПУБЛИЧНЫЕ РУЧКИ  ---
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)

		r.Get("/cities", cityHandler.ListCities)
		r.Get("/cities/{id}", cityHandler.GetCity)
		r.Get("/cities/{cityId}/hotels", hotelHandler.ListHotelsByCity)
		r.Post("/generate", routeHandler.SuggestCitiesAI)
		r.Get("/image", cityHandler.GetCityImage)

		// --- ОБЩИЕ ЗАКРЫТЫЕ РУЧКИ ---
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.AuthMiddleware(cfg.JWTSecret))

			r.Get("/auth/profile", authHandler.GetProfile)
			r.Put("/auth/profile", authHandler.UpdateProfile)

			// --- ЗОНА КЛИЕНТА (и Админа) ---
			r.Group(func(r chi.Router) {
				r.Use(appMiddleware.CheckRole("client", "admin"))

				r.Route("/routes", func(r chi.Router) {
					r.Post("/", routeHandler.CreateCompleteRoute)
					r.Get("/", routeHandler.ListUserRoutes)
					r.Get("/{id}", routeHandler.GetRoute)
					r.Put("/{id}", routeHandler.UpdateRoute)
					r.Delete("/{id}", routeHandler.DeleteRoute)
				})
			})

			// --- ЗОНА МЕНЕДЖЕРА (и Админа) ---
			r.Group(func(r chi.Router) {
				r.Use(appMiddleware.CheckRole("manager", "admin"))

				r.Route("/manager", func(r chi.Router) {
					r.Get("/bookings", managerHandler.ListBookings)
					r.Get("/bookings/{id}", managerHandler.GetBooking)
					r.Put("/bookings/{id}/status", managerHandler.UpdateStatus)
					r.Post("/room-types", managerHandler.CreateRoomType)
					r.Put("/hotels/{id}", managerHandler.UpdateHotel)
				})
			})

			// --- ЗОНА АДМИНИСТРАТОРА ---
			r.Group(func(r chi.Router) {
				r.Use(appMiddleware.CheckRole("admin"))

				r.Route("/admin", func(r chi.Router) {
					r.Get("/users", adminHandler.GetAllUsers)
					r.Get("/roles", adminHandler.GetRoles)
					r.Get("/routes", routeHandler.ListAllRoutes)
					r.Get("/routes/{id}", routeHandler.GetRouteAdmin)
					r.Put("/routes/{id}/status", routeHandler.UpdateRouteStatus)
					r.Get("/hotels", hotelHandler.ListAllHotels)
					r.Put("/users/{id}/role", adminHandler.UpdateUserRole)
					r.Put("/cities/{id}", cityHandler.UpdateCity)
					r.Put("/hotels/{id}", hotelHandler.UpdateHotel)

					r.Post("/hotel-managers", adminHandler.AssignManager)
					r.Post("/cities", cityHandler.CreateCity)
					r.Post("/hotels", hotelHandler.CreateHotel)
				})
			})
		})
	})

	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "static"))

	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		// Если это запрос к API, который не обработался выше — отдаем 404
		if strings.HasPrefix(r.URL.Path, "/api") {
			http.NotFound(w, r)
			return
		}

		// Проверяем, существует ли физический файл (картинка, js, css)
		path := filepath.Clean(r.URL.Path)
		f, err := filesDir.Open(path)
		if err != nil {
			// Если файла нет (это роут фронтенда) — отдаем index.html
			http.ServeFile(w, r, filepath.Join(string(filesDir), "index.html"))
			return
		}
		f.Close()

		// Если файл есть — отдаем его
		http.FileServer(filesDir).ServeHTTP(w, r)
	})

	fmt.Println("Работает...")

	if err := http.ListenAndServe(cfg.ServerPort, r); err != nil {
		log.Fatal(err)
	}
}
