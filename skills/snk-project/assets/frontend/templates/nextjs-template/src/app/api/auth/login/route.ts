import type { AuthSession } from '@/core/auth/types';
import {
  fetchBackend,
  getForwardedHeaders,
  getRequestCookieHeader,
  toBffResponse,
} from '@/server/bff';

/** 登录：后端写入 HttpOnly Cookie，accessToken 不返回给浏览器。 */
export async function POST(request: Request) {
  const result = await fetchBackend<AuthSession>('/auth/login', {
    method: 'POST',
    headers: getForwardedHeaders(request),
    cookieHeader: getRequestCookieHeader(request),
    body: await request.text(),
  });

  return toBffResponse(result, (session) => ({ user: session.user }));
}
