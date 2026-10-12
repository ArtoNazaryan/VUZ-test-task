import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { buildThrottlerOptions } from '@infrastructure/rate-limit/helpers/rate-limit.helper.js';
import { RedisThrottlerStorage } from '@infrastructure/rate-limit/storage/redis-throttler.storage.js';
import { RedisService } from '@infrastructure/redis/service/redis.service.js';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, type ThrottlerModuleOptions } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService, RedisService],
      useFactory: (
        configService: ConfigService<TEnv, true>,
        redisService: RedisService,
      ): ThrottlerModuleOptions =>
        buildThrottlerOptions(
          {
            ttlSeconds: configService.get('THROTTLE_TTL_SECONDS', { infer: true }),
            limit: configService.get('THROTTLE_LIMIT', { infer: true }),
            strictLimit: configService.get('AUTH_THROTTLE_LIMIT', { infer: true }),
          },
          new RedisThrottlerStorage(redisService),
        ),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
