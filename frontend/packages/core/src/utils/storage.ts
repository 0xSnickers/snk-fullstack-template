/**
 * 安全的 localStorage 访问。
 * SSR、隐私模式、存储被禁用时不会抛错，读取失败返回 null。
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // 存储不可用时静默忽略，偏好设置只是体验增强。
    }
  },
  remove(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },
};

/** 存储键统一加前缀，避免同域多个应用冲突。 */
export const STORAGE_PREFIX = 'app';

export function storageKey(name: string): string {
  return `${STORAGE_PREFIX}.${name}`;
}
