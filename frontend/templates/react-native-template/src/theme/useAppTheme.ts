import { useColorScheme } from 'react-native';
import { themes } from '@/core/theme/theme';
import {
  darkColors,
  fontSize,
  lightColors,
  radius,
  spacing,
  type ColorTokens,
} from '@/core/theme/tokens';
import { usePreferencesStore } from '@/stores/preferencesStore';

export interface AppTheme {
  colors: ColorTokens;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
}

/**
 * 当前主题：语义色（随深浅色切换）+ 品牌色（随主题切换）+ 尺寸 Token。
 * 颜色与 Web 模板的 tokens.css 同源（src/core/theme/tokens.ts），组件里不要硬编码颜色。
 */
export function useAppTheme(): AppTheme {
  const system = useColorScheme();
  const brand = usePreferencesStore((state) => themes[state.theme]);
  const colorMode = usePreferencesStore((state) => state.colorMode);
  const isDark = colorMode === 'system' ? system === 'dark' : colorMode === 'dark';
  const base = isDark ? darkColors : lightColors;

  return {
    colors: { ...base, primary: brand.primary, ring: brand.primary, secondary: brand.secondary },
    isDark,
    spacing,
    radius,
    fontSize,
  };
}
