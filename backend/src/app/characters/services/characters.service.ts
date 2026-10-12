import type { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { compareAbilityNames } from '@app/characters/helpers/ability-order.helper.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { CharactersRepository } from '@app/characters/repositories/characters.repository.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class CharactersService {
  constructor(private readonly charactersRepository: CharactersRepository) {}

  async getById(id: number): Promise<CharacterResponseDto> {
    const row = await this.charactersRepository.findById(id);

    if (!row) {
      throw new AppException(
        ErrorCode.NotFound,
        `Character with id ${id} was not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return toCharacterResponse(row);
  }

  async getFilters(): Promise<CharacterFiltersResponseDto> {
    const [universes, tags, abilities] = await Promise.all([
      this.charactersRepository.findUniverseNames(),
      this.charactersRepository.findTagNames(),
      this.charactersRepository.findAbilityNames(),
    ]);

    return { universes, tags, abilities: [...abilities].sort(compareAbilityNames) };
  }
}
