import { storeToRefs } from 'pinia';
import { useMutation } from '@tanstack/vue-query';
import type { LoginInput, RegisterInput } from '@/core/auth/types';
import { telemetry } from '@/services/telemetry';
import { login, register } from '../api/authApi';
import { applySession, signOut } from '../session';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();
  const { user, status, isAuthenticated } = storeToRefs(store);

  return { user, status, isAuthenticated, signOut };
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (session) => {
      applySession(session);
      telemetry.track('auth_login_success', { role: session.user.role });
    },
    onError: () => telemetry.track('auth_login_failed'),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (session) => {
      applySession(session);
      telemetry.track('auth_register_success', { role: session.user.role });
    },
    onError: () => telemetry.track('auth_register_failed'),
  });
}
