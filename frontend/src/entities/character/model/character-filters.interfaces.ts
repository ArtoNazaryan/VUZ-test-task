export interface ICharacterFiltersState {
  search: string;
  tags: string[];
  universes: string[];
}

export interface ICharacterFiltersRootState {
  characterFilters: ICharacterFiltersState;
}
