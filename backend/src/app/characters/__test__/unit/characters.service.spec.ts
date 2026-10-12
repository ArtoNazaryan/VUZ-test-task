import { CharactersRepository } from '@app/characters/repositories/characters.repository.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import type { TCharacterRow } from '@app/characters/types/character.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { makeCharacterRow } from '@infrastructure/test/seeds/characters/factory/character-row.factory.js';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('CharactersService', () => {
  let service: CharactersService;
  const repository = {
    findById: vi.fn<(id: number) => Promise<TCharacterRow | null>>(),
    findUniverseNames: vi.fn<() => Promise<string[]>>(),
    findTagNames: vi.fn<() => Promise<string[]>>(),
    findAbilityNames: vi.fn<() => Promise<string[]>>(),
  } satisfies Partial<CharactersRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CharactersService, { provide: CharactersRepository, useValue: repository }],
    }).compile();

    service = moduleRef.get(CharactersService);
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
