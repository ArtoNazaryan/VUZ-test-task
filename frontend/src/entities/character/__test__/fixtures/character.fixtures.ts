import type { ICharacter, ICharacterFilterOptions } from '@/entities/character/index.ts';

export const CHARACTER_FILTER_OPTIONS: ICharacterFilterOptions = {
  universes: ['Dragon Ball Z', 'Mortal Kombat', 'Street Fighter', 'Super Smash Bros'],
  tags: ['human', 'ninja', 'robot'],
  abilities: ['Power', 'Mobility', 'Technique', 'Survivability', 'Energy'],
};

export function makeCharacter(overrides: Partial<ICharacter> = {}): ICharacter {
  return {
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
    ...overrides,
  };
}
