import { createHttpClient } from '@/core/http/createHttpClient';
import { matchLocale } from '@/core/i18n/locales';
import { env } from '@/config/env';
import { telemetry } from './telemetry';

/**
 * 浏览器侧唯一的 HTTP 客户端，只请求同源 BFF（/api/*）。
 * 登录态由 HttpOnly Cookie 承载，浏览器不持有 accessToken，因此这里不注入 Authorization。
 *
 * 业务接口统一写在 `src/features/<模块>/api/*Api.ts`：
 *   export const getUsers = (params: PageParams) => http.get<PageResult<User>>('/users', { params });
 */
export const http = createHttpClient({
  baseURL: env.apiBaseUrl,
  getLocale: () =>
    typeof document === 'undefined'
      ? undefined
      : (matchLocale(document.documentElement.lang) ?? undefined),
});

http.setErrorReporter((error, context) => {
  telemetry.captureError(error, {
    source: `api_${context.source}`,
    code: error.code,
    status: error.status,
    url: context.url,
    method: context.method,
  });
});
