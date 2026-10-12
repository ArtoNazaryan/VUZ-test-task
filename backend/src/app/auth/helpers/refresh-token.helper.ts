import { REFRESH_TOKEN_BYTES } from '@app/auth/constants/auth.constants.js';
import { RefreshTokenState } from '@app/auth/enums/refresh-token-state.enum.js';
import type { TRefreshTokenRow } from '@app/auth/types/refresh-token.types.js';
import { createHash, randomBytes } from 'node:crypto';

const MILLISECONDS_PER_DAY = 86_400_000;

export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry(now: Date, ttlDays: number): Date {
  return new Date(now.getTime() + ttlDays * MILLISECONDS_PER_DAY);
}

export function getRefreshTokenState(
  row: TRefreshTokenRow | null,
  now: Date,
  reuseGraceMs: number,
): RefreshTokenState {
  if (!row) {
    return RefreshTokenState.Missing;
  }

  if (row.revokedAt) {
    return now.getTime() - row.revokedAt.getTime() < reuseGraceMs
      ? RefreshTokenState.RecentlyRotated
      : RefreshTokenState.Reused;
  }

  return row.expiresAt.getTime() <= now.getTime()
    ? RefreshTokenState.Expired
    : RefreshTokenState.Active;
}
