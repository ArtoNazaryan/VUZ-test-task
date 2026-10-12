import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import type { IApiErrorExample } from '@infrastructure/common/interfaces/error-response.interfaces.js';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;

export const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$8od/txty5/zZUN3xL0rdBQ$AEnfExVSq3tBLKHMMpcxYAhQ3PCmrYJwhRvQ6t0KvKc';

export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const REFRESH_TOKEN_BYTES = 32;
export const REFRESH_TOKEN_REUSE_GRACE_MS = 10_000;
export const INVALID_REFRESH_TOKEN_MESSAGE = 'The session has expired, please log in again';

export const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect';
export const AUTHENTICATION_REQUIRED_MESSAGE = 'Authentication is required';

export const SESSION_EXPIRED_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.Unauthorized,
  message: INVALID_REFRESH_TOKEN_MESSAGE,
};
