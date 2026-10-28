import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';
import { AppError } from '../utils/errors.js';
import { localize } from '../utils/messages.js';
import { fail } from '../utils/response.js';

function sendError(req: Request, res: Response, err: AppError) {
  const message = localize(err.code, req.header('accept-language'), err.message);
  return fail(res, err.status, err.code, message, err.details);
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(
    req,
    res,
    AppError.notFound('NOT_FOUND', `Route ${req.method} ${req.path} not found`),
  );
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  void _next;

  if (err instanceof AppError) return sendError(req, res, err);
  if (err instanceof ZodError) {
    return sendError(req, res, AppError.validation(err.flatten().fieldErrors));
  }
  // express.json() parse failure
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(req, res, AppError.validation({ body: ['invalid JSON'] }));
  }

  logger.error({ err, requestId: req.requestId }, 'unhandled error');
  return sendError(req, res, new AppError('INTERNAL_ERROR', 'Internal server error', 500));
}
