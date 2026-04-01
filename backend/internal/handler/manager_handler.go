package handler

import (
	"encoding/json"
	"net/http"

	"luxetravel/internal/middleware"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ManagerHandler struct {
	Repo repository.ManagerRepository
}

func NewManagerHandler(repo repository.ManagerRepository) *ManagerHandler {
	return &ManagerHandler{Repo: repo}
}

func (h *ManagerHandler) ListBookings(w http.ResponseWriter, r *http.Request) {
	val := r.Context().Value(middleware.UserIDKey)
	idStr, ok := val.(string)
	if !ok {
		http.Error(w, "Ошибка авторизации", http.StatusUnauthorized)
		return
	}

	managerID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Некорректный ID пользователя в токене", http.StatusBadRequest)
		return
	}

	bookings, err := h.Repo.GetBookings(managerID)
	if err != nil {
		http.Error(w, "Ошибка получения данных", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}

func (h *ManagerHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	val := r.Context().Value(middleware.UserIDKey)
	managerIDStr, ok := val.(string)
	if !ok {
		http.Error(w, "Пользователь не авторизован", http.StatusUnauthorized)
		return
	}

	managerID, err := uuid.Parse(managerIDStr)
	if err != nil {
		http.Error(w, "Некорректный формат ID менеджера", http.StatusBadRequest)
		return
	}

	bookingID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Некорректный ID брони", http.StatusBadRequest)
		return
	}

	var input struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Неверный формат JSON", http.StatusBadRequest)
		return
	}

	err = h.Repo.UpdateBookingStatus(managerID, bookingID, input.Status)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Бронь не найдена или доступ запрещен", http.StatusForbidden)
		} else {
			http.Error(w, "Ошибка БД: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ManagerHandler) GetBooking(w http.ResponseWriter, r *http.Request) {
	val := r.Context().Value(middleware.UserIDKey)
	managerIDStr, _ := val.(string)
	managerID, _ := uuid.Parse(managerIDStr)

	bookingID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Некорректный ID брони", http.StatusBadRequest)
		return
	}

	booking, err := h.Repo.GetBookingByID(managerID, bookingID)
	if err != nil {
		http.Error(w, "Бронь не найдена или доступ запрещен", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func (h *ManagerHandler) CreateRoomType(w http.ResponseWriter, r *http.Request) {
	val := r.Context().Value(middleware.UserIDKey)
	managerIDStr, _ := val.(string)
	managerID, _ := uuid.Parse(managerIDStr)

	var input model.RoomType
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	input.ID = uuid.New()

	err := h.Repo.CreateRoomType(managerID, &input)
	if err != nil {
		http.Error(w, "Ошибка: возможно, вы не управляете этим отелем", http.StatusForbidden)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}
