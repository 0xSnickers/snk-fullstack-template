import type { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ code: 0, message: 'success', data });
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return res
    .status(status)
    .json({ code, message, data: null, ...(details === undefined ? {} : { details }) });
}

export type PageQuery = { page: number; limit: number };

export function pageResult<T>(items: T[], total: number, { page, limit }: PageQuery) {
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
