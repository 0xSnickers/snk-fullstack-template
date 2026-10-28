import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createRequestId } from '../utils/id';
import { singleFlight } from '../utils/singleFlight';
import { AppApiError, normalizeApiError } from './apiError';
import type { ApiResponse } from './types';

export interface HttpErrorContext {
  url?: string;
  method?: string;
  source: 'business_error' | 'request_failed';
}

export type UnauthorizedHandler = (error: AppApiError) => void;
export type ErrorReporter = (error: AppApiError, context: HttpErrorContext) => void;
/** 刷新 accessToken，返回新的 token。参数 `bare` 是不带拦截器的 Axios 实例，避免刷新请求自身触发重试。 */
export type RefreshHandler = (bare: AxiosInstance) => Promise<string>;

export interface HttpClientOptions {
  /** 浏览器侧请求前缀，SPA 默认 `/api`，由开发代理或网关转发到后端。 */
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  /** 读取当前 accessToken；返回空值则不注入 Authorization。 */
  getAccessToken?: () => string | null | undefined;
  /** 读取当前语言，用于 Accept-Language。 */
  getLocale?: () => string | undefined;
  /** 不应触发自动刷新的接口路径。 */
  authEndpoints?: string[];
  /** 判断业务码是否成功，默认 0 / 200 为成功。 */
  isSuccessCode?: (code: number | string) => boolean;
}

export interface HttpClient {
  /** 带拦截器的 Axios 实例，需要原始响应（下载文件、读取响应头）时使用。 */
  instance: AxiosInstance;
  /** 不带拦截器的 Axios 实例，仅用于刷新 Token 等引导请求。 */
  bare: AxiosInstance;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  /** 登录失效（刷新失败或无法刷新）时的回调，通常由鉴权模块注册：清空用户、跳转登录。 */
  setUnauthorizedHandler(handler: UnauthorizedHandler | null): void;
  /** 注册 Token 刷新逻辑；未注册时 401 直接视为登录失效。 */
  setRefreshHandler(handler: RefreshHandler | null): void;
  /** 注册错误上报（Sentry / 日志），401 不会上报。 */
  setErrorReporter(reporter: ErrorReporter | null): void;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const DEFAULT_AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const defaultIsSuccessCode = (code: number | string) => ['0', '200'].includes(String(code));

export function isApiResponse(data: unknown): data is ApiResponse<unknown> {
  return Boolean(data && typeof data === 'object' && 'code' in data && 'data' in data);
}

/** 解包统一响应结构；后端未包裹时原样返回。 */
export function unwrapResponse<T>(data: unknown): T {
  return (isApiResponse(data) ? data.data : data) as T;
}

/** 解包并校验业务码，失败时抛出 AppApiError。用于不经过拦截器的 bare 请求。 */
export function unwrapApiResponse<T>(
  data: unknown,
  isSuccessCode: (code: number | string) => boolean = defaultIsSuccessCode,
): T {
  if (isApiResponse(data) && !isSuccessCode(data.code)) {
    throw new AppApiError(data.message, { code: data.code, details: data });
  }

  return unwrapResponse<T>(data);
}

function setHeader(config: InternalAxiosRequestConfig, key: string, value: string) {
  if (typeof config.headers?.set === 'function') {
    config.headers.set(key, value);
    return;
  }

  (config.headers as unknown as Record<string, string>)[key] = value;
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const {
    baseURL,
    timeout = 10_000,
    withCredentials = true,
    getAccessToken,
    getLocale,
    authEndpoints = DEFAULT_AUTH_ENDPOINTS,
    isSuccessCode = defaultIsSuccessCode,
  } = options;

  const instance = axios.create({ baseURL, timeout, withCredentials });
  const bare = axios.create({ baseURL, timeout, withCredentials });

  let unauthorizedHandler: UnauthorizedHandler | null = null;
  let errorReporter: ErrorReporter | null = null;
  let refresh: (() => Promise<string>) | null = null;

  const isAuthEndpoint = (url?: string) =>
    Boolean(url && authEndpoints.some((path) => url.includes(path)));

  const report = (error: AppApiError, context: HttpErrorContext) => {
    if (error.status === 401) return;
    try {
      errorReporter?.(error, context);
    } catch {
      // 上报失败不能影响业务请求。
    }
  };

  instance.interceptors.request.use((config) => {
    const token = getAccessToken?.();
    const locale = getLocale?.();

    setHeader(config, 'X-Request-ID', createRequestId());
    if (locale) setHeader(config, 'Accept-Language', locale);
    if (token) setHeader(config, 'Authorization', `Bearer ${token}`);

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const { data } = response;

      if (isApiResponse(data) && !isSuccessCode(data.code)) {
        const error = new AppApiError(data.message, {
          code: data.code,
          status: response.status,
          details: data,
        });
        report(error, {
          url: response.config.url,
          method: response.config.method,
          source: 'business_error',
        });
        throw error;
      }

      return response;
    },
    async (rawError: unknown) => {
      const error = normalizeApiError(rawError);
      const config = axios.isAxiosError(rawError)
        ? (rawError.config as RetriableRequestConfig | undefined)
        : undefined;

      report(error, { url: config?.url, method: config?.method, source: 'request_failed' });

      if (error.status !== 401) {
        return Promise.reject(error);
      }

      const canRefresh = refresh && config && !config._retry && !isAuthEndpoint(config.url);

      if (canRefresh) {
        config._retry = true;

        try {
          const token = await refresh!();
          setHeader(config, 'Authorization', `Bearer ${token}`);
          return instance(config);
        } catch (refreshError) {
          const refreshApiError = normalizeApiError(refreshError);
          unauthorizedHandler?.(refreshApiError);
          return Promise.reject(refreshApiError);
        }
      }

      if (!isAuthEndpoint(config?.url)) {
        unauthorizedHandler?.(error);
      }

      return Promise.reject(error);
    },
  );

  return {
    instance,
    bare,
    get: (url, config) => instance.get(url, config).then((res) => unwrapResponse(res.data)),
    delete: (url, config) => instance.delete(url, config).then((res) => unwrapResponse(res.data)),
    post: (url, data, config) =>
      instance.post(url, data, config).then((res) => unwrapResponse(res.data)),
    put: (url, data, config) =>
      instance.put(url, data, config).then((res) => unwrapResponse(res.data)),
    patch: (url, data, config) =>
      instance.patch(url, data, config).then((res) => unwrapResponse(res.data)),
    setUnauthorizedHandler(handler) {
      unauthorizedHandler = handler;
    },
    setRefreshHandler(handler) {
      // 并发 401 只触发一次刷新。
      refresh = handler ? singleFlight(() => handler(bare)) : null;
    },
    setErrorReporter(reporter) {
      errorReporter = reporter;
    },
  };
}
