import type { routing } from './routing';
import type { AppMessages } from './messages';

/** next-intl 类型增强：t('xxx') 的 key 和 locale 都有类型提示。 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: AppMessages;
  }
}
