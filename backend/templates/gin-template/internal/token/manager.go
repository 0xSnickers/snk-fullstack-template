package token

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Claims are the authenticated identity carried by an access token.
type Claims struct {
	UserID uuid.UUID
	Role   string
}

type Options struct {
	Secret     string
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}

// Manager issues and verifies access tokens (JWT HS256) and refresh tokens (opaque, hashed at rest).
type Manager struct {
	opts    Options
	refresh RefreshRepository
}

func NewManager(opts Options, refresh RefreshRepository) *Manager {
	return &Manager{opts: opts, refresh: refresh}
}

func (m *Manager) RefreshTTL() time.Duration { return m.opts.RefreshTTL }

type accessClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func (m *Manager) SignAccess(userID uuid.UUID, role string) (string, error) {
	now := time.Now()
	claims := accessClaims{Role: role, RegisteredClaims: jwt.RegisteredClaims{
		Subject:   userID.String(),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(m.opts.AccessTTL)),
	}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(m.opts.Secret))
}

// VerifyAccess returns claims for a valid token, otherwise false.
func (m *Manager) VerifyAccess(raw string) (Claims, bool) {
	var claims accessClaims
	_, err := jwt.ParseWithClaims(raw, &claims, func(*jwt.Token) (any, error) {
		return []byte(m.opts.Secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil {
		return Claims{}, false
	}
	id, err := uuid.Parse(claims.Subject)
	if err != nil {
		return Claims{}, false
	}
	return Claims{UserID: id, Role: claims.Role}, true
}

func hash(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

// IssueRefresh creates a refresh token for the user and returns the raw value for the cookie.
func (m *Manager) IssueRefresh(ctx context.Context, userID uuid.UUID) (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	raw := base64.RawURLEncoding.EncodeToString(buf)
	err := m.refresh.Create(ctx, &RefreshToken{
		ID: uuid.New(), UserID: userID, TokenHash: hash(raw), ExpiresAt: time.Now().Add(m.opts.RefreshTTL),
	})
	return raw, err
}

// ResolveRefresh returns the owner of a valid refresh token, or uuid.Nil.
func (m *Manager) ResolveRefresh(ctx context.Context, raw string) (uuid.UUID, error) {
	return m.refresh.FindUserID(ctx, hash(raw))
}

func (m *Manager) RevokeRefresh(ctx context.Context, raw string) error {
	return m.refresh.Delete(ctx, hash(raw))
}
