import type { KeyValueStorage } from '@/core/auth/nativeAuth';

/**
 * uni 本地存储（App 端为应用沙盒，小程序为平台存储，H5 为 localStorage）。
 * 注意：H5 端 localStorage 可被页面脚本读取，对安全要求高的 H5 建议改用 HttpOnly Cookie 方案。
 */
export const appStorage: KeyValueStorage = {
  async getItem(key) {
    try {
      const value = uni.getStorageSync(key) as unknown;
      return typeof value === 'string' && value !== '' ? value : null;
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      uni.setStorageSync(key, value);
    } catch {
      // 存储失败时忽略，最多导致下次启动需要重新登录
    }
  },
  async removeItem(key) {
    try {
      uni.removeStorageSync(key);
    } catch {
      // ignore
    }
  },
};
