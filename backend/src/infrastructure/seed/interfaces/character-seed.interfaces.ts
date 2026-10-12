export interface ICharacterSeedTag {
  name: string;
  slot: number;
}

export interface ICharacterSeedAbility {
  name: string;
  score: number;
}

export interface ICharacterSeedRecord {
  id: number;
  name: string;
  quote: string | null;
  image: string;
  thumbnail: string | null;
  universeName: string;
  tags: ICharacterSeedTag[];
  abilities: ICharacterSeedAbility[];
}

export interface ICharacterSeedPlan {
  universeNames: string[];
  tagNames: string[];
  abilityNames: string[];
  characters: ICharacterSeedRecord[];
}

export interface ICharacterSeedSummary {
  universes: number;
  tags: number;
  abilities: number;
  characters: number;
  characterTags: number;
  characterAbilities: number;
}
