import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { SyncRecordService } from "../sync-record.service";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { RecordRepository } from "@/modules/record/repositories/record.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    DbNull: null,
    InputJsonValue: undefined,
  },
  prisma: {
    record: { create: jest.fn() },
    propertyValue: { create: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),

    database: { findFirst: jest.fn() },
    property: { findMany: jest.fn() },
  },
}));

import { prisma } from "@fixspace/database";
import type { TradeData } from "../providers/integration.provider";

describe("SyncRecordService", () => {
  let service: SyncRecordService;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockDatabaseRepo: jest.Mocked<Pick<DatabaseRepository, "findByTypeInSpace">> = {
    findByTypeInSpace: jest.fn(),
  };

  const mockPropertyRepo: jest.Mocked<Pick<PropertyRepository, "findManyByDatabase">> = {
    findManyByDatabase: jest.fn(),
  };

  const mockRecordRepo: jest.Mocked<Pick<RecordRepository, "findBySourceIntegration">> = {
    findBySourceIntegration: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncRecordService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
        { provide: RecordRepository, useValue: mockRecordRepo },
      ],
    }).compile();

    service = module.get<SyncRecordService>(SyncRecordService);
    jest.clearAllMocks();
  });

  const sampleTrade = (overrides: Partial<TradeData> = {}): TradeData => ({
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
    ...overrides,
  });

  describe("TC-INT-U-002: dedup by sourcePositionId", () => {
    it("TC-INT-U-002: should skip trades that already exist in the database", async () => {
      mockDatabaseRepo.findByTypeInSpace.mockResolvedValue({ id: "db-1" } as never);
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([]);
      mockRecordRepo.findBySourceIntegration.mockResolvedValue([{ sourcePositionId: "pos-1" }, { sourcePositionId: "pos-2" }] as never);
      (prisma.record.create as jest.Mock).mockResolvedValueOnce({ id: "rec-3" });

      const trades = [sampleTrade(), sampleTrade({ sourcePositionId: "pos-2" }), sampleTrade({ sourcePositionId: "pos-3" })];

      const result = await service.persistTrades("user-1", "conn-1", "Binance", trades, "space-1");

      expect(result.created).toBe(1);
      expect(result.skipped).toBe(2);
      expect(prisma.record.create).toHaveBeenCalledTimes(1);
      expect(prisma.record.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ sourcePositionId: "pos-3" }),
        }),
      );
    });

    it("TC-INT-U-002: should skip all when every trade already exists", async () => {
      mockDatabaseRepo.findByTypeInSpace.mockResolvedValue({ id: "db-1" } as never);
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([]);
      mockRecordRepo.findBySourceIntegration.mockResolvedValue([{ sourcePositionId: "pos-1" }] as never);

      const trades = [sampleTrade()];
      const result = await service.persistTrades("user-1", "conn-1", "Binance", trades, "space-1");

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(1);
      expect(prisma.record.create).not.toHaveBeenCalled();
    });
  });

  describe("TC-INT-U-007: transaction rollback on error", () => {
    it("TC-INT-U-007: should catch error and return created=0 when transaction fails", async () => {
      mockDatabaseRepo.findByTypeInSpace.mockResolvedValue({ id: "db-1" } as never);
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([]);
      mockRecordRepo.findBySourceIntegration.mockResolvedValue([]);
      (prisma.$transaction as jest.Mock).mockRejectedValueOnce(new Error("DB failure"));

      const trades = [sampleTrade()];
      const result = await service.persistTrades("user-1", "conn-1", "Binance", trades, "space-1");

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(1);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("empty and edge cases", () => {
    it("should return { created: 0, skipped: 0 } for empty trades array", async () => {
      const result = await service.persistTrades("user-1", "conn-1", "Binance", [], "space-1");

      expect(result).toEqual(expect.objectContaining({ created: 0, skipped: 0 }));
      expect(mockDatabaseRepo.findByTypeInSpace).not.toHaveBeenCalled();
    });

    it("should warn and skip all when no Trading Journal DB exists", async () => {
      mockDatabaseRepo.findByTypeInSpace.mockResolvedValue(null);

      const trades = [sampleTrade()];
      const result = await service.persistTrades("user-1", "conn-1", "Binance", trades, "space-1");

      expect(result).toEqual(expect.objectContaining({ created: 0, skipped: 1, noJournal: true }));
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(prisma.record.create).not.toHaveBeenCalled();
    });
  });

  describe("property mapping by position", () => {
    it("should map properties by position and create property values", async () => {
      mockDatabaseRepo.findByTypeInSpace.mockResolvedValue({ id: "db-1" } as never);
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([
        { id: "prop-pair", position: 2, integrationKey: "pair" },
        { id: "prop-dir", position: 3, integrationKey: "direction" },
        { id: "prop-qty", position: 6, integrationKey: "quantity" },
      ] as never);
      mockRecordRepo.findBySourceIntegration.mockResolvedValue([] as never);

      (prisma.record.create as jest.Mock).mockResolvedValueOnce({ id: "rec-1" });
      (prisma.propertyValue.create as jest.Mock).mockResolvedValue({});

      const trades = [sampleTrade()];
      const result = await service.persistTrades("user-1", "conn-1", "Binance", trades, "space-1");

      expect(result.created).toBe(1);
      expect(prisma.record.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sourcePositionId: "pos-1",
            name: "BTCUSDT Long",
            sourceCurrency: "USDT",
          }),
        }),
      );
      expect(prisma.propertyValue.create).toHaveBeenCalledTimes(3);
      expect(prisma.propertyValue.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ propertyId: "prop-pair", value: "BTCUSDT" }) }),
      );
      expect(prisma.propertyValue.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ propertyId: "prop-dir", value: "Long" }) }),
      );
      expect(prisma.propertyValue.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ propertyId: "prop-qty", value: 0.1 }) }),
      );
    });

    it("should map SELL direction to Short", async () => {
      mockDatabaseRepo.findByTypeInSpace.mockResolvedValue({ id: "db-1" } as never);
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([{ id: "prop-dir", position: 3, integrationKey: "direction" }] as never);
      mockRecordRepo.findBySourceIntegration.mockResolvedValue([] as never);
      (prisma.record.create as jest.Mock).mockResolvedValueOnce({ id: "rec-2" });
      (prisma.propertyValue.create as jest.Mock).mockResolvedValue({});

      const trade = sampleTrade({ direction: "SELL" });
      await service.persistTrades("user-1", "conn-1", "Binance", [trade], "space-1");

      expect(prisma.record.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: "BTCUSDT Short" }) }),
      );
      expect(prisma.propertyValue.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ propertyId: "prop-dir", value: "Short" }) }),
      );
    });

    it("should compute outcome based on netPnL", async () => {
      mockDatabaseRepo.findByTypeInSpace.mockResolvedValue({ id: "db-1" } as never);
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([{ id: "prop-outcome", position: 36, integrationKey: "outcome" }] as never);
      mockRecordRepo.findBySourceIntegration.mockResolvedValue([] as never);
      (prisma.record.create as jest.Mock)
        .mockResolvedValueOnce({ id: "rec-w" })
        .mockResolvedValueOnce({ id: "rec-l" })
        .mockResolvedValueOnce({ id: "rec-b" });
      (prisma.propertyValue.create as jest.Mock).mockResolvedValue({});

      await service.persistTrades(
        "user-1",
        "conn-1",
        "Binance",
        [
          sampleTrade({ netPnL: 100 }),
          sampleTrade({ sourcePositionId: "pos-2", netPnL: -50 }),
          sampleTrade({ sourcePositionId: "pos-3", netPnL: 0 }),
        ],
        "space-1",
      );

      const calls = (prisma.propertyValue.create as jest.Mock).mock.calls;
      const values = calls.map(([arg]) => (arg as { data: { value: unknown } }).data.value);
      expect(values).toContain("Win");
      expect(values).toContain("Loss");
      expect(values).toContain("Breakeven");
    });
  });
});
