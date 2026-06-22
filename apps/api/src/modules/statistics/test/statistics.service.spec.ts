import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppLogger } from "@/common/logger/app-logger.service";
import { StatisticsService } from "../statistics.service";
import {
  computeActivityCurve,
  computeBreakdowns,
  computeEquityCurve,
  computeGenericBreakdowns,
  computeMetrics,
  computeNumberSummaries,
  computeRatingAverages,
  emptyMetrics,
  filterByDateRange,
  filterGenericByDateRange,
} from "../utils/trading-stats.util";

import { StatisticsRepository } from "../repositories/statistics.repository";

jest.mock("@fixspace/database", () => ({
  prisma: {
    database: { findFirst: jest.fn(), findMany: jest.fn() },
    record: { findMany: jest.fn() },
  },
  PropertyType: {
    SELECT: "SELECT",
    STATUS: "STATUS",
    DATE: "DATE",
    NUMBER: "NUMBER",
    RATING: "RATING",
    FORMULA: "FORMULA",
  },
}));

const mockLogger: jest.Mocked<AppLogger> = {
  setContext: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as jest.Mocked<AppLogger>;

const mockRepository: jest.Mocked<StatisticsRepository> = {
  findTradingJournalDb: jest.fn(),
  findAllDatabases: jest.fn(),
  findRecordsByDatabaseIds: jest.fn(),
  findRecordsByDatabaseId: jest.fn(),
} as unknown as jest.Mocked<StatisticsRepository>;

describe("StatisticsService", () => {
  let service: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: StatisticsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    jest.clearAllMocks();
  });

  describe("getTradingStats — TC-STAT-U-007: no Trading Journal", () => {
    it("TC-STAT-U-001: returns empty stats when no Trading Journal database exists", async () => {
      (mockRepository.findTradingJournalDb as jest.Mock).mockResolvedValue(null);

      const result = await service.getTradingStats("user-1", {});

      expect(result.metrics.totalTrades).toBe(0);
      expect(result.equityCurve).toHaveLength(0);
      expect(result.breakdowns).toHaveLength(0);
    });
  });

  describe("getTradingStats — TC-STAT-U-001: core metrics", () => {
    it("TC-STAT-U-002: computes Win Rate, Profit Factor and Expectancy from records", async () => {
      const properties = [
        { id: "exit-prop", name: "Exit Date", type: "DATE", integrationKey: "exitDate" },
        { id: "pnl-prop", name: "Net P&L", type: "FORMULA", integrationKey: null },
        { id: "outcome-prop", name: "Outcome", type: "SELECT", integrationKey: "outcome" },
      ];

      (mockRepository.findTradingJournalDb as jest.Mock).mockResolvedValue({
        id: "db-1",
        type: "trading-journal",
        properties,
      });

      (mockRepository.findRecordsByDatabaseId as jest.Mock).mockResolvedValue([
        {
          id: "r1",
          values: [
            { propertyId: "exit-prop", value: "2025-01-10T00:00:00Z" },
            { propertyId: "pnl-prop", value: 200 },
            { propertyId: "outcome-prop", value: "Win" },
          ],
        },
        {
          id: "r2",
          values: [
            { propertyId: "exit-prop", value: "2025-01-15T00:00:00Z" },
            { propertyId: "pnl-prop", value: -100 },
            { propertyId: "outcome-prop", value: "Loss" },
          ],
        },
        {
          id: "r3",
          values: [
            { propertyId: "exit-prop", value: "2025-01-20T00:00:00Z" },
            { propertyId: "pnl-prop", value: 300 },
            { propertyId: "outcome-prop", value: "Win" },
          ],
        },
      ]);

      const result = await service.getTradingStats("user-1", {});

      expect(result.metrics.totalTrades).toBe(3);
      expect(result.metrics.winRate).toBeCloseTo(0.6667, 2);
      expect(result.metrics.totalPnl).toBe(400);
      expect(result.metrics.profitFactor).toBeCloseTo(5, 0);
      expect(result.equityCurve).toHaveLength(3);
    });
  });

  describe("getTradingStats — TC-STAT-U-005: date range filter", () => {
    it("TC-STAT-U-003: filters trades by from/to date range using exitDate", async () => {
      const properties = [
        { id: "exit-prop", name: "Exit Date", type: "DATE", integrationKey: "exitDate" },
        { id: "pnl-prop", name: "Net P&L", type: "FORMULA", integrationKey: null },
        { id: "outcome-prop", name: "Outcome", type: "SELECT", integrationKey: "outcome" },
      ];

      (mockRepository.findTradingJournalDb as jest.Mock).mockResolvedValue({ id: "db-1", type: "trading-journal", properties });
      (mockRepository.findRecordsByDatabaseId as jest.Mock).mockResolvedValue([
        {
          id: "r1",
          values: [
            { propertyId: "exit-prop", value: "2025-01-05T00:00:00Z" },
            { propertyId: "pnl-prop", value: 100 },
            { propertyId: "outcome-prop", value: "Win" },
          ],
        },
        {
          id: "r2",
          values: [
            { propertyId: "exit-prop", value: "2025-01-15T00:00:00Z" },
            { propertyId: "pnl-prop", value: 200 },
            { propertyId: "outcome-prop", value: "Win" },
          ],
        },
        {
          id: "r3",
          values: [
            { propertyId: "exit-prop", value: "2025-01-25T00:00:00Z" },
            { propertyId: "pnl-prop", value: 300 },
            { propertyId: "outcome-prop", value: "Win" },
          ],
        },
      ]);

      const result = await service.getTradingStats("user-1", {
        from: "2025-01-10T00:00:00Z",
        to: "2025-01-20T00:00:00Z",
      });

      expect(result.metrics.totalTrades).toBe(1);
      expect(result.metrics.totalPnl).toBe(200);
    });
  });

  describe("getCustomStats", () => {
    it("TC-STAT-U-004: returns empty array when no databases exist", async () => {
      (mockRepository.findAllDatabases as jest.Mock).mockResolvedValue([]);

      const result = await service.getCustomStats("user-1", {});

      expect(result).toHaveLength(0);
    });

    it("TC-STAT-U-005: generates breakdowns for SELECT properties", async () => {
      (mockRepository.findAllDatabases as jest.Mock).mockResolvedValue([
        {
          id: "custom-db",
          name: "Watchlist",
          icon: "📋",
          properties: [{ id: "cat-prop", name: "Category", type: "SELECT" }],
        },
      ]);
      (mockRepository.findRecordsByDatabaseIds as jest.Mock).mockResolvedValue([
        { id: "r1", databaseId: "custom-db", values: [{ propertyId: "cat-prop", value: "A" }] },
        { id: "r2", databaseId: "custom-db", values: [{ propertyId: "cat-prop", value: "B" }] },
        { id: "r3", databaseId: "custom-db", values: [{ propertyId: "cat-prop", value: "A" }] },
      ]);

      const result = await service.getCustomStats("user-1", {});

      expect(result).toHaveLength(1);
      expect(result[0].recordCount).toBe(3);
      expect(result[0].breakdowns).toHaveLength(1);
      const items = result[0].breakdowns[0].items;
      expect(items.find((i) => i.label === "A")?.count).toBe(2);
      expect(items.find((i) => i.label === "B")?.count).toBe(1);
    });
  });
});

