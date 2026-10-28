import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { i18n } from '@/i18n';

// 测试统一使用中文文案，断言更稳定（AppPreferencesProvider 会读取本地存储中的语言）。
beforeEach(() => {
  window.localStorage.setItem('app.locale', 'zh-CN');
  void i18n.changeLanguage('zh-CN');
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
