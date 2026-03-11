import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";
import { lastValueFrom } from "rxjs";

import { AuthCookiesInterceptor } from "../auth-cookies.interceptor";

const mockConfigService = {
  get: jest.fn<any>(),
};

function makeContext(resCookieFn: jest.Mock<any>, resClearCookieFn: jest.Mock<any>): ExecutionContext {
  return {
    switchToHttp: jest.fn<any>().mockReturnValue({
      getResponse: jest.fn<any>().mockReturnValue({
        cookie: resCookieFn,
        clearCookie: resClearCookieFn,
      }),
    }),
  } as unknown as ExecutionContext;
}

function makeHandler(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

describe("AuthCookiesInterceptor", () => {
  let interceptor: AuthCookiesInterceptor;
  let resCookie: jest.Mock<any>;
  let resClearCookie: jest.Mock<any>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default config values
    mockConfigService.get.mockImplementation((key: string, def?: string) => {
      if (key === "NODE_ENV") return "development";
      if (key === "COOKIE_DOMAIN") return "localhost";
      if (key === "JWT_ACCESS_EXPIRATION") return "15m";
      if (key === "JWT_REFRESH_EXPIRATION") return "7d";
      return def;
    });

    resCookie = jest.fn<any>();
    resClearCookie = jest.fn<any>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthCookiesInterceptor, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    interceptor = module.get<AuthCookiesInterceptor>(AuthCookiesInterceptor);
  });

  describe("intercept", () => {
    it("should call res.cookie for access_token when accessToken is present", async () => {
      const ctx = makeContext(resCookie, resClearCookie);
      const obs = interceptor.intercept(ctx, makeHandler({ accessToken: "acc-tok" }));
      await lastValueFrom(obs);

      expect(resCookie).toHaveBeenCalledWith("access_token", "acc-tok", expect.any(Object));
    });

    it("should call res.cookie for refresh_token when refreshToken is present", async () => {
      const ctx = makeContext(resCookie, resClearCookie);
      const obs = interceptor.intercept(ctx, makeHandler({ refreshToken: "ref-tok" }));
      await lastValueFrom(obs);

      expect(resCookie).toHaveBeenCalledWith("refresh_token", "ref-tok", expect.any(Object));
    });

    it("should call res.clearCookie for both tokens when clearCookies is true", async () => {
      const ctx = makeContext(resCookie, resClearCookie);
      const obs = interceptor.intercept(ctx, makeHandler({ clearCookies: true }));
      await lastValueFrom(obs);

      expect(resClearCookie).toHaveBeenCalledWith("access_token", expect.any(Object));
      expect(resClearCookie).toHaveBeenCalledWith("refresh_token", expect.any(Object));
    });

    it("should strip refreshToken from the returned object", async () => {
      const ctx = makeContext(resCookie, resClearCookie);
      const obs = interceptor.intercept(ctx, makeHandler({ refreshToken: "ref-tok", userId: "u1" }));
      const result = (await lastValueFrom(obs)) as Record<string, unknown>;

      expect(result).not.toHaveProperty("refreshToken");
      expect(result).toHaveProperty("userId", "u1");
    });

    it("should strip clearCookies from the returned object", async () => {
      const ctx = makeContext(resCookie, resClearCookie);
      const obs = interceptor.intercept(ctx, makeHandler({ clearCookies: true, userId: "u1" }));
      const result = (await lastValueFrom(obs)) as Record<string, unknown>;

      expect(result).not.toHaveProperty("clearCookies");
    });

    it("should set secure: true when NODE_ENV is production", async () => {
      mockConfigService.get.mockImplementation((key: string, def?: string) => {
        if (key === "NODE_ENV") return "production";
        if (key === "COOKIE_DOMAIN") return "localhost";
        if (key === "JWT_ACCESS_EXPIRATION") return "15m";
        if (key === "JWT_REFRESH_EXPIRATION") return "7d";
        return def;
      });

      const ctx = makeContext(resCookie, resClearCookie);
      const obs = interceptor.intercept(ctx, makeHandler({ accessToken: "acc-tok" }));
      await lastValueFrom(obs);

      expect(resCookie).toHaveBeenCalledWith("access_token", "acc-tok", expect.objectContaining({ secure: true }));
    });

    it("should set secure: false when NODE_ENV is not production", async () => {
      const ctx = makeContext(resCookie, resClearCookie);
      const obs = interceptor.intercept(ctx, makeHandler({ accessToken: "acc-tok" }));
      await lastValueFrom(obs);

      expect(resCookie).toHaveBeenCalledWith("access_token", "acc-tok", expect.objectContaining({ secure: false }));
    });
  });
});
