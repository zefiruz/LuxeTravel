package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
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

func (h *CityHandler) UpdateCity(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	cityID, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Некорректный ID города", http.StatusBadRequest)
		return
	}

	var input model.City
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Ошибка парсинга JSON", http.StatusBadRequest)
		return
	}

	input.ID = cityID

	err = h.Repo.UpdateCityInfo(input)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Город не найден", http.StatusNotFound)
		} else {
			http.Error(w, "Ошибка при обновлении: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(input)
}

func (h *CityHandler) GetCityImage(w http.ResponseWriter, r *http.Request) {
	title := r.URL.Query().Get("title")
	if title == "" {
		http.Error(w, "Параметр title обязателен", http.StatusBadRequest)
		return
	}

	city, err := h.Repo.GetByTitle(title)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			http.Error(w, "Город не найден", http.StatusNotFound)
		} else {
			http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
		}
		return
	}

	response := map[string]string{
		"title":     city.Title,
		"image_url": city.ImageURL,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *CityHandler) CreateCity(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		ImageURL    string `json:"image_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	if input.Title == "" {
		http.Error(w, "Название города обязательно", http.StatusBadRequest)
		return
	}

	city := model.City{
		ID:          uuid.New(),
		Title:       input.Title,
		Description: input.Description,
		ImageURL:    input.ImageURL,
	}

	if err := h.Repo.Create(&city); err != nil {
		http.Error(w, "Ошибка создания города: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(city)
}
