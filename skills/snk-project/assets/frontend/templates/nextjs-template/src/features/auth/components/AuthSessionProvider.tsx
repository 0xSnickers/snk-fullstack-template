'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { User } from '@/core/auth/types';
import { useRouter } from '@/i18n/navigation';
import { http } from '@/services/http';
import { getQueryClient } from '@/services/queryClient';
import { createAuthStore, type AuthState, type AuthStore } from '../store/authStore';

const AuthStoreContext = createContext<AuthStore | null>(null);

/**
 * 登录态 Provider：用服务端读取到的 initialUser 初始化 store，首屏无闪烁。
 * BFF 返回 401（会话过期）时清空登录态并刷新服务端组件。
 */
export function AuthSessionProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [store] = useState(() => createAuthStore(initialUser));
  const router = useRouter();

  // 服务端会话变化（登录、登出、router.refresh）时同步到 store
  useEffect(() => {
    const { user, setUser, clear } = store.getState();
    if (initialUser && initialUser.id !== user?.id) setUser(initialUser);
    if (!initialUser && user) clear();
  }, [initialUser, store]);

  useEffect(() => {
    http.setUnauthorizedHandler(() => {
      if (!store.getState().user) return;
      store.getState().clear();
      getQueryClient().clear();
      router.refresh();
    });
    return () => http.setUnauthorizedHandler(null);
  }, [router, store]);

  return <AuthStoreContext.Provider value={store}>{children}</AuthStoreContext.Provider>;
}

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error('useAuthStore must be used within AuthSessionProvider');
  }

  return useStore(store, selector);
}
