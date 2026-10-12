import type { CharacterListResponseDto } from '@app/characters/dto/character-list-response.dto.js';
import type { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import type { ListCharactersQueryDto } from '@app/characters/dto/list-characters-query.dto.js';
import {
  decodeCharacterCursor,
  encodeCharacterCursor,
} from '@app/characters/helpers/cursor.helper.js';
import { compareAbilityNames } from '@app/characters/helpers/ability-order.helper.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { CharactersRepository } from '@app/characters/repositories/characters.repository.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class CharactersService {
  constructor(private readonly charactersRepository: CharactersRepository) {}

  async list(query: ListCharactersQueryDto): Promise<CharacterListResponseDto> {
    const after = query.cursor ? decodeCharacterCursor(query.cursor, query.sort) : undefined;

    if (after === null) {
      throw new AppException(
        ErrorCode.ValidationError,
        'The cursor is invalid or belongs to a different sort order',
        HttpStatus.BAD_REQUEST,
        [{ field: 'cursor', messages: ['cursor is invalid for this request'] }],
      );
    }

    const rows = await this.charactersRepository.findPage(
      {
        search: query.search,
        tags: query.tags,
        universes: query.universes,
        sort: query.sort,
        after,
      },
      query.limit + 1,
    );
    const pageRows = rows.slice(0, query.limit);
    const lastRow = pageRows.at(-1);

    return {
      items: pageRows.map(toCharacterResponse),
      nextCursor:
        rows.length > query.limit && lastRow
          ? encodeCharacterCursor({ name: lastRow.name, id: lastRow.id, sort: query.sort })
          : null,
    };
  }

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
