package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"luxetravel/internal/middleware"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/google/uuid"
)

type RouteHandler struct {
	Repo repository.RouteRepository
}

func NewRouteHandler(repo repository.RouteRepository) *RouteHandler {
	return &RouteHandler{Repo: repo}
}

func (h *RouteHandler) CreateRoute(w http.ResponseWriter, r *http.Request) {
	var input struct {
		StartDate      string   `json:"start_date"`
		EndDate        string   `json:"end_date"`
		TravelersCount int      `json:"travelers_count"`
		Mode           string   `json:"mode"`
		Cities         []string `json:"cities"`
		TripIdea       string   `json:"trip_idea"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	// Достаем ID пользователя из контекста
	rawUserID := r.Context().Value(middleware.UserIDKey)
	userIDStr, ok := rawUserID.(string)
	if !ok {
		http.Error(w, "Ошибка авторизации: неверный ID пользователя", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Неверный формат UUID", http.StatusBadRequest)
		return
	}

	startDate, _ := time.Parse("2006-01-02", input.StartDate)
	endDate, _ := time.Parse("2006-01-02", input.EndDate)

	newRoute := model.Route{
		ID:             uuid.New(),
		UserID:         userID,
		StartDate:      startDate,
		EndDate:        endDate,
		TravelersCount: input.TravelersCount,
		Mode:           input.Mode,
		Cities:         input.Cities,
		TripIdea:       input.TripIdea,
		CreatedAt:      time.Now(),
	}

	if err := h.Repo.Create(&newRoute); err != nil {
		http.Error(w, "Ошибка сохранения маршрута: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newRoute)
}
