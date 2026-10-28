import { z } from 'zod';
import { appEnvSchema, optionalStringEnv, parseEnv } from '@/core/config/envSchema';

/**
 * 环境变量唯一入口。Expo 只会内联「静态写出」的 process.env.EXPO_PUBLIC_XXX，不能动态访问。
 * EXPO_PUBLIC_ 变量会打进 App 包，不要放密钥。
 */
const envSchema = z.object({
  EXPO_PUBLIC_APP_NAME: z.string().default('React Native App'),
  EXPO_PUBLIC_APP_ENV: appEnvSchema,
  EXPO_PUBLIC_APP_RELEASE: optionalStringEnv(),
  EXPO_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:9000/api/v1'),
});

const parsed = parseEnv(envSchema, {
  EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_APP_RELEASE: process.env.EXPO_PUBLIC_APP_RELEASE,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
});

export const env = {
  appName: parsed.EXPO_PUBLIC_APP_NAME,
  appEnv: parsed.EXPO_PUBLIC_APP_ENV,
  appRelease: parsed.EXPO_PUBLIC_APP_RELEASE,
  isDev: __DEV__,
  apiBaseUrl: parsed.EXPO_PUBLIC_API_BASE_URL,
} as const;
