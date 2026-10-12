import { REFRESH_TOKEN_COOKIE } from '@app/auth/constants/auth.constants.js';
import { buildRefreshCookieOptions } from '@app/auth/helpers/refresh-cookie.helper.js';
import type { IIssuedRefreshToken } from '@app/auth/interfaces/auth.interfaces.js';
import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService<TEnv, true>) {}

  setRefreshToken(response: Response, refreshToken: IIssuedRefreshToken): void {
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken.token, {
      ...buildRefreshCookieOptions(this.configService.get('COOKIE_SECURE', { infer: true })),
      expires: refreshToken.expiresAt,
    });
  }

  clearRefreshToken(response: Response): void {
    response.clearCookie(
      REFRESH_TOKEN_COOKIE,
      buildRefreshCookieOptions(this.configService.get('COOKIE_SECURE', { infer: true })),
    );
  }
}
