import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
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
import { AppPreferencesContext, type AppPreferencesContextValue } from './appPreferencesContext';

/** 应用级偏好：语言、品牌主题、深浅色。 */
export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(getStoredLocale);
  const [theme, setTheme] = useState<AppTheme>(getStoredTheme);
  const [colorMode, setColorMode] = useState<ColorMode>(getStoredColorMode);

  useEffect(() => {
    applyDocumentLocale(locale);
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
  }, [locale]);

  useEffect(() => applyTheme(theme), [theme]);

  useEffect(() => {
    applyColorMode(colorMode);
    if (colorMode !== 'system') return undefined;
    return watchSystemColorMode(() => applyColorMode('system'));
  }, [colorMode]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      locale,
      theme,
      colorMode,
      changeLocale: (next) => {
        storeLocale(next);
        setLocale(next);
      },
      changeTheme: (next) => {
        storeTheme(next);
        setTheme(next);
      },
      changeColorMode: (next) => {
        storeColorMode(next);
        setColorMode(next);
      },
    }),
    [colorMode, locale, theme],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </AppPreferencesContext.Provider>
  );
}
