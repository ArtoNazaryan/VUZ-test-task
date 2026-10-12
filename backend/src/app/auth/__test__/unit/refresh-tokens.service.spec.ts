import { hashRefreshToken } from '@app/auth/helpers/refresh-token.helper.js';
import { RefreshTokensRepository } from '@app/auth/repositories/refresh-tokens.repository.js';
import { RefreshTokensService } from '@app/auth/services/refresh-tokens.service.js';
import type { TRefreshTokenRow } from '@app/auth/types/refresh-token.types.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const NOW = new Date('2026-10-12T12:00:00.000Z');

const storedToken = (overrides: Partial<TRefreshTokenRow> = {}): TRefreshTokenRow => ({
  id: 'token-1',
  userId: 'user-1',
  expiresAt: new Date('2026-10-19T12:00:00.000Z'),
  revokedAt: null,
  ...overrides,
});

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;
  const repository = {
    create: vi.fn<(userId: string, tokenHash: string, expiresAt: Date) => Promise<void>>(),
    findByHash: vi.fn<(tokenHash: string) => Promise<TRefreshTokenRow | null>>(),
    revokeIfActive: vi.fn<(id: string, revokedAt: Date) => Promise<boolean>>(),
    revokeByHash: vi.fn<(tokenHash: string, revokedAt: Date) => Promise<void>>(),
    revokeAllForUser: vi.fn<(userId: string, revokedAt: Date) => Promise<number>>(),
  } satisfies Partial<RefreshTokensRepository>;

  beforeEach(async () => {
    vi.useFakeTimers({ now: NOW });
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    repository.create.mockResolvedValue();
    repository.revokeIfActive.mockResolvedValue(true);

    const moduleRef = await Test.createTestingModule({
      providers: [
        RefreshTokensService,
        { provide: RefreshTokensRepository, useValue: repository },
        { provide: ConfigService, useValue: { get: (): number => 7 } },
      ],
    }).compile();

    service = moduleRef.get(RefreshTokensService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const unauthorized = { code: ErrorCode.Unauthorized, status: HttpStatus.UNAUTHORIZED };

  describe('issue', () => {
    it('stores only the hash of the token with a 7 day expiry', async () => {
      const issued = await service.issue('user-1');

      expect(repository.create).toHaveBeenCalledWith(
        'user-1',
        hashRefreshToken(issued.token),
        new Date('2026-10-19T12:00:00.000Z'),
      );
      expect(issued.expiresAt).toEqual(new Date('2026-10-19T12:00:00.000Z'));
    });
  });

  describe('rotate', () => {
    it('revokes the presented token and issues a new one for the same user', async () => {
      repository.findByHash.mockResolvedValue(storedToken());

      const rotated = await service.rotate('old-token');

      expect(repository.findByHash).toHaveBeenCalledWith(hashRefreshToken('old-token'));
      expect(repository.revokeIfActive).toHaveBeenCalledWith('token-1', NOW);
      expect(rotated.userId).toBe('user-1');
      expect(rotated.refreshToken.token).not.toBe('old-token');
    });

    it('rejects an unknown token', async () => {
      repository.findByHash.mockResolvedValue(null);

      await expect(service.rotate('unknown')).rejects.toMatchObject(unauthorized);
      expect(repository.revokeAllForUser).not.toHaveBeenCalled();
    });

    it('rejects an expired token', async () => {
      repository.findByHash.mockResolvedValue(storedToken({ expiresAt: NOW }));

      await expect(service.rotate('expired')).rejects.toMatchObject(unauthorized);
    });

    it('rejects a token reused within the grace period without logging the user out', async () => {
      repository.findByHash.mockResolvedValue(
        storedToken({ revokedAt: new Date(NOW.getTime() - 5_000) }),
      );

      await expect(service.rotate('just-rotated')).rejects.toMatchObject(unauthorized);
      expect(repository.revokeAllForUser).not.toHaveBeenCalled();
    });

    it('revokes every session of the user when an old token is reused', async () => {
      repository.findByHash.mockResolvedValue(
        storedToken({ revokedAt: new Date(NOW.getTime() - 60_000) }),
      );
      repository.revokeAllForUser.mockResolvedValue(2);

      await expect(service.rotate('stolen')).rejects.toMatchObject(unauthorized);
      expect(repository.revokeAllForUser).toHaveBeenCalledWith('user-1', NOW);
    });

    it('rejects the slower of two simultaneous rotations of the same token', async () => {
      repository.findByHash.mockResolvedValue(storedToken());
      repository.revokeIfActive.mockResolvedValue(false);

      await expect(service.rotate('raced')).rejects.toMatchObject(unauthorized);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('revoke', () => {
    it('revokes the token by its hash', async () => {
      await service.revoke('token');

      expect(repository.revokeByHash).toHaveBeenCalledWith(hashRefreshToken('token'), NOW);
    });
  });
});
