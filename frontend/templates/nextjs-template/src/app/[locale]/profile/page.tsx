import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/core/i18n/locales';
import { requireSession } from '@/features/auth/server/guards';

interface PageProps {
  params: Promise<{ locale: AppLocale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile' });
  return { title: t('title') };
}

/** 需要登录的页面示例：在服务端校验会话，未登录直接重定向，不会闪现页面内容。 */
export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params;
  const { user } = await requireSession(locale, '/profile');
  const t = await getTranslations({ locale });

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
