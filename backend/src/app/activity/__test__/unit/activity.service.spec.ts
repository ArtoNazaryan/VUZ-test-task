import type {
  IActivityCursor,
  IActivityRecord,
  IActivityRow,
} from '@app/activity/interfaces/activity.interfaces.js';
import { encodeActivityCursor } from '@app/activity/helpers/activity-cursor.helper.js';
import { ActivityRepository } from '@app/activity/repositories/activity.repository.js';
import { ActivityService } from '@app/activity/services/activity.service.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import type { IPickCount } from '@app/squads/interfaces/squad-rules.interfaces.js';
import { SquadsService } from '@app/squads/services/squads.service.js';
import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const scorpion = toCharacterResponse(makeCharacterRow({ id: 12, name: 'Scorpion' }));

function activityRow(minute: number, characterId?: number): IActivityRow {
  return {
    _id: new Types.ObjectId(),
    type: characterId === undefined ? SquadEvent.Updated : SquadEvent.MemberAdded,
    userId: 'user-1',
    squadId: 'squad-1',
    ...(characterId === undefined ? {} : { characterId }),
    occurredAt: new Date(Date.UTC(2026, 9, 13, 10, minute)),
  };
}

describe('ActivityService', () => {
  let service: ActivityService;
  const repository = {
    insert: vi.fn<(record: IActivityRecord) => Promise<void>>(),
    findSquadPage:
      vi.fn<
        (
          squadId: string,
          after: IActivityCursor | undefined,
          take: number,
        ) => Promise<IActivityRow[]>
      >(),
    countPicksSince: vi.fn<(since: Date, limit: number) => Promise<IPickCount[]>>(),
  } satisfies Partial<ActivityRepository>;
  const squadsService = {
    assertOwned: vi.fn<(id: string, userId: string) => Promise<void>>(),
  } satisfies Partial<SquadsService>;
  const charactersService = {
    getManyByIds: vi.fn<(ids: number[]) => Promise<CharacterResponseDto[]>>(),
  } satisfies Partial<CharactersService>;
  const cacheService = {
    getOrSet: vi.fn(<T>(_key: string, _ttl: number, load: () => Promise<T>): Promise<T> => load()),
  };
  const payload = {
    squadId: 'squad-1',
    userId: 'user-1',
    characterId: 25,
    occurredAt: new Date('2026-10-13T10:00:00.000Z'),
  };

  beforeEach(async () => {
    squadsService.assertOwned.mockResolvedValue();
    charactersService.getManyByIds.mockResolvedValue([scorpion]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: ActivityRepository, useValue: repository },
        { provide: SquadsService, useValue: squadsService },
        { provide: CharactersService, useValue: charactersService },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = moduleRef.get(ActivityService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('record', () => {
    it('stores the squad event as an activity record', async () => {
      repository.insert.mockResolvedValue(undefined);

      await service.record(SquadEvent.MemberAdded, payload);

      expect(repository.insert).toHaveBeenCalledWith({
        type: SquadEvent.MemberAdded,
        ...payload,
      });
    });

    it('logs and swallows a storage failure', async () => {
      const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
      repository.insert.mockRejectedValue(new Error('mongo is down'));

      await expect(service.record(SquadEvent.MemberAdded, payload)).resolves.toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.objectContaining({ type: SquadEvent.MemberAdded, squadId: 'squad-1' }),
        '[ActivityService] Could not record activity',
      );
    });
  });

  describe('getSquadHistory', () => {
    it('returns a page with characters and a cursor to the next one', async () => {
      const rows = [activityRow(3, 12), activityRow(2), activityRow(1, 12)];
      repository.findSquadPage.mockResolvedValue(rows);

      const page = await service.getSquadHistory('squad-1', 'user-1', { limit: 2 });

      expect(squadsService.assertOwned).toHaveBeenCalledWith('squad-1', 'user-1');
      expect(repository.findSquadPage).toHaveBeenCalledWith('squad-1', undefined, 3);
      expect(charactersService.getManyByIds).toHaveBeenCalledWith([12]);
      expect(page.items.map((item) => item.character?.name ?? null)).toEqual(['Scorpion', null]);
      expect(page.nextCursor).toBe(
        encodeActivityCursor({
          occurredAt: '2026-10-13T10:02:00.000Z',
          id: rows[1]?._id.toHexString() ?? '',
        }),
      );
    });

    it('returns no cursor on the last page', async () => {
      repository.findSquadPage.mockResolvedValue([activityRow(1)]);

      const page = await service.getSquadHistory('squad-1', 'user-1', { limit: 2 });

      expect(page.nextCursor).toBeNull();
    });

    it('rejects an invalid cursor before reading anything', async () => {
      await expect(
        service.getSquadHistory('squad-1', 'user-1', { limit: 2, cursor: 'garbage' }),
      ).rejects.toMatchObject({ code: ErrorCode.ValidationError, status: 400 });
      expect(squadsService.assertOwned).not.toHaveBeenCalled();
      expect(repository.findSquadPage).not.toHaveBeenCalled();
    });

    it('does not read the history of a squad the user does not own', async () => {
      squadsService.assertOwned.mockRejectedValue(new Error('not found'));

      await expect(service.getSquadHistory('squad-1', 'stranger', { limit: 2 })).rejects.toThrow(
        'not found',
      );
      expect(repository.findSquadPage).not.toHaveBeenCalled();
    });
  });

  describe('getPickStats', () => {
    it('counts picks since N days ago and caches them per window', async () => {
      vi.useFakeTimers({ now: new Date('2026-10-13T10:00:00.000Z') });
      repository.countPicksSince.mockResolvedValue([{ characterId: 12, pickCount: 4 }]);

      await expect(service.getPickStats(7)).resolves.toEqual({
        days: 7,
        since: '2026-10-06T10:00:00.000Z',
        items: [{ character: scorpion, pickCount: 4 }],
      });
      expect(repository.countPicksSince).toHaveBeenCalledWith(
        new Date('2026-10-06T10:00:00.000Z'),
        10,
      );
      expect(cacheService.getOrSet).toHaveBeenCalledWith('stats:picks:7', 60, expect.any(Function));
    });
  });
});
