import { createNativeAuthClient } from '@/core/auth/nativeAuth';
import type { AuthSession } from '@/core/auth/types';
import { http, tokenStore } from '@/services/http';
import { queryClient } from '@/services/queryClient';
import { secureStorage } from '@/services/storage';
import { useAuthStore } from './store/authStore';

/**
 * App 端鉴权：accessToken 在内存，refreshToken 在 Keychain / Keystore。
 * 登录、注册、刷新、登出的请求细节见 core/auth/nativeAuth.ts。
 */
export const authClient = createNativeAuthClient({ http, tokenStore, storage: secureStorage });

export function applySession(session: AuthSession) {
  useAuthStore.getState().setUser(session.user);
}

/** 清空会话：Token、用户、所有接口缓存。 */
export async function clearSession() {
  await authClient.clear();
  useAuthStore.getState().clear();
  queryClient.clear();
}

/** 启动时用安全存储中的 refreshToken 恢复登录态。 */
export async function restoreSession() {
  try {
    applySession(await authClient.refresh());
  } catch {
    await clearSession();
  }
}

export async function signOut() {
  try {
    await authClient.logout();
  } finally {
    await clearSession();
  }
}

/** 把鉴权逻辑注册到 HTTP 客户端：401 自动刷新、刷新失败清空会话。在入口调用一次。 */
export function setupAuth() {
  http.setRefreshHandler(async () => {
    const session = await authClient.refresh();
    applySession(session);
    return session.accessToken;
  });
  http.setUnauthorizedHandler(() => void clearSession());
}
