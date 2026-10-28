package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/your-org/gin-template/internal/httpx"
	"github.com/your-org/gin-template/internal/token"
	"github.com/your-org/gin-template/internal/user"
)

const cookieName = "refresh_token"

type Handler struct {
	svc          *Service
	users        *user.Service
	tokens       *token.Manager
	cookieSecure bool
}

func NewHandler(svc *Service, users *user.Service, tokens *token.Manager, cookieSecure bool) *Handler {
	return &Handler{svc: svc, users: users, tokens: tokens, cookieSecure: cookieSecure}
}

func (h *Handler) Register(rg *gin.RouterGroup) {
	rg.POST("/register", h.register)
	rg.POST("/login", h.login)
	rg.POST("/refresh", h.refresh)
	rg.POST("/session", h.refresh)
	rg.POST("/logout", h.logout)
	rg.GET("/me", token.Authenticate(h.tokens), h.me)
}

func (h *Handler) register(c *gin.Context) {
	var req RegisterRequest
	if httpx.BindJSON(c, &req) {
		sess, refresh, err := h.svc.Register(c.Request.Context(), req)
		h.sendSession(c, http.StatusCreated, sess, refresh, err)
	}
}

func (h *Handler) login(c *gin.Context) {
	var req LoginRequest
	if httpx.BindJSON(c, &req) {
		sess, refresh, err := h.svc.Login(c.Request.Context(), req)
		h.sendSession(c, http.StatusOK, sess, refresh, err)
	}
}

func (h *Handler) refresh(c *gin.Context) {
	raw, _ := c.Cookie(cookieName)
	sess, err := h.svc.Refresh(c.Request.Context(), raw)
	httpx.Respond(c, http.StatusOK, sess, err)
}

func (h *Handler) logout(c *gin.Context) {
	raw, _ := c.Cookie(cookieName)
	err := h.svc.Logout(c.Request.Context(), raw)
	if err == nil {
		h.setCookie(c, "", -1)
	}
	httpx.Respond(c, http.StatusOK, gin.H{"success": true}, err)
}

func (h *Handler) me(c *gin.Context) {
	u, err := h.users.Get(c.Request.Context(), token.ClaimsFrom(c).UserID)
	httpx.Respond(c, http.StatusOK, u, err)
}

func (h *Handler) sendSession(c *gin.Context, status int, sess *Session, refresh string, err error) {
	if err == nil {
		h.setCookie(c, refresh, int(h.tokens.RefreshTTL().Seconds()))
	}
	httpx.Respond(c, status, sess, err)
}

// setCookie writes refresh_token as HttpOnly, SameSite=Lax, Path=/. maxAge < 0 deletes it.
func (h *Handler) setCookie(c *gin.Context, value string, maxAge int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(cookieName, value, maxAge, "/", "", h.cookieSecure, true)
}
