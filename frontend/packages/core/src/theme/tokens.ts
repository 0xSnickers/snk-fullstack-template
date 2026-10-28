/**
 * 设计 Token 的 JS 版本，供无法使用 CSS 变量的平台（React Native、uni-app App 端）使用。
 * 必须与 styles/tokens.css 保持一致（core 单元测试会校验）；Flutter 版本由 sync-core 自动生成。
 *
 * 品牌色 primary / secondary / ring 由 theme.ts 中的 themes 决定，这里只是默认值。
 */
export const lightColors = {
  background: '#ffffff',
  foreground: '#020617',
  surface: '#f8fafc',
  card: '#ffffff',
  cardForeground: '#020617',
  popover: '#ffffff',
  popoverForeground: '#020617',
  primary: '#2563eb',
  primaryForeground: '#ffffff',
  secondary: '#0f766e',
  secondaryForeground: '#ffffff',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#f1f5f9',
  accentForeground: '#0f172a',
  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#2563eb',
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  ...lightColors,
  background: '#020617',
  foreground: '#f8fafc',
  surface: '#0b1220',
  card: '#0f172a',
  cardForeground: '#f8fafc',
  popover: '#0f172a',
  popoverForeground: '#f8fafc',
  muted: '#1e293b',
  mutedForeground: '#94a3b8',
  accent: '#1e293b',
  accentForeground: '#f8fafc',
  destructive: '#ef4444',
  border: '#1e293b',
  input: '#334155',
};

/** 圆角（px），与 tokens.css 中 --radius 体系一致。 */
export const radius = { sm: 4, md: 6, lg: 8, xl: 12 };

/** 间距（px），移动端组件统一使用。 */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/** 字号（px）。 */
export const fontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 24 };
