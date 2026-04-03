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
	CityRepo  repository.CityRepository
	AIService service.GigaChatService
}

func NewRouteHandler(repo repository.RouteRepository, cityRepo repository.CityRepository, aiService service.GigaChatService) *RouteHandler {
	return &RouteHandler{
		Repo:      repo,
		CityRepo:  cityRepo,
		AIService: aiService,
	}
}

// SuggestCitiesAI — просто возвращает список объектов городов по совету ИИ
func (h *RouteHandler) SuggestCitiesAI(w http.ResponseWriter, r *http.Request) {
	cityNames, err := h.Repo.GetAvailableCityNames()
	if err != nil {
		http.Error(w, "Ошибка получения списка городов", 500)
		return
	}

	var input struct {
		TripIdea string `json:"trip_idea"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	aiCities, err := h.AIService.GenerateCities(input.TripIdea, cityNames)
	if err != nil {
		http.Error(w, "Ошибка ИИ", 500)
		return
	}

	var suggestedCities []model.City
	for _, name := range aiCities {
		city, err := h.CityRepo.GetByName(name)
		if err == nil {
			suggestedCities = append(suggestedCities, *city)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(suggestedCities)
}

// CreateCompleteRoute — создает маршрут и бронирования одновременно
func (h *RouteHandler) CreateCompleteRoute(w http.ResponseWriter, r *http.Request) {
	var input struct {
		StartDate      string `json:"start_date"`
		EndDate        string `json:"end_date"`
		TravelersCount int    `json:"travelers_count"`
		TripIdea       string `json:"trip_idea"`
		Bookings       []struct {
			RoomID    uuid.UUID `json:"room_id"`
			StartDate string    `json:"start_date"`
			EndDate   string    `json:"end_date"`
		} `json:"bookings"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	parsedStart, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		http.Error(w, "Неверный формат start_date: "+err.Error(), http.StatusBadRequest)
		return
	}

	parsedEnd, err := time.Parse("2006-01-02", input.EndDate)
	if err != nil {
		http.Error(w, "Неверный формат end_date: "+err.Error(), http.StatusBadRequest)
		return
	}

	if parsedEnd.Before(parsedStart) || parsedEnd.Equal(parsedStart) {
		http.Error(w, "Дата окончания должна быть позже даты начала", http.StatusBadRequest)
		return
	}

	userIDStr, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Не авторизован", http.StatusUnauthorized)
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	// Подтягиваем начальные статусы (в идеале ID должны быть в константах или кеше)
	routeStatusID, err := h.Repo.GetStatusByTitle("Created")
	if err != nil {
		http.Error(w, "Системная ошибка: статус маршрута не найден", http.StatusInternalServerError)
		return
	}

	bookingStatusID, err := h.Repo.GetBookingStatusByTitle("Pending")
	if err != nil {
		http.Error(w, "Системная ошибка: статус бронирования не найден", http.StatusInternalServerError)
		return
	}

	var routeBookings []model.Booking
	for _, b := range input.Bookings {
		bStart, err := time.Parse("2006-01-02", b.StartDate)
		if err != nil {
			http.Error(w, "Неверный формат даты бронирования: "+err.Error(), http.StatusBadRequest)
			return
		}

		bEnd, err := time.Parse("2006-01-02", b.EndDate)
		if err != nil {
			http.Error(w, "Неверный формат даты окончания бронирования: "+err.Error(), http.StatusBadRequest)
			return
		}

		routeBookings = append(routeBookings, model.Booking{
			ID:         uuid.New(),
			RoomTypeID: b.RoomID,
			StatusID:   bookingStatusID,
			StartDate:  bStart,
			EndDate:    bEnd,
			CreatedAt:  time.Now(),
		})
	}

	newRoute := model.Route{
		ID:          uuid.New(),
		UserID:      userID,
		StatusID:    routeStatusID,
		StartDate:   parsedStart,
		EndDate:     parsedEnd,
		GuestsCount: input.TravelersCount,
		Prompt:      input.TripIdea,
		Bookings:    routeBookings,
		CreatedAt:   time.Now(),
	}

	if err := h.Repo.Create(&newRoute); err != nil {
		http.Error(w, "Ошибка сохранения: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newRoute)
}

// GetRoute — возвращает маршрут с полной информацией и ценой
func (h *RouteHandler) GetRoute(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))

	route, err := h.Repo.GetById(id)
	if err != nil {
		http.Error(w, "Маршрут не найден", 404)
		return
	}

	rawUserID := r.Context().Value(middleware.UserIDKey)
	currentUserID, _ := uuid.Parse(rawUserID.(string))
	if route.UserID != currentUserID {
		http.Error(w, "Доступ запрещен", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(route)
}

func (h *RouteHandler) UpdateRoute(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Некорректный ID маршрута", http.StatusBadRequest)
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

	var input struct {
		TripIdea       string `json:"trip_idea"`
		TravelersCount int    `json:"travelers_count"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	route.Prompt = input.TripIdea
	route.GuestsCount = input.TravelersCount

	if err := h.Repo.Update(route); err != nil {
		http.Error(w, "Ошибка обновления", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *RouteHandler) DeleteRoute(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Некорректный ID маршрута", http.StatusBadRequest)
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

	if err := h.Repo.Delete(id); err != nil {
		http.Error(w, "Ошибка удаления: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *RouteHandler) ListUserRoutes(w http.ResponseWriter, r *http.Request) {
	rawUserID := r.Context().Value(middleware.UserIDKey)
	userID, _ := uuid.Parse(rawUserID.(string))

	routes, err := h.Repo.GetAllById(userID)
	if err != nil {
		http.Error(w, "Ошибка", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(routes)
}
