<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/features/auth';

/** 需要登录的页面示例（路由 meta.requiresAuth = true）。 */
const { t } = useI18n();
const { user } = useAuth();
</script>

<template>
  <section v-if="user" class="space-y-4">
    <div>
      <h1 class="text-2xl font-semibold">{{ t('profile.title') }}</h1>
      <p class="mt-2 text-sm text-muted-foreground">{{ t('profile.description') }}</p>
    </div>
    <dl
      class="grid max-w-md grid-cols-[max-content_1fr] gap-x-6 gap-y-2 rounded-lg border bg-card p-4 text-sm"
    >
      <dt class="text-muted-foreground">{{ t('profile.fields.id') }}</dt>
      <dd>{{ user.id }}</dd>
      <dt class="text-muted-foreground">{{ t('auth.fields.name') }}</dt>
      <dd>{{ user.name }}</dd>
      <dt class="text-muted-foreground">{{ t('auth.fields.email') }}</dt>
      <dd>{{ user.email ?? '—' }}</dd>
      <dt class="text-muted-foreground">{{ t('profile.fields.role') }}</dt>
      <dd>{{ user.role }}</dd>
    </dl>
  </section>
</template>
