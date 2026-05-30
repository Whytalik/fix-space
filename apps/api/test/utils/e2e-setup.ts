import { prisma, pool } from "@fixspace/database";
import { jest } from "@jest/globals";
import { ClassSerializerInterceptor, type INestApplication } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { ThrottlerGuard, ThrottlerStorageService } from "@nestjs/throttler";
import cookieParser from "cookie-parser";
import { I18nValidationExceptionFilter, I18nValidationPipe } from "nestjs-i18n";
import * as supertest from "supertest";
import { AppModule } from "../../src/app.module";
import { GlobalExceptionFilter } from "../../src/common/filters/global-exception.filter";
import { AppLogger } from "../../src/common/logger/app-logger.service";
import { MailService } from "../../src/core/mail/mail.service";
import { InitializeUserSpaceUseCase } from "../../src/modules/space/providers/initialize-user-space.usecase";

export const E2E_EMAIL_MARKER = "e2e-test";

export function uniqueEmail(marker = E2E_EMAIL_MARKER): string {
  return `${marker}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

export function uniqueUsername(): string {
  return `e2e${Date.now()}${Math.floor(Math.random() * 9999)}`;
}

export const mockMailService = {
  sendVerificationEmail: jest.fn<any>(),
  sendPasswordResetEmail: jest.fn<any>(),
  sendPasswordChangeNotification: jest.fn<any>(),
};

export const mockInitializeUserSpaceUseCase = {
  initialize: jest.fn<() => Promise<void>>(),
};

export async function setupE2eApp() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue(mockMailService)
    .overrideProvider(InitializeUserSpaceUseCase)
    .useValue(mockInitializeUserSpaceUseCase)
    .compile();

  const app = moduleRef.createNestApplication();

  // Disable ThrottlerGuard for E2E tests
  try {
    const throttlerGuard = app.get(ThrottlerGuard);
    if (throttlerGuard) {
      jest.spyOn(throttlerGuard, "canActivate").mockResolvedValue(true);
    }
  } catch (e) {
    // ThrottlerGuard might not be available as a direct provider
  }

  app.use(cookieParser());
  app.useGlobalPipes(new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const appLogger = app.get(AppLogger);
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: true }),
    new GlobalExceptionFilter(appLogger),
  );

  await app.init();
  const agent = supertest.agent(app.getHttpServer() as Parameters<typeof supertest.agent>[0]);

  return { app, agent, moduleRef };
}

export async function cleanupE2eApp(app: INestApplication, marker = E2E_EMAIL_MARKER) {
  try {
    await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  } catch (e) {
    // Ignore errors during cleanup if user doesn't exist
  } finally {
    await app.close();
    await prisma.$disconnect();
    if (pool) {
      await pool.end();
    }
  }
}
