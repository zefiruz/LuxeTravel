package handler

import (
	"encoding/json"
	"net/http"

	"luxetravel/internal/repository"
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
