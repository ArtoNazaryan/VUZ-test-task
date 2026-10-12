import type { TThrottlerRecord } from '@infrastructure/common/types/rate-limit.types.js';
import type {
  IRateLimitCounter,
  IRateLimitSettings,
} from '@infrastructure/common/interfaces/rate-limit.interfaces.js';
import {
  DEFAULT_THROTTLER,
  RATE_LIMIT_KEY_PREFIX,
  STRICT_RATE_LIMIT_KEY,
  STRICT_THROTTLER,
  TOO_MANY_REQUESTS_MESSAGE,
} from '@infrastructure/rate-limit/constants/rate-limit.constants.js';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';

const MILLISECONDS_PER_SECOND = 1000;
const reflector = new Reflector();

export function buildRateLimitKey(throttlerName: string, key: string): string {
  return `${RATE_LIMIT_KEY_PREFIX}:${throttlerName}:${key}`;
}

export function toThrottlerRecord(counter: IRateLimitCounter, limit: number): TThrottlerRecord {
  const secondsLeft = Math.ceil(counter.ttlMs / MILLISECONDS_PER_SECOND);
  const isBlocked = counter.count > limit;

  return {
    totalHits: counter.count,
    timeToExpire: secondsLeft,
    isBlocked,
    timeToBlockExpire: isBlocked ? secondsLeft : 0,
  };
}

export function hasStrictRateLimit(context: ExecutionContext): boolean {
  return reflector.get<boolean | undefined>(STRICT_RATE_LIMIT_KEY, context.getHandler()) === true;
}

export function buildThrottlerOptions(
  settings: IRateLimitSettings,
  storage: ThrottlerStorage,
): ThrottlerModuleOptions {
  const ttl = settings.ttlSeconds * MILLISECONDS_PER_SECOND;

  return {
    throttlers: [
      { name: DEFAULT_THROTTLER, ttl, limit: settings.limit },
      {
        name: STRICT_THROTTLER,
        ttl,
        limit: settings.strictLimit,
        skipIf: (context: ExecutionContext): boolean => !hasStrictRateLimit(context),
      },
    ],
    storage,
    errorMessage: TOO_MANY_REQUESTS_MESSAGE,
  };
}
