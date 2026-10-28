import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { defaultLocale, isAppLocale, matchLocale, type AppLocale } from '@/core/i18n/locales';
import {
  defaultColorMode,
  defaultTheme,
  isAppTheme,
  isColorMode,
  type AppTheme,
  type ColorMode,
} from '@/core/theme/theme';

const STORAGE_KEY = 'app.preferences';

function systemLocale(): AppLocale {
  try {
    return matchLocale(uni.getSystemInfoSync().language) ?? defaultLocale;
  } catch {
    return defaultLocale;
  }
}

function readSaved(): Record<string, unknown> {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY) as unknown;
    return typeof raw === 'string' && raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** 应用级偏好：语言、品牌主题、深浅色。同步读取本地存储，启动即生效。 */
export const usePreferencesStore = defineStore('preferences', () => {
  const saved = readSaved();
  const locale = ref<AppLocale>(isAppLocale(saved.locale) ? saved.locale : systemLocale());
  const theme = ref<AppTheme>(isAppTheme(saved.theme) ? saved.theme : defaultTheme);
  const colorMode = ref<ColorMode>(
    isColorMode(saved.colorMode) ? saved.colorMode : defaultColorMode,
  );

  watch([locale, theme, colorMode], () => {
    try {
      uni.setStorageSync(
        STORAGE_KEY,
        JSON.stringify({ locale: locale.value, theme: theme.value, colorMode: colorMode.value }),
      );
    } catch {
      // ignore
    }
  });

  return { locale, theme, colorMode };
});
