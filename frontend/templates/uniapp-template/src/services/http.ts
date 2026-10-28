import { createMemoryTokenStore } from '@/core/auth/tokenStore';
import { createHttpClient } from '@/core/http/createHttpClient';
import { env } from '@/config/env';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { telemetry } from './telemetry';
import { uniAdapter } from './uniAdapter';

/** accessToken 只保存在内存中；refreshToken 由 features/auth 存入本地存储。 */
export const tokenStore = createMemoryTokenStore();

/**
 * 应用唯一的 HTTP 客户端（底层 uni.request）。业务接口统一写在 `src/features/<模块>/api/*Api.ts`：
 *
 *   export const getUsers = (params: PageParams) => http.get<PageResult<User>>('/users', { params });
 *
 * - 自动解包 `{ code, message, data }`，业务码非 0/200 时抛出 AppApiError。
 * - 401 时自动刷新 Token 并重试一次（刷新逻辑由 features/auth 注册）。
 * - 业务代码不要直接调用 uni.request。
 */
export const http = createHttpClient({
  baseURL: env.apiBaseUrl,
  withCredentials: false,
  getAccessToken: tokenStore.get,
  getLocale: () => usePreferencesStore().locale,
});

http.instance.defaults.adapter = uniAdapter;
http.bare.defaults.adapter = uniAdapter;

http.setErrorReporter((error, context) => {
  telemetry.captureError(error, {
    source: `api_${context.source}`,
    code: error.code,
    status: error.status,
    url: context.url,
    method: context.method,
  });
});
