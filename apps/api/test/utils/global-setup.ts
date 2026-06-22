import path from "path";
import { ClassSerializerInterceptor, type INestApplication } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { ThrottlerGuard } from "@nestjs/throttler";
import cookieParser from "cookie-parser";
import { I18nValidationExceptionFilter, I18nValidationPipe } from "nestjs-i18n";
import { register } from "tsconfig-paths";

register({
  baseUrl: path.join(__dirname, "../.."),
  paths: {
    "@/common/*": ["src/common/*"],
    "@/core/*": ["src/core/*"],
    "@/modules/*": ["src/modules/*"],
  },
});

import { AppModule } from "../../src/app.module";
import { MailService } from "../../src/core/mail/mail.service";
import { GlobalExceptionFilter } from "../../src/common/filters/global-exception.filter";
import { AppLogger } from "../../src/common/logger/app-logger.service";

const TEST_PORT = 3099;

const mailCalls: Array<{ method: string; args: unknown[] }> = [];

const testMailService = {
  sendVerificationEmail: (...args: unknown[]) => {
    mailCalls.push({ method: "sendVerificationEmail", args });
    return Promise.resolve();
  },
  sendPasswordResetEmail: (...args: unknown[]) => {
    mailCalls.push({ method: "sendPasswordResetEmail", args });
    return Promise.resolve();
  },
  sendPasswordChangeNotification: (...args: unknown[]) => {
    mailCalls.push({ method: "sendPasswordChangeNotification", args });
    return Promise.resolve();
  },
  onModuleInit: () => {},
};

export default async function globalSetup() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue(testMailService)
    .compile();

  const app: INestApplication = moduleRef.createNestApplication();

  try {
    const throttlerGuard = app.get(ThrottlerGuard);
    if (throttlerGuard) {
      throttlerGuard.canActivate = () => Promise.resolve(true);
    }
  } catch {
    // ignore
  }

  app.use(cookieParser());
  app.useGlobalPipes(new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const appLogger = app.get(AppLogger);
  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: true }), new GlobalExceptionFilter(appLogger));
  app.enableShutdownHooks();

  app.use("/_test/mail", (req: any, res: any) => {
    if (req.method === "GET") return res.json(mailCalls);
    if (req.method === "DELETE") {
      mailCalls.length = 0;
      return res.json({ cleared: true });
    }
    res.status(405).end();
  });

  await app.init();
  await app.listen(TEST_PORT);

  (global as unknown as Record<string, unknown>)["__integrationApp__"] = app;

  process.env.INTEGRATION_SERVER_URL = `http://localhost:${TEST_PORT}`;
}
