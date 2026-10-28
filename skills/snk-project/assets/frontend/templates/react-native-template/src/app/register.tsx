import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { AuthForm, GuestOnly } from '@/features/auth';

export default function RegisterScreen() {
  const { t } = useTranslation();

  return (
    <GuestOnly>
      <Screen>
        <Stack.Screen options={{ title: t('auth.register.title') }} />
        <AuthForm mode="register" />
      </Screen>
    </GuestOnly>
  );
}
