<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import ErrorBoundary from '@/components/error/ErrorBoundary.vue';
import { useDocumentTitle } from '@/composables/useDocumentTitle';

const route = useRoute();
const { t } = useI18n();

useDocumentTitle(computed(() => (route.meta.titleKey ? t(route.meta.titleKey) : undefined)));
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>
