import 'server-only';
import { z } from 'zod';
import { parseEnv } from '@/core/config/envSchema';

/** 仅服务端可见的配置，禁止在客户端组件中引入（server-only 会在构建期报错）。 */
const serverEnvSchema = z.object({
  API_BASE_URL: z.string().url().default('http://localhost:9000/api/v1'),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
});

const parsed = parseEnv(serverEnvSchema, {
  API_BASE_URL: process.env.API_BASE_URL,
  API_TIMEOUT_MS: process.env.API_TIMEOUT_MS,
});

export const serverEnv = {
  backendApiBaseUrl: parsed.API_BASE_URL.replace(/\/$/, ''),
  backendTimeoutMs: parsed.API_TIMEOUT_MS,
} as const;
