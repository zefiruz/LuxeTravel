package configs

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBDSN      string
	ServerPort string
	JWTSecret  string
	GigaChatSecret string
}

func getEnv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func LoadConfig() *Config {
	if err := godotenv.Load(".env", "../.env"); err != nil {
		log.Println("Файл .env не найден, используются системные переменные окружения")
	}

	requriedEnv := []string{"DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET", "GIGA_CHAT_SECRET"}
	for _, env := range requriedEnv {
		if os.Getenv(env) == "" {
			log.Fatalf("Критическая ошибка: переменная окружения %s не установлена", env)
		}
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_SSLMODE", "disable"),
	)

	return &Config{
		DBDSN:      dsn,
		ServerPort: getEnv("SERVER_PORT", ":8080"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
		GigaChatSecret: os.Getenv("GIGA_CHAT_SECRET"),
	}
}
