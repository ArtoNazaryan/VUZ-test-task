import type { Types } from 'mongoose';
import type { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import type { ISquadEventDetails } from '@app/squads/interfaces/squad-events.interfaces.js';

export interface IActivityRecord {
  type: SquadEvent;
  userId: string;
  squadId: string;
  characterId?: number;
  details?: ISquadEventDetails;
  occurredAt: Date;
}

export interface IActivityRow extends IActivityRecord {
  _id: Types.ObjectId;
}

export interface IActivityCursor {
  occurredAt: string;
  id: string;
}
