package auth

import (
	"context"
	"net/http"

	"github.com/google/uuid"

	"github.com/your-org/gin-template/internal/httpx"
	"github.com/your-org/gin-template/internal/token"
	"github.com/your-org/gin-template/internal/user"
)

// Session is the payload of register / login / refresh.
type Session struct {
	User        *user.User `json:"user"`
	AccessToken string     `json:"accessToken"`
}

type Service struct {
	users  *user.Service
	tokens *token.Manager
}

func NewService(users *user.Service, tokens *token.Manager) *Service {
	return &Service{users: users, tokens: tokens}
}

var errSessionExpired = httpx.Unauthorized("Session expired")

// Register creates a user and returns the session plus a refresh token for the cookie.
func (s *Service) Register(ctx context.Context, req RegisterRequest) (*Session, string, error) {
	u, err := s.users.Create(ctx, user.CreateRequest{Name: req.Name, Email: req.Email, Password: req.Password, Role: user.RoleUser})
	if err != nil {
		return nil, "", err
	}
	return s.withRefresh(ctx, u)
}

func (s *Service) Login(ctx context.Context, req LoginRequest) (*Session, string, error) {
	u, err := s.users.VerifyCredentials(ctx, req.Email, req.Password)
	if err != nil {
		return nil, "", err
	}
	if u == nil {
		return nil, "", httpx.NewError(http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")
	}
	return s.withRefresh(ctx, u)
}

// Refresh does not rotate the refresh token so that the Next.js BFF /auth/session flow keeps working.
func (s *Service) Refresh(ctx context.Context, refreshToken string) (*Session, error) {
	if refreshToken == "" {
		return nil, errSessionExpired
	}
	userID, err := s.tokens.ResolveRefresh(ctx, refreshToken)
	if err != nil {
		return nil, err
	}
	if userID == uuid.Nil {
		return nil, errSessionExpired
	}
	u, err := s.users.Get(ctx, userID)
	if err != nil {
		return nil, errSessionExpired
	}
	return s.session(u)
}

func (s *Service) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	return s.tokens.RevokeRefresh(ctx, refreshToken)
}

func (s *Service) session(u *user.User) (*Session, error) {
	access, err := s.tokens.SignAccess(u.ID, u.Role)
	if err != nil {
		return nil, err
	}
	return &Session{User: u, AccessToken: access}, nil
}

func (s *Service) withRefresh(ctx context.Context, u *user.User) (*Session, string, error) {
	sess, err := s.session(u)
	if err != nil {
		return nil, "", err
	}
	refresh, err := s.tokens.IssueRefresh(ctx, u.ID)
	return sess, refresh, err
}
