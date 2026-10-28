<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Loader2, LogIn, UserPlus } from '@lucide/vue';
import {
  loginSchema,
  registerSchema,
  validate,
  type FieldErrors,
  type RegisterInput,
} from '@/core/auth/types';
import { getErrorMessage } from '@/core/http/apiError';
import Button from '@/components/ui/Button.vue';
import FormField from '@/components/ui/FormField.vue';
import Input from '@/components/ui/Input.vue';
import { useLoginMutation, useRegisterMutation } from '../composables/useAuth';
import { getSafeRedirect } from '../redirect';

const props = defineProps<{ mode: 'login' | 'register' }>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const loginMutation = useLoginMutation();
const registerMutation = useRegisterMutation();
const values = reactive<RegisterInput>({ name: '', email: '', password: '' });
const fieldErrors = ref<FieldErrors<RegisterInput>>({});

const isRegister = computed(() => props.mode === 'register');
const mutation = computed(() => (isRegister.value ? registerMutation : loginMutation));
const redirect = computed(() =>
  getSafeRedirect(typeof route.query.redirect === 'string' ? route.query.redirect : null),
);
const alternateRoute = computed(() => ({
  path: isRegister.value ? '/login' : '/register',
  query: redirect.value !== '/' ? { redirect: redirect.value } : {},
}));

function fieldError(field: keyof RegisterInput) {
  const key = fieldErrors.value[field];
  return key ? t(key) : null;
}

async function handleSubmit() {
  const result = isRegister.value
    ? validate(registerSchema, values)
    : validate(loginSchema, { email: values.email, password: values.password });

  if (!result.success) {
    fieldErrors.value = result.errors;
    return;
  }

  fieldErrors.value = {};

  try {
    if (isRegister.value) {
      await registerMutation.mutateAsync(result.data as RegisterInput);
    } else {
      await loginMutation.mutateAsync(result.data);
    }
    await router.replace(redirect.value);
  } catch {
    // 错误信息由 mutation.error 渲染
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold">{{ t(`auth.${mode}.title`) }}</h1>
      <p class="text-sm text-muted-foreground">{{ t(`auth.${mode}.description`) }}</p>
    </div>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <FormField
        v-if="isRegister"
        v-slot="field"
        :label="t('auth.fields.name')"
        :error="fieldError('name')"
      >
        <Input v-model="values.name" v-bind="field" autocomplete="name" />
      </FormField>

      <FormField v-slot="field" :label="t('auth.fields.email')" :error="fieldError('email')">
        <Input v-model="values.email" v-bind="field" type="email" autocomplete="email" />
      </FormField>

      <FormField v-slot="field" :label="t('auth.fields.password')" :error="fieldError('password')">
        <Input
          v-model="values.password"
          v-bind="field"
          type="password"
          :autocomplete="isRegister ? 'new-password' : 'current-password'"
        />
      </FormField>

      <p
        v-if="mutation.error.value"
        role="alert"
        class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ getErrorMessage(mutation.error.value, t('auth.unknownError')) }}
      </p>

      <Button class="w-full" type="submit" :disabled="mutation.isPending.value">
        <Loader2 v-if="mutation.isPending.value" class="animate-spin" />
        <UserPlus v-else-if="isRegister" />
        <LogIn v-else />
        {{ t(`auth.${mode}.submit`) }}
      </Button>
    </form>

    <p class="text-sm text-muted-foreground">
      {{ t(`auth.${mode}.alternateText`) }}
      <RouterLink
        class="font-medium text-primary underline-offset-4 hover:underline"
        :to="alternateRoute"
      >
        {{ t(`auth.${mode}.alternateAction`) }}
      </RouterLink>
    </p>
  </section>
</template>
