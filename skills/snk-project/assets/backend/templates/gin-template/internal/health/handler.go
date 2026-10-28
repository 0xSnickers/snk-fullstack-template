package health

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/your-org/gin-template/internal/httpx"
)

type Handler struct {
	ready func(ctx context.Context) error
}

func NewHandler(ready func(ctx context.Context) error) *Handler { return &Handler{ready: ready} }

func (h *Handler) Register(rg *gin.RouterGroup) {
	rg.GET("/health", h.health)
	rg.GET("/ready", h.readiness)
}

func (h *Handler) health(c *gin.Context) {
	httpx.OK(c, http.StatusOK, gin.H{"status": "ok"})
}

func (h *Handler) readiness(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	if err := h.ready(ctx); err != nil {
		httpx.Fail(c, httpx.NewError(http.StatusServiceUnavailable, "NOT_READY", "Database is not reachable"))
		return
	}
	httpx.OK(c, http.StatusOK, gin.H{"status": "ready"})
}
