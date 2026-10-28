/**
 * Error messages by code and language (see docs/API_CONTRACT.md §2).
 * `Accept-Language: zh*` -> Simplified Chinese, otherwise English. Unknown codes keep their own message.
 */
const MESSAGES: Record<string, { zh: string; en: string }> = {
  VALIDATION_ERROR: { zh: '请求参数不合法', en: 'Invalid request parameters' },
  UNAUTHORIZED: { zh: '未登录或登录已过期', en: 'Authentication required' },
  INVALID_CREDENTIALS: { zh: '邮箱或密码错误', en: 'Invalid email or password' },
  FORBIDDEN: { zh: '没有权限执行该操作', en: 'Permission denied' },
  NOT_FOUND: { zh: '接口不存在', en: 'Resource not found' },
  USER_NOT_FOUND: { zh: '用户不存在', en: 'User not found' },
  METHOD_NOT_ALLOWED: { zh: '不支持的请求方法', en: 'Method not allowed' },
  EMAIL_EXISTS: { zh: '该邮箱已注册', en: 'Email already in use' },
  NOT_READY: { zh: '服务暂不可用', en: 'Service not ready' },
  INTERNAL_ERROR: { zh: '服务器内部错误', en: 'Internal server error' },
};

export function localize(code: string, acceptLanguage: string | undefined, fallback: string) {
  const entry = MESSAGES[code];
  if (!entry) return fallback;
  return acceptLanguage?.toLowerCase().startsWith('zh') ? entry.zh : entry.en;
}
