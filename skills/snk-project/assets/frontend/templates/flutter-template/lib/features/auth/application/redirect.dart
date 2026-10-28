/// 只允许站内相对路径作为登录后的跳转地址，防止开放重定向。
String safeRedirect(String? value, {String fallback = '/'}) {
  if (value == null || !value.startsWith('/') || value.startsWith('//') || value.startsWith(r'/\')) {
    return fallback;
  }
  return value;
}
