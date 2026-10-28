import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AppPreferencesProvider } from '@/providers/AppPreferencesProvider';
import { queryClient } from '@/services/queryClient';

/**
 * 应用级 Provider 组合，顺序即依赖关系：
 * 偏好（i18n / 主题） -> 错误边界（需要 i18n 渲染兜底文案） -> 接口缓存。
 * 功能级 Provider 不要放这里，放在对应页面或模块边界。
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppPreferencesProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ErrorBoundary>
    </AppPreferencesProvider>
  );
}
