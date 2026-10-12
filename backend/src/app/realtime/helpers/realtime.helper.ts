import type { ISquadChangedMessage } from '@app/realtime/interfaces/realtime.interfaces.js';
import type { TSquadChange } from '@app/realtime/types/realtime.types.js';
import type {
  ISquadEventPayload,
  ISquadMemberEventPayload,
} from '@app/squads/interfaces/squad-events.interfaces.js';

export function buildUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function readHandshakeToken(auth: unknown): string | null {
  if (typeof auth !== 'object' || auth === null || !('token' in auth)) {
    return null;
  }

  return typeof auth.token === 'string' && auth.token.length > 0 ? auth.token : null;
}

export function toSquadChangedMessage(
  payload: ISquadEventPayload | ISquadMemberEventPayload,
  change: TSquadChange,
): ISquadChangedMessage {
  return {
    squadId: payload.squadId,
    change,
    ...('characterId' in payload ? { characterId: payload.characterId } : {}),
    occurredAt: payload.occurredAt.toISOString(),
  };
}
