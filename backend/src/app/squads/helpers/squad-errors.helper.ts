import {
  SQUAD_NAME_TAKEN_MESSAGE,
  SQUAD_NOT_FOUND_MESSAGE,
} from '@app/squads/constants/squads.constants.js';
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
