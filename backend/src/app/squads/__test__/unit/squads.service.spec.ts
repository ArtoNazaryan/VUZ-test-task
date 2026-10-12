import type { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import type { ISquadMemberChanges } from '@app/squads/interfaces/squad-rules.interfaces.js';
import { SquadsRepository } from '@app/squads/repositories/squads.repository.js';
import { SquadsService } from '@app/squads/services/squads.service.js';
import type { TSquadDetailRow, TSquadSummaryRow } from '@app/squads/types/squad.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { Prisma } from '@infrastructure/prisma/generated/client.js';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createdAt = new Date('2026-10-12T10:00:00.000Z');

const squadRow = (overrides: Partial<TSquadDetailRow> = {}): TSquadDetailRow => ({
  id: 'squad-1',
  name: 'Earthrealm',
  createdAt,
  updatedAt: createdAt,
  members: [],
  ...overrides,
});

const filters: CharacterFiltersResponseDto = {
  universes: [],
  tags: [],
  abilities: ['Power', 'Mobility', 'Technique', 'Survivability', 'Energy'],
};

describe('SquadsService', () => {
  let service: SquadsService;
  const repository = {
    findAllByUser: vi.fn<(userId: string) => Promise<TSquadSummaryRow[]>>(),
    findOwned: vi.fn<(id: string, userId: string) => Promise<TSquadDetailRow | null>>(),
    create: vi.fn<(userId: string, name: string, characterIds: number[]) => Promise<string>>(),
    updateOwned:
      vi.fn<(id: string, userId: string, changes: ISquadMemberChanges) => Promise<boolean>>(),
    deleteOwned: vi.fn<(id: string, userId: string) => Promise<boolean>>(),
  } satisfies Partial<SquadsRepository>;
  const charactersService = {
    getManyByIds: vi.fn<(ids: number[]) => Promise<CharacterResponseDto[]>>(),
    getFilters: vi.fn<() => Promise<CharacterFiltersResponseDto>>(),
    findExistingIds: vi.fn<(ids: number[]) => Promise<Set<number>>>(),
  } satisfies Partial<CharactersService>;

  beforeEach(async () => {
    charactersService.getManyByIds.mockResolvedValue([]);
    charactersService.getFilters.mockResolvedValue(filters);
    charactersService.findExistingIds.mockImplementation((ids) => Promise.resolve(new Set(ids)));

    const moduleRef = await Test.createTestingModule({
      providers: [
        SquadsService,
        { provide: SquadsRepository, useValue: repository },
        { provide: CharactersService, useValue: charactersService },
      ],
    }).compile();

    service = moduleRef.get(SquadsService);
  });

  const notFound = { code: ErrorCode.NotFound, status: 404 };
  const uniqueViolation = (): Prisma.PrismaClientKnownRequestError =>
    new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.10.0',
    });

  describe('getById', () => {
    it('loads the members as characters in the order they were added', async () => {
      repository.findOwned.mockResolvedValue(
        squadRow({ members: [{ characterId: 12 }, { characterId: 3 }] }),
      );

      await service.getById('squad-1', 'user-1');

      expect(repository.findOwned).toHaveBeenCalledWith('squad-1', 'user-1');
      expect(charactersService.getManyByIds).toHaveBeenCalledWith([12, 3]);
    });

    it('includes stats for every ability, null for an empty squad', async () => {
      repository.findOwned.mockResolvedValue(squadRow());

      const squad = await service.getById('squad-1', 'user-1');

      expect(squad.stats).toEqual({
        memberCount: 0,
        abilities: filters.abilities.map((name) => ({ name, average: null })),
      });
    });

    it('throws NOT_FOUND for a squad that does not belong to the user', async () => {
      repository.findOwned.mockResolvedValue(null);

      await expect(service.getById('squad-1', 'someone-else')).rejects.toMatchObject(notFound);
    });
  });

  describe('create', () => {
    it('creates the squad with the given characters in order', async () => {
      repository.create.mockResolvedValue('squad-1');
      repository.findOwned.mockResolvedValue(squadRow());

      await service.create('user-1', { name: 'Earthrealm', characterIds: [25, 1] });

      expect(repository.create).toHaveBeenCalledWith('user-1', 'Earthrealm', [25, 1]);
    });

    it('creates an empty squad when no characters are given', async () => {
      repository.create.mockResolvedValue('squad-1');
      repository.findOwned.mockResolvedValue(squadRow());

      await service.create('user-1', { name: 'Earthrealm' });

      expect(repository.create).toHaveBeenCalledWith('user-1', 'Earthrealm', []);
    });

    it('rejects more than 6 characters with SQUAD_FULL before writing anything', async () => {
      await expect(
        service.create('user-1', { name: 'Too big', characterIds: [1, 2, 3, 4, 5, 6, 7] }),
      ).rejects.toMatchObject({ code: ErrorCode.SquadFull, status: 422 });
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('rejects unknown characters with CHARACTER_NOT_FOUND', async () => {
      charactersService.findExistingIds.mockResolvedValue(new Set([1]));

      await expect(
        service.create('user-1', { name: 'Ghosts', characterIds: [1, 9999] }),
      ).rejects.toMatchObject({
        code: ErrorCode.CharacterNotFound,
        details: { characterIds: [9999] },
      });
    });

    it('throws SQUAD_NAME_TAKEN when the user already has a squad with that name', async () => {
      repository.create.mockRejectedValue(uniqueViolation());

      await expect(service.create('user-1', { name: 'Earthrealm' })).rejects.toMatchObject({
        code: ErrorCode.SquadNameTaken,
        status: 409,
      });
    });

    it('rethrows unexpected errors unchanged', async () => {
      const unexpected = new Error('connection lost');
      repository.create.mockRejectedValue(unexpected);

      await expect(service.create('user-1', { name: 'Earthrealm' })).rejects.toBe(unexpected);
    });
  });

  describe('update', () => {
    it('passes the new name and characters to the repository', async () => {
      repository.updateOwned.mockResolvedValue(true);
      repository.findOwned.mockResolvedValue(squadRow());

      await service.update('squad-1', 'user-1', { name: 'Outworld', characterIds: [3] });

      expect(repository.updateOwned).toHaveBeenCalledWith('squad-1', 'user-1', {
        name: 'Outworld',
        characterIds: [3],
      });
    });

    it('does not check characters when only the name changes', async () => {
      repository.updateOwned.mockResolvedValue(true);
      repository.findOwned.mockResolvedValue(squadRow());

      await service.update('squad-1', 'user-1', { name: 'Outworld' });

      expect(charactersService.findExistingIds).not.toHaveBeenCalled();
    });

    it('rejects duplicate characters with CHARACTER_ALREADY_IN_SQUAD', async () => {
      await expect(
        service.update('squad-1', 'user-1', { characterIds: [1, 1] }),
      ).rejects.toMatchObject({ code: ErrorCode.CharacterAlreadyInSquad, status: 409 });
      expect(repository.updateOwned).not.toHaveBeenCalled();
    });

    it('throws NOT_FOUND when the squad does not belong to the user', async () => {
      repository.updateOwned.mockResolvedValue(false);

      await expect(
        service.update('squad-1', 'someone-else', { name: 'Outworld' }),
      ).rejects.toMatchObject(notFound);
    });

    it('throws SQUAD_NAME_TAKEN when renaming to an existing name', async () => {
      repository.updateOwned.mockRejectedValue(uniqueViolation());

      await expect(service.update('squad-1', 'user-1', { name: 'Outworld' })).rejects.toMatchObject(
        { code: ErrorCode.SquadNameTaken },
      );
    });
  });

  describe('remove', () => {
    it('throws NOT_FOUND when the squad does not belong to the user', async () => {
      repository.deleteOwned.mockResolvedValue(false);

      await expect(service.remove('squad-1', 'someone-else')).rejects.toMatchObject(notFound);
    });
  });
});
