// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合并 Tailwind class，后者覆盖前者冲突的工具类。 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
