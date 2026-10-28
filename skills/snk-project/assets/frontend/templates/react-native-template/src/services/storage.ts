import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { KeyValueStorage } from '@/core/auth/nativeAuth';

/**
 * 安全键值存储：iOS Keychain / Android Keystore（expo-secure-store）。
 * Web（H5）没有安全存储，退化为 localStorage——生产环境的 H5 如对安全要求高，建议改用 Cookie 方案（参考 Next.js 模板）。
 */
const webStorage: KeyValueStorage = {
  async getItem(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // ignore
    }
  },
  async removeItem(key) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const nativeStorage: KeyValueStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const secureStorage: KeyValueStorage = Platform.OS === 'web' ? webStorage : nativeStorage;
