'use client';

import { useMutation } from '@tanstack/react-query';
import type { LoginInput, RegisterInput } from '@/core/auth/types';
import { useRouter } from '@/i18n/navigation';
import { getQueryClient } from '@/services/queryClient';
import { telemetry } from '@/services/telemetry';
import { login, logout, register } from '../api/authApi';
import { useAuthStore } from '../components/AuthSessionProvider';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();

  async function signOut() {
    try {
      await logout();
    } finally {
      clear();
      getQueryClient().clear();
      router.refresh();
    }
  }

  return { user, status, isAuthenticated: status === 'authenticated', signOut };
}

export function useLoginMutation() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: ({ user }) => {
      setUser(user);
      telemetry.track('auth_login_success', { role: user.role });
    },
    onError: () => telemetry.track('auth_login_failed'),
  });
}

export function useRegisterMutation() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: ({ user }) => {
      setUser(user);
      telemetry.track('auth_register_success', { role: user.role });
    },
    onError: () => telemetry.track('auth_register_failed'),
  });
}
