import 'server-only';

import type { AuthSession } from '@/core/auth/types';
import type { AppLocale } from '@/core/i18n/locales';
import { redirect } from '@/i18n/navigation';
import { getSafeRedirect } from '../redirect';
import { getServerSession } from './session';

/** 需要登录的页面：未登录时跳转登录页，并带上 returnTo。 */
export async function requireSession(locale: AppLocale, returnTo: string): Promise<AuthSession> {
  const session = await getServerSession();

  if (!session) {
    return redirect({ href: { pathname: '/login', query: { redirect: returnTo } }, locale });
  }

  return session;
}

/** 仅游客可访问的页面（登录、注册）：已登录时跳回 redirect 或首页。 */
export async function redirectIfAuthenticated(locale: AppLocale, redirectTo?: string | string[]) {
  const session = await getServerSession();

  if (session) {
    const target = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;
    redirect({ href: getSafeRedirect(target), locale });
  }
}
