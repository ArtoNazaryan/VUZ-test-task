import { isSquadChangedMessage } from '@/entities/squad/index.ts';

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
