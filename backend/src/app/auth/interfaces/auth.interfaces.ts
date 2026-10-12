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
