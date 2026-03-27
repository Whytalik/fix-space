import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

jest.mock("@nucleus/database", () => ({
  prisma: {
    refreshToken: {
      create: jest.fn<any>(),
      findFirst: jest.fn<any>(),
      update: jest.fn<any>(),
      updateMany: jest.fn<any>(),
    },
    emailVerificationToken: {
      create: jest.fn<any>(),
      findFirst: jest.fn<any>(),
      update: jest.fn<any>(),
    },
  },
}));

jest.mock("../../common/utils/token.helper", () => ({
  generateRandomToken: jest.fn<any>().mockReturnValue("raw-token"),
  hashToken: jest.fn<any>().mockReturnValue("hashed-token"),
}));

import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { TokenService } from "../token.service";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockJwtService = {
  sign: jest.fn<any>().mockReturnValue("signed-jwt"),
};

const mockConfigService = {
  get: jest.fn<any>().mockReturnValue("7d"),
};

describe("TokenService", () => {
  let service: TokenService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  describe("generateAccessToken", () => {
    it("should sign a JWT with userId and username", () => {
      const token = service.generateAccessToken("user-1", "alice");

      expect(token).toBe("signed-jwt");
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: "user-1", username: "alice" });
    });
  });

  describe("createRefreshToken", () => {
    it("should create a refresh token record and return raw token", async () => {
      (prisma.refreshToken.create as jest.Mock<any>).mockResolvedValue({ id: "rt-1" });

      const result = await service.createRefreshToken("user-1");

      expect(result).toBe("raw-token");
      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            tokenHash: "hashed-token",
          }),
        }),
      );
    });
  });

  describe("validateRefreshToken", () => {
    it("should return userId and tokenId for valid token", async () => {
      (prisma.refreshToken.findFirst as jest.Mock<any>).mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
      });

      const result = await service.validateRefreshToken("raw-token");

      expect(result).toEqual({ userId: "user-1", tokenId: "rt-1" });
    });

    it("should return null and warn when token is not found", async () => {
      (prisma.refreshToken.findFirst as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.validateRefreshToken("bad-token");

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe("rotateRefreshToken", () => {
    it("should revoke old token and create a new one", async () => {
      (prisma.refreshToken.update as jest.Mock<any>).mockResolvedValue({ id: "rt-old" });
      (prisma.refreshToken.create as jest.Mock<any>).mockResolvedValue({ id: "rt-new" });

      const result = await service.rotateRefreshToken("rt-old", "user-1");

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "rt-old" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result).toBe("raw-token");
    });
  });

  describe("revokeRefreshToken", () => {
    it("should revoke token by raw value", async () => {
      (prisma.refreshToken.updateMany as jest.Mock<any>).mockResolvedValue({ count: 1 });

      await service.revokeRefreshToken("raw-token");

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: "hashed-token", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("revokeAllUserRefreshTokens", () => {
    it("should revoke all tokens for a user", async () => {
      (prisma.refreshToken.updateMany as jest.Mock<any>).mockResolvedValue({ count: 3 });

      await service.revokeAllUserRefreshTokens("user-1");

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("createVerificationToken", () => {
    it("should create a verification token and return the raw token", async () => {
      (prisma.emailVerificationToken.create as jest.Mock<any>).mockResolvedValue({ id: "vt-1" });

      const result = await service.createVerificationToken("user-1");

      expect(result).toBe("raw-token");
      expect(prisma.emailVerificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            tokenHash: "hashed-token",
          }),
        }),
      );
    });
  });

  describe("validateVerificationToken", () => {
    it("should return userId and tokenId for valid token", async () => {
      (prisma.emailVerificationToken.findFirst as jest.Mock<any>).mockResolvedValue({
        id: "vt-1",
        userId: "user-1",
      });

      const result = await service.validateVerificationToken("raw-token");

      expect(result).toEqual({ userId: "user-1", tokenId: "vt-1" });
    });

    it("should return null and warn when token is invalid", async () => {
      (prisma.emailVerificationToken.findFirst as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.validateVerificationToken("bad-token");

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe("markVerificationTokenUsed", () => {
    it("should mark the token as used", async () => {
      (prisma.emailVerificationToken.update as jest.Mock<any>).mockResolvedValue({ id: "vt-1" });

      await service.markVerificationTokenUsed("vt-1");

      expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: "vt-1" },
        data: { usedAt: expect.any(Date) },
      });
    });
  });
});
