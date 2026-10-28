<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PageContainer from '@/components/layout/PageContainer.vue';
import AppCard from '@/components/ui/AppCard.vue';
import { usePageTitle } from '@/composables/usePageTitle';
import { routes, useAuth, useRequireAuth } from '@/features/auth';

/** 需要登录的页面示例：useRequireAuth 在未登录时跳转登录页并带上 redirect。 */
useRequireAuth(routes.profile);
usePageTitle('profile.title');

const { t } = useI18n();
const { user } = useAuth();

const rows = computed(() =>
  user.value
    ? [
        [t('profile.fields.id'), user.value.id],
        [t('auth.fields.name'), user.value.name],
        [t('auth.fields.email'), user.value.email ?? '—'],
        [t('profile.fields.role'), user.value.role],
      ]
    : [],
);
</script>

<template>
  <PageContainer>
    <text class="muted">{{ t('profile.description') }}</text>
    <AppCard v-if="user">
      <view v-for="[label, value] in rows" :key="label" class="row">
        <text class="row__label">{{ label }}</text>
        <text class="row__value">{{ value }}</text>
      </view>
    </AppCard>
  </PageContainer>
</template>

<style scoped>
.muted {
  font-size: 14px;
  color: var(--muted-foreground);
}
.row {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 5px 0;
}
.row__label {
  width: 72px;
  font-size: 14px;
  color: var(--muted-foreground);
}
.row__value {
  flex: 1;
  font-size: 14px;
  color: var(--foreground);
  word-break: break-all;
}
</style>
