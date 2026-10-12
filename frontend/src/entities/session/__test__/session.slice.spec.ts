import { SessionStatus } from '@/entities/session/model/session-status.enum.ts';
import {
  sessionEnded,
  sessionSlice,
  sessionStarted,
} from '@/entities/session/model/session.slice.ts';
import { accessTokenRefreshed, sessionExpired } from '@/shared/api/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';

const reducer = sessionSlice.reducer;

describe('sessionSlice', () => {
  it('starts in the UNKNOWN state until the session is restored', () => {
    expect(reducer(undefined, { type: 'init' })).toEqual({
      status: SessionStatus.UNKNOWN,
      accessToken: null,
      user: null,
    });
  });

  it('becomes AUTHENTICATED with the token and user when a session starts', () => {
    expect(reducer(undefined, sessionStarted(makeAuthSession()))).toEqual({
      status: SessionStatus.AUTHENTICATED,
      accessToken: 'access-token-1',
      user: makeAuthSession().user,
    });
  });

  it('stores the new token when the access token is refreshed', () => {
    const state = reducer(
      reducer(undefined, sessionStarted(makeAuthSession())),
      accessTokenRefreshed(makeAuthSession('access-token-2')),
    );

    expect(state.accessToken).toBe('access-token-2');
  });

  it('becomes ANONYMOUS and forgets the token when the session expires or ends', () => {
    const authenticated = reducer(undefined, sessionStarted(makeAuthSession()));

    expect(reducer(authenticated, sessionExpired())).toMatchObject({
      status: SessionStatus.ANONYMOUS,
      accessToken: null,
      user: null,
    });
    expect(reducer(authenticated, sessionEnded()).status).toBe(SessionStatus.ANONYMOUS);
  });
});