describe("computeMetrics — unit", () => {
  it("TC-STAT-U-006: returns zeros for empty trades", () => {
    expect(computeMetrics([])).toEqual(emptyMetrics());
  });

  it("TC-STAT-U-007: computes win rate correctly", () => {
    const trades = [
      { netPnl: 100, outcome: "Win", exitDate: new Date("2025-01-01") },
      { netPnl: -50, outcome: "Loss", exitDate: new Date("2025-01-02") },
      { netPnl: 150, outcome: "Win", exitDate: new Date("2025-01-03") },
      { netPnl: -75, outcome: "Loss", exitDate: new Date("2025-01-04") },
    ];
    const metrics = computeMetrics(trades);
    expect(metrics.winRate).toBe(0.5);
    expect(metrics.totalTrades).toBe(4);
    expect(metrics.totalPnl).toBe(125);
    expect(metrics.grossProfit).toBe(250);
    expect(metrics.grossLoss).toBe(125);
  });

  it("TC-STAT-U-008: profit factor is correct", () => {
    const trades = [
      { netPnl: 300, outcome: "Win", exitDate: new Date("2025-01-01") },
      { netPnl: -100, outcome: "Loss", exitDate: new Date("2025-01-02") },
    ];
    const metrics = computeMetrics(trades);
    expect(metrics.profitFactor).toBe(3);
  });

  it("TC-STAT-U-009: profit factor is 999 when no losses", () => {
    const trades = [{ netPnl: 500, outcome: "Win", exitDate: new Date("2025-01-01") }];
    const metrics = computeMetrics(trades);
    expect(metrics.profitFactor).toBe(999);
  });

  it("TC-STAT-U-010: computes max drawdown", () => {
    const trades = [
      { netPnl: 100, outcome: "Win", exitDate: new Date("2025-01-01") },
      { netPnl: 200, outcome: "Win", exitDate: new Date("2025-01-02") },
      { netPnl: -400, outcome: "Loss", exitDate: new Date("2025-01-03") },
      { netPnl: 50, outcome: "Win", exitDate: new Date("2025-01-04") },
    ];
    const metrics = computeMetrics(trades);
    expect(metrics.maxDrawdown).toBe(400);
  });

  it("TC-STAT-U-011: max drawdown is 0 when all trades are wins", () => {
    const trades = [
      { netPnl: 100, outcome: "Win", exitDate: new Date("2025-01-01") },
      { netPnl: 200, outcome: "Win", exitDate: new Date("2025-01-02") },
    ];
    expect(computeMetrics(trades).maxDrawdown).toBe(0);
  });
});

