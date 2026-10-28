import { z } from 'zod';
import { appEnvSchema, parseEnv } from '@/core/config/envSchema';

/**
 * 浏览器和服务端都可以读取的公开配置（NEXT_PUBLIC_ 前缀）。
 * 注意：Next.js 只会内联「静态写出」的 process.env.NEXT_PUBLIC_XXX，不能动态访问。
 * 仅服务端使用的配置放在 env.server.ts。
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('Next.js App'),
  NEXT_PUBLIC_APP_ENV: appEnvSchema,
});

const parsed = parseEnv(publicEnvSchema, {
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});

export const env = {
  appName: parsed.NEXT_PUBLIC_APP_NAME,
  appEnv: parsed.NEXT_PUBLIC_APP_ENV,
  isDev: process.env.NODE_ENV === 'development',
  /** 浏览器侧请求前缀：同源 BFF。 */
  apiBaseUrl: '/api',
} as const;
