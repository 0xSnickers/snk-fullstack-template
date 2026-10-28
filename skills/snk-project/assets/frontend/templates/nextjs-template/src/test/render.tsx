import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { User } from '@/core/auth/types';
import { defaultTimeZone } from '@/core/i18n/locales';
import { AuthSessionProvider } from '@/features/auth/components/AuthSessionProvider';
import { messages } from '@/i18n/messages';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
}

/**
 * 带 i18n、QueryClient、登录态 Provider 渲染客户端组件。
 * 依赖 next/navigation 的组件需要在测试文件中 mock '@/i18n/navigation' 和 'next/navigation'。
 */
export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
  const { user = null, ...renderOptions } = options;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <NextIntlClientProvider locale="zh-CN" messages={messages['zh-CN']} timeZone={defaultTimeZone}>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider initialUser={user}>{ui}</AuthSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
    renderOptions,
  );
}
