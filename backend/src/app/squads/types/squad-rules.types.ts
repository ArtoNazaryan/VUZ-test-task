import type {
  ISquadCharactersViolation,
  ISquadSizeViolation,
} from '@app/squads/interfaces/squad-rules.interfaces.js';

export type TSquadRuleViolation = ISquadSizeViolation | ISquadCharactersViolation;
