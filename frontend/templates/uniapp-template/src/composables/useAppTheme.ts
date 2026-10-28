import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { themes } from '@/core/theme/theme';
import { darkColors, lightColors, type ColorTokens } from '@/core/theme/tokens';
import { usePreferencesStore } from '@/stores/preferencesStore';

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function getSystemTheme(): 'light' | 'dark' {
  try {
    return uni.getSystemInfoSync().theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

const systemTheme = ref(getSystemTheme());
let listening = false;

/**
 * 当前主题：语义色（随深浅色切换）+ 品牌色（随主题切换）。
 * 颜色与 Web 模板的 tokens.css 同源（src/core/theme/tokens.ts）。
 * `cssVars` 绑定到页面根节点（PageContainer），组件样式统一使用 var(--primary) 等变量。
 */
export function useAppTheme() {
  const { theme, colorMode } = storeToRefs(usePreferencesStore());

  if (!listening) {
    listening = true;
    try {
      uni.onThemeChange?.(({ theme: next }) => {
        systemTheme.value = next === 'dark' ? 'dark' : 'light';
      });
    } catch {
      // 部分平台不支持监听系统主题
    }
  }

  const isDark = computed(() =>
    colorMode.value === 'system' ? systemTheme.value === 'dark' : colorMode.value === 'dark',
  );

  const colors = computed<ColorTokens>(() => {
    const brand = themes[theme.value];
    const base = isDark.value ? darkColors : lightColors;
    return { ...base, primary: brand.primary, ring: brand.primary, secondary: brand.secondary };
  });

  const cssVars = computed(() =>
    Object.fromEntries(
      Object.entries(colors.value).map(([key, value]) => [`--${kebab(key)}`, value]),
    ),
  );

  return { isDark, colors, cssVars };
}
