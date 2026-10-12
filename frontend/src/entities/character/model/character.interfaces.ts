export interface ICharacterTag {
  name: string;
  slot: number;
}

export interface ICharacterAbility {
  name: string;
  score: number;
}

export interface ICharacterPortrait {
  name: string;
  image: string;
  thumbnail: string | null;
}

export interface ICharacter extends ICharacterPortrait {
  id: number;
  quote: string | null;
  universe: string;
  tags: ICharacterTag[];
  abilities: ICharacterAbility[];
}

export interface ICharacterPage {
  items: ICharacter[];
  nextCursor: string | null;
}

export interface ICharacterFilterOptions {
  universes: string[];
  tags: string[];
  abilities: string[];
}

export interface ICharacterListArgs {
  search?: string;
  tags?: string[];
  universes?: string[];
}
