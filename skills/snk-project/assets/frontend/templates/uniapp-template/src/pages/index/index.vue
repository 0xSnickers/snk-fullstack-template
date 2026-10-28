<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import AppControls from '@/components/layout/AppControls.vue';
import PageContainer from '@/components/layout/PageContainer.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { usePageTitle } from '@/composables/usePageTitle';
import { env } from '@/config/env';
import { routes, useAuth } from '@/features/auth';
import { UserListPanel } from '@/features/users';

const { t } = useI18n();
const { user, isAuthenticated, signOut } = useAuth();
usePageTitle('nav.home');

const go = (url: string) => uni.navigateTo({ url });
</script>

<template>
  <PageContainer>
    <view class="hero">
      <text class="hero__title">{{ env.appName }}</text>
      <text class="muted">{{ t('home.ready', { framework: 'uni-app' }) }}</text>
    </view>

    <AppControls />

    <view v-if="isAuthenticated && user" class="actions">
      <text class="muted">{{ t('home.signedInAs', { name: user.name }) }}</text>
      <view class="row">
        <AppButton variant="secondary" @click="go(routes.profile)">{{
          t('nav.profile')
        }}</AppButton>
        <AppButton variant="outline" @click="signOut()">{{ t('home.logout') }}</AppButton>
      </view>
    </view>
    <view v-else class="actions">
      <view class="row">
        <AppButton @click="go(routes.login)">{{ t('home.login') }}</AppButton>
        <AppButton variant="outline" @click="go(routes.register)">{{
          t('home.register')
        }}</AppButton>
      </view>
      <text class="muted">{{ t('home.guestHint') }}</text>
    </view>

    <UserListPanel v-if="isAuthenticated" />
  </PageContainer>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hero__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--foreground);
}
.muted {
  font-size: 14px;
  color: var(--muted-foreground);
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
