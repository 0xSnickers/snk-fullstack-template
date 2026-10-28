import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { createNativeAuthClient, type KeyValueStorage } from '../src/auth/nativeAuth';
import { createMemoryTokenStore } from '../src/auth/tokenStore';
import { createHttpClient } from '../src/http/createHttpClient';

const user = { id: '1', name: 'Alice', email: 'a@example.com', role: 'user' };

function memoryStorage(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => void data.set(key, value),
    removeItem: async (key) => void data.delete(key),
  };
}

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse;
  return status >= 400
    ? Promise.reject(new AxiosError('fail', 'ERR_BAD_RESPONSE', config, null, response))
    : Promise.resolve(response);
}

function setup() {
  const tokenStore = createMemoryTokenStore();
  const storage = memoryStorage();
  const http = createHttpClient({ baseURL: '/api', getAccessToken: tokenStore.get });
  const bodies: Record<string, unknown[]> = {};
  let counter = 0;
  const adapter: AxiosAdapter = (config) => {
    const body = config.data ? JSON.parse(config.data as string) : undefined;
    (bodies[config.url!] ??= []).push(body);
    if (config.url === '/auth/refresh' && body.refreshToken !== `rt-${counter}`) {
      return respond(config, 401, { code: 401, message: 'expired', data: null });
    }
    counter++;
    return respond(config, 200, {
      code: 0,
      message: 'ok',
      data: { user, accessToken: `at-${counter}`, refreshToken: `rt-${counter}` },
    });
  };
  http.instance.defaults.adapter = adapter;
  http.bare.defaults.adapter = adapter;
  const auth = createNativeAuthClient({ http, tokenStore, storage });
  return { auth, tokenStore, storage, bodies };
}

describe('createNativeAuthClient', () => {
  it('logs in with clientType and persists both tokens', async () => {
    const { auth, tokenStore, storage, bodies } = setup();

    const session = await auth.login({ email: 'a@example.com', password: 'password123' });

    expect(bodies['/auth/login']![0]).toMatchObject({ clientType: 'native' });
    expect(session).toEqual({ user, accessToken: 'at-1' });
    expect(tokenStore.get()).toBe('at-1');
    expect(storage.data.get('app.refresh-token')).toBe('rt-1');
  });

  it('refreshes once for concurrent callers and rotates the refresh token', async () => {
    const { auth, storage, bodies } = setup();
    await auth.login({ email: 'a@example.com', password: 'password123' });

    const [a, b] = await Promise.all([auth.refresh(), auth.refresh()]);

    expect(bodies['/auth/refresh']).toHaveLength(1);
    expect(a.accessToken).toBe('at-2');
    expect(b).toEqual(a);
    expect(storage.data.get('app.refresh-token')).toBe('rt-2');
  });

  it('rejects refresh without a stored refresh token', async () => {
    const { auth } = setup();
    await expect(auth.refresh()).rejects.toMatchObject({ status: 401 });
  });

  it('clears tokens on logout even if the request fails', async () => {
    const { auth, tokenStore, storage } = setup();
    await auth.login({ email: 'a@example.com', password: 'password123' });

    await auth.logout();

    expect(tokenStore.get()).toBeNull();
    expect(await storage.getItem('app.refresh-token')).toBeNull();
  });
});
