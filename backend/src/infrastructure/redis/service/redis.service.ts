import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IRateLimitCounter } from '@infrastructure/common/interfaces/rate-limit.interfaces.js';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService<TEnv, true>) {
    this.client = new Redis(configService.get('REDIS_URL', { infer: true }), {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    this.client.on('error', (error: Error) => {
      this.logger.warn({ err: error }, '[RedisService] Redis connection error');
    });
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async incrementWithExpiry(key: string, ttlMs: number): Promise<IRateLimitCounter> {
    const results = await this.client.multi().incr(key).pexpire(key, ttlMs, 'NX').pttl(key).exec();
    const count = results?.[0]?.[1];
    const remainingMs = results?.[2]?.[1];

    if (typeof count !== 'number' || typeof remainingMs !== 'number') {
      throw new Error(`[RedisService] Unexpected rate limit result for ${key}`);
    }

    return { count, ttlMs: remainingMs > 0 ? remainingMs : ttlMs };
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'ready') {
      this.client.disconnect();

      return;
    }

    await this.client.quit();
  }
}
