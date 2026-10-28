package httpx

import (
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const requestIDKey = "requestId"

var internalError = NewError(http.StatusInternalServerError, "INTERNAL_ERROR", "Internal server error")

// RequestID propagates / generates X-Request-ID and writes one log line per request.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader("X-Request-ID")
		if id == "" {
			id = uuid.NewString()
		}
		c.Set(requestIDKey, id)
		c.Header("X-Request-ID", id)

		start := time.Now()
		c.Next()
		slog.Info("request completed",
			"requestId", id,
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"durationMs", time.Since(start).Milliseconds(),
		)
	}
}

// ErrorHandler converts errors attached via c.Error(err) into the unified error body.
// *Error is rendered as-is; anything else becomes 500 INTERNAL_ERROR.
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if len(c.Errors) == 0 || c.Writer.Written() {
			return
		}
		err := c.Errors.Last().Err
		var appErr *Error
		if errors.As(err, &appErr) {
			Fail(c, appErr)
			return
		}
		slog.Error("unhandled error", "requestId", c.GetString(requestIDKey), "err", err)
		Fail(c, internalError)
	}
}

// Recovery turns panics into 500 INTERNAL_ERROR.
func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered any) {
		slog.Error("panic recovered", "requestId", c.GetString(requestIDKey), "panic", recovered)
		Fail(c, internalError)
	})
}

// NoRoute renders 404 NOT_FOUND for unmatched routes.
func NoRoute(c *gin.Context) {
	Fail(c, NewError(http.StatusNotFound, "NOT_FOUND", "Route "+c.Request.Method+" "+c.Request.URL.Path+" not found"))
}

// NoMethod renders 405 METHOD_NOT_ALLOWED.
func NoMethod(c *gin.Context) {
	Fail(c, NewError(http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Method not allowed"))
}
