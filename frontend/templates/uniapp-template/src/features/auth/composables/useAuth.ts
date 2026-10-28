import { storeToRefs } from 'pinia';
import { onLoad } from '@dcloudio/uni-app';
import { useMutation } from '@tanstack/vue-query';
import type { LoginInput, RegisterInput } from '@/core/auth/types';
import { telemetry } from '@/services/telemetry';
import { getSafeRedirect, routes, withRedirect } from '../routes';
import { applySession, authClient, signOut, waitForSession } from '../session';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();
  const { user, status, isAuthenticated } = storeToRefs(store);

  async function logout() {
    await signOut();
    uni.reLaunch({ url: routes.home });
  }

  return { user, status, isAuthenticated, signOut: logout };
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: LoginInput) => authClient.login(input),
    onSuccess: (session) => {
      applySession(session);
      telemetry.track('auth_login_success', { role: session.user.role });
    },
    onError: () => telemetry.track('auth_login_failed'),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authClient.register(input),
    onSuccess: (session) => {
      applySession(session);
      telemetry.track('auth_register_success', { role: session.user.role });
    },
    onError: () => telemetry.track('auth_register_failed'),
  });
}

/**
 * 页面守卫：需要登录的页面在 setup 中调用。未登录时跳转登录页并带上当前页面作为 redirect。
 * 直接打开 H5 链接、App 冷启动进入页面都会经过这里，比 uni.addInterceptor 覆盖更全。
 */
export function useRequireAuth(currentPath: string) {
  onLoad(async (query) => {
    await waitForSession();
    if (!useAuthStore().isAuthenticated) {
      // 小程序 / App 端没有 URLSearchParams，手动拼接
      const search = Object.entries(query ?? {})
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      uni.redirectTo({
        url: withRedirect(routes.login, search ? `${currentPath}?${search}` : currentPath),
      });
    }
  });
}

/** 页面守卫：仅未登录可访问（登录、注册）。已登录时跳回 redirect 或首页。 */
export function useGuestOnly() {
  onLoad(async (query) => {
    await waitForSession();
    if (useAuthStore().isAuthenticated) {
      uni.redirectTo({ url: getSafeRedirect(query?.redirect) });
    }
  });
}
