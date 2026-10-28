'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/core/utils/cn';
import { Link, usePathname } from '@/i18n/navigation';

const navItems = [
  { href: '/', labelKey: 'home' },
  { href: '/profile', labelKey: 'profile' },
] as const;

export function NavLinks() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return navItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        'text-muted-foreground hover:text-foreground',
        pathname === item.href && 'text-foreground',
      )}
    >
      {t(item.labelKey)}
    </Link>
  ));
}
