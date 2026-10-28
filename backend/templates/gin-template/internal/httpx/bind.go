package httpx

import (
	"encoding/json"
	"errors"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// Normalizer is implemented by request DTOs that trim / lowercase input before validation.
type Normalizer interface{ Normalize() }

// BindJSON decodes the body, normalizes it, then validates, so " A@B.com " is accepted as "a@b.com".
// On failure it records a VALIDATION_ERROR on the context and returns false.
func BindJSON(c *gin.Context, dst Normalizer) bool {
	if err := json.NewDecoder(c.Request.Body).Decode(dst); err != nil {
		_ = c.Error(Validation(map[string][]string{"body": {"invalid JSON"}}))
		return false
	}
	dst.Normalize()
	if err := binding.Validator.ValidateStruct(dst); err != nil {
		_ = c.Error(validationError(err))
		return false
	}
	return true
}

// BindQuery binds and validates query parameters.
func BindQuery(c *gin.Context, dst any) bool {
	if err := c.ShouldBindQuery(dst); err != nil {
		_ = c.Error(validationError(err))
		return false
	}
	return true
}

// ParamUUID parses a UUID path parameter.
func ParamUUID(c *gin.Context, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(name))
	if err != nil {
		_ = c.Error(Validation(map[string][]string{name: {"must be a valid UUID"}}))
		return uuid.Nil, false
	}
	return id, true
}

func validationError(err error) *Error {
	var ve validator.ValidationErrors
	if !errors.As(err, &ve) {
		return Validation(map[string][]string{"query": {err.Error()}})
	}
	details := map[string][]string{}
	for _, fe := range ve {
		details[fe.Field()] = append(details[fe.Field()], fe.Tag())
	}
	return Validation(details)
}

// UseJSONFieldNames makes validation errors report json/form names (email) instead of Go names (Email).
func UseJSONFieldNames() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterTagNameFunc(func(f reflect.StructField) string {
			for _, tag := range []string{"json", "form"} {
				if name := strings.Split(f.Tag.Get(tag), ",")[0]; name != "" && name != "-" {
					return name
				}
			}
			return f.Name
		})
	}
}
