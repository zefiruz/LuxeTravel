package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"luxetravel/internal/model"
	"luxetravel/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Repo repository.UserRepository
	JWTSecret string
}

func NewAuthHandler(repo repository.UserRepository, secret string) *AuthHandler {
	return &AuthHandler{
		Repo: repo,
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
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Ошибка при обработке пароля", http.StatusInternalServerError)
		return
	}

	newUser := model.User{
		ID:           uuid.New(),
		Login:        input.Login,
		PasswordHash: string(hashedPassword),
		Role:         "client",
	}

	err = h.Repo.Create(newUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newUser)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Некорректный JSON", http.StatusBadRequest)
		return
	}

	user, err := h.Repo.GetByLogin(input.Login)
	if err != nil {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	token, err := h.generateToken(user.ID, user.Role)
	if err != nil {
		http.Error(w, "Ошибка генерации токена", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"token":   token,
		"message": "Welcome!",
	})
}
