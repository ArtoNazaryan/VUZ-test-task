import {
  buildRefreshCookieOptions,
  readRefreshTokenCookie,
} from '@app/auth/helpers/refresh-cookie.helper.js';
import type { Request } from 'express';
import { describe, expect, it } from 'vitest';

const requestWith = (cookies: unknown): Request => ({ cookies }) as Request;

describe('buildRefreshCookieOptions', () => {
  it('creates an httpOnly strict cookie scoped to the auth routes', () => {
    expect(buildRefreshCookieOptions(true)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  });

  it('passes the secure flag through', () => {
    expect(buildRefreshCookieOptions(false)).toMatchObject({ secure: false });
  });
});

describe('readRefreshTokenCookie', () => {
  it('returns the refresh token cookie value', () => {
    expect(readRefreshTokenCookie(requestWith({ refresh_token: 'abc' }))).toBe('abc');
  });

  it('returns undefined when the cookie is missing', () => {
    expect(readRefreshTokenCookie(requestWith({}))).toBeUndefined();
  });

  it('returns undefined when cookies were not parsed', () => {
    expect(readRefreshTokenCookie(requestWith(undefined))).toBeUndefined();
  });

  it('returns undefined for an empty cookie value', () => {
    expect(readRefreshTokenCookie(requestWith({ refresh_token: '' }))).toBeUndefined();
  });
});
