package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"luxetravel/internal/middleware"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"
	"luxetravel/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type RouteHandler struct {
	Repo      repository.RouteRepository
	AIService *service.GigaChatService
}

func NewRouteHandler(repo repository.RouteRepository, aiService *service.GigaChatService) *RouteHandler {
	return &RouteHandler{
		Repo: repo,
		AIService: aiService,
	}
}

func (h *RouteHandler) CreateRouteManual(w http.ResponseWriter, r *http.Request) {
	var input struct {
		StartDate      string   `json:"start_date"`
		EndDate        string   `json:"end_date"`
		TravelersCount int      `json:"travelers_count"`
		Cities         []string `json:"cities"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	if len(input.Cities) == 0 {
		http.Error(w, "Список городов не может быть пустым", http.StatusBadRequest)
		return
	}

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

	parsedStart, _ := time.Parse("2006-01-02", input.StartDate)
	parsedEnd, _ := time.Parse("2006-01-02", input.EndDate)

	newRoute := model.Route{
		ID:             uuid.New(),
		UserID:         userID,
		StartDate:      parsedStart,
		EndDate:        parsedEnd,
		TravelersCount: input.TravelersCount,
		Cities:         input.Cities,
		CreatedAt:      time.Now(),
	}

	if err := h.Repo.Create(&newRoute); err != nil {
		http.Error(w, "Ошибка сохранения: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newRoute)
}

func (h *RouteHandler) CreateRouteAI(w http.ResponseWriter, r *http.Request) {
	var input struct {
		StartDate      string `json:"start_date"`
		EndDate        string `json:"end_date"`
		TravelersCount int    `json:"travelers_count"`
		TripIdea       string `json:"trip_idea"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	if input.TripIdea == "" {
		http.Error(w, "Описание поездки не может быть пустым", http.StatusBadRequest)
		return
	}

	// Обращаемся к GigaChat
	aiCities, err := h.AIService.GenerateCities(input.TripIdea)
	if err != nil {
		http.Error(w, "Ошибка генерации ИИ: "+err.Error(), http.StatusInternalServerError)
		return
	}

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

	parsedStart, _ := time.Parse("2006-01-02", input.StartDate)
	parsedEnd, _ := time.Parse("2006-01-02", input.EndDate)

	newRoute := model.Route{
		ID:             uuid.New(),
		UserID:         userID,
		StartDate:      parsedStart,
		EndDate:        parsedEnd,
		TravelersCount: input.TravelersCount,
		Cities:         aiCities,
		TripIdea:       input.TripIdea,
		CreatedAt:      time.Now(),
	}

	if err := h.Repo.Create(&newRoute); err != nil {
		http.Error(w, "Ошибка сохранения: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newRoute)
}

func (h *RouteHandler) AddBookingToRoute(w http.ResponseWriter, r *http.Request) {
	routeIDStr := chi.URLParam(r, "routeId")
	routeID, err := uuid.Parse(routeIDStr)
	if err != nil {
		http.Error(w, "Неверный ID маршрута", http.StatusBadRequest)
		return
	}

	var input struct {
		RoomID    uuid.UUID `json:"room_id"`
		StartDate string    `json:"start_date"`
		EndDate   string    `json:"end_date"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	parsedStart, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
        http.Error(w, "Неверная дата начала", http.StatusBadRequest)
        return
    }
	parsedEnd, _ := time.Parse("2006-01-02", input.EndDate)

	// ТУТ ДОЛЖНА БЫТЬ ПРОВЕРКА (Нужен доступ к Room Repo или БД)

	newBooking := model.Booking{
		ID:        uuid.New(),
		RouteId:   routeID,
		RoomId:    input.RoomID,
		StartDate: parsedStart,
		EndDate:   parsedEnd,
	}

	if err := h.Repo.CreateBooking(&newBooking); err != nil {
		http.Error(w, "Ошибка добавления брони", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newBooking)
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

	rawUserID := r.Context().Value(middleware.UserIDKey)
    currentUserID, _ := uuid.Parse(rawUserID.(string))
    if route.UserID != currentUserID {
        http.Error(w, "Доступ запрещен", http.StatusForbidden)
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

func (h *RouteHandler) ListUserRoutes(w http.ResponseWriter, r *http.Request) {
	rawUserID := r.Context().Value(middleware.UserIDKey)
	userIDStr := rawUserID.(string)
	userID, _ := uuid.Parse(userIDStr)

	routes, err := h.Repo.GetAllById(userID)
	if err != nil {
		http.Error(w, "Ошибка получения списка", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(routes)
}
