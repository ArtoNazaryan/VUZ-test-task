import { CharactersController } from '@app/characters/controllers/characters.controller.js';
import { CharactersRepository } from '@app/characters/repositories/characters.repository.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CharactersController],
  providers: [CharactersService, CharactersRepository],
})
export class CharactersModule {}
