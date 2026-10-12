import { AuthModule } from '@app/auth/auth.module.js';
import { CharactersModule } from '@app/characters/characters.module.js';
import { SquadsController } from '@app/squads/controllers/squads.controller.js';
import { SquadsRepository } from '@app/squads/repositories/squads.repository.js';
import { SquadsService } from '@app/squads/services/squads.service.js';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule, CharactersModule],
  controllers: [SquadsController],
  providers: [SquadsService, SquadsRepository],
})
export class SquadsModule {}
