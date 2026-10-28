import { useMutation } from '@tanstack/react-query';
import type { LoginInput, RegisterInput } from '@/core/auth/types';
import { telemetry } from '@/services/telemetry';
import { applySession, authClient, signOut } from '../session';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isPending: status === 'pending',
    signOut,
  };
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
