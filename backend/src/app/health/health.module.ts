import { HealthController } from '@app/health/controllers/health.controller.js';
import { HealthService } from '@app/health/services/health.service.js';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
