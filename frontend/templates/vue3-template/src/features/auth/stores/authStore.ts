import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { User } from '@/core/auth/types';
import { telemetry } from '@/services/telemetry';

/** pending：启动时正在恢复会话；authenticated：已登录；anonymous：未登录。 */
export type AuthStatus = 'pending' | 'authenticated' | 'anonymous';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const status = ref<AuthStatus>('pending');
  const isAuthenticated = computed(() => status.value === 'authenticated');

  function setUser(next: User) {
    telemetry.identify(next);
    user.value = next;
    status.value = 'authenticated';
  }

  function clear() {
    telemetry.reset();
    user.value = null;
    status.value = 'anonymous';
  }

  return { user, status, isAuthenticated, setUser, clear };
});
