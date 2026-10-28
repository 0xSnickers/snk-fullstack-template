'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PageParams } from '@/core/http/types';
import { getUsers } from '../api/userApi';

/** Query Key 工厂：同一模块的 key 统一在这里维护，方便精确失效。 */
export const userKeys = {
  all: ['users'] as const,
  list: (params: PageParams) => [...userKeys.all, 'list', params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

export function useUsers(params: PageParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });
}
