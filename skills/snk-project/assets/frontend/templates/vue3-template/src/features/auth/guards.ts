import type { Router } from 'vue-router';
import { getSafeRedirect } from './redirect';
import { waitForSession } from './session';
import { useAuthStore } from './stores/authStore';

declare module 'vue-router' {
  interface RouteMeta {
    /** 需要登录才能访问。 */
    requiresAuth?: boolean;
    /** 仅未登录可访问（登录、注册页）。 */
    guestOnly?: boolean;
    /** 页面标题的语言包 key。 */
    titleKey?: string;
  }
}

/** 注册鉴权路由守卫：基于 route.meta.requiresAuth / guestOnly。 */
export function installAuthGuards(router: Router) {
  router.beforeEach(async (to) => {
    if (!to.meta.requiresAuth && !to.meta.guestOnly) return true;

    await waitForSession();
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      const redirect = Array.isArray(to.query.redirect) ? to.query.redirect[0] : to.query.redirect;
      return getSafeRedirect(redirect);
    }

    return true;
  });
}
