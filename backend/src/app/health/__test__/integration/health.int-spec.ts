import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { prismaServiceMock } from '@infrastructure/test/mocks/prisma/prisma.service.mock.js';
import { redisServiceMock } from '@infrastructure/test/mocks/redis/redis.service.mock.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('GET /api/v1/health', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createIntegrationApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    prismaServiceMock.$queryRaw.mockResolvedValue([{ result: 1 }]);
    redisServiceMock.ping.mockResolvedValue('PONG');
  });

  it('returns 200 with both dependencies up', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      details: { database: { status: 'up' }, redis: { status: 'up' } },
    });
  });

  it('returns 503 SERVICE_UNAVAILABLE when Redis is down', async () => {
    redisServiceMock.ping.mockRejectedValue(new Error('Connection is closed.'));

    const response = await request(app.getHttpServer()).get('/api/v1/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      statusCode: 503,
      error: ErrorCode.ServiceUnavailable,
      details: { error: { redis: { status: 'down' } } },
    });
  });

  it('returns 503 SERVICE_UNAVAILABLE when the database is down', async () => {
    prismaServiceMock.$queryRaw.mockRejectedValue(new Error('connect ECONNREFUSED'));

    const response = await request(app.getHttpServer()).get('/api/v1/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      details: { error: { database: { status: 'down' } } },
    });
  });
});
