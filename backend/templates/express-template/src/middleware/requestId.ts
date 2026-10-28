import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger.js';

/** Propagates / generates X-Request-ID and writes one log line per request. */
export function requestId(req: Request, res: Response, next: NextFunction) {
  req.requestId = req.header('x-request-id') ?? randomUUID();
  res.setHeader('X-Request-ID', req.requestId);

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    logger.info(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - start) / 1e6,
      },
      'request completed',
    );
  });
  next();
}
