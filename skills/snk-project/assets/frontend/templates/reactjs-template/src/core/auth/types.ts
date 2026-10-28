// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
import { z } from 'zod';

/** 当前登录用户。字段按后端实际返回调整。 */
export interface User {
  id: string;
  email: string | null;
  name: string;
  role: string;
}

/** 登录 / 注册 / 刷新接口返回的会话。 */
export interface AuthSession {
  user: User;
  accessToken: string;
}

/**
 * 表单校验规则。message 存放语言包 key，由各框架的 i18n 翻译后展示。
 */
export const loginSchema = z.object({
  email: z.string().trim().email('auth.validation.email'),
  password: z.string().min(8, 'auth.validation.passwordLength'),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, 'auth.validation.nameLength')
    .max(50, 'auth.validation.nameLength'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/** 校验结果：字段 -> 语言包 key。 */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validate<TSchema extends z.ZodType<Record<string, unknown>>>(
  schema: TSchema,
  values: unknown,
):
  | { success: true; data: z.infer<TSchema> }
  | { success: false; errors: FieldErrors<z.infer<TSchema>> } {
  const result = schema.safeParse(values);
  if (result.success) return { success: true, data: result.data };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '');
    errors[key] ??= issue.message;
  }
  return { success: false, errors: errors as FieldErrors<z.infer<TSchema>> };
}
