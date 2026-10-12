import { HealthService } from '@app/health/services/health.service.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { RedisService } from '@infrastructure/redis/service/redis.service.js';
import { prismaServiceMock } from '@infrastructure/test/mocks/prisma/prisma.service.mock.js';
import { redisServiceMock } from '@infrastructure/test/mocks/redis/redis.service.mock.js';
import { ServiceUnavailableException } from '@nestjs/common';
import {
  HealthCheckService,
  HealthIndicatorService,
  type HealthCheckResult,
} from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('HealthService', () => {
  let service: HealthService;
  const healthCheckService = {
    check: vi.fn<() => Promise<HealthCheckResult>>(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: HealthIndicatorService, useValue: {} },
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: RedisService, useValue: redisServiceMock },
      ],
    }).compile();

    service = moduleRef.get(HealthService);
  });

  it('returns the health result when every dependency is up', async () => {
    const result: HealthCheckResult = {
      status: 'ok',
      info: { database: { status: 'up' }, redis: { status: 'up' } },
      error: {},
      details: { database: { status: 'up' }, redis: { status: 'up' } },
    };
    healthCheckService.check.mockResolvedValue(result);

    await expect(service.check()).resolves.toEqual(result);
  });

  it('throws SERVICE_UNAVAILABLE with the check details when a dependency is down', async () => {
    const details = { status: 'error', error: { redis: { status: 'down' } } };
    healthCheckService.check.mockRejectedValue(new ServiceUnavailableException(details));

    await expect(service.check()).rejects.toMatchObject({
      code: ErrorCode.ServiceUnavailable,
      details,
    });
  });

  it('rethrows unexpected errors unchanged', async () => {
    const unexpected = new Error('unexpected');
    healthCheckService.check.mockRejectedValue(unexpected);

    await expect(service.check()).rejects.toBe(unexpected);
  });
});
