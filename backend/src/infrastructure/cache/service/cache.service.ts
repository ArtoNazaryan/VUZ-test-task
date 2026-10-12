import {
  buildVersionedKey,
  buildVersionKey,
  parseVersion,
} from '@infrastructure/cache/helpers/cache-key.helper.js';
import { RedisService } from '@infrastructure/redis/service/redis.service.js';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async getOrSetVersioned<T>(
    namespace: string,
    suffix: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const version = await this.readVersion(namespace);

    if (version === null) {
      return load();
    }

    const key = buildVersionedKey(namespace, version, suffix);
    const cached = await this.readValue(key);

    if (cached !== null) {
      return JSON.parse(cached) as T;
    }

    const value = await load();

    await this.writeValue(key, JSON.stringify(value), ttlSeconds);

    return value;
  }

  async bumpVersion(namespace: string): Promise<number | null> {
    try {
      return await this.redisService.incr(buildVersionKey(namespace));
    } catch (error) {
      this.logger.warn({ err: error, namespace }, '[CacheService] Could not bump cache version');

      return null;
    }
  }

  private async readVersion(namespace: string): Promise<number | null> {
    try {
      return parseVersion(await this.redisService.get(buildVersionKey(namespace)));
    } catch (error) {
      this.logger.warn(
        { err: error, namespace },
        '[CacheService] Cache unavailable, reading from source',
      );

      return null;
    }
  }

  private async readValue(key: string): Promise<string | null> {
    try {
      return await this.redisService.get(key);
    } catch (error) {
      this.logger.warn({ err: error, key }, '[CacheService] Cache read failed');

      return null;
    }
  }

  private async writeValue(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redisService.set(key, value, ttlSeconds);
    } catch (error) {
      this.logger.warn({ err: error, key }, '[CacheService] Cache write failed');
    }
  }
}
