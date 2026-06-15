import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { NotificationType } from "@fixspace/database";
import { AppLogger } from "@/common/logger/app-logger.service";
import { NotificationService } from "../notification.service";
import { NotificationRepository } from "../repositories/notification.repository";

describe("NotificationService", () => {
  let service: NotificationService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockNotifRepo = {
    findAllByUserId: jest.fn(),
    countUnreadByUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteAllByUserId: jest.fn(),
    countByUserId: jest.fn(),
    deleteOldest: jest.fn(),
    create: jest.fn(),
    transaction: jest.fn().mockImplementation(async (callback: (tx: undefined) => Promise<unknown>) => callback(undefined)),
  } as unknown as jest.Mocked<NotificationRepository>;

  const baseNotif = {
    id: "n-1",
    userId: "u-1",
    type: NotificationType.INFO,
    text: "hello",
    isRead: false,
    createdAt: new Date(),
    link: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: NotificationRepository, useValue: mockNotifRepo },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("TC-NOTIF-U-001: should return mapped notification DTOs for user", async () => {
      mockNotifRepo.findAllByUserId.mockResolvedValue([baseNotif] as any);

      const result = await service.findAll("u-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("n-1");
      expect(result[0].isRead).toBe(false);
      expect(mockNotifRepo.findAllByUserId).toHaveBeenCalledWith("u-1");
    });

    it("TC-NOTIF-U-002: should return empty array when user has no notifications", async () => {
      mockNotifRepo.findAllByUserId.mockResolvedValue([] as any);

      const result = await service.findAll("u-1");

      expect(result).toHaveLength(0);
    });
  });

  describe("getUnreadCount", () => {
    it("TC-NOTIF-U-003: should return unread count DTO", async () => {
      mockNotifRepo.countUnreadByUserId.mockResolvedValue(7 as any);

      const result = await service.getUnreadCount("u-1");

      expect(result.count).toBe(7);
      expect(mockNotifRepo.countUnreadByUserId).toHaveBeenCalledWith("u-1");
    });
  });

  describe("markAsRead", () => {
    it("TC-NOTIF-U-004: should throw NotFoundException when notification not found", async () => {
      mockNotifRepo.findByIdAndUserId.mockResolvedValue(null as any);

      await expect(service.markAsRead("u-1", "n-999")).rejects.toThrow(NotFoundException);
      expect(mockNotifRepo.markAsRead).not.toHaveBeenCalled();
    });

    it("TC-NOTIF-U-005: should mark notification as read and return DTO", async () => {
      const updated = { ...baseNotif, isRead: true };
      mockNotifRepo.findByIdAndUserId.mockResolvedValue(baseNotif as any);
      mockNotifRepo.markAsRead.mockResolvedValue(updated as any);

      const result = await service.markAsRead("u-1", "n-1");

      expect(result.isRead).toBe(true);
      expect(mockNotifRepo.markAsRead).toHaveBeenCalledWith("u-1", "n-1");
    });
  });

  describe("markAllAsRead", () => {
    it("TC-NOTIF-U-006: should call repo markAllAsRead for user", async () => {
      mockNotifRepo.markAllAsRead.mockResolvedValue(undefined as any);

      await service.markAllAsRead("u-1");

      expect(mockNotifRepo.markAllAsRead).toHaveBeenCalledWith("u-1");
    });
  });

  describe("deleteAll", () => {
    it("TC-NOTIF-U-007: should call repo deleteAllByUserId", async () => {
      mockNotifRepo.deleteAllByUserId.mockResolvedValue(undefined as any);

      await service.deleteAll("u-1");

      expect(mockNotifRepo.deleteAllByUserId).toHaveBeenCalledWith("u-1");
    });
  });

  describe("create", () => {
    it("TC-NOTIF-U-008: should create notification without pruning when under the 50 limit", async () => {
      mockNotifRepo.countByUserId.mockResolvedValue(10 as any);
      mockNotifRepo.create.mockResolvedValue(baseNotif as any);

      const result = await service.create("u-1", NotificationType.INFO, "hello");

      expect(result.id).toBe("n-1");
      expect(mockNotifRepo.deleteOldest).not.toHaveBeenCalled();
      expect(mockNotifRepo.create).toHaveBeenCalledWith("u-1", NotificationType.INFO, "hello", undefined, undefined);
    });

    it("TC-NOTIF-U-009: should delete oldest notification when at limit (50)", async () => {
      mockNotifRepo.countByUserId.mockResolvedValue(50 as any);
      mockNotifRepo.deleteOldest.mockResolvedValue(undefined as any);
      mockNotifRepo.create.mockResolvedValue(baseNotif as any);

      await service.create("u-1", NotificationType.INFO, "hello");

      expect(mockNotifRepo.deleteOldest).toHaveBeenCalledWith("u-1", 1, undefined);
    });

    it("TC-NOTIF-U-010: should pass optional link to repository", async () => {
      mockNotifRepo.countByUserId.mockResolvedValue(0 as any);
      mockNotifRepo.create.mockResolvedValue({ ...baseNotif, link: "/some-link" } as any);

      await service.create("u-1", NotificationType.AUTOMATION, "text", "/some-link");

      expect(mockNotifRepo.create).toHaveBeenCalledWith("u-1", NotificationType.AUTOMATION, "text", "/some-link", undefined);
    });
  });
});
