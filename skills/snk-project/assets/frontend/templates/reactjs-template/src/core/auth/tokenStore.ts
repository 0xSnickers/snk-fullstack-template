// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
export interface TokenStore {
  get(): string | null;
  set(token: string): void;
  clear(): void;
  subscribe(listener: (token: string | null) => void): () => void;
}

/**
 * 内存 Token 存储。
 * accessToken 只放内存，刷新凭证由后端写入 HttpOnly Cookie，避免 XSS 读取长期凭证。
 */
export function createMemoryTokenStore(): TokenStore {
  let token: string | null = null;
  const listeners = new Set<(token: string | null) => void>();

  const emit = () => listeners.forEach((listener) => listener(token));

  return {
    get: () => token,
    set(next) {
      token = next;
      emit();
    },
    clear() {
      token = null;
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
