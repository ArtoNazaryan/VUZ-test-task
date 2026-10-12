import { UsersRepository } from '@app/users/repositories/users.repository.js';
import { UsersService } from '@app/users/services/users.service.js';
import type { TUserRow } from '@app/users/types/user.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { Prisma } from '@infrastructure/prisma/generated/client.js';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const userRow: TUserRow = {
  id: 'user-1',
  email: 'ryu@example.com',
  passwordHash: 'hash',
  createdAt: new Date('2026-10-12T00:00:00.000Z'),
};

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    create: vi.fn<(email: string, passwordHash: string) => Promise<TUserRow>>(),
    findByEmail: vi.fn<(email: string) => Promise<TUserRow | null>>(),
    findById: vi.fn<(id: string) => Promise<TUserRow | null>>(),
  } satisfies Partial<UsersRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: repository }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  describe('create', () => {
    it('stores the user with a normalized email', async () => {
      repository.create.mockResolvedValue(userRow);

      await service.create(' Ryu@Example.com ', 'hash');

      expect(repository.create).toHaveBeenCalledWith('ryu@example.com', 'hash');
    });

    it('throws EMAIL_TAKEN when the email already exists', async () => {
      repository.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.10.0',
        }),
      );

      await expect(service.create('ryu@example.com', 'hash')).rejects.toMatchObject({
        code: ErrorCode.EmailTaken,
        status: HttpStatus.CONFLICT,
      });
    });

    it('rethrows unexpected errors unchanged', async () => {
      const unexpected = new Error('connection lost');
      repository.create.mockRejectedValue(unexpected);

      await expect(service.create('ryu@example.com', 'hash')).rejects.toBe(unexpected);
    });
  });

  describe('findByEmail', () => {
    it('looks the user up by the normalized email', async () => {
      repository.findByEmail.mockResolvedValue(userRow);

      await expect(service.findByEmail('RYU@example.com')).resolves.toBe(userRow);
      expect(repository.findByEmail).toHaveBeenCalledWith('ryu@example.com');
    });
  });
});
