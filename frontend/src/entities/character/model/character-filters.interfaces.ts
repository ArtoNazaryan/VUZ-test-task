export interface ICharacterFiltersState {
  search: string;
  tags: string[];
  universes: string[];
  myTeamOnly: boolean;
}

export interface ICharacterFiltersRootState {
  characterFilters: ICharacterFiltersState;
}
