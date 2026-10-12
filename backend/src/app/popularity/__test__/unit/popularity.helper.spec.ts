import { buildPopularitySnapshot } from '@app/popularity/helpers/popularity.helper.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { describe, expect, it } from 'vitest';

const updatedAt = new Date('2026-10-12T20:00:00.000Z');
const scorpion = toCharacterResponse(makeCharacterRow({ id: 12, name: 'Scorpion' }));
const ryu = toCharacterResponse(makeCharacterRow({ id: 30, name: 'Ryu' }));

describe('buildPopularitySnapshot', () => {
  it('pairs each pick count with its character, keeping the ranking order', () => {
    const snapshot = buildPopularitySnapshot(
      [
        { characterId: 30, pickCount: 5 },
        { characterId: 12, pickCount: 2 },
      ],
      [scorpion, ryu],
      updatedAt,
    );

    expect(snapshot).toEqual({
      items: [
        { character: ryu, pickCount: 5 },
        { character: scorpion, pickCount: 2 },
      ],
      updatedAt: '2026-10-12T20:00:00.000Z',
    });
  });

  it('skips a pick count whose character could not be loaded', () => {
    const snapshot = buildPopularitySnapshot([{ characterId: 999, pickCount: 1 }], [], updatedAt);

    expect(snapshot.items).toEqual([]);
  });
});
