import '@/i18n';

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { restoreSession, setupAuth } from '@/features/auth';
import { queryClient, setupQueryFocusManager } from '@/services/queryClient';
import { telemetry } from '@/services/telemetry';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useAppTheme } from '@/theme/useAppTheme';

// 模块加载时注册鉴权拦截（只执行一次）
setupAuth();

/** 应用启动：恢复偏好 -> 恢复登录态。 */
function useBootstrap() {
  useEffect(() => {
    void usePreferencesStore.getState().hydrate().then(restoreSession);
    return setupQueryFocusManager();
  }, []);
}

export default function RootLayout() {
  useBootstrap();
  const theme = useAppTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.surface },
        }}
      />
    </QueryClientProvider>
  );
}

/** 路由级错误边界：Expo Router 会在页面渲染出错时渲染它。 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();

  useEffect(() => {
    telemetry.captureError(error, { source: 'expo_router_error_boundary' });
  }, [error]);

  return (
    <View
      style={[styles.error, { backgroundColor: theme.colors.surface }]}
      accessibilityRole="alert"
    >
      <Text style={[styles.title, { color: theme.colors.foreground }]}>{t('error.title')}</Text>
      <Text style={{ color: theme.colors.mutedForeground }}>{t('error.description')}</Text>
      <Button title={t('common.retry')} onPress={() => void retry()} />
    </View>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: '700' },
});
