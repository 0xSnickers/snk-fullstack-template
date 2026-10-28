<script setup lang="ts">
import PageContainer from '@/components/layout/PageContainer.vue';
import { usePageTitle } from '@/composables/usePageTitle';
import { AuthForm, useGuestOnly } from '@/features/auth';

useGuestOnly();
usePageTitle('auth.login.title');
</script>

<template>
  <PageContainer>
    <AuthForm mode="login" />
  </PageContainer>
</template>
