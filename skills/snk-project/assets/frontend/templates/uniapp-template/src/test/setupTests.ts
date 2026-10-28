import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, vi } from 'vitest';
import { i18n } from '@/i18n';

/** 测试环境中的 uni 全局对象替身：只实现模板用到的 API，测试里可用 vi.mocked(uni.xxx) 断言。 */
const storage = new Map<string, unknown>();
const uniMock = {
  getStorageSync: vi.fn((key: string) => storage.get(key) ?? ''),
  setStorageSync: vi.fn((key: string, value: unknown) => void storage.set(key, value)),
  removeStorageSync: vi.fn((key: string) => void storage.delete(key)),
  getSystemInfoSync: vi.fn(() => ({ language: 'zh-CN', theme: 'light' })),
  onThemeChange: vi.fn(),
  setLocale: vi.fn(),
  request: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
  reLaunch: vi.fn(),
  setNavigationBarTitle: vi.fn(),
  setNavigationBarColor: vi.fn(),
};

vi.stubGlobal('uni', uniMock);

beforeEach(() => {
  storage.clear();
  setActivePinia(createPinia());
  i18n.global.locale.value = 'zh-CN';
});
