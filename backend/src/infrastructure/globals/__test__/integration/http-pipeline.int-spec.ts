import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('HTTP pipeline', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createIntegrationApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the standard error body for an unknown route', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: ErrorCode.NotFound,
      message: 'Cannot GET /api/v1/does-not-exist',
      requestId: expect.any(String),
    });
  });

  it('echoes a client supplied request id in the header and the error body', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/does-not-exist')
      .set('x-request-id', 'trace-abc-123');

    expect(response.headers['x-request-id']).toBe('trace-abc-123');
    expect(response.body).toMatchObject({ requestId: 'trace-abc-123' });
  });

  it('generates a request id when the client does not send one', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/does-not-exist');

    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
