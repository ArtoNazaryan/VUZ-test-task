import type { IActivityRecord } from '@app/activity/interfaces/activity.interfaces.js';
import type { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import type {
  ISquadEventDetails,
  ISquadEventPayload,
  ISquadMemberEventPayload,
} from '@app/squads/interfaces/squad-events.interfaces.js';

function compactDetails(details?: ISquadEventDetails): ISquadEventDetails | undefined {
  if (!details) {
    return undefined;
  }

  const compacted: ISquadEventDetails = {
    ...(details.name === undefined ? {} : { name: details.name }),
    ...(details.characterIds === undefined ? {} : { characterIds: details.characterIds }),
  };

  return Object.keys(compacted).length > 0 ? compacted : undefined;
}

export function toActivityRecord(
  type: SquadEvent,
  payload: ISquadEventPayload | ISquadMemberEventPayload,
): IActivityRecord {
  const details = compactDetails(payload.details);

  return {
    type,
    userId: payload.userId,
    squadId: payload.squadId,
    ...('characterId' in payload ? { characterId: payload.characterId } : {}),
    ...(details ? { details } : {}),
    occurredAt: payload.occurredAt,
  };
}
