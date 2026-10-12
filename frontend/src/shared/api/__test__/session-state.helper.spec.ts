import {
  isAuthSessionPayload,
  readAccessToken,
} from '@/shared/api/helpers/session-state.helper.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';

describe('readAccessToken', () => {
  it('reads the token from the session state', () => {
    expect(readAccessToken({ session: { accessToken: 'abc' } })).toBe('abc');
  });

  it('returns null when there is no token or no session', () => {
    expect(readAccessToken({ session: { accessToken: null } })).toBeNull();
    expect(readAccessToken({})).toBeNull();
  });
});

describe('isAuthSessionPayload', () => {
  it('accepts a login response', () => {
    expect(isAuthSessionPayload(makeAuthSession())).toBe(true);
  });

  it('rejects a response without a user', () => {
    expect(isAuthSessionPayload({ accessToken: 'abc' })).toBe(false);
  });
});
