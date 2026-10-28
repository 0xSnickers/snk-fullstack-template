import { watchEffect } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useI18n } from 'vue-i18n';
import { env } from '@/config/env';
import { useAppTheme } from './useAppTheme';

/**
 * 设置导航栏标题和颜色（随语言、深浅色变化）。在每个页面中调用：usePageTitle('nav.home')。
 * 标题使用语言包 key，pages.json 中的 navigationBarTitleText 只作为首帧兜底。
 */
export function usePageTitle(titleKey: string) {
  const { t } = useI18n();
  const { colors, isDark } = useAppTheme();

  const apply = () => {
    const title = t(titleKey);
    uni.setNavigationBarTitle({ title });
    uni.setNavigationBarColor({
      frontColor: isDark.value ? '#ffffff' : '#000000',
      backgroundColor: colors.value.background,
    });
    // #ifdef H5
    document.title = `${title} | ${env.appName}`;
    // #endif
  };

  onShow(apply);
  watchEffect(apply);
}