describe("computeEquityCurve — unit", () => {
  it("TC-STAT-U-012: returns empty array for no trades", () => {
    expect(computeEquityCurve([])).toHaveLength(0);
  });

  it("TC-STAT-U-013: returns cumulative sum sorted by date", () => {
    const trades = [
      { netPnl: 100, outcome: "Win", exitDate: new Date("2025-01-03") },
      { netPnl: -50, outcome: "Loss", exitDate: new Date("2025-01-01") },
      { netPnl: 200, outcome: "Win", exitDate: new Date("2025-01-02") },
    ];
    const curve = computeEquityCurve(trades);
    expect(curve[0].value).toBe(-50);
    expect(curve[1].value).toBe(150);
    expect(curve[2].value).toBe(250);
  });
});

describe("computeBreakdowns — unit", () => {
  it("TC-STAT-U-014: groups records by property value", () => {
    const data = [
      {
        propertyName: "Direction",
        propertyId: "dir",
        records: [
          { value: "Long", netPnl: 100, outcome: "Win" },
          { value: "Short", netPnl: -50, outcome: "Loss" },
          { value: "Long", netPnl: 200, outcome: "Win" },
          { value: "Long", netPnl: -30, outcome: "Loss" },
        ],
      },
    ];
    const result = computeBreakdowns(data);
    expect(result).toHaveLength(1);
    const longItem = result[0].items.find((i) => i.label === "Long");
    const shortItem = result[0].items.find((i) => i.label === "Short");
    expect(longItem?.count).toBe(3);
    expect(shortItem?.count).toBe(1);
    expect(longItem?.winRate).toBeCloseTo(0.6667, 2);
  });

  it("TC-STAT-U-015: null values grouped as em-dash", () => {
    const data = [
      {
        propertyName: "Setup",
        propertyId: "s",
        records: [{ value: null, netPnl: 0, outcome: null }],
      },
    ];
    const result = computeBreakdowns(data);
    expect(result[0].items[0].label).toBe("—");
  });
});

