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

	userIDStr, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "Не авторизован", http.StatusUnauthorized)
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	parsedStart, _ := time.Parse("2006-01-02", input.StartDate)
	parsedEnd, _ := time.Parse("2006-01-02", input.EndDate)

	// Подтягиваем начальные статусы (в идеале ID должны быть в константах или кеше)
	routeStatusID, _ := h.Repo.GetStatusByTitle("Created")
	bookingStatusID, _ := h.Repo.GetBookingStatusByTitle("Pending")

	var routeBookings []model.Booking
	for _, b := range input.Bookings {
		bStart, _ := time.Parse("2006-01-02", b.StartDate)
		bEnd, _ := time.Parse("2006-01-02", b.EndDate)

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
		http.Error(w, "Ошибка сохранения: "+err.Error(), 500)
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
	id, _ := uuid.Parse(chi.URLParam(r, "id"))

	var input struct {
		TripIdea       string `json:"trip_idea"`
		TravelersCount int    `json:"travelers_count"`
	}
	json.NewDecoder(r.Body).Decode(&input)

	route, err := h.Repo.GetById(id)
	if err != nil {
		http.Error(w, "Не найден", 404)
		return
	}

	route.Prompt = input.TripIdea
	route.GuestsCount = input.TravelersCount

	if err := h.Repo.Update(route); err != nil {
		http.Error(w, "Ошибка обновления", 500)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *RouteHandler) DeleteRoute(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))
	if err := h.Repo.Delete(id); err != nil {
		http.Error(w, "Ошибка", 500)
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
