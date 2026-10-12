import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import { PopularityService } from '@app/popularity/services/popularity.service.js';
import { RealtimeGateway } from '@app/realtime/gateways/realtime.gateway.js';
import type { IPickCount } from '@app/squads/interfaces/squad-rules.interfaces.js';
import { SquadsService } from '@app/squads/services/squads.service.js';
import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const scorpion = toCharacterResponse(makeCharacterRow({ id: 12, name: 'Scorpion' }));

describe('PopularityService', () => {
  let service: PopularityService;
  const squadsService = {
    getMostPicked: vi.fn<(limit: number) => Promise<IPickCount[]>>(),
  } satisfies Partial<SquadsService>;
  const charactersService = {
    getManyByIds: vi.fn<(ids: number[]) => Promise<CharacterResponseDto[]>>(),
  } satisfies Partial<CharactersService>;
  const cacheService = {
    getOrSet: vi.fn(<T>(_key: string, _ttl: number, load: () => Promise<T>): Promise<T> => load()),
    set: vi.fn<(key: string, value: unknown, ttl: number) => Promise<void>>(),
  };
  const realtimeGateway = { broadcast: vi.fn<(event: string, payload: unknown) => void>() };

  beforeEach(async () => {
    vi.useFakeTimers({ now: new Date('2026-10-12T20:00:00.000Z') });
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    squadsService.getMostPicked.mockResolvedValue([{ characterId: 12, pickCount: 3 }]);
    charactersService.getManyByIds.mockResolvedValue([scorpion]);
    cacheService.set.mockResolvedValue();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PopularityService,
        { provide: SquadsService, useValue: squadsService },
        { provide: CharactersService, useValue: charactersService },
        { provide: CacheService, useValue: cacheService },
        { provide: RealtimeGateway, useValue: realtimeGateway },
      ],
    }).compile();

    service = moduleRef.get(PopularityService);
  });

  afterEach(() => {
    service.onModuleDestroy();
    vi.useRealTimers();
  });

  const expectedSnapshot = {
    items: [{ character: scorpion, pickCount: 3 }],
    updatedAt: '2026-10-12T20:00:00.000Z',
  };

  it('returns the top 10 from the cache or computes it', async () => {
    await expect(service.getSnapshot()).resolves.toEqual(expectedSnapshot);
    expect(squadsService.getMostPicked).toHaveBeenCalledWith(10);
    expect(cacheService.getOrSet).toHaveBeenCalledWith('popularity:top', 300, expect.any(Function));
  });

  it('refreshes once a second after a burst of squad changes, not once per change', async () => {
    service.scheduleRefresh();
    service.scheduleRefresh();
    service.scheduleRefresh();

    expect(realtimeGateway.broadcast).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);

    expect(squadsService.getMostPicked).toHaveBeenCalledTimes(1);
    expect(realtimeGateway.broadcast).toHaveBeenCalledTimes(1);
    const refreshedSnapshot = { ...expectedSnapshot, updatedAt: '2026-10-12T20:00:01.000Z' };

    expect(realtimeGateway.broadcast).toHaveBeenCalledWith('popularity:updated', refreshedSnapshot);
    expect(cacheService.set).toHaveBeenCalledWith('popularity:top', refreshedSnapshot, 300);
  });

  it('schedules a new refresh for changes after the previous one ran', async () => {
    service.scheduleRefresh();
    await vi.advanceTimersByTimeAsync(1000);
    service.scheduleRefresh();
    await vi.advanceTimersByTimeAsync(1000);

    expect(realtimeGateway.broadcast).toHaveBeenCalledTimes(2);
  });

  it('logs and keeps running when the refresh fails', async () => {
    squadsService.getMostPicked.mockRejectedValue(new Error('database down'));

    await expect(service.refreshAndBroadcast()).resolves.toBeUndefined();
    expect(realtimeGateway.broadcast).not.toHaveBeenCalled();
  });
});
