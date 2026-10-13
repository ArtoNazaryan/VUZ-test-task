import { ActivityModule } from '@app/activity/activity.module.js';
import { AuthModule } from '@app/auth/auth.module.js';
import { CharactersModule } from '@app/characters/characters.module.js';
import { HealthModule } from '@app/health/health.module.js';
import { PopularityModule } from '@app/popularity/popularity.module.js';
import { RealtimeModule } from '@app/realtime/realtime.module.js';
import { SquadsModule } from '@app/squads/squads.module.js';
import { CacheModule } from '@infrastructure/cache/cache.module.js';
import { validateEnv } from '@infrastructure/config/env.validation.js';
import { LoggerModule } from '@infrastructure/logger/logger.module.js';
import { MongoModule } from '@infrastructure/mongo/mongo.module.js';
import { RateLimitModule } from '@infrastructure/rate-limit/rate-limit.module.js';
import { PrismaModule } from '@infrastructure/prisma/prisma.module.js';
import { RedisModule } from '@infrastructure/redis/redis.module.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    LoggerModule,
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    MongoModule,
    CacheModule,
    RateLimitModule,
    HealthModule,
    CharactersModule,
    AuthModule,
    SquadsModule,
    RealtimeModule,
    PopularityModule,
    ActivityModule,
  ],
})
export class AppModule {}
