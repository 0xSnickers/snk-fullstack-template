import { getServerSession } from '@/features/auth/server/session';
import {
  fetchBackend,
  getForwardedHeaders,
  getRequestCookieHeader,
  toBffResponse,
} from '@/server/bff';

/**
 * 通用 BFF 透传：/api/<path> -> API_BASE_URL/<path>
 *
 * - 已登录时自动附带 Authorization: Bearer <accessToken>（token 只在服务端出现）。
 * - 未登录时匿名转发，由后端决定是否返回 401。
 * - 需要裁剪字段、聚合多个接口时，在 src/app/api 下新建具体路由覆盖它（具体路由优先级更高）。
 */
async function handler(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const cookieHeader = getRequestCookieHeader(request);
  const session = await getServerSession(cookieHeader);
  const hasBody = !['GET', 'HEAD'].includes(request.method);

  const result = await fetchBackend<unknown>(
    `/${path.map(encodeURIComponent).join('/')}${url.search}`,
    {
      method: request.method,
      headers: getForwardedHeaders(request),
      accessToken: session?.accessToken,
      body: hasBody ? await request.text() : undefined,
    },
  );

  return toBffResponse(result);
}

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
