import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { AppLogger } from "@/common/logger/app-logger.service";
import { BinanceProvider } from "../providers/binance.provider";
import type { BinanceTradeFill } from "../providers/binance.provider";

jest.mock("binance", () => {
  const mockGetApiKeyPermissions = jest.fn();
  const mockGetAccountInformation = jest.fn();
  const mockGetAccountTrades = jest.fn();
  const mockGetExchangeInfo = jest.fn();
  const mockGetUsdmAccountInformation = jest.fn();
  const mockGetIncomeHistory = jest.fn();
  const mockGetAllOrders = jest.fn();

  const MainClient = jest.fn().mockImplementation(() => ({
    getApiKeyPermissions: mockGetApiKeyPermissions,
    getAccountInformation: mockGetAccountInformation,
  }));

  const USDMClient = jest.fn().mockImplementation(() => ({
    getAccountTrades: mockGetAccountTrades,
    getExchangeInfo: mockGetExchangeInfo,
    getAccountInformation: mockGetUsdmAccountInformation,
    getIncomeHistory: mockGetIncomeHistory,
    getAllOrders: mockGetAllOrders,
  }));

  return {
    MainClient,
    USDMClient,
    __mockGetApiKeyPermissions: mockGetApiKeyPermissions,
    __mockGetAccountInformation: mockGetAccountInformation,
    __mockGetAccountTrades: mockGetAccountTrades,
    __mockGetExchangeInfo: mockGetExchangeInfo,
    __mockGetUsdmAccountInformation: mockGetUsdmAccountInformation,
    __mockGetIncomeHistory: mockGetIncomeHistory,
    __mockGetAllOrders: mockGetAllOrders,
  };
});

const mockGetApiKeyPermissions = (jest.requireMock("binance") as Record<string, unknown>).__mockGetApiKeyPermissions as jest.Mock;
const mockGetAccountInformation = (jest.requireMock("binance") as Record<string, unknown>).__mockGetAccountInformation as jest.Mock;
const mockGetAccountTrades = (jest.requireMock("binance") as Record<string, unknown>).__mockGetAccountTrades as jest.Mock;
const mockGetUsdmAccountInformation = (jest.requireMock("binance") as Record<string, unknown>).__mockGetUsdmAccountInformation as jest.Mock;
const mockGetIncomeHistory = (jest.requireMock("binance") as Record<string, unknown>).__mockGetIncomeHistory as jest.Mock;
const mockGetAllOrders = (jest.requireMock("binance") as Record<string, unknown>).__mockGetAllOrders as jest.Mock;

