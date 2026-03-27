import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { ChangePasswordDto, UserResponseDto } from "@nucleus/domain";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";

describe("UserController", () => {
  let controller: UserController;

  const mockUserResponse = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    icon: null,
    isVerified: true,
    createdAt: new Date("2024-01-01"),
  } as unknown as UserResponseDto;

  const mockUserService = {
    findById: jest.fn<() => Promise<UserResponseDto>>(),
    update: jest.fn<() => Promise<UserResponseDto>>(),
    updateAvatar: jest.fn<() => Promise<UserResponseDto>>(),
    removeAvatar: jest.fn<() => Promise<UserResponseDto>>(),
    changePassword: jest.fn<any>(),
    remove: jest.fn<() => Promise<UserResponseDto>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe("getCurrentUser", () => {
    it("should call userService.findById with userId", async () => {
      mockUserService.findById.mockResolvedValue(mockUserResponse);

      const result = await controller.getCurrentUser("user-123");

      expect(result).toEqual(mockUserResponse);
      expect(mockUserService.findById).toHaveBeenCalledWith("user-123");
      expect(mockUserService.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateCurrentUser", () => {
    it("should call userService.update with userId and dto", async () => {
      const updateDto = {
        username: "newname",
      };
      const updatedUser = {
        ...mockUserResponse,
        username: "newname",
      } as unknown as UserResponseDto;
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateCurrentUser("user-123", updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith("user-123", updateDto);
      expect(mockUserService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("uploadAvatar", () => {
    it("should call userService.updateAvatar with userId and the uploaded file", async () => {
      const mockFile = {
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake"),
      } as Express.Multer.File;
      const updatedUser = {
        ...mockUserResponse,
        icon: "/avatars/user-123.jpg",
      } as unknown as UserResponseDto;
      mockUserService.updateAvatar.mockResolvedValue(updatedUser);

      const result = await controller.uploadAvatar("user-123", mockFile);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.updateAvatar).toHaveBeenCalledWith("user-123", mockFile);
      expect(mockUserService.updateAvatar).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeAvatar", () => {
    it("should call userService.removeAvatar with userId", async () => {
      const updatedUser = {
        ...mockUserResponse,
        icon: null,
      } as unknown as UserResponseDto;
      mockUserService.removeAvatar.mockResolvedValue(updatedUser);

      const result = await controller.removeAvatar("user-123");

      expect(result).toEqual(updatedUser);
      expect(mockUserService.removeAvatar).toHaveBeenCalledWith("user-123");
      expect(mockUserService.removeAvatar).toHaveBeenCalledTimes(1);
    });
  });

  describe("changePassword", () => {
    it("should call userService.changePassword with userId and dto", async () => {
      const dto = { currentPassword: "Old@pass1", newPassword: "New@pass1" };
      const expected = { message: "Password changed successfully" };
      mockUserService.changePassword.mockResolvedValue(expected);

      const result = await controller.changePassword("user-123", dto as unknown as ChangePasswordDto);

      expect(result).toEqual(expected);
      expect(mockUserService.changePassword).toHaveBeenCalledWith("user-123", dto);
      expect(mockUserService.changePassword).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeCurrentUser", () => {
    it("should call userService.remove with userId", async () => {
      mockUserService.remove.mockResolvedValue(mockUserResponse);

      const result = await controller.removeCurrentUser("user-123");

      expect(result).toEqual(mockUserResponse);
      expect(mockUserService.remove).toHaveBeenCalledWith("user-123");
      expect(mockUserService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
