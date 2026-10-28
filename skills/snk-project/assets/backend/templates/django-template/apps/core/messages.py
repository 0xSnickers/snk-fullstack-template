"""Error messages by code and language (see docs/API_CONTRACT.md).

`Accept-Language: zh*` -> Simplified Chinese, otherwise English.
Unknown codes keep their own message.
"""

MESSAGES: dict[str, tuple[str, str]] = {
    "VALIDATION_ERROR": ("请求参数不合法", "Invalid request parameters"),
    "UNAUTHORIZED": ("未登录或登录已过期", "Authentication required"),
    "INVALID_CREDENTIALS": ("邮箱或密码错误", "Invalid email or password"),
    "FORBIDDEN": ("没有权限执行该操作", "Permission denied"),
    "NOT_FOUND": ("接口不存在", "Resource not found"),
    "USER_NOT_FOUND": ("用户不存在", "User not found"),
    "METHOD_NOT_ALLOWED": ("不支持的请求方法", "Method not allowed"),
    "EMAIL_EXISTS": ("该邮箱已注册", "Email already in use"),
    "NOT_READY": ("服务暂不可用", "Service not ready"),
    "INTERNAL_ERROR": ("服务器内部错误", "Internal server error"),
}


def localize(code: str, accept_language: str | None, fallback: str) -> str:
    entry = MESSAGES.get(code)
    if entry is None:
        return fallback
    zh, en = entry
    return zh if (accept_language or "").lower().startswith("zh") else en
