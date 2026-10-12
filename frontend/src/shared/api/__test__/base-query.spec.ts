import { baseApi } from '@/shared/api/base-api.ts';
import { accessTokenRefreshed, sessionExpired } from '@/shared/api/model/session-events.ts';
import { API_URL } from '@/shared/config/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { combineReducers, configureStore, createReducer } from '@reduxjs/toolkit';
import { delay, http, type HttpHandler, HttpResponse } from 'msw';

interface ITestSession {
  accessToken: string | null;
  expired: boolean;
}

const testApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProtected: build.query<{ ok: boolean }, string>({ query: (key) => `/protected?key=${key}` }),
  }),
});

function createTestStore(accessToken: string | null) {
  const session = createReducer<ITestSession>({ accessToken, expired: false }, (builder) => {
    builder
      .addCase(accessTokenRefreshed, (_state, action) => ({
        accessToken: action.payload.accessToken,
        expired: false,
      }))
      .addCase(sessionExpired, () => ({ accessToken: null, expired: true }));
  });

  return configureStore({
    reducer: combineReducers({ session, [baseApi.reducerPath]: baseApi.reducer }),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

const unauthorized = (): Response =>
  HttpResponse.json({ statusCode: 401, error: 'UNAUTHORIZED', message: 'x' }, { status: 401 });

function protectedEndpoint(validToken: string, onCall?: () => void): HttpHandler {
  return http.get(`${API_URL}/protected`, ({ request }) => {
    onCall?.();

    return request.headers.get('Authorization') === `Bearer ${validToken}`
      ? HttpResponse.json({ ok: true })
      : unauthorized();
  });
}

describe('baseQueryWithRefresh', () => {
  it('sends the access token from the store as a bearer header', async () => {
    mswServer.use(protectedEndpoint('token-1'));
    const store = createTestStore('token-1');

    const result = await store.dispatch(testApi.endpoints.getProtected.initiate('a'));

    expect(result.data).toEqual({ ok: true });
  });

  it('refreshes once on 401, stores the new token and retries the request', async () => {
    mswServer.use(
      protectedEndpoint('token-2'),
      http.post(`${API_URL}/auth/refresh`, () => HttpResponse.json(makeAuthSession('token-2'))),
    );
    const store = createTestStore('expired-token');

    const result = await store.dispatch(testApi.endpoints.getProtected.initiate('b'));

    expect(result.data).toEqual({ ok: true });
    expect(store.getState().session.accessToken).toBe('token-2');
  });

  it('marks the session as expired when the refresh fails', async () => {
    mswServer.use(protectedEndpoint('token-2'), http.post(`${API_URL}/auth/refresh`, unauthorized));
    const store = createTestStore('expired-token');

    const result = await store.dispatch(testApi.endpoints.getProtected.initiate('c'));

    expect(result.error).toMatchObject({ status: 401 });
    expect(store.getState().session).toEqual({ accessToken: null, expired: true });
  });

  it('uses a single refresh for requests that fail at the same time', async () => {
    let refreshCalls = 0;
    mswServer.use(
      protectedEndpoint('token-3'),
      http.post(`${API_URL}/auth/refresh`, async () => {
        refreshCalls += 1;
        await delay(20);

        return HttpResponse.json(makeAuthSession('token-3'));
      }),
    );
    const store = createTestStore('expired-token');

    const results = await Promise.all([
      store.dispatch(testApi.endpoints.getProtected.initiate('d')),
      store.dispatch(testApi.endpoints.getProtected.initiate('e')),
    ]);

    expect(refreshCalls).toBe(1);
    expect(results.map((result) => result.data)).toEqual([{ ok: true }, { ok: true }]);
  });
});
