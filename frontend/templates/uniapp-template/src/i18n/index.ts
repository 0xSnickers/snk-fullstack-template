import { createI18n } from 'vue-i18n';
import { defaultLocale } from '@/core/i18n/locales';
import { messages } from './messages';

/** 插值语法 `{name}` 与其他模板一致。当前语言由 preferencesStore 驱动（见 composables/useAppPreferences）。 */
export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages,
  missingWarn: false,
  fallbackWarn: false,
});
