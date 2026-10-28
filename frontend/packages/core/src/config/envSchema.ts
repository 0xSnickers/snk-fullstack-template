import { z } from 'zod';

/** 字符串 'true' / 'false' / '1' / '0' 转布尔值，适配 .env 中的开关。 */
export const booleanEnv = (defaultValue = false) =>
  z
    .preprocess((value) => {
      if (typeof value !== 'string') return value;
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
      return value;
    }, z.boolean())
    .default(defaultValue);

/** 0~1 之间的采样率。 */
export const sampleRateEnv = (defaultValue = 0) =>
  z.coerce.number().min(0).max(1).default(defaultValue);

/** 空字符串视为未配置。 */
export const optionalStringEnv = () =>
  z.preprocess((value) => (value === '' ? undefined : value), z.string().optional());

/** 运行环境标识。 */
export const appEnvSchema = z
  .enum(['development', 'test', 'staging', 'production'])
  .default('development');

/**
 * 解析环境变量；失败时给出可读的错误信息，而不是一长串 zod issue。
 */
export function parseEnv<TSchema extends z.ZodType>(
  schema: TSchema,
  source: Record<string, unknown>,
): z.infer<TSchema> {
  const result = schema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`环境变量校验失败，请检查 .env 配置：\n${details}`);
  }

  return result.data;
}
