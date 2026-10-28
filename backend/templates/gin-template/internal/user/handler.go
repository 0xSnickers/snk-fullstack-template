package user

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/your-org/gin-template/internal/httpx"
	"github.com/your-org/gin-template/internal/token"
)

type Handler struct {
	svc    *Service
	tokens *token.Manager
}

func NewHandler(svc *Service, tokens *token.Manager) *Handler {
	return &Handler{svc: svc, tokens: tokens}
}

// Register mounts the routes: reads need a login, writes need the admin role.
func (h *Handler) Register(rg *gin.RouterGroup) {
	rg.Use(token.Authenticate(h.tokens))
	admin := token.RequireRole(RoleAdmin)

	rg.GET("", h.list)
	rg.GET("/:id", h.get)
	rg.POST("", admin, h.create)
	rg.PUT("/:id", admin, h.update)
	rg.DELETE("/:id", admin, h.delete)
}

func (h *Handler) list(c *gin.Context) {
	var q httpx.PageQuery
	if !httpx.BindQuery(c, &q) {
		return
	}
	page, err := h.svc.List(c.Request.Context(), q)
	httpx.Respond(c, http.StatusOK, page, err)
}

func (h *Handler) get(c *gin.Context) {
	if id, ok := httpx.ParamUUID(c, "id"); ok {
		u, err := h.svc.Get(c.Request.Context(), id)
		httpx.Respond(c, http.StatusOK, u, err)
	}
}

func (h *Handler) create(c *gin.Context) {
	var req CreateRequest
	if httpx.BindJSON(c, &req) {
		u, err := h.svc.Create(c.Request.Context(), req)
		httpx.Respond(c, http.StatusCreated, u, err)
	}
}

func (h *Handler) update(c *gin.Context) {
	id, ok := httpx.ParamUUID(c, "id")
	var req UpdateRequest
	if ok && httpx.BindJSON(c, &req) {
		u, err := h.svc.Update(c.Request.Context(), id, req)
		httpx.Respond(c, http.StatusOK, u, err)
	}
}

func (h *Handler) delete(c *gin.Context) {
	if id, ok := httpx.ParamUUID(c, "id"); ok {
		err := h.svc.Delete(c.Request.Context(), id)
		httpx.Respond(c, http.StatusOK, gin.H{"id": id}, err)
	}
}
