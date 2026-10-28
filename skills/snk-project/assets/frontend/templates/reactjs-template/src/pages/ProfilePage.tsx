import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 需要登录的页面示例（在 router.tsx 的 RequireAuth 分组中注册）。 */
export function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  useDocumentTitle(t('profile.title'));

  if (!user) return null;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('profile.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('profile.description')}</p>
      </div>
      <dl className="grid max-w-md grid-cols-[max-content_1fr] gap-x-6 gap-y-2 rounded-lg border bg-card p-4 text-sm">
        <dt className="text-muted-foreground">{t('profile.fields.id')}</dt>
        <dd>{user.id}</dd>
        <dt className="text-muted-foreground">{t('auth.fields.name')}</dt>
        <dd>{user.name}</dd>
        <dt className="text-muted-foreground">{t('auth.fields.email')}</dt>
        <dd>{user.email ?? '—'}</dd>
        <dt className="text-muted-foreground">{t('profile.fields.role')}</dt>
        <dd>{user.role}</dd>
      </dl>
    </section>
  );
}
