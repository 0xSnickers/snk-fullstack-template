import { environmentManager, focusManager, QueryClient } from '@tanstack/vue-query';
import type { AppApiError } from '@/core/http/apiError';

// App 端和小程序没有 window，TanStack Query 默认会把它当成服务端（不重试、不定时刷新）。
// uni-app 的所有端都是客户端运行环境，这里显式声明。
environmentManager.setIsServer(() => false);

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
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

/** 在 App.vue 的 onShow / onHide 中调用：App 回到前台时刷新过期数据。 */
export function setAppFocused(focused: boolean) {
  focusManager.setFocused(focused);
}
