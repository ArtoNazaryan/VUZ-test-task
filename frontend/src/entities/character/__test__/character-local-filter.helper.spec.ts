import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { filterCharactersLocally } from '@/entities/character/index.ts';

const scorpion = makeCharacter({
  id: 1,
  name: 'Scorpion',
  universe: 'Mortal Kombat',
  tags: [{ name: 'ninja', slot: 1 }],
});
const ryu = makeCharacter({
  id: 2,
  name: 'Ryu',
  universe: 'Street Fighter',
  tags: [{ name: 'human', slot: 1 }],
});

describe('filterCharactersLocally', () => {
  it('keeps everyone when nothing is filtered', () => {
    expect(filterCharactersLocally([scorpion, ryu], {})).toEqual([scorpion, ryu]);
  });

  it('matches the search against names and tag names, ignoring case', () => {
    expect(filterCharactersLocally([scorpion, ryu], { search: 'RYU' })).toEqual([ryu]);
    expect(filterCharactersLocally([scorpion, ryu], { search: 'nin' })).toEqual([scorpion]);
  });

  it('keeps characters with any of the selected tags', () => {
    expect(filterCharactersLocally([scorpion, ryu], { tags: ['human', 'robot'] })).toEqual([ryu]);
  });

  it('combines universes with the other filters', () => {
    expect(
      filterCharactersLocally([scorpion, ryu], {
        tags: ['ninja', 'human'],
        universes: ['Street Fighter'],
      }),
    ).toEqual([ryu]);
  });
});
