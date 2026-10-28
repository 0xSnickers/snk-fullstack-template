<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from '@/components/ui/Button.vue';
import { telemetry } from '@/services/telemetry';

const { t } = useI18n();
const hasError = ref(false);

onErrorCaptured((error, _instance, info) => {
  hasError.value = true;
  telemetry.captureError(error, { source: 'vue_error_boundary', info });
  return false;
});
</script>

<template>
  <main
    v-if="hasError"
    role="alert"
    class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-4 px-4"
  >
    <div>
      <h1 class="text-xl font-semibold">{{ t('error.title') }}</h1>
      <p class="mt-2 text-sm text-muted-foreground">{{ t('error.description') }}</p>
    </div>
    <Button @click="hasError = false">{{ t('common.retry') }}</Button>
  </main>
  <slot v-else />
</template>
