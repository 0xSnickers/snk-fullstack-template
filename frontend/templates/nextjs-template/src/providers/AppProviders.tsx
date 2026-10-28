'use client';

import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { User } from '@/core/auth/types';
import { AuthSessionProvider } from '@/features/auth/components/AuthSessionProvider';
import { getQueryClient } from '@/services/queryClient';
import { AppPreferencesProvider } from './AppPreferencesProvider';

/**
 * 客户端应用级 Provider 组合。i18n（NextIntlClientProvider）在服务端 layout 中提供。
 * 功能级 Provider 不要放这里，放在对应页面或模块边界。
 */
export function AppProviders({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const queryClient = getQueryClient();

  return (
    <AppPreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider initialUser={initialUser}>{children}</AuthSessionProvider>
      </QueryClientProvider>
    </AppPreferencesProvider>
  );
}
