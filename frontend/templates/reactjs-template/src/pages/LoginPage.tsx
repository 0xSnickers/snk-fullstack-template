import { useTranslation } from 'react-i18next';
import { AuthForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.login.title'));

  return <AuthForm mode="login" />;
}
