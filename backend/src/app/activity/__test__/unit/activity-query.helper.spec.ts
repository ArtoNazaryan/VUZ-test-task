import {
  buildHistoryFilter,
  buildPickStatsCacheKey,
  buildPickStatsPipeline,
  daysAgo,
} from '@app/activity/helpers/activity-query.helper.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

describe('activity query helpers', () => {
  it('filters only by squad on the first page', () => {
    expect(buildHistoryFilter('squad-1')).toEqual({ squadId: 'squad-1' });
  });

  it('continues after the cursor, breaking ties on the id', () => {
    const id = '6710f3c2a1b2c3d4e5f60718';
    const occurredAt = new Date('2026-10-13T10:00:00.000Z');

    expect(buildHistoryFilter('squad-1', { occurredAt: occurredAt.toISOString(), id })).toEqual({
      squadId: 'squad-1',
      $or: [
        { occurredAt: { $lt: occurredAt } },
        { occurredAt, _id: { $lt: new Types.ObjectId(id) } },
      ],
    });
  });

  it('counts added characters in the window, most added first', () => {
    const since = new Date('2026-10-06T10:00:00.000Z');

    expect(buildPickStatsPipeline(since, 10)).toEqual([
      { $match: { type: SquadEvent.MemberAdded, occurredAt: { $gte: since } } },
      { $group: { _id: '$characterId', pickCount: { $sum: 1 } } },
      { $sort: { pickCount: -1, _id: 1 } },
      { $limit: 10 },
      { $project: { _id: 0, characterId: '$_id', pickCount: 1 } },
    ]);
  });

  it('computes the window start and the cache key', () => {
    expect(daysAgo(7, new Date('2026-10-13T10:00:00.000Z'))).toEqual(
      new Date('2026-10-06T10:00:00.000Z'),
    );
    expect(buildPickStatsCacheKey('stats:picks', 7)).toBe('stats:picks:7');
  });
});
