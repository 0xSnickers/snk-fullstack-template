export type Env = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGINS: string[];
  JWT_SECRET: string;
  ACCESS_TOKEN_TTL: number;
  REFRESH_TOKEN_TTL: number;
  COOKIE_SECURE: boolean;
  SEED_DEMO_USER: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_FILE: string;
};

const NODE_ENVS = ['development', 'test', 'production'] as const;
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

function int(raw: Record<string, unknown>, key: string, fallback: number) {
  const value = Number(raw[key] ?? fallback);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${key} must be a positive integer`);
  return value;
}

function oneOf<T extends string>(
  raw: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  fallback: T,
) {
  const value = String(raw[key] ?? fallback) as T;
  if (!allowed.includes(value)) throw new Error(`${key} must be one of ${allowed.join(', ')}`);
  return value;
}

const bool = (raw: Record<string, unknown>, key: string) => String(raw[key] ?? 'false') === 'true';

/** Validates process.env once at startup (ConfigModule.validate); fails fast on bad config. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const env: Env = {
    NODE_ENV: oneOf(raw, 'NODE_ENV', NODE_ENVS, 'development'),
    PORT: int(raw, 'PORT', 9000),
    DATABASE_URL: String(raw.DATABASE_URL ?? ''),
    CORS_ORIGINS: String(raw.CORS_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    JWT_SECRET: String(raw.JWT_SECRET ?? ''),
    ACCESS_TOKEN_TTL: int(raw, 'ACCESS_TOKEN_TTL', 900),
    REFRESH_TOKEN_TTL: int(raw, 'REFRESH_TOKEN_TTL', 604800),
    COOKIE_SECURE: bool(raw, 'COOKIE_SECURE'),
    SEED_DEMO_USER: bool(raw, 'SEED_DEMO_USER'),
    LOG_LEVEL: oneOf(raw, 'LOG_LEVEL', LOG_LEVELS, 'info'),
    LOG_FILE: String(raw.LOG_FILE ?? 'logs/app.log'),
  };
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  if (env.NODE_ENV === 'production' && env.SEED_DEMO_USER) {
    throw new Error('SEED_DEMO_USER must be false in production');
  }
  return env;
}
