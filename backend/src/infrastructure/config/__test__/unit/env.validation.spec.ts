import { validateEnv } from '@infrastructure/config/env.validation.js';
import { NodeEnv } from '@infrastructure/common/enums/node-env.enum.js';
import { describe, expect, it } from 'vitest';

describe('validateEnv', () => {
  it('applies defaults when optional variables are missing', () => {
    expect(validateEnv({})).toEqual({
      NODE_ENV: NodeEnv.Development,
      PORT: 3000,
      CORS_ORIGINS: 'http://localhost:8080',
      LOG_LEVEL: 'info',
      LOG_PRETTY: false,
      SWAGGER_ENABLED: true,
    });
  });

  it('coerces PORT and boolean flags from strings', () => {
    const env = validateEnv({ PORT: '4000', LOG_PRETTY: 'true', SWAGGER_ENABLED: 'false' });

    expect(env).toMatchObject({ PORT: 4000, LOG_PRETTY: true, SWAGGER_ENABLED: false });
  });

  it('throws a descriptive error when PORT is out of range', () => {
    expect(() => validateEnv({ PORT: '70000' })).toThrow(/PORT/);
  });

  it('throws when NODE_ENV is not a known environment', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
