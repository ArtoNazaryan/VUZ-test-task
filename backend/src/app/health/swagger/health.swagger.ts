import { ApiErrorResponse } from '@infrastructure/common/decorators/api-error-response.decorator.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiHealthCheck(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Check the API and its PostgreSQL and Redis connections',
      description: 'Not rate limited. Used by the Docker health check.',
    }),
    ApiOkResponse({
      description: 'All dependencies are up',
      schema: {
        example: {
          status: 'ok',
          info: { database: { status: 'up' }, redis: { status: 'up' } },
          error: {},
          details: { database: { status: 'up' }, redis: { status: 'up' } },
        },
      },
    }),
    ApiErrorResponse(HttpStatus.SERVICE_UNAVAILABLE, 'PostgreSQL or Redis is down', {
      error: ErrorCode.ServiceUnavailable,
      message: 'One or more dependencies are unavailable',
      details: { database: { status: 'up' }, redis: { status: 'down' } },
    }),
  );
}
