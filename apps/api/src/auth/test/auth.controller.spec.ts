import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthCookiesInterceptor } from "../../common/interceptors/auth-cookies.interceptor";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { DevOnlyGuard } from "../guards/dev-only.guard";
import { RegisterUserUseCase } from "../providers/register-user.usecase";

describe("AuthController", () => {
  let controller: AuthController;

  const mockAuthService = {
    verifyEmail: jest.fn<any>(),
    login: jest.fn<any>(),
    refresh: jest.fn<any>(),
    logout: jest.fn<any>(),
    devVerifyUser: jest.fn<any>(),
    devResetTestData: jest.fn<any>(),
  };

  const mockRegisterUserUseCase = {
    register: jest.fn<any>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: RegisterUserUseCase, useValue: mockRegisterUserUseCase },
        Reflector,
      ],
    })
      .overrideGuard(DevOnlyGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(AuthCookiesInterceptor)
      .useValue({ intercept: (_ctx: unknown, next: { handle: () => unknown }) => next.handle() })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("register", () => {
    it("should delegate to registerUserUseCase.register", async () => {
      const dto = { email: "a@b.com", password: "Pass123!", username: "alice" };
      const expected = { message: "Registered" };
      mockRegisterUserUseCase.register.mockResolvedValue(expected);

      const result = await controller.register(dto as any);

      expect(result).toEqual(expected);
      expect(mockRegisterUserUseCase.register).toHaveBeenCalledWith(dto);
    });
  });

  describe("verify", () => {
    it("should delegate to authService.verifyEmail with token from body", async () => {
      const dto = { token: "abc123" };
      const expected = { message: "Email verified successfully" };
      mockAuthService.verifyEmail.mockResolvedValue(expected);

      const result = await controller.verify(dto as any);

      expect(result).toEqual(expected);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("login", () => {
    it("should delegate to authService.login with dto", async () => {
      const dto = { email: "a@b.com", password: "Pass123!" };
      const expected = { message: "Login successful", accessToken: "at", refreshToken: "rt" };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto as any);

      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe("refresh", () => {
    it("should read refresh_token cookie and call authService.refresh", async () => {
      const req = { cookies: { refresh_token: "tok" } } as any;
      const expected = { message: "Token refreshed successfully", accessToken: "at", refreshToken: "rt" };
      mockAuthService.refresh.mockResolvedValue(expected);

      const result = await controller.refresh(req);

      expect(result).toEqual(expected);
      expect(mockAuthService.refresh).toHaveBeenCalledWith("tok");
    });

    it("should pass undefined to authService.refresh when no cookie present", async () => {
      const req = { cookies: {} } as any;
      mockAuthService.refresh.mockResolvedValue({ message: "ok" });

      await controller.refresh(req);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(undefined);
    });
  });

  describe("logout", () => {
    it("should read refresh_token cookie and call authService.logout", async () => {
      const req = { cookies: { refresh_token: "tok" } } as any;
      const expected = { message: "Logged out successfully", clearCookies: true };
      mockAuthService.logout.mockResolvedValue(expected);

      const result = await controller.logout(req);

      expect(result).toEqual(expected);
      expect(mockAuthService.logout).toHaveBeenCalledWith("tok");
    });
  });

  describe("devVerifyUser", () => {
    it("should delegate to authService.devVerifyUser with email", async () => {
      const expected = { message: "User a@b.com verified successfully" };
      mockAuthService.devVerifyUser.mockResolvedValue(expected);

      const result = await controller.devVerifyUser("a@b.com");

      expect(result).toEqual(expected);
      expect(mockAuthService.devVerifyUser).toHaveBeenCalledWith("a@b.com");
    });
  });

  describe("devResetTestData", () => {
    it("should delegate to authService.devResetTestData with email", async () => {
      const expected = { message: "Test data for a@b.com deleted (cascade)" };
      mockAuthService.devResetTestData.mockResolvedValue(expected);

      const result = await controller.devResetTestData("a@b.com");

      expect(result).toEqual(expected);
      expect(mockAuthService.devResetTestData).toHaveBeenCalledWith("a@b.com");
    });
  });
});
