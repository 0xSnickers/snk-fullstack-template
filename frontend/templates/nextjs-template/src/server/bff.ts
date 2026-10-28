import 'server-only';

import { NextResponse } from 'next/server';
import { serverEnv } from '@/config/env.server';
import type { ApiResponse } from '@/core/http/types';

/**
 * BFF（Backend For Frontend）工具：Next.js 服务端转发请求到真实后端。
 *
 * 浏览器 -> /api/*（同源，携带 HttpOnly Cookie）-> Route Handler -> 后端 API_BASE_URL
 * accessToken 只在服务端使用，浏览器永远拿不到。
 */

export interface BackendRequestInit extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
  /** 转发给后端的 Cookie（刷新凭证 / 会话）。 */
  cookieHeader?: string;
  /** 后端需要的 accessToken。 */
  accessToken?: string;
}

export interface BackendResult<T> {
  payload: ApiResponse<T>;
  response: Response;
}

/** 浏览器请求中需要透传给后端的请求头。 */
const FORWARDED_HEADERS = ['accept-language', 'x-request-id', 'user-agent', 'content-type'];

export function getForwardedHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

export function getRequestCookieHeader(request: Request): string {
  return request.headers.get('cookie') ?? '';
}

export async function fetchBackend<T>(
  path: string,
  init: BackendRequestInit = {},
): Promise<BackendResult<T>> {
  const { cookieHeader, accessToken, headers: initHeaders, ...requestInit } = init;
  const headers = new Headers(initHeaders);

  if (!headers.has('accept')) headers.set('accept', 'application/json');
  if (requestInit.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  if (cookieHeader) headers.set('cookie', cookieHeader);
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);

  try {
    const response = await fetch(`${serverEnv.backendApiBaseUrl}${path}`, {
      ...requestInit,
      headers,
      cache: 'no-store',
      signal: requestInit.signal ?? AbortSignal.timeout(serverEnv.backendTimeoutMs),
    });

    return { payload: await parseApiResponse<T>(response), response };
  } catch (error) {
    // 后端不可达 / 超时：统一转换成 502，前端拿到的仍然是标准错误结构。
    const message = error instanceof Error ? error.message : 'Backend unavailable';
    const response = new Response(null, { status: 502, statusText: 'Bad Gateway' });
    return {
      payload: { code: 'BACKEND_UNAVAILABLE', message, data: undefined as T },
      response,
    };
  }
}

/** 把后端结果转成 Next.js 响应，并透传 Set-Cookie。`mapData` 用于剔除敏感字段（如 accessToken）。 */
export function toBffResponse<T, U = T>(result: BackendResult<T>, mapData?: (data: T) => U) {
  const payload =
    result.response.ok && mapData
      ? { ...result.payload, data: mapData(result.payload.data) }
      : result.payload;
  const response = NextResponse.json(payload, { status: result.response.status });
  forwardSetCookie(result.response, response);
  return response;
}

export function createErrorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ code, message, data: null }, { status });
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();
  const fallback = {
    code: response.ok ? 0 : response.status,
    message: response.statusText,
    data: undefined as T,
  };

  if (!text) return fallback;

  try {
    const json = JSON.parse(text) as unknown;
    // 兼容未包裹 { code, message, data } 的后端
    return json && typeof json === 'object' && 'code' in json
      ? (json as ApiResponse<T>)
      : { ...fallback, data: json as T };
  } catch {
    return {
      ...fallback,
      message: response.ok ? 'Backend returned an invalid response' : 'Backend request failed',
    };
  }
}

function forwardSetCookie(source: Response, target: NextResponse) {
  const setCookies = source.headers.getSetCookie?.() ?? [];

  if (setCookies.length > 0) {
    setCookies.forEach((cookie) => target.headers.append('set-cookie', cookie));
    return;
  }

  const setCookie = source.headers.get('set-cookie');
  if (setCookie) target.headers.set('set-cookie', setCookie);
}
