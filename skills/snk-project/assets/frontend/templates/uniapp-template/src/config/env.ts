import { z } from 'zod';
import { appEnvSchema, optionalStringEnv, parseEnv } from '@/core/config/envSchema';

/**
 * 环境变量唯一入口：业务代码只读取 `env`，不要直接访问 import.meta.env。
 * 新增变量时同步更新 .env.example 和 src/env.d.ts。
 * App / 小程序端没有同源代理，VITE_API_BASE_URL 必须是完整地址。
 */
const envSchema = z.object({
  VITE_APP_NAME: z.string().default('uni-app App'),
  VITE_APP_ENV: appEnvSchema,
  VITE_APP_RELEASE: optionalStringEnv(),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:9000/api/v1'),
});

const parsed = parseEnv(envSchema, import.meta.env);

export const env = {
  appName: parsed.VITE_APP_NAME,
  appEnv: parsed.VITE_APP_ENV,
  appRelease: parsed.VITE_APP_RELEASE,
  isDev: import.meta.env.DEV,
  apiBaseUrl: parsed.VITE_API_BASE_URL,
} as const;
