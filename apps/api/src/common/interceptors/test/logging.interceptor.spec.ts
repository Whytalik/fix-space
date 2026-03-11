import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";
import { lastValueFrom } from "rxjs";

jest.mock("../../context/request-context", () => ({
  getRequestContext: jest.fn<any>(),
}));

import { getRequestContext } from "../../context/request-context";
import { AppLogger } from "../../logger/app-logger.service";
import { LoggingInterceptor } from "../logging.interceptor";

const mockLogger = {
  setContext: jest.fn<any>(),
  log: jest.fn<any>(),
  debug: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

function makeContext(overrides: {
  method?: string;
  url?: string;
  body?: Record<string, unknown>;
  user?: unknown;
  statusCode?: number;
}): ExecutionContext {
  const request = {
    method: overrides.method ?? "GET",
    url: overrides.url ?? "/test",
    body: overrides.body ?? {},
    user: overrides.user,
  };
  const response = { statusCode: overrides.statusCode ?? 200 };

  return {
    switchToHttp: jest.fn<any>().mockReturnValue({
      getRequest: jest.fn<any>().mockReturnValue(request),
      getResponse: jest.fn<any>().mockReturnValue(response),
    }),
  } as unknown as ExecutionContext;
}

function makeHandler(): CallHandler {
  return { handle: () => of({ ok: true }) };
}

describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    jest.clearAllMocks();
    (getRequestContext as jest.Mock<any>).mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  describe("intercept", () => {
    it("should log >>> METHOD /url before handling", async () => {
      const ctx = makeContext({ method: "POST", url: "/api/records" });
      await lastValueFrom(interceptor.intercept(ctx, makeHandler()));

      expect(mockLogger.log).toHaveBeenCalledWith(">>> POST /api/records");
    });

    it("should log <<< METHOD /url STATUS DURATIONms after response", async () => {
      const ctx = makeContext({ method: "GET", url: "/api/spaces", statusCode: 200 });
      await lastValueFrom(interceptor.intercept(ctx, makeHandler()));

      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/<<< GET \/api\/spaces 200 \d+ms/));
    });

    it("should call logger.debug with body JSON when body has keys", async () => {
      const ctx = makeContext({ body: { name: "Test" } });
      await lastValueFrom(interceptor.intercept(ctx, makeHandler()));

      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('"name":"Test"'));
    });

    it("should not call logger.debug when body is empty", async () => {
      const ctx = makeContext({ body: {} });
      await lastValueFrom(interceptor.intercept(ctx, makeHandler()));

      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it("should set reqContext.userId from request.user when both are present", async () => {
      const reqContext = { requestId: "req-1", startTime: Date.now() } as Record<string, unknown>;
      (getRequestContext as jest.Mock<any>).mockReturnValue(reqContext);

      const ctx = makeContext({ user: { userId: "user-1", username: "alice" } });
      await lastValueFrom(interceptor.intercept(ctx, makeHandler()));

      expect(reqContext["userId"]).toBe("user-1");
      expect(reqContext["username"]).toBe("alice");
    });
  });
});
