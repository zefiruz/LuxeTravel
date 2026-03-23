package handler

import (
	"encoding/json"
	"net/http"

	"luxetravel/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type CityHandler struct {
	Repo repository.CityRepository
}

func NewCityHandler(repo repository.CityRepository) *CityHandler {
	return &CityHandler{Repo: repo}
}

func (h *CityHandler) ListCities(w http.ResponseWriter, r *http.Request) {
	cities, err := h.Repo.GetAll()
	if err != nil {
		http.Error(w, "Не удалось загрузить список городов", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cities)
}

func (h *CityHandler) GetCity(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Некорректный формат UUID", http.StatusBadRequest)
		return
	}

	city, err := h.Repo.GetById(id)
	if err != nil {
		http.Error(w, "Город не найден", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(city)
}
