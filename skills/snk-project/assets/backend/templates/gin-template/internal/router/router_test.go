package router_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/your-org/gin-template/internal/auth"
	"github.com/your-org/gin-template/internal/router"
	"github.com/your-org/gin-template/internal/token"
	"github.com/your-org/gin-template/internal/user"
)

type body struct {
	Code    any                        `json:"code"`
	Message string                     `json:"message"`
	Data    json.RawMessage            `json:"data"`
	Details map[string]json.RawMessage `json:"details"`
}

type client struct {
	t *testing.T
	h http.Handler
}

func newClient(t *testing.T, readyErr error) *client {
	t.Helper()
	gin.SetMode(gin.TestMode)
	userRepo := &memoryUsers{users: map[uuid.UUID]user.User{}}
	users := user.NewService(userRepo)
	tokens := token.NewManager(token.Options{
		Secret: "test-secret-test-secret-test-secret-123", AccessTTL: time.Minute, RefreshTTL: time.Hour,
	}, &memoryRefresh{tokens: map[string]token.RefreshToken{}})
	if err := user.SeedDemoUser(context.Background(), userRepo, users); err != nil {
		t.Fatal(err)
	}
	h := router.New(router.Deps{
		Ready: func(context.Context) error { return readyErr },
		Auth:  auth.NewHandler(auth.NewService(users, tokens), users, tokens, false),
		Users: user.NewHandler(users, tokens),
	})
	return &client{t: t, h: h}
}

// do sends a request; headers are "Key: value" strings.
func (c *client) do(method, path, payload string, headers ...string) (*httptest.ResponseRecorder, body) {
	c.t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	for _, h := range headers {
		k, v, _ := strings.Cut(h, ": ")
		req.Header.Set(k, v)
	}
	w := httptest.NewRecorder()
	c.h.ServeHTTP(w, req)
	var b body
	if err := json.Unmarshal(w.Body.Bytes(), &b); err != nil {
		c.t.Fatalf("%s %s: invalid JSON %q", method, path, w.Body.String())
	}
	return w, b
}

func (c *client) expect(w *httptest.ResponseRecorder, b body, status int, code any) {
	c.t.Helper()
	if w.Code != status || b.Code != code {
		c.t.Fatalf("want %d %v, got %d %v: %s", status, code, w.Code, b.Code, w.Body.String())
	}
}

// login returns the bearer header and the refresh cookie header.
func (c *client) login(email, password string) (string, string) {
	c.t.Helper()
	w, b := c.do(http.MethodPost, "/api/v1/auth/login", `{"email":"`+email+`","password":"`+password+`"}`)
	c.expect(w, b, http.StatusOK, float64(0))
	var sess struct{ AccessToken string }
	_ = json.Unmarshal(b.Data, &sess)
	cookie := strings.Split(w.Header().Get("Set-Cookie"), ";")[0]
	return "Authorization: Bearer " + sess.AccessToken, "Cookie: " + cookie
}

func TestOps(t *testing.T) {
	c := newClient(t, nil)
	w, b := c.do(http.MethodGet, "/api/health", "", "X-Request-ID: abc")
	c.expect(w, b, http.StatusOK, float64(0))
	if w.Header().Get("X-Request-ID") != "abc" {
		t.Fatal("X-Request-ID not echoed")
	}
	w, b = c.do(http.MethodGet, "/api/v1/nope", "")
	c.expect(w, b, http.StatusNotFound, "NOT_FOUND")
	if string(b.Data) != "null" {
		t.Fatalf("error data must be null, got %s", b.Data)
	}
	if _, zh := c.do(http.MethodGet, "/api/v1/nope", "", "Accept-Language: zh-CN"); zh.Message != "接口不存在" {
		t.Fatalf("zh message: %q", zh.Message)
	}
	if _, en := c.do(http.MethodGet, "/api/v1/nope", "", "Accept-Language: en-US"); en.Message != "Resource not found" {
		t.Fatalf("en message: %q", en.Message)
	}
	w, b = c.do(http.MethodPost, "/api/v1/auth/login", "{bad")
	c.expect(w, b, http.StatusBadRequest, "VALIDATION_ERROR")

	down := newClient(t, errors.New("down"))
	w, b = down.do(http.MethodGet, "/api/ready", "")
	down.expect(w, b, http.StatusServiceUnavailable, "NOT_READY")
}

