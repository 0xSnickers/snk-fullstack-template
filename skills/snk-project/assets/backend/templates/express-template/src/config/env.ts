import 'dotenv/config';
import { z } from 'zod';

const bool = z.enum(['true', 'false']).transform((v) => v === 'true');
const list = z.string().transform((v) =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(9000),
    DATABASE_URL: z.string().min(1),
    CORS_ORIGINS: list.default(''),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900),
    REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(604800),
    COOKIE_SECURE: bool.default('false'),
    SEED_DEMO_USER: bool.default('false'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
    LOG_FILE: z.string().default('logs/app.log'),
  })
  .refine((e) => e.NODE_ENV !== 'production' || !e.SEED_DEMO_USER, {
    message: 'SEED_DEMO_USER must be false in production',
  });

export const env = envSchema.parse(process.env);
export type Env = typeof env;
