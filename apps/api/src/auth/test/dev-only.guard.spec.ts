import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { DevOnlyGuard } from "../guards/dev-only.guard";

const mockConfigService = {
  get: jest.fn<any>(),
};

const mockContext = {} as ExecutionContext;

describe("DevOnlyGuard", () => {
  let guard: DevOnlyGuard;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DevOnlyGuard, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    guard = module.get<DevOnlyGuard>(DevOnlyGuard);
  });

  describe("canActivate", () => {
    it("should return true when NODE_ENV is development", () => {
      mockConfigService.get.mockReturnValue("development");

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it("should throw ForbiddenException when NODE_ENV is production", () => {
      mockConfigService.get.mockReturnValue("production");

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow("Available in development only");
    });

    it("should throw ForbiddenException when NODE_ENV is undefined", () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });
});
