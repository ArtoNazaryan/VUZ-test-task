import type { TSquadChange } from '@/entities/squad/model/squad-change.types.ts';

export interface ISquadChangedMessage {
  squadId: string;
  change: TSquadChange;
  characterId?: number;
  occurredAt: string;
}
