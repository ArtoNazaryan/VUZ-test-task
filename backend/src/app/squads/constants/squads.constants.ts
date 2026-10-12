import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import type { IApiErrorExample } from '@infrastructure/common/interfaces/error-response.interfaces.js';
import type { SquadSelect } from '@infrastructure/prisma/generated/models.js';

export const SQUAD_NAME_MAX_LENGTH = 50;
export const MAX_SQUAD_SIZE = 6;
export const MAX_CHARACTER_IDS_PER_REQUEST = 50;
export const SQUAD_FULL_MESSAGE = `A squad cannot have more than ${MAX_SQUAD_SIZE} characters`;
export const CHARACTER_ALREADY_IN_SQUAD_MESSAGE =
  'A character cannot appear twice in the same squad';
export const CHARACTER_NOT_FOUND_MESSAGE = 'One or more characters do not exist';
export const SQUAD_NOT_FOUND_MESSAGE = 'Squad not found';
export const SQUAD_NAME_TAKEN_MESSAGE = 'You already have a squad with this name';

export const SQUAD_SUMMARY_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { members: true } },
} satisfies SquadSelect;

export const SQUAD_DETAIL_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  members: {
    select: { characterId: true },
    orderBy: [{ addedAt: 'asc' }, { characterId: 'asc' }],
  },
} satisfies SquadSelect;

export const SQUAD_NOT_FOUND_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.NotFound,
  message: SQUAD_NOT_FOUND_MESSAGE,
};

export const SQUAD_NAME_TAKEN_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.SquadNameTaken,
  message: SQUAD_NAME_TAKEN_MESSAGE,
};

export const SQUAD_FULL_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.SquadFull,
  message: SQUAD_FULL_MESSAGE,
  details: { limit: MAX_SQUAD_SIZE, requested: MAX_SQUAD_SIZE + 1 },
};

export const CHARACTER_ALREADY_IN_SQUAD_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.CharacterAlreadyInSquad,
  message: CHARACTER_ALREADY_IN_SQUAD_MESSAGE,
  details: { characterIds: [25] },
};

export const CHARACTER_NOT_FOUND_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.CharacterNotFound,
  message: CHARACTER_NOT_FOUND_MESSAGE,
  details: { characterIds: [9999] },
};

export const INVALID_SQUAD_ID_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.BadRequest,
  message: 'Validation failed (uuid is expected)',
};
