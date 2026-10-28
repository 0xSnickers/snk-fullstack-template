package user

import "strings"

func normalizeEmail(s string) string { return strings.ToLower(strings.TrimSpace(s)) }

type CreateRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=50"`
	Email    string `json:"email" binding:"required,email,max=255"`
	Password string `json:"password" binding:"required,min=8,max=72"`
	Role     string `json:"role" binding:"omitempty,oneof=user admin"`
}

func (r *CreateRequest) Normalize() {
	r.Name = strings.TrimSpace(r.Name)
	r.Email = normalizeEmail(r.Email)
	if r.Role == "" {
		r.Role = RoleUser
	}
}

type UpdateRequest struct {
	Name  *string `json:"name" binding:"omitempty,min=2,max=50"`
	Email *string `json:"email" binding:"omitempty,email,max=255"`
	Role  *string `json:"role" binding:"omitempty,oneof=user admin"`
}

func (r *UpdateRequest) Normalize() {
	if r.Name != nil {
		v := strings.TrimSpace(*r.Name)
		r.Name = &v
	}
	if r.Email != nil {
		v := normalizeEmail(*r.Email)
		r.Email = &v
	}
}
