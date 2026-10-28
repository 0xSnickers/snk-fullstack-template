import { z } from 'zod';
import {
  appEnvSchema,
  booleanEnv,
  optionalStringEnv,
  parseEnv,
  sampleRateEnv,
} from '@/core/config/envSchema';

/**
 * 环境变量唯一入口：业务代码只读取 `env`，不要直接访问 import.meta.env。
 * 新增变量时同步更新 .env.example 和 src/vite-env.d.ts。
 */
const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Vue App'),
  VITE_APP_ENV: appEnvSchema,
  VITE_APP_RELEASE: optionalStringEnv(),
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_TELEMETRY_ENABLED: booleanEnv(false),
  VITE_SENTRY_DSN: optionalStringEnv(),
  VITE_SENTRY_TRACES_SAMPLE_RATE: sampleRateEnv(0),
  VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: sampleRateEnv(0),
  VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: sampleRateEnv(1),
  VITE_POSTHOG_KEY: optionalStringEnv(),
  VITE_POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),
});

const parsed = parseEnv(envSchema, import.meta.env);

export const env = {
  appName: parsed.VITE_APP_NAME,
  appEnv: parsed.VITE_APP_ENV,
  appRelease: parsed.VITE_APP_RELEASE,
  isDev: import.meta.env.DEV,
  apiBaseUrl: parsed.VITE_API_BASE_URL,
  telemetry: {
    enabled: parsed.VITE_TELEMETRY_ENABLED,
    sentry: {
      dsn: parsed.VITE_SENTRY_DSN,
      tracesSampleRate: parsed.VITE_SENTRY_TRACES_SAMPLE_RATE,
      replaysSessionSampleRate: parsed.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      replaysOnErrorSampleRate: parsed.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    },
    posthog: {
      key: parsed.VITE_POSTHOG_KEY,
      host: parsed.VITE_POSTHOG_HOST,
    },
  },
} as const;
