import { RefreshTokenState } from '@app/auth/enums/refresh-token-state.enum.js';
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  getRefreshTokenState,
  hashRefreshToken,
} from '@app/auth/helpers/refresh-token.helper.js';
import type { TRefreshTokenRow } from '@app/auth/types/refresh-token.types.js';
import { describe, expect, it } from 'vitest';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const GRACE_MS = 10_000;

const row = (overrides: Partial<TRefreshTokenRow> = {}): TRefreshTokenRow => ({
  id: 'token-1',
  userId: 'user-1',
  expiresAt: new Date('2026-10-19T12:00:00.000Z'),
  revokedAt: null,
  ...overrides,
});

describe('generateRefreshToken', () => {
  it('creates a 32 byte URL safe random token', () => {
    expect(generateRefreshToken()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('creates a different token every time', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken());
  });
});

describe('hashRefreshToken', () => {
  it('returns the same SHA-256 hex digest for the same token', () => {
    expect(hashRefreshToken('token')).toBe(hashRefreshToken('token'));
    expect(hashRefreshToken('token')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('never returns the token itself', () => {
    expect(hashRefreshToken('token')).not.toContain('token');
  });
});

describe('getRefreshTokenExpiry', () => {
  it('adds the configured number of days', () => {
    expect(getRefreshTokenExpiry(NOW, 7)).toEqual(new Date('2026-10-19T12:00:00.000Z'));
  });
});

describe('getRefreshTokenState', () => {
  it('is Missing when no stored token matches', () => {
    expect(getRefreshTokenState(null, NOW, GRACE_MS)).toBe(RefreshTokenState.Missing);
  });

  it('is Active for a token that is not revoked and not expired', () => {
    expect(getRefreshTokenState(row(), NOW, GRACE_MS)).toBe(RefreshTokenState.Active);
  });

  it('is Expired once the expiry time is reached', () => {
    expect(getRefreshTokenState(row({ expiresAt: NOW }), NOW, GRACE_MS)).toBe(
      RefreshTokenState.Expired,
    );
  });

  it('is RecentlyRotated when it was revoked within the grace period', () => {
    const revokedAt = new Date(NOW.getTime() - 5_000);

    expect(getRefreshTokenState(row({ revokedAt }), NOW, GRACE_MS)).toBe(
      RefreshTokenState.RecentlyRotated,
    );
  });

  it('is Reused when it was revoked before the grace period', () => {
    const revokedAt = new Date(NOW.getTime() - 60_000);

    expect(getRefreshTokenState(row({ revokedAt }), NOW, GRACE_MS)).toBe(RefreshTokenState.Reused);
  });
});
