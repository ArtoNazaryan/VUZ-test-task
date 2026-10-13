import { REFRESH_TOKEN_REUSE_GRACE_MS } from '@app/auth/constants/auth.constants.js';
import { invalidRefreshTokenError } from '@app/auth/helpers/auth-errors.helper.js';
import { RefreshTokenState } from '@app/auth/enums/refresh-token-state.enum.js';
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  getRefreshTokenState,
  hashRefreshToken,
} from '@app/auth/helpers/refresh-token.helper.js';
import type {
  IIssuedRefreshToken,
  IRotatedRefreshToken,
} from '@app/auth/interfaces/auth.interfaces.js';
import { RefreshTokensRepository } from '@app/auth/repositories/refresh-tokens.repository.js';
import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name);

  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly configService: ConfigService<TEnv, true>,
  ) {}

  async issue(userId: string): Promise<IIssuedRefreshToken> {
    const token = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry(
      new Date(),
      this.configService.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }),
    );

    await this.refreshTokensRepository.create(userId, hashRefreshToken(token), expiresAt);

    return { token, expiresAt };
  }

  async rotate(token: string): Promise<IRotatedRefreshToken> {
    const now = new Date();
    const row = await this.refreshTokensRepository.findByHash(hashRefreshToken(token));
    const state = getRefreshTokenState(row, now, REFRESH_TOKEN_REUSE_GRACE_MS);

    if (state === RefreshTokenState.Reused && row) {
      const revokedCount = await this.refreshTokensRepository.revokeAllForUser(row.userId, now);

      this.logger.warn(
        { userId: row.userId, revokedCount },
        '[RefreshTokensService] Refresh token reuse detected, all sessions revoked',
      );
    }

    if (state !== RefreshTokenState.Active || !row) {
      throw invalidRefreshTokenError();
    }

    if (!(await this.refreshTokensRepository.revokeIfActive(row.id, now))) {
      throw invalidRefreshTokenError();
    }

    return { userId: row.userId, refreshToken: await this.issue(row.userId) };
  }

  async revoke(token: string): Promise<void> {
    await this.refreshTokensRepository.revokeByHash(hashRefreshToken(token), new Date());
  }
}
