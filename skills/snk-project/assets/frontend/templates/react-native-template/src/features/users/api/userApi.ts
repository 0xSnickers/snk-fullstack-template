import type { User } from '@/core/auth/types';
import type { PageParams, PageResult } from '@/core/http/types';
import { http } from '@/services/http';

export function getUsers(params: PageParams = {}) {
  return http.get<PageResult<User>>('/users', {
    params: { page: params.page ?? 1, limit: params.limit ?? 10 },
  });
}

export function getUser(id: string) {
  return http.get<User>(`/users/${id}`);
}
