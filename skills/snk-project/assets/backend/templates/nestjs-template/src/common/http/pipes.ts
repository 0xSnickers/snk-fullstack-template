import { ParseUUIDPipe, ValidationError, ValidationPipe } from '@nestjs/common';
import { AppException } from './app.exception';

const flatten = (errors: ValidationError[]) =>
  Object.fromEntries(errors.map((e) => [e.property, Object.values(e.constraints ?? {})]));

/** Global DTO validation; failures become VALIDATION_ERROR with per-field details. */
export const validationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) => AppException.validation(flatten(errors)),
});

/** `@Param('id', UuidPipe)` */
export const UuidPipe = new ParseUUIDPipe({
  exceptionFactory: () => AppException.validation({ id: ['must be a valid UUID'] }),
});
