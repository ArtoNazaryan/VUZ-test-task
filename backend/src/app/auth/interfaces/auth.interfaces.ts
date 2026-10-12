import type { AuthResponseDto } from '@app/auth/dto/auth-response.dto.js';
import type { Request } from 'express';

export interface IAuthUser {
  id: string;
  email: string;
}

export interface IAccessTokenPayload {
  sub: string;
  email: string;
}

export interface IAuthenticatedRequest extends Request {
  user: IAuthUser;
}

export interface IIssuedRefreshToken {
  token: string;
  expiresAt: Date;
}

export interface IRotatedRefreshToken {
  userId: string;
  refreshToken: IIssuedRefreshToken;
}

export interface IAuthSession {
  response: AuthResponseDto;
  refreshToken: IIssuedRefreshToken;
}
