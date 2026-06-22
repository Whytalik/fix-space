import { pool, prisma } from "@fixspace/database";
import { jest } from "@jest/globals";
import { ClassSerializerInterceptor, type INestApplication } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import cookieParser from "cookie-parser";
import { I18nValidationExceptionFilter, I18nValidationPipe } from "nestjs-i18n";
import * as supertest from "supertest";
import { AppModule } from "../../src/app.module";
import { GlobalExceptionFilter } from "../../src/common/filters/global-exception.filter";
import { AppLogger } from "../../src/common/logger/app-logger.service";
import { MailService } from "../../src/core/mail/mail.service";
import type { InitializeUserSpaceUseCase } from "../../src/modules/space/providers/initialize-user-space.usecase";

export const INTEGRATION_EMAIL_MARKER = "integration-test";

export function uniqueEmail(marker = INTEGRATION_EMAIL_MARKER): string {
  return `${marker}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

export function uniqueUsername(): string {
  return `int${Date.now()}${Math.floor(Math.random() * 9999)}`;
}

export const mockMailService: Record<keyof MailService, jest.Mock> = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendPasswordChangeNotification: jest.fn(),
  onModuleInit: jest.fn(),
};

export const mockInitializeUserSpaceUseCase: Record<keyof InitializeUserSpaceUseCase, jest.Mock> = {
  initialize: jest.fn(),
  seedContent: jest.fn(),
  createAndSeed: jest.fn(),
};

const NOOP_APP = {
  close: async () => {},
  getHttpServer: () => null,
} as unknown as INestApplication;

export async function setupIntegrationApp(): Promise<{
  app: INestApplication;
  agent: ReturnType<typeof supertest.agent>;
  moduleRef?: unknown;
}> {
  const sharedUrl = process.env.INTEGRATION_SERVER_URL;
  if (sharedUrl) {
    return { app: NOOP_APP, agent: supertest.agent(sharedUrl) };
  }

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue(mockMailService)
    .compile();

  const app = moduleRef.createNestApplication();
  try {
    const throttlerGuard = app.get(ThrottlerGuard);
    if (throttlerGuard) {
      jest.spyOn(throttlerGuard, "canActivate").mockResolvedValue(true);
    }
    // eslint-disable-next-line no-empty
  } catch {}

  app.use(cookieParser());
  app.useGlobalPipes(new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const appLogger = app.get(AppLogger);
  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: true }), new GlobalExceptionFilter(appLogger));
  app.enableShutdownHooks();

  await app.init();
  const agent = supertest.agent(app.getHttpServer() as Parameters<typeof supertest.agent>[0]);

  return { app, agent, moduleRef };
}

export async function cleanupIntegrationApp(app?: INestApplication, marker = INTEGRATION_EMAIL_MARKER) {
  try {
    await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  } catch {
    // ignore
  }

  if (process.env.INTEGRATION_SERVER_URL) {
    return;
  }

  if (app) {
    await app.close();
  }
  await prisma.$disconnect();
  if (pool) {
    await pool.end();
  }
}

export function getServer(app: INestApplication): string | ReturnType<INestApplication["getHttpServer"]> {
  return process.env.INTEGRATION_SERVER_URL ?? app.getHttpServer();
}
export async function getSharedMailCalls(method?: string): Promise<Array<{ method: string; args: unknown[] }>> {
  const url = process.env.INTEGRATION_SERVER_URL;
  if (!url) {
    const allCalls: Array<{ method: string; args: unknown[] }> = [];
    for (const [key, mock] of Object.entries(mockMailService)) {
      if (!method || key === method) {
        for (const callArgs of (mock as jest.Mock).mock.calls) {
          allCalls.push({ method: key, args: callArgs as unknown[] });
        }
      }
    }
    return allCalls;
  }

  const res = await supertest.default(url).get("/_test/mail");
  const calls = res.body as Array<{ method: string; args: unknown[] }>;
  return method ? calls.filter((c) => c.method === method) : calls;
}

export async function clearSharedMailCalls(): Promise<void> {
  const url = process.env.INTEGRATION_SERVER_URL;
  if (!url) {
    jest.clearAllMocks();
    return;
  }
  await supertest.default(url).delete("/_test/mail");
}
