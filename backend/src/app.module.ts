import { CharactersModule } from '@app/characters/characters.module.js';
import { HealthModule } from '@app/health/health.module.js';
import { validateEnv } from '@infrastructure/config/env.validation.js';
import { LoggerModule } from '@infrastructure/logger/logger.module.js';
import { PrismaModule } from '@infrastructure/prisma/prisma.module.js';
import { RedisModule } from '@infrastructure/redis/redis.module.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    LoggerModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    CharactersModule,
  ],
})
export class AppModule {}
