/** 只允许站内相对路径作为登录后的跳转地址，防止开放重定向。 */
export function getSafeRedirect(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }

  return value;
}
