package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"luxetravel/internal/middleware"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/go-chi/chi/v5"
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

func (h *RouteHandler) GetRoute(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")

	if idStr == "" {
        http.Error(w, "ID маршрута не найден в URL", http.StatusBadRequest)
        return
    }

    id, err := uuid.Parse(idStr)
    if err != nil {
        http.Error(w, "Некорректный формат UUID", http.StatusBadRequest)
        return
    }

	route, err := h.Repo.GetById(id)
	if err != nil {
		http.Error(w, "Маршрут не найден", http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"route":       route,
		"total_price": 800000,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *RouteHandler) UpdateRoute(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, _ := uuid.Parse(idStr)

	rawUserID := r.Context().Value(middleware.UserIDKey)
	currentUserIDStr, ok := rawUserID.(string)
	if !ok {
		http.Error(w, "Ошибка авторизации", http.StatusUnauthorized)
		return
	}
	currentUserID, _ := uuid.Parse(currentUserIDStr)

	var input struct {
		Cities []string `json:"cities"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	route, err := h.Repo.GetById(id)
	if err != nil {
		http.Error(w, "Маршрут не найден", http.StatusNotFound)
		return
	}

	if route.UserID != currentUserID {
		http.Error(w, "У вас нет прав на редактирование этого маршрута", http.StatusForbidden)
		return
	}

	route.Cities = input.Cities

	if err := h.Repo.Update(route); err != nil {
		http.Error(w, "Ошибка обновления", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *RouteHandler) DeleteRoute(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Неверный формат ID", http.StatusBadRequest)
		return
	}

	rawUserID := r.Context().Value(middleware.UserIDKey)
	currentUserIDStr := rawUserID.(string)
	currentUserID, _ := uuid.Parse(currentUserIDStr)

	route, err := h.Repo.GetById(id)
	if err != nil {
		http.Error(w, "Маршрут не найден", http.StatusNotFound)
		return
	}

	if route.UserID != currentUserID {
		http.Error(w, "У вас нет прав на удаление этого маршрута", http.StatusForbidden)
		return
	}

	if err := h.Repo.Delete(id); err != nil {
		http.Error(w, "Ошибка при удалении", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
