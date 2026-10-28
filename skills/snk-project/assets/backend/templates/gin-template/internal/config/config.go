package config

import (
	"errors"
	"log/slog"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv          string
	Port            string
	DatabaseURL     string
	AutoMigrate     bool
	CORSOrigins     []string
	JWTSecret       string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	CookieSecure    bool
	SeedDemoUser    bool
	LogLevel        slog.Level
	LogFile         string
}

// Load reads configuration from environment variables (a local .env file is optional).
func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		AppEnv:       getenv("APP_ENV", "development"),
		Port:         getenv("PORT", "9000"),
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		AutoMigrate:  getenv("DB_AUTO_MIGRATE", "true") == "true",
		CORSOrigins:  splitList(os.Getenv("CORS_ORIGINS")),
		JWTSecret:    os.Getenv("JWT_SECRET"),
		CookieSecure: getenv("COOKIE_SECURE", "false") == "true",
		SeedDemoUser: getenv("SEED_DEMO_USER", "false") == "true",
		LogFile:      getenv("LOG_FILE", "logs/app.log"),
	}
	var err error
	if cfg.AccessTokenTTL, err = seconds("ACCESS_TOKEN_TTL", 900); err != nil {
		return nil, err
	}
	if cfg.RefreshTokenTTL, err = seconds("REFRESH_TOKEN_TTL", 604800); err != nil {
		return nil, err
	}
	if err := cfg.LogLevel.UnmarshalText([]byte(strings.ToUpper(getenv("LOG_LEVEL", "info")))); err != nil {
		return nil, err
	}
	return cfg, cfg.validate()
}

func (c *Config) validate() error {
	switch {
	case c.DatabaseURL == "":
		return errors.New("DATABASE_URL is required")
	case len(c.JWTSecret) < 32:
		return errors.New("JWT_SECRET must be at least 32 characters")
	case c.AppEnv == "production" && c.SeedDemoUser:
		return errors.New("SEED_DEMO_USER must be false in production")
	}
	return nil
}

func getenv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func seconds(key string, fallback int) (time.Duration, error) {
	n, err := strconv.Atoi(getenv(key, strconv.Itoa(fallback)))
	if err != nil || n <= 0 {
		return 0, errors.New(key + " must be a positive integer")
	}
	return time.Duration(n) * time.Second, nil
}

func splitList(raw string) []string {
	var out []string
	for _, part := range strings.Split(raw, ",") {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}
