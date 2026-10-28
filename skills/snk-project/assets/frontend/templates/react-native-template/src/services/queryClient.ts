import { AppState, Platform } from 'react-native';
import { focusManager, QueryClient } from '@tanstack/react-query';
import type { AppApiError } from '@/core/http/apiError';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 4xx 不重试，网络错误和 5xx 最多重试 2 次。
        retry: (failureCount, error) => {
          const status = (error as AppApiError).status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

export const queryClient = createQueryClient();

/** App 从后台回到前台时视为「窗口聚焦」，触发过期数据重新请求。在入口调用一次。 */
export function setupQueryFocusManager() {
  if (Platform.OS === 'web') return () => {};

  const subscription = AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
  return () => subscription.remove();
}
