import { Suspense, type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AppControls } from './AppControls';
import { NavLinks } from './NavLinks';

/** 页面外壳（服务端组件）：顶部导航 + 内容区。 */
export async function AppShell({ children }: { children: ReactNode }) {
  const t = await getTranslations('common');

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="font-semibold">
              {t('appName')}
            </Link>
            <NavLinks />
          </nav>
          <Suspense>
            <AppControls />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
