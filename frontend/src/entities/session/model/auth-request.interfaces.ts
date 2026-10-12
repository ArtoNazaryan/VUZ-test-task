import type { IAuthSessionPayload } from '@/shared/api/index.ts';

export interface ICredentials {
  email: string;
  password: string;
}

export interface IAuthResponse extends IAuthSessionPayload {
  tokenType: 'Bearer';
  expiresIn: number;
}
