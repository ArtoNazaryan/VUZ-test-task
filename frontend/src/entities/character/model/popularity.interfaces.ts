import type { ICharacter } from '@/entities/character/model/character.interfaces.ts';

export interface IPopularCharacter {
  character: ICharacter;
  pickCount: number;
}

export interface IPopularitySnapshot {
  items: IPopularCharacter[];
  updatedAt: string;
}
