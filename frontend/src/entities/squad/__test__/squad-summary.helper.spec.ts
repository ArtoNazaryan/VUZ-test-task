import { toSquadSummary, upsertSquadSummary } from '@/entities/squad/lib/squad-summary.helper.ts';
import { makeSquadSummary } from '@/entities/squad/__test__/fixtures/squads-api.mock.ts';
import type { ISquad } from '@/entities/squad/index.ts';

const squad: ISquad = {
  id: 'squad-2',
  name: 'Outworld',
  characters: [],
  stats: { memberCount: 0, abilities: [] },
  createdAt: '2026-10-12T10:00:00.000Z',
  updatedAt: '2026-10-12T10:00:00.000Z',
};

describe('squad summary helpers', () => {
  it('builds a summary with the member count', () => {
    expect(toSquadSummary(squad)).toMatchObject({
      id: 'squad-2',
      name: 'Outworld',
      memberCount: 0,
    });
  });

  it('adds a new squad to the end of the list', () => {
    expect(
      upsertSquadSummary([makeSquadSummary('squad-1', 'Earthrealm')], squad).map((item) => item.id),
    ).toEqual(['squad-1', 'squad-2']);
  });

  it('replaces an existing squad in place', () => {
    expect(
      upsertSquadSummary([makeSquadSummary('squad-2', 'Old name')], squad).map((item) => item.name),
    ).toEqual(['Outworld']);
  });
});
