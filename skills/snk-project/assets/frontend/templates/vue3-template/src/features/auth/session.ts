import type { AuthSession } from '@/core/auth/types';
import { http, tokenStore } from '@/services/http';
import { queryClient } from '@/services/queryClient';
import { logout, refreshSession } from './api/authApi';
import { useAuthStore } from './stores/authStore';

let sessionReady: Promise<void> | null = null;

/** 登录 / 注册成功后写入会话。 */
export function applySession(session: AuthSession) {
  tokenStore.set(session.accessToken);
  useAuthStore().setUser(session.user);
}

/** 清空会话：Token、用户、所有接口缓存。 */
export function clearSession() {
  tokenStore.clear();
  useAuthStore().clear();
  queryClient.clear();
}

/** 应用启动时尝试用刷新凭证恢复登录态；多次调用复用同一个 Promise。 */
export function restoreSession(): Promise<void> {
  sessionReady ??= refreshSession()
    .then((session) => useAuthStore().setUser(session.user))
    .catch(() => clearSession());

  return sessionReady;
}

/** 路由守卫使用：等待启动时的会话恢复完成。 */
export function waitForSession(): Promise<void> {
  return sessionReady ?? Promise.resolve();
}

export async function signOut() {
  try {
    await logout();
  } finally {
    clearSession();
  }
}

/** 把鉴权逻辑注册到 HTTP 客户端：401 自动刷新、刷新失败清空会话。在应用入口调用一次。 */
export function setupAuth() {
  http.setRefreshHandler(async () => {
    const session = await refreshSession();
    useAuthStore().setUser(session.user);
    return session.accessToken;
  });
  http.setUnauthorizedHandler(() => clearSession());
}
