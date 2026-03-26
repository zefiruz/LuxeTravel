package handler

import (
	"encoding/json"
	"net/http"
	"time"

	appMiddleware "luxetravel/internal/middleware"
	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Repo      repository.UserRepository
	JWTSecret string
}

func NewAuthHandler(repo repository.UserRepository, secret string) *AuthHandler {
	return &AuthHandler{
		Repo:      repo,
		JWTSecret: secret,
	}
}

func (h *AuthHandler) generateToken(userID uuid.UUID, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(h.JWTSecret))
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input struct {
		LastName   string `json:"lastName"`
		FirstName  string `json:"firstName"`
		MiddleName string `json:"middleName"`
		Email      string `json:"email"`
		Phone      string `json:"phone"`
		Password   string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	if input.Email == "" || input.Password == "" || input.FirstName == "" {
		http.Error(w, "Заполните обязательные поля", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Ошибка при обработке пароля", http.StatusInternalServerError)
		return
	}

	roleID, err := h.Repo.GetRoleByTitle("client")
	if err != nil {
		http.Error(w, "Системная ошибка: роль не найдена", 500)
		return
	}

	userID := uuid.New()

	newUser := model.User{
		ID:           userID,
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		RoleID:       roleID,
	}

	newUserInfo := model.UserInfo{
		ID:         uuid.New(),
		UserID:     userID,
		FirstName:  input.FirstName,
		LastName:   input.LastName,
		MiddleName: input.MiddleName,
		Phone:      input.Phone,
	}

	err = h.Repo.CreateWithInfo(newUser, newUserInfo)
	if err != nil {
		http.Error(w, "Ошибка регистрации: возможно, email уже занят", http.StatusConflict)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Пользователь успешно зарегистрирован",
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	user, err := h.Repo.GetByEmail(input.Email)
	if err != nil {
		http.Error(w, "Неверный email или пароль", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		http.Error(w, "Неверный email или пароль", http.StatusUnauthorized)
		return
	}

	token, err := h.generateToken(user.ID, user.Role.Title)
	if err != nil {
		http.Error(w, "Ошибка токена", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": token,
		"user":  map[string]string{"id": user.ID.String(), "role": user.Role.Title},
	})
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userIDVal := r.Context().Value(appMiddleware.UserIDKey)

	userIDStr, ok := userIDVal.(string)
	if !ok {
		http.Error(w, "Пользователь не авторизован", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Некорректный ID", http.StatusBadRequest)
		return
	}

	userInfo, err := h.Repo.GetInfoByUserID(userID)
	if err != nil {
		http.Error(w, "Профиль не найден", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userInfo)
}

func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userIDVal := r.Context().Value(appMiddleware.UserIDKey)
	userIDStr, ok := userIDVal.(string)
	if !ok {
		http.Error(w, "Не авторизован", http.StatusUnauthorized)
		return
	}

	var input model.UserInfo
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	uid, _ := uuid.Parse(userIDStr)
	input.UserID = uid

	if err := h.Repo.UpdateInfo(input); err != nil {
		http.Error(w, "Ошибка при обновлении профиля", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(input)
}
