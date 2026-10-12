import { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import { CharacterListResponseDto } from '@app/characters/dto/character-list-response.dto.js';
import { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { TOO_MANY_REQUESTS_EXAMPLE } from '@infrastructure/common/constants/api-error-examples.constants.js';
import { ApiErrorResponse } from '@infrastructure/common/decorators/api-error-response.decorator.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

export function ApiCharactersController(): ClassDecorator {
  return applyDecorators(
    ApiTags('Characters'),
    ApiErrorResponse(
      HttpStatus.TOO_MANY_REQUESTS,
      'Rate limit exceeded (100 requests per minute)',
      TOO_MANY_REQUESTS_EXAMPLE,
    ),
  );
}

export function ApiListCharacters(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'List characters with search, filters and cursor pagination',
      description:
        'Filters combine with AND; values inside tags or universes combine with OR. Sorted by name, then id. Responses are cached in Redis.',
    }),
    ApiOkResponse({ type: CharacterListResponseDto }),
    ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid query parameters or cursor', {
      error: ErrorCode.ValidationError,
      message: 'Request validation failed',
      details: [{ field: 'limit', messages: ['limit must not be greater than 50'] }],
    }),
  );
}

export function ApiGetCharacterFilters(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'List the available filter values (universes, tags, abilities)' }),
    ApiOkResponse({ type: CharacterFiltersResponseDto }),
  );
}

export function ApiGetCharacter(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Get a single character with full details' }),
    ApiParam({ name: 'id', type: Number, example: 1 }),
    ApiOkResponse({ type: CharacterResponseDto }),
    ApiErrorResponse(HttpStatus.BAD_REQUEST, 'The id is not a number', {
      error: ErrorCode.BadRequest,
      message: 'Validation failed (numeric string is expected)',
    }),
    ApiErrorResponse(HttpStatus.NOT_FOUND, 'No character with this id', {
      error: ErrorCode.NotFound,
      message: 'Character with id 9999 was not found',
    }),
  );
}
