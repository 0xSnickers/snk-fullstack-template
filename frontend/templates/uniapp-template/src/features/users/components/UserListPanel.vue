<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getErrorMessage } from '@/core/http/apiError';
import AppButton from '@/components/ui/AppButton.vue';
import AppCard from '@/components/ui/AppCard.vue';
import { useUsers } from '../composables/useUsers';

const { t } = useI18n();
const { data, error, isError, isFetching, refetch } = useUsers({ page: 1, limit: 5 });
</script>

<template>
  <AppCard class="users">
    <view class="users__header">
      <view class="users__heading">
        <text class="users__title">{{ t('users.title') }}</text>
        <text class="users__muted">{{ t('users.description') }}</text>
      </view>
      <AppButton variant="outline" size="sm" :loading="isFetching" @click="refetch()">
        {{ t('common.refresh') }}
      </AppButton>
    </view>

    <text v-if="isError" class="users__error" role="alert">
      {{ getErrorMessage(error, t('users.loadFailed')) }}
    </text>

    <view v-if="data" class="users__list">
      <text class="users__muted">
        {{ t('users.summary', { count: data.items.length, total: data.pagination.total }) }}
      </text>
      <text v-if="data.items.length === 0" class="users__muted">{{ t('common.empty') }}</text>
      <view v-for="user in data.items" v-else :key="user.id" class="users__row">
        <text class="users__name">{{ user.name }}</text>
        <text class="users__muted">{{ user.email ?? '—' }}</text>
      </view>
    </view>
  </AppCard>
</template>

<style scoped>
.users {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.users__header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.users__heading {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.users__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
}
.users__muted {
  font-size: 14px;
  color: var(--muted-foreground);
}
.users__error {
  font-size: 14px;
  color: var(--destructive);
}
.users__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.users__row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.users__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--foreground);
}
</style>
