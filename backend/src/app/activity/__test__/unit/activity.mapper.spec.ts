import {
  toPickStatsResponse,
  toSquadActivityResponse,
} from '@app/activity/mappers/activity.mapper.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

const scorpion = toCharacterResponse(makeCharacterRow({ id: 12, name: 'Scorpion' }));
const occurredAt = new Date('2026-10-13T10:00:00.000Z');
const id = new Types.ObjectId('6710f3c2a1b2c3d4e5f60718');

describe('activity mapper', () => {
  it('attaches the character to a member event', () => {
    expect(
      toSquadActivityResponse(
        {
          _id: id,
          type: SquadEvent.MemberAdded,
          userId: 'user-1',
          squadId: 'squad-1',
          characterId: 12,
          occurredAt,
        },
        new Map([[12, scorpion]]),
      ),
    ).toEqual({
      id: '6710f3c2a1b2c3d4e5f60718',
      type: SquadEvent.MemberAdded,
      character: scorpion,
      occurredAt,
    });
  });

  it('keeps the details of a rename and hides the owner', () => {
    expect(
      toSquadActivityResponse(
        {
          _id: id,
          type: SquadEvent.Updated,
          userId: 'user-1',
          squadId: 'squad-1',
          details: { name: 'Outworld' },
          occurredAt,
        },
        new Map(),
      ),
    ).toEqual({
      id: '6710f3c2a1b2c3d4e5f60718',
      type: SquadEvent.Updated,
      details: { name: 'Outworld' },
      occurredAt,
    });
  });

  it('joins pick counts with characters and skips unknown ones', () => {
    expect(
      toPickStatsResponse(
        7,
        occurredAt,
        [
          { characterId: 12, pickCount: 4 },
          { characterId: 999, pickCount: 2 },
        ],
        [scorpion],
      ),
    ).toEqual({
      days: 7,
      since: '2026-10-13T10:00:00.000Z',
      items: [{ character: scorpion, pickCount: 4 }],
    });
  });
});
