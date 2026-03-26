import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import * as path from "path";
import "reflect-metadata";

import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { AppLogger } from "./common/logger/app-logger.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>("PORT", 3000);
  const corsOrigin = config.get<string>("CORS_ORIGIN", "http://localhost:3001");
  const appLogger = app.get(AppLogger);

  app.use(cookieParser());
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useStaticAssets(path.join(process.cwd(), "public"));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor(appLogger));
  app.useGlobalFilters(new GlobalExceptionFilter(appLogger));
  await app.listen(port);
  Logger.log(`API running at http://localhost:${port}`, "Bootstrap");
}

void bootstrap();
