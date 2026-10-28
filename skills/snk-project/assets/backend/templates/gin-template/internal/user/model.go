package user

import (
	"time"

	"github.com/google/uuid"

	"github.com/your-org/gin-template/internal/token"
)

const (
	RoleUser  = "user"
	RoleAdmin = "admin"
)

// User is the application user. PasswordHash is never serialized.
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name         string    `gorm:"size:50;not null" json:"name"`
	Email        string    `gorm:"size:255;not null;uniqueIndex" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         string    `gorm:"size:20;not null;default:user" json:"role"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	// Only declared so AutoMigrate creates the FK with ON DELETE CASCADE.
	RefreshTokens []token.RefreshToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (User) TableName() string { return "users" }
