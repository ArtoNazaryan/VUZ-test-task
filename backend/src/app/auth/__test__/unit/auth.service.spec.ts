import { hashPassword, verifyPassword } from '@app/auth/helpers/password.helper.js';
import { AuthService } from '@app/auth/services/auth.service.js';
import { UsersService } from '@app/users/services/users.service.js';
import type { TUserRow } from '@app/users/types/user.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let storedUser: TUserRow;
  const usersService = {
    create: vi.fn<(email: string, passwordHash: string) => Promise<TUserRow>>(),
    findByEmail: vi.fn<(email: string) => Promise<TUserRow | null>>(),
    findById: vi.fn<(id: string) => Promise<TUserRow | null>>(),
  } satisfies Partial<UsersService>;
  const jwtService = {
    signAsync: vi.fn(() => Promise.resolve('signed.jwt.token')),
  };

  beforeAll(async () => {
    storedUser = {
      id: 'user-1',
      email: 'ryu@example.com',
      passwordHash: await hashPassword('hadouken-2026'),
      createdAt: new Date('2026-10-12T00:00:00.000Z'),
    };
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: (): number => 900 } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('stores a hash of the password, never the password itself', async () => {
      usersService.create.mockResolvedValue(storedUser);

      await service.register({ email: 'ryu@example.com', password: 'hadouken-2026' });

      const [, passwordHash] = usersService.create.mock.calls[0] ?? [];

      expect(passwordHash).not.toBe('hadouken-2026');
      await expect(verifyPassword(passwordHash ?? '', 'hadouken-2026')).resolves.toBe(true);
    });

    it('returns an access token and the public user', async () => {
      usersService.create.mockResolvedValue(storedUser);

      await expect(
        service.register({ email: 'ryu@example.com', password: 'hadouken-2026' }),
      ).resolves.toEqual({
        accessToken: 'signed.jwt.token',
        tokenType: 'Bearer',
        expiresIn: 900,
        user: { id: 'user-1', email: 'ryu@example.com', createdAt: storedUser.createdAt },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'ryu@example.com',
      });
    });
  });

  describe('login', () => {
    it('returns an access token for the correct password', async () => {
      usersService.findByEmail.mockResolvedValue(storedUser);

      await expect(
        service.login({ email: 'ryu@example.com', password: 'hadouken-2026' }),
      ).resolves.toMatchObject({ accessToken: 'signed.jwt.token' });
    });

    it('throws INVALID_CREDENTIALS for a wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(storedUser);

      await expect(
        service.login({ email: 'ryu@example.com', password: 'shoryuken-2026' }),
      ).rejects.toMatchObject({
        code: ErrorCode.InvalidCredentials,
        status: HttpStatus.UNAUTHORIZED,
        message: 'Email or password is incorrect',
      });
    });

    it('throws the same INVALID_CREDENTIALS error for an unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ken@example.com', password: 'hadouken-2026' }),
      ).rejects.toMatchObject({
        code: ErrorCode.InvalidCredentials,
        message: 'Email or password is incorrect',
      });
    });
  });

  describe('getProfile', () => {
    it('returns the public profile of the user', async () => {
      usersService.findById.mockResolvedValue(storedUser);

      await expect(service.getProfile('user-1')).resolves.toEqual({
        id: 'user-1',
        email: 'ryu@example.com',
        createdAt: storedUser.createdAt,
      });
    });

    it('throws UNAUTHORIZED when the user no longer exists', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getProfile('deleted-user')).rejects.toMatchObject({
        code: ErrorCode.Unauthorized,
        status: HttpStatus.UNAUTHORIZED,
      });
    });
  });
});
