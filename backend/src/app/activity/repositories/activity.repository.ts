import {
  buildHistoryFilter,
  buildPickStatsPipeline,
} from '@app/activity/helpers/activity-query.helper.js';
import type {
  IActivityCursor,
  IActivityRecord,
  IActivityRow,
} from '@app/activity/interfaces/activity.interfaces.js';
import { ActivityEvent } from '@app/activity/schemas/activity-event.schema.js';
import type { IPickCount } from '@app/squads/interfaces/squad-rules.interfaces.js';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

@Injectable()
export class ActivityRepository {
  constructor(
    @InjectModel(ActivityEvent.name) private readonly activityModel: Model<ActivityEvent>,
  ) {}

  async insert(record: IActivityRecord): Promise<void> {
    await this.activityModel.create(record);
  }

  findSquadPage(
    squadId: string,
    after: IActivityCursor | undefined,
    take: number,
  ): Promise<IActivityRow[]> {
    return this.activityModel
      .find(buildHistoryFilter(squadId, after))
      .sort({ occurredAt: -1, _id: -1 })
      .limit(take)
      .lean<IActivityRow[]>()
      .exec();
  }

  countPicksSince(since: Date, limit: number): Promise<IPickCount[]> {
    return this.activityModel.aggregate<IPickCount>(buildPickStatsPipeline(since, limit)).exec();
  }
}
