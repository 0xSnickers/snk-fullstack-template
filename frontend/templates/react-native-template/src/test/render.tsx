import type { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { createQueryClient } from '@/services/queryClient';

/** 带 QueryClient 渲染组件；每次调用新建 QueryClient，测试之间不共享缓存。 */
export async function renderWithProviders(ui: ReactElement) {
  const queryClient = createQueryClient();
  // gcTime: Infinity 避免缓存回收定时器让 Jest 无法退出
  queryClient.setDefaultOptions({
    queries: { retry: false, gcTime: Infinity },
    mutations: { gcTime: Infinity },
  });

  const result = await render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return { queryClient, ...result };
}
