package config

import (
	"os"
)

type Config struct {
	DatabaseURL    string
	JWTSecret      string
	Port           string
	SMTPHost       string
	SMTPPort       string
	SMTPUser       string
	SMTPPassword   string
	Environment    string
}

func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "root:password@tcp(mariadb:3306)/timetable_system?charset=utf8mb4&parseTime=True&loc=Local"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Port:           getEnv("PORT", "8080"),
		SMTPHost:       getEnv("SMTP_HOST", "localhost"),
		SMTPPort:       getEnv("SMTP_PORT", "587"),
		SMTPUser:       getEnv("SMTP_USER", ""),
		SMTPPassword:   getEnv("SMTP_PASSWORD", ""),
		Environment:    getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}