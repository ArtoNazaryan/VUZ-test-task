import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import {
  buildAfterCursorCondition,
  buildCharacterWhere,
} from '@app/characters/helpers/character-where.helper.js';
import { describe, expect, it } from 'vitest';

describe('buildCharacterWhere', () => {
  it('returns no conditions when no filters are given', () => {
    expect(buildCharacterWhere({ sort: CharacterSort.NameAsc })).toEqual({ AND: [] });
  });

  it('matches the search text against the name or a tag name, ignoring case', () => {
    expect(buildCharacterWhere({ search: 'sub', sort: CharacterSort.NameAsc })).toEqual({
      AND: [
        {
          OR: [
            { name: { contains: 'sub', mode: 'insensitive' } },
            { tags: { some: { tag: { name: { contains: 'sub', mode: 'insensitive' } } } } },
          ],
        },
      ],
    });
  });

  it('combines tags, universes and the cursor as separate AND conditions', () => {
    const where = buildCharacterWhere({
      tags: ['ninja', 'robot'],
      universes: ['Mortal Kombat'],
      sort: CharacterSort.NameAsc,
      after: { name: 'Jade', id: 7, sort: CharacterSort.NameAsc },
    });

    expect(where).toEqual({
      AND: [
        { tags: { some: { tag: { name: { in: ['ninja', 'robot'] } } } } },
        { universe: { name: { in: ['Mortal Kombat'] } } },
        { OR: [{ name: { gt: 'Jade' } }, { name: 'Jade', id: { gt: 7 } }] },
      ],
    });
  });

  it('ignores empty tag and universe lists', () => {
    expect(buildCharacterWhere({ tags: [], universes: [], sort: CharacterSort.NameAsc })).toEqual({
      AND: [],
    });
  });
});

describe('buildAfterCursorCondition', () => {
  it('continues after the cursor when sorting ascending', () => {
    expect(buildAfterCursorCondition({ name: 'Jade', id: 7, sort: CharacterSort.NameAsc })).toEqual(
      {
        OR: [{ name: { gt: 'Jade' } }, { name: 'Jade', id: { gt: 7 } }],
      },
    );
  });

  it('continues before the cursor when sorting descending', () => {
    expect(
      buildAfterCursorCondition({ name: 'Jade', id: 7, sort: CharacterSort.NameDesc }),
    ).toEqual({
      OR: [{ name: { lt: 'Jade' } }, { name: 'Jade', id: { lt: 7 } }],
    });
  });
});
