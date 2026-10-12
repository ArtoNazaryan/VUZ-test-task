import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { GlobalExceptionFilter } from '@infrastructure/globals/global-exception.filter.js';
import { StrictRateLimit } from '@infrastructure/rate-limit/decorators/strict-rate-limit.decorator.js';
import { buildThrottlerOptions } from '@infrastructure/rate-limit/helpers/rate-limit.helper.js';
import { RedisThrottlerStorage } from '@infrastructure/rate-limit/storage/redis-throttler.storage.js';
import { InMemoryRedisService } from '@infrastructure/test/mocks/redis/in-memory-redis.service.js';
import { Controller, Get, type INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { SkipThrottle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

@Controller('limited')
class LimitedController {
  @Get('normal')
  normal(): string {
    return 'ok';
  }

  @Get('strict')
  @StrictRateLimit()
  strict(): string {
    return 'ok';
  }

  @Get('skipped')
  @SkipThrottle()
  skipped(): string {
    return 'ok';
  }
}

describe('Rate limiting', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot(
          buildThrottlerOptions(
            { ttlSeconds: 60, limit: 3, strictLimit: 2 },
            new RedisThrottlerStorage(new InMemoryRedisService()),
          ),
        ),
      ],
      controllers: [LimitedController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();

    app = moduleRef.createNestApplication<INestApplication<App>>({ logger: false });
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const hit = (path: string): request.Test => request(app.getHttpServer()).get(path);

  it('allows requests up to the limit and reports the remaining quota', async () => {
    const first = await hit('/limited/normal');

    expect(first.status).toBe(200);
    expect(first.headers['x-ratelimit-limit']).toBe('3');
    expect(first.headers['x-ratelimit-remaining']).toBe('2');
  });

  it('returns 429 TOO_MANY_REQUESTS with Retry-After once the limit is exceeded', async () => {
    await hit('/limited/normal');
    await hit('/limited/normal');

    const blocked = await hit('/limited/normal');

    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({
      statusCode: 429,
      error: ErrorCode.TooManyRequests,
      message: 'Too many requests, please try again later',
    });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('applies the stricter limit to routes marked with @StrictRateLimit', async () => {
    expect((await hit('/limited/strict')).status).toBe(200);
    expect((await hit('/limited/strict')).status).toBe(200);
    expect((await hit('/limited/strict')).status).toBe(429);
  });

  it('never limits routes marked with @SkipThrottle', async () => {
    const statuses = await Promise.all(
      Array.from({ length: 6 }, () => hit('/limited/skipped').then((response) => response.status)),
    );

    expect(statuses).toEqual([200, 200, 200, 200, 200, 200]);
  });
});
