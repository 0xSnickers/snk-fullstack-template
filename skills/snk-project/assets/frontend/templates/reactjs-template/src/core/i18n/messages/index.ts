// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
import type { AppLocale } from '../locales';
import { enUS } from './en-US';
import { zhCN, type Messages } from './zh-CN';

export type { Messages };

export const baseMessages: Record<AppLocale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** 深合并语言包：模板或业务模块的文案覆盖/扩展基础语言包。 */
export function mergeMessages<TBase extends PlainObject, TExtra extends PlainObject>(
  base: TBase,
  extra: TExtra,
): TBase & TExtra {
  const result: PlainObject = { ...base };

  for (const [key, value] of Object.entries(extra)) {
    const current = result[key];
    result[key] =
      isPlainObject(current) && isPlainObject(value) ? mergeMessages(current, value) : value;
  }

  return result as TBase & TExtra;
}
