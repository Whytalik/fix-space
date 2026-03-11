import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

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
  });
});
