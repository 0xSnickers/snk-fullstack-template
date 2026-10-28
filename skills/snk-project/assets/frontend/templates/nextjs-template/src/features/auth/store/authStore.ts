import { createStore } from 'zustand/vanilla';
import type { User } from '@/core/auth/types';
import { telemetry } from '@/services/telemetry';

export type AuthStatus = 'authenticated' | 'anonymous';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User) => void;
  clear: () => void;
}

/**
 * Next.js 中 store 必须按请求创建（服务端模块级单例会在用户之间共享），
 * 因此导出工厂函数，由 AuthSessionProvider 创建并通过 Context 提供。
 */
export function createAuthStore(initialUser: User | null) {
  return createStore<AuthState>()((set) => ({
    user: initialUser,
    status: initialUser ? 'authenticated' : 'anonymous',
    setUser: (user) => {
      telemetry.identify(user);
      set({ user, status: 'authenticated' });
    },
    clear: () => {
      telemetry.reset();
      set({ user: null, status: 'anonymous' });
    },
  }));
}

export type AuthStore = ReturnType<typeof createAuthStore>;
