import { ACTIVITY_COLLECTION } from '@app/activity/constants/activity.constants.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import type { ISquadEventDetails } from '@app/squads/interfaces/squad-events.interfaces.js';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: ACTIVITY_COLLECTION, versionKey: false })
export class ActivityEvent {
  @Prop({ type: String, required: true, enum: Object.values(SquadEvent) })
  type: SquadEvent;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  squadId: string;

  @Prop({ type: Number })
  characterId?: number;

  @Prop({ type: Object })
  details?: ISquadEventDetails;

  @Prop({ type: Date, required: true })
  occurredAt: Date;
}

export const ActivityEventSchema = SchemaFactory.createForClass(ActivityEvent);

ActivityEventSchema.index({ squadId: 1, occurredAt: -1, _id: -1 });
ActivityEventSchema.index({ type: 1, occurredAt: -1, characterId: 1 });
