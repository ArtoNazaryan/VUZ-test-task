import { validateEnv } from '@infrastructure/config/env.validation.js';
import { NodeEnv } from '@infrastructure/common/enums/node-env.enum.js';
import { describe, expect, it } from 'vitest';

const requiredEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
};

describe('validateEnv', () => {
  it('applies defaults when optional variables are missing', () => {
    expect(validateEnv(requiredEnv)).toEqual({
      ...requiredEnv,
      NODE_ENV: NodeEnv.Development,
      PORT: 3000,
      CORS_ORIGINS: 'http://localhost:8080',
      LOG_LEVEL: 'info',
      LOG_PRETTY: false,
      SWAGGER_ENABLED: true,
    });
  });

  it('coerces PORT and boolean flags from strings', () => {
    const env = validateEnv({
      ...requiredEnv,
      PORT: '4000',
      LOG_PRETTY: 'true',
      SWAGGER_ENABLED: 'false',
    });

    expect(env).toMatchObject({ PORT: 4000, LOG_PRETTY: true, SWAGGER_ENABLED: false });
  });

  it('throws a descriptive error when PORT is out of range', () => {
    expect(() => validateEnv({ ...requiredEnv, PORT: '70000' })).toThrow(/PORT/);
  });

  it('throws when NODE_ENV is not a known environment', () => {
    expect(() => validateEnv({ ...requiredEnv, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => validateEnv({ REDIS_URL: requiredEnv.REDIS_URL })).toThrow(/DATABASE_URL/);
  });

  it('throws when REDIS_URL is not a redis URL', () => {
    expect(() => validateEnv({ ...requiredEnv, REDIS_URL: 'http://localhost:6379' })).toThrow(
      /REDIS_URL/,
    );
  });
});
