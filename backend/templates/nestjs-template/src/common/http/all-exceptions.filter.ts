import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from './app.exception';
import { localize } from './messages';

type ErrorBody = { status: number; code: string; message: string; details?: unknown };

function toErrorBody(exception: unknown): ErrorBody | null {
  if (exception instanceof AppException) {
    const { status, code, message, details } = exception;
    return { status, code, message, details };
  }
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    // Nest's own 400s (e.g. malformed JSON body) map to the contract's VALIDATION_ERROR.
    const code = status === 400 ? 'VALIDATION_ERROR' : (HttpStatus[status] ?? 'HTTP_ERROR');
    return { status, code, message: exception.message };
  }
  return null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const body = toErrorBody(exception) ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };
    if (body.status >= 500) {
      this.logger.error(
        `[${req.headers['x-request-id']}] ${req.method} ${req.url}`,
        (exception as Error)?.stack,
      );
    }

    const { status, code, details } = body;
    const message = localize(code, req.headers['accept-language'], body.message);
    res
      .status(status)
      .json({ code, message, data: null, ...(details === undefined ? {} : { details }) });
  }
}
