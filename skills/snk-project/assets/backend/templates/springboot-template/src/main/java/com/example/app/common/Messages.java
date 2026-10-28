package com.example.app.common;

import java.util.Locale;
import java.util.Map;

/**
 * Error messages by code and language (see docs/API_CONTRACT.md).
 * {@code Accept-Language: zh*} -> Simplified Chinese, otherwise English. Unknown codes keep their own message.
 */
public final class Messages {

    private static final Map<String, String[]> MESSAGES = Map.ofEntries(
            Map.entry("VALIDATION_ERROR", new String[] {"请求参数不合法", "Invalid request parameters"}),
            Map.entry("UNAUTHORIZED", new String[] {"未登录或登录已过期", "Authentication required"}),
            Map.entry("INVALID_CREDENTIALS", new String[] {"邮箱或密码错误", "Invalid email or password"}),
            Map.entry("FORBIDDEN", new String[] {"没有权限执行该操作", "Permission denied"}),
            Map.entry("NOT_FOUND", new String[] {"接口不存在", "Resource not found"}),
            Map.entry("USER_NOT_FOUND", new String[] {"用户不存在", "User not found"}),
            Map.entry("METHOD_NOT_ALLOWED", new String[] {"不支持的请求方法", "Method not allowed"}),
            Map.entry("EMAIL_EXISTS", new String[] {"该邮箱已注册", "Email already in use"}),
            Map.entry("NOT_READY", new String[] {"服务暂不可用", "Service not ready"}),
            Map.entry("INTERNAL_ERROR", new String[] {"服务器内部错误", "Internal server error"}));

    private Messages() {}

    public static String localize(String code, String acceptLanguage, String fallback) {
        String[] entry = MESSAGES.get(code);
        if (entry == null) {
            return fallback;
        }
        boolean zh = acceptLanguage != null && acceptLanguage.toLowerCase(Locale.ROOT).startsWith("zh");
        return zh ? entry[0] : entry[1];
    }
}
