import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse } from '@nestjs/swagger';

export function ApiHealthCheck(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Check the API and its PostgreSQL and Redis connections' }),
    ApiOkResponse({ description: 'All dependencies are up' }),
    ApiServiceUnavailableResponse({ description: 'PostgreSQL or Redis is down' }),
  );
}
