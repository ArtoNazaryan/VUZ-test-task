import { validateEnv } from '@infrastructure/config/env.validation.js';
import { LoggerModule } from '@infrastructure/logger/logger.module.js';
import { PrismaModule } from '@infrastructure/prisma/prisma.module.js';
import { CharacterSeedService } from '@infrastructure/seed/services/character-seed.service.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    LoggerModule,
    PrismaModule,
  ],
  providers: [CharacterSeedService],
})
export class SeedModule {}
