package main

import (
	"fmt"
	"log"
	"luxetravel/internal/handler"
	"luxetravel/internal/repository"
	"net/http"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
)

func main() {
	userRepo := repository.NewMemoryUserRepository() //repository.NewPostgresUserRepository(db)

	authHandler := handler.NewAuthHandler(userRepo)

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Post("/auth/register", authHandler.Register)
	r.Post("/auth/login", authHandler.Login)

	r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	})

	fmt.Println("Работает...")

	err := http.ListenAndServe(":8080", r)
	if err != nil {
		log.Fatal(err)
	}
}
