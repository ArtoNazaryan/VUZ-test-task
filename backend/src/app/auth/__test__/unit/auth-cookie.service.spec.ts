import { AuthCookieService } from '@app/auth/services/auth-cookie.service.js';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AuthCookieService', () => {
  let service: AuthCookieService;
  const response = { cookie: vi.fn(), clearCookie: vi.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthCookieService,
        { provide: ConfigService, useValue: { get: (): boolean => true } },
      ],
    }).compile();

    service = moduleRef.get(AuthCookieService);
  });

  it('sets the refresh token cookie with its expiry', () => {
    const expiresAt = new Date('2026-10-19T00:00:00.000Z');

    service.setRefreshToken(response as unknown as Response, { token: 'abc', expiresAt });

    expect(response.cookie).toHaveBeenCalledWith('refresh_token', 'abc', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/auth',
      expires: expiresAt,
    });
  });

  it('clears the cookie with the same path and flags', () => {
    service.clearRefreshToken(response as unknown as Response);

    expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  });
});
