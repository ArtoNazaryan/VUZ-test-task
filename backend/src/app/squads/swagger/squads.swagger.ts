import {
  CHARACTER_ALREADY_IN_SQUAD_EXAMPLE,
  CHARACTER_NOT_FOUND_EXAMPLE,
  INVALID_SQUAD_ID_EXAMPLE,
  SQUAD_FULL_EXAMPLE,
  SQUAD_NAME_TAKEN_EXAMPLE,
  SQUAD_NOT_FOUND_EXAMPLE,
} from '@app/squads/constants/squads.constants.js';
import { SquadResponseDto } from '@app/squads/dto/squad-response.dto.js';
import { SquadSummaryResponseDto } from '@app/squads/dto/squad-summary-response.dto.js';
import {
  TOO_MANY_REQUESTS_EXAMPLE,
  UNAUTHORIZED_EXAMPLE,
  VALIDATION_ERROR_EXAMPLE,
} from '@infrastructure/common/constants/api-error-examples.constants.js';
import { ApiErrorResponse } from '@infrastructure/common/decorators/api-error-response.decorator.js';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

const squadIdParam = ApiParam({ name: 'id', format: 'uuid' });
const characterIdParam = ApiParam({ name: 'characterId', type: Number, example: 25 });
const squadNotFound = ApiErrorResponse(
  HttpStatus.NOT_FOUND,
  'No squad with this id belongs to you',
  SQUAD_NOT_FOUND_EXAMPLE,
);
const invalidSquadId = ApiErrorResponse(
  HttpStatus.BAD_REQUEST,
  'Invalid squad id',
  INVALID_SQUAD_ID_EXAMPLE,
);
const membersRejected = ApiErrorResponse(
  HttpStatus.UNPROCESSABLE_ENTITY,
  'More than 6 characters, or a character id that does not exist',
  SQUAD_FULL_EXAMPLE,
  CHARACTER_NOT_FOUND_EXAMPLE,
);

export function ApiSquadsController(): ClassDecorator {
  return applyDecorators(
    ApiTags('Squads'),
    ApiBearerAuth(),
    ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Missing, invalid or expired access token',
      UNAUTHORIZED_EXAMPLE,
    ),
    ApiErrorResponse(
      HttpStatus.TOO_MANY_REQUESTS,
      'Rate limit exceeded (100 requests per minute)',
      TOO_MANY_REQUESTS_EXAMPLE,
    ),
  );
}

export function ApiListSquads(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'List your squads' }),
    ApiOkResponse({ type: [SquadSummaryResponseDto] }),
  );
}

export function ApiGetSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Get one of your squads with its characters and stats' }),
    squadIdParam,
    ApiOkResponse({ type: SquadResponseDto }),
    invalidSquadId,
    squadNotFound,
  );
}

export function ApiCreateSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a squad, optionally with up to 6 characters',
      description: 'Characters keep the order given in characterIds.',
    }),
    ApiCreatedResponse({ type: SquadResponseDto }),
    ApiErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Invalid name or character ids',
      VALIDATION_ERROR_EXAMPLE,
    ),
    ApiErrorResponse(
      HttpStatus.CONFLICT,
      'Duplicate squad name or the same character twice',
      SQUAD_NAME_TAKEN_EXAMPLE,
      CHARACTER_ALREADY_IN_SQUAD_EXAMPLE,
    ),
    membersRejected,
  );
}

export function ApiUpdateSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Rename a squad and/or replace its characters',
      description:
        'Omit characterIds to keep the current characters; send [] to remove all of them.',
    }),
    squadIdParam,
    ApiOkResponse({ type: SquadResponseDto }),
    ApiErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Invalid squad id, name or character ids',
      VALIDATION_ERROR_EXAMPLE,
      INVALID_SQUAD_ID_EXAMPLE,
    ),
    ApiErrorResponse(
      HttpStatus.CONFLICT,
      'Duplicate squad name or the same character twice',
      SQUAD_NAME_TAKEN_EXAMPLE,
      CHARACTER_ALREADY_IN_SQUAD_EXAMPLE,
    ),
    membersRejected,
    squadNotFound,
  );
}

export function ApiDeleteSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Delete one of your squads' }),
    squadIdParam,
    ApiNoContentResponse({ description: 'Deleted' }),
    invalidSquadId,
    squadNotFound,
  );
}

export function ApiAddSquadMember(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a character to one of your squads',
      description:
        'Safe under concurrent requests: the squad row is locked, so a squad never exceeds 6 characters.',
    }),
    squadIdParam,
    characterIdParam,
    ApiOkResponse({ type: SquadResponseDto, description: 'The updated squad with new stats' }),
    invalidSquadId,
    ApiErrorResponse(
      HttpStatus.CONFLICT,
      'The character is already in the squad',
      CHARACTER_ALREADY_IN_SQUAD_EXAMPLE,
    ),
    ApiErrorResponse(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'The squad already has 6 characters, or the character does not exist',
      SQUAD_FULL_EXAMPLE,
      CHARACTER_NOT_FOUND_EXAMPLE,
    ),
    squadNotFound,
  );
}

export function ApiRemoveSquadMember(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove a character from one of your squads',
      description: 'Idempotent: removing a character that is not in the squad is not an error.',
    }),
    squadIdParam,
    characterIdParam,
    ApiOkResponse({ type: SquadResponseDto, description: 'The updated squad with new stats' }),
    invalidSquadId,
    squadNotFound,
  );
}
