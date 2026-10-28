<script setup lang="ts">
import PageContainer from '@/components/layout/PageContainer.vue';
import { usePageTitle } from '@/composables/usePageTitle';
import { AuthForm, useGuestOnly } from '@/features/auth';

useGuestOnly();
usePageTitle('auth.register.title');
</script>

<template>
  <PageContainer>
    <AuthForm mode="register" />
  </PageContainer>
</template>
