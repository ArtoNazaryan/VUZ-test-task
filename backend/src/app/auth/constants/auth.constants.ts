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

export const INVALID_CREDENTIALS_MESSAGE = 'Email or password is incorrect';
export const AUTHENTICATION_REQUIRED_MESSAGE = 'Authentication is required';
