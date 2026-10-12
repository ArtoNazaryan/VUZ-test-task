import { HealthService } from '@app/health/services/health.service.js';
import { ApiHealthCheck } from '@app/health/swagger/health.swagger.js';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { HealthCheckResult } from '@nestjs/terminus';

@SkipThrottle()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiHealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
