import { buildCharacterQueryParams } from '@/entities/character/lib/character-query.helper.ts';

describe('buildCharacterQueryParams', () => {
  it('asks for the first page of 20 when nothing is filtered', () => {
    expect(buildCharacterQueryParams({}, '')).toEqual({ limit: '20' });
  });

  it('sends trimmed search, comma separated tags and universes and the cursor', () => {
    expect(
      buildCharacterQueryParams(
        { search: '  sub ', tags: ['ninja', 'robot'], universes: ['Mortal Kombat'] },
        'cursor-1',
      ),
    ).toEqual({
      limit: '20',
      search: 'sub',
      tags: 'ninja,robot',
      universes: 'Mortal Kombat',
      cursor: 'cursor-1',
    });
  });

  it('leaves out a blank search and empty lists', () => {
    expect(buildCharacterQueryParams({ search: '   ', tags: [], universes: [] }, '')).toEqual({
      limit: '20',
    });
  });
});
