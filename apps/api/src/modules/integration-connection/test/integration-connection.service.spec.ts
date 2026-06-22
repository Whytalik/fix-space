import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { AppLogger } from "@/common/logger/app-logger.service";
import { IntegrationConnectionService } from "../integration-connection.service";
import { IntegrationConnectionRepository } from "../repositories/integration-connection.repository";
import { IntegrationProviderFactory } from "../providers/provider.factory";
import { SyncRecordService } from "../sync-record.service";
import { NotificationService } from "@/modules/notification/notification.service";
import { CacheService } from "@/core/cache/cache.service";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import { RecordService } from "@/modules/record/record.service";
import { InitializeUserSpaceUseCase } from "@/modules/space/providers/initialize-user-space.usecase";
import { IntegrationService, SERVICE_LIMITS } from "@fixspace/domain";

jest.mock("@fixspace/database", () => {
  const mockPrisma = {
    space: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  return {
    prisma: mockPrisma,
    IntegrationStatus: { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE", ERROR: "ERROR" },
    NotificationType: { INTEGRATION: "INTEGRATION" },
    Prisma: { JsonNull: null },
  };
});

import { I18nService } from "nestjs-i18n";
import { prisma } from "@fixspace/database";
import type { SyncResult, TradeData } from "../providers/integration.provider";
import type { CreateIntegrationConnectionDto } from "@fixspace/domain";
import type { MT5WebhookDto } from "../dto/mt5-webhook.dto";
import * as credentialsUtil from "../utils/credentials.util";

describe("IntegrationConnectionService", () => {
  let service: IntegrationConnectionService;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockRepo: jest.Mocked<
    Pick<
      IntegrationConnectionRepository,
      "findAllByUser" | "findByOwner" | "findById" | "countBySpaceAndService" | "create" | "update" | "delete"
    >
  > = {
    findAllByUser: jest.fn(),
    findByOwner: jest.fn(),
    findById: jest.fn(),
    countBySpaceAndService: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockProviderFactory: jest.Mocked<Pick<IntegrationProviderFactory, "get">> = {
    get: jest.fn(),
  };

  const mockSyncRecordService: jest.Mocked<Pick<SyncRecordService, "persistTrades" | "annotateExisting" | "findJournalDatabaseId">> = {
    persistTrades: jest.fn(),
    annotateExisting: jest.fn(),
    findJournalDatabaseId: jest.fn(),
  };

  const mockNotificationService: jest.Mocked<Pick<NotificationService, "create">> = {
    create: jest.fn(),
  };

  const mockCacheService: jest.Mocked<Pick<CacheService, "get" | "set" | "deletePattern" | "generateTradeCacheKey">> = {
    get: jest.fn(),
    set: jest.fn(),
    deletePattern: jest.fn(),
    generateTradeCacheKey: jest.fn(),
  };

  const mockRecordRepo: jest.Mocked<Pick<RecordRepository, "findManyWithValuesBySourceIntegration">> = {
    findManyWithValuesBySourceIntegration: jest.fn(),
  };

  const mockRecordService: jest.Mocked<Pick<RecordService, "applyTemplate">> = {
    applyTemplate: jest.fn(),
  };

  const mockInitSpace: jest.Mocked<Pick<InitializeUserSpaceUseCase, "initialize">> = {
    initialize: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn((key: string) => key),
  };

  const mockConnection = (overrides: Record<string, unknown> = {}) => ({
    id: "conn-1",
    userId: "user-1",
    spaceId: "space-1",
    service: IntegrationService.BINANCE,
    name: "My Binance",
    credentials: { iv: "iv", tag: "tag", data: "data" },
    status: "ACTIVE",
    syncInterval: 5,
    marketType: "USDT",
    externalAccountId: null,
    lastSyncAt: null,
    lastSyncError: null,
    consecutiveFailures: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    space: { id: "space-1", name: "My Space" },
    ...overrides,
  });

  const sampleCredentials = { apiKey: "key", apiSecret: "secret" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationConnectionService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: IntegrationConnectionRepository, useValue: mockRepo },
        { provide: IntegrationProviderFactory, useValue: mockProviderFactory },
        { provide: SyncRecordService, useValue: mockSyncRecordService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: RecordRepository, useValue: mockRecordRepo },
        { provide: RecordService, useValue: mockRecordService },
        { provide: InitializeUserSpaceUseCase, useValue: mockInitSpace },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<IntegrationConnectionService>(IntegrationConnectionService);
    jest.clearAllMocks();
  });

  describe("TC-INT-U-050: findAll — list connections for user", () => {
    it("should return all connections for the authenticated user", async () => {
      mockRepo.findAllByUser.mockResolvedValue([mockConnection()] as never);

      const result = await service.findAll("user-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toBeDefined();
      expect(mockRepo.findAllByUser).toHaveBeenCalledWith("user-1");
    });

    it("should return empty array when user has no connections", async () => {
      mockRepo.findAllByUser.mockResolvedValue([] as never);

      const result = await service.findAll("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("TC-INT-U-052: findOne — get single connection", () => {
    it("should return connection when user is the owner", async () => {
      mockRepo.findByOwner.mockResolvedValue(mockConnection() as never);

      const result = await service.findOne("conn-1", "user-1");

      expect(result).toBeDefined();
      expect(mockRepo.findByOwner).toHaveBeenCalledWith("conn-1", "user-1");
    });

    it("should throw NotFoundException when connection does not exist", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(service.findOne("conn-1", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when user is not the owner", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(service.findOne("conn-1", "user-2")).rejects.toThrow(NotFoundException);
    });
  });

  describe("TC-INT-U-053: create — new integration connection", () => {
    const dto: CreateIntegrationConnectionDto = {
      service: IntegrationService.BINANCE,
      name: "My Binance",
      spaceId: "space-1",
      credentials: sampleCredentials,
      syncInterval: 5,
      marketType: "USDT",
    };

    it("should create connection successfully", async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue({ id: "space-1", ownerId: "user-1" });
      mockRepo.countBySpaceAndService.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(mockConnection() as never);
      const mockProvider = { validateCredentials: jest.fn().mockResolvedValue({ valid: true, accountId: "acc-1" }) };
      mockProviderFactory.get.mockReturnValue(mockProvider);

      const result = await service.create("user-1", dto);

      expect(result).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", service: IntegrationService.BINANCE, name: "My Binance" }),
      );
      expect(mockNotificationService.create).toHaveBeenCalled();
    });

    it("should throw NotFoundException when space does not exist", async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.create("user-1", dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when space belongs to another user", async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.create("user-1", dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe("TC-INT-U-055: create — limit enforcement", () => {
    it("should throw BadRequestException when connection limit is reached for the service", async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue({ id: "space-1", ownerId: "user-1" });
      const limit = SERVICE_LIMITS[IntegrationService.BINANCE];
      mockRepo.countBySpaceAndService.mockResolvedValue(limit);

      const dto: CreateIntegrationConnectionDto = {
        service: IntegrationService.BINANCE,
        name: "My Binance",
        spaceId: "space-1",
        credentials: sampleCredentials,
      };

      await expect(service.create("user-1", dto)).rejects.toThrow(BadRequestException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("TC-INT-U-054: create — MT5 connection generates apiToken", () => {
    it("should generate crypto-secure apiToken for MT5 connections", async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue({ id: "space-1", ownerId: "user-1" });
      mockRepo.countBySpaceAndService.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(mockConnection({ service: IntegrationService.METATRADER5 }) as never);

      const dto: CreateIntegrationConnectionDto = {
        service: IntegrationService.METATRADER5,
        name: "My MT5",
        spaceId: "space-1",
      };

      const result = await service.create("user-1", dto);

      expect(result).toBeDefined();
      expect((mockRepo.create as jest.Mock).mock.calls[0][0].credentials.data).toBeDefined();
    });
  });

  describe("TC-INT-U-056: update — modify connection", () => {
    it("should update connection successfully", async () => {
      mockRepo.findByOwner.mockResolvedValue(mockConnection() as never);
      (prisma.space.findFirst as jest.Mock).mockResolvedValue({ id: "space-1", ownerId: "user-1" });
      mockRepo.countBySpaceAndService.mockResolvedValue(0);
      mockRepo.update.mockResolvedValue(mockConnection({ name: "Updated" }) as never);

      const result = await service.update("conn-1", "user-1", { name: "Updated" });

      expect(result).toBeDefined();
      expect(mockRepo.update).toHaveBeenCalled();
      expect(mockCacheService.deletePattern).toHaveBeenCalledWith("trades_cache:conn-1:*");
    });

    it("should throw NotFoundException when connection does not exist", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(service.update("conn-1", "user-1", { name: "Updated" })).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("TC-INT-U-057: update — reject space change when limit reached", () => {
    it("should throw BadRequestException when new space has reached limit", async () => {
      mockRepo.findByOwner.mockResolvedValue(mockConnection({ spaceId: "space-1" }) as never);
      (prisma.space.findFirst as jest.Mock).mockResolvedValue({ id: "space-2", ownerId: "user-1" });
      const limit = SERVICE_LIMITS[IntegrationService.BINANCE];
      mockRepo.countBySpaceAndService.mockResolvedValue(limit);

      await expect(service.update("conn-1", "user-1", { spaceId: "space-2" })).rejects.toThrow(BadRequestException);
    });
  });

  describe("TC-INT-U-058: delete — remove connection", () => {
    it("should delete connection successfully", async () => {
      mockRepo.findByOwner.mockResolvedValue(mockConnection() as never);
      mockRepo.delete.mockResolvedValue(undefined as never);

      await service.delete("conn-1", "user-1");

      expect(mockRepo.delete).toHaveBeenCalledWith("conn-1");
      expect(mockCacheService.deletePattern).toHaveBeenCalledWith("trades_cache:conn-1:*");
    });
  });

  describe("TC-INT-U-059: delete — not found", () => {
    it("should throw NotFoundException when connection does not exist", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(service.delete("conn-1", "user-1")).rejects.toThrow(NotFoundException);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when user is not the owner", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(service.delete("conn-1", "user-2")).rejects.toThrow(NotFoundException);
    });
  });

  describe("TC-INT-U-060: triggerSync — manual sync", () => {
    it("should execute sync and persist trades", async () => {
      jest.spyOn(credentialsUtil, "decryptCredentials").mockReturnValue({ apiKey: "key", apiSecret: "secret" });
      mockRepo.findByOwner.mockResolvedValue(mockConnection() as never);
      const mockProvider = {
        sync: jest.fn().mockResolvedValue({
          synced: 2,
          skipped: 0,
          errors: [],
          trades: [
            {
              sourcePositionId: "pos-1",
              symbol: "BTCUSDT",
              direction: "BUY",
              entryPrice: 60000,
              exitPrice: 61000,
              quantity: 0.1,
              grossPnL: 150,
              fees: 10,
              netPnL: 100,
              openTime: "2025-01-01T00:00:00Z",
              closeTime: "2025-01-02T00:00:00Z",
              currency: "USDT",
            },
          ],
          source: "binance",
        } as SyncResult),
      };
      mockProviderFactory.get.mockReturnValue(mockProvider);
      mockSyncRecordService.persistTrades.mockResolvedValue({
        created: 1,
        skipped: 0,
        createdRecordIds: ["rec-1"],
        missingProperties: [],
        noJournal: false,
        skippedIds: [],
      });
      mockSyncRecordService.findJournalDatabaseId.mockResolvedValue("db-1");

      const result = await service.triggerSync("conn-1", "user-1");

      expect(result.synced).toBe(2);
      expect(mockRepo.findByOwner).toHaveBeenCalledWith("conn-1", "user-1");
      expect(mockProvider.sync).toHaveBeenCalled();
    });

    it("should throw NotFoundException when connection does not exist", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(service.triggerSync("conn-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("TC-INT-U-064: handleMT5Webhook — process webhook", () => {
    it("should process valid MT5 webhook payload", async () => {
      const connection = mockConnection({
        service: IntegrationService.METATRADER5,
        credentials: { iv: "000000000000000000000000", tag: "00000000000000000000000000000000", data: "encrypted" },
      });
      mockRepo.findById.mockResolvedValue(connection as never);
      jest.spyOn(credentialsUtil, "decryptCredentials").mockReturnValue({ apiToken: "valid-token" });
      mockSyncRecordService.persistTrades.mockResolvedValue({
        created: 2,
        skipped: 0,
        createdRecordIds: ["rec-1", "rec-2"],
        missingProperties: [],
        noJournal: false,
        skippedIds: [],
      });

      const dto: MT5WebhookDto = {
        connectionId: "conn-1",
        trades: [
          {
            sourcePositionId: "pos-1",
            symbol: "EURUSD",
            direction: "BUY",
            entryPrice: 1.1,
            exitPrice: 1.12,
            quantity: 1000,
            grossPnL: 20,
            fees: 1,
            netPnL: 19,
            openTime: "2025-01-01T00:00:00Z",
            closeTime: "2025-01-02T00:00:00Z",
            currency: "USD",
          },
        ],
      };

      const result = await service.handleMT5Webhook("valid-token", dto);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(mockRepo.findById).toHaveBeenCalledWith("conn-1");
    });

    it("should throw UnprocessableEntityException for invalid connection ID", async () => {
      mockRepo.findById.mockResolvedValue(null as never);

      const dto: MT5WebhookDto = {
        connectionId: "invalid",
        trades: [],
      };

      await expect(service.handleMT5Webhook("token", dto)).rejects.toThrow(UnprocessableEntityException);
    });

    it("should throw UnprocessableEntityException for invalid token", async () => {
      const connection = mockConnection({
        service: IntegrationService.METATRADER5,
      });
      mockRepo.findById.mockResolvedValue(connection as never);
      jest.spyOn(credentialsUtil, "decryptCredentials").mockReturnValue({ apiToken: "real-token" });

      const dto: MT5WebhookDto = {
        connectionId: "conn-1",
        trades: [],
      };

      await expect(service.handleMT5Webhook("wrong-token", dto)).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe("TC-INT-U-062: previewTrades — preview trades", () => {
    it("should return cached trades when available", async () => {
      mockRepo.findByOwner.mockResolvedValue(mockConnection() as never);
      mockCacheService.generateTradeCacheKey.mockReturnValue("trades_cache:conn-1:start:end");
      mockCacheService.get.mockResolvedValue([
        {
          sourcePositionId: "pos-1",
          symbol: "BTCUSDT",
          direction: "BUY",
          entryPrice: 60000,
          exitPrice: 61000,
          quantity: 0.1,
          grossPnL: 150,
          fees: 10,
          netPnL: 100,
          openTime: "2025-01-01T00:00:00Z",
          closeTime: "2025-01-02T00:00:00Z",
          currency: "USDT",
        },
      ] as TradeData[]);
      mockSyncRecordService.annotateExisting.mockResolvedValue([
        {
          sourcePositionId: "pos-1",
          symbol: "BTCUSDT",
          direction: "BUY",
          entryPrice: 60000,
          exitPrice: 61000,
          quantity: 0.1,
          grossPnL: 150,
          fees: 10,
          netPnL: 100,
          openTime: "2025-01-01T00:00:00Z",
          closeTime: "2025-01-02T00:00:00Z",
          currency: "USDT",
          alreadyImported: false,
        } as never,
      ]);
      mockSyncRecordService.findJournalDatabaseId.mockResolvedValue("db-1");

      const result = await service.previewTrades("conn-1", "user-1", {
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-03T00:00:00Z",
      });

      expect(result.trades).toHaveLength(1);
      expect(result.journalDatabaseId).toBe("db-1");
    });

    it("should throw NotFoundException when connection does not exist", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(
        service.previewTrades("conn-1", "user-1", { startDate: "2025-01-01T00:00:00Z", endDate: "2025-01-03T00:00:00Z" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("TC-INT-U-065: importTrades — import selected trades", () => {
    it("should import selected trades into journal", async () => {
      mockRepo.findByOwner.mockResolvedValue(mockConnection() as never);
      mockCacheService.generateTradeCacheKey.mockReturnValue("trades_cache:conn-1:start:end");
      mockCacheService.get.mockResolvedValue([
        {
          sourcePositionId: "pos-1",
          symbol: "BTCUSDT",
          direction: "BUY",
          entryPrice: 60000,
          exitPrice: 61000,
          quantity: 0.1,
          grossPnL: 150,
          fees: 10,
          netPnL: 100,
          openTime: "2025-01-01T00:00:00Z",
          closeTime: "2025-01-02T00:00:00Z",
          currency: "USDT",
        },
        {
          sourcePositionId: "pos-2",
          symbol: "ETHUSDT",
          direction: "SELL",
          entryPrice: 3000,
          exitPrice: 2900,
          quantity: 1,
          grossPnL: -100,
          fees: 5,
          netPnL: -105,
          openTime: "2025-01-01T00:00:00Z",
          closeTime: "2025-01-02T00:00:00Z",
          currency: "USDT",
        },
      ] as TradeData[]);
      mockSyncRecordService.persistTrades.mockResolvedValue({
        created: 1,
        skipped: 0,
        createdRecordIds: ["rec-1"],
        missingProperties: [],
        noJournal: false,
        skippedIds: [],
      });

      const result = await service.importTrades("conn-1", "user-1", {
        sourcePositionIds: ["pos-1"],
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-03T00:00:00Z",
      });

      expect(result.created).toBe(1);
      expect(result.skipped).toBe(0);
    });

    it("should throw NotFoundException when connection does not exist", async () => {
      mockRepo.findByOwner.mockResolvedValue(null as never);

      await expect(
        service.importTrades("conn-1", "user-1", {
          sourcePositionIds: ["pos-1"],
          startDate: "2025-01-01T00:00:00Z",
          endDate: "2025-01-03T00:00:00Z",
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
