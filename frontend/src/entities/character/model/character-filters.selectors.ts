import type {
  ICharacterFiltersRootState,
  ICharacterFiltersState,
} from '@/entities/character/model/character-filters.interfaces.ts';

export const selectCharacterFilters = (state: ICharacterFiltersRootState): ICharacterFiltersState =>
  state.characterFilters;

export const selectHasActiveFilters = (state: ICharacterFiltersRootState): boolean => {
  const { search, tags, universes } = state.characterFilters;

  return search.trim().length > 0 || tags.length > 0 || universes.length > 0;
};
