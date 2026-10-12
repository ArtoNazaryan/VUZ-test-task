import {
  buildCharacterSeedPlan,
  getRequiredId,
  parseCharactersJson,
} from '@infrastructure/seed/helpers/character-seed.helper.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const fullCharacter = {
  id: 1,
  name: 'Cassie Cage',
  quote: 'Who is a good girl?',
  image: 'https://cdn.test/cassie.png',
  thumbnail: 'https://cdn.test/cassie-thumb.png',
  universe: 'Mortal Kombat',
  abilities: [
    { abilityName: 'Mobility', abilityScore: 5 },
    { abilityName: 'Power', abilityScore: 3 },
  ],
  tags: [{ slot: 1, tag_name: 'human' }],
};

const minimalCharacter = {
  id: 25,
  name: 'RoboCop',
  image: 'https://cdn.test/robocop.png',
  universe: 'Mortal Kombat',
  abilities: [{ abilityName: 'Power', abilityScore: 7 }],
};

describe('parseCharactersJson', () => {
  it('accepts the original characters.json file unchanged', () => {
    const raw: unknown = JSON.parse(
      readFileSync(resolve('../frontend/src/data/characters.json'), 'utf8'),
    );

    const plan = buildCharacterSeedPlan(parseCharactersJson(raw));

    expect(plan.characters).toHaveLength(208);
    expect(plan.universeNames).toHaveLength(4);
    expect(plan.tagNames).toHaveLength(21);
    expect(plan.abilityNames).toHaveLength(5);
  });

  it('accepts characters without quote, thumbnail or tags', () => {
    expect(parseCharactersJson([minimalCharacter])).toHaveLength(1);
  });

  it('rejects an ability score outside 1 to 10', () => {
    const invalid = { ...fullCharacter, abilities: [{ abilityName: 'Power', abilityScore: 11 }] };

    expect(() => parseCharactersJson([invalid])).toThrow(/abilityScore/);
  });

  it('rejects duplicate character ids', () => {
    expect(() => parseCharactersJson([fullCharacter, fullCharacter])).toThrow(/unique/);
  });

  it('rejects a payload that is not an array', () => {
    expect(() => parseCharactersJson({ characters: [] })).toThrow(/Invalid characters JSON/);
  });
});

describe('buildCharacterSeedPlan', () => {
  it('collects unique, sorted universe, tag and ability names', () => {
    const plan = buildCharacterSeedPlan([
      fullCharacter,
      {
        ...fullCharacter,
        id: 2,
        universe: 'Dragon Ball Z',
        tags: [
          { slot: 1, tag_name: 'alien' },
          { slot: 2, tag_name: 'human' },
        ],
      },
    ]);

    expect(plan.universeNames).toEqual(['Dragon Ball Z', 'Mortal Kombat']);
    expect(plan.tagNames).toEqual(['alien', 'human']);
    expect(plan.abilityNames).toEqual(['Mobility', 'Power']);
  });

  it('maps a character to a seed record with tag slots and ability scores', () => {
    const [record] = buildCharacterSeedPlan([fullCharacter]).characters;

    expect(record).toEqual({
      id: 1,
      name: 'Cassie Cage',
      quote: 'Who is a good girl?',
      image: 'https://cdn.test/cassie.png',
      thumbnail: 'https://cdn.test/cassie-thumb.png',
      universeName: 'Mortal Kombat',
      tags: [{ name: 'human', slot: 1 }],
      abilities: [
        { name: 'Mobility', score: 5 },
        { name: 'Power', score: 3 },
      ],
    });
  });

  it('uses null for a missing quote and thumbnail and an empty list for missing tags', () => {
    const [record] = buildCharacterSeedPlan([minimalCharacter]).characters;

    expect(record).toMatchObject({ quote: null, thumbnail: null, tags: [] });
  });
});

describe('getRequiredId', () => {
  it('returns the id for a known name', () => {
    expect(getRequiredId(new Map([['human', 7]]), 'human')).toBe(7);
  });

  it('throws for an unknown name', () => {
    expect(() => getRequiredId(new Map(), 'ghost')).toThrow(/ghost/);
  });
});
