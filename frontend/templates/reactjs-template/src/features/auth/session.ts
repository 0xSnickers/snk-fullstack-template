import type { AuthSession } from '@/core/auth/types';
import { http, tokenStore } from '@/services/http';
import { queryClient } from '@/services/queryClient';
import { logout, refreshSession } from './api/authApi';
import { useAuthStore } from './store/authStore';

/** 登录 / 注册成功后写入会话。 */
export function applySession(session: AuthSession) {
  tokenStore.set(session.accessToken);
  useAuthStore.getState().setUser(session.user);
}

/** 清空会话：Token、用户、所有接口缓存。 */
export function clearSession() {
  tokenStore.clear();
  useAuthStore.getState().clear();
  queryClient.clear();
}

/** 应用启动时尝试用刷新凭证恢复登录态。 */
export async function restoreSession() {
  try {
    const session = await refreshSession();
    useAuthStore.getState().setUser(session.user);
  } catch {
    clearSession();
  }
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
    useAuthStore.getState().setUser(session.user);
    return session.accessToken;
  });
  http.setUnauthorizedHandler(() => clearSession());
}
