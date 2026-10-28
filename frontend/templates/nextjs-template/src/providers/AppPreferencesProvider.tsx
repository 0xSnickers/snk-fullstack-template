'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  applyColorMode,
  applyTheme,
  defaultColorMode,
  defaultTheme,
  getStoredColorMode,
  getStoredTheme,
  storeColorMode,
  storeTheme,
  watchSystemColorMode,
  type AppTheme,
  type ColorMode,
} from '@/core/theme/theme';

interface AppPreferencesContextValue {
  theme: AppTheme;
  colorMode: ColorMode;
  changeTheme: (theme: AppTheme) => void;
  changeColorMode: (mode: ColorMode) => void;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

/**
 * 主题色 / 深浅色偏好（客户端）。语言由 URL 前缀决定，不在这里管理。
 * 首屏样式由 layout 中的 themeInitScript 提前应用，这里只负责同步状态，避免水合不一致。
 */
export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(defaultTheme);
  const [colorMode, setColorMode] = useState<ColorMode>(defaultColorMode);

  useEffect(() => {
    // 水合完成后再读取本地偏好，避免服务端 / 客户端渲染不一致
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getStoredTheme());
    setColorMode(getStoredColorMode());
  }, []);

  useEffect(() => {
    applyColorMode(colorMode);
    if (colorMode !== 'system') return undefined;
    return watchSystemColorMode(() => applyColorMode('system'));
  }, [colorMode]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      theme,
      colorMode,
      changeTheme: (next) => {
        storeTheme(next);
        applyTheme(next);
        setTheme(next);
      },
      changeColorMode: (next) => {
        storeColorMode(next);
        setColorMode(next);
      },
    }),
    [colorMode, theme],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }

  return context;
}
