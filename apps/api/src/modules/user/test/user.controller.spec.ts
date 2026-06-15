import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";

describe("UserController", () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockService = {
    findById: jest.fn(),
    update: jest.fn(),
    updateAvatar: jest.fn(),
    removeAvatar: jest.fn(),
    changePassword: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<UserService>;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService) as jest.Mocked<UserService>;
    jest.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("TC-AUTH-U-038: should call service.findById with correct arguments", async () => {
      service.findById.mockResolvedValue({ id: "user-1", email: "test@example.com" } as any);

      const result = await controller.getCurrentUser("user-1");

      expect(result).toEqual({ id: "user-1", email: "test@example.com" });
      expect(service.findById).toHaveBeenCalledWith("user-1");
    });
  });

  describe("updateCurrentUser", () => {
    it("TC-AUTH-U-039: should call service.update with correct arguments", async () => {
      const dto = { username: "newname" };
      service.update.mockResolvedValue({ id: "user-1", username: "newname" } as any);

      const result = await controller.updateCurrentUser("user-1", dto);

      expect(result).toEqual({ id: "user-1", username: "newname" });
      expect(service.update).toHaveBeenCalledWith("user-1", dto);
    });
  });

  describe("uploadAvatar", () => {
    it("TC-AUTH-U-040: should call service.updateAvatar with correct arguments", async () => {
      const file = { buffer: Buffer.from(""), originalname: "avatar.png" } as any;
      service.updateAvatar.mockResolvedValue({ id: "user-1", icon: "path/to/avatar" } as any);

      const result = await controller.uploadAvatar("user-1", file);

      expect(result).toEqual({ id: "user-1", icon: "path/to/avatar" });
      expect(service.updateAvatar).toHaveBeenCalledWith("user-1", file);
    });
  });

  describe("removeAvatar", () => {
    it("TC-AUTH-U-041: should call service.removeAvatar with correct arguments", async () => {
      service.removeAvatar.mockResolvedValue({ id: "user-1", icon: null } as any);

      const result = await controller.removeAvatar("user-1");

      expect(result).toEqual({ id: "user-1", icon: null });
      expect(service.removeAvatar).toHaveBeenCalledWith("user-1");
    });
  });

  describe("changePassword", () => {
    it("TC-AUTH-U-042: should call service.changePassword with correct arguments", async () => {
      const dto = { currentPassword: "OldPassword1!", newPassword: "NewPassword1!" };
      service.changePassword.mockResolvedValue({ message: "Password changed successfully" } as any);

      const result = await controller.changePassword("user-1", dto);

      expect(result).toEqual({ message: "Password changed successfully" });
      expect(service.changePassword).toHaveBeenCalledWith("user-1", dto);
    });
  });

  describe("removeCurrentUser", () => {
    it("TC-AUTH-U-043: should call service.remove with correct arguments", async () => {
      const dto = { password: "Password1!" };
      service.remove.mockResolvedValue({ message: "Account deleted successfully" } as any);

      const result = await controller.removeCurrentUser("user-1", dto);

      expect(result).toEqual({ message: "Account deleted successfully" });
      expect(service.remove).toHaveBeenCalledWith("user-1", dto);
    });
  });
});
