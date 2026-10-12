import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService<TEnv, true>) {
    this.client = new Redis(configService.get('REDIS_URL', { infer: true }), {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    this.client.on('error', (error: Error) => {
      this.logger.warn({ err: error }, '[RedisService] Redis connection error');
    });
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'ready') {
      this.client.disconnect();

      return;
    }

    await this.client.quit();
  }
}
