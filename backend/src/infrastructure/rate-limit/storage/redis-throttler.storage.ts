import type { IRateLimitCounterStore } from '@infrastructure/common/interfaces/rate-limit.interfaces.js';
import type { TThrottlerRecord } from '@infrastructure/common/types/rate-limit.types.js';
import {
  buildRateLimitKey,
  toThrottlerRecord,
} from '@infrastructure/rate-limit/helpers/rate-limit.helper.js';
import { Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';

const ALLOWED_RECORD: TThrottlerRecord = {
  totalHits: 0,
  timeToExpire: 0,
  isBlocked: false,
  timeToBlockExpire: 0,
};

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);

  constructor(private readonly counterStore: IRateLimitCounterStore) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    _blockDuration: number,
    throttlerName: string,
  ): Promise<TThrottlerRecord> {
    try {
      const counter = await this.counterStore.incrementWithExpiry(
        buildRateLimitKey(throttlerName, key),
        ttl,
      );

      return toThrottlerRecord(counter, limit);
    } catch (error) {
      this.logger.warn(
        { err: error, throttlerName },
        '[RedisThrottlerStorage] Rate limit storage unavailable, allowing request',
      );

      return ALLOWED_RECORD;
    }
  }
}
