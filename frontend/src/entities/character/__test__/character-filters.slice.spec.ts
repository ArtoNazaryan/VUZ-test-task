import {
  characterFiltersSlice,
  filtersCleared,
  myTeamToggled,
  searchChanged,
  selectHasActiveFilters,
  tagToggled,
  universeToggled,
} from '@/entities/character/index.ts';

const reducer = characterFiltersSlice.reducer;
const initial = reducer(undefined, { type: 'init' });

describe('characterFiltersSlice', () => {
  it('starts with no search and no filters', () => {
    expect(initial).toEqual({ search: '', tags: [], universes: [], myTeamOnly: false });
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

describe('myTeamToggled', () => {
  it('switches the My Team filter on and off and counts as an active filter', () => {
    const on = reducer(initial, myTeamToggled());

    expect(on.myTeamOnly).toBe(true);
    expect(selectHasActiveFilters({ characterFilters: on })).toBe(true);
    expect(reducer(on, myTeamToggled()).myTeamOnly).toBe(false);
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
