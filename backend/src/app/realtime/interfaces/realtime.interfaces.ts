import type { TSquadChange } from '@app/realtime/types/realtime.types.js';

export interface ISocketData {
  userId?: string;
}

export interface ISquadChangedMessage {
  squadId: string;
  change: TSquadChange;
  characterId?: number;
  occurredAt: string;
}
