import { CharactersService } from '@app/characters/services/characters.service.js';
import {
  POPULARITY_CACHE_KEY,
  POPULARITY_CACHE_TTL_SECONDS,
  POPULARITY_LIMIT,
  POPULARITY_REFRESH_DELAY_MS,
} from '@app/popularity/constants/popularity.constants.js';
import type { PopularityResponseDto } from '@app/popularity/dto/popularity-response.dto.js';
import { buildPopularitySnapshot } from '@app/popularity/helpers/popularity.helper.js';
import { REALTIME_EVENTS } from '@app/realtime/constants/realtime.constants.js';
import { RealtimeGateway } from '@app/realtime/gateways/realtime.gateway.js';
import { SquadsService } from '@app/squads/services/squads.service.js';
import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PopularityService implements OnModuleDestroy {
  private readonly logger = new Logger(PopularityService.name);
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly squadsService: SquadsService,
    private readonly charactersService: CharactersService,
    private readonly cacheService: CacheService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  getSnapshot(): Promise<PopularityResponseDto> {
    return this.cacheService.getOrSet(POPULARITY_CACHE_KEY, POPULARITY_CACHE_TTL_SECONDS, () =>
      this.computeSnapshot(),
    );
  }

  scheduleRefresh(): void {
    if (this.refreshTimer) {
      return;
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refreshAndBroadcast();
    }, POPULARITY_REFRESH_DELAY_MS);
  }

  onModuleDestroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async refreshAndBroadcast(): Promise<void> {
    try {
      const snapshot = await this.computeSnapshot();

      await this.cacheService.set(POPULARITY_CACHE_KEY, snapshot, POPULARITY_CACHE_TTL_SECONDS);
      this.realtimeGateway.broadcast(REALTIME_EVENTS.POPULARITY_UPDATED, snapshot);
    } catch (error) {
      this.logger.error({ err: error }, '[PopularityService] Could not refresh popularity');
    }
  }

  private async computeSnapshot(): Promise<PopularityResponseDto> {
    const pickCounts = await this.squadsService.getMostPicked(POPULARITY_LIMIT);
    const characters = await this.charactersService.getManyByIds(
      pickCounts.map((pick) => pick.characterId),
    );

    return buildPopularitySnapshot(pickCounts, characters, new Date());
  }
}
