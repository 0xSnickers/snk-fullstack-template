import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import type { AuthSession } from '@/core/auth/types';
import { fetchBackend } from '@/server/bff';

/**
 * 读取当前请求的登录会话（服务端）。
 * 使用 React cache：同一次请求中 layout、page、route handler 多次调用只请求后端一次。
 *
 * 后端约定：POST /auth/session 读取 Cookie 中的刷新凭证，返回 { user, accessToken }。
 */
export const getServerSession = cache(
  async (cookieHeader?: string): Promise<AuthSession | null> => {
    const currentCookieHeader = cookieHeader ?? (await cookies()).toString();
    if (!currentCookieHeader) return null;

    const { payload, response } = await fetchBackend<AuthSession>('/auth/session', {
      method: 'POST',
      cookieHeader: currentCookieHeader,
      body: JSON.stringify({ clientType: 'web' }),
    });

    return response.ok && payload.data ? payload.data : null;
  },
);
