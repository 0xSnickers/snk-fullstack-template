import { safeStorage, storageKey } from '../utils/storage';

/**
 * 三端统一使用 BCP 47 语言代码。
 * Next.js 路由前缀同样使用这些值，例如 `/zh-CN/login`。
 */
export const locales = ['zh-CN', 'en-US'] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'zh-CN';

/** 默认时区，日期格式化与 next-intl 共用。 */
export const defaultTimeZone = 'Asia/Shanghai';

export const localeLabels: Record<AppLocale, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
};

const LOCALE_STORAGE_KEY = storageKey('locale');

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/**
 * 把任意语言标识匹配到受支持的语言：精确匹配 > 语言前缀匹配（en-GB -> en-US）> 默认语言。
 */
export function matchLocale(candidate: string | null | undefined): AppLocale | null {
  if (!candidate) return null;
  if (isAppLocale(candidate)) return candidate;

  const language = candidate.toLowerCase().split('-')[0];
  return locales.find((locale) => locale.toLowerCase().split('-')[0] === language) ?? null;
}

/** 浏览器侧读取语言：本地存储 > 浏览器语言 > 默认语言。 */
export function getStoredLocale(): AppLocale {
  const stored = matchLocale(safeStorage.get(LOCALE_STORAGE_KEY));
  if (stored) return stored;

  if (typeof navigator !== 'undefined') {
    for (const language of navigator.languages ?? [navigator.language]) {
      const matched = matchLocale(language);
      if (matched) return matched;
    }
  }

  return defaultLocale;
}

export function storeLocale(locale: AppLocale): void {
  safeStorage.set(LOCALE_STORAGE_KEY, locale);
}

export function applyDocumentLocale(locale: AppLocale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}
