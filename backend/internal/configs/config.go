package configs

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBDSN          string
	ServerPort     string
	JWTSecret      string
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
    _ = godotenv.Load(".env", "../.env") 

    cfg := &Config{
        DBDSN:          getEnv("DBDSN", ""),          
        ServerPort:     getEnv("SERVER_PORT", ":8080"),
        JWTSecret:      getEnv("JWT_SECRET", ""),
        GigaChatSecret: getEnv("GIGA_CHAT_SECRET", ""),
    }

    if cfg.DBDSN == "" {
        cfg.DBDSN = fmt.Sprintf(
            "host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
            getEnv("DB_HOST", ""),
            getEnv("DB_USER", ""),
            getEnv("DB_PASSWORD", ""),
            getEnv("DB_NAME", ""),
            getEnv("DB_PORT", "5432"),
            getEnv("DB_SSLMODE", "disable"),
        )
    }

    if cfg.DBDSN == "" {
        log.Fatal("Критическая ошибка: DBDSN не установлен")
    }
    if cfg.JWTSecret == "" {
        log.Fatal("Критическая ошибка: JWT_SECRET не установлен")
    }
    if cfg.GigaChatSecret == "" {
        log.Fatal("Критическая ошибка: GIGA_CHAT_SECRET не установлен")
    }

    return cfg
}
