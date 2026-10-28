/** Business error with a stable machine-readable code (see docs/API_CONTRACT.md). */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly details?: unknown,
  ) {
    super(message);
  }

  static validation(details: unknown) {
    return new AppError('VALIDATION_ERROR', 'Invalid request parameters', 400, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Permission denied') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(code: string, message: string) {
    return new AppError(code, message, 404);
  }

  static conflict(code: string, message: string) {
    return new AppError(code, message, 409);
  }
}
