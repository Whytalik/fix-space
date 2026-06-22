import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { CacheService } from "../cache.service";

describe("CacheService", () => {
  let service: CacheService;

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  };

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, { provide: "REDIS_CLIENT", useValue: mockRedis }, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    service = module.get<CacheService>(CacheService);
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("TC-CORE-U-001: should return parsed value on cache hit", async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ foo: "bar" }));

      const result = await service.get<{ foo: string }>("key:1");

      expect(result).toEqual({ foo: "bar" });
      expect(mockRedis.get).toHaveBeenCalledWith("key:1");
    });

    it("TC-CORE-U-002: should return null on cache miss", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get("missing:key");

      expect(result).toBeNull();
    });

    it("TC-CORE-U-003: should return null and log error when Redis throws", async () => {
      mockRedis.get.mockRejectedValue(new Error("redis down"));

      const result = await service.get("error:key");

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("set", () => {
    it("TC-CORE-U-004: should call redis.set with serialized value and TTL", async () => {
      mockRedis.set.mockResolvedValue("OK");

      await service.set("key:1", { x: 1 }, 300);

      expect(mockRedis.set).toHaveBeenCalledWith("key:1", JSON.stringify({ x: 1 }), "EX", 300);
    });

    it("TC-CORE-U-005: should not throw and should log error when Redis set fails", async () => {
      mockRedis.set.mockRejectedValue(new Error("redis down"));

      await expect(service.set("key:1", { x: 1 })).resolves.toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("TC-CORE-U-006: should call redis.del with the given key", async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.delete("key:1");

      expect(mockRedis.del).toHaveBeenCalledWith("key:1");
    });
  });

  describe("deletePattern", () => {
    it("TC-CORE-U-007: should delete all keys matching the pattern", async () => {
      mockRedis.keys.mockResolvedValue(["trades:a", "trades:b"]);
      mockRedis.del.mockResolvedValue(2);

      await service.deletePattern("trades:*");

      expect(mockRedis.keys).toHaveBeenCalledWith("trades:*");
      expect(mockRedis.del).toHaveBeenCalledWith("trades:a", "trades:b");
    });

    it("TC-CORE-U-008: should skip del when no keys match pattern", async () => {
      mockRedis.keys.mockResolvedValue([]);

      await service.deletePattern("trades:*");

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it("TC-CORE-U-009: should not throw when Redis throws during deletePattern", async () => {
      mockRedis.keys.mockRejectedValue(new Error("redis down"));

      await expect(service.deletePattern("trades:*")).resolves.toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("generateTradeCacheKey", () => {
    it("TC-CORE-U-009b: should return correctly formatted key", () => {
      const key = service.generateTradeCacheKey("conn-1", "2024-01-01", "2024-01-31");

      expect(key).toBe("trades_cache:conn-1:2024-01-01:2024-01-31");
    });
  });
});