func TestAuthFlow(t *testing.T) {
	c := newClient(t, nil)
	w, b := c.do(http.MethodPost, "/api/v1/auth/register", `{"name":" Alice ","email":" ALICE@example.com ","password":"password123"}`)
	c.expect(w, b, http.StatusCreated, float64(0))
	if !strings.Contains(string(b.Data), `"email":"alice@example.com"`) || strings.Contains(string(b.Data), "assword") {
		t.Fatalf("bad register payload: %s", b.Data)
	}
	if sc := w.Header().Get("Set-Cookie"); !strings.Contains(sc, "refresh_token=") || !strings.Contains(sc, "HttpOnly") {
		t.Fatalf("bad cookie: %s", sc)
	}

	w, b = c.do(http.MethodPost, "/api/v1/auth/register", `{"name":"Alice","email":"alice@example.com","password":"password123"}`)
	c.expect(w, b, http.StatusConflict, "EMAIL_EXISTS")
	w, b = c.do(http.MethodPost, "/api/v1/auth/login", `{"email":"alice@example.com","password":"wrong-password"}`)
	c.expect(w, b, http.StatusUnauthorized, "INVALID_CREDENTIALS")

	bearer, cookie := c.login("alice@example.com", "password123")
	w, b = c.do(http.MethodGet, "/api/v1/auth/me", "", bearer)
	c.expect(w, b, http.StatusOK, float64(0))
	w, b = c.do(http.MethodGet, "/api/v1/auth/me", "", "Authorization: Bearer nope")
	c.expect(w, b, http.StatusUnauthorized, "UNAUTHORIZED")

	w, b = c.do(http.MethodPost, "/api/v1/auth/refresh", "", cookie)
	c.expect(w, b, http.StatusOK, float64(0))
	w, b = c.do(http.MethodPost, "/api/v1/auth/logout", "", cookie)
	c.expect(w, b, http.StatusOK, float64(0))
	w, b = c.do(http.MethodPost, "/api/v1/auth/session", "", cookie)
	c.expect(w, b, http.StatusUnauthorized, "UNAUTHORIZED")
}

func TestUsers(t *testing.T) {
	c := newClient(t, nil)
	w, b := c.do(http.MethodGet, "/api/v1/users", "")
	c.expect(w, b, http.StatusUnauthorized, "UNAUTHORIZED")

	c.do(http.MethodPost, "/api/v1/auth/register", `{"name":"Bob","email":"bob@example.com","password":"password123"}`)
	member, _ := c.login("bob@example.com", "password123")
	admin, _ := c.login(user.DemoUser.Email, user.DemoUser.Password)

	w, b = c.do(http.MethodGet, "/api/v1/users", "", member)
	c.expect(w, b, http.StatusOK, float64(0))
	if !strings.Contains(string(b.Data), `"pagination":{"page":1,"limit":10,"total":2,"totalPages":1}`) {
		t.Fatalf("bad pagination: %s", b.Data)
	}
	for _, path := range []string{"/api/v1/users?limit=1000", "/api/v1/users/not-a-uuid"} {
		w, b = c.do(http.MethodGet, path, "", member)
		c.expect(w, b, http.StatusBadRequest, "VALIDATION_ERROR")
	}

	carol := `{"name":"Carol","email":"carol@example.com","password":"password123"}`
	w, b = c.do(http.MethodPost, "/api/v1/users", carol, member)
	c.expect(w, b, http.StatusForbidden, "FORBIDDEN")
	w, b = c.do(http.MethodPost, "/api/v1/users", carol, admin)
	c.expect(w, b, http.StatusCreated, float64(0))
	var created user.User
	_ = json.Unmarshal(b.Data, &created)
	path := "/api/v1/users/" + created.ID.String()

	w, b = c.do(http.MethodPut, path, `{"role":"admin"}`, admin)
	c.expect(w, b, http.StatusOK, float64(0))
	w, b = c.do(http.MethodPut, path, `{"role":"root"}`, admin)
	c.expect(w, b, http.StatusBadRequest, "VALIDATION_ERROR")
	w, b = c.do(http.MethodPut, path, `{"email":"bob@example.com"}`, admin)
	c.expect(w, b, http.StatusConflict, "EMAIL_EXISTS")
	w, b = c.do(http.MethodDelete, path, "", admin)
	c.expect(w, b, http.StatusOK, float64(0))
	w, b = c.do(http.MethodGet, path, "", admin)
	c.expect(w, b, http.StatusNotFound, "USER_NOT_FOUND")
}
