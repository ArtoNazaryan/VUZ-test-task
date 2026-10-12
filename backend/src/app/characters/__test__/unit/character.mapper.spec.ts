import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { describe, expect, it } from 'vitest';

describe('toCharacterResponse', () => {
  it('flattens universe, tags and abilities into the API shape', () => {
    expect(toCharacterResponse(makeCharacterRow())).toEqual({
      id: 1,
      name: 'Cassie Cage',
      quote: "Who's a good girl?",
      image: 'https://cdn.test/cassie.png',
      thumbnail: 'https://cdn.test/cassie-thumb.png',
      universe: 'Mortal Kombat',
      tags: [{ name: 'human', slot: 1 }],
      abilities: [
        { name: 'Power', score: 3 },
        { name: 'Mobility', score: 5 },
        { name: 'Technique', score: 7 },
        { name: 'Survivability', score: 6 },
        { name: 'Energy', score: 4 },
      ],
    });
  });

  it('keeps a missing quote and thumbnail as null', () => {
    const response = toCharacterResponse(makeCharacterRow({ quote: null, thumbnail: null }));

    expect(response).toMatchObject({ quote: null, thumbnail: null });
  });

  it('returns an empty tag list for a character without tags', () => {
    expect(toCharacterResponse(makeCharacterRow({ tags: [] })).tags).toEqual([]);
  });
});
