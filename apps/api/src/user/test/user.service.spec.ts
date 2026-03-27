import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UnauthorizedException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import * as passwordUtils from "../../common/utils/password";
import { StorageService } from "../storage.service";
import { UserRepository } from "../user.repository";
import { UserService } from "../user.service";

jest.mock("../../common/utils/password", () => ({
  hashPassword: jest.fn<any>(),
  comparePassword: jest.fn<any>(),
}));

describe("UserService", () => {
  let service: UserService;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const mockStorageService = {
    saveAvatar: jest.fn<any>(),
    removeAvatarFiles: jest.fn<any>(),
  };

  const mockUserRepo = {
    findByEmail: jest.fn<any>(),
    findByIdOrThrow: jest.fn<any>(),
    update: jest.fn<any>(),
    delete: jest.fn<any>(),
  };

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    passwordHash: "hashed-password",
    icon: null,
    isVerified: true,
    createdAt: new Date("2024-01-01"),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: StorageService, useValue: mockStorageService },
        { provide: UserRepository, useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("findById", () => {
    it("should return UserResponseDto for valid id", async () => {
      mockUserRepo.findByIdOrThrow.mockResolvedValue(mockUser);

      const result = await service.findById("user-123");

      expect(result.id).toBe("user-123");
      expect(result.email).toBe("test@example.com");
      expect(result.username).toBe("testuser");
      expect(mockUserRepo.findByIdOrThrow).toHaveBeenCalledWith("user-123");
    });

    it("should throw when user not found", async () => {
      mockUserRepo.findByIdOrThrow.mockRejectedValue(new Error("No User found"));

      await expect(service.findById("nonexistent")).rejects.toThrow("No User found");
    });
  });

  describe("update", () => {
    it("should update user and return UserResponseDto", async () => {
      const updatedUser = { ...mockUser, username: "newusername" };
      mockUserRepo.update.mockResolvedValue(updatedUser);

      const result = await service.update("user-123", { username: "newusername" });

      expect(result.username).toBe("newusername");
      expect(mockUserRepo.update).toHaveBeenCalledWith("user-123", { username: "newusername" });
      expect(mockLogger.log).toHaveBeenCalledWith("User updated", { id: "user-123" });
    });

    it("should hash password when password is provided", async () => {
      (passwordUtils.hashPassword as any).mockResolvedValue("new-hashed-password");
      mockUserRepo.update.mockResolvedValue(mockUser);

      await service.update("user-123", { password: "NewPassword123!" });

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("NewPassword123!");
      expect(mockUserRepo.update).toHaveBeenCalledWith("user-123", { passwordHash: "new-hashed-password" });
    });

    it("should not hash password when password is not provided", async () => {
      mockUserRepo.update.mockResolvedValue(mockUser);

      await service.update("user-123", { email: "new@example.com" });

      expect(passwordUtils.hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepo.update).toHaveBeenCalledWith("user-123", { email: "new@example.com" });
    });

    it("should update only provided fields", async () => {
      const updatedUser = { ...mockUser, icon: "new-icon" };
      mockUserRepo.update.mockResolvedValue(updatedUser);

      const result = await service.update("user-123", { icon: "new-icon" });

      expect(result.icon).toBe("new-icon");
      expect(mockUserRepo.update).toHaveBeenCalledWith("user-123", { icon: "new-icon" });
    });
  });

  describe("changePassword", () => {
    const dto = { currentPassword: "Old@pass1", newPassword: "New@pass1" };

    it("should change password and return success message", async () => {
      mockUserRepo.findByIdOrThrow.mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock<any>).mockResolvedValue(true);
      (passwordUtils.hashPassword as jest.Mock<any>).mockResolvedValue("new-hash");
      mockUserRepo.update.mockResolvedValue(mockUser);

      const result = await service.changePassword("user-123", dto);

      expect(result).toEqual({ message: "Password changed successfully" });
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(dto.currentPassword, mockUser.passwordHash);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(dto.newPassword);
      expect(mockUserRepo.update).toHaveBeenCalledWith("user-123", { passwordHash: "new-hash" });
      expect(mockLogger.log).toHaveBeenCalledWith("Password changed", { id: "user-123" });
    });

    it("should throw UnauthorizedException when current password is incorrect", async () => {
      mockUserRepo.findByIdOrThrow.mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock<any>).mockResolvedValue(false);

      await expect(service.changePassword("user-123", dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.changePassword("user-123", dto)).rejects.toThrow("Current password is incorrect");
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it("should rethrow unknown errors", async () => {
      mockUserRepo.findByIdOrThrow.mockRejectedValue(new Error("DB error"));

      await expect(service.changePassword("user-123", dto)).rejects.toThrow("DB error");
    });
  });

  describe("updateAvatar", () => {
    const mockFile = {
      mimetype: "image/jpeg",
      size: 1024,
      buffer: Buffer.from("fake"),
    } as Express.Multer.File;

    it("should save the file, update the user icon, and return UserResponseDto", async () => {
      const updatedUser = { ...mockUser, icon: "/avatars/user-123.jpg" };
      mockStorageService.saveAvatar.mockResolvedValue("/avatars/user-123.jpg");
      mockUserRepo.update.mockResolvedValue(updatedUser);

      const result = await service.updateAvatar("user-123", mockFile);

      expect(mockStorageService.saveAvatar).toHaveBeenCalledWith("user-123", mockFile);
      expect(mockUserRepo.update).toHaveBeenCalledWith("user-123", { icon: "/avatars/user-123.jpg" });
      expect(result.icon).toBe("/avatars/user-123.jpg");
      expect(mockLogger.log).toHaveBeenCalledWith("Avatar updated", { id: "user-123" });
    });

    it("should call removeAvatarFiles as rollback when update throws", async () => {
      const dbError = new Error("DB error");
      mockStorageService.saveAvatar.mockResolvedValue("/avatars/user-123.jpg");
      mockUserRepo.update.mockRejectedValue(dbError);
      mockStorageService.removeAvatarFiles.mockResolvedValue(undefined);

      await expect(service.updateAvatar("user-123", mockFile)).rejects.toThrow("DB error");

      expect(mockStorageService.removeAvatarFiles).toHaveBeenCalledWith("user-123");
    });

    it("should not call removeAvatarFiles when saveAvatar throws", async () => {
      mockStorageService.saveAvatar.mockRejectedValue(new Error("Bad MIME"));

      await expect(service.updateAvatar("user-123", mockFile)).rejects.toThrow("Bad MIME");

      expect(mockUserRepo.update).not.toHaveBeenCalled();
      expect(mockStorageService.removeAvatarFiles).not.toHaveBeenCalled();
    });
  });

  describe("removeAvatar", () => {
    it("should nullify the icon, delete the files, and return UserResponseDto", async () => {
      const updatedUser = { ...mockUser, icon: null };
      mockUserRepo.update.mockResolvedValue(updatedUser);
      mockStorageService.removeAvatarFiles.mockResolvedValue(undefined);

      const result = await service.removeAvatar("user-123");

      expect(mockUserRepo.update).toHaveBeenCalledWith("user-123", { icon: null });
      expect(mockStorageService.removeAvatarFiles).toHaveBeenCalledWith("user-123");
      expect(result.icon).toBeNull();
      expect(mockLogger.log).toHaveBeenCalledWith("Avatar removed", { id: "user-123" });
    });

    it("should rethrow when update throws and not call removeAvatarFiles", async () => {
      mockUserRepo.update.mockRejectedValue(new Error("DB error"));

      await expect(service.removeAvatar("user-123")).rejects.toThrow("DB error");

      expect(mockStorageService.removeAvatarFiles).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete user, clean up avatar files and return UserResponseDto", async () => {
      mockStorageService.removeAvatarFiles.mockResolvedValue(undefined);
      mockUserRepo.delete.mockResolvedValue(mockUser);

      const result = await service.remove("user-123");

      expect(mockStorageService.removeAvatarFiles).toHaveBeenCalledWith("user-123");
      expect(result.id).toBe("user-123");
      expect(mockUserRepo.delete).toHaveBeenCalledWith("user-123");
      expect(mockLogger.log).toHaveBeenCalledWith("User removed", { id: "user-123" });
    });

    it("should throw when user not found", async () => {
      mockStorageService.removeAvatarFiles.mockResolvedValue(undefined);
      mockUserRepo.delete.mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(service.remove("nonexistent")).rejects.toThrow("Record to delete does not exist");
    });
  });
});