describe("getKeyDatabasesOverview", () => {
  let service: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: StatisticsRepository, useValue: mockRepository },
      ],
    }).compile();
    service = module.get<StatisticsService>(StatisticsService);
    jest.clearAllMocks();
  });

  it("TC-STAT-U-016: returns empty array when no databases exist", async () => {
    (mockRepository.findAllDatabases as jest.Mock).mockResolvedValue([]);

    const result = await service.getKeyDatabasesOverview("user-1", {});

    expect(result).toHaveLength(0);
  });

  it("TC-STAT-U-017: returns one block per database", async () => {
    (mockRepository.findAllDatabases as jest.Mock).mockResolvedValue([
      {
        id: "db-mistakes",
        type: "mistakes",
        name: "Mistakes",
        icon: null,
        properties: [
          { id: "date-p", name: "Date", type: "DATE", integrationKey: null },
          { id: "cat-p", name: "Category", type: "SELECT", integrationKey: null },
        ],
      },
      { id: "db-notes", type: "notes", name: "Notes", icon: null, properties: [] },
    ]);
    (mockRepository.findRecordsByDatabaseIds as jest.Mock).mockResolvedValue([]);

    const result = await service.getKeyDatabasesOverview("user-1", {});

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("mistakes");
    expect(result[1].type).toBe("notes");
  });

  it("TC-STAT-U-018: computes rating averages for RATING properties", async () => {
    (mockRepository.findAllDatabases as jest.Mock).mockResolvedValue([
      {
        id: "db-lib",
        type: "routine-library",
        name: "Library",
        icon: null,
        properties: [{ id: "sleep-p", name: "Sleep Quality", type: "RATING", integrationKey: null }],
      },
    ]);
    (mockRepository.findRecordsByDatabaseIds as jest.Mock).mockResolvedValue([
      { id: "r1", databaseId: "db-lib", values: [{ propertyId: "sleep-p", value: 4 }] },
      { id: "r2", databaseId: "db-lib", values: [{ propertyId: "sleep-p", value: 2 }] },
    ]);

    const result = await service.getKeyDatabasesOverview("user-1", {});

    expect(result[0].ratingAverages).toHaveLength(1);
    expect(result[0].ratingAverages[0].average).toBe(3);
    expect(result[0].ratingAverages[0].count).toBe(2);
  });

  it("TC-STAT-U-019: enriches trading-journal block with tradingKpis", async () => {
    (mockRepository.findAllDatabases as jest.Mock).mockResolvedValue([
      {
        id: "db-tj",
        type: "trading-journal",
        name: "Trading Journal",
        icon: null,
        properties: [
          { id: "exit-p", name: "Exit Date", type: "DATE", integrationKey: "exitDate" },
          { id: "pnl-p", name: "Net P&L", type: "FORMULA", integrationKey: null },
          { id: "out-p", name: "Outcome", type: "SELECT", integrationKey: "outcome" },
        ],
      },
    ]);
    (mockRepository.findRecordsByDatabaseIds as jest.Mock).mockResolvedValue([
      {
        id: "r1",
        databaseId: "db-tj",
        values: [
          { propertyId: "exit-p", value: "2025-01-10T00:00:00Z" },
          { propertyId: "pnl-p", value: 200 },
          { propertyId: "out-p", value: "Win" },
        ],
      },
    ]);

    const result = await service.getKeyDatabasesOverview("user-1", {});

    expect(result[0].tradingKpis).toBeDefined();
    expect(result[0].tradingKpis?.totalTrades).toBe(1);
    expect(result[0].equityCurve).toHaveLength(1);
  });
});

describe("filterByDateRange — unit", () => {
  it("TC-STAT-U-020: includes trades within range", () => {
    const trades = [
      { netPnl: 0, outcome: null, exitDate: new Date("2025-01-05") },
      { netPnl: 0, outcome: null, exitDate: new Date("2025-01-15") },
      { netPnl: 0, outcome: null, exitDate: new Date("2025-01-25") },
    ];
    const filtered = filterByDateRange(trades, "2025-01-10", "2025-01-20");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].exitDate.toISOString().slice(0, 10)).toBe("2025-01-15");
  });

  it("TC-STAT-U-021: returns all trades when no range given", () => {
    const trades = [
      { netPnl: 0, outcome: null, exitDate: new Date("2025-01-01") },
      { netPnl: 0, outcome: null, exitDate: new Date("2025-06-01") },
    ];
    expect(filterByDateRange(trades)).toHaveLength(2);
  });
});

