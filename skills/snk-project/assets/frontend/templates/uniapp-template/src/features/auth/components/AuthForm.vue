<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useI18n } from 'vue-i18n';
import {
  loginSchema,
  registerSchema,
  validate,
  type FieldErrors,
  type RegisterInput,
} from '@/core/auth/types';
import { getErrorMessage } from '@/core/http/apiError';
import AppButton from '@/components/ui/AppButton.vue';
import AppCard from '@/components/ui/AppCard.vue';
import AppField from '@/components/ui/AppField.vue';
import { useLoginMutation, useRegisterMutation } from '../composables/useAuth';
import { getSafeRedirect, routes, withRedirect } from '../routes';

const props = defineProps<{ mode: 'login' | 'register' }>();

const { t } = useI18n();
const loginMutation = useLoginMutation();
const registerMutation = useRegisterMutation();
const values = reactive<RegisterInput>({ name: '', email: '', password: '' });
const fieldErrors = ref<FieldErrors<RegisterInput>>({});
const redirect = ref<string>(routes.home);

onLoad((query) => {
  redirect.value = getSafeRedirect(query?.redirect);
});

const isRegister = computed(() => props.mode === 'register');
const mutation = computed(() => (isRegister.value ? registerMutation : loginMutation));
const errorMessage = computed(() =>
  mutation.value.error.value
    ? getErrorMessage(mutation.value.error.value, t('auth.unknownError'))
    : '',
);

function fieldError(field: keyof RegisterInput) {
  const key = fieldErrors.value[field];
  return key ? t(key) : '';
}

function switchMode() {
  const target = isRegister.value ? routes.login : routes.register;
  uni.redirectTo({
    url: withRedirect(target, redirect.value !== routes.home ? redirect.value : undefined),
  });
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
    uni.redirectTo({ url: redirect.value });
  } catch {
    // 错误信息由 errorMessage 渲染
  }
}
</script>

<template>
  <AppCard class="auth-form">
    <view class="auth-form__header">
      <text class="auth-form__title">{{ t(`auth.${mode}.title`) }}</text>
      <text class="auth-form__description">{{ t(`auth.${mode}.description`) }}</text>
    </view>

    <AppField
      v-if="isRegister"
      v-model="values.name"
      :label="t('auth.fields.name')"
      :error="fieldError('name')"
    />
    <AppField
      v-model="values.email"
      type="text"
      input-mode="email"
      :label="t('auth.fields.email')"
      :error="fieldError('email')"
    />
    <AppField
      v-model="values.password"
      password
      :label="t('auth.fields.password')"
      :error="fieldError('password')"
    />

    <text v-if="errorMessage" class="auth-form__alert" role="alert">{{ errorMessage }}</text>

    <AppButton block :loading="mutation.isPending.value" @click="handleSubmit">
      {{ t(`auth.${mode}.submit`) }}
    </AppButton>

    <view class="auth-form__footer">
      <text class="auth-form__muted">{{ t(`auth.${mode}.alternateText`) }}</text>
      <text class="auth-form__link" @click="switchMode">{{
        t(`auth.${mode}.alternateAction`)
      }}</text>
    </view>
  </AppCard>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.auth-form__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.auth-form__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--foreground);
}
.auth-form__description,
.auth-form__muted {
  font-size: 14px;
  color: var(--muted-foreground);
}
.auth-form__alert {
  padding: 8px 12px;
  border: 1px solid var(--destructive);
  border-radius: 6px;
  font-size: 14px;
  color: var(--destructive);
}
.auth-form__footer {
  display: flex;
  flex-direction: row;
  gap: 4px;
}
.auth-form__link {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}
</style>
