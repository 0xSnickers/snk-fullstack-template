import { useTranslation } from 'react-i18next';
import { AuthForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function RegisterPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('auth.register.title'));

  return <AuthForm mode="register" />;
}
