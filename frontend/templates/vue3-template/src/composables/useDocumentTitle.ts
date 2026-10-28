import { toValue, watchEffect, type MaybeRefOrGetter } from 'vue';
import { env } from '@/config/env';

/** 设置页面标题，格式：`页面 | 应用名`。支持响应式标题（切换语言后自动更新）。 */
export function useDocumentTitle(title: MaybeRefOrGetter<string | undefined>) {
  watchEffect(() => {
    const value = toValue(title);
    document.title = value ? `${value} | ${env.appName}` : env.appName;
  });
}
