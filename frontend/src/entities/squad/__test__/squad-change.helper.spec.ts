import { isSquadChangedMessage, refetchChangedSquad } from '@/entities/squad/index.ts';

describe('isSquadChangedMessage', () => {
  it('accepts every known change', () => {
    ['created', 'updated', 'deleted', 'member-added', 'member-removed'].forEach((change) => {
      expect(isSquadChangedMessage({ squadId: 'squad-1', change, occurredAt: 'now' })).toBe(true);
    });
  });

  it('rejects unknown changes and missing squad ids', () => {
    expect(isSquadChangedMessage({ squadId: 'squad-1', change: 'renamed' })).toBe(false);
    expect(isSquadChangedMessage({ change: 'created' })).toBe(false);
    expect(isSquadChangedMessage('squad-1')).toBe(false);
  });
});

describe('refetchChangedSquad', () => {
  it('refetches the squad, its history and the squad list', () => {
    expect(
      refetchChangedSquad({ squadId: 'squad-1', change: 'member-added', occurredAt: 'now' })
        .payload,
    ).toEqual([
      'Squads',
      { type: 'Squad', id: 'squad-1' },
      { type: 'SquadHistory', id: 'squad-1' },
    ]);
  });

  it('only refetches the squad list after a delete', () => {
    expect(
      refetchChangedSquad({ squadId: 'squad-1', change: 'deleted', occurredAt: 'now' }).payload,
    ).toEqual(['Squads']);
  });
});
