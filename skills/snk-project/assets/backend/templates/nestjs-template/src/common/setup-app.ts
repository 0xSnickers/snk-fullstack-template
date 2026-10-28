import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './http/all-exceptions.filter';
import { validationPipe } from './http/pipes';
import { TransformInterceptor } from './http/transform.interceptor';

/** Global app wiring shared by main.ts and e2e tests. */
export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  return app;
}
