import { ClassSerializerInterceptor, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import * as path from "path";
import "reflect-metadata";

import { AppModule } from "./app.module";
import { AuthModule } from "./auth/auth.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { I18nValidationExceptionFilter, I18nValidationPipe } from "nestjs-i18n";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { AppLogger } from "./common/logger/app-logger.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>("PORT", 3000);
  const corsOrigin = config.get<string>("CORS_ORIGIN", "http://localhost:3001");
  const corsOrigins = corsOrigin.includes(",") ? corsOrigin.split(",").map((o) => o.trim()) : corsOrigin;
  const appLogger = app.get(AppLogger);

  const swaggerConfig = new DocumentBuilder()
    .setTitle("FIX Space API")
    .setDescription("REST API documentation")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", in: "header" }, "access-token")
    .addCookieAuth("access_token")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, { include: [AuthModule] });
  SwaggerModule.setup("api/docs", app, document);

  app.use(cookieParser());
  app.use((req: any, res: any, next: any) => {
    const [pathPart, queryPart] = req.url.split("?");
    const sanitizedPath = pathPart.replace(/\/{2,}/g, "/");
    req.url = queryPart ? `${sanitizedPath}?${queryPart}` : sanitizedPath;
    next();
  });
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.useStaticAssets(path.join(process.cwd(), "public"));
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)), new LoggingInterceptor(appLogger));
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
    new GlobalExceptionFilter(appLogger),
  );
  await app.listen(port);
  Logger.log(`API running at http://localhost:${port}`, "Bootstrap");
  Logger.log(`Swagger docs at http://localhost:${port}/api/docs`, "Bootstrap");
}

void bootstrap();
