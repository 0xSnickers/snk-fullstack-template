import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, useLocalSearchParams, usePathname } from 'expo-router';
import { useAppTheme } from '@/theme/useAppTheme';
import { useAuth } from '../hooks/useAuth';
import { getSafeRedirect } from '../redirect';

function FullScreenLoader() {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

/** 需要登录的页面：未登录时跳转登录页，并带上当前路径作为 redirect。 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();

  if (status === 'pending') return <FullScreenLoader />;
  if (status === 'anonymous') {
    return <Redirect href={{ pathname: '/login', params: { redirect: pathname } }} />;
  }

  return children;
}

/** 仅未登录可访问的页面（登录、注册）：已登录时跳回 redirect 或首页。 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const params = useLocalSearchParams<{ redirect?: string }>();

  if (status === 'pending') return <FullScreenLoader />;
  if (status === 'authenticated')
    return <Redirect href={getSafeRedirect(params.redirect) as never} />;

  return children;
}
