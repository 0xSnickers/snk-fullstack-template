import { useState, type FormEvent } from 'react';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  loginSchema,
  registerSchema,
  validate,
  type FieldErrors,
  type RegisterInput,
} from '@/core/auth/types';
import { getErrorMessage } from '@/core/http/apiError';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useLoginMutation, useRegisterMutation } from '../hooks/useAuth';
import { getSafeRedirect } from '../redirect';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const [values, setValues] = useState<RegisterInput>({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterInput>>({});

  const isRegister = mode === 'register';
  const mutation = isRegister ? registerMutation : loginMutation;
  const Icon = isRegister ? UserPlus : LogIn;
  const redirect = getSafeRedirect(searchParams.get('redirect'));
  const alternateHref = `${isRegister ? '/login' : '/register'}${
    redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''
  }`;

  const update = (field: keyof RegisterInput) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      navigate(redirect, { replace: true });
    } catch {
      // 错误信息由 mutation.error 渲染
    }
  }

  const fieldError = (field: keyof RegisterInput) =>
    fieldErrors[field] ? t(fieldErrors[field]) : null;

  return (
    <section className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t(`auth.${mode}.title`)}</h1>
        <p className="text-sm text-muted-foreground">{t(`auth.${mode}.description`)}</p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        {isRegister ? (
          <FormField label={t('auth.fields.name')} error={fieldError('name')}>
            <Input value={values.name} autoComplete="name" onChange={update('name')} />
          </FormField>
        ) : null}

        <FormField label={t('auth.fields.email')} error={fieldError('email')}>
          <Input
            value={values.email}
            type="email"
            autoComplete="email"
            onChange={update('email')}
          />
        </FormField>

        <FormField label={t('auth.fields.password')} error={fieldError('password')}>
          <Input
            value={values.password}
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            onChange={update('password')}
          />
        </FormField>

        {mutation.error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {getErrorMessage(mutation.error, t('auth.unknownError'))}
          </p>
        ) : null}

        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Icon />}
          {t(`auth.${mode}.submit`)}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {t(`auth.${mode}.alternateText`)}{' '}
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          to={alternateHref}
        >
          {t(`auth.${mode}.alternateAction`)}
        </Link>
      </p>
    </section>
  );
}
