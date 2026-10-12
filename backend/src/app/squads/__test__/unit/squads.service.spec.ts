import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
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

describe('SquadsService', () => {
  let service: SquadsService;
  const repository = {
    findAllByUser: vi.fn<(userId: string) => Promise<TSquadSummaryRow[]>>(),
    findOwned: vi.fn<(id: string, userId: string) => Promise<TSquadDetailRow | null>>(),
    create: vi.fn<(userId: string, name: string) => Promise<string>>(),
    renameOwned: vi.fn<(id: string, userId: string, name: string) => Promise<boolean>>(),
    deleteOwned: vi.fn<(id: string, userId: string) => Promise<boolean>>(),
  } satisfies Partial<SquadsRepository>;
  const charactersService = {
    getManyByIds: vi.fn<(ids: number[]) => Promise<CharacterResponseDto[]>>(),
  } satisfies Partial<CharactersService>;

  beforeEach(async () => {
    charactersService.getManyByIds.mockResolvedValue([]);

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

    it('throws NOT_FOUND for a squad that does not belong to the user', async () => {
      repository.findOwned.mockResolvedValue(null);

      await expect(service.getById('squad-1', 'someone-else')).rejects.toMatchObject(notFound);
    });
  });

  describe('create', () => {
    it('creates the squad and returns it', async () => {
      repository.create.mockResolvedValue('squad-1');
      repository.findOwned.mockResolvedValue(squadRow());

      await expect(service.create('user-1', { name: 'Earthrealm' })).resolves.toMatchObject({
        id: 'squad-1',
        name: 'Earthrealm',
        characters: [],
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
    it('throws NOT_FOUND when the squad does not belong to the user', async () => {
      repository.renameOwned.mockResolvedValue(false);

      await expect(
        service.update('squad-1', 'someone-else', { name: 'Outworld' }),
      ).rejects.toMatchObject(notFound);
    });

    it('throws SQUAD_NAME_TAKEN when renaming to an existing name', async () => {
      repository.renameOwned.mockRejectedValue(uniqueViolation());

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
