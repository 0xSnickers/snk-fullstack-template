import { StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppControls } from '@/components/layout/AppControls';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth';
import { UserListPanel } from '@/features/users';
import { useAppTheme } from '@/theme/useAppTheme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <Screen>
      <Stack.Screen options={{ title: t('nav.home') }} />

      <View style={styles.hero}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>{env.appName}</Text>
        <Text style={{ color: theme.colors.mutedForeground }}>
          {t('home.ready', { framework: 'React Native' })}
        </Text>
      </View>

      <AppControls />

      {isAuthenticated && user ? (
        <View style={styles.actions}>
          <Text style={{ color: theme.colors.mutedForeground }}>
            {t('home.signedInAs', { name: user.name })}
          </Text>
          <View style={styles.row}>
            <Link href="/profile" asChild>
              <Button title={t('nav.profile')} variant="secondary" />
            </Link>
            <Button title={t('home.logout')} variant="outline" onPress={() => void signOut()} />
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <View style={styles.row}>
            <Link href="/login" asChild>
              <Button title={t('home.login')} />
            </Link>
            <Link href="/register" asChild>
              <Button title={t('home.register')} variant="outline" />
            </Link>
          </View>
          <Text style={{ color: theme.colors.mutedForeground }}>{t('home.guestHint')}</Text>
        </View>
      )}

      {isAuthenticated ? <UserListPanel /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 6 },
  title: { fontSize: 24, fontWeight: '700' },
  actions: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
