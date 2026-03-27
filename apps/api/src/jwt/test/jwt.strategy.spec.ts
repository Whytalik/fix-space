import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { JwtStrategy } from "../jwt.strategy";

const mockConfigService = {
  get: jest.fn<any>().mockReturnValue("test-secret"),
};

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe("validate", () => {
    it("should return userId and username from JWT payload", async () => {
      const payload = { sub: "user-123", username: "alice" };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: "user-123", username: "alice" });
    });

    it("should throw UnauthorizedException when payload is missing sub", async () => {
      const payload = { username: "alice" } as { sub: string; username: string };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow("Invalid token payload");
    });

    it("should throw UnauthorizedException when payload is missing username", async () => {
      const payload = { sub: "user-123" } as { sub: string; username: string };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow("Invalid token payload");
    });
  });
});
