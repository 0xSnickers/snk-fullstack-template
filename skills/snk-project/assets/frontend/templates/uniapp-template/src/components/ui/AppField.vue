<script setup lang="ts">
/** 表单字段：label + 输入框 + 错误提示。基于 uni 的 input 组件，H5 / App / 小程序通用。 */
withDefaults(
  defineProps<{
    label: string;
    error?: string;
    type?: 'text' | 'number' | 'idcard' | 'digit';
    password?: boolean;
    inputMode?: 'email' | 'search' | 'text' | 'tel' | 'url' | 'none' | 'numeric' | 'decimal';
  }>(),
  { error: '', type: 'text', password: false, inputMode: undefined },
);

const model = defineModel<string>({ default: '' });

function onInput(event: Event) {
  model.value = (event as unknown as { detail: { value: string } }).detail.value;
}
</script>

<template>
  <view class="app-field">
    <text class="app-field__label">{{ label }}</text>
    <input
      class="app-field__input"
      :class="{ 'app-field__input--invalid': error }"
      :value="model"
      :type="type"
      :password="password"
      :inputmode="inputMode"
      :placeholder="label"
      :aria-label="label"
      :aria-invalid="Boolean(error)"
      placeholder-class="app-field__placeholder"
      @input="onInput"
    />
    <text v-if="error" class="app-field__error">{{ error }}</text>
  </view>
</template>

<style scoped>
.app-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.app-field__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
}
.app-field__input {
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--input);
  border-radius: 6px;
  background-color: var(--background);
  color: var(--foreground);
  font-size: 15px;
}
.app-field__input--invalid {
  border-color: var(--destructive);
}
.app-field__error {
  font-size: 13px;
  color: var(--destructive);
}
</style>

<style>
.app-field__placeholder {
  color: var(--muted-foreground);
}
</style>
