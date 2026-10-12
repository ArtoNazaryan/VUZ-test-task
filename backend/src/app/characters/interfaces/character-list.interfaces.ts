import type { CharacterSort } from '@app/characters/enums/character-sort.enum.js';

export interface ICharacterCursor {
  name: string;
  id: number;
  sort: CharacterSort;
}

export interface ICharacterListFilters {
  search?: string;
  tags?: string[];
  universes?: string[];
  sort: CharacterSort;
  after?: ICharacterCursor;
}
