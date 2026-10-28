package token

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RefreshToken stores only the SHA-256 hash of an opaque refresh token.
type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index"`
	TokenHash string    `gorm:"size:64;not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

func (RefreshToken) TableName() string { return "refresh_tokens" }

// RefreshRepository abstracts refresh token storage so it can be faked in tests.
type RefreshRepository interface {
	Create(ctx context.Context, t *RefreshToken) error
	// FindUserID returns the owner of a non-expired token, or uuid.Nil.
	FindUserID(ctx context.Context, tokenHash string) (uuid.UUID, error)
	Delete(ctx context.Context, tokenHash string) error
}

type gormRefreshRepository struct{ db *gorm.DB }

func NewGormRefreshRepository(db *gorm.DB) RefreshRepository { return &gormRefreshRepository{db: db} }

func (r *gormRefreshRepository) Create(ctx context.Context, t *RefreshToken) error {
	return r.db.WithContext(ctx).Create(t).Error
}

func (r *gormRefreshRepository) FindUserID(ctx context.Context, tokenHash string) (uuid.UUID, error) {
	var t RefreshToken
	err := r.db.WithContext(ctx).Where("token_hash = ? AND expires_at > ?", tokenHash, time.Now()).First(&t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return uuid.Nil, nil
	}
	return t.UserID, err
}

func (r *gormRefreshRepository) Delete(ctx context.Context, tokenHash string) error {
	return r.db.WithContext(ctx).Where("token_hash = ?", tokenHash).Delete(&RefreshToken{}).Error
}
