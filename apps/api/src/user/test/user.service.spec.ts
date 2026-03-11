import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import * as passwordUtils from "../../common/utils/password";
import { UserService } from "../user.service";

jest.mock("@nucleus/database", () => ({
  prisma: {
    user: {
      findUniqueOrThrow: jest.fn<any>(),
      update: jest.fn<any>(),
      delete: jest.fn<any>(),
    },
  },
}));

jest.mock("../../common/utils/password", () => ({
  hashPassword: jest.fn<any>(),
  comparePassword: jest.fn<any>(),
}));

describe("UserService", () => {
  let service: UserService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
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
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("findById", () => {
    it("should return UserResponseDto for valid id", async () => {
      (prisma.user.findUniqueOrThrow as any).mockResolvedValue(mockUser);

      const result = await service.findById("user-123");

      expect(result.id).toBe("user-123");
      expect(result.email).toBe("test@example.com");
      expect(result.username).toBe("testuser");
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
      });
    });

    it("should throw when user not found", async () => {
      (prisma.user.findUniqueOrThrow as any).mockRejectedValue(new Error("No User found"));

      await expect(service.findById("nonexistent")).rejects.toThrow("No User found");
    });
  });

  describe("update", () => {
    it("should update user and return UserResponseDto", async () => {
      const updatedUser = {
        ...mockUser,
        username: "newusername",
      };
      (prisma.user.update as any).mockResolvedValue(updatedUser);

      const result = await service.update("user-123", {
        username: "newusername",
      });

      expect(result.username).toBe("newusername");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
        data: {
          username: "newusername",
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("User updated", {
        id: "user-123",
      });
    });

    it("should hash password when password is provided", async () => {
      (passwordUtils.hashPassword as any).mockResolvedValue("new-hashed-password");
      (prisma.user.update as any).mockResolvedValue(mockUser);

      await service.update("user-123", {
        password: "NewPassword123!",
      });

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("NewPassword123!");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
        data: {
          passwordHash: "new-hashed-password",
        },
      });
    });

    it("should not hash password when password is not provided", async () => {
      (prisma.user.update as any).mockResolvedValue(mockUser);

      await service.update("user-123", {
        email: "new@example.com",
      });

      expect(passwordUtils.hashPassword).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
        data: {
          email: "new@example.com",
        },
      });
    });

    it("should update only provided fields", async () => {
      const updatedUser = {
        ...mockUser,
        icon: "new-icon",
      };
      (prisma.user.update as any).mockResolvedValue(updatedUser);

      const result = await service.update("user-123", {
        icon: "new-icon",
      });

      expect(result.icon).toBe("new-icon");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
        data: {
          icon: "new-icon",
        },
      });
    });
  });

  describe("changePassword", () => {
    const dto = { currentPassword: "Old@pass1", newPassword: "New@pass1" };

    it("should change password and return success message", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock<any>).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock<any>).mockResolvedValue(true);
      (passwordUtils.hashPassword as jest.Mock<any>).mockResolvedValue("new-hash");
      (prisma.user.update as jest.Mock<any>).mockResolvedValue(mockUser);

      const result = await service.changePassword("user-123", dto);

      expect(result).toEqual({ message: "Password changed successfully" });
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(dto.currentPassword, mockUser.passwordHash);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(dto.newPassword);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { passwordHash: "new-hash" },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Password changed", { id: "user-123" });
    });

    it("should throw UnauthorizedException when current password is incorrect", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock<any>).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock<any>).mockResolvedValue(false);

      await expect(service.changePassword("user-123", dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.changePassword("user-123", dto)).rejects.toThrow("Current password is incorrect");
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("should rethrow unknown errors", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(service.changePassword("user-123", dto)).rejects.toThrow("DB error");
    });
  });

  describe("remove", () => {
    it("should delete user and return UserResponseDto", async () => {
      (prisma.user.delete as any).mockResolvedValue(mockUser);

      const result = await service.remove("user-123");

      expect(result.id).toBe("user-123");
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("User removed", {
        id: "user-123",
      });
    });

    it("should throw when user not found", async () => {
      (prisma.user.delete as any).mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(service.remove("nonexistent")).rejects.toThrow("Record to delete does not exist");
    });
  });
});
