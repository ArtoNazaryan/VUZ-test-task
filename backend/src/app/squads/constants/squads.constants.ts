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
