import { toSquadResponse, toSquadSummaryResponse } from '@app/squads/mappers/squad.mapper.js';
import { describe, expect, it } from 'vitest';

const createdAt = new Date('2026-10-12T10:00:00.000Z');
const updatedAt = new Date('2026-10-12T11:00:00.000Z');

describe('toSquadSummaryResponse', () => {
  it('returns the squad with its member count', () => {
    expect(
      toSquadSummaryResponse({
        id: 'squad-1',
        name: 'Earthrealm',
        createdAt,
        updatedAt,
        _count: { members: 4 },
      }),
    ).toEqual({ id: 'squad-1', name: 'Earthrealm', memberCount: 4, createdAt, updatedAt });
  });
});

describe('toSquadResponse', () => {
  it('returns the squad with the given characters and stats', () => {
    const stats = { memberCount: 0, abilities: [{ name: 'Power', average: null }] };

    expect(
      toSquadResponse(
        { id: 'squad-1', name: 'Earthrealm', createdAt, updatedAt, members: [] },
        [],
        stats,
      ),
    ).toEqual({ id: 'squad-1', name: 'Earthrealm', characters: [], stats, createdAt, updatedAt });
  });
});
