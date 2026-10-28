<script setup lang="ts">
import type { Component } from 'vue';
import { cn } from '@/core/utils/cn';
import { buttonVariants, type ButtonVariants } from './buttonVariants';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  /** 渲染为其他元素或组件，例如 `RouterLink`、`'a'`。 */
  as?: string | Component;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  as: 'button',
  type: 'button',
  class: undefined,
});
</script>

<template>
  <component
    :is="props.as"
    data-slot="button"
    :type="props.as === 'button' ? props.type : undefined"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </component>
</template>
