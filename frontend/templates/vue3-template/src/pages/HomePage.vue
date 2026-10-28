<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { LogIn, LogOut, UserPlus } from '@lucide/vue';
import { RouterLink } from 'vue-router';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth';
import { UserListPanel } from '@/features/users';

const { t } = useI18n();
const { user, isAuthenticated, signOut } = useAuth();
</script>

<template>
  <section class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">{{ env.appName }}</h1>
      <p class="mt-2 text-sm text-muted-foreground">{{ t('home.ready', { framework: 'Vue' }) }}</p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <template v-if="isAuthenticated && user">
        <span class="text-sm text-muted-foreground">
          {{ t('home.signedInAs', { name: user.name }) }}
        </span>
        <Button variant="outline" @click="signOut()">
          <LogOut />
          {{ t('home.logout') }}
        </Button>
      </template>
      <template v-else>
        <Button :as="RouterLink" to="/login">
          <LogIn />
          {{ t('home.login') }}
        </Button>
        <Button :as="RouterLink" to="/register" variant="outline">
          <UserPlus />
          {{ t('home.register') }}
        </Button>
        <span class="text-sm text-muted-foreground">{{ t('home.guestHint') }}</span>
      </template>
    </div>

    <UserListPanel v-if="isAuthenticated" />

    <Dialog :title="t('home.dialog.title')" :description="t('home.dialog.description')">
      <template #trigger>
        <Button variant="secondary">{{ t('home.dialog.open') }}</Button>
      </template>
      <template #footer="{ close }">
        <Button @click="close">{{ t('home.dialog.action') }}</Button>
      </template>
    </Dialog>
  </section>
</template>
