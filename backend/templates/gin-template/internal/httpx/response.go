package httpx

import "github.com/gin-gonic/gin"

type successBody struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data"`
	Details any    `json:"details,omitempty"`
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int64 `json:"totalPages"`
}

type Page[T any] struct {
	Items      []T        `json:"items"`
	Pagination Pagination `json:"pagination"`
}

type PageQuery struct {
	Page  int `form:"page,default=1" binding:"min=1"`
	Limit int `form:"limit,default=10" binding:"min=1,max=100"`
}

func (q PageQuery) Offset() int { return (q.Page - 1) * q.Limit }

func NewPage[T any](items []T, total int64, q PageQuery) Page[T] {
	if items == nil {
		items = []T{}
	}
	pages := (total + int64(q.Limit) - 1) / int64(q.Limit)
	return Page[T]{Items: items, Pagination: Pagination{Page: q.Page, Limit: q.Limit, Total: total, TotalPages: pages}}
}

// OK writes { code: 0, message: "success", data }.
func OK(c *gin.Context, status int, data any) {
	c.JSON(status, successBody{Code: 0, Message: "success", Data: data})
}

// Fail writes { code, message, data: null, details? } and aborts the chain.
// The message follows the request's Accept-Language.
func Fail(c *gin.Context, e *Error) {
	message := Localize(e.Code, c.GetHeader("Accept-Language"), e.Message)
	c.AbortWithStatusJSON(e.Status, errorBody{Code: e.Code, Message: message, Details: e.Details})
}

// Respond writes data on success, or records err for ErrorHandler.
func Respond(c *gin.Context, status int, data any, err error) {
	if err != nil {
		_ = c.Error(err)
		return
	}
	OK(c, status, data)
}
