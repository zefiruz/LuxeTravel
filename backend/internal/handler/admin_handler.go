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

type AdminHandler struct {
	Repo      repository.AdminRepository
	CityRepo  repository.CityRepository
	HotelRepo repository.HotelRepository
}

func NewAdminHandler(repo repository.AdminRepository, cityRepo repository.CityRepository, hotelRepo repository.HotelRepository) *AdminHandler {
	return &AdminHandler{
		Repo:      repo,
		CityRepo:  cityRepo,
		HotelRepo: hotelRepo,
	}
}

func (h *AdminHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.Repo.GetAllUsers()
	if err != nil {
		http.Error(w, "Ошибка получения пользователей: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (h *AdminHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	targetUserID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Некорректный ID пользователя", http.StatusBadRequest)
		return
	}

	var input struct {
		RoleID uuid.UUID `json:"role_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	err = h.Repo.UpdateUserRole(targetUserID, input.RoleID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Пользователь не найден", http.StatusNotFound)
		} else {
			http.Error(w, "Ошибка базы данных", http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *AdminHandler) AssignManager(w http.ResponseWriter, r *http.Request) {
	var input struct {
		UserID  uuid.UUID `json:"user_id"`
		HotelID uuid.UUID `json:"hotel_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	err := h.Repo.AssignManagerToHotel(input.UserID, input.HotelID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *CityHandler) CreateCity(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	city := model.City{
		ID:    uuid.New(),
		Title: input.Title,
	}

	if err := h.Repo.Create(&city); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(city)
}

func (h *HotelHandler) CreateHotel(w http.ResponseWriter, r *http.Request) {
    var input struct {
        Title       string    `json:"title"`
        Description string    `json:"description"`
        CityID      uuid.UUID `json:"city_id"`
        Email       string    `json:"email"`
        Address     string    `json:"address"`
    }

    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    hotel := model.Hotel{
        ID:          uuid.New(),
        Title:       input.Title,
        Description: input.Description,
        CityID:      input.CityID,
        Email:       input.Email,
        Address:     input.Address,
    }

    if err := h.Repo.Create(&hotel); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(hotel)
}
