package user

import (
	"context"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/your-org/gin-template/internal/httpx"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, q httpx.PageQuery) (httpx.Page[User], error) {
	items, total, err := s.repo.FindPage(ctx, q.Offset(), q.Limit)
	if err != nil {
		return httpx.Page[User]{}, err
	}
	return httpx.NewPage(items, total, q), nil
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*User, error) {
	u, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, httpx.NotFound("USER_NOT_FOUND", "User not found")
	}
	return u, nil
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (*User, error) {
	if err := s.ensureEmailFree(ctx, req.Email, uuid.Nil); err != nil {
		return nil, err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	u := &User{ID: uuid.New(), Name: req.Name, Email: req.Email, Role: req.Role, PasswordHash: string(hash)}
	if err := s.repo.Create(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req UpdateRequest) (*User, error) {
	u, err := s.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Email != nil {
		if err := s.ensureEmailFree(ctx, *req.Email, id); err != nil {
			return nil, err
		}
		u.Email = *req.Email
	}
	if req.Name != nil {
		u.Name = *req.Name
	}
	if req.Role != nil {
		u.Role = *req.Role
	}
	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	if _, err := s.Get(ctx, id); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

// VerifyCredentials returns the user when email and password match, otherwise nil.
func (s *Service) VerifyCredentials(ctx context.Context, email, password string) (*User, error) {
	u, err := s.repo.FindByEmail(ctx, email)
	if err != nil || u == nil {
		return nil, err
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) != nil {
		return nil, nil
	}
	return u, nil
}

func (s *Service) ensureEmailFree(ctx context.Context, email string, exclude uuid.UUID) error {
	existing, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	if existing != nil && existing.ID != exclude {
		return httpx.Conflict("EMAIL_EXISTS", "Email already in use")
	}
	return nil
}
