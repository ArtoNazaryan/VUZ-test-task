import { API_PREFIX } from '@infrastructure/common/constants/api.constants.js';
import { GlobalExceptionFilter } from '@infrastructure/globals/global-exception.filter.js';
import { buildGlobalValidationPipe } from '@infrastructure/globals/global-validation.pipe.js';
import { RedisService } from '@infrastructure/redis/service/redis.service.js';
import { InMemoryRedisService } from '@infrastructure/test/mocks/redis/in-memory-redis.service.js';
import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModuleBuilder } from '@nestjs/testing';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../../app.module.js';

export async function createIntegrationApp(
  customize: (builder: TestingModuleBuilder) => TestingModuleBuilder = (builder) => builder,
): Promise<INestApplication<App>> {
  const builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(RedisService)
    .useValue(new InMemoryRedisService());
  const moduleRef = await customize(builder).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({ logger: false });

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(buildGlobalValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.init();

  return app;
}
