package router_test

import (
	"context"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/your-org/gin-template/internal/token"
	"github.com/your-org/gin-template/internal/user"
)

// In-memory repositories so router tests need no database.

type memoryUsers struct {
	mu    sync.Mutex
	users map[uuid.UUID]user.User
}

func (m *memoryUsers) FindPage(_ context.Context, offset, limit int) ([]user.User, int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	all := make([]user.User, 0, len(m.users))
	for _, u := range m.users {
		all = append(all, u)
	}
	sort.Slice(all, func(i, j int) bool { return all[i].CreatedAt.After(all[j].CreatedAt) })
	if offset >= len(all) {
		return []user.User{}, int64(len(all)), nil
	}
	return all[offset:min(offset+limit, len(all))], int64(len(all)), nil
}

func (m *memoryUsers) FindByID(_ context.Context, id uuid.UUID) (*user.User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if u, ok := m.users[id]; ok {
		return &u, nil
	}
	return nil, nil
}

func (m *memoryUsers) FindByEmail(_ context.Context, email string) (*user.User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, u := range m.users {
		if u.Email == email {
			return &u, nil
		}
	}
	return nil, nil
}

func (m *memoryUsers) Create(_ context.Context, u *user.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := time.Now()
	u.CreatedAt, u.UpdatedAt = now, now
	m.users[u.ID] = *u
	return nil
}

func (m *memoryUsers) Update(_ context.Context, u *user.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	u.UpdatedAt = time.Now()
	m.users[u.ID] = *u
	return nil
}

func (m *memoryUsers) Delete(_ context.Context, id uuid.UUID) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.users, id)
	return nil
}

type memoryRefresh struct {
	mu     sync.Mutex
	tokens map[string]token.RefreshToken
}

func (m *memoryRefresh) Create(_ context.Context, t *token.RefreshToken) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.tokens[t.TokenHash] = *t
	return nil
}

func (m *memoryRefresh) FindUserID(_ context.Context, hash string) (uuid.UUID, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if t, ok := m.tokens[hash]; ok && t.ExpiresAt.After(time.Now()) {
		return t.UserID, nil
	}
	return uuid.Nil, nil
}

func (m *memoryRefresh) Delete(_ context.Context, hash string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.tokens, hash)
	return nil
}
