import { buildPinoConfig } from '@infrastructure/logger/config/pino.config.js';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildPinoConfig,
    }),
  ],
})
export class LoggerModule {}
