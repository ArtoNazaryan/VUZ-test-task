import { computeSquadStats } from '@app/squads/helpers/squad-stats.helper.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { describe, expect, it } from 'vitest';

const ABILITIES = ['Power', 'Mobility', 'Technique', 'Survivability', 'Energy'];

const characterWith = (power: number, energy: number): ReturnType<typeof toCharacterResponse> =>
  toCharacterResponse(
    makeCharacterRow({
      abilities: [
        { score: power, ability: { name: 'Power' } },
        { score: energy, ability: { name: 'Energy' } },
      ],
    }),
  );

describe('computeSquadStats', () => {
  it('averages each ability across the squad, rounded to 2 decimals', () => {
    const stats = computeSquadStats(
      [characterWith(3, 4), characterWith(2, 7), characterWith(9, 6)],
      ['Power', 'Energy'],
    );

    expect(stats).toEqual({
      memberCount: 3,
      abilities: [
        { name: 'Power', average: 4.67 },
        { name: 'Energy', average: 5.67 },
      ],
    });
  });

  it('returns null averages for an empty squad', () => {
    expect(computeSquadStats([], ABILITIES)).toEqual({
      memberCount: 0,
      abilities: ABILITIES.map((name) => ({ name, average: null })),
    });
  });

  it('keeps the order of the given ability names', () => {
    const stats = computeSquadStats([characterWith(5, 5)], ['Energy', 'Power']);

    expect(stats.abilities.map((ability) => ability.name)).toEqual(['Energy', 'Power']);
  });
});
