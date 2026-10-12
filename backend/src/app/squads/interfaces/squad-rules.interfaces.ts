import type { SquadRuleViolation } from '@app/squads/enums/squad-rule-violation.enum.js';

export interface ISquadSizeViolation {
  type: SquadRuleViolation.SquadFull;
  limit: number;
  requested: number;
}

export interface ISquadCharactersViolation {
  type: SquadRuleViolation.DuplicateCharacters | SquadRuleViolation.UnknownCharacters;
  characterIds: number[];
}

export interface ISquadMemberChanges {
  name?: string;
  characterIds?: number[];
}

export interface IAbilityAverage {
  name: string;
  average: number | null;
}

export interface ISquadStats {
  memberCount: number;
  abilities: IAbilityAverage[];
}
