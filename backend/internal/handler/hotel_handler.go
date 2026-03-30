// internal/handler/hotel_handler.go

package handler

import (
	"encoding/json"
	"net/http"

	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HotelHandler struct {
	Repo repository.HotelRepository
	CityRepo repository.CityRepository
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

func (h *HotelHandler) UpdateHotel(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Некорректный ID отеля", http.StatusBadRequest)
		return
	}

	var input model.Hotel
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Ошибка парсинга JSON", http.StatusBadRequest)
		return
	}
	input.ID = id

	if input.CityID != uuid.Nil {
		_, err := h.CityRepo.GetById(input.CityID)
		if err != nil {
			http.Error(w, "Указанный город не найден", http.StatusBadRequest)
			return
		}
	}

	err = h.Repo.Update(input)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Отель не найден", http.StatusNotFound)
		} else {
			http.Error(w, "Ошибка БД: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(input)
}
