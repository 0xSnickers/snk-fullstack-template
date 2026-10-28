import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { AuthForm, GuestOnly } from '@/features/auth';

export default function LoginScreen() {
  const { t } = useTranslation();

  return (
    <GuestOnly>
      <Screen>
        <Stack.Screen options={{ title: t('auth.login.title') }} />
        <AuthForm mode="login" />
      </Screen>
    </GuestOnly>
  );
}
