import { REFRESH_TOKEN_COOKIE } from '@app/auth/constants/auth.constants.js';
import { API_PREFIX } from '@infrastructure/common/constants/api.constants.js';
import type { CookieOptions, Request } from 'express';

export function buildRefreshCookieOptions(secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: `/${API_PREFIX}/auth`,
  };
}

export function readRefreshTokenCookie(request: Request): string | undefined {
  const cookies: unknown = request.cookies;

  if (typeof cookies !== 'object' || cookies === null || !(REFRESH_TOKEN_COOKIE in cookies)) {
    return undefined;
  }

  const value: unknown = cookies[REFRESH_TOKEN_COOKIE];

  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
