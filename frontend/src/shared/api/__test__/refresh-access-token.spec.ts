import { refreshAccessToken } from '@/shared/api/refresh-access-token.ts';
import { API_URL } from '@/shared/config/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { delay, http, HttpResponse } from 'msw';

describe('refreshAccessToken', () => {
  it('returns the new session when the refresh cookie is valid', async () => {
    mswServer.use(http.post(`${API_URL}/auth/refresh`, () => HttpResponse.json(makeAuthSession())));

    await expect(refreshAccessToken()).resolves.toEqual(makeAuthSession());
  });

  it('returns null when the server rejects the refresh', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json(
          { statusCode: 401, error: 'UNAUTHORIZED', message: 'x' },
          { status: 401 },
        ),
      ),
    );

    await expect(refreshAccessToken()).resolves.toBeNull();
  });

  it('returns null when the server cannot be reached', async () => {
    mswServer.use(http.post(`${API_URL}/auth/refresh`, () => HttpResponse.error()));

    await expect(refreshAccessToken()).resolves.toBeNull();
  });

  it('shares one request between callers that refresh at the same time', async () => {
    let calls = 0;
    mswServer.use(
      http.post(`${API_URL}/auth/refresh`, async () => {
        calls += 1;
        await delay(20);

        return HttpResponse.json(makeAuthSession());
      }),
    );

    const results = await Promise.all([refreshAccessToken(), refreshAccessToken()]);

    expect(calls).toBe(1);
    expect(results).toEqual([makeAuthSession(), makeAuthSession()]);
  });
});
