import { StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme/useAppTheme';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.surface }]}>
      <Stack.Screen options={{ title: t('common.notFound') }} />
      <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>404</Text>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>{t('common.notFound')}</Text>
      <Text style={{ color: theme.colors.mutedForeground }}>{t('common.notFoundDescription')}</Text>
      <Link href="/" replace asChild>
        <Button title={t('common.backHome')} variant="outline" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
});
