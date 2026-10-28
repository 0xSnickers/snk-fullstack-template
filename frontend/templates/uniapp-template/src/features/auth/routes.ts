/** 页面路径集中维护，避免在业务代码中散落字符串。与 pages.json 保持一致。 */
export const routes = {
  home: '/pages/index/index',
  login: '/pages/login/index',
  register: '/pages/register/index',
  profile: '/pages/profile/index',
} as const;

/** 只允许站内页面路径作为登录后的跳转地址，防止开放重定向。 */
export function getSafeRedirect(value: string | null | undefined, fallback: string = routes.home) {
  if (!value) return fallback;
  const decoded = decodeURIComponent(value);
  return decoded.startsWith('/pages/') && !decoded.includes('//') ? decoded : fallback;
}

export function withRedirect(path: string, redirect?: string) {
  return redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;
}
