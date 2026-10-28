import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  loginSchema,
  registerSchema,
  validate,
  type FieldErrors,
  type RegisterInput,
} from '@/core/auth/types';
import { getErrorMessage } from '@/core/http/apiError';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useAppTheme } from '@/theme/useAppTheme';
import { useLoginMutation, useRegisterMutation } from '../hooks/useAuth';
import { getSafeRedirect } from '../redirect';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const [values, setValues] = useState<RegisterInput>({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterInput>>({});

  const isRegister = mode === 'register';
  const mutation = isRegister ? registerMutation : loginMutation;
  const redirect = getSafeRedirect(params.redirect);

  const update = (field: keyof RegisterInput) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));
  const fieldError = (field: keyof RegisterInput) =>
    fieldErrors[field] ? t(fieldErrors[field]) : null;

  async function handleSubmit() {
    const result = isRegister
      ? validate(registerSchema, values)
      : validate(loginSchema, { email: values.email, password: values.password });

    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }

    setFieldErrors({});

    try {
      if (isRegister) {
        await registerMutation.mutateAsync(result.data as RegisterInput);
      } else {
        await loginMutation.mutateAsync(result.data);
      }
      router.replace(redirect as never);
    } catch {
      // 错误信息由 mutation.error 渲染
    }
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          {t(`auth.${mode}.title`)}
        </Text>
        <Text style={{ color: theme.colors.mutedForeground }}>{t(`auth.${mode}.description`)}</Text>
      </View>

      {isRegister ? (
        <TextField
          label={t('auth.fields.name')}
          value={values.name}
          onChangeText={update('name')}
          error={fieldError('name')}
          autoComplete="name"
        />
      ) : null}
      <TextField
        label={t('auth.fields.email')}
        value={values.email}
        onChangeText={update('email')}
        error={fieldError('email')}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextField
        label={t('auth.fields.password')}
        value={values.password}
        onChangeText={update('password')}
        error={fieldError('password')}
        autoCapitalize="none"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        secureTextEntry
      />

      {mutation.error ? (
        <Text
          accessibilityRole="alert"
          style={[
            styles.alert,
            { color: theme.colors.destructive, borderColor: theme.colors.destructive },
          ]}
        >
          {getErrorMessage(mutation.error, t('auth.unknownError'))}
        </Text>
      ) : null}

      <Button
        title={t(`auth.${mode}.submit`)}
        loading={mutation.isPending}
        onPress={() => void handleSubmit()}
      />

      <Text style={{ color: theme.colors.mutedForeground }}>
        {t(`auth.${mode}.alternateText`)}{' '}
        <Link
          replace
          href={{
            pathname: isRegister ? '/login' : '/register',
            params: redirect !== '/' ? { redirect } : {},
          }}
          style={{ color: theme.colors.primary, fontWeight: '600' }}
        >
          {t(`auth.${mode}.alternateAction`)}
        </Link>
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, width: '100%', maxWidth: 420, alignSelf: 'center' },
  header: { gap: 6 },
  title: { fontSize: 24, fontWeight: '700' },
  alert: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 14 },
});
