<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Loader2, RefreshCw, ShieldCheck } from '@lucide/vue';
import { getErrorMessage } from '@/core/http/apiError';
import Button from '@/components/ui/Button.vue';
import { useUsers } from '../composables/useUsers';

const { t } = useI18n();
const { data, error, isError, isFetching, refetch } = useUsers({ page: 1, limit: 5 });
</script>

<template>
  <section class="space-y-3 rounded-lg border bg-card p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <h2 class="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck class="size-4 text-primary" />
          {{ t('users.title') }}
        </h2>
        <p class="text-sm text-muted-foreground">{{ t('users.description') }}</p>
      </div>
      <Button variant="outline" size="sm" :disabled="isFetching" @click="refetch()">
        <Loader2 v-if="isFetching" class="animate-spin" />
        <RefreshCw v-else />
        {{ t('common.refresh') }}
      </Button>
    </div>

    <p
      v-if="isError"
      role="alert"
      class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {{ getErrorMessage(error, t('users.loadFailed')) }}
    </p>

    <div v-if="data" class="space-y-3">
      <p class="text-sm text-muted-foreground">
        {{ t('users.summary', { count: data.items.length, total: data.pagination.total }) }}
      </p>
      <p v-if="data.items.length === 0" class="text-sm text-muted-foreground">
        {{ t('common.empty') }}
      </p>
      <ul v-else class="divide-y rounded-md border">
        <li
          v-for="user in data.items"
          :key="user.id"
          class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
        >
          <span class="font-medium">{{ user.name }}</span>
          <span class="text-muted-foreground">{{ user.email ?? '—' }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
