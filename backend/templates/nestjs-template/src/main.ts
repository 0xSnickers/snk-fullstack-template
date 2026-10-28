import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { FileLogger } from './common/file-logger';
import { setupApp } from './common/setup-app';
import type { Env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<Env, true>);
  app.useLogger(
    new FileLogger(
      config.get('LOG_LEVEL', { infer: true }),
      config.get('LOG_FILE', { infer: true }),
    ),
  );

  app.use(helmet());
  app.enableCors({ origin: config.get('CORS_ORIGINS', { infer: true }), credentials: true });
  app.enableShutdownHooks();
  setupApp(app);

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`HTTP server listening on :${port}`, 'Bootstrap');
}

void bootstrap();
