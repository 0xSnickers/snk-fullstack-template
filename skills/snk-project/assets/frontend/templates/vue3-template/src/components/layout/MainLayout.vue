<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AppControls from './AppControls.vue';

const { t } = useI18n();
const route = useRoute();

const navItems = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/profile', labelKey: 'nav.profile' },
] as const;
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b bg-background">
      <div
        class="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2"
      >
        <nav class="flex items-center gap-4 text-sm">
          <RouterLink to="/" class="font-semibold">{{ t('common.appName') }}</RouterLink>
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="
              route.path === item.to
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
          >
            {{ t(item.labelKey) }}
          </RouterLink>
        </nav>
        <AppControls />
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
