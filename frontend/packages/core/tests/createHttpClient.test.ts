import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { AppApiError } from '../src/http/apiError';
import { createHttpClient } from '../src/http/createHttpClient';

function respond(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): Promise<AxiosResponse> {
  const response = {
    data,
    status,
    statusText: String(status),
    headers: {},
    config,
  } as AxiosResponse;

  if (status >= 400) {
    return Promise.reject(
      new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response),
    );
  }

  return Promise.resolve(response);
}

function setup(adapter: AxiosAdapter, token: { value: string | null } = { value: null }) {
  const http = createHttpClient({
    baseURL: '/api',
    getAccessToken: () => token.value,
    getLocale: () => 'zh-CN',
  });
  http.instance.defaults.adapter = adapter;
  http.bare.defaults.adapter = adapter;
  return http;
}

describe('createHttpClient', () => {
  it('injects common headers and unwraps ApiResponse', async () => {
    const adapter = vi.fn<AxiosAdapter>((config) =>
      respond(config, 200, { code: 0, message: 'ok', data: { id: 1 } }),
    );
    const http = setup(adapter, { value: 'token-1' });

    await expect(http.get('/users/1')).resolves.toEqual({ id: 1 });

    const headers = adapter.mock.calls[0]![0].headers;
    expect(headers.get('Authorization')).toBe('Bearer token-1');
    expect(headers.get('Accept-Language')).toBe('zh-CN');
    expect(headers.get('X-Request-ID')).toBeTruthy();
  });

  it('returns raw data when backend does not wrap the response', async () => {
    const http = setup((config) => respond(config, 200, [1, 2, 3]));
    await expect(http.get('/raw')).resolves.toEqual([1, 2, 3]);
  });

  it('throws AppApiError for business error codes and reports it', async () => {
    const http = setup((config) =>
      respond(config, 200, { code: 4001, message: '余额不足', data: null }),
    );
    const reporter = vi.fn();
    http.setErrorReporter(reporter);

    await expect(http.post('/orders')).rejects.toMatchObject({
      name: 'AppApiError',
      code: 4001,
      message: '余额不足',
    });
    expect(reporter).toHaveBeenCalledWith(
      expect.any(AppApiError),
      expect.objectContaining({ source: 'business_error' }),
    );
  });

  it('refreshes token once for concurrent 401 responses and retries', async () => {
    const token = { value: 'expired' as string | null };
    const adapter: AxiosAdapter = (config) => {
      if (config.url === '/auth/refresh') {
        return respond(config, 200, { code: 0, message: 'ok', data: { accessToken: 'fresh' } });
      }
      const auth = config.headers.get('Authorization');
      return auth === 'Bearer fresh'
        ? respond(config, 200, { code: 0, message: 'ok', data: config.url })
        : respond(config, 401, { code: 'UNAUTHORIZED', message: 'expired' });
    };
    const http = setup(adapter, token);
    const refresh = vi.fn(async () => {
      token.value = 'fresh';
      return 'fresh';
    });
    http.setRefreshHandler(refresh);

    const results = await Promise.all([http.get('/a'), http.get('/b'), http.get('/c')]);

    expect(results).toEqual(['/a', '/b', '/c']);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('calls unauthorized handler when refresh fails', async () => {
    const http = setup((config) => respond(config, 401, { code: 401, message: 'expired' }));
    const onUnauthorized = vi.fn();
    http.setUnauthorizedHandler(onUnauthorized);
    http.setRefreshHandler(async () => {
      throw new Error('refresh failed');
    });

    await expect(http.get('/me')).rejects.toBeInstanceOf(AppApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not refresh or report for auth endpoints', async () => {
    const http = setup((config) => respond(config, 401, { code: 401, message: 'bad credentials' }));
    const refresh = vi.fn();
    const onUnauthorized = vi.fn();
    const reporter = vi.fn();
    http.setRefreshHandler(refresh);
    http.setUnauthorizedHandler(onUnauthorized);
    http.setErrorReporter(reporter);

    await expect(http.post('/auth/login', {})).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(reporter).not.toHaveBeenCalled();
  });
});
