// internal/handler/hotel_handler.go

package handler

import (
	"encoding/json"
	"net/http"

	"luxetravel/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type HotelHandler struct {
	Repo repository.HotelRepository
}

func NewHotelHandler(repo repository.HotelRepository) *HotelHandler {
	return &HotelHandler{Repo: repo}
}

func (h *HotelHandler) ListHotelsByCity(w http.ResponseWriter, r *http.Request) {
	cityIDStr := chi.URLParam(r, "cityId")
	cityID, err := uuid.Parse(cityIDStr)
	if err != nil {
		http.Error(w, "Неверный ID города", http.StatusBadRequest)
		return
	}

	hotels, err := h.Repo.GetByCityID(cityID)
	if err != nil {
		http.Error(w, "Ошибка при поиске отелей", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(hotels)
}
