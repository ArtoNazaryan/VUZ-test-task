import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface IOperation {
  route: string;
  responses: Record<string, { content?: Record<string, { schema?: { $ref?: string } }> }>;
  security?: Record<string, string[]>[];
}

const HTTP_METHODS = ['get', 'post', 'patch', 'put', 'delete'];
const ERROR_SCHEMA = '#/components/schemas/ErrorResponseDto';

function listOperations(document: OpenAPIObject): IOperation[] {
  return Object.entries(document.paths).flatMap(([path, pathItem]) =>
    Object.entries(pathItem)
      .filter(([method]) => HTTP_METHODS.includes(method))
      .map(([method, operation]: [string, Omit<IOperation, 'route'>]) => ({
        route: `${method.toUpperCase()} ${path}`,
        responses: operation.responses,
        security: operation.security,
      })),
  );
}

describe('API documentation', () => {
  let app: INestApplication<App>;
  let operations: IOperation[];

  beforeAll(async () => {
    app = await createIntegrationApp();
    operations = listOperations(
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder().addBearerAuth().addCookieAuth('refresh_token').build(),
      ),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('documents every route of the API', () => {
    expect(operations.map((operation) => operation.route).sort()).toEqual([
      'DELETE /api/v1/squads/{id}',
      'DELETE /api/v1/squads/{id}/characters/{characterId}',
      'GET /api/v1/auth/me',
      'GET /api/v1/characters',
      'GET /api/v1/characters/filters',
      'GET /api/v1/characters/{id}',
      'GET /api/v1/health',
      'GET /api/v1/popularity',
      'GET /api/v1/squads',
      'GET /api/v1/squads/{id}',
      'PATCH /api/v1/squads/{id}',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/logout',
      'POST /api/v1/auth/refresh',
      'POST /api/v1/auth/register',
      'POST /api/v1/squads',
      'POST /api/v1/squads/{id}/characters/{characterId}',
    ]);
  });

  it('documents a success response for every route', () => {
    const withoutSuccess = operations
      .filter(
        (operation) => !Object.keys(operation.responses).some((status) => status.startsWith('2')),
      )
      .map((operation) => operation.route);

    expect(withoutSuccess).toEqual([]);
  });

  it('documents every error response with the shared ErrorResponseDto shape', () => {
    const wrongShape = operations.flatMap((operation) =>
      Object.entries(operation.responses)
        .filter(([status]) => Number(status) >= 400)
        .filter(
          ([, response]) => response.content?.['application/json']?.schema?.$ref !== ERROR_SCHEMA,
        )
        .map(([status]) => `${operation.route} ${status}`),
    );

    expect(wrongShape).toEqual([]);
  });

  it('marks every squad route and the profile route as requiring a bearer token', () => {
    const unprotected = operations
      .filter(
        (operation) =>
          operation.route.includes('/squads') || operation.route === 'GET /api/v1/auth/me',
      )
      .filter((operation) => !operation.security?.some((scheme) => 'bearer' in scheme))
      .map((operation) => operation.route);

    expect(unprotected).toEqual([]);
  });

  it('documents the rate limit on every route except the health check', () => {
    const withoutRateLimit = operations
      .filter((operation) => operation.route !== 'GET /api/v1/health')
      .filter((operation) => !('429' in operation.responses))
      .map((operation) => operation.route);

    expect(withoutRateLimit).toEqual([]);
  });
});
