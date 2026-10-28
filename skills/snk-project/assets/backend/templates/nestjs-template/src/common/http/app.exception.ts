import { HttpStatus } from '@nestjs/common';

/** Business error with a stable machine-readable code (see docs/API_CONTRACT.md). */
export class AppException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = HttpStatus.BAD_REQUEST,
    public readonly details?: unknown,
  ) {
    super(message);
  }

  static validation(details: Record<string, string[]>) {
    return new AppException('VALIDATION_ERROR', 'Invalid request parameters', 400, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppException('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = 'Permission denied') {
    return new AppException('FORBIDDEN', message, HttpStatus.FORBIDDEN);
  }

  static notFound(code: string, message: string) {
    return new AppException(code, message, HttpStatus.NOT_FOUND);
  }

  static conflict(code: string, message: string) {
    return new AppException(code, message, HttpStatus.CONFLICT);
  }
}
