import { toPublicHealthDetails } from '@app/health/helpers/health-result.helper.js';
import { HEALTH_CHECK_TIMEOUT_MS } from '@infrastructure/common/constants/health.constants.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { RedisService } from '@infrastructure/redis/service/redis.service.js';
import { HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  HealthCheckService,
  HealthIndicatorService,
  type HealthCheckResult,
  type HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    try {
      return await this.healthCheckService.check([
        (): PromiseLike<HealthIndicatorResult> => this.checkDatabase(),
        (): PromiseLike<HealthIndicatorResult> => this.checkRedis(),
      ]);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw new AppException(
          ErrorCode.ServiceUnavailable,
          'One or more dependencies are unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
          toPublicHealthDetails(error.getResponse()),
        );
      }

      throw error;
    }
  }

  private checkDatabase(): PromiseLike<HealthIndicatorResult> {
    return this.healthIndicatorService
      .check('database')
      .attempt(async () => {
        await this.prismaService.$queryRaw`SELECT 1`;
      })
      .withTimeout(HEALTH_CHECK_TIMEOUT_MS);
  }

  private checkRedis(): PromiseLike<HealthIndicatorResult> {
    return this.healthIndicatorService
      .check('redis')
      .attempt(async () => {
        await this.redisService.ping();
      })
      .withTimeout(HEALTH_CHECK_TIMEOUT_MS);
  }
}
