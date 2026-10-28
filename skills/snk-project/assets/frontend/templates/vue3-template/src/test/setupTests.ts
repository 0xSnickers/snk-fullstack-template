import '@testing-library/jest-dom/vitest';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach } from 'vitest';
import { i18n } from '@/i18n';

beforeEach(() => {
  setActivePinia(createPinia());
  // 测试统一使用中文文案，断言更稳定。
  i18n.global.locale.value = 'zh-CN';
});

afterEach(() => {
  window.localStorage.clear();
});
