import { toActivityRecord } from '@app/activity/helpers/activity.helper.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { describe, expect, it } from 'vitest';

describe('toActivityRecord', () => {
  const occurredAt = new Date('2026-10-13T10:00:00.000Z');

  it('keeps the character of a member event', () => {
    expect(
      toActivityRecord(SquadEvent.MemberAdded, {
        squadId: 'squad-1',
        userId: 'user-1',
        characterId: 25,
        occurredAt,
      }),
    ).toEqual({
      type: SquadEvent.MemberAdded,
      userId: 'user-1',
      squadId: 'squad-1',
      characterId: 25,
      occurredAt,
    });
  });

  it('keeps only the details that were sent', () => {
    expect(
      toActivityRecord(SquadEvent.Updated, {
        squadId: 'squad-1',
        userId: 'user-1',
        occurredAt,
        details: { name: 'Outworld', characterIds: undefined },
      }),
    ).toEqual({
      type: SquadEvent.Updated,
      userId: 'user-1',
      squadId: 'squad-1',
      details: { name: 'Outworld' },
      occurredAt,
    });
  });

  it('drops details that end up empty', () => {
    expect(
      toActivityRecord(SquadEvent.Updated, {
        squadId: 'squad-1',
        userId: 'user-1',
        occurredAt,
        details: {},
      }),
    ).not.toHaveProperty('details');
  });
});
