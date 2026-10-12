import type { SquadSelect } from '@infrastructure/prisma/generated/models.js';

export const SQUAD_NAME_MAX_LENGTH = 50;
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
