<script setup lang="ts">
/**
 * 按钮：与 Web / RN 模板同一套变体命名（default / secondary / outline / ghost / destructive）。
 * 使用 view 而不是 uni 的 button 组件，避免各端原生按钮样式差异。
 */
const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg';
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  { variant: 'default', size: 'default', block: false, loading: false, disabled: false },
);

const emit = defineEmits<{ click: [] }>();

function handleClick() {
  if (props.disabled || props.loading) return;
  emit('click');
}
</script>

<template>
  <view
    role="button"
    :aria-disabled="disabled || loading"
    :class="[
      'app-button',
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--block': block, 'app-button--disabled': disabled || loading },
    ]"
    hover-class="app-button--pressed"
    @click="handleClick"
  >
    <view v-if="loading" class="app-button__spinner" />
    <text class="app-button__text"><slot /></text>
  </view>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  box-sizing: border-box;
  cursor: pointer;
}
.app-button--sm {
  height: 34px;
  padding: 0 12px;
}
.app-button--lg {
  height: 50px;
  padding: 0 24px;
}
.app-button--block {
  display: flex;
  width: 100%;
}
.app-button__text {
  font-size: 15px;
  font-weight: 600;
}
.app-button--sm .app-button__text {
  font-size: 13px;
}
.app-button--default {
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}
.app-button--secondary {
  background-color: var(--secondary);
  border-color: var(--secondary);
  color: var(--secondary-foreground);
}
.app-button--outline {
  background-color: var(--background);
  border-color: var(--input);
  color: var(--foreground);
}
.app-button--ghost {
  background-color: transparent;
  color: var(--foreground);
}
.app-button--destructive {
  background-color: var(--destructive);
  border-color: var(--destructive);
  color: var(--destructive-foreground);
}
.app-button--pressed {
  opacity: 0.85;
}
.app-button--disabled {
  opacity: 0.5;
}
.app-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: app-button-spin 0.8s linear infinite;
}
@keyframes app-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
