// 由 packages/core 同步生成，请勿直接修改。修改真源后运行 `npm run sync:core`。
import { isAxiosError } from 'axios';

export interface AppApiErrorOptions {
  code?: number | string;
  status?: number;
  details?: unknown;
  cause?: unknown;
}

/**
 * 应用内统一的接口错误类型。
 * 页面和组件只需要处理 AppApiError，不需要关心 Axios / fetch 的原始错误结构。
 */
export class AppApiError extends Error {
  code?: number | string;
  status?: number;
  details?: unknown;
  override cause?: unknown;

  constructor(message: string, options: AppApiErrorOptions = {}) {
    super(message);
    this.name = 'AppApiError';
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
    this.cause = options.cause;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNetworkError() {
    return (
      this.status === undefined && this.code !== undefined && String(this.code).startsWith('ERR_')
    );
  }
}

export function isAppApiError(error: unknown): error is AppApiError {
  return error instanceof AppApiError;
}

/** 把任意错误归一化为 AppApiError。 */
export function normalizeApiError(error: unknown): AppApiError {
  if (error instanceof AppApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as { code?: number | string; message?: string } | undefined;

    return new AppApiError(data?.message ?? error.message, {
      code: data?.code ?? error.code,
      status: error.response?.status,
      details: data,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new AppApiError(error.message, { cause: error });
  }

  return new AppApiError('Unknown API error', { details: error });
}

/** 从任意错误中提取可展示给用户的文案。 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
