<script setup lang="ts">
import { computed, useId } from 'vue';

const props = defineProps<{
  label: string;
  error?: string | null;
}>();

const id = useId();
const errorId = `${id}-error`;

/** 通过作用域插槽把无障碍属性交给表单控件：<template #default="field"><Input v-bind="field" /></template> */
const field = computed(() => ({
  id,
  'aria-invalid': props.error ? true : undefined,
  'aria-describedby': props.error ? errorId : undefined,
}));
</script>

<template>
  <div class="space-y-2">
    <label :for="id" class="text-sm font-medium">{{ label }}</label>
    <slot v-bind="field" />
    <p v-if="error" :id="errorId" class="text-sm text-destructive">{{ error }}</p>
  </div>
</template>
