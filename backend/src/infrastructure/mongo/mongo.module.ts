import { MONGO_SERVER_SELECTION_TIMEOUT_MS } from '@infrastructure/common/constants/mongo.constants.js';
import type { TConfigService } from '@infrastructure/common/types/env.types.js';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: TConfigService) => ({
        uri: config.get('MONGO_URL', { infer: true }),
        bufferCommands: false,
        serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
      }),
    }),
  ],
})
export class MongoModule {}
