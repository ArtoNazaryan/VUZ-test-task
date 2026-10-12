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
