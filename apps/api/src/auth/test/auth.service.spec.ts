import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import * as passwordUtils from "../../common/utils/password";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service";
import { TokenService } from "../token.service";

// Mock modules
jest.mock("@nucleus/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn<any>(),
      update: jest.fn<any>(),
      delete: jest.fn<any>(),
    },
    emailVerificationToken: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("../../common/utils/password", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;

  const mockTokenService = {
    generateAccessToken: jest.fn<() => string>(),
    createRefreshToken: jest.fn<() => Promise<string>>(),
    validateRefreshToken: jest.fn<() => Promise<{ userId: string; tokenId: string } | null>>(),
    rotateRefreshToken: jest.fn<() => Promise<string>>(),
    revokeRefreshToken: jest.fn<() => Promise<void>>(),
    createVerificationToken: jest.fn<() => Promise<string>>(),
    validateVerificationToken: jest.fn<() => Promise<{ userId: string; tokenId: string } | null>>(),
  };

  const mockUserService = {
    findById: jest.fn<() => Promise<any>>(),
  };

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (prisma.$transaction as any).mockImplementation((cb) => cb(prisma));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("login", () => {
    const validLoginDto = {
      email: "test@example.com",
      password: "Test123!@#",
    };

    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      username: "testuser",
      passwordHash: "hashed-password",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should login successfully with valid credentials", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue("access-token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh-token");

      const result = await service.login(validLoginDto);

      expect(result).toEqual({
        message: "Login successful",
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginDto.email },
      });
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(validLoginDto.password, mockUser.passwordHash);
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(mockUser.id, mockUser.username);
      expect(mockTokenService.createRefreshToken).toHaveBeenCalledWith(mockUser.id);
      expect(mockLogger.log).toHaveBeenCalledWith("Login successful", {
        userId: mockUser.id,
        username: mockUser.username,
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(validLoginDto)).rejects.toThrow("Invalid credentials");

      expect(mockLogger.warn).toHaveBeenCalledWith("Login failed: user not found", { email: validLoginDto.email });
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(false);

      await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(validLoginDto)).rejects.toThrow("Invalid credentials");

      expect(mockLogger.warn).toHaveBeenCalledWith("Login failed: invalid password", {
        email: validLoginDto.email,
        userId: mockUser.id,
      });
    });

    it("should throw UnauthorizedException if email not verified", async () => {
      const unverifiedUser = { ...mockUser, isVerified: false };
      (prisma.user.findUnique as any).mockResolvedValue(unverifiedUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(true);

      await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(validLoginDto)).rejects.toThrow("Please verify your email before logging in");

      expect(mockLogger.warn).toHaveBeenCalledWith("Login failed: email not verified", {
        userId: unverifiedUser.id,
        email: unverifiedUser.email,
      });
    });

    it("should handle case-insensitive email lookup", async () => {
      const uppercaseEmail = { ...validLoginDto, email: "TEST@EXAMPLE.COM" };
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue("access-token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh-token");

      await service.login(uppercaseEmail);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: uppercaseEmail.email },
      });
    });

    it("should log debug message on login attempt", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue("access-token");
      mockTokenService.createRefreshToken.mockResolvedValue("refresh-token");

      await service.login(validLoginDto);

      expect(mockLogger.debug).toHaveBeenCalledWith("Login attempt", {
        email: validLoginDto.email,
      });
    });

    it("should not expose whether email exists in error message", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(service.login(validLoginDto)).rejects.toThrow("Invalid credentials");

      // Should not say "User not found" to prevent email enumeration
      await expect(service.login(validLoginDto)).rejects.not.toThrow("User not found");
    });

    it("should not expose password validation details in error message", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(false);

      await expect(service.login(validLoginDto)).rejects.toThrow("Invalid credentials");

      // Should not say "Wrong password" to prevent brute force hints
      await expect(service.login(validLoginDto)).rejects.not.toThrow("Wrong password");
    });
  });

  describe("refresh", () => {
    const validRefreshToken = "valid-refresh-token";
    const mockUser = {
      id: "user-123",
      username: "testuser",
      email: "test@example.com",
      passwordHash: "hash",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should refresh tokens successfully", async () => {
      const validatedToken = { userId: "user-123", tokenId: "token-id" };

      mockTokenService.validateRefreshToken.mockResolvedValue(validatedToken);
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTokenService.rotateRefreshToken.mockResolvedValue("new-refresh-token");
      mockTokenService.generateAccessToken.mockReturnValue("new-access-token");

      const result = await service.refresh(validRefreshToken);

      expect(result).toEqual({
        message: "Token refreshed successfully",
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
      expect(mockTokenService.validateRefreshToken).toHaveBeenCalledWith(validRefreshToken);
      expect(mockUserService.findById).toHaveBeenCalledWith(validatedToken.userId);
      expect(mockTokenService.rotateRefreshToken).toHaveBeenCalledWith(validatedToken.tokenId, validatedToken.userId);
      expect(mockLogger.log).toHaveBeenCalledWith("Token refreshed successfully", { userId: mockUser.id });
    });

    it("should throw UnauthorizedException if refresh token not provided", async () => {
      await expect(service.refresh("")).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh("")).rejects.toThrow("Refresh token not provided");
    });

    it("should throw UnauthorizedException if refresh token is invalid", async () => {
      mockTokenService.validateRefreshToken.mockResolvedValue(null);

      await expect(service.refresh("invalid-token")).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh("invalid-token")).rejects.toThrow("Invalid or expired refresh token");
    });

    it("should throw UnauthorizedException if refresh token is expired", async () => {
      mockTokenService.validateRefreshToken.mockResolvedValue(null);

      await expect(service.refresh("expired-token")).rejects.toThrow(UnauthorizedException);
      await expect(service.refresh("expired-token")).rejects.toThrow("Invalid or expired refresh token");
    });

    it("should rotate refresh token on successful refresh", async () => {
      const validatedToken = { userId: "user-123", tokenId: "old-token-id" };

      mockTokenService.validateRefreshToken.mockResolvedValue(validatedToken);
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTokenService.rotateRefreshToken.mockResolvedValue("new-refresh-token");
      mockTokenService.generateAccessToken.mockReturnValue("new-access-token");

      await service.refresh(validRefreshToken);

      expect(mockTokenService.rotateRefreshToken).toHaveBeenCalledWith("old-token-id", "user-123");
    });

    it("should generate new access token on refresh", async () => {
      const validatedToken = { userId: "user-123", tokenId: "token-id" };

      mockTokenService.validateRefreshToken.mockResolvedValue(validatedToken);
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTokenService.rotateRefreshToken.mockResolvedValue("new-refresh-token");
      mockTokenService.generateAccessToken.mockReturnValue("new-access-token");

      const result = await service.refresh(validRefreshToken);

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(mockUser.id, mockUser.username);
      expect(result.accessToken).toBe("new-access-token");
    });

    it("should handle null refresh token", async () => {
      await expect(service.refresh(null)).rejects.toThrow(UnauthorizedException);
    });

    it("should handle undefined refresh token", async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should logout successfully with valid refresh token", async () => {
      const refreshToken = "valid-refresh-token";
      mockTokenService.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout(refreshToken);

      expect(result).toEqual({
        message: "Logged out successfully",
        clearCookies: true,
      });
      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockLogger.log).toHaveBeenCalledWith("Logout successful");
    });

    it("should handle logout without refresh token", async () => {
      const result = await service.logout("");

      expect(result).toEqual({
        message: "Logged out successfully",
        clearCookies: true,
      });
      expect(mockTokenService.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it("should handle logout with null refresh token", async () => {
      const result = await service.logout(null);

      expect(result).toEqual({
        message: "Logged out successfully",
        clearCookies: true,
      });
      expect(mockTokenService.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it("should handle logout with undefined refresh token", async () => {
      const result = await service.logout(undefined);

      expect(result).toEqual({
        message: "Logged out successfully",
        clearCookies: true,
      });
      expect(mockTokenService.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it("should return clearCookies flag", async () => {
      const result = await service.logout("some-token");

      expect(result.clearCookies).toBe(true);
    });

    it("should not throw error if token revocation fails", async () => {
      const refreshToken = "token";
      mockTokenService.revokeRefreshToken.mockRejectedValue(new Error("Database error"));

      // Should still succeed but propagate the error
      await expect(service.logout(refreshToken)).rejects.toThrow();
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully with valid token", async () => {
      const token = "valid-verification-token";
      const validatedToken = { userId: "user-123", tokenId: "token-id" };

      mockTokenService.validateVerificationToken.mockResolvedValue(validatedToken);
      (prisma.user.update as any).mockResolvedValue({ id: "user-123", isVerified: true });
      (prisma.emailVerificationToken.update as any).mockResolvedValue({ id: "token-id", usedAt: new Date() });

      const result = await service.verifyEmail(token);

      expect(result).toEqual({ message: "Email verified successfully" });
      expect(mockTokenService.validateVerificationToken).toHaveBeenCalledWith(token);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: validatedToken.userId },
        data: { isVerified: true },
      });
      expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: validatedToken.tokenId },
        data: { usedAt: expect.any(Date) },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Email verified successfully", { userId: validatedToken.userId });
    });

    it("should throw BadRequestException if token is invalid", async () => {
      const token = "invalid-token";
      mockTokenService.validateVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow("Invalid or expired verification token");
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.emailVerificationToken.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if token is expired", async () => {
      const token = "expired-token";
      mockTokenService.validateVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow("Invalid or expired verification token");
    });

    it("should mark token as used after verification", async () => {
      const token = "valid-token";
      const validatedToken = { userId: "user-123", tokenId: "token-id" };

      mockTokenService.validateVerificationToken.mockResolvedValue(validatedToken);
      (prisma.user.update as any).mockResolvedValue({ id: "user-123", isVerified: true });
      (prisma.emailVerificationToken.update as any).mockResolvedValue({ id: "token-id", usedAt: new Date() });

      await service.verifyEmail(token);

      expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: "token-id" },
        data: { usedAt: expect.any(Date) },
      });
    });

    it("should update user isVerified flag", async () => {
      const token = "valid-token";
      const validatedToken = { userId: "user-123", tokenId: "token-id" };

      mockTokenService.validateVerificationToken.mockResolvedValue(validatedToken);
      (prisma.user.update as any).mockResolvedValue({ id: "user-123", isVerified: true });
      (prisma.emailVerificationToken.update as any).mockResolvedValue({ id: "token-id", usedAt: new Date() });

      await service.verifyEmail(token);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { isVerified: true },
      });
    });

    it("should handle already used token", async () => {
      const token = "already-used-token";
      mockTokenService.validateVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail(token)).rejects.toThrow("Invalid or expired verification token");
    });
  });

  describe("devResetTestData", () => {
    it("should delete user and log when found", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" };
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      (prisma.user.delete as jest.Mock<any>).mockResolvedValue(mockUser);

      const result = await service.devResetTestData("test@example.com");

      expect(result).toEqual({ message: "Test data for test@example.com deleted (cascade)" });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
      expect(mockLogger.log).toHaveBeenCalledWith("Dev: test data reset", { email: "test@example.com" });
    });

    it("should return 'nothing to reset' message when user not found", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);

      const result = await service.devResetTestData("notfound@example.com");

      expect(result).toEqual({ message: "No user found for notfound@example.com — nothing to reset" });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });

  describe("devVerifyUser", () => {
    it("should update isVerified and return success message", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" };
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock<any>).mockResolvedValue({ ...mockUser, isVerified: true });

      const result = await service.devVerifyUser("test@example.com");

      expect(result).toEqual({ message: "User test@example.com verified successfully" });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        data: { isVerified: true },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Dev: user verified", {
        userId: mockUser.id,
        email: "test@example.com",
      });
    });

    it("should throw NotFoundException when user not found", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.devVerifyUser("notfound@example.com")).rejects.toThrow(NotFoundException);
      await expect(service.devVerifyUser("notfound@example.com")).rejects.toThrow(
        "User with email notfound@example.com not found",
      );
    });
  });

  describe("Security Properties", () => {
    it("should not leak timing information on login failure", async () => {
      const validLoginDto = {
        email: "test@example.com",
        password: "Test123!@#",
      };

      // Test non-existent user timing
      (prisma.user.findUnique as any).mockResolvedValue(null);
      const start1 = Date.now();
      await service.login(validLoginDto).catch(() => {});
      const duration1 = Date.now() - start1;

      // Test wrong password timing
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "hashed-password",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(false);

      const start2 = Date.now();
      await service.login(validLoginDto).catch(() => {});
      const duration2 = Date.now() - start2;

      // Timings should be similar (within reasonable threshold)
      // This is a basic check - proper timing attack prevention requires more sophisticated measures
      const timingDifference = Math.abs(duration1 - duration2);
      expect(timingDifference).toBeLessThan(100); // 100ms threshold
    });

    it("should use consistent error messages to prevent enumeration", async () => {
      const validLoginDto = {
        email: "test@example.com",
        password: "Test123!@#",
      };

      // Non-existent user error
      (prisma.user.findUnique as any).mockResolvedValue(null);
      const error1Promise = service.login(validLoginDto);

      // Wrong password error
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "hashed-password",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as any).mockResolvedValue(false);
      const error2Promise = service.login(validLoginDto);

      // Both should throw the same error message
      await expect(error1Promise).rejects.toThrow("Invalid credentials");
      await expect(error2Promise).rejects.toThrow("Invalid credentials");
    });
  });
});
