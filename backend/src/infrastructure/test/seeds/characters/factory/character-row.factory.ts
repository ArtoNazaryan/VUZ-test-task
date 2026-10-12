import type { TCharacterRow } from '@app/characters/types/character.types.js';

export function makeCharacterRow(overrides: Partial<TCharacterRow> = {}): TCharacterRow {
  return {
    id: 1,
    name: 'Cassie Cage',
    quote: "Who's a good girl?",
    image: 'https://cdn.test/cassie.png',
    thumbnail: 'https://cdn.test/cassie-thumb.png',
    universe: { name: 'Mortal Kombat' },
    tags: [{ slot: 1, tag: { name: 'human' } }],
    abilities: [
      { score: 4, ability: { name: 'Energy' } },
      { score: 5, ability: { name: 'Mobility' } },
      { score: 3, ability: { name: 'Power' } },
      { score: 6, ability: { name: 'Survivability' } },
      { score: 7, ability: { name: 'Technique' } },
    ],
    ...overrides,
  };
}
