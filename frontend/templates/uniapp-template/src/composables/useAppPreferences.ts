import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { AppLocale } from '@/core/i18n/locales';
import { i18n } from '@/i18n';
import { usePreferencesStore } from '@/stores/preferencesStore';

/** uni 内置组件（日期选择、弹窗按钮等）使用的语言代码。 */
const uniLocales: Record<AppLocale, string> = { 'zh-CN': 'zh-Hans', 'en-US': 'en' };

/** 在 App.vue 中调用一次：把偏好中的语言同步到 vue-i18n 和 uni 内置组件。 */
export function setupAppPreferences() {
  const { locale } = storeToRefs(usePreferencesStore());

  watch(
    locale,
    (value) => {
      i18n.global.locale.value = value;
      try {
        uni.setLocale(uniLocales[value]);
      } catch {
        // 部分平台不支持
      }
    },
    { immediate: true },
  );
}
