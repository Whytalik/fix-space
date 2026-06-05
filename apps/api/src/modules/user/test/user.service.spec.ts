import { UnauthorizedException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../../common/logger/app-logger.service";
import * as passwordUtils from "../../../common/utils/password";
import { MailService } from "../../../core/mail/mail.service";
import { TokenService } from "../../../core/auth/token.service";
import { UserService } from "../user.service";
import { UserRepository } from "../repositories/user.repository";
import { StorageService } from "../providers/storage.service";

jest.mock("@fixspace/database", () => ({
  Prisma: {},
  prisma: {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("UserService", () => {
  let service: UserService;
  let userRepo: jest.Mocked<UserRepository>;
  let storageService: jest.Mocked<StorageService>;
  let tokenService: jest.Mocked<TokenService>;
  let mailService: jest.Mocked<MailService>;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockUserRepo = {
    findByEmail: jest.fn(),
    findByIdOrThrow: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockStorageService = {
    saveAvatar: jest.fn(),
    removeAvatarFiles: jest.fn(),
  };

  const mockTokenService = {
    revokeAllUserRefreshTokens: jest.fn(),
  };

  const mockMailService = {
    sendPasswordChangeNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: StorageService, useValue: mockStorageService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: MailService, useValue: mockMailService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(UserRepository);
    storageService = module.get(StorageService);
    tokenService = module.get(TokenService);
    mailService = module.get(MailService);

    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return user response when user exists", async () => {
      mockUserRepo.findByIdOrThrow.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        icon: null,
        isVerified: true,
        passwordHash: "hashed",
        createdAt: new Date(),
      });

      const result = await service.findById("user-1");

      expect(result).toBeDefined();
      expect(result.id).toBe("user-1");
      expect(userRepo.findByIdOrThrow).toHaveBeenCalledWith("user-1");
    });

    it("should throw when user not found", async () => {
      mockUserRepo.findByIdOrThrow.mockRejectedValue(new Error("User not found"));

      await expect(service.findById("nonexistent")).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update user profile fields", async () => {
      mockUserRepo.update.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "newname",
        icon: null,
        isVerified: true,
        passwordHash: "hashed",
        createdAt: new Date(),
      });

      const result = await service.update("user-1", { username: "newname" });

      expect(result.username).toBe("newname");
      expect(userRepo.update).toHaveBeenCalledWith("user-1", expect.objectContaining({ username: "newname" }));
    });

    it("should hash password when updating password", async () => {
      jest.spyOn(passwordUtils, "hashPassword").mockResolvedValue("new_hash");
      mockUserRepo.update.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        icon: null,
        isVerified: true,
        passwordHash: "new_hash",
        createdAt: new Date(),
      });

      await service.update("user-1", { password: "NewPass123!" });

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("NewPass123!");
      expect(userRepo.update).toHaveBeenCalledWith("user-1", expect.objectContaining({ passwordHash: "new_hash" }));
    });
  });

  describe("changePassword", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      username: "testuser",
      icon: null,
      isVerified: true,
      passwordHash: "old_hash",
      createdAt: new Date(),
    };

    it("should change password successfully", async () => {
      mockUserRepo.findByIdOrThrow.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtils, "verifyPassword").mockResolvedValue(true);
      jest.spyOn(passwordUtils, "hashPassword").mockResolvedValue("new_hash");
      mockUserRepo.update.mockResolvedValue({ ...mockUser, passwordHash: "new_hash" });

      const result = await service.changePassword("user-1", {
        currentPassword: "OldPass123!",
        newPassword: "NewPass123!",
      });

      expect(result).toHaveProperty("message");
      expect(passwordUtils.verifyPassword).toHaveBeenCalledWith("OldPass123!", "old_hash");
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("NewPass123!");
      expect(userRepo.update).toHaveBeenCalledWith("user-1", { passwordHash: "new_hash" });
      expect(tokenService.revokeAllUserRefreshTokens).toHaveBeenCalledWith("user-1");
      expect(mailService.sendPasswordChangeNotification).toHaveBeenCalledWith("test@example.com");
    });

    it("should throw UnauthorizedException when current password is incorrect", async () => {
      mockUserRepo.findByIdOrThrow.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtils, "verifyPassword").mockResolvedValue(false);

      await expect(
        service.changePassword("user-1", {
          currentPassword: "WrongPass123!",
          newPassword: "NewPass123!",
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepo.update).not.toHaveBeenCalled();
      expect(tokenService.revokeAllUserRefreshTokens).not.toHaveBeenCalled();
    });
  });

  describe("updateAvatar", () => {
    const mockFile = { originalname: "avatar.jpg", buffer: Buffer.from("") } as Express.Multer.File;
    const cloudinaryUrl = "https://res.cloudinary.com/test-cloud/image/upload/v1234567890/fixspace/avatars/user-1.jpg";

    it("should update avatar successfully", async () => {
      mockStorageService.saveAvatar.mockResolvedValue(cloudinaryUrl);
      mockUserRepo.update.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        icon: cloudinaryUrl,
        isVerified: true,
        passwordHash: "hashed",
        createdAt: new Date(),
      });

      const result = await service.updateAvatar("user-1", mockFile);

      expect(result.icon).toBe(cloudinaryUrl);
      expect(storageService.saveAvatar).toHaveBeenCalledWith("user-1", mockFile);
      expect(userRepo.update).toHaveBeenCalledWith("user-1", { icon: cloudinaryUrl });
    });

    it("should rollback avatar files when database update fails", async () => {
      mockStorageService.saveAvatar.mockResolvedValue(cloudinaryUrl);
      mockUserRepo.update.mockRejectedValue(new Error("DB error"));

      await expect(service.updateAvatar("user-1", mockFile)).rejects.toThrow();

      expect(storageService.removeAvatarFiles).toHaveBeenCalledWith("user-1");
    });
  });

  describe("removeAvatar", () => {
    it("should remove avatar successfully", async () => {
      mockUserRepo.update.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        icon: null,
        isVerified: true,
        passwordHash: "hashed",
        createdAt: new Date(),
      });

      const result = await service.removeAvatar("user-1");

      expect(result.icon).toBeNull();
      expect(userRepo.update).toHaveBeenCalledWith("user-1", { icon: null });
      expect(storageService.removeAvatarFiles).toHaveBeenCalledWith("user-1");
    });
  });

  describe("remove", () => {
    it("should remove user and clean up avatar files", async () => {
      mockUserRepo.delete.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        icon: null,
        isVerified: true,
        passwordHash: "hashed",
        createdAt: new Date(),
      });

      const result = await service.remove("user-1");

      expect(result).toBeDefined();
      expect(storageService.removeAvatarFiles).toHaveBeenCalledWith("user-1");
      expect(userRepo.delete).toHaveBeenCalledWith("user-1");
    });
  });
});
