import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultLocale, locales } from '@/core/i18n/locales';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { messages } from './messages';

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: Object.fromEntries(
    locales.map((locale) => [locale, { translation: messages[locale] }]),
  ),
  lng: usePreferencesStore.getState().locale,
  fallbackLng: defaultLocale,
  supportedLngs: locales,
  interpolation: {
    escapeValue: false,
    // 与 Web 模板一致的单花括号插值：t('home.signedInAs', { name })
    prefix: '{',
    suffix: '}',
  },
  returnNull: false,
});

// 偏好中的语言变化时同步到 i18next
usePreferencesStore.subscribe((state, previous) => {
  if (state.locale !== previous.locale) void i18n.changeLanguage(state.locale);
});

export { i18n };
