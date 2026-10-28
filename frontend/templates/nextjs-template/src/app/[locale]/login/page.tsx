import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/core/i18n/locales';
import { AuthForm } from '@/features/auth';
import { redirectIfAuthenticated } from '@/features/auth/server/guards';

interface PageProps {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ redirect?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.login' });
  return { title: t('title') };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  await redirectIfAuthenticated(locale, (await searchParams).redirect);

  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
