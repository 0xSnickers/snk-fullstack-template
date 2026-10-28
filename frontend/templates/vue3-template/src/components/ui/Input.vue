<script setup lang="ts">
import { cn } from '@/core/utils/cn';

defineOptions({ inheritAttrs: false });

const model = defineModel<string>({ default: '' });
const props = defineProps<{ class?: string }>();
</script>

<template>
  <input
    v-model="model"
    v-bind="$attrs"
    data-slot="input"
    :class="
      cn(
        'h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        props.class,
      )
    "
  />
</template>
