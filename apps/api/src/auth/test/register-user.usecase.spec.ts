import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ConflictException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@nucleus/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn<any>(),
      create: jest.fn<any>(),
    },
  },
}));

jest.mock("../../common/utils/password", () => ({
  hashPassword: jest.fn<any>(),
}));

import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { hashPassword } from "../../common/utils/password";
import { MailService } from "../../mail/mail.service";
import { InitializeUserSpaceUseCase } from "../../space/providers/initialize-user-space.usecase";
import { RegisterUserUseCase } from "../providers/register-user.usecase";
import { TokenService } from "../token.service";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockTokenService = {
  createVerificationToken: jest.fn<any>().mockResolvedValue("verify-token"),
};

const mockMailService = {
  sendVerificationEmail: jest.fn<any>().mockResolvedValue(undefined),
};

const mockInitializeUserSpaceUseCase = {
  initialize: jest.fn<any>().mockResolvedValue(undefined),
};

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  username: "testuser",
  passwordHash: "hashed",
};

const mockRegisterDto = {
  email: "test@example.com",
  username: "testuser",
  password: "password123",
};

describe("RegisterUserUseCase", () => {
  let useCase: RegisterUserUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: TokenService, useValue: mockTokenService },
        { provide: MailService, useValue: mockMailService },
        { provide: InitializeUserSpaceUseCase, useValue: mockInitializeUserSpaceUseCase },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  describe("register", () => {
    it("should register a new user and return success message", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (hashPassword as jest.Mock<any>).mockResolvedValue("hashed");
      (prisma.user.create as jest.Mock<any>).mockResolvedValue(mockUser);

      const result = await useCase.register(mockRegisterDto);

      expect(result).toEqual({
        message: "Registration successful. Please check your email to verify your account.",
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockRegisterDto.email,
          username: mockRegisterDto.username,
          passwordHash: "hashed",
        },
      });
      expect(mockInitializeUserSpaceUseCase.initialize).toHaveBeenCalledWith("user-1", "testuser");
      expect(mockTokenService.createVerificationToken).toHaveBeenCalledWith("user-1");
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "testuser",
        "verify-token",
      );
    });

    it("should throw ConflictException when email is already taken", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockUser);

      await expect(useCase.register(mockRegisterDto)).rejects.toThrow(ConflictException);
      await expect(useCase.register(mockRegisterDto)).rejects.toThrow("User with this email already exists");
    });

    it("should throw ConflictException when username is already taken", async () => {
      (prisma.user.findUnique as jest.Mock<any>)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(useCase.register(mockRegisterDto)).rejects.toThrow(ConflictException);
      await expect(useCase.register(mockRegisterDto)).rejects.toThrow("User with this username already exists");
    });

    it("should rethrow unknown errors", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(useCase.register(mockRegisterDto)).rejects.toThrow("DB error");
    });
  });
});
