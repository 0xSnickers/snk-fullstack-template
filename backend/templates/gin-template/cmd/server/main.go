package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/your-org/gin-template/internal/auth"
	"github.com/your-org/gin-template/internal/config"
	"github.com/your-org/gin-template/internal/database"
	"github.com/your-org/gin-template/internal/logger"
	"github.com/your-org/gin-template/internal/router"
	"github.com/your-org/gin-template/internal/token"
	"github.com/your-org/gin-template/internal/user"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	logFile, err := logger.Setup(cfg.LogLevel, cfg.LogFile)
	if err != nil {
		return err
	}
	defer logFile.Close()

	db, err := database.Open(cfg.DatabaseURL)
	if err != nil {
		return err
	}
	if cfg.AutoMigrate {
		if err := db.AutoMigrate(&user.User{}, &token.RefreshToken{}); err != nil {
			return err
		}
	}

	// Wire dependencies by hand: repository -> service -> handler.
	userRepo := user.NewGormRepository(db)
	users := user.NewService(userRepo)
	tokens := token.NewManager(token.Options{
		Secret: cfg.JWTSecret, AccessTTL: cfg.AccessTokenTTL, RefreshTTL: cfg.RefreshTokenTTL,
	}, token.NewGormRefreshRepository(db))

	ctx := context.Background()
	if cfg.SeedDemoUser {
		if err := user.SeedDemoUser(ctx, userRepo, users); err != nil {
			return err
		}
	}

	engine := router.New(router.Deps{
		Production:  cfg.AppEnv == "production",
		CORSOrigins: cfg.CORSOrigins,
		Ready:       database.Pinger(db),
		Auth:        auth.NewHandler(auth.NewService(users, tokens), users, tokens, cfg.CookieSecure),
		Users:       user.NewHandler(users, tokens),
	})
	return serve(&http.Server{Addr: ":" + cfg.Port, Handler: engine, ReadHeaderTimeout: 10 * time.Second})
}

// serve runs the server until SIGINT/SIGTERM, then shuts down gracefully.
func serve(srv *http.Server) error {
	errCh := make(chan error, 1)
	go func() {
		slog.Info("HTTP server listening", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	select {
	case err := <-errCh:
		return err
	case <-quit:
	}
	slog.Info("shutting down")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return srv.Shutdown(ctx)
}
