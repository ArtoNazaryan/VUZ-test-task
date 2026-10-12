import {
  CHARACTER_ALREADY_IN_SQUAD_MESSAGE,
  CHARACTER_NOT_FOUND_MESSAGE,
  SQUAD_FULL_MESSAGE,
  SQUAD_NAME_TAKEN_MESSAGE,
  SQUAD_NOT_FOUND_MESSAGE,
} from '@app/squads/constants/squads.constants.js';
import { SquadRuleViolation } from '@app/squads/enums/squad-rule-violation.enum.js';
import type { TSquadRuleViolation } from '@app/squads/types/squad-rules.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { isUniqueViolation } from '@infrastructure/prisma/helpers/prisma-error.helper.js';
import { HttpStatus } from '@nestjs/common';

export function squadNotFoundError(): AppException {
  return new AppException(ErrorCode.NotFound, SQUAD_NOT_FOUND_MESSAGE, HttpStatus.NOT_FOUND);
}

export function toSquadNameConflictError(error: unknown): unknown {
  return isUniqueViolation(error)
    ? new AppException(ErrorCode.SquadNameTaken, SQUAD_NAME_TAKEN_MESSAGE, HttpStatus.CONFLICT)
    : error;
}

export function toSquadRuleError(violation: TSquadRuleViolation): AppException {
  switch (violation.type) {
    case SquadRuleViolation.SquadFull:
      return new AppException(
        ErrorCode.SquadFull,
        SQUAD_FULL_MESSAGE,
        HttpStatus.UNPROCESSABLE_ENTITY,
        { limit: violation.limit, requested: violation.requested },
      );
    case SquadRuleViolation.DuplicateCharacters:
      return new AppException(
        ErrorCode.CharacterAlreadyInSquad,
        CHARACTER_ALREADY_IN_SQUAD_MESSAGE,
        HttpStatus.CONFLICT,
        { characterIds: violation.characterIds },
      );
    case SquadRuleViolation.UnknownCharacters:
      return new AppException(
        ErrorCode.CharacterNotFound,
        CHARACTER_NOT_FOUND_MESSAGE,
        HttpStatus.UNPROCESSABLE_ENTITY,
        { characterIds: violation.characterIds },
      );
  }
}

export function toMemberConflictError(error: unknown, characterId: number): unknown {
  return isUniqueViolation(error)
    ? toSquadRuleError({
        type: SquadRuleViolation.DuplicateCharacters,
        characterIds: [characterId],
      })
    : error;
}
