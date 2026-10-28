import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { RequireAuth, useAuth } from '@/features/auth';
import { useAppTheme } from '@/theme/useAppTheme';

/** 需要登录的页面示例：用 RequireAuth 包裹，未登录时跳转登录页并带上 redirect。 */
export default function ProfileScreen() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { user } = useAuth();

  if (!user) return null;

  const rows = [
    [t('profile.fields.id'), user.id],
    [t('auth.fields.name'), user.name],
    [t('auth.fields.email'), user.email ?? '—'],
    [t('profile.fields.role'), user.role],
  ];

  return (
    <Screen>
      <Stack.Screen options={{ title: t('profile.title') }} />
      <Text style={{ color: theme.colors.mutedForeground }}>{t('profile.description')}</Text>
      <Card style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.mutedForeground }]}>{label}</Text>
            <Text style={{ color: theme.colors.foreground, flexShrink: 1 }}>{value}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  row: { flexDirection: 'row', gap: 16 },
  label: { width: 72 },
});
