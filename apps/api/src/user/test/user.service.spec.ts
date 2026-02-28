import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import * as passwordUtils from "../../common/utils/password";
import { UserService } from "../user.service";

jest.mock("@nucleus/database", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("../../common/utils/password", () => ({
  hashPassword: jest.fn(),
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

  describe("findAll", () => {
    it("should return array of UserResponseDto", async () => {
      const users = [
        mockUser,
        {
          ...mockUser,
          id: "user-456",
          email: "other@example.com",
          username: "otheruser",
        },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("user-123");
      expect(result[0].email).toBe("test@example.com");
      expect(result[1].id).toBe("user-456");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no users", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("findById", () => {
    it("should return UserResponseDto for valid id", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUser);

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
      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error("No User found"));

      await expect(service.findById("nonexistent")).rejects.toThrow("No User found");
    });
  });

  describe("findByEmail", () => {
    it("should return UserResponseDto for valid email", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");

      expect(result.id).toBe("user-123");
      expect(result.email).toBe("test@example.com");
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });
    });

    it("should throw when email not found", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error("No User found"));

      await expect(service.findByEmail("nonexistent@example.com")).rejects.toThrow("No User found");
    });
  });

  describe("findByEmailOrNull", () => {
    it("should return UserResponseDto when user exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmailOrNull("test@example.com");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("user-123");
      expect(result!.email).toBe("test@example.com");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });
    });

    it("should return null when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmailOrNull("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findByUsername", () => {
    it("should return UserResponseDto for valid username", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByUsername("testuser");

      expect(result.id).toBe("user-123");
      expect(result.username).toBe("testuser");
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          username: "testuser",
        },
      });
    });

    it("should throw when username not found", async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error("No User found"));

      await expect(service.findByUsername("nonexistent")).rejects.toThrow("No User found");
    });
  });

  describe("update", () => {
    it("should update user and return UserResponseDto", async () => {
      const updatedUser = {
        ...mockUser,
        username: "newusername",
      };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

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
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue("new-hashed-password");
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

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
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

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
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

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

  describe("remove", () => {
    it("should delete user and return UserResponseDto", async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

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
      (prisma.user.delete as jest.Mock).mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(service.remove("nonexistent")).rejects.toThrow("Record to delete does not exist");
    });
  });
});
