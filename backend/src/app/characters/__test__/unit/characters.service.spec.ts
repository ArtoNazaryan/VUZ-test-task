import type { ListCharactersQueryDto } from '@app/characters/dto/list-characters-query.dto.js';
import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import { encodeCharacterCursor } from '@app/characters/helpers/cursor.helper.js';
import type { ICharacterListFilters } from '@app/characters/interfaces/character-list.interfaces.js';
import { CharactersRepository } from '@app/characters/repositories/characters.repository.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import type { TCharacterRow } from '@app/characters/types/character.types.js';
import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('CharactersService', () => {
  let service: CharactersService;
  const repository = {
    findPage: vi.fn<(filters: ICharacterListFilters, take: number) => Promise<TCharacterRow[]>>(),
    findById: vi.fn<(id: number) => Promise<TCharacterRow | null>>(),
    findManyByIds: vi.fn<(ids: number[]) => Promise<TCharacterRow[]>>(),
    findExistingIds: vi.fn<(ids: number[]) => Promise<number[]>>(),
    findUniverseNames: vi.fn<() => Promise<string[]>>(),
    findTagNames: vi.fn<() => Promise<string[]>>(),
    findAbilityNames: vi.fn<() => Promise<string[]>>(),
  } satisfies Partial<CharactersRepository>;

  const passThroughCache = {
    getOrSetVersioned: <T>(
      _namespace: string,
      _suffix: string,
      _ttlSeconds: number,
      load: () => Promise<T>,
    ): Promise<T> => load(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CharactersService,
        { provide: CharactersRepository, useValue: repository },
        { provide: CacheService, useValue: passThroughCache },
      ],
    }).compile();

    service = moduleRef.get(CharactersService);
  });

  describe('list', () => {
    const query = (overrides: Partial<ListCharactersQueryDto> = {}): ListCharactersQueryDto => ({
      limit: 2,
      sort: CharacterSort.NameAsc,
      ...overrides,
    });

    it('asks the repository for one row more than the page size', async () => {
      repository.findPage.mockResolvedValue([]);

      await service.list(query({ search: 'sub', tags: ['ninja'], universes: ['Mortal Kombat'] }));

      expect(repository.findPage).toHaveBeenCalledWith(
        {
          search: 'sub',
          tags: ['ninja'],
          universes: ['Mortal Kombat'],
          sort: CharacterSort.NameAsc,
          after: undefined,
        },
        3,
      );
    });

    it('returns a cursor pointing at the last item when more rows exist', async () => {
      repository.findPage.mockResolvedValue([
        makeCharacterRow({ id: 1, name: 'Akuma' }),
        makeCharacterRow({ id: 2, name: 'Baraka' }),
        makeCharacterRow({ id: 3, name: 'Cammy' }),
      ]);

      const page = await service.list(query());

      expect(page.items.map((item) => item.name)).toEqual(['Akuma', 'Baraka']);
      expect(page.nextCursor).toBe(
        encodeCharacterCursor({ name: 'Baraka', id: 2, sort: CharacterSort.NameAsc }),
      );
    });

    it('returns a null cursor on the last page', async () => {
      repository.findPage.mockResolvedValue([makeCharacterRow({ id: 1, name: 'Akuma' })]);

      await expect(service.list(query())).resolves.toMatchObject({ nextCursor: null });
    });

    it('passes a decoded cursor to the repository', async () => {
      repository.findPage.mockResolvedValue([]);
      const cursor = { name: 'Baraka', id: 2, sort: CharacterSort.NameAsc };

      await service.list(query({ cursor: encodeCharacterCursor(cursor) }));

      expect(repository.findPage).toHaveBeenCalledWith(
        expect.objectContaining({ after: cursor }),
        3,
      );
    });

    it('rejects a malformed cursor with VALIDATION_ERROR', async () => {
      await expect(service.list(query({ cursor: 'garbage' }))).rejects.toMatchObject({
        code: ErrorCode.ValidationError,
        status: HttpStatus.BAD_REQUEST,
      });
      expect(repository.findPage).not.toHaveBeenCalled();
    });

    it('rejects a cursor created for a different sort order', async () => {
      const descendingCursor = encodeCharacterCursor({
        name: 'Baraka',
        id: 2,
        sort: CharacterSort.NameDesc,
      });

      await expect(service.list(query({ cursor: descendingCursor }))).rejects.toMatchObject({
        code: ErrorCode.ValidationError,
      });
    });
  });

  describe('getManyByIds', () => {
    it('returns the characters in the order of the requested ids', async () => {
      repository.findManyByIds.mockResolvedValue([
        makeCharacterRow({ id: 1, name: 'Cassie Cage' }),
        makeCharacterRow({ id: 2, name: 'Baraka' }),
      ]);

      const characters = await service.getManyByIds([2, 1]);

      expect(characters.map((character) => character.name)).toEqual(['Baraka', 'Cassie Cage']);
    });

    it('does not query the database for an empty list', async () => {
      await expect(service.getManyByIds([])).resolves.toEqual([]);
      expect(repository.findManyByIds).not.toHaveBeenCalled();
    });
  });

  describe('findExistingIds', () => {
    it('returns the ids that exist as a set', async () => {
      repository.findExistingIds.mockResolvedValue([1, 25]);

      await expect(service.findExistingIds([1, 25, 9999])).resolves.toEqual(new Set([1, 25]));
    });

    it('does not query the database for an empty list', async () => {
      await expect(service.findExistingIds([])).resolves.toEqual(new Set());
      expect(repository.findExistingIds).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('returns the mapped character when it exists', async () => {
      repository.findById.mockResolvedValue(makeCharacterRow({ id: 42, name: 'Scorpion' }));

      await expect(service.getById(42)).resolves.toMatchObject({ id: 42, name: 'Scorpion' });
    });

    it('throws NOT_FOUND when the character does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toMatchObject({
        code: ErrorCode.NotFound,
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getFilters', () => {
    it('returns universes and tags as stored and abilities in display order', async () => {
      repository.findUniverseNames.mockResolvedValue(['Dragon Ball Z', 'Mortal Kombat']);
      repository.findTagNames.mockResolvedValue(['alien', 'human']);
      repository.findAbilityNames.mockResolvedValue(['Energy', 'Power', 'Mobility']);

      await expect(service.getFilters()).resolves.toEqual({
        universes: ['Dragon Ball Z', 'Mortal Kombat'],
        tags: ['alien', 'human'],
        abilities: ['Power', 'Mobility', 'Energy'],
      });
    });
  });
});
