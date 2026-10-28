import { createNativeAuthClient } from '@/core/auth/nativeAuth';
import type { AuthSession } from '@/core/auth/types';
import { http, tokenStore } from '@/services/http';
import { queryClient } from '@/services/queryClient';
import { appStorage } from '@/services/storage';
import { useAuthStore } from './stores/authStore';

/**
 * App 端鉴权：accessToken 在内存，refreshToken 在本地存储。
 * 登录、注册、刷新、登出的请求细节见 core/auth/nativeAuth.ts。
 */
export const authClient = createNativeAuthClient({ http, tokenStore, storage: appStorage });

let sessionReady: Promise<void> | null = null;

export function applySession(session: AuthSession) {
  useAuthStore().setUser(session.user);
}

/** 清空会话：Token、用户、所有接口缓存。 */
export async function clearSession() {
  await authClient.clear();
  useAuthStore().clear();
  queryClient.clear();
}

/** 启动时用本地存储中的 refreshToken 恢复登录态；多次调用复用同一个 Promise。 */
export function restoreSession(): Promise<void> {
  sessionReady ??= authClient
    .refresh()
    .then(applySession)
    .catch(() => clearSession());
  return sessionReady;
}

/** 页面守卫使用：等待启动时的会话恢复完成。 */
export function waitForSession(): Promise<void> {
  return sessionReady ?? restoreSession();
}

export async function signOut() {
  try {
    await authClient.logout();
  } finally {
    await clearSession();
  }
}

/** 把鉴权逻辑注册到 HTTP 客户端：401 自动刷新、刷新失败清空会话。在 App.vue onLaunch 中调用一次。 */
export function setupAuth() {
  http.setRefreshHandler(async () => {
    const session = await authClient.refresh();
    applySession(session);
    return session.accessToken;
  });
  http.setUnauthorizedHandler(() => void clearSession());
}
