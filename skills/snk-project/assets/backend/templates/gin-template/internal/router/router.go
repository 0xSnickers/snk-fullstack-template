package router

import (
	"context"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/your-org/gin-template/internal/auth"
	"github.com/your-org/gin-template/internal/health"
	"github.com/your-org/gin-template/internal/httpx"
	"github.com/your-org/gin-template/internal/user"
)

type Deps struct {
	Production  bool
	CORSOrigins []string
	Ready       func(ctx context.Context) error
	Auth        *auth.Handler
	Users       *user.Handler
}

func New(d Deps) *gin.Engine {
	if d.Production {
		gin.SetMode(gin.ReleaseMode)
	}
	httpx.UseJSONFieldNames()

	r := gin.New()
	r.HandleMethodNotAllowed = true
	r.Use(httpx.RequestID(), httpx.Recovery(), httpx.ErrorHandler())
	if len(d.CORSOrigins) > 0 {
		r.Use(cors.New(cors.Config{
			AllowOrigins:     d.CORSOrigins,
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Authorization", "Content-Type", "Accept-Language", "X-Request-ID"},
			ExposeHeaders:    []string{"X-Request-ID"},
			AllowCredentials: true,
		}))
	}
	r.NoRoute(httpx.NoRoute)
	r.NoMethod(httpx.NoMethod)

	api := r.Group("/api")
	health.NewHandler(d.Ready).Register(api)
	d.Auth.Register(api.Group("/v1/auth"))
	d.Users.Register(api.Group("/v1/users"))

	return r
}
