import { create } from 'zustand';
import { getLocales } from 'expo-localization';
import { defaultLocale, isAppLocale, matchLocale, type AppLocale } from '@/core/i18n/locales';
import {
  defaultColorMode,
  defaultTheme,
  isAppTheme,
  isColorMode,
  type AppTheme,
  type ColorMode,
} from '@/core/theme/theme';
import { secureStorage } from '@/services/storage';

const STORAGE_KEY = 'app.preferences';

interface PreferencesState {
  locale: AppLocale;
  theme: AppTheme;
  colorMode: ColorMode;
  hydrated: boolean;
  setLocale: (locale: AppLocale) => void;
  setTheme: (theme: AppTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  hydrate: () => Promise<void>;
}

function deviceLocale(): AppLocale {
  for (const { languageTag } of getLocales()) {
    const matched = matchLocale(languageTag);
    if (matched) return matched;
  }
  return defaultLocale;
}

/** 应用级偏好：语言、品牌主题、深浅色。持久化到本地存储。 */
export const usePreferencesStore = create<PreferencesState>((set, get) => {
  const persist = () => {
    const { locale, theme, colorMode } = get();
    void secureStorage.setItem(STORAGE_KEY, JSON.stringify({ locale, theme, colorMode }));
  };

  return {
    locale: deviceLocale(),
    theme: defaultTheme,
    colorMode: defaultColorMode,
    hydrated: false,
    setLocale: (locale) => {
      set({ locale });
      persist();
    },
    setTheme: (theme) => {
      set({ theme });
      persist();
    },
    setColorMode: (colorMode) => {
      set({ colorMode });
      persist();
    },
    async hydrate() {
      try {
        const saved = JSON.parse((await secureStorage.getItem(STORAGE_KEY)) ?? '{}') as Record<
          string,
          unknown
        >;
        set({
          ...(isAppLocale(saved.locale) && { locale: saved.locale }),
          ...(isAppTheme(saved.theme) && { theme: saved.theme }),
          ...(isColorMode(saved.colorMode) && { colorMode: saved.colorMode }),
        });
      } catch {
        // 读取失败时使用默认值
      } finally {
        set({ hydrated: true });
      }
    },
  };
});
