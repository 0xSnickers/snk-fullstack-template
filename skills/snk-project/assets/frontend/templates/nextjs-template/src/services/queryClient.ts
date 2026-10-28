import { isServer, QueryClient } from '@tanstack/react-query';
import type { AppApiError } from '@/core/http/apiError';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // 4xx 不重试，网络错误和 5xx 最多重试 2 次。
        retry: (failureCount, error) => {
          const status = (error as AppApiError).status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** 服务端每次请求新建，避免用户之间共享缓存；浏览器端复用单例。 */
export function getQueryClient() {
  if (isServer) return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
