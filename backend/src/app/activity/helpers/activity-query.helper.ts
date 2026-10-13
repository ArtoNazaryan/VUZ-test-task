import { DAY_IN_MS } from '@app/activity/constants/activity.constants.js';
import type { IActivityCursor } from '@app/activity/interfaces/activity.interfaces.js';
import type { ActivityEvent } from '@app/activity/schemas/activity-event.schema.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { type PipelineStage, type QueryFilter, Types } from 'mongoose';

export function buildHistoryFilter(
  squadId: string,
  after?: IActivityCursor,
): QueryFilter<ActivityEvent> {
  if (!after) {
    return { squadId };
  }

  const occurredAt = new Date(after.occurredAt);

  return {
    squadId,
    $or: [
      { occurredAt: { $lt: occurredAt } },
      { occurredAt, _id: { $lt: new Types.ObjectId(after.id) } },
    ],
  };
}

export function buildPickStatsPipeline(since: Date, limit: number): PipelineStage[] {
  return [
    { $match: { type: SquadEvent.MemberAdded, occurredAt: { $gte: since } } },
    { $group: { _id: '$characterId', pickCount: { $sum: 1 } } },
    { $sort: { pickCount: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 0, characterId: '$_id', pickCount: 1 } },
  ];
}

export function daysAgo(days: number, now: Date): Date {
  return new Date(now.getTime() - days * DAY_IN_MS);
}

export function buildPickStatsCacheKey(prefix: string, days: number): string {
  return `${prefix}:${String(days)}`;
}