describe("computeActivityCurve — unit", () => {
  it("TC-STAT-U-022: groups records by date", () => {
    const records = [
      { date: new Date("2025-01-01"), ratingValues: [], numberValues: [], selectValues: [] },
      { date: new Date("2025-01-01"), ratingValues: [], numberValues: [], selectValues: [] },
      { date: new Date("2025-01-02"), ratingValues: [], numberValues: [], selectValues: [] },
    ];
    const curve = computeActivityCurve(records);
    expect(curve).toHaveLength(2);
    expect(curve[0].value).toBe(2);
    expect(curve[1].value).toBe(1);
  });

  it("TC-STAT-U-023: skips records with no date", () => {
    const records = [
      { date: null, ratingValues: [], numberValues: [], selectValues: [] },
      { date: new Date("2025-01-01"), ratingValues: [], numberValues: [], selectValues: [] },
    ];
    expect(computeActivityCurve(records)).toHaveLength(1);
  });
});

describe("computeRatingAverages — unit", () => {
  it("TC-STAT-U-024: computes average per RATING property", () => {
    const records = [
      { date: null, ratingValues: [{ propertyId: "p1", value: 4 }], numberValues: [], selectValues: [] },
      { date: null, ratingValues: [{ propertyId: "p1", value: 2 }], numberValues: [], selectValues: [] },
    ];
    const result = computeRatingAverages(records, [{ id: "p1", name: "Sleep Quality" }]);
    expect(result[0].average).toBe(3);
    expect(result[0].count).toBe(2);
  });
});

describe("computeNumberSummaries — unit", () => {
  it("TC-STAT-U-025: sums and averages NUMBER property values", () => {
    const records = [
      { date: null, ratingValues: [], numberValues: [{ propertyId: "p1", value: 100 }], selectValues: [] },
      { date: null, ratingValues: [], numberValues: [{ propertyId: "p1", value: 200 }], selectValues: [] },
    ];
    const result = computeNumberSummaries(records, [{ id: "p1", name: "Amount" }]);
    expect(result[0].sum).toBe(300);
    expect(result[0].average).toBe(150);
  });
});

describe("computeGenericBreakdowns — unit", () => {
  it("TC-STAT-U-008: counts records per select value", () => {
    const records = [
      { date: null, ratingValues: [], numberValues: [], selectValues: [{ propertyId: "p1", value: "A" }] },
      { date: null, ratingValues: [], numberValues: [], selectValues: [{ propertyId: "p1", value: "B" }] },
      { date: null, ratingValues: [], numberValues: [], selectValues: [{ propertyId: "p1", value: "A" }] },
    ];
    const result = computeGenericBreakdowns(records, [{ id: "p1", name: "Category" }]);
    expect(result[0].items.find((i) => i.label === "A")?.count).toBe(2);
    expect(result[0].items.find((i) => i.label === "B")?.count).toBe(1);
  });
});

describe("filterGenericByDateRange — unit", () => {
  it("TC-STAT-U-008: filters generic records by date range", () => {
    const records = [
      { date: new Date("2025-01-05"), ratingValues: [], numberValues: [], selectValues: [] },
      { date: new Date("2025-01-15"), ratingValues: [], numberValues: [], selectValues: [] },
      { date: new Date("2025-01-25"), ratingValues: [], numberValues: [], selectValues: [] },
    ];
    const result = filterGenericByDateRange(records, "2025-01-10", "2025-01-20");
    expect(result).toHaveLength(1);
  });

  it("TC-STAT-U-008: includes records with no date regardless of range", () => {
    const records = [{ date: null, ratingValues: [], numberValues: [], selectValues: [] }];
    expect(filterGenericByDateRange(records, "2025-01-01", "2025-01-31")).toHaveLength(1);
  });
});
