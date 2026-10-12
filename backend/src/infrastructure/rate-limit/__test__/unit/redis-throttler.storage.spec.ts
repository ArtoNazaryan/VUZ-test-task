import { RedisThrottlerStorage } from '@infrastructure/rate-limit/storage/redis-throttler.storage.js';
import { InMemoryRedisService } from '@infrastructure/test/mocks/redis/in-memory-redis.service.js';
import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('RedisThrottlerStorage', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  it('counts hits per key within the window', async () => {
    const storage = new RedisThrottlerStorage(new InMemoryRedisService());

    await storage.increment('client-a', 60_000, 2, 60_000, 'default');
    const second = await storage.increment('client-a', 60_000, 2, 60_000, 'default');

    expect(second).toMatchObject({ totalHits: 2, isBlocked: false });
  });

  it('blocks the request that goes over the limit', async () => {
    const storage = new RedisThrottlerStorage(new InMemoryRedisService());

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await storage.increment('client-a', 60_000, 2, 60_000, 'default');
    }

    await expect(
      storage.increment('client-a', 60_000, 2, 60_000, 'default'),
    ).resolves.toMatchObject({ totalHits: 3, isBlocked: true, timeToBlockExpire: 60 });
  });

  it('keeps separate counters per throttler', async () => {
    const storage = new RedisThrottlerStorage(new InMemoryRedisService());

    await storage.increment('client-a', 60_000, 2, 60_000, 'default');

    await expect(storage.increment('client-a', 60_000, 2, 60_000, 'strict')).resolves.toMatchObject(
      { totalHits: 1 },
    );
  });

  it('allows the request when Redis is unavailable', async () => {
    const storage = new RedisThrottlerStorage({
      incrementWithExpiry: (): Promise<never> => Promise.reject(new Error('Connection is closed.')),
    });

    await expect(storage.increment('client-a', 60_000, 2, 60_000, 'default')).resolves.toEqual({
      totalHits: 0,
      timeToExpire: 0,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
  });
});
