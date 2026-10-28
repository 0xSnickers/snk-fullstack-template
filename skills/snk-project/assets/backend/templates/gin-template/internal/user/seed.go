package user

import (
	"context"
	"log/slog"
)

// DemoUser matches the demo account of the frontend mock server.
var DemoUser = CreateRequest{Name: "Demo User", Email: "demo@example.com", Password: "password123", Role: RoleAdmin}

// SeedDemoUser creates the demo admin account when it does not exist (SEED_DEMO_USER=true).
func SeedDemoUser(ctx context.Context, repo Repository, svc *Service) error {
	existing, err := repo.FindByEmail(ctx, DemoUser.Email)
	if err != nil || existing != nil {
		return err
	}
	if _, err := svc.Create(ctx, DemoUser); err != nil {
		return err
	}
	slog.Info("demo user created", "email", DemoUser.Email)
	return nil
}
