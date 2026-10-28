import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { themeInitScript } from '@/core/theme/theme';
import { AppShell } from '@/components/layout/AppShell';
import { env } from '@/config/env';
import { getServerSession } from '@/features/auth/server/session';
import { routing } from '@/i18n/routing';
import { AppProviders } from '@/providers/AppProviders';
import '@/styles/globals.css';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  });

  return {
    title: { default: env.appName, template: `%s | ${env.appName}` },
    description: t('home.ready', { framework: 'Next.js' }),
    icons: { icon: '/favicon.svg' },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const session = await getServerSession();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 首屏防闪烁：渲染前应用已保存的主题色和深浅色 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <AppProviders initialUser={session?.user ?? null}>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
