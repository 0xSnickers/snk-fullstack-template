/**
 * 把异步函数包装成「同一时间只执行一次」的版本。
 * 并发调用会复用同一个进行中的 Promise，适合 Token 刷新、会话恢复等场景。
 */
export function singleFlight<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  let inFlight: Promise<TResult> | null = null;

  return (...args: TArgs) => {
    inFlight ??= fn(...args).finally(() => {
      inFlight = null;
    });

    return inFlight;
  };
}
