import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ConfigService } from "@nestjs/config";
import type { AppLogger } from "@/common/logger/app-logger.service";
import { MetaTrader5Provider } from "../providers/metatrader5.provider";

const SIDECAR_URL = "http://mt5-sidecar:8000";

const mockLogger: jest.Mocked<AppLogger> = {
  setContext: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as jest.Mocked<AppLogger>;

const makeConfig = (url: string | undefined, token = "test-token") =>
  ({
    get: jest.fn().mockImplementation((key: string) => {
      if (key === "MT5_SIDECAR_URL") return url;
      if (key === "MT5_SIDECAR_TOKEN") return token;
      return undefined;
    }),
  }) as unknown as ConfigService;

const makeJsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: jest.fn<() => Promise<unknown>>().mockResolvedValue(body),
    text: jest.fn<() => Promise<string>>().mockResolvedValue(JSON.stringify(body)),
  }) as unknown as Response;

const makeSidecarTrade = (overrides: Record<string, unknown> = {}) => ({
  sourcePositionId: "100",
  symbol: "EURUSD",
  direction: "BUY",
  entryPrice: 1.1,
  exitPrice: 1.11,
  quantity: 0.1,
  grossPnL: 95,
  fees: -5,
  netPnL: 100,
  openTime: "2024-01-01T00:00:00.000Z",
  closeTime: "2024-01-02T00:00:00.000Z",
  currency: "USD",
  ...overrides,
});

describe("MetaTrader5Provider", () => {
  let provider: MetaTrader5Provider;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch as typeof fetch;
    provider = new MetaTrader5Provider(mockLogger, makeConfig(SIDECAR_URL));
  });

  describe("TC-INT-U-005: validateCredentials", () => {
    it("TC-INT-U-005: should return valid and accountId for correct credentials", async () => {
      mockFetch.mockResolvedValue(makeJsonResponse({ valid: true }));

      const result = await provider.validateCredentials({ login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.valid).toBe(true);
      expect(result.accountId).toBe("12345@ICMarkets-Demo");
      expect(mockFetch).toHaveBeenCalledWith(`${SIDECAR_URL}/validate`, expect.objectContaining({ method: "POST" }));
    });

    it("TC-INT-U-005: should return invalid when sidecar reports failure", async () => {
      mockFetch.mockResolvedValue(makeJsonResponse({ valid: false, error: "Invalid login" }));

      const result = await provider.validateCredentials({ login: "bad", password: "wrong", server: "ICMarkets-Demo" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid login");
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("TC-INT-U-005: should reject when required fields are missing", async () => {
      const result = await provider.validateCredentials({ login: "12345" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("required");
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("TC-INT-U-005: should return error when MT5_SIDECAR_URL is not configured", async () => {
      const unconfigured = new MetaTrader5Provider(mockLogger, makeConfig(undefined));

      const result = await unconfigured.validateCredentials({ login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("MT5_SIDECAR_URL");
    });

    it("TC-INT-U-005: should handle network error gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Connection refused"));

      const result = await provider.validateCredentials({ login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Sidecar error");
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("TC-INT-U-005: should include X-Sidecar-Token header when token is configured", async () => {
      mockFetch.mockResolvedValue(makeJsonResponse({ valid: true }));

      await provider.validateCredentials({ login: "12345", password: "pass", server: "ICMarkets-Demo" });

      const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
      expect((callArgs[1].headers as Record<string, string>)["X-Sidecar-Token"]).toBe("test-token");
    });
  });

  describe("TC-INT-U-006: sync — deal fetching", () => {
    it("TC-INT-U-006: should return trades from sidecar", async () => {
      const trades = [makeSidecarTrade(), makeSidecarTrade({ sourcePositionId: "101" })];
      mockFetch.mockResolvedValue(makeJsonResponse({ trades }));

      const result = await provider.sync("conn-1", { login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.synced).toBe(2);
      expect(result.trades).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledWith(`${SIDECAR_URL}/deals`, expect.objectContaining({ method: "POST" }));
    });

    it("TC-INT-U-006: should handle empty trades list", async () => {
      mockFetch.mockResolvedValue(makeJsonResponse({ trades: [] }));

      const result = await provider.sync("conn-1", { login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.synced).toBe(0);
      expect(result.trades).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("TC-INT-U-006: should handle sidecar HTTP error", async () => {
      mockFetch.mockResolvedValue(makeJsonResponse("Service unavailable", false, 503));

      const result = await provider.sync("conn-1", { login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.synced).toBe(0);
      expect(result.errors[0]).toContain("503");
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it("TC-INT-U-006: should return error when MT5_SIDECAR_URL is not configured", async () => {
      const unconfigured = new MetaTrader5Provider(mockLogger, makeConfig(undefined));

      const result = await unconfigured.sync("conn-1", { login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.synced).toBe(0);
      expect(result.errors[0]).toContain("MT5_SIDECAR_URL");
    });

    it("TC-INT-U-006: should handle network failure gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("timeout"));

      const result = await provider.sync("conn-1", { login: "12345", password: "pass", server: "ICMarkets-Demo" });

      expect(result.synced).toBe(0);
      expect(result.errors[0]).toContain("Sync failed");
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it("TC-INT-U-006: should pass date range in request body", async () => {
      mockFetch.mockResolvedValue(makeJsonResponse({ trades: [] }));

      const startDate = new Date("2024-01-01T00:00:00Z");
      const endDate = new Date("2024-01-31T00:00:00Z");

      await provider.sync("conn-1", { login: "12345", password: "pass", server: "ICMarkets-Demo" }, { startDate, endDate });

      const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(callArgs[1].body as string) as Record<string, unknown>;
      expect(body.from_date).toBe(startDate.toISOString());
      expect(body.to_date).toBe(endDate.toISOString());
    });
  });
});
