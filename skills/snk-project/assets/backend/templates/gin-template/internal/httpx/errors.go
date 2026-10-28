package httpx

import "net/http"

// Error is a business error with a stable machine-readable code (see docs/API_CONTRACT.md).
type Error struct {
	Status  int
	Code    string
	Message string
	Details any
}

func (e *Error) Error() string { return e.Code + ": " + e.Message }

func NewError(status int, code, message string) *Error {
	return &Error{Status: status, Code: code, Message: message}
}

func Validation(details map[string][]string) *Error {
	return &Error{Status: http.StatusBadRequest, Code: "VALIDATION_ERROR", Message: "Invalid request parameters", Details: details}
}

func Unauthorized(message string) *Error {
	return NewError(http.StatusUnauthorized, "UNAUTHORIZED", message)
}

func Forbidden() *Error { return NewError(http.StatusForbidden, "FORBIDDEN", "Permission denied") }

func NotFound(code, message string) *Error { return NewError(http.StatusNotFound, code, message) }

func Conflict(code, message string) *Error { return NewError(http.StatusConflict, code, message) }
