import { extractBearerToken, isAccessTokenPayload } from '@app/auth/helpers/token.helper.js';
import { describe, expect, it } from 'vitest';

describe('extractBearerToken', () => {
  it('returns the token from a Bearer header', () => {
    expect(extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
  });

  it('returns null when the header is missing', () => {
    expect(extractBearerToken(undefined)).toBeNull();
  });

  it('returns null for another authorization scheme', () => {
    expect(extractBearerToken('Basic dXNlcjpwYXNz')).toBeNull();
  });

  it('returns null when the token is empty', () => {
    expect(extractBearerToken('Bearer   ')).toBeNull();
  });
});

describe('isAccessTokenPayload', () => {
  it('accepts a payload with sub and email', () => {
    expect(isAccessTokenPayload({ sub: 'user-1', email: 'ryu@example.com', iat: 1 })).toBe(true);
  });

  it('rejects a payload without email', () => {
    expect(isAccessTokenPayload({ sub: 'user-1' })).toBe(false);
  });

  it('rejects values that are not objects', () => {
    expect(isAccessTokenPayload('user-1')).toBe(false);
  });
});
