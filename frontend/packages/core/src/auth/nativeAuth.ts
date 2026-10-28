import { AppApiError } from '../http/apiError';
import { unwrapApiResponse, type HttpClient } from '../http/createHttpClient';
import { singleFlight } from '../utils/singleFlight';
import type { TokenStore } from './tokenStore';
import type { AuthSession, LoginInput, RegisterInput } from './types';

/**
 * App（uni-app / React Native）端的鉴权客户端。
 *
 * 移动端没有 HttpOnly Cookie，因此：
 * - accessToken 只放内存（tokenStore）；
 * - refreshToken 放平台安全存储（Keychain / Keystore / uni.setStorage），刷新时通过请求体传给后端；
 * - 请求体带 `clientType: 'native'`，后端据此在响应体中返回 refreshToken（Web 端走 Cookie）。
 */

/** 平台无关的异步键值存储，由各模板适配（SecureStore、uni.setStorage、localStorage）。 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface NativeAuthSession extends AuthSession {
  refreshToken: string;
}

export interface NativeAuthClientOptions {
  http: HttpClient;
  tokenStore: TokenStore;
  storage: KeyValueStorage;
  clientType?: string;
  refreshTokenKey?: string;
}

export function createNativeAuthClient(options: NativeAuthClientOptions) {
  const {
    http,
    tokenStore,
    storage,
    clientType = 'native',
    refreshTokenKey = 'app.refresh-token',
  } = options;

  async function persist(session: NativeAuthSession): Promise<AuthSession> {
    tokenStore.set(session.accessToken);
    if (session.refreshToken) await storage.setItem(refreshTokenKey, session.refreshToken);
    return { user: session.user, accessToken: session.accessToken };
  }

  async function clear() {
    tokenStore.clear();
    await storage.removeItem(refreshTokenKey);
  }

  /** 用 refreshToken 换取新会话；并发调用只发一次请求。后端会旋转 refreshToken。 */
  const refresh = singleFlight(async (): Promise<AuthSession> => {
    const refreshToken = await storage.getItem(refreshTokenKey);
    if (!refreshToken) {
      throw new AppApiError('Unauthorized', { code: 'UNAUTHORIZED', status: 401 });
    }

    const response = await http.bare.post('/auth/refresh', { clientType, refreshToken });
    return persist(unwrapApiResponse<NativeAuthSession>(response.data));
  });

  return {
    login: async (input: LoginInput) =>
      persist(await http.post<NativeAuthSession>('/auth/login', { ...input, clientType })),
    register: async (input: RegisterInput) =>
      persist(await http.post<NativeAuthSession>('/auth/register', { ...input, clientType })),
    refresh,
    async logout() {
      const refreshToken = await storage.getItem(refreshTokenKey);
      try {
        await http.post('/auth/logout', { clientType, refreshToken });
      } finally {
        await clear();
      }
    },
    clear,
    hasRefreshToken: async () => Boolean(await storage.getItem(refreshTokenKey)),
  };
}

export type NativeAuthClient = ReturnType<typeof createNativeAuthClient>;
