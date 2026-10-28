import { readonly, ref } from 'vue';
import {
  applyDocumentLocale,
  getStoredLocale,
  storeLocale,
  type AppLocale,
} from '@/core/i18n/locales';
import {
  applyColorMode,
  applyTheme,
  getStoredColorMode,
  getStoredTheme,
  storeColorMode,
  storeTheme,
  watchSystemColorMode,
  type AppTheme,
  type ColorMode,
} from '@/core/theme/theme';
import { i18n } from '@/i18n';

// 应用级偏好是全局单例：模块级 ref 即可，不需要放进 Pinia。
const locale = ref<AppLocale>(getStoredLocale());
const theme = ref<AppTheme>(getStoredTheme());
const colorMode = ref<ColorMode>(getStoredColorMode());
let stopWatchingSystem: (() => void) | null = null;

function syncColorMode(mode: ColorMode) {
  applyColorMode(mode);
  stopWatchingSystem?.();
  stopWatchingSystem =
    mode === 'system' ? watchSystemColorMode(() => applyColorMode('system')) : null;
}

/** 应用启动时调用一次，把已保存的偏好应用到页面。 */
export function initAppPreferences() {
  applyDocumentLocale(locale.value);
  i18n.global.locale.value = locale.value;
  applyTheme(theme.value);
  syncColorMode(colorMode.value);
}

export function useAppPreferences() {
  return {
    locale: readonly(locale),
    theme: readonly(theme),
    colorMode: readonly(colorMode),
    changeLocale(next: AppLocale) {
      locale.value = next;
      storeLocale(next);
      applyDocumentLocale(next);
      i18n.global.locale.value = next;
    },
    changeTheme(next: AppTheme) {
      theme.value = next;
      storeTheme(next);
      applyTheme(next);
    },
    changeColorMode(next: ColorMode) {
      colorMode.value = next;
      storeColorMode(next);
      syncColorMode(next);
    },
  };
}
