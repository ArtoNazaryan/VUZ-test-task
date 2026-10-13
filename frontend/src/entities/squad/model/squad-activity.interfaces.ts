import type { ICharacter } from '@/entities/character/@x/squad.ts';
import type { TSquadActivityType } from '@/entities/squad/model/squad-activity.types.ts';

export interface ISquadActivityDetails {
  name?: string;
  characterIds?: number[];
}

export interface ISquadActivity {
  id: string;
  type: TSquadActivityType;
  character?: ICharacter;
  details?: ISquadActivityDetails;
  occurredAt: string;
}

export interface ISquadHistoryPage {
  items: ISquadActivity[];
  nextCursor: string | null;
}
