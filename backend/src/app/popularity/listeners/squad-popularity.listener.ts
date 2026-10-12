import { PopularityService } from '@app/popularity/services/popularity.service.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SquadPopularityListener {
  constructor(private readonly popularityService: PopularityService) {}

  @OnEvent(SquadEvent.Created)
  @OnEvent(SquadEvent.Updated)
  @OnEvent(SquadEvent.Deleted)
  @OnEvent(SquadEvent.MemberAdded)
  @OnEvent(SquadEvent.MemberRemoved)
  handleSquadChange(): void {
    this.popularityService.scheduleRefresh();
  }
}
