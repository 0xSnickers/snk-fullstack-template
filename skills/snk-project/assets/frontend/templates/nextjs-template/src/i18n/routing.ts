import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from '@/core/i18n/locales';

/** URL 始终带语言前缀：/zh-CN/login、/en-US/login。 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});
