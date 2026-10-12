import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
