import { createI18n } from 'vue-i18n';
import { defaultLocale, getStoredLocale } from '@/core/i18n/locales';
import { messages, type AppMessages } from './messages';

export const i18n = createI18n<[AppMessages], 'zh-CN' | 'en-US', false>({
  legacy: false,
  locale: getStoredLocale(),
  fallbackLocale: defaultLocale,
  messages,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: false,
});
