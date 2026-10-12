import type { CharacterListResponseDto } from '@app/characters/dto/character-list-response.dto.js';
import type { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import type { ListCharactersQueryDto } from '@app/characters/dto/list-characters-query.dto.js';
import {
  decodeCharacterCursor,
  encodeCharacterCursor,
} from '@app/characters/helpers/cursor.helper.js';
import {
  buildItemCacheSuffix,
  buildListCacheSuffix,
} from '@app/characters/helpers/characters-cache-key.helper.js';
import { compareAbilityNames } from '@app/characters/helpers/ability-order.helper.js';
import { toCharacterResponse } from '@app/characters/mappers/character.mapper.js';
import { CharactersRepository } from '@app/characters/repositories/characters.repository.js';
import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import {
  CHARACTERS_CACHE_NAMESPACE,
  CHARACTERS_CACHE_TTL_SECONDS,
} from '@infrastructure/common/constants/cache.constants.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class CharactersService {
  constructor(
    private readonly charactersRepository: CharactersRepository,
    private readonly cacheService: CacheService,
  ) {}

  list(query: ListCharactersQueryDto): Promise<CharacterListResponseDto> {
    return this.cacheService.getOrSetVersioned(
      CHARACTERS_CACHE_NAMESPACE,
      buildListCacheSuffix(query),
      CHARACTERS_CACHE_TTL_SECONDS,
      () => this.loadPage(query),
    );
  }

  getById(id: number): Promise<CharacterResponseDto> {
    return this.cacheService.getOrSetVersioned(
      CHARACTERS_CACHE_NAMESPACE,
      buildItemCacheSuffix(id),
      CHARACTERS_CACHE_TTL_SECONDS,
      () => this.loadById(id),
    );
  }

  getFilters(): Promise<CharacterFiltersResponseDto> {
    return this.cacheService.getOrSetVersioned(
      CHARACTERS_CACHE_NAMESPACE,
      'filters',
      CHARACTERS_CACHE_TTL_SECONDS,
      () => this.loadFilters(),
    );
  }

  private async loadPage(query: ListCharactersQueryDto): Promise<CharacterListResponseDto> {
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

  private async loadById(id: number): Promise<CharacterResponseDto> {
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

  private async loadFilters(): Promise<CharacterFiltersResponseDto> {
    const [universes, tags, abilities] = await Promise.all([
      this.charactersRepository.findUniverseNames(),
      this.charactersRepository.findTagNames(),
      this.charactersRepository.findAbilityNames(),
    ]);

    return { universes, tags, abilities: [...abilities].sort(compareAbilityNames) };
  }
}
