import { PopularityResponseDto } from '@app/popularity/dto/popularity-response.dto.js';
import { TOO_MANY_REQUESTS_EXAMPLE } from '@infrastructure/common/constants/api-error-examples.constants.js';
import { ApiErrorResponse } from '@infrastructure/common/decorators/api-error-response.decorator.js';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

export function ApiPopularityController(): ClassDecorator {
  return applyDecorators(
    ApiTags('Popularity'),
    ApiErrorResponse(
      HttpStatus.TOO_MANY_REQUESTS,
      'Rate limit exceeded (100 requests per minute)',
      TOO_MANY_REQUESTS_EXAMPLE,
    ),
  );
}

export function ApiGetPopularity(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Most picked characters right now',
      description:
        'How many squads currently contain each character, top 10. Updates are also pushed over WebSocket as popularity:updated.',
    }),
    ApiOkResponse({ type: PopularityResponseDto }),
  );
}
