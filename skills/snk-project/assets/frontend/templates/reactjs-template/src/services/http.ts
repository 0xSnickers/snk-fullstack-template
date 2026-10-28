import { createMemoryTokenStore } from '@/core/auth/tokenStore';
import { createHttpClient } from '@/core/http/createHttpClient';
import { getStoredLocale } from '@/core/i18n/locales';
import { env } from '@/config/env';
import { telemetry } from './telemetry';

/** accessToken 只保存在内存中，刷新凭证由后端写入 HttpOnly Cookie。 */
export const tokenStore = createMemoryTokenStore();

/**
 * 应用唯一的 HTTP 客户端。业务接口统一写在 `src/features/<模块>/api/*Api.ts`：
 *
 *   export const getUsers = (params: PageParams) => http.get<PageResult<User>>('/users', { params });
 *
 * - get/post/put/patch/delete 会自动解包 `{ code, message, data }`，直接返回 data。
 * - 业务码非 0/200 时抛出 AppApiError。
 * - 401 时自动刷新 Token 并重试一次（刷新逻辑由 features/auth 注册）。
 */
export const http = createHttpClient({
  baseURL: env.apiBaseUrl,
  getAccessToken: tokenStore.get,
  getLocale: getStoredLocale,
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
