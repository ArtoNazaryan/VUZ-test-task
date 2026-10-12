import { API_PREFIX } from '@infrastructure/constants/common/api.constants.js';
import { GlobalExceptionFilter } from '@infrastructure/globals/global-exception.filter.js';
import { buildGlobalValidationPipe } from '@infrastructure/globals/global-validation.pipe.js';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../../app.module.js';

export async function createIntegrationApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({ logger: false });

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(buildGlobalValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.init();

  return app;
}
