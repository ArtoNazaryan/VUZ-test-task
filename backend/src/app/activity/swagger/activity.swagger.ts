import { PickStatsResponseDto } from '@app/activity/dto/pick-stats-response.dto.js';
import { SquadHistoryResponseDto } from '@app/activity/dto/squad-history-response.dto.js';
import {
  INVALID_SQUAD_ID_EXAMPLE,
  SQUAD_NOT_FOUND_EXAMPLE,
} from '@app/squads/constants/squads.constants.js';
import {
  TOO_MANY_REQUESTS_EXAMPLE,
  UNAUTHORIZED_EXAMPLE,
  VALIDATION_ERROR_EXAMPLE,
} from '@infrastructure/common/constants/api-error-examples.constants.js';
import { ApiErrorResponse } from '@infrastructure/common/decorators/api-error-response.decorator.js';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

export function ApiActivityController(): ClassDecorator {
  return applyDecorators(
    ApiTags('Activity'),
    ApiErrorResponse(
      HttpStatus.TOO_MANY_REQUESTS,
      'Rate limit exceeded (100 requests per minute)',
      TOO_MANY_REQUESTS_EXAMPLE,
    ),
  );
}

export function ApiGetSquadHistory(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Timeline of changes to one of your squads',
      description: 'Read from the MongoDB activity log, newest first, with cursor paging.',
    }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiOkResponse({ type: SquadHistoryResponseDto }),
    ApiErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Invalid squad id, limit or cursor',
      INVALID_SQUAD_ID_EXAMPLE,
      VALIDATION_ERROR_EXAMPLE,
    ),
    ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Missing, invalid or expired access token',
      UNAUTHORIZED_EXAMPLE,
    ),
    ApiErrorResponse(
      HttpStatus.NOT_FOUND,
      'No squad with this id belongs to you',
      SQUAD_NOT_FOUND_EXAMPLE,
    ),
  );
}

export function ApiGetPickStats(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Most added characters over the last N days',
      description:
        'A MongoDB aggregation over the activity log: counts "added to a squad" actions in the window, top 10. Cached for 60 seconds.',
    }),
    ApiOkResponse({ type: PickStatsResponseDto }),
    ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid days', VALIDATION_ERROR_EXAMPLE),
  );
}
