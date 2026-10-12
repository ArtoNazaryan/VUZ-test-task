import type { ICharacter } from '@/entities/character/@x/squad.ts';

export interface ISquadSummary {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISquadAbilityAverage {
  name: string;
  average: number | null;
}

export interface ISquadStats {
  memberCount: number;
  abilities: ISquadAbilityAverage[];
}

export interface ISquad {
  id: string;
  name: string;
  characters: ICharacter[];
  stats: ISquadStats;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSquadRequest {
  name: string;
  characterIds?: number[];
}

export interface IRenameSquadRequest {
  id: string;
  name: string;
}

export interface IActiveSquadState {
  squadId: string | null;
}

export interface IActiveSquadRootState {
  activeSquad: IActiveSquadState;
}
