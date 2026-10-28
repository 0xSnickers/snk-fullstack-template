import type { AuthSession, LoginInput, RegisterInput, User } from '@/core/auth/types';
import { unwrapApiResponse } from '@/core/http/createHttpClient';
import { singleFlight } from '@/core/utils/singleFlight';
import { http, tokenStore } from '@/services/http';

export function login(input: LoginInput) {
  return http.post<AuthSession>('/auth/login', input);
}

export function register(input: RegisterInput) {
  return http.post<AuthSession>('/auth/register', input);
}

export function logout() {
  return http.post<{ success: boolean }>('/auth/logout');
}

export function getCurrentUser() {
  return http.get<User>('/auth/me');
}

/**
 * 使用 HttpOnly Cookie 中的刷新凭证换取新的 accessToken。
 * 并发调用（启动恢复会话 + 多个 401 请求）只会发出一次刷新请求。
 */
export const refreshSession = singleFlight(async () => {
  const response = await http.bare.post('/auth/refresh');
  const session = unwrapApiResponse<AuthSession>(response.data);
  tokenStore.set(session.accessToken);
  return session;
});
