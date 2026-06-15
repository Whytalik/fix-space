import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AppLogger } from "@/common/logger/app-logger.service";
import { TokenService } from "../token.service";

jest.mock("@fixspace/database", () => ({
  prisma: {
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "@fixspace/database";

describe("TokenService", () => {
  let service: TokenService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      const values: Record<string, unknown> = {
        JWT_REFRESH_EXPIRATION: "7d",
        VERIFICATION_TOKEN_EXPIRATION_HOURS: 24,
        PASSWORD_RESET_TOKEN_EXPIRATION_HOURS: 1,
      };
      return values[key] ?? defaultValue;
    }),
  };

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jest.clearAllMocks();
  });

  describe("generateAccessToken — TC-AUTH-U-022", () => {
    it("TC-AUTH-U-022: should call jwtService.sign with sub only", () => {
      mockJwtService.sign.mockReturnValue("access.token.jwt");

      const result = service.generateAccessToken("user-1");

      expect(result).toBe("access.token.jwt");
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: "user-1" });
    });
  });

  describe("createRefreshToken — TC-AUTH-U-011", () => {
    it("TC-AUTH-U-011: should create a DB record and return raw token string", async () => {
      (prisma.refreshToken.create as jest.Mock<any>).mockResolvedValue({ id: "rt-1" });

      const result = await service.createRefreshToken("user-1");

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(10);
      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: "user-1" }),
        }),
      );
    });
  });

  describe("validateRefreshToken", () => {
    it("TC-AUTH-U-012: should return TokenPayload when token is valid and not expired", async () => {
      (prisma.refreshToken.findFirst as jest.Mock<any>).mockResolvedValue({ id: "rt-1", userId: "user-1" });

      const result = await service.validateRefreshToken("raw_token");

      expect(result).toEqual({ userId: "user-1", tokenId: "rt-1" });
    });

    it("TC-AUTH-U-013: should return null when token is expired or revoked", async () => {
      (prisma.refreshToken.findFirst as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.validateRefreshToken("expired_token");

      expect(result).toBeNull();
    });
  });

  describe("rotateRefreshToken — TC-AUTH-U-014", () => {
    it("TC-AUTH-U-014: should revoke old token and create a new one", async () => {
      (prisma.refreshToken.update as jest.Mock<any>).mockResolvedValue({ id: "rt-1", revokedAt: new Date() });
      (prisma.refreshToken.create as jest.Mock<any>).mockResolvedValue({ id: "rt-2" });

      const result = await service.rotateRefreshToken("rt-1", "user-1");

      expect(typeof result).toBe("string");
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "rt-1" } }));
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe("revokeRefreshToken — TC-AUTH-U-015", () => {
    it("TC-AUTH-U-015: should update revokedAt for the matching token hash", async () => {
      (prisma.refreshToken.updateMany as jest.Mock<any>).mockResolvedValue({ count: 1 });

      await service.revokeRefreshToken("raw_token");

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { revokedAt: expect.any(Date) },
        }),
      );
    });
  });

  describe("revokeAllUserRefreshTokens — TC-AUTH-U-016", () => {
    it("TC-AUTH-U-016: should revoke all non-revoked tokens for the user", async () => {
      (prisma.refreshToken.updateMany as jest.Mock<any>).mockResolvedValue({ count: 3 });

      await service.revokeAllUserRefreshTokens("user-1");

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("createVerificationToken — TC-AUTH-U-017 (side)", () => {
    it("should create a DB record and return a raw token", async () => {
      (prisma.emailVerificationToken.create as jest.Mock<any>).mockResolvedValue({ id: "vt-1" });

      const result = await service.createVerificationToken("user-1");

      expect(typeof result).toBe("string");
      expect(prisma.emailVerificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: "user-1" }) }),
      );
    });
  });

  describe("validateVerificationToken", () => {
    it("TC-AUTH-U-017: should return TokenPayload when token is valid and unused", async () => {
      (prisma.emailVerificationToken.findFirst as jest.Mock<any>).mockResolvedValue({ id: "vt-1", userId: "user-1" });

      const result = await service.validateVerificationToken("raw_token");

      expect(result).toEqual({ userId: "user-1", tokenId: "vt-1" });
    });

    it("TC-AUTH-U-018: should return null when token is used or expired", async () => {
      (prisma.emailVerificationToken.findFirst as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.validateVerificationToken("used_token");

      expect(result).toBeNull();
    });
  });

  describe("createPasswordResetToken — TC-AUTH-U-019", () => {
    it("TC-AUTH-U-019: should create a DB record and return a raw token", async () => {
      (prisma.passwordResetToken.create as jest.Mock<any>).mockResolvedValue({ id: "prt-1" });

      const result = await service.createPasswordResetToken("user-1");

      expect(typeof result).toBe("string");
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: "user-1" }) }),
      );
    });
  });

  describe("validatePasswordResetToken", () => {
    it("TC-AUTH-U-020: should return TokenPayload when token is valid and unused", async () => {
      (prisma.passwordResetToken.findFirst as jest.Mock<any>).mockResolvedValue({ id: "prt-1", userId: "user-1" });

      const result = await service.validatePasswordResetToken("raw_token");

      expect(result).toEqual({ userId: "user-1", tokenId: "prt-1" });
    });

    it("TC-AUTH-U-021: should return null when token is expired or used", async () => {
      (prisma.passwordResetToken.findFirst as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.validatePasswordResetToken("expired_token");

      expect(result).toBeNull();
    });
  });

  describe("findActiveSessions", () => {
    it("should return only non-revoked, non-expired sessions ordered by createdAt desc", async () => {
      const sessions = [
        { id: "rt-2", createdAt: new Date(), expiresAt: new Date() },
        { id: "rt-1", createdAt: new Date(), expiresAt: new Date() },
      ];
      (prisma.refreshToken.findMany as jest.Mock<any>).mockResolvedValue(sessions);

      const result = await service.findActiveSessions("user-1");

      expect(result).toHaveLength(2);
      expect(prisma.refreshToken.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "user-1", revokedAt: null }),
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });

  describe("revokeSessionById", () => {
    it("TC-AUTH-U-027: should return 'revoked' when session exists and is active", async () => {
      (prisma.refreshToken.findFirst as jest.Mock<any>).mockResolvedValue({ revokedAt: null });
      (prisma.refreshToken.update as jest.Mock<any>).mockResolvedValue({});

      const result = await service.revokeSessionById("rt-1", "user-1");

      expect(result).toBe("revoked");
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "rt-1", userId: "user-1" } }));
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "rt-1" }, data: { revokedAt: expect.any(Date) } }),
      );
    });

    it("TC-AUTH-U-028: should return 'already_revoked' when session exists but was already revoked", async () => {
      (prisma.refreshToken.findFirst as jest.Mock<any>).mockResolvedValue({ revokedAt: new Date() });

      const result = await service.revokeSessionById("rt-1", "user-1");

      expect(result).toBe("already_revoked");
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it("TC-AUTH-U-029: should return 'not_found' when session does not exist or belongs to another user", async () => {
      (prisma.refreshToken.findFirst as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.revokeSessionById("rt-999", "user-1");

      expect(result).toBe("not_found");
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });
  });
});
