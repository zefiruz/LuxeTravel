package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey   contextKey = "userID"
	UserRoleKey contextKey = "userRole"
)

func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Отсутствует токен", http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("неверный алгоритм подписи: %v", token.Header["alg"])
				}
				return []byte(jwtSecret), nil
			})

			if err == nil && token.Valid {
				if claims, ok := token.Claims.(jwt.MapClaims); ok {
					userID := claims["user_id"]
					userRole := claims["role"]

					ctx := context.WithValue(r.Context(), UserIDKey, userID)
					ctx = context.WithValue(ctx, UserRoleKey, userRole)

					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}

			http.Error(w, "Неверный токен", http.StatusUnauthorized)
		})
	}
}

func CheckRole(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userRole, ok := r.Context().Value(UserRoleKey).(string)
			if !ok {
				http.Error(w, "Доступ запрещен: роль не определена", http.StatusForbidden)
				return
			}

			roleMatches := false
			for _, role := range allowedRoles {
				if userRole == role {
					roleMatches = true
					break
				}
			}

			if !roleMatches {
				http.Error(w, "У вас недостаточно прав для этого действия", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
