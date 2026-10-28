import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultLocale, getStoredLocale, locales } from '@/core/i18n/locales';
import { messages } from './messages';

const resources = Object.fromEntries(
  locales.map((locale) => [locale, { translation: messages[locale] }]),
);

void i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLocale(),
  fallbackLng: defaultLocale,
  supportedLngs: locales,
  interpolation: {
    escapeValue: false,
    // 与 vue-i18n / next-intl 保持一致的单花括号插值：t('home.signedInAs', { name })
    prefix: '{',
    suffix: '}',
  },
  returnNull: false,
});

export { i18n };
