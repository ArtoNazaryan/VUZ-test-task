import {
  PICK_STATS_CACHE_KEY_PREFIX,
  PICK_STATS_CACHE_TTL_SECONDS,
  PICK_STATS_LIMIT,
} from '@app/activity/constants/activity.constants.js';
import type { PickStatsResponseDto } from '@app/activity/dto/pick-stats-response.dto.js';
import type { SquadHistoryQueryDto } from '@app/activity/dto/squad-history-query.dto.js';
import type { SquadHistoryResponseDto } from '@app/activity/dto/squad-history-response.dto.js';
import { toActivityRecord } from '@app/activity/helpers/activity.helper.js';
import {
  decodeActivityCursor,
  encodeActivityCursor,
} from '@app/activity/helpers/activity-cursor.helper.js';
import { invalidHistoryCursorError } from '@app/activity/helpers/activity-errors.helper.js';
import { buildPickStatsCacheKey, daysAgo } from '@app/activity/helpers/activity-query.helper.js';
import {
  toPickStatsResponse,
  toSquadActivityResponse,
} from '@app/activity/mappers/activity.mapper.js';
import { ActivityRepository } from '@app/activity/repositories/activity.repository.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import type { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import type {
  ISquadEventPayload,
  ISquadMemberEventPayload,
} from '@app/squads/interfaces/squad-events.interfaces.js';
import { SquadsService } from '@app/squads/services/squads.service.js';
import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly squadsService: SquadsService,
    private readonly charactersService: CharactersService,
    private readonly cacheService: CacheService,
  ) {}

  async record(
    type: SquadEvent,
    payload: ISquadEventPayload | ISquadMemberEventPayload,
  ): Promise<void> {
    try {
      await this.activityRepository.insert(toActivityRecord(type, payload));
    } catch (error) {
      this.logger.warn(
        { err: error, type, squadId: payload.squadId },
        '[ActivityService] Could not record activity',
      );
    }
  }

  async getSquadHistory(
    squadId: string,
    userId: string,
    query: SquadHistoryQueryDto,
  ): Promise<SquadHistoryResponseDto> {
    const after = query.cursor ? decodeActivityCursor(query.cursor) : undefined;

    if (after === null) {
      throw invalidHistoryCursorError();
    }

    await this.squadsService.assertOwned(squadId, userId);

    const rows = await this.activityRepository.findSquadPage(squadId, after, query.limit + 1);
    const pageRows = rows.slice(0, query.limit);
    const lastRow = pageRows.at(-1);
    const characterIds = [
      ...new Set(
        pageRows.flatMap((row) => (row.characterId === undefined ? [] : [row.characterId])),
      ),
    ];
    const characters = await this.charactersService.getManyByIds(characterIds);
    const charactersById = new Map(characters.map((character) => [character.id, character]));

    return {
      items: pageRows.map((row) => toSquadActivityResponse(row, charactersById)),
      nextCursor:
        rows.length > query.limit && lastRow
          ? encodeActivityCursor({
              occurredAt: lastRow.occurredAt.toISOString(),
              id: lastRow._id.toHexString(),
            })
          : null,
    };
  }

  getPickStats(days: number): Promise<PickStatsResponseDto> {
    return this.cacheService.getOrSet(
      buildPickStatsCacheKey(PICK_STATS_CACHE_KEY_PREFIX, days),
      PICK_STATS_CACHE_TTL_SECONDS,
      () => this.computePickStats(days),
    );
  }

  private async computePickStats(days: number): Promise<PickStatsResponseDto> {
    const since = daysAgo(days, new Date());
    const pickCounts = await this.activityRepository.countPicksSince(since, PICK_STATS_LIMIT);
    const characters = await this.charactersService.getManyByIds(
      pickCounts.map((pick) => pick.characterId),
    );

    return toPickStatsResponse(days, since, pickCounts, characters);
  }
}
