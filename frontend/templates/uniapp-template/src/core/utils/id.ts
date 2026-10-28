// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
/** 生成请求 ID，用于前后端日志串联。 */
export function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
