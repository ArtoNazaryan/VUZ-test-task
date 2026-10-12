import { CharacterListResponseDto } from '@app/characters/dto/character-list-response.dto.js';
import { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function ApiListCharacters(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'List characters with search, filters and cursor pagination',
      description:
        'Filters combine with AND; values inside tags or universes combine with OR. Sorted by name, then id.',
    }),
    ApiOkResponse({ type: CharacterListResponseDto }),
    ApiBadRequestResponse({ description: 'Invalid query parameters or cursor' }),
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
    ApiBadRequestResponse({ description: 'The id is not a number' }),
    ApiNotFoundResponse({ description: 'No character with this id' }),
  );
}
