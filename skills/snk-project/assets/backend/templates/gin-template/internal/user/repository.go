package user

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Repository abstracts persistence so services can be tested without a database.
type Repository interface {
	FindPage(ctx context.Context, offset, limit int) ([]User, int64, error)
	FindByID(ctx context.Context, id uuid.UUID) (*User, error) // nil, nil when not found
	FindByEmail(ctx context.Context, email string) (*User, error)
	Create(ctx context.Context, u *User) error
	Update(ctx context.Context, u *User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type gormRepository struct{ db *gorm.DB }

func NewGormRepository(db *gorm.DB) Repository { return &gormRepository{db: db} }

func (r *gormRepository) FindPage(ctx context.Context, offset, limit int) ([]User, int64, error) {
	var (
		items []User
		total int64
	)
	db := r.db.WithContext(ctx)
	if err := db.Model(&User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := db.Order("created_at DESC").Offset(offset).Limit(limit).Find(&items).Error
	return items, total, err
}

func (r *gormRepository) FindByID(ctx context.Context, id uuid.UUID) (*User, error) {
	return r.first(ctx, "id = ?", id)
}

func (r *gormRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
	return r.first(ctx, "email = ?", email)
}

func (r *gormRepository) first(ctx context.Context, query string, arg any) (*User, error) {
	var u User
	err := r.db.WithContext(ctx).Where(query, arg).First(&u).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *gormRepository) Create(ctx context.Context, u *User) error {
	return r.db.WithContext(ctx).Create(u).Error
}

func (r *gormRepository) Update(ctx context.Context, u *User) error {
	return r.db.WithContext(ctx).Save(u).Error
}

func (r *gormRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&User{}, "id = ?", id).Error
}
