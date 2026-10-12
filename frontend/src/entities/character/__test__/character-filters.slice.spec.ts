import {
  characterFiltersSlice,
  filtersCleared,
  searchChanged,
  selectHasActiveFilters,
  tagToggled,
  universeToggled,
} from '@/entities/character/index.ts';

const reducer = characterFiltersSlice.reducer;
const initial = reducer(undefined, { type: 'init' });

describe('characterFiltersSlice', () => {
  it('starts with no search and no filters', () => {
    expect(initial).toEqual({ search: '', tags: [], universes: [] });
  });

  it('adds a tag on the first toggle and removes it on the second', () => {
    const selected = reducer(initial, tagToggled('ninja'));

    expect(selected.tags).toEqual(['ninja']);
    expect(reducer(selected, tagToggled('ninja')).tags).toEqual([]);
  });

  it('toggles universes independently of tags', () => {
    const state = reducer(reducer(initial, tagToggled('ninja')), universeToggled('Mortal Kombat'));

    expect(state).toMatchObject({ tags: ['ninja'], universes: ['Mortal Kombat'] });
  });

  it('clears the search and every filter at once', () => {
    const busy = reducer(reducer(initial, searchChanged('sub')), tagToggled('ninja'));

    expect(reducer(busy, filtersCleared())).toEqual(initial);
  });
});

describe('selectHasActiveFilters', () => {
  it('ignores a search made only of spaces', () => {
    expect(
      selectHasActiveFilters({ characterFilters: reducer(initial, searchChanged('   ')) }),
    ).toBe(false);
  });

  it('is true when a tag is selected', () => {
    expect(
      selectHasActiveFilters({ characterFilters: reducer(initial, tagToggled('ninja')) }),
    ).toBe(true);
  });
});
