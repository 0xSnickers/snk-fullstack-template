import type { ReactElement, ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AppPreferencesProvider } from '@/providers/AppPreferencesProvider';
import { createQueryClient } from '@/services/queryClient';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** 初始路由，默认 `/`。 */
  route?: string;
  /** 额外注册的路由，用于断言跳转结果。 */
  routes?: { path: string; element: ReactNode }[];
}

/**
 * 带全套应用 Provider（i18n、主题、QueryClient、Router）渲染组件。
 * 每次调用都会创建新的 QueryClient，避免测试之间共享缓存。
 */
export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
  const { route = '/', routes = [], ...renderOptions } = options;
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({ queries: { retry: false } });

  const router = createMemoryRouter([{ path: route.split('?')[0], element: ui }, ...routes], {
    initialEntries: [route],
  });

  return {
    queryClient,
    router,
    ...render(
      <AppPreferencesProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AppPreferencesProvider>,
      renderOptions,
    ),
  };
}
