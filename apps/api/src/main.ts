import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('PORT', 3000);
  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3001');

  app.enableCors({ origin: corsOrigin });
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(port);
  Logger.log(`API running at http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
