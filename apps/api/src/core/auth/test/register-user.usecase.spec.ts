import { prisma } from "@fixspace/database";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ConflictException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../../common/logger/app-logger.service";
import * as passwordUtils from "../../../common/utils/password";
import { MailService } from "../../mail/mail.service";
import { RegisterUserUseCase } from "../providers/register-user.usecase";
import { TokenService } from "../token.service";

jest.mock("@fixspace/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("RegisterUserUseCase", () => {
  let useCase: RegisterUserUseCase;

  const mockTokenService: jest.Mocked<Pick<TokenService, "createVerificationToken">> = {
    createVerificationToken: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
  };

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const registerDto = {
    email: "test@example.com",
    username: "testuser",
    password: "Password123!",
  };

  const mockUser = {
    id: "user-123",
    email: registerDto.email,
    username: registerDto.username,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: TokenService, useValue: mockTokenService },
        { provide: MailService, useValue: mockMailService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register successfully and return { message }", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (prisma.user.create as jest.Mock<any>).mockResolvedValue(mockUser);
      jest.spyOn(passwordUtils, "hashPassword").mockResolvedValue("hashed_password");
      mockTokenService.createVerificationToken.mockResolvedValue("verification_token");

      const result = await useCase.register(registerDto);

      expect(result).toHaveProperty("message");
    });

    it("should throw ConflictException if email is already taken", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValueOnce(mockUser);

      await expect(useCase.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if username is already taken", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

      await expect(useCase.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it("should NOT call user.create if email is taken", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValueOnce(mockUser);

      await expect(useCase.register(registerDto)).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should NOT call sendVerificationEmail if email is taken", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValueOnce(mockUser);

      await expect(useCase.register(registerDto)).rejects.toThrow(ConflictException);

      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should NOT call sendVerificationEmail if username is taken", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

      await expect(useCase.register(registerDto)).rejects.toThrow(ConflictException);

      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should hash password before creating user", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (prisma.user.create as jest.Mock<any>).mockResolvedValue(mockUser);
      const hashSpy = jest.spyOn(passwordUtils, "hashPassword").mockResolvedValue("hashed_password");
      mockTokenService.createVerificationToken.mockResolvedValue("token");

      await useCase.register(registerDto);

      expect(hashSpy).toHaveBeenCalledWith(registerDto.password);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ passwordHash: "hashed_password" }) }),
      );
    });

    it("should call sendVerificationEmail with email, username, and token", async () => {
      (prisma.user.findUnique as jest.Mock<any>).mockResolvedValue(null);
      (prisma.user.create as jest.Mock<any>).mockResolvedValue(mockUser);
      jest.spyOn(passwordUtils, "hashPassword").mockResolvedValue("hashed_password");
      mockTokenService.createVerificationToken.mockResolvedValue("verification_token");

      await useCase.register(registerDto);

      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(mockUser.email, mockUser.username, "verification_token");
    });
  });
});
