package httpx

import "strings"

// messages holds {zh, en} texts per error code (see docs/API_CONTRACT.md).
var messages = map[string][2]string{
	"VALIDATION_ERROR":    {"请求参数不合法", "Invalid request parameters"},
	"UNAUTHORIZED":        {"未登录或登录已过期", "Authentication required"},
	"INVALID_CREDENTIALS": {"邮箱或密码错误", "Invalid email or password"},
	"FORBIDDEN":           {"没有权限执行该操作", "Permission denied"},
	"NOT_FOUND":           {"接口不存在", "Resource not found"},
	"USER_NOT_FOUND":      {"用户不存在", "User not found"},
	"METHOD_NOT_ALLOWED":  {"不支持的请求方法", "Method not allowed"},
	"EMAIL_EXISTS":        {"该邮箱已注册", "Email already in use"},
	"NOT_READY":           {"服务暂不可用", "Service not ready"},
	"INTERNAL_ERROR":      {"服务器内部错误", "Internal server error"},
}

// Localize picks the message for code by Accept-Language (zh* -> Chinese, otherwise English).
// Unknown codes keep their own message.
func Localize(code, acceptLanguage, fallback string) string {
	m, ok := messages[code]
	if !ok {
		return fallback
	}
	if strings.HasPrefix(strings.ToLower(acceptLanguage), "zh") {
		return m[0]
	}
	return m[1]
}
