<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import Button from '@/components/ui/Button.vue';

const { t } = useI18n();
</script>

<template>
  <section
    class="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center gap-4 px-4"
  >
    <p class="text-sm font-medium text-primary">404</p>
    <h1 class="text-2xl font-semibold">{{ t('common.notFound') }}</h1>
    <p class="text-sm text-muted-foreground">{{ t('common.notFoundDescription') }}</p>
    <Button :as="RouterLink" to="/" variant="outline">{{ t('common.backHome') }}</Button>
  </section>
</template>
