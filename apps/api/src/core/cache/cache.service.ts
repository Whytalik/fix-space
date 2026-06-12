import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { AppLogger } from "@/common/logger/app-logger.service";

@Injectable()
export class CacheService {
  constructor(
    @Inject("REDIS_CLIENT") private readonly redis: Redis,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CacheService.name);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Cache get failed for key: ${key}`, { error });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 900): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await this.redis.set(key, data, "EX", ttlSeconds);
    } catch (error) {
      this.logger.error(`Cache set failed for key: ${key}`, { error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete failed for key: ${key}`, { error });
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache deletePattern failed for pattern: ${pattern}`, { error });
    }
  }

  generateTradeCacheKey(connectionId: string, startDate: string, endDate: string): string {
    return `trades_cache:${connectionId}:${startDate}:${endDate}`;
  }
}
