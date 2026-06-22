import { prisma } from "@fixspace/database";
import type { SpaceResponseDto } from "@fixspace/domain";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import * as passwordUtils from "@/common/utils/password";
import { UserService } from "@/modules/user/user.service";
import { InitializeUserSpaceUseCase } from "@/modules/space/providers/initialize-user-space.usecase";
import { MailService } from "../../mail/mail.service";
import { AuthService } from "../auth.service";
import { TokenService } from "../token.service";
import { hashToken } from "../utils/token.helper";

jest.mock("@fixspace/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    emailVerificationToken: {
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    passwordResetToken: {
      update: jest.fn(),
    },
    space: {
      findFirst: jest.fn(),
    },
    googleAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

describe("AuthService", () => {
  let service: AuthService;

  const mockUserService: jest.Mocked<Pick<UserService, "findById">> = {
    findById: jest.fn(),
  };

  const mockInitializeUserSpaceUseCase: jest.Mocked<Pick<InitializeUserSpaceUseCase, "initialize">> = {
    initialize: jest.fn(),
  };

  const mockTokenService: jest.Mocked<
    Pick<
      TokenService,
      | "generateAccessToken"
      | "createRefreshToken"
      | "validateRefreshToken"
      | "rotateRefreshToken"
      | "revokeRefreshToken"
      | "validateVerificationToken"
      | "createVerificationToken"
      | "createPasswordResetToken"
      | "validatePasswordResetToken"
      | "revokeAllUserRefreshTokens"
      | "findActiveSessions"
      | "revokeSessionById"
      | "verifyAccessToken"
    >
  > = {
    generateAccessToken: jest.fn(),
    createRefreshToken: jest.fn(),
    validateRefreshToken: jest.fn(),
    rotateRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    validateVerificationToken: jest.fn(),
    createVerificationToken: jest.fn(),
    createPasswordResetToken: jest.fn(),
    validatePasswordResetToken: jest.fn(),
    revokeAllUserRefreshTokens: jest.fn(),
    findActiveSessions: jest.fn(),
    revokeSessionById: jest.fn(),
    verifyAccessToken: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangeNotification: jest.fn(),
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
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: MailService, useValue: mockMailService },
        { provide: InitializeUserSpaceUseCase, useValue: mockInitializeUserSpaceUseCase },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe("login", () => {
    const loginDto = { email: "test@example.com", password: "Password123!" };
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      username: "testuser",
      passwordHash: "hashed_password",
      isVerified: true,
    };

    it("should login successfully and not initialize space if it already exists", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      (prisma.space.findFirst as jest.Mock<any>).mockResolvedValue({ id: "space-123" });
      jest.spyOn(passwordUtils, "verifyPassword").mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue("access_token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh_token");

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("accessToken", "access_token");
      expect(result).toHaveProperty("refreshToken", "refresh_token");
      expect(prisma.space.findFirst).toHaveBeenCalledWith({ where: { ownerId: mockUser.id } });
      expect(mockInitializeUserSpaceUseCase.initialize).not.toHaveBeenCalled();
    });

    it("should login successfully and initialize space if it does not exist", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      (prisma.space.findFirst as jest.Mock<any>).mockResolvedValue(null);
      jest.spyOn(passwordUtils, "verifyPassword").mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue("access_token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh_token");

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("accessToken", "access_token");
      expect(result).toHaveProperty("refreshToken", "refresh_token");
      expect(prisma.space.findFirst).toHaveBeenCalledWith({ where: { ownerId: mockUser.id } });
      expect(mockInitializeUserSpaceUseCase.initialize).toHaveBeenCalledWith(mockUser.id, mockUser.username);
    });

    it("should throw UnauthorizedException if user not found", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password invalid", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      jest.spyOn(passwordUtils, "verifyPassword").mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if email not verified", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue({ ...mockUser, isVerified: false });
      jest.spyOn(passwordUtils, "verifyPassword").mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refresh", () => {
    const refreshToken = "old_refresh_token";
    const mockUser = {
      id: "user-1",
      username: "test",
      email: "user@example.com",
      icon: null,
      isVerified: true,
      hasPassword: true,
      createdAt: new Date(),
    };

    it("should refresh tokens successfully", async () => {
      mockTokenService.validateRefreshToken.mockResolvedValue({ userId: "user-1", tokenId: "token-1" });
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTokenService.rotateRefreshToken.mockResolvedValue("new_refresh_token");
      mockTokenService.generateAccessToken.mockReturnValue("new_access_token");

      const result = await service.refresh(refreshToken);

      expect(result).toHaveProperty("accessToken", "new_access_token");
      expect(result).toHaveProperty("refreshToken", "new_refresh_token");
    });

    it("should throw UnauthorizedException if no token provided", async () => {
      await expect(service.refresh("")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if token invalid", async () => {
      mockTokenService.validateRefreshToken.mockResolvedValue(null);
      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should revoke token and return success message", async () => {
      const token = "token";
      const result = await service.logout(token);
      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith(token);
      expect(result).toHaveProperty("clearCookies", true);
    });
  });

  describe("logoutAll — TC-AUTH-U-023", () => {
    it("TC-AUTH-U-023: should revoke all refresh tokens and set clearCookies", async () => {
      mockTokenService.revokeAllUserRefreshTokens.mockResolvedValue(undefined);

      const result = await service.logoutAll("user-1");

      expect(mockTokenService.revokeAllUserRefreshTokens).toHaveBeenCalledWith("user-1");
      expect(result).toHaveProperty("clearCookies", true);
      expect(result).toHaveProperty("message");
    });
  });

  describe("getSessions", () => {
    const currentRawToken = "current_raw_token";
    const sessions = [
      { id: "rt-1", tokenHash: hashToken(currentRawToken), createdAt: new Date("2024-01-01"), expiresAt: new Date("2024-01-08") },
      { id: "rt-2", tokenHash: "other-hash", createdAt: new Date("2024-01-02"), expiresAt: new Date("2024-01-09") },
    ];

    it("should return sessions list with isCurrent=true for the active session — no DB call for token lookup", async () => {
      mockTokenService.findActiveSessions.mockResolvedValue(sessions);

      const result = await service.getSessions("user-1", currentRawToken);

      expect(result).toHaveLength(2);
      expect(mockTokenService.validateRefreshToken).not.toHaveBeenCalled();
      const current = result.find((session) => session.id === "rt-1");
      const other = result.find((session) => session.id === "rt-2");
      expect(current?.isCurrent).toBe(true);
      expect(other?.isCurrent).toBe(false);
    });

    it("should return sessions with isCurrent=false when no refresh token provided", async () => {
      mockTokenService.findActiveSessions.mockResolvedValue(sessions);

      const result = await service.getSessions("user-1");

      expect(result.every((session) => !session.isCurrent)).toBe(true);
    });
  });

  describe("revokeSession", () => {
    it("TC-AUTH-U-024: should revoke session successfully when it belongs to the user", async () => {
      mockTokenService.revokeSessionById.mockResolvedValue("revoked");

      const result = await service.revokeSession("user-1", "rt-1");

      expect(mockTokenService.revokeSessionById).toHaveBeenCalledWith("rt-1", "user-1");
      expect(result).toHaveProperty("message");
    });

    it("TC-AUTH-U-025: should return success for an already-revoked own session (idempotent)", async () => {
      mockTokenService.revokeSessionById.mockResolvedValue("already_revoked");

      const result = await service.revokeSession("user-1", "rt-1");

      expect(result).toHaveProperty("message");
    });

    it("TC-AUTH-U-026: should throw NotFoundException when session not found or belongs to another user", async () => {
      mockTokenService.revokeSessionById.mockResolvedValue("not_found");

      await expect(service.revokeSession("user-1", "rt-999")).rejects.toThrow(NotFoundException);
    });
  });

  describe("verifyEmail", () => {
    const token = "valid_token";
    const validationResult = { userId: "user-1", tokenId: "token-1" };
    const mockUser = { id: "user-1", username: "testuser", isVerified: true };

    it("should verify email and initialize space successfully", async () => {
      mockTokenService.validateVerificationToken.mockResolvedValue(validationResult);
      (prisma.user.update as jest.Mock<any>).mockResolvedValue(mockUser);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue({} as SpaceResponseDto);

      const result = await service.verifyEmail(token);

      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.emailVerificationToken.update).toHaveBeenCalled();
      expect(mockInitializeUserSpaceUseCase.initialize).toHaveBeenCalledWith(mockUser.id, mockUser.username);
      expect(result).toHaveProperty("message");
    });

    it("should throw BadRequestException if token is invalid", async () => {
      mockTokenService.validateVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow(BadRequestException);
    });
  });

  describe("resendVerification", () => {
    const email = "test@example.com";
    const mockUser = { id: "user-1", email, username: "testuser", isVerified: false };

    it("should resend verification email successfully", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      (prisma.emailVerificationToken.findFirst as jest.Mock<any>).mockResolvedValue(null);
      mockTokenService.createVerificationToken.mockResolvedValue("new_token");

      const result = await service.resendVerification(email);

      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(email, mockUser.username, "new_token");
      expect(result).toHaveProperty("message");
    });

    it("should throw BadRequestException if cooldown is active", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      (prisma.emailVerificationToken.findFirst as jest.Mock<any>).mockResolvedValue({
        createdAt: new Date(Date.now() - 30_000),
      });

      await expect(service.resendVerification(email)).rejects.toThrow(BadRequestException);
    });

    it("should return generic message if user not found", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.resendVerification(email);

      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();
      expect(result).toHaveProperty("message");
    });

    it("should return generic message if user already verified", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue({ ...mockUser, isVerified: true });

      const result = await service.resendVerification(email);

      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();
      expect(result).toHaveProperty("message");
    });
  });

  describe("forgotPassword", () => {
    const email = "test@example.com";
    const mockUser = { id: "user-1", email };

    it("should send reset email if user exists", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      mockTokenService.createPasswordResetToken.mockResolvedValue("reset_token");

      const result = await service.forgotPassword(email);

      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, "reset_token");
      expect(result).toHaveProperty("message");
    });

    it("should return generic message even if user not found (security)", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toHaveProperty("message");
    });
  });

  describe("resetPassword", () => {
    const token = "reset_token";
    const newPassword = "NewPassword123!";
    const validationResult = { userId: "user-1", tokenId: "token-1" };

    it("should reset password successfully", async () => {
      mockTokenService.validatePasswordResetToken.mockResolvedValue(validationResult);
      jest.spyOn(passwordUtils, "hashPassword").mockResolvedValue("new_hash");
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue({ email: "test@example.com" });

      const result = await service.resetPassword(token, newPassword);

      expect(prisma.user.update).toHaveBeenCalled();
      expect(mockTokenService.revokeAllUserRefreshTokens).toHaveBeenCalledWith(validationResult.userId);
      expect(mockMailService.sendPasswordChangeNotification).toHaveBeenCalled();
      expect(result).toHaveProperty("message");
    });

    it("should throw BadRequestException if token is invalid", async () => {
      mockTokenService.validatePasswordResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(BadRequestException);
    });
  });

  describe("loginWithGoogle — TC-AUTH-U-004", () => {
    const mockGoogleUser = {
      googleId: "google-123",
      email: "googleuser@example.com",
      displayName: "Google User",
      accessToken: "google-access-token",
    };

    const mockCreatedUser = {
      id: "user-456",
      username: "Google_User",
      isVerified: true,
    };

    it("should create new user and GoogleAccount when email is new", async () => {
      (prisma.googleAccount.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (prisma.user.create as jest.Mock<any>).mockResolvedValue(mockCreatedUser);
      (prisma.googleAccount.create as jest.Mock<any>).mockResolvedValue({});
      (prisma.space.findFirst as jest.Mock<any>).mockResolvedValue(null);
      mockTokenService.generateAccessToken.mockReturnValue("access_token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh_token");

      const result = await service.loginWithGoogle(mockGoogleUser);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: mockGoogleUser.email,
            passwordHash: null,
            isVerified: true,
          }),
        }),
      );
      expect(mockInitializeUserSpaceUseCase.initialize).toHaveBeenCalledWith(mockCreatedUser.id, mockCreatedUser.username);
      expect(result).toHaveProperty("accessToken", "access_token");
      expect(result).toHaveProperty("refreshToken", "refresh_token");
    });

    it("should link GoogleAccount to existing user with matching email", async () => {
      const existingUser = { id: "user-789", username: "existing_user", isVerified: true };
      (prisma.googleAccount.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(existingUser);
      (prisma.googleAccount.create as jest.Mock<any>).mockResolvedValue({});
      (prisma.space.findFirst as jest.Mock<any>).mockResolvedValue({ id: "space-1" });
      mockTokenService.generateAccessToken.mockReturnValue("access_token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh_token");

      const result = await service.loginWithGoogle(mockGoogleUser);

      expect(prisma.googleAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: existingUser.id,
            googleId: mockGoogleUser.googleId,
          }),
        }),
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken", "access_token");
    });

    it("should return session for returning Google user and update stored tokens", async () => {
      const googleAccount = { googleId: "google-123", user: mockCreatedUser };
      (prisma.googleAccount.findUnique as jest.Mock<any>).mockResolvedValue(googleAccount);
      (prisma.space.findFirst as jest.Mock<any>).mockResolvedValue({ id: "space-1" });
      mockTokenService.generateAccessToken.mockReturnValue("access_token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh_token");

      const result = await service.loginWithGoogle(mockGoogleUser);

      expect(prisma.googleAccount.update).toHaveBeenCalledWith(expect.objectContaining({ where: { googleId: mockGoogleUser.googleId } }));
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken", "access_token");
    });
  });
});
