import { validateEnv } from '@infrastructure/config/env.validation.js';
import { LoggerModule } from '@infrastructure/logger/logger.module.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    LoggerModule,
  ],
})
export class AppModule {}
