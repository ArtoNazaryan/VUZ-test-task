import { RedisService } from '@infrastructure/redis/service/redis.service.js';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
