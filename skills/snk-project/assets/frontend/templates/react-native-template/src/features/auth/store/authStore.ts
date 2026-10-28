import { create } from 'zustand';
import type { User } from '@/core/auth/types';
import { telemetry } from '@/services/telemetry';

/** pending：启动时正在恢复会话；authenticated：已登录；anonymous：未登录。 */
export type AuthStatus = 'pending' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'pending',
  setUser: (user) => {
    telemetry.identify(user);
    set({ user, status: 'authenticated' });
  },
  clear: () => {
    telemetry.reset();
    set({ user: null, status: 'anonymous' });
  },
}));
