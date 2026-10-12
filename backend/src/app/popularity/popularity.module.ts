import { CharactersModule } from '@app/characters/characters.module.js';
import { PopularityController } from '@app/popularity/controllers/popularity.controller.js';
import { SquadPopularityListener } from '@app/popularity/listeners/squad-popularity.listener.js';
import { PopularityService } from '@app/popularity/services/popularity.service.js';
import { RealtimeModule } from '@app/realtime/realtime.module.js';
import { SquadsModule } from '@app/squads/squads.module.js';
import { Module } from '@nestjs/common';

@Module({
  imports: [SquadsModule, CharactersModule, RealtimeModule],
  controllers: [PopularityController],
  providers: [PopularityService, SquadPopularityListener],
})
export class PopularityModule {}
