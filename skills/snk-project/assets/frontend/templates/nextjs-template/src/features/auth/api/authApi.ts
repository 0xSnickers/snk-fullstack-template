import type { LoginInput, RegisterInput, User } from '@/core/auth/types';
import { http } from '@/services/http';

/** BFF 不会把 accessToken 返回给浏览器，只返回 user。 */
interface SessionUser {
  user: User;
}

export function login(input: LoginInput) {
  return http.post<SessionUser>('/auth/login', input);
}

export function register(input: RegisterInput) {
  return http.post<SessionUser>('/auth/register', input);
}

export function logout() {
  return http.post<{ success: boolean }>('/auth/logout');
}

export function getSession() {
  return http.get<SessionUser>('/auth/session');
}
