import { squadApi } from '@/entities/squad/api/squad.api.ts';
import type { ISquadChangedMessage } from '@/entities/squad/model/squad-change.interfaces.ts';
import { isRecord } from '@/shared/lib/helpers/object.helper.ts';

const SQUAD_CHANGES = new Set(['created', 'updated', 'deleted', 'member-added', 'member-removed']);

export function isSquadChangedMessage(value: unknown): value is ISquadChangedMessage {
  return (
    isRecord(value) &&
    typeof value.squadId === 'string' &&
    typeof value.change === 'string' &&
    SQUAD_CHANGES.has(value.change)
  );
}

export function refetchChangedSquad(
  message: ISquadChangedMessage,
): ReturnType<typeof squadApi.util.invalidateTags> {
  return squadApi.util.invalidateTags(
    message.change === 'deleted'
      ? ['Squads']
      : [
          'Squads',
          { type: 'Squad', id: message.squadId },
          { type: 'SquadHistory', id: message.squadId },
        ],
  );
}
