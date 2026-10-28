import { Link, NavLink, Outlet } from 'react-router';
import { cn } from '@/core/utils/cn';
import { useTranslation } from 'react-i18next';
import { AppControls } from './AppControls';
import { RouteTracker } from './RouteTracker';

const navItems = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/profile', labelKey: 'nav.profile' },
] as const;

export function MainLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <RouteTracker />
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="font-semibold">
              {t('common.appName')}
            </Link>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn('text-muted-foreground hover:text-foreground', isActive && 'text-foreground')
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
          <AppControls />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
