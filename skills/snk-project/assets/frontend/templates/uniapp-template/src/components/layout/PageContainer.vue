<script setup lang="ts">
import { useAppTheme } from '@/composables/useAppTheme';

/** 页面根容器：注入主题 CSS 变量、背景色、安全区内边距。每个页面最外层使用它。 */
const { cssVars } = useAppTheme();
</script>

<template>
  <view class="page-container" :style="cssVars">
    <view class="page-container__content"><slot /></view>
  </view>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--surface);
  color: var(--foreground);
  padding-bottom: env(safe-area-inset-bottom);
}
.page-container__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
}
</style>
