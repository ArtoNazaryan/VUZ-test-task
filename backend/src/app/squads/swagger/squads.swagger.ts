import { SquadResponseDto } from '@app/squads/dto/squad-response.dto.js';
import { SquadSummaryResponseDto } from '@app/squads/dto/squad-summary-response.dto.js';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

const squadIdParam = ApiParam({ name: 'id', format: 'uuid' });
const notFound = ApiNotFoundResponse({ description: 'No squad with this id belongs to you' });

export function ApiListSquads(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'List your squads' }),
    ApiOkResponse({ type: [SquadSummaryResponseDto] }),
  );
}

export function ApiGetSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Get one of your squads with its characters' }),
    squadIdParam,
    ApiOkResponse({ type: SquadResponseDto }),
    ApiBadRequestResponse({ description: 'The id is not a UUID' }),
    notFound,
  );
}

export function ApiCreateSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Create a squad' }),
    ApiCreatedResponse({ type: SquadResponseDto }),
    ApiBadRequestResponse({ description: 'Invalid name' }),
    ApiConflictResponse({
      description: 'SQUAD_NAME_TAKEN: you already have a squad with this name',
    }),
  );
}

export function ApiUpdateSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Rename one of your squads' }),
    squadIdParam,
    ApiOkResponse({ type: SquadResponseDto }),
    ApiConflictResponse({
      description: 'SQUAD_NAME_TAKEN: you already have a squad with this name',
    }),
    notFound,
  );
}

export function ApiDeleteSquad(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Delete one of your squads' }),
    squadIdParam,
    ApiNoContentResponse({ description: 'Deleted' }),
    notFound,
  );
}
