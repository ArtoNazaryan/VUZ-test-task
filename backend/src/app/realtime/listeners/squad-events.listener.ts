import { REALTIME_EVENTS } from '@app/realtime/constants/realtime.constants.js';
import { RealtimeGateway } from '@app/realtime/gateways/realtime.gateway.js';
import { toSquadChangedMessage } from '@app/realtime/helpers/realtime.helper.js';
import type { TSquadChange } from '@app/realtime/types/realtime.types.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import type {
  ISquadEventPayload,
  ISquadMemberEventPayload,
} from '@app/squads/interfaces/squad-events.interfaces.js';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SquadEventsListener {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  @OnEvent(SquadEvent.Created)
  handleCreated(payload: ISquadEventPayload): void {
    this.notifyOwner(payload, 'created');
  }

  @OnEvent(SquadEvent.Updated)
  handleUpdated(payload: ISquadEventPayload): void {
    this.notifyOwner(payload, 'updated');
  }

  @OnEvent(SquadEvent.Deleted)
  handleDeleted(payload: ISquadEventPayload): void {
    this.notifyOwner(payload, 'deleted');
  }

  @OnEvent(SquadEvent.MemberAdded)
  handleMemberAdded(payload: ISquadMemberEventPayload): void {
    this.notifyOwner(payload, 'member-added');
  }

  @OnEvent(SquadEvent.MemberRemoved)
  handleMemberRemoved(payload: ISquadMemberEventPayload): void {
    this.notifyOwner(payload, 'member-removed');
  }

  private notifyOwner(
    payload: ISquadEventPayload | ISquadMemberEventPayload,
    change: TSquadChange,
  ): void {
    this.realtimeGateway.emitToUser(
      payload.userId,
      REALTIME_EVENTS.SQUAD_CHANGED,
      toSquadChangedMessage(payload, change),
    );
  }
}
