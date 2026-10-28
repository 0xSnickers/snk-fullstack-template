package token

import (
	"slices"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/your-org/gin-template/internal/httpx"
)

const claimsKey = "authClaims"

// Authenticate requires `Authorization: Bearer <accessToken>` and stores the claims on the context.
func Authenticate(m *Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw, ok := strings.CutPrefix(c.GetHeader("Authorization"), "Bearer ")
		claims, valid := m.VerifyAccess(raw)
		if !ok || !valid {
			httpx.Fail(c, httpx.Unauthorized("Authentication required"))
			return
		}
		c.Set(claimsKey, claims)
		c.Next()
	}
}

// RequireRole must run after Authenticate.
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !slices.Contains(roles, ClaimsFrom(c).Role) {
			httpx.Fail(c, httpx.Forbidden())
			return
		}
		c.Next()
	}
}

// ClaimsFrom returns the claims set by Authenticate.
func ClaimsFrom(c *gin.Context) Claims {
	claims, _ := c.MustGet(claimsKey).(Claims)
	return claims
}