describe("BinanceProvider", () => {
  let provider: BinanceProvider;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new BinanceProvider(mockLogger);

    mockGetUsdmAccountInformation.mockResolvedValue({ positions: [] });
    mockGetIncomeHistory.mockResolvedValue([]);
    mockGetAllOrders.mockResolvedValue([]);
  });

  describe("TC-INT-U-004: validateCredentials — read-only API key check", () => {
    it("TC-INT-U-004: should accept keys with only read permissions", async () => {
      mockGetApiKeyPermissions.mockResolvedValue({
        enableReading: true,
        enableWithdrawals: false,
      });
      mockGetAccountInformation.mockResolvedValue({ accoountType: "SPOT" });

      const result = await provider.validateCredentials({ apiKey: "key-1", apiSecret: "secret-1" });

      expect(result.valid).toBe(true);
      expect(result.accountId).toBe("SPOT - SPOT");
    });

    it("TC-INT-U-004: should reject keys with withdrawals enabled", async () => {
      mockGetApiKeyPermissions.mockResolvedValue({
        enableReading: true,
        enableWithdrawals: true,
      });

      const result = await provider.validateCredentials({ apiKey: "key-2", apiSecret: "secret-2" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("read-only");
    });

    it("TC-INT-U-004: should reject keys with trading enabled (enableReading=false)", async () => {
      mockGetApiKeyPermissions.mockResolvedValue({
        enableReading: false,
        enableWithdrawals: false,
      });

      const result = await provider.validateCredentials({ apiKey: "key-3", apiSecret: "secret-3" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("read-only");
    });

    it("TC-INT-U-004: should reject missing apiKey or apiSecret", async () => {
      const resultMissingKey = await provider.validateCredentials({ apiSecret: "secret" });
      expect(resultMissingKey.valid).toBe(false);
      expect(resultMissingKey.error).toContain("required");

      const resultMissingSecret = await provider.validateCredentials({ apiKey: "key" });
      expect(resultMissingSecret.valid).toBe(false);
      expect(resultMissingSecret.error).toContain("required");
    });

    it("TC-INT-U-004: should handle API error gracefully", async () => {
      mockGetApiKeyPermissions.mockRejectedValue(new Error("Network error"));

      const result = await provider.validateCredentials({ apiKey: "bad-key", apiSecret: "bad-secret" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid credentials");
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe("sync — trade aggregation", () => {
    const makeFill = (overrides: Partial<BinanceTradeFill> = {}): BinanceTradeFill => ({
      symbol: "BTCUSDT",
      id: 1,
      orderId: 100,
      price: "60000",
      qty: "0.1",
      commission: "0.1",
      commissionAsset: "USDT",
      time: 1700000000000,
      buyer: true,
      maker: true,
      positionSide: "BOTH",
      realizedPnl: "50",
      ...overrides,
    });

    it("should aggregate fills into paired positions", async () => {
      mockGetUsdmAccountInformation.mockResolvedValue({ positions: [{ symbol: "BTCUSDT", positionAmt: "0.1", unrealizedProfit: "0" }] });
      mockGetAccountTrades.mockResolvedValue([
        makeFill({ orderId: 100, buyer: true, time: 1700000000000, price: "60000", qty: "0.1", commission: "0.5", realizedPnl: "0" }),
        makeFill({ orderId: 101, buyer: false, time: 1700000100000, price: "61000", qty: "0.1", commission: "0.5", realizedPnl: "100" }),
      ]);

      const now = new Date();
      const result = await provider.sync(
        "conn-1",
        { apiKey: "key", apiSecret: "secret" },
        {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          endDate: now,
        },
      );

      expect(result.synced).toBe(1);
      expect(result.trades).toHaveLength(1);
      expect(result.trades![0]).toMatchObject({
        sourcePositionId: "BTCUSDT-100-101",
        symbol: "BTCUSDT",
        direction: "BUY",
        entryPrice: 60000,
        exitPrice: 61000,
        quantity: 0.1,
        netPnL: 100,
      });
    });

    it("should handle unpaired orders as single trades", async () => {
      mockGetUsdmAccountInformation.mockResolvedValue({ positions: [{ symbol: "BTCUSDT", positionAmt: "0.1", unrealizedProfit: "0" }] });
      mockGetAccountTrades.mockResolvedValue([
        makeFill({ orderId: 200, buyer: true, time: 1700000000000, price: "60000", qty: "0.1", commission: "0.1", realizedPnl: "0" }),
      ]);

      const now = new Date();
      const result = await provider.sync(
        "conn-1",
        { apiKey: "key", apiSecret: "secret" },
        {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          endDate: now,
        },
      );

      expect(result.synced).toBe(1);
      expect(result.trades).toHaveLength(1);
      expect(result.trades![0].sourcePositionId).toBe("200");
    });

    it("should handle hedge mode by splitting LONG and SHORT", async () => {
      mockGetUsdmAccountInformation.mockResolvedValue({ positions: [{ symbol: "BTCUSDT", positionAmt: "0.2", unrealizedProfit: "0" }] });
      mockGetAccountTrades.mockResolvedValue([
        makeFill({
          orderId: 300,
          buyer: true,
          positionSide: "LONG",
          time: 1700000000000,
          price: "60000",
          qty: "0.1",
          commission: "0.1",
          realizedPnl: "0",
        }),
        makeFill({
          orderId: 301,
          buyer: false,
          positionSide: "LONG",
          time: 1700000100000,
          price: "61000",
          qty: "0.1",
          commission: "0.1",
          realizedPnl: "100",
        }),
        makeFill({
          orderId: 302,
          buyer: false,
          positionSide: "SHORT",
          time: 1700000200000,
          price: "62000",
          qty: "0.2",
          commission: "0.1",
          realizedPnl: "0",
        }),
        makeFill({
          orderId: 303,
          buyer: true,
          positionSide: "SHORT",
          time: 1700000300000,
          price: "61000",
          qty: "0.2",
          commission: "0.1",
          realizedPnl: "200",
        }),
      ]);

      const now = new Date();
      const result = await provider.sync(
        "conn-1",
        { apiKey: "key", apiSecret: "secret" },
        {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          endDate: now,
        },
      );

      expect(result.synced).toBe(2);
      const longTrade = result.trades!.find((t) => t.sourcePositionId.includes("300-301"));
      const shortTrade = result.trades!.find((t) => t.sourcePositionId.includes("302-303"));
      expect(longTrade).toBeDefined();
      expect(shortTrade).toBeDefined();
      expect(longTrade!.direction).toBe("BUY");
      expect(shortTrade!.direction).toBe("SELL");
    });
  });
});
