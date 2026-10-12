import { StrictRateLimit } from '@infrastructure/rate-limit/decorators/strict-rate-limit.decorator.js';
import {
  buildRateLimitKey,
  buildThrottlerOptions,
  hasStrictRateLimit,
  toThrottlerRecord,
} from '@infrastructure/rate-limit/helpers/rate-limit.helper.js';
import { RedisThrottlerStorage } from '@infrastructure/rate-limit/storage/redis-throttler.storage.js';
import { InMemoryRedisService } from '@infrastructure/test/mocks/redis/in-memory-redis.service.js';
import type { ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { describe, expect, it } from 'vitest';

class ExampleController {
  @StrictRateLimit()
  login(): string {
    return 'login';
  }

  list(): string {
    return 'list';
  }
}

const contextFor = (handler: () => string): ExecutionContext =>
  new ExecutionContextHost([], ExampleController, handler);

describe('buildRateLimitKey', () => {
  it('prefixes the key with the throttler name', () => {
    expect(buildRateLimitKey('strict', 'abc')).toBe('throttle:strict:abc');
  });
});

describe('toThrottlerRecord', () => {
  it('reports the hits and the seconds left while under the limit', () => {
    expect(toThrottlerRecord({ count: 3, ttlMs: 41_200 }, 10)).toEqual({
      totalHits: 3,
      timeToExpire: 42,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
  });

  it('blocks once the hits exceed the limit until the window ends', () => {
    expect(toThrottlerRecord({ count: 11, ttlMs: 30_000 }, 10)).toEqual({
      totalHits: 11,
      timeToExpire: 30,
      isBlocked: true,
      timeToBlockExpire: 30,
    });
  });

  it('allows a request exactly at the limit', () => {
    expect(toThrottlerRecord({ count: 10, ttlMs: 30_000 }, 10).isBlocked).toBe(false);
  });
});

describe('hasStrictRateLimit', () => {
  it('is true for a handler marked with @StrictRateLimit', () => {
    expect(hasStrictRateLimit(contextFor(ExampleController.prototype.login))).toBe(true);
  });

  it('is false for an unmarked handler', () => {
    expect(hasStrictRateLimit(contextFor(ExampleController.prototype.list))).toBe(false);
  });
});

describe('buildThrottlerOptions', () => {
  const options = buildThrottlerOptions(
    { ttlSeconds: 60, limit: 100, strictLimit: 10 },
    new RedisThrottlerStorage(new InMemoryRedisService()),
  );
  const throttlers = Array.isArray(options) ? options : options.throttlers;

  it('creates a default and a strict throttler with a 60 second window', () => {
    expect(throttlers).toEqual([
      { name: 'default', ttl: 60_000, limit: 100 },
      expect.objectContaining({ name: 'strict', ttl: 60_000, limit: 10 }),
    ]);
  });

  it('applies the strict throttler only to marked handlers', () => {
    const skipIf = throttlers[1]?.skipIf;

    expect(skipIf?.(contextFor(ExampleController.prototype.login))).toBe(false);
    expect(skipIf?.(contextFor(ExampleController.prototype.list))).toBe(true);
  });
});
