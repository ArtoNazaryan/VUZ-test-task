import { ActivityService } from '@app/activity/services/activity.service.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import type {
  ISquadEventPayload,
  ISquadMemberEventPayload,
} from '@app/squads/interfaces/squad-events.interfaces.js';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SquadActivityListener {
  constructor(private readonly activityService: ActivityService) {}

  @OnEvent(SquadEvent.Created)
  handleCreated(payload: ISquadEventPayload): Promise<void> {
    return this.activityService.record(SquadEvent.Created, payload);
  }

  @OnEvent(SquadEvent.Updated)
  handleUpdated(payload: ISquadEventPayload): Promise<void> {
    return this.activityService.record(SquadEvent.Updated, payload);
  }

  @OnEvent(SquadEvent.Deleted)
  handleDeleted(payload: ISquadEventPayload): Promise<void> {
    return this.activityService.record(SquadEvent.Deleted, payload);
  }

  @OnEvent(SquadEvent.MemberAdded)
  handleMemberAdded(payload: ISquadMemberEventPayload): Promise<void> {
    return this.activityService.record(SquadEvent.MemberAdded, payload);
  }

  @OnEvent(SquadEvent.MemberRemoved)
  handleMemberRemoved(payload: ISquadMemberEventPayload): Promise<void> {
    return this.activityService.record(SquadEvent.MemberRemoved, payload);
  }
}
