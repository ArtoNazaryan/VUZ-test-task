import { makeSquadSummary } from '@/entities/squad/__test__/fixtures/squads-api.mock.ts';
import { buildActiveSquadStorageKey, resolveActiveSquadId } from '@/entities/squad/index.ts';

const squads = [makeSquadSummary('squad-1', 'Earthrealm'), makeSquadSummary('squad-2', 'Outworld')];

describe('resolveActiveSquadId', () => {
  it('keeps the preferred squad when it still exists', () => {
    expect(resolveActiveSquadId(squads, 'squad-2')).toBe('squad-2');
  });

  it('falls back to the first squad when the preferred one is gone or missing', () => {
    expect(resolveActiveSquadId(squads, 'deleted')).toBe('squad-1');
    expect(resolveActiveSquadId(squads, null)).toBe('squad-1');
  });

  it('returns null when there are no squads', () => {
    expect(resolveActiveSquadId([], 'squad-1')).toBeNull();
  });
});

describe('buildActiveSquadStorageKey', () => {
  it('stores the selection per user', () => {
    expect(buildActiveSquadStorageKey('user-1')).toBe('squad-of-champions:active-squad:user-1');
  });
});
