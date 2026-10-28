import { createContext, useContext } from 'react';
import type { AppLocale } from '@/core/i18n/locales';
import type { AppTheme, ColorMode } from '@/core/theme/theme';

export interface AppPreferencesContextValue {
  locale: AppLocale;
  theme: AppTheme;
  colorMode: ColorMode;
  changeLocale: (locale: AppLocale) => void;
  changeTheme: (theme: AppTheme) => void;
  changeColorMode: (mode: ColorMode) => void;
}

export const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }

  return context;
}
