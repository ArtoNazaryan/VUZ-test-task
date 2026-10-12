import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import type {
  ICharacterCursor,
  ICharacterListFilters,
} from '@app/characters/interfaces/character-list.interfaces.js';
import type { CharacterWhereInput } from '@infrastructure/prisma/generated/models.js';

export function buildAfterCursorCondition(cursor: ICharacterCursor): CharacterWhereInput {
  if (cursor.sort === CharacterSort.NameDesc) {
    return {
      OR: [{ name: { lt: cursor.name } }, { name: cursor.name, id: { lt: cursor.id } }],
    };
  }

  return {
    OR: [{ name: { gt: cursor.name } }, { name: cursor.name, id: { gt: cursor.id } }],
  };
}

export function buildCharacterWhere(filters: ICharacterListFilters): CharacterWhereInput {
  const conditions: CharacterWhereInput[] = [];

  if (filters.search) {
    conditions.push({
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: filters.search, mode: 'insensitive' } } } } },
      ],
    });
  }

  if (filters.tags?.length) {
    conditions.push({ tags: { some: { tag: { name: { in: filters.tags } } } } });
  }

  if (filters.universes?.length) {
    conditions.push({ universe: { name: { in: filters.universes } } });
  }

  if (filters.after) {
    conditions.push(buildAfterCursorCondition(filters.after));
  }

  return { AND: conditions };
}
