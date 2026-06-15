import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "@/common/logger/app-logger.service";
import { MailService } from "../mail.service";

const mockSendMail = jest.fn();
const mockVerify = jest.fn();
const mockResendSend = jest.fn();

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify,
  })),
  createTestAccount: jest.fn().mockResolvedValue({
    user: "test@ethereal.email",
    pass: "testpass",
  }),
  getTestMessageUrl: jest.fn(() => "https://ethereal.email/message/123"),
}));

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockResendSend,
    },
  })),
}));

describe("MailService", () => {
  let service: MailService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  function buildModule(configOverrides: Record<string, unknown> = {}) {
    const defaults: Record<string, unknown> = {
      APP_URL: "http://localhost:3001",
      MAIL_FROM: "noreply@fixspace.app",
      NODE_ENV: "development",
      RESEND_API_KEY: undefined,
      SMTP_HOST: "smtp.test",
      SMTP_PORT: 587,
      SMTP_USER: "user",
      SMTP_PASS: "pass",
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => configOverrides[key] ?? defaults[key] ?? defaultValue),
    };

    return Test.createTestingModule({
      providers: [MailService, { provide: ConfigService, useValue: mockConfigService }, { provide: AppLogger, useValue: mockLogger }],
    }).compile();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerify.mockResolvedValue(true);
  });

  describe("sendVerificationEmail", () => {
    it("TC-CORE-U-016: should send email via SMTP when Resend is not configured", async () => {
      mockSendMail.mockResolvedValue({ messageId: "msg-1" });
      const module: TestingModule = await buildModule();
      service = module.get<MailService>(MailService);
      await service.onModuleInit();

      await service.sendVerificationEmail("user@example.com", "alice", "token123");

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
    });

    it("TC-CORE-U-017: should send email via Resend when RESEND_API_KEY is set in production", async () => {
      mockResendSend.mockResolvedValue({ data: { id: "resend-1" }, error: null });
      const module: TestingModule = await buildModule({ NODE_ENV: "production", RESEND_API_KEY: "re_test_key" });
      service = module.get<MailService>(MailService);
      await service.onModuleInit();

      await service.sendVerificationEmail("user@example.com", "alice", "token123");

      expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
    });
  });

  describe("sendPasswordResetEmail — TC-CORE-U-018", () => {
    it("TC-CORE-U-018: should send reset email to the provided address", async () => {
      mockSendMail.mockResolvedValue({ messageId: "msg-2" });
      const module: TestingModule = await buildModule();
      service = module.get<MailService>(MailService);
      await service.onModuleInit();

      await service.sendPasswordResetEmail("user@example.com", "resettoken");

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
    });
  });

  describe("sendPasswordChangeNotification — TC-CORE-U-019", () => {
    it("TC-CORE-U-019: should send password change notification", async () => {
      mockSendMail.mockResolvedValue({ messageId: "msg-3" });
      const module: TestingModule = await buildModule();
      service = module.get<MailService>(MailService);
      await service.onModuleInit();

      await service.sendPasswordChangeNotification("user@example.com");

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
    });
  });

  describe("sendAccountDeletionNotification — TC-CORE-U-020", () => {
    it("TC-CORE-U-020: should send account deletion notification", async () => {
      mockSendMail.mockResolvedValue({ messageId: "msg-4" });
      const module: TestingModule = await buildModule();
      service = module.get<MailService>(MailService);
      await service.onModuleInit();

      await service.sendAccountDeletionNotification("user@example.com");

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
    });
  });
});
